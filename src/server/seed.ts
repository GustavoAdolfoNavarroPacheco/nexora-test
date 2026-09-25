import { sql } from 'drizzle-orm';
import type { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import * as schema from './db/schema';
import {
  mockUsers,
  initialProjects,
  initialTasks,
  initialActivities,
  initialNotifications,
  currentUser,
} from './seed-data';
import { addDays, dayIn, daysBetween } from '@/lib/time';

type Db = NeonHttpDatabase<typeof schema>;

// The sample workspace was written as if "now" were this moment; everything is shifted
// so the demo always looks current (deadlines this week, activity from a few minutes ago).
const SAMPLE_NOW = Date.parse('2026-09-02T14:15:00Z');
const SAMPLE_DAY = '2026-09-02';

// Sample notifications have only relative labels; these are their ages.
const NOTIFICATION_AGE_MIN = [15, 120, 300, 26 * 60];

export async function seedWorkspace(db: Db, timeZone: string, now = new Date()) {
  const shiftMs = now.getTime() - SAMPLE_NOW;
  const shiftDays = daysBetween(SAMPLE_DAY, dayIn(now, timeZone));
  const day = (d: string) => addDays(d, shiftDays);
  const at = (iso: string) => new Date(Date.parse(iso) + shiftMs);

  const S = schema;
  await db.batch([
    // Children first; cascades would cover most of it but explicit order keeps it obvious.
    db.delete(S.notifications),
    db.delete(S.activities),
    db.delete(S.comments),
    db.delete(S.subtasks),
    db.delete(S.tasks),
    db.delete(S.milestones),
    db.delete(S.projectMembers),
    db.delete(S.projects),
    db.delete(S.users),

    db.insert(S.users).values(
      mockUsers.map((u, i) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        avatar: u.avatar,
        role: u.role,
        department: u.department,
        status: u.status,
        position: i,
      }))
    ),
    db.insert(S.projects).values(
      initialProjects.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        clientOrArea: p.clientOrArea,
        managerId: p.manager.id,
        progress: p.progress,
        priority: p.priority,
        status: p.status,
        startDate: day(p.startDate),
        dueDate: day(p.dueDate),
        createdAt: at(p.createdAt),
      }))
    ),
    db.insert(S.projectMembers).values(
      initialProjects.flatMap((p) => p.team.map((u, i) => ({ projectId: p.id, userId: u.id, position: i })))
    ),
    db.insert(S.milestones).values(
      initialProjects.flatMap((p) =>
        p.milestones.map((m) => ({ id: m.id, projectId: p.id, title: m.title, date: day(m.date), completed: m.completed }))
      )
    ),
    db.insert(S.tasks).values(
      initialTasks.map((t) => ({
        id: t.id,
        projectId: t.projectId,
        title: t.title,
        description: t.description,
        assigneeId: t.assignee.id,
        priority: t.priority,
        status: t.status,
        dueDate: day(t.dueDate),
        completed: t.completed,
        createdAt: at(t.createdAt),
      }))
    ),
    db.insert(S.subtasks).values(
      initialTasks.flatMap((t) =>
        t.subtasks.map((s, i) => ({ id: s.id, taskId: t.id, title: s.title, completed: s.completed, position: i }))
      )
    ),
    db.insert(S.comments).values(
      initialTasks.flatMap((t) =>
        t.comments.map((c) => ({ id: c.id, taskId: t.id, authorId: c.author.id, content: c.content, createdAt: at(c.createdAt) }))
      )
    ),
    db.insert(S.activities).values(
      initialActivities.map((a) => ({
        id: a.id,
        userId: a.user.id,
        action: a.action,
        entity: a.entity,
        entityType: a.entityType,
        projectId: a.projectId ?? null,
        createdAt: at(a.timestamp),
      }))
    ),
    db.insert(S.notifications).values(
      initialNotifications.map((n, i) => ({
        id: n.id,
        userId: currentUser.id,
        title: n.title,
        description: n.description,
        type: n.type,
        read: n.read,
        link: n.link ?? null,
        createdAt: new Date(now.getTime() - (NOTIFICATION_AGE_MIN[i] ?? 60 * 24 * (i + 1)) * 60_000),
      }))
    ),
    // Progress is the share of completed tasks, the same rule the API applies on every change.
    db.update(S.projects).set({
      progress: sql`coalesce(
        (select round(100.0 * count(*) filter (where ${S.tasks.completed}) / nullif(count(*), 0))::int
           from ${S.tasks} where ${S.tasks.projectId} = ${S.projects.id}),
        ${S.projects.progress})`,
    }),
  ]);
}
