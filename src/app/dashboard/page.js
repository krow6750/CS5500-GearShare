'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useSidebar } from '../../contexts/SidebarContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import dynamic from 'next/dynamic';
import { useQuery } from '@tanstack/react-query';
import booqableService from '@/lib/booqable/booqableService';
import { airtableService } from '@/lib/airtable/airtableService';

const DashboardStats = dynamic(
  () => import('@/components/dashboard/DashboardStats'),
  { ssr: false }
);

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { isExpanded } = useSidebar();
  const [mounted, setMounted] = useState(false);

  const { data: rentals } = useQuery({
    queryKey: ['rentals'],
    queryFn: () => booqableService.fetchAllOrders()
  });

  const { data: equipment } = useQuery({
    queryKey: ['equipment'],
    queryFn: () => booqableService.fetchAllProducts()
  });

  const { data: repairs } = useQuery({
    queryKey: ['repairs'],
    queryFn: () => airtableService.fetchAllRepairTickets()
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else {
      setMounted(true);
    }
  }, [loading, user, router]);

  if (loading || !mounted) {
    return <LoadingSpinner />;
  }

  return (
    <div className={`
      transition-all duration-300
      ${isExpanded ? 'ml-64' : 'ml-20'}
      pr-8 pl-8
    `}>
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-600 mt-1">
          Overview of your equipment rental and repair system
        </p>
      </div>
      
      <div className="space-y-6">
        <DashboardStats 
          rentals={rentals} 
          equipment={equipment} 
          repairs={repairs} 
        />
      </div>
    </div>
  );
}