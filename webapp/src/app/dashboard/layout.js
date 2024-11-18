'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { redirect } from 'next/navigation';
import Header from '../../components/dashboard/Header';
import Sidebar from '../../components/dashboard/Sidebar';
import { SidebarProvider } from '../../contexts/SidebarContext';

export default function DashboardLayout({ children }) {
  const { user, loading } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user) redirect('/login');

  return (
    <div className="min-h-screen bg-slate-100">
      <SidebarProvider>
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <div className="flex-1 overflow-auto">
            <Header />
            <main className="p-8 mt-16">
              <div className="max-w-[2000px] mx-auto w-full">
                {children}
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
}