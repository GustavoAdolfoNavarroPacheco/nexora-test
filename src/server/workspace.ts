import 'server-only';
import { asc, desc } from 'drizzle-orm';
import { db, schema as S } from './db';
import { APP_TIMEZONE, CURRENT_USER_ID } from './config';
import { dayIn, formatRelative } from '@/lib/time';
import type { ActivityEvent, NotificationItem, Project, Task, User } from '@/lib/types';
import type { WorkspaceData } from '@/lib/workspace';

type UserRow = typeof S.users.$inferSelect;
type ActivityRow = typeof S.activities.$inferSelect;

export function toUser(row: UserRow): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    avatar: row.avatar,
    role: row.role,
    department: row.department,
    status: row.status,
  };
}

export function toActivity(row: ActivityRow, user: User, now = new Date()): ActivityEvent {
  return {
    id: row.id,
    user,
    action: row.action,
    entity: row.entity,
    entityType: row.entityType,
    projectId: row.projectId ?? undefined,
    timestamp: row.createdAt.toISOString(),
    timeAgo: formatRelative(row.createdAt, now, APP_TIMEZONE),
  };
}

/** Loads the whole workspace in a single round trip to Neon. */
export async function getWorkspace(): Promise<WorkspaceData> {
  const [userRows, projectRows, memberRows, milestoneRows, taskRows, subtaskRows, commentRows, activityRows, notificationRows] =
    await db.batch([
      db.select().from(S.users).orderBy(asc(S.users.position)),
      db.select().from(S.projects).orderBy(desc(S.projects.createdAt)),
      db.select().from(S.projectMembers).orderBy(asc(S.projectMembers.position)),
      db.select().from(S.milestones).orderBy(asc(S.milestones.date)),
      db.select().from(S.tasks).orderBy(desc(S.tasks.createdAt)),
      db.select().from(S.subtasks).orderBy(asc(S.subtasks.position)),
      db.select().from(S.comments).orderBy(asc(S.comments.createdAt)),
      db.select().from(S.activities).orderBy(desc(S.activities.createdAt)).limit(100),
      db.select().from(S.notifications).orderBy(desc(S.notifications.createdAt)).limit(50),
    ]);

  const now = new Date();
  const users = userRows.map(toUser);
  const userById = new Map(users.map((u) => [u.id, u]));
  const user = (id: string) => userById.get(id) ?? users[0];

  const projects: Project[] = projectRows.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    clientOrArea: p.clientOrArea,
    manager: user(p.managerId),
    team: memberRows.filter((m) => m.projectId === p.id).map((m) => user(m.userId)),
    progress: p.progress,
    priority: p.priority,
    startDate: p.startDate,
    dueDate: p.dueDate,
    status: p.status,
    milestones: milestoneRows
      .filter((m) => m.projectId === p.id)
      .map((m) => ({ id: m.id, title: m.title, date: m.date, completed: m.completed })),
    createdAt: p.createdAt.toISOString(),
  }));

  const projectName = new Map(projects.map((p) => [p.id, p.name]));

  const tasks: Task[] = taskRows.map((t) => ({
    id: t.id,
    projectId: t.projectId,
    projectName: projectName.get(t.projectId) ?? '',
    title: t.title,
    description: t.description,
    assignee: user(t.assigneeId),
    priority: t.priority,
    status: t.status,
    dueDate: t.dueDate,
    completed: t.completed,
    subtasks: subtaskRows.filter((s) => s.taskId === t.id).map((s) => ({ id: s.id, title: s.title, completed: s.completed })),
    comments: commentRows
      .filter((c) => c.taskId === t.id)
      .map((c) => ({ id: c.id, taskId: c.taskId, author: user(c.authorId), content: c.content, createdAt: c.createdAt.toISOString() })),
    createdAt: t.createdAt.toISOString(),
  }));

  const notifications: NotificationItem[] = notificationRows
    .filter((n) => n.userId === CURRENT_USER_ID)
    .map((n) => ({
      id: n.id,
      title: n.title,
      description: n.description,
      type: n.type,
      read: n.read,
      link: n.link ?? undefined,
      timeAgo: formatRelative(n.createdAt, now, APP_TIMEZONE),
    }));

  return {
    users,
    projects,
    tasks,
    activities: activityRows.map((a) => toActivity(a, user(a.userId), now)),
    notifications,
    currentUserId: CURRENT_USER_ID,
    today: dayIn(now, APP_TIMEZONE),
  };
}
