'use client';

import { useState, useEffect } from 'react';
import { useSidebar } from '@/contexts/SidebarContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import dynamic from 'next/dynamic';
import { useDashboardData } from '@/hooks/useDashboardData';
import DashboardStats from './DashboardStats';

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
  const { isLoading, isClient } = useDashboardData();

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

  return (
    <div className={`transition-all duration-300 ${isExpanded ? 'ml-64' : 'ml-20'}`}>
      <DashboardStats />
    </div>
  );
} 