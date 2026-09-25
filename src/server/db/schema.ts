import { bigint, boolean, date, index, integer, pgEnum, pgTable, primaryKey, text, timestamp } from 'drizzle-orm/pg-core';

export const priorityEnum = pgEnum('priority', ['baja', 'media', 'alta', 'critica']);
export const projectStatusEnum = pgEnum('project_status', ['activo', 'en_pausa', 'planificacion', 'completado', 'archivado']);
export const taskStatusEnum = pgEnum('task_status', ['pendiente', 'en_progreso', 'en_revision', 'completada']);
export const memberStatusEnum = pgEnum('member_status', ['disponible', 'ocupado', 'ausente']);
export const entityTypeEnum = pgEnum('entity_type', ['project', 'task', 'team', 'system']);
export const notificationTypeEnum = pgEnum('notification_type', ['assignment', 'deadline', 'completion', 'mention', 'alert']);

const createdAt = () => timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow();

const updatedAt = () =>
  timestamp('updated_at', { withTimezone: true, mode: 'date' })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date());

/**
 * Workspace members. Also Better Auth's `user` model: signing in with Google or Apple creates
 * a row here, so every account is a teammate who can own projects and be assigned tasks.
 */
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  // Better Auth's `image`; empty for Apple, which never shares a photo.
  avatar: text('avatar'),
  role: text('role').notNull().default('Miembro del equipo'),
  department: text('department').notNull().default('General'),
  status: memberStatusEnum('status').notNull().default('disponible'),
  // New accounts sort after the sample team.
  position: integer('position').notNull().default(100),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

// --------------------------------------------------------------------------- authentication (Better Auth)

export const sessions = pgTable(
  'sessions',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    token: text('token').notNull().unique(),
    expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index('sessions_user_idx').on(t.userId)]
);

/** One row per identity provider linked to a user (Google, Apple). Tokens are encrypted at rest. */
export const accounts = pgTable(
  'accounts',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at', { withTimezone: true, mode: 'date' }),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at', { withTimezone: true, mode: 'date' }),
    scope: text('scope'),
    password: text('password'),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index('accounts_user_idx').on(t.userId), index('accounts_provider_idx').on(t.providerId, t.accountId)]
);

/** Short-lived values: OAuth state and PKCE verifiers while a sign-in is in flight. */
export const verifications = pgTable(
  'verifications',
  {
    id: text('id').primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index('verifications_identifier_idx').on(t.identifier)]
);

/** Sign-in attempts per IP, shared by every server instance. */
export const rateLimits = pgTable('rate_limits', {
  id: text('id').primaryKey(),
  key: text('key').notNull().unique(),
  count: integer('count').notNull(),
  lastRequest: bigint('last_request', { mode: 'number' }).notNull(),
});

// --------------------------------------------------------------------------- workspace

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
