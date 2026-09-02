'use client';

import React, { useState } from 'react';
import { StoreProvider } from '@/lib/store';
import { Sidebar } from './sidebar';
import { Topbar } from './topbar';
import { ToastContainer } from '@/components/ui/toast';
import { CommandPalette } from '@/components/command-palette/command-palette';
import { CreateProjectModal } from '@/components/projects/create-project-modal';
import { CreateTaskModal } from '@/components/tasks/create-task-modal';
import { TaskDetailDrawer } from '@/components/tasks/task-detail-drawer';

export function AppShell({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <StoreProvider>
      <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-blue-100 selection:text-blue-900">
        {/* Sidebar */}
        <Sidebar
          isMobileOpen={isMobileMenuOpen}
          onMobileClose={() => setIsMobileMenuOpen(false)}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 md:pl-64">
          <Topbar onOpenMobileMenu={() => setIsMobileMenuOpen(true)} />

          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>

        {/* Global Floating Components */}
        <CommandPalette />
        <CreateProjectModal />
        <CreateTaskModal />
        <TaskDetailDrawer />
        <ToastContainer />
      </div>
    </StoreProvider>
  );
}
