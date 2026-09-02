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
      <div className="min-h-screen flex bg-[#f5f5f5] dark:bg-[#0c0a09] text-[#292524] dark:text-[#f5f5f5] relative overflow-x-hidden">
        {/* Subtle Atmospheric Veil in background */}
        <div className="absolute top-0 left-0 right-0 h-96 atmosphere-veil pointer-events-none z-0 opacity-60" />

        {/* Sidebar */}
        <Sidebar
          isMobileOpen={isMobileMenuOpen}
          onMobileClose={() => setIsMobileMenuOpen(false)}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 md:pl-64 relative z-10">
          <Topbar onOpenMobileMenu={() => setIsMobileMenuOpen(true)} />

          <main className="flex-1 p-6 sm:p-8 max-w-[1200px] w-full mx-auto">
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
