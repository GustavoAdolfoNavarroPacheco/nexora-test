'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { motion, MotionConfig } from 'motion/react';
import { StoreProvider } from '@/lib/store';
import { easeApple } from '@/lib/motion';
import { Sidebar } from './sidebar';
import { Topbar } from './topbar';
import { TabBar } from './tab-bar';
import { SmoothScroll } from './smooth-scroll';
import { ToastContainer } from '@/components/ui/toast';
import { CommandPalette } from '@/components/command-palette/command-palette';
import { CreateProjectModal } from '@/components/projects/create-project-modal';
import { CreateTaskModal } from '@/components/tasks/create-task-modal';
import { TaskDetailDrawer } from '@/components/tasks/task-detail-drawer';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <StoreProvider>
      <MotionConfig reducedMotion="user">
        <SmoothScroll />
        <a
          href="#contenido"
          className="fixed top-2 left-2 z-[100] -translate-y-20 rounded-full bg-accent px-4 py-2 text-sm font-medium text-white focus:translate-y-0"
        >
          Saltar al contenido
        </a>

        <Sidebar />

        <div className="flex min-h-dvh flex-col lg:pl-[256px]">
          <Topbar />
          <motion.main
            id="contenido"
            key={pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: easeApple }}
            className="mx-auto w-full max-w-[1240px] flex-1 px-4 pt-2 pb-32 sm:px-8 lg:pb-16"
          >
            {children}
          </motion.main>
        </div>

        <TabBar />
        <CommandPalette />
        <CreateProjectModal />
        <CreateTaskModal />
        <TaskDetailDrawer />
        <ToastContainer />
      </MotionConfig>
    </StoreProvider>
  );
}
