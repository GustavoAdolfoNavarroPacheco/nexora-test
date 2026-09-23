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
import {
  initialProjects,
  initialTasks,
  initialActivities,
  initialNotifications,
  mockUsers,
  currentUser,
} from './mock-data';
import { getTaskStatusMeta } from './utils';

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
  addProject: (data: {
    name: string;
    description: string;
    clientOrArea: string;
    managerId: string;
    teamIds: string[];
    priority: Priority;
    startDate: string;
    dueDate: string;
    status: ProjectStatus;
  }) => Project;
  updateProject: (id: string, partial: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  archiveProject: (id: string) => void;
  toggleMilestone: (projectId: string, milestoneId: string) => void;
  addMilestone: (projectId: string, data: { title: string; date: string }) => void;
  addTask: (data: {
    title: string;
    description: string;
    projectId: string;
    assigneeId: string;
    priority: Priority;
    dueDate: string;
    status: TaskStatus;
  }) => Task | null;
  updateTask: (id: string, partial: Partial<Task>) => void;
  toggleTaskComplete: (id: string) => void;
  updateTaskStatus: (id: string, status: TaskStatus) => void;
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
  resetToDefaults: () => void;
}

const StoreContext = createContext<StoreContextType | null>(null);

const STORAGE_KEY_PREFIX = 'nexora_saas_';

let globalIdCounter = 1000;
export function createId(prefix: string): string {
  globalIdCounter += 1;
  return `${prefix}-${Date.now()}-${globalIdCounter}`;
}

function progressFor(projectId: string, allTasks: Task[]): number | null {
  const own = allTasks.filter((t) => t.projectId === projectId);
  if (own.length === 0) return null;
  return Math.round((own.filter((t) => t.completed).length / own.length) * 100);
}

function readStorage<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}${key}`);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: unknown) {
  try {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${key}`, typeof value === 'string' ? value : JSON.stringify(value));
  } catch {
    // Storage full or blocked — the session keeps working in memory.
  }
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [activities, setActivities] = useState<ActivityEvent[]>(initialActivities);
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [users] = useState<User[]>(mockUsers);
  const [theme, setThemeState] = useState<ThemeMode>('light');

  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [isCreateTaskOpen, setCreateTaskOpenState] = useState(false);
  const [createTaskDefaults, setCreateTaskDefaults] = useState<CreateTaskDefaults>({});
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const [hydrated, setHydrated] = useState(false);
  const toastTimers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  // Restore the persisted workspace once on the client.
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    const savedProjects = readStorage<Project[]>('projects');
    if (savedProjects) setProjects(savedProjects);
    const savedTasks = readStorage<Task[]>('tasks');
    if (savedTasks) setTasks(savedTasks);
    const savedActivities = readStorage<ActivityEvent[]>('activities');
    if (savedActivities) setActivities(savedActivities);
    const savedNotifications = readStorage<NotificationItem[]>('notifications');
    if (savedNotifications) setNotifications(savedNotifications);
    try {
      const savedTheme = localStorage.getItem(`${STORAGE_KEY_PREFIX}theme`) as ThemeMode | null;
      if (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system') setThemeState(savedTheme);
    } catch {}
    setHydrated(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  useEffect(() => {
    if (hydrated) writeStorage('projects', projects);
  }, [projects, hydrated]);
  useEffect(() => {
    if (hydrated) writeStorage('tasks', tasks);
  }, [tasks, hydrated]);
  useEffect(() => {
    if (hydrated) writeStorage('activities', activities);
  }, [activities, hydrated]);
  useEffect(() => {
    if (hydrated) writeStorage('notifications', notifications);
  }, [notifications, hydrated]);

  // Keep the <html> class in sync with the chosen theme (and with the OS when set to "system").
  useEffect(() => {
    const root = document.documentElement;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => {
      const dark = theme === 'dark' || (theme === 'system' && media.matches);
      root.classList.toggle('dark', dark);
    };
    apply();
    if (theme !== 'system') return;
    media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  }, [theme]);

  useEffect(() => {
    const timers = toastTimers.current;
    return () => timers.forEach((t) => clearTimeout(t));
  }, []);

  const setTheme = (next: ThemeMode) => {
    setThemeState(next);
    writeStorage('theme', next);
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
      toastTimers.current.set(id, setTimeout(() => removeToast(id), 4200));
    },
    [removeToast]
  );

  const logActivity = (event: Omit<ActivityEvent, 'id' | 'user' | 'timestamp' | 'timeAgo'>) => {
    setActivities((prev) => [
      {
        ...event,
        id: createId('act'),
        user: currentUser,
        timestamp: new Date().toISOString(),
        timeAgo: 'Justo ahora',
      },
      ...prev,
    ]);
  };

  /** Commits a new task list and recomputes progress for the touched projects. */
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

  const addProject: StoreContextType['addProject'] = (data) => {
    const manager = users.find((u) => u.id === data.managerId) || currentUser;
    const team = users.filter((u) => data.teamIds.includes(u.id));
    if (!team.some((u) => u.id === manager.id)) team.unshift(manager);

    const newProject: Project = {
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
      milestones: [
        { id: createId('m'), title: 'Arranque y acuerdos de alcance', date: data.startDate, completed: true },
        { id: createId('m'), title: 'Entrega final', date: data.dueDate, completed: false },
      ],
      createdAt: new Date().toISOString(),
    };

    setProjects((prev) => [newProject, ...prev]);
    logActivity({ action: 'creó el proyecto', entity: newProject.name, entityType: 'project', projectId: newProject.id });
    addToast({ title: 'Proyecto creado', description: newProject.name, type: 'success' });
    return newProject;
  };

  const updateProject = (id: string, partial: Partial<Project>) => {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...partial } : p)));
    addToast({ title: 'Cambios guardados', description: partial.name ?? undefined, type: 'success' });
  };

  const deleteProject = (id: string) => {
    const target = projects.find((p) => p.id === id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
    setTasks((prev) => prev.filter((t) => t.projectId !== id));
    if (target) {
      addToast({
        title: 'Proyecto eliminado',
        description: `${target.name} y sus tareas`,
        type: 'warning',
      });
    }
  };

  const archiveProject = (id: string) => {
    const target = projects.find((p) => p.id === id);
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, status: 'archivado' } : p)));
    addToast({ title: 'Proyecto archivado', description: target?.name, type: 'info' });
  };

  const toggleMilestone = (projectId: string, milestoneId: string) => {
    const project = projects.find((p) => p.id === projectId);
    const milestone = project?.milestones.find((m) => m.id === milestoneId);
    if (!project || !milestone) return;
    const completed = !milestone.completed;
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? { ...p, milestones: p.milestones.map((m) => (m.id === milestoneId ? { ...m, completed } : m)) }
          : p
      )
    );
    if (completed) {
      logActivity({ action: 'cumplió el hito', entity: milestone.title, entityType: 'project', projectId });
    }
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
  };

  const addTask: StoreContextType['addTask'] = (data) => {
    const project = projects.find((p) => p.id === data.projectId) || projects[0];
    if (!project) return null;
    const assignee = users.find((u) => u.id === data.assigneeId) || currentUser;

    const newTask: Task = {
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
      subtasks: [],
      comments: [],
      createdAt: new Date().toISOString(),
    };

    commitTasks([newTask, ...tasks], [project.id]);
    logActivity({ action: 'creó la tarea', entity: newTask.title, entityType: 'task', projectId: project.id });
    addToast({ title: 'Tarea creada', description: `En ${project.name}`, type: 'success' });
    return newTask;
  };

  const updateTask = (id: string, partial: Partial<Task>) => {
    const target = tasks.find((t) => t.id === id);
    if (!target) return;
    const next = tasks.map((t) => {
      if (t.id !== id) return t;
      const updated = { ...t, ...partial };
      if (partial.status) updated.completed = partial.status === 'completada';
      return updated;
    });
    commitTasks(next, [target.projectId]);
  };

  const toggleTaskComplete = (id: string) => {
    const target = tasks.find((t) => t.id === id);
    if (!target) return;
    const completed = !target.completed;
    const status: TaskStatus = completed ? 'completada' : 'en_progreso';
    commitTasks(
      tasks.map((t) => (t.id === id ? { ...t, completed, status } : t)),
      [target.projectId]
    );
    logActivity({
      action: completed ? 'completó la tarea' : 'reabrió la tarea',
      entity: target.title,
      entityType: 'task',
      projectId: target.projectId,
    });
    addToast({
      title: completed ? 'Tarea completada' : 'Tarea reabierta',
      description: target.title,
      type: completed ? 'success' : 'info',
    });
  };

  const updateTaskStatus = (id: string, status: TaskStatus) => {
    const target = tasks.find((t) => t.id === id);
    if (!target || target.status === status) return;
    commitTasks(
      tasks.map((t) => (t.id === id ? { ...t, status, completed: status === 'completada' } : t)),
      [target.projectId]
    );
    addToast({
      title: `Movida a ${getTaskStatusMeta(status).label.toLowerCase()}`,
      description: target.title,
      type: status === 'completada' ? 'success' : 'info',
    });
  };

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, subtasks: t.subtasks.map((s) => (s.id === subtaskId ? { ...s, completed: !s.completed } : s)) }
          : t
      )
    );
  };

  const addCommentToTask = (taskId: string, content: string) => {
    const text = content.trim();
    if (!text) return;
    const comment = {
      id: createId('comm'),
      taskId,
      author: currentUser,
      content: text,
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, comments: [...t.comments, comment] } : t)));
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const setIsCreateTaskOpen = (open: boolean, defaults: CreateTaskDefaults = {}) => {
    if (open) setCreateTaskDefaults(defaults);
    setCreateTaskOpenState(open);
  };

  const resetToDefaults = () => {
    setProjects(initialProjects);
    setTasks(initialTasks);
    setActivities(initialActivities);
    setNotifications(initialNotifications);
    try {
      ['projects', 'tasks', 'activities', 'notifications'].forEach((k) =>
        localStorage.removeItem(`${STORAGE_KEY_PREFIX}${k}`)
      );
    } catch {}
    addToast({ title: 'Datos de demostración restaurados', type: 'info' });
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
        resetToDefaults,
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
