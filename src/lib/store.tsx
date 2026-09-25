'use client';

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
  Project,
  Task,
  ActivityEvent,
  NotificationItem,
  User,
  Priority,
  ProjectStatus,
  TaskStatus,
  Milestone,
} from './types';
import type { MutationResult, WorkspaceData } from './workspace';
import { getTaskStatusMeta, setToday } from './utils';

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type?: 'success' | 'error' | 'info' | 'warning';
}

export type ThemeMode = 'light' | 'dark' | 'system';

export interface CreateTaskDefaults {
  projectId?: string;
  status?: TaskStatus;
}

type ProjectInput = {
  name: string;
  description: string;
  clientOrArea: string;
  managerId: string;
  teamIds: string[];
  priority: Priority;
  startDate: string;
  dueDate: string;
  status: ProjectStatus;
};

type TaskInput = {
  title: string;
  description: string;
  projectId: string;
  assigneeId: string;
  priority: Priority;
  dueDate: string;
  status: TaskStatus;
};

type EditableProject = Partial<Pick<Project, 'name' | 'description' | 'clientOrArea' | 'priority' | 'status' | 'startDate' | 'dueDate'>>;
type EditableTask = Partial<Pick<Task, 'title' | 'description' | 'priority' | 'status' | 'dueDate'>>;

interface StoreContextType {
  projects: Project[];
  tasks: Task[];
  activities: ActivityEvent[];
  notifications: NotificationItem[];
  users: User[];
  currentUser: User;
  theme: ThemeMode;
  toasts: ToastMessage[];
  isCommandPaletteOpen: boolean;
  isCreateProjectOpen: boolean;
  isCreateTaskOpen: boolean;
  createTaskDefaults: CreateTaskDefaults;
  selectedTaskId: string | null;
  addProject: (data: ProjectInput) => Project;
  updateProject: (id: string, partial: EditableProject) => void;
  deleteProject: (id: string) => void;
  archiveProject: (id: string) => void;
  toggleMilestone: (projectId: string, milestoneId: string) => void;
  addMilestone: (projectId: string, data: { title: string; date: string }) => void;
  addTask: (data: TaskInput) => Task | null;
  updateTask: (id: string, partial: EditableTask) => void;
  toggleTaskComplete: (id: string) => void;
  updateTaskStatus: (id: string, status: TaskStatus) => void;
  addSubtask: (taskId: string, title: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  addCommentToTask: (taskId: string, content: string) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  setTheme: (theme: ThemeMode) => void;
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
  setIsCommandPaletteOpen: (open: boolean) => void;
  setIsCreateProjectOpen: (open: boolean) => void;
  setIsCreateTaskOpen: (open: boolean, defaults?: CreateTaskDefaults) => void;
  setSelectedTaskId: (id: string | null) => void;
}

const StoreContext = createContext<StoreContextType | null>(null);

const THEME_KEY = 'nexora_saas_theme';

export function createId(prefix: string): string {
  const random =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
  return `${prefix}-${random}`;
}

class ApiError extends Error {}

async function api<T = MutationResult>(method: 'GET' | 'POST' | 'PATCH' | 'DELETE', path: string, body?: unknown): Promise<T> {
  const res = await fetch(path, {
    method,
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: 'no-store',
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401) {
    // Session expired or was closed from another device: sign in again and come back here.
    const here = window.location.pathname + window.location.search;
    window.location.replace(`/login?expired=1&next=${encodeURIComponent(here)}`);
  }
  if (!res.ok) throw new ApiError((data as { error?: string }).error ?? `Error ${res.status}`);
  return data as T;
}

/** Applies a status change, keeping `completed` and `completedAt` in step with the server. */
function withStatus(task: Task, status: TaskStatus): Task {
  const completed = status === 'completada';
  if (completed === task.completed) return { ...task, status };
  return { ...task, status, completed, completedAt: completed ? new Date().toISOString() : undefined };
}

function progressFor(projectId: string, allTasks: Task[]): number | null {
  const own = allTasks.filter((t) => t.projectId === projectId);
  if (own.length === 0) return null;
  return Math.round((own.filter((t) => t.completed).length / own.length) * 100);
}

export function StoreProvider({ initialData, children }: { initialData: WorkspaceData; children: React.ReactNode }) {
  // Same value on server and client render, so date-relative labels never mismatch on hydration.
  setToday(initialData.today);

  const [projects, setProjects] = useState<Project[]>(initialData.projects);
  const [tasks, setTasks] = useState<Task[]>(initialData.tasks);
  const [activities, setActivities] = useState<ActivityEvent[]>(initialData.activities);
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialData.notifications);
  const [users, setUsers] = useState<User[]>(initialData.users);
  const [currentUserId, setCurrentUserId] = useState(initialData.currentUserId);
  const [theme, setThemeState] = useState<ThemeMode>('light');

  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [isCreateTaskOpen, setCreateTaskOpenState] = useState(false);
  const [createTaskDefaults, setCreateTaskDefaults] = useState<CreateTaskDefaults>({});
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const toastTimers = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const pending = useRef(0);
  const lastSync = useRef(0);

  const currentUser = users.find((u) => u.id === currentUserId) ?? users[0];

  const applyWorkspace = useCallback((data: WorkspaceData) => {
    setToday(data.today);
    setProjects(data.projects);
    setTasks(data.tasks);
    setActivities(data.activities);
    setNotifications(data.notifications);
    setUsers(data.users);
    setCurrentUserId(data.currentUserId);
    lastSync.current = Date.now();
  }, []);

  const reload = useCallback(async () => {
    try {
      applyWorkspace(await api<WorkspaceData>('GET', '/api/workspace'));
    } catch {
      // Keep what is on screen; the next mutation or focus will try again.
    }
  }, [applyWorkspace]);

  // Theme preference stays in this browser.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(THEME_KEY) as ThemeMode | null;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved === 'light' || saved === 'dark' || saved === 'system') setThemeState(saved);
    } catch {}
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => root.classList.toggle('dark', theme === 'dark' || (theme === 'system' && media.matches));
    apply();
    if (theme !== 'system') return;
    media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  }, [theme]);

  // Pick up changes made from other tabs or teammates when the window regains focus.
  useEffect(() => {
    lastSync.current = Date.now();
    const onFocus = () => {
      if (document.visibilityState !== 'visible' || pending.current > 0) return;
      if (Date.now() - lastSync.current < 20_000) return;
      void reload();
    };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onFocus);
    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onFocus);
    };
  }, [reload]);

  useEffect(() => {
    const timers = toastTimers.current;
    return () => timers.forEach((t) => clearTimeout(t));
  }, []);

  const setTheme = (next: ThemeMode) => {
    setThemeState(next);
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {}
  };

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = toastTimers.current.get(id);
    if (timer) clearTimeout(timer);
    toastTimers.current.delete(id);
  }, []);

  const addToast = useCallback(
    (toast: Omit<ToastMessage, 'id'>) => {
      const id = createId('toast');
      setToasts((prev) => [...prev.slice(-2), { ...toast, id, type: toast.type || 'info' }]);
      toastTimers.current.set(id, setTimeout(() => removeToast(id), toast.type === 'error' ? 6000 : 4200));
    },
    [removeToast]
  );

  /**
   * Sends a mutation after the optimistic update is already on screen. Server-side effects
   * (activity entries, recomputed progress) are merged in; on failure the real state is reloaded.
   */
  const sync = (request: Promise<MutationResult>) => {
    pending.current += 1;
    request
      .then((result) => {
        if (result.activity) {
          const entry = result.activity;
          setActivities((prev) => [entry, ...prev.filter((a) => a.id !== entry.id)]);
        }
        if (result.progress?.length) {
          const byId = new Map(result.progress.map((p) => [p.projectId, p.progress]));
          setProjects((prev) => prev.map((p) => (byId.has(p.id) ? { ...p, progress: byId.get(p.id)! } : p)));
        }
      })
      .catch((err: unknown) => {
        addToast({
          title: 'No se guardó el cambio',
          description: err instanceof ApiError ? err.message : 'Revisa tu conexión e inténtalo de nuevo.',
          type: 'error',
        });
        void reload();
      })
      .finally(() => {
        pending.current -= 1;
      });
  };

  /** Applies a new task list locally and recomputes progress for the touched projects. */
  const commitTasks = (next: Task[], touchedProjectIds: string[]) => {
    setTasks(next);
    setProjects((prev) =>
      prev.map((p) => {
        if (!touchedProjectIds.includes(p.id)) return p;
        const progress = progressFor(p.id, next);
        return progress === null ? p : { ...p, progress };
      })
    );
  };

  // ------------------------------------------------------------------ projects

  const addProject: StoreContextType['addProject'] = (data) => {
    const manager = users.find((u) => u.id === data.managerId) || currentUser;
    const team = users.filter((u) => data.teamIds.includes(u.id));
    if (!team.some((u) => u.id === manager.id)) team.unshift(manager);

    const milestones: Milestone[] = [
      { id: createId('m'), title: 'Arranque y acuerdos de alcance', date: data.startDate, completed: true },
      { id: createId('m'), title: 'Entrega final', date: data.dueDate, completed: false },
    ];
    const project: Project = {
      id: createId('proj'),
      name: data.name,
      description: data.description,
      clientOrArea: data.clientOrArea || 'General',
      manager,
      team,
      progress: 0,
      priority: data.priority,
      startDate: data.startDate,
      dueDate: data.dueDate,
      status: data.status,
      milestones,
      createdAt: new Date().toISOString(),
    };

    setProjects((prev) => [project, ...prev]);
    addToast({ title: 'Proyecto creado', description: project.name, type: 'success' });
    sync(
      api('POST', '/api/projects', {
        id: project.id,
        name: project.name,
        description: project.description,
        clientOrArea: project.clientOrArea,
        managerId: manager.id,
        teamIds: team.map((u) => u.id),
        priority: project.priority,
        status: project.status,
        startDate: project.startDate,
        dueDate: project.dueDate,
        milestones,
      })
    );
    return project;
  };

  const patchProject = (id: string, partial: EditableProject) => {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...partial } : p)));
    if (partial.name) {
      setTasks((prev) => prev.map((t) => (t.projectId === id ? { ...t, projectName: partial.name! } : t)));
    }
    sync(api('PATCH', `/api/projects/${id}`, partial));
  };

  const updateProject = (id: string, partial: EditableProject) => {
    patchProject(id, partial);
    addToast({ title: 'Cambios guardados', description: partial.name, type: 'success' });
  };

  const archiveProject = (id: string) => {
    const target = projects.find((p) => p.id === id);
    patchProject(id, { status: 'archivado' });
    addToast({ title: 'Proyecto archivado', description: target?.name, type: 'info' });
  };

  const deleteProject = (id: string) => {
    const target = projects.find((p) => p.id === id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
    setTasks((prev) => prev.filter((t) => t.projectId !== id));
    if (target) addToast({ title: 'Proyecto eliminado', description: `${target.name} y sus tareas`, type: 'warning' });
    sync(api('DELETE', `/api/projects/${id}`));
  };

  const toggleMilestone = (projectId: string, milestoneId: string) => {
    const milestone = projects.find((p) => p.id === projectId)?.milestones.find((m) => m.id === milestoneId);
    if (!milestone) return;
    const completed = !milestone.completed;
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? { ...p, milestones: p.milestones.map((m) => (m.id === milestoneId ? { ...m, completed } : m)) }
          : p
      )
    );
    sync(api('PATCH', `/api/milestones/${milestoneId}`, { completed }));
  };

  const addMilestone = (projectId: string, data: { title: string; date: string }) => {
    const milestone: Milestone = { id: createId('m'), title: data.title, date: data.date, completed: false };
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? { ...p, milestones: [...p.milestones, milestone].sort((a, b) => a.date.localeCompare(b.date)) }
          : p
      )
    );
    addToast({ title: 'Hito añadido', description: data.title, type: 'success' });
    sync(api('POST', `/api/projects/${projectId}/milestones`, { id: milestone.id, title: milestone.title, date: milestone.date }));
  };

  // ------------------------------------------------------------------ tasks

  const addTask: StoreContextType['addTask'] = (data) => {
    const project = projects.find((p) => p.id === data.projectId);
    if (!project) return null;
    const assignee = users.find((u) => u.id === data.assigneeId) || currentUser;

    const task: Task = {
      id: createId('tsk'),
      projectId: project.id,
      projectName: project.name,
      title: data.title,
      description: data.description,
      assignee,
      priority: data.priority,
      status: data.status,
      dueDate: data.dueDate,
      completed: data.status === 'completada',
      completedAt: data.status === 'completada' ? new Date().toISOString() : undefined,
      subtasks: [],
      comments: [],
      createdAt: new Date().toISOString(),
    };

    commitTasks([task, ...tasks], [project.id]);
    addToast({ title: 'Tarea creada', description: `En ${project.name}`, type: 'success' });
    sync(
      api('POST', '/api/tasks', {
        id: task.id,
        projectId: task.projectId,
        title: task.title,
        description: task.description,
        assigneeId: assignee.id,
        priority: task.priority,
        status: task.status,
        dueDate: task.dueDate,
      })
    );
    return task;
  };

  const updateTask = (id: string, partial: EditableTask) => {
    const target = tasks.find((t) => t.id === id);
    if (!target) return;
    const next = tasks.map((t) => {
      if (t.id !== id) return t;
      const { status, ...rest } = partial;
      const updated = { ...t, ...rest };
      return status ? withStatus(updated, status) : updated;
    });
    commitTasks(next, [target.projectId]);
    sync(api('PATCH', `/api/tasks/${id}`, partial));
  };

  const toggleTaskComplete = (id: string) => {
    const target = tasks.find((t) => t.id === id);
    if (!target) return;
    const completed = !target.completed;
    const status: TaskStatus = completed ? 'completada' : 'en_progreso';
    commitTasks(
      tasks.map((t) => (t.id === id ? withStatus(t, status) : t)),
      [target.projectId]
    );
    addToast({
      title: completed ? 'Tarea completada' : 'Tarea reabierta',
      description: target.title,
      type: completed ? 'success' : 'info',
    });
    sync(api('PATCH', `/api/tasks/${id}`, { status }));
  };

  const updateTaskStatus = (id: string, status: TaskStatus) => {
    const target = tasks.find((t) => t.id === id);
    if (!target || target.status === status) return;
    commitTasks(
      tasks.map((t) => (t.id === id ? withStatus(t, status) : t)),
      [target.projectId]
    );
    addToast({
      title: `Movida a ${getTaskStatusMeta(status).label.toLowerCase()}`,
      description: target.title,
      type: status === 'completada' ? 'success' : 'info',
    });
    sync(api('PATCH', `/api/tasks/${id}`, { status }));
  };

  const addSubtask = (taskId: string, title: string) => {
    const text = title.trim();
    if (!text) return;
    const subtask = { id: createId('sub'), title: text, completed: false };
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, subtasks: [...t.subtasks, subtask] } : t)));
    sync(api('POST', `/api/tasks/${taskId}/subtasks`, { id: subtask.id, title: subtask.title }));
  };

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    const subtask = tasks.find((t) => t.id === taskId)?.subtasks.find((s) => s.id === subtaskId);
    if (!subtask) return;
    const completed = !subtask.completed;
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, subtasks: t.subtasks.map((s) => (s.id === subtaskId ? { ...s, completed } : s)) } : t
      )
    );
    sync(api('PATCH', `/api/subtasks/${subtaskId}`, { completed }));
  };

  const addCommentToTask = (taskId: string, content: string) => {
    const text = content.trim();
    if (!text) return;
    const comment = { id: createId('comm'), taskId, author: currentUser, content: text, createdAt: new Date().toISOString() };
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, comments: [...t.comments, comment] } : t)));
    sync(api('POST', `/api/tasks/${taskId}/comments`, { id: comment.id, content: comment.content }));
  };

  // ------------------------------------------------------------------ notifications

  const markNotificationAsRead = (id: string) => {
    if (notifications.find((n) => n.id === id)?.read) return;
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    sync(api('PATCH', `/api/notifications/${id}`, { read: true }));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    sync(api('POST', '/api/notifications/read-all'));
  };

  const setIsCreateTaskOpen = (open: boolean, defaults: CreateTaskDefaults = {}) => {
    if (open) setCreateTaskDefaults(defaults);
    setCreateTaskOpenState(open);
  };

  return (
    <StoreContext.Provider
      value={{
        projects,
        tasks,
        activities,
        notifications,
        users,
        currentUser,
        theme,
        toasts,
        isCommandPaletteOpen,
        isCreateProjectOpen,
        isCreateTaskOpen,
        createTaskDefaults,
        selectedTaskId,
        addProject,
        updateProject,
        deleteProject,
        archiveProject,
        toggleMilestone,
        addMilestone,
        addTask,
        updateTask,
        toggleTaskComplete,
        updateTaskStatus,
        addSubtask,
        toggleSubtask,
        addCommentToTask,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        setTheme,
        addToast,
        removeToast,
        setIsCommandPaletteOpen,
        setIsCreateProjectOpen,
        setIsCreateTaskOpen,
        setSelectedTaskId,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
