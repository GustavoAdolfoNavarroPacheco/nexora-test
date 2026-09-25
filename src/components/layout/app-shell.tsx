'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion, MotionConfig } from 'motion/react';
import { StoreProvider } from '@/lib/store';
import type { WorkspaceData } from '@/lib/workspace';
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
import { WelcomeOverlay } from '@/components/auth/welcome-overlay';
import type { Provider } from '@/lib/auth-shared';

export function AppShell({
  initialData,
  welcome,
  children,
}: {
  initialData: WorkspaceData;
  /** Set right after signing in: plays the welcome animation before revealing the app. */
  welcome?: Provider;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [welcoming, setWelcoming] = useState(Boolean(welcome));

  return (
    <StoreProvider initialData={initialData}>
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
            initial={{ opacity: 0, y: 8, scale: welcome ? 0.97 : 1 }}
            animate={welcoming ? { opacity: 0, y: 8, scale: 0.97 } : { opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: welcome ? 0.7 : 0.45, ease: easeApple }}
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
        <AnimatePresence>
          {welcoming && welcome && <WelcomeOverlay key="welcome" provider={welcome} onDone={() => setWelcoming(false)} />}
        </AnimatePresence>
      </MotionConfig>
    </StoreProvider>
  );
}
