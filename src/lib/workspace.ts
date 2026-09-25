import type { ActivityEvent, NotificationItem, Project, Task, User } from './types';

/** Everything the client needs to render the app, as returned by GET /api/workspace. */
export interface WorkspaceData {
  users: User[];
  projects: Project[];
  tasks: Task[];
  activities: ActivityEvent[];
  notifications: NotificationItem[];
  currentUserId: string;
  /** Calendar day (YYYY-MM-DD) in the workspace time zone; shared by server and client renders. */
  today: string;
}

/** Side effects a mutation produced on the server, merged back into the client store. */
export interface MutationResult {
  activity?: ActivityEvent;
  progress?: { projectId: string; progress: number }[];
}
