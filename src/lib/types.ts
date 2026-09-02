export type Priority = 'baja' | 'media' | 'alta' | 'critica';

export type ProjectStatus = 'activo' | 'en_pausa' | 'planificacion' | 'completado' | 'archivado';

export type TaskStatus = 'pendiente' | 'en_progreso' | 'en_revision' | 'completada';

export type MemberStatus = 'disponible' | 'ocupado' | 'ausente';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  department: string;
  status: MemberStatus;
  activeProjectsCount: number;
  pendingTasksCount: number;
}

export interface Milestone {
  id: string;
  title: string;
  date: string;
  completed: boolean;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  clientOrArea: string;
  manager: User;
  team: User[];
  progress: number;
  priority: Priority;
  startDate: string;
  dueDate: string;
  status: ProjectStatus;
  milestones: Milestone[];
  createdAt: string;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface TaskComment {
  id: string;
  taskId: string;
  author: User;
  content: string;
  createdAt: string;
}

export interface Task {
  id: string;
  projectId: string;
  projectName: string;
  title: string;
  description: string;
  assignee: User;
  priority: Priority;
  status: TaskStatus;
  dueDate: string;
  completed: boolean;
  subtasks: Subtask[];
  comments: TaskComment[];
  createdAt: string;
}

export interface ActivityEvent {
  id: string;
  user: User;
  action: string;
  entity: string;
  entityType: 'project' | 'task' | 'team' | 'system';
  timestamp: string;
  timeAgo: string;
  projectId?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  timeAgo: string;
  read: boolean;
  type: 'assignment' | 'deadline' | 'completion' | 'mention' | 'alert';
  link?: string;
}

export interface ProjectFiltersState {
  search: string;
  status: string;
  priority: string;
  managerId: string;
}

export interface TaskFiltersState {
  search: string;
  status: string;
  priority: string;
  projectId: string;
  assigneeId: string;
}
