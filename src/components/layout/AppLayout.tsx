import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { useStore } from '@/store';
import { ChevronRight } from 'lucide-react';

export const AppLayout: React.FC = () => {
  const { isSidebarCollapsed, toggleSidebarCollapsed } = useStore();

  return (
    <div className="h-screen flex flex-col bg-app-bg text-app-text overflow-hidden">
      <Navbar />
      <div className="flex-1 flex overflow-hidden relative">
        <Sidebar />

        {/* Desktop sidebar toggle button */}
        <button
          onClick={toggleSidebarCollapsed}
          className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-[60] items-center justify-center w-6 h-12 bg-app-surface border border-app-border border-l-0 rounded-r-lg hover:bg-app-bg transition-all"
          style={{ left: isSidebarCollapsed ? '0' : '320px' }}
          aria-label={isSidebarCollapsed ? 'Open sidebar' : 'Close sidebar'}
        >
          <ChevronRight className={`w-4 h-4 text-app-muted transition-transform ${isSidebarCollapsed ? '' : 'rotate-180'}`} />
        </button>

        <div className="flex-1 overflow-hidden">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

