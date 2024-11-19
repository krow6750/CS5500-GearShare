'use client';

import { useState, useEffect } from 'react';
import { useSidebar } from '@/contexts/SidebarContext';
import { STATUS } from '@/lib/firebase/models';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import dynamic from 'next/dynamic';
import { useDashboardData } from '@/hooks/useDashboardData';

// Dynamically import charts
const Line = dynamic(
  () => import('react-chartjs-2').then(mod => mod.Line),
  { ssr: false }
);

const Pie = dynamic(
  () => import('react-chartjs-2').then(mod => mod.Pie),
  { ssr: false }
);

const CHART_COLORS = {
  primary: '#10B981',
  secondary: '#1F2937',
  tertiary: '#374151',
};

export default function DashboardContent() {
  const { isExpanded } = useSidebar();
  const [chartReady, setChartReady] = useState(false);
  const { rentals, equipment, repairs, activities, isLoading, isClient } = useDashboardData();

  useEffect(() => {
    if (!isClient) return;
    
    const init = async () => {
      const { Chart, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend } 
        = await import('chart.js');
      
      Chart.register(
        CategoryScale,
        LinearScale,
        PointElement,
        LineElement,
        ArcElement,
        Title,
        Tooltip,
        Legend
      );
      setChartReady(true);
    };

    init();
  }, [isClient]);

  if (!isClient || isLoading) {
    return <LoadingSpinner />;
  }

  const stats = {
    totalRentals: rentals.data?.length || 0,
    activeRepairs: repairs.data?.filter(r => r.status === STATUS.REPAIR.IN_PROGRESS)?.length || 0,
    totalEquipment: equipment.data?.length || 0,
    pendingReturns: rentals.data?.filter(r => r.status === STATUS.RENTAL.ACTIVE)?.length || 0,
    revenue: rentals.data?.reduce((acc, rental) => acc + (rental.total_cost || 0), 0) || 0,
    availableEquipment: equipment.data?.filter(e => e.status === STATUS.EQUIPMENT.AVAILABLE)?.length || 0
  };

  // ... rest of your component code remains the same ...
} 