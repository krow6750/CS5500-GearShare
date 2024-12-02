'use client';

import { SYSTEM_USER } from '@/lib/constants';
import { redirect } from 'next/navigation';
import Header from '../../components/dashboard/Header';
import Sidebar from '../../components/dashboard/Sidebar';
import { SidebarProvider, useSidebar } from '../../contexts/SidebarContext';

export default function DashboardLayout({ children }) {
  const user = SYSTEM_USER;

  return (
    <div className="min-h-screen bg-slate-100 overflow-x-hidden">
      <SidebarProvider>
        <LayoutContent>{children}</LayoutContent>
      </SidebarProvider>
    </div>
  );
}

function LayoutContent({ children }) {
  const { isExpanded } = useSidebar();

  return (
    <div className="flex min-h-screen">
      <div className="fixed inset-y-0 left-0 z-50">
        <Sidebar />
      </div>
      <div className={`
        flex-1
        ${isExpanded ? 'ml-64' : 'ml-20'}
        transition-all duration-300
        overflow-x-hidden
      `}>
        <Header />
        <main className="pt-16">
          <div className="py-8 px-2 max-w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
