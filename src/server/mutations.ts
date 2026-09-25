import 'server-only';
import { and, eq, sql } from 'drizzle-orm';
import type { BatchItem } from 'drizzle-orm/batch';
import type { z } from 'zod';
import { db, schema as S } from './db';
import { notFound } from './http';
import { toActivity, toUser } from './workspace';
import type { MutationResult } from '@/lib/workspace';
import type * as V from './validation';

type Query = BatchItem<'pg'>;

/** Runs every statement in one HTTP round trip, inside a single transaction. */
async function atomically(queries: Query[]): Promise<unknown[]> {
  if (queries.length === 0) return [];
  return db.batch(queries as [Query, ...Query[]]);
}

function newId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}

function activityInsert(userId: string, entry: { action: string; entity: string; entityType: 'project' | 'task'; projectId: string | null }) {
  return db
    .insert(S.activities)
    .values({ id: newId('act'), userId, ...entry })
    .returning();
}

const userSelect = (userId: string) => db.select().from(S.users).where(eq(S.users.id, userId));

/** Project progress = share of its tasks that are completed (unchanged when it has no tasks). */
function progressUpdate(projectId: string) {
  return db
    .update(S.projects)
    .set({
      progress: sql`coalesce(
        (select round(100.0 * count(*) filter (where ${S.tasks.completed}) / nullif(count(*), 0))::int
           from ${S.tasks} where ${S.tasks.projectId} = ${projectId}),
        ${S.projects.progress})`,
    })
    .where(eq(S.projects.id, projectId))
    .returning({ projectId: S.projects.id, progress: S.projects.progress });
}

type ActivityRow = typeof S.activities.$inferSelect;
type UserRow = typeof S.users.$inferSelect;

function activityResult(rows: unknown, userRows: unknown): MutationResult['activity'] {
  const row = (rows as ActivityRow[])[0];
  const user = (userRows as UserRow[])[0];
  return row && user ? toActivity(row, toUser(user)) : undefined;
}

// --------------------------------------------------------------------------- projects

export async function createProject(userId: string, input: z.output<typeof V.createProjectSchema>): Promise<MutationResult> {
  const members = [input.managerId, ...input.teamIds.filter((u) => u !== input.managerId)];
  const results = await atomically([
    db.insert(S.projects).values({
      id: input.id,
      name: input.name,
      description: input.description,
      clientOrArea: input.clientOrArea,
      managerId: input.managerId,
      priority: input.priority,
      status: input.status,
      startDate: input.startDate,
      dueDate: input.dueDate,
    }),
    db.insert(S.projectMembers).values(members.map((userId, position) => ({ projectId: input.id, userId, position }))),
    ...(input.milestones.length
      ? [db.insert(S.milestones).values(input.milestones.map((m) => ({ ...m, projectId: input.id })))]
      : []),
    activityInsert(userId, { action: 'creó el proyecto', entity: input.name, entityType: 'project', projectId: input.id }),
    userSelect(userId),
  ]);
  return { activity: activityResult(results.at(-2), results.at(-1)) };
}

export async function updateProject(id: string, patch: z.output<typeof V.updateProjectSchema>): Promise<MutationResult> {
  if (Object.keys(patch).length === 0) return {};
  const rows = await db.update(S.projects).set(patch).where(eq(S.projects.id, id)).returning({ id: S.projects.id });
  if (rows.length === 0) throw notFound('El proyecto');
  return {};
}

export async function deleteProject(id: string): Promise<MutationResult> {
  const rows = await db.delete(S.projects).where(eq(S.projects.id, id)).returning({ id: S.projects.id });
  if (rows.length === 0) throw notFound('El proyecto');
  return {};
}

export async function createMilestone(projectId: string, input: z.output<typeof V.createMilestoneSchema>): Promise<MutationResult> {
  await db.insert(S.milestones).values({ ...input, projectId, completed: false });
  return {};
}

export async function updateMilestone(userId: string, id: string, input: z.output<typeof V.updateMilestoneSchema>): Promise<MutationResult> {
  const [row] = await db.update(S.milestones).set(input).where(eq(S.milestones.id, id)).returning();
  if (!row) throw notFound('El hito');
  if (!input.completed) return {};
  const [activity, user] = await atomically([
    activityInsert(userId, { action: 'cumplió el hito', entity: row.title, entityType: 'project', projectId: row.projectId }),
    userSelect(userId),
  ]);
  return { activity: activityResult(activity, user) };
}

// --------------------------------------------------------------------------- tasks

export async function createTask(userId: string, input: z.output<typeof V.createTaskSchema>): Promise<MutationResult> {
  const results = await atomically([
    db.insert(S.tasks).values({ ...input, completed: input.status === 'completada' }),
    progressUpdate(input.projectId),
    activityInsert(userId, { action: 'creó la tarea', entity: input.title, entityType: 'task', projectId: input.projectId }),
    userSelect(userId),
  ]);
  return {
    progress: results[1] as MutationResult['progress'],
    activity: activityResult(results[2], results[3]),
  };
}

export async function updateTask(userId: string, id: string, patch: z.output<typeof V.updateTaskSchema>): Promise<MutationResult> {
  const [before] = await db.select().from(S.tasks).where(eq(S.tasks.id, id));
  if (!before) throw notFound('La tarea');
  if (Object.keys(patch).length === 0) return {};

  const completed = patch.status ? patch.status === 'completada' : before.completed;
  const flipped = completed !== before.completed;

  const queries: Query[] = [db.update(S.tasks).set({ ...patch, completed }).where(eq(S.tasks.id, id))];
  if (flipped) {
    queries.push(
      progressUpdate(before.projectId),
      activityInsert(userId, {
        action: completed ? 'completó la tarea' : 'reabrió la tarea',
        entity: patch.title ?? before.title,
        entityType: 'task',
        projectId: before.projectId,
      }),
      userSelect(userId)
    );
  }
  const results = await atomically(queries);
  return flipped
    ? { progress: results[1] as MutationResult['progress'], activity: activityResult(results[2], results[3]) }
    : {};
}

export async function createSubtask(taskId: string, input: z.output<typeof V.createSubtaskSchema>): Promise<MutationResult> {
  const [{ next }] = await db
    .select({ next: sql<number>`coalesce(max(${S.subtasks.position}) + 1, 0)::int` })
    .from(S.subtasks)
    .where(eq(S.subtasks.taskId, taskId));
  await db.insert(S.subtasks).values({ ...input, taskId, position: next });
  return {};
}

export async function updateSubtask(id: string, input: z.output<typeof V.updateSubtaskSchema>): Promise<MutationResult> {
  const rows = await db.update(S.subtasks).set(input).where(eq(S.subtasks.id, id)).returning({ id: S.subtasks.id });
  if (rows.length === 0) throw notFound('El paso');
  return {};
}

export async function createComment(userId: string, taskId: string, input: z.output<typeof V.createCommentSchema>): Promise<MutationResult> {
  await db.insert(S.comments).values({ ...input, taskId, authorId: userId });
  return {};
}

// --------------------------------------------------------------------------- notifications

export async function updateNotification(userId: string, id: string, input: z.output<typeof V.updateNotificationSchema>): Promise<MutationResult> {
  const rows = await db
    .update(S.notifications)
    .set(input)
    .where(and(eq(S.notifications.id, id), eq(S.notifications.userId, userId)))
    .returning({ id: S.notifications.id });
  if (rows.length === 0) throw notFound('La notificación');
  return {};
}

export async function markAllNotificationsRead(userId: string): Promise<MutationResult> {
  await db.update(S.notifications).set({ read: true }).where(eq(S.notifications.userId, userId));
  return {};
}
