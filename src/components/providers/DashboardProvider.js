'use client';

import { useAuth } from '@/hooks/useAuth';
import { redirect } from 'next/navigation';
import Header from '@/components/dashboard/Header';
import Sidebar from '@/components/dashboard/Sidebar';
import { SidebarProvider } from '@/contexts/SidebarContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function DashboardProvider({ children }) {
  const { user, loading } = useAuth();

  console.log('User:', user);
  console.log('Loading:', loading);

  if (loading) return <LoadingSpinner />;
  if (!user) redirect('/login');

  return (
    <SidebarProvider>
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 mt-16">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
} 