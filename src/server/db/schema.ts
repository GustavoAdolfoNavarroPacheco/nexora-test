import { boolean, date, index, integer, pgEnum, pgTable, primaryKey, text, timestamp } from 'drizzle-orm/pg-core';

export const priorityEnum = pgEnum('priority', ['baja', 'media', 'alta', 'critica']);
export const projectStatusEnum = pgEnum('project_status', ['activo', 'en_pausa', 'planificacion', 'completado', 'archivado']);
export const taskStatusEnum = pgEnum('task_status', ['pendiente', 'en_progreso', 'en_revision', 'completada']);
export const memberStatusEnum = pgEnum('member_status', ['disponible', 'ocupado', 'ausente']);
export const entityTypeEnum = pgEnum('entity_type', ['project', 'task', 'team', 'system']);
export const notificationTypeEnum = pgEnum('notification_type', ['assignment', 'deadline', 'completion', 'mention', 'alert']);

const createdAt = () => timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow();

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  avatar: text('avatar').notNull().default(''),
  role: text('role').notNull(),
  department: text('department').notNull(),
  status: memberStatusEnum('status').notNull().default('disponible'),
  position: integer('position').notNull().default(0),
});

export const projects = pgTable(
  'projects',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    description: text('description').notNull().default(''),
    clientOrArea: text('client_or_area').notNull(),
    managerId: text('manager_id')
      .notNull()
      .references(() => users.id),
    progress: integer('progress').notNull().default(0),
    priority: priorityEnum('priority').notNull(),
    status: projectStatusEnum('status').notNull(),
    startDate: date('start_date', { mode: 'string' }).notNull(),
    dueDate: date('due_date', { mode: 'string' }).notNull(),
    createdAt: createdAt(),
  },
  (t) => [index('projects_due_idx').on(t.dueDate)]
);

export const projectMembers = pgTable(
  'project_members',
  {
    projectId: text('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    position: integer('position').notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.projectId, t.userId] })]
);

export const milestones = pgTable(
  'milestones',
  {
    id: text('id').primaryKey(),
    projectId: text('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    date: date('date', { mode: 'string' }).notNull(),
    completed: boolean('completed').notNull().default(false),
  },
  (t) => [index('milestones_project_idx').on(t.projectId)]
);

export const tasks = pgTable(
  'tasks',
  {
    id: text('id').primaryKey(),
    projectId: text('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    description: text('description').notNull().default(''),
    assigneeId: text('assignee_id')
      .notNull()
      .references(() => users.id),
    priority: priorityEnum('priority').notNull(),
    status: taskStatusEnum('status').notNull(),
    dueDate: date('due_date', { mode: 'string' }).notNull(),
    completed: boolean('completed').notNull().default(false),
    createdAt: createdAt(),
  },
  (t) => [index('tasks_project_idx').on(t.projectId), index('tasks_assignee_idx').on(t.assigneeId)]
);

export const subtasks = pgTable(
  'subtasks',
  {
    id: text('id').primaryKey(),
    taskId: text('task_id')
      .notNull()
      .references(() => tasks.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    completed: boolean('completed').notNull().default(false),
    position: integer('position').notNull().default(0),
  },
  (t) => [index('subtasks_task_idx').on(t.taskId)]
);

export const comments = pgTable(
  'comments',
  {
    id: text('id').primaryKey(),
    taskId: text('task_id')
      .notNull()
      .references(() => tasks.id, { onDelete: 'cascade' }),
    authorId: text('author_id')
      .notNull()
      .references(() => users.id),
    content: text('content').notNull(),
    createdAt: createdAt(),
  },
  (t) => [index('comments_task_idx').on(t.taskId)]
);

export const activities = pgTable(
  'activities',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id),
    action: text('action').notNull(),
    entity: text('entity').notNull(),
    entityType: entityTypeEnum('entity_type').notNull(),
    // Kept when a project is deleted so the audit trail survives.
    projectId: text('project_id').references(() => projects.id, { onDelete: 'set null' }),
    createdAt: createdAt(),
  },
  (t) => [index('activities_created_idx').on(t.createdAt)]
);

export const notifications = pgTable(
  'notifications',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    description: text('description').notNull(),
    type: notificationTypeEnum('type').notNull(),
    read: boolean('read').notNull().default(false),
    link: text('link'),
    createdAt: createdAt(),
  },
  (t) => [index('notifications_user_idx').on(t.userId)]
);
