'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Project,
  Task,
  ActivityEvent,
  NotificationItem,
  User,
  Priority,
  ProjectStatus,
  TaskStatus,
} from './types';
import {
  initialProjects,
  initialTasks,
  initialActivities,
  initialNotifications,
  mockUsers,
  currentUser,
} from './mock-data';

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type?: 'success' | 'error' | 'info' | 'warning';
}

interface StoreContextType {
  projects: Project[];
  tasks: Task[];
  activities: ActivityEvent[];
  notifications: NotificationItem[];
  users: User[];
  currentUser: User;
  theme: 'light' | 'dark' | 'system';
  toasts: ToastMessage[];
  isCommandPaletteOpen: boolean;
  isCreateProjectOpen: boolean;
  isCreateTaskOpen: boolean;
  selectedTaskId: string | null;
  // Actions
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
  addTask: (data: {
    title: string;
    description: string;
    projectId: string;
    assigneeId: string;
    priority: Priority;
    dueDate: string;
    status: TaskStatus;
  }) => Task;
  updateTask: (id: string, partial: Partial<Task>) => void;
  toggleTaskComplete: (id: string) => void;
  updateTaskStatus: (id: string, status: TaskStatus) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  addCommentToTask: (taskId: string, content: string) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
  setIsCommandPaletteOpen: (open: boolean) => void;
  setIsCreateProjectOpen: (open: boolean) => void;
  setIsCreateTaskOpen: (open: boolean) => void;
  setSelectedTaskId: (id: string | null) => void;
  resetToDefaults: () => void;
}

const StoreContext = createContext<StoreContextType | null>(null);

const STORAGE_KEY_PREFIX = 'nexora_saas_';

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false);

  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [activities, setActivities] = useState<ActivityEvent[]>(initialActivities);
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [users] = useState<User[]>(mockUsers);
  const [theme, setThemeState] = useState<'light' | 'dark' | 'system'>('light');

  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Load from localStorage on client mount
  useEffect(() => {
    setIsClient(true);
    try {
      const savedProjects = localStorage.getItem(`${STORAGE_KEY_PREFIX}projects`);
      if (savedProjects) setProjects(JSON.parse(savedProjects));

      const savedTasks = localStorage.getItem(`${STORAGE_KEY_PREFIX}tasks`);
      if (savedTasks) setTasks(JSON.parse(savedTasks));

      const savedActivities = localStorage.getItem(`${STORAGE_KEY_PREFIX}activities`);
      if (savedActivities) setActivities(JSON.parse(savedActivities));

      const savedNotifications = localStorage.getItem(`${STORAGE_KEY_PREFIX}notifications`);
      if (savedNotifications) setNotifications(JSON.parse(savedNotifications));

      const savedTheme = localStorage.getItem(`${STORAGE_KEY_PREFIX}theme`) as 'light' | 'dark' | 'system' | null;
      if (savedTheme) {
        setThemeState(savedTheme);
      }
    } catch {
      // Fallback to defaults if parsing fails
    }
  }, []);

  // Save to localStorage when changed
  useEffect(() => {
    if (!isClient) return;
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}projects`, JSON.stringify(projects));
    } catch {}
  }, [projects, isClient]);

  useEffect(() => {
    if (!isClient) return;
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}tasks`, JSON.stringify(tasks));
    } catch {}
  }, [tasks, isClient]);

  useEffect(() => {
    if (!isClient) return;
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}activities`, JSON.stringify(activities));
    } catch {}
  }, [activities, isClient]);

  useEffect(() => {
    if (!isClient) return;
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}notifications`, JSON.stringify(notifications));
    } catch {}
  }, [notifications, isClient]);

  // Handle dark mode DOM sync
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const root = document.documentElement;
    const isDark =
      theme === 'dark' ||
      (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const setTheme = (newTheme: 'light' | 'dark' | 'system') => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}theme`, newTheme);
    } catch {}
  };

  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const newToast: ToastMessage = { ...toast, id, type: toast.type || 'info' };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const addProject = (data: {
    name: string;
    description: string;
    clientOrArea: string;
    managerId: string;
    teamIds: string[];
    priority: Priority;
    startDate: string;
    dueDate: string;
    status: ProjectStatus;
  }) => {
    const manager = users.find((u) => u.id === data.managerId) || currentUser;
    const team = users.filter((u) => data.teamIds.includes(u.id));
    if (!team.some((u) => u.id === manager.id)) {
      team.push(manager);
    }

    const newProject: Project = {
      id: `proj-${Date.now()}`,
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
        {
          id: `m-${Date.now()}-1`,
          title: 'Inicio y alineación de requerimientos',
          date: data.startDate,
          completed: true,
        },
        {
          id: `m-${Date.now()}-2`,
          title: 'Entrega final y puesta en marcha',
          date: data.dueDate,
          completed: false,
        },
      ],
      createdAt: new Date().toISOString(),
    };

    setProjects((prev) => [newProject, ...prev]);

    // Record activity
    const newActivity: ActivityEvent = {
      id: `act-${Date.now()}`,
      user: currentUser,
      action: 'creó el proyecto',
      entity: newProject.name,
      entityType: 'project',
      timestamp: new Date().toISOString(),
      timeAgo: 'Justo ahora',
      projectId: newProject.id,
    };
    setActivities((prev) => [newActivity, ...prev]);

    addToast({
      title: 'Proyecto creado exitosamente',
      description: `"${newProject.name}" ya está disponible en el workspace.`,
      type: 'success',
    });

    return newProject;
  };

  const updateProject = (id: string, partial: Partial<Project>) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const updated = { ...p, ...partial };
          return updated;
        }
        return p;
      })
    );
    addToast({
      title: 'Proyecto actualizado',
      description: 'Los cambios se han guardado correctamente.',
      type: 'info',
    });
  };

  const deleteProject = (id: string) => {
    const projectToDelete = projects.find((p) => p.id === id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
    setTasks((prev) => prev.filter((t) => t.projectId !== id));

    if (projectToDelete) {
      addToast({
        title: 'Proyecto eliminado',
        description: `Se eliminó "${projectToDelete.name}" y sus tareas vinculadas.`,
        type: 'warning',
      });
    }
  };

  const archiveProject = (id: string) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: 'archivado' as ProjectStatus } : p))
    );
    addToast({
      title: 'Proyecto archivado',
      description: 'El proyecto fue movido al archivo histórico.',
      type: 'info',
    });
  };

  const addTask = (data: {
    title: string;
    description: string;
    projectId: string;
    assigneeId: string;
    priority: Priority;
    dueDate: string;
    status: TaskStatus;
  }) => {
    const project = projects.find((p) => p.id === data.projectId) || projects[0];
    const assignee = users.find((u) => u.id === data.assigneeId) || currentUser;

    const newTask: Task = {
      id: `tsk-${Date.now()}`,
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

    setTasks((prev) => [newTask, ...prev]);

    // Recalculate project progress
    updateProjectProgress(project.id, newTask, 'add');

    // Record activity
    const newActivity: ActivityEvent = {
      id: `act-${Date.now()}`,
      user: currentUser,
      action: 'creó la tarea',
      entity: newTask.title,
      entityType: 'task',
      timestamp: new Date().toISOString(),
      timeAgo: 'Justo ahora',
      projectId: project.id,
    };
    setActivities((prev) => [newActivity, ...prev]);

    addToast({
      title: 'Tarea creada',
      description: `Asignada a ${assignee.name}.`,
      type: 'success',
    });

    return newTask;
  };

  const updateProjectProgress = (projectId: string, _task: Task, _mode: string) => {
    // Dynamically calculate progress based on all project tasks
    setTimeout(() => {
      setTasks((currentTasks) => {
        const projTasks = currentTasks.filter((t) => t.projectId === projectId);
        if (projTasks.length === 0) return currentTasks;
        const completed = projTasks.filter((t) => t.status === 'completada').length;
        const newProgress = Math.round((completed / projTasks.length) * 100);

        setProjects((prevProj) =>
          prevProj.map((p) => (p.id === projectId ? { ...p, progress: newProgress } : p))
        );
        return currentTasks;
      });
    }, 0);
  };

  const updateTask = (id: string, partial: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const updated = { ...t, ...partial };
          if (partial.status) {
            updated.completed = partial.status === 'completada';
          }
          return updated;
        }
        return t;
      })
    );
  };

  const toggleTaskComplete = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const willBeCompleted = !t.completed;
          const newStatus: TaskStatus = willBeCompleted ? 'completada' : 'en_progreso';
          const updated = { ...t, completed: willBeCompleted, status: newStatus };

          addToast({
            title: willBeCompleted ? 'Tarea completada 🎉' : 'Tarea reabierta',
            description: `"${t.title}" marcada como ${newStatus}.`,
            type: willBeCompleted ? 'success' : 'info',
          });

          // Activity
          setActivities((acts) => [
            {
              id: `act-${Date.now()}`,
              user: currentUser,
              action: willBeCompleted ? 'marcó como completada' : 'reabrió la tarea',
              entity: t.title,
              entityType: 'task',
              timestamp: new Date().toISOString(),
              timeAgo: 'Justo ahora',
              projectId: t.projectId,
            },
            ...acts,
          ]);

          // Recalculate project progress
          setTimeout(() => {
            setTasks((freshTasks) => {
              const projTasks = freshTasks.filter((task) => task.projectId === t.projectId);
              if (projTasks.length > 0) {
                const comp = projTasks.filter((task) => task.completed).length;
                const pct = Math.round((comp / projTasks.length) * 100);
                setProjects((ps) =>
                  ps.map((p) => (p.id === t.projectId ? { ...p, progress: pct } : p))
                );
              }
              return freshTasks;
            });
          }, 50);

          return updated;
        }
        return t;
      })
    );
  };

  const updateTaskStatus = (id: string, newStatus: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const isCompleted = newStatus === 'completada';
          const updated = { ...t, status: newStatus, completed: isCompleted };

          addToast({
            title: 'Estado actualizado',
            description: `Tarea movida a "${newStatus.replace('_', ' ')}".`,
            type: 'info',
          });

          return updated;
        }
        return t;
      })
    );
  };

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const updatedSubtasks = t.subtasks.map((st) =>
            st.id === subtaskId ? { ...st, completed: !st.completed } : st
          );
          return { ...t, subtasks: updatedSubtasks };
        }
        return t;
      })
    );
  };

  const addCommentToTask = (taskId: string, content: string) => {
    if (!content.trim()) return;

    const newComment = {
      id: `comm-${Date.now()}`,
      taskId,
      author: currentUser,
      content: content.trim(),
      createdAt: new Date().toISOString(),
    };

    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          return { ...t, comments: [...t.comments, newComment] };
        }
        return t;
      })
    );

    addToast({
      title: 'Comentario añadido',
      type: 'info',
    });
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    addToast({
      title: 'Notificaciones leídas',
      description: 'Todas las notificaciones fueron marcadas como leídas.',
      type: 'info',
    });
  };

  const resetToDefaults = () => {
    setProjects(initialProjects);
    setTasks(initialTasks);
    setActivities(initialActivities);
    setNotifications(initialNotifications);
    localStorage.clear();
    addToast({
      title: 'Datos restaurados',
      description: 'Se han restablecido los datos mock de fábrica.',
      type: 'info',
    });
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
        selectedTaskId,
        addProject,
        updateProject,
        deleteProject,
        archiveProject,
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
