'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { firebaseDB } from '@/lib/firebase/db';
import { COLLECTIONS, STATUS } from '@/lib/firebase/models';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import dynamic from 'next/dynamic';

const Pie = dynamic(
  () => import('react-chartjs-2').then(mod => mod.Pie),
  { ssr: false }
);

const Line = dynamic(
  () => import('react-chartjs-2').then(mod => mod.Line),
  { ssr: false }
);

const CHART_COLORS = {
  black: '#09090B',
  green: '#10B981',      // emerald-500
  lightGreen: '#34D399', // emerald-400
  darkGreen: '#059669',  // emerald-600
  text: '#71717A',       // zinc-500
  background: '#18181B', // zinc-900
};

export default function DashboardStats() {
  const [chartReady, setChartReady] = useState(false);

  useEffect(() => {
    const initChart = async () => {
      const { 
        Chart, 
        ArcElement, 
        Tooltip, 
        Legend,
        CategoryScale,
        LinearScale,
        PointElement,
        LineElement,
        Filler
      } = await import('chart.js');
      
      Chart.register(
        ArcElement,
        Tooltip,
        Legend,
        CategoryScale,
        LinearScale,
        PointElement,
        LineElement,
        Filler
      );
      setChartReady(true);
    };

    initChart();
  }, []);

  const { data: equipment = [], isLoading: equipmentLoading } = useQuery({
    queryKey: ['equipment'],
    queryFn: async () => {
      try {
        return await firebaseDB.query(COLLECTIONS.EQUIPMENT) || [];
      } catch (error) {
        console.error('Error fetching equipment:', error);
        return [];
      }
    }
  });

  const { data: rentals = [], isLoading: rentalsLoading } = useQuery({
    queryKey: ['rentals'],
    queryFn: async () => {
      try {
        return await firebaseDB.query(COLLECTIONS.RENTALS) || [];
      } catch (error) {
        console.error('Error fetching rentals:', error);
        return [];
      }
    }
  });

  const { data: repairs = [], isLoading: repairsLoading } = useQuery({
    queryKey: ['repairs'],
    queryFn: async () => {
      try {
        return await firebaseDB.query(COLLECTIONS.REPAIRS) || [];
      } catch (error) {
        console.error('Error fetching repairs:', error);
        return [];
      }
    }
  });

  const { data: activities = [], isLoading: activitiesLoading } = useQuery({
    queryKey: ['activities'],
    queryFn: async () => {
      try {
        return await firebaseDB.query(COLLECTIONS.ACTIVITY_LOGS, { limit: 5 }) || [];
      } catch (error) {
        console.error('Error fetching activities:', error);
        return [];
      }
    }
  });

  if (equipmentLoading || rentalsLoading || repairsLoading || activitiesLoading) {
    return <LoadingSpinner />;
  }

  const stats = {
    totalRentals: rentals.length,
    activeRentals: rentals.filter(r => r.status === STATUS.RENTAL.ACTIVE).length,
    totalEquipment: equipment.length,
    availableEquipment: equipment.filter(e => e.status === STATUS.EQUIPMENT.AVAILABLE).length,
    activeRepairs: repairs.filter(r => r.status === STATUS.REPAIR.IN_PROGRESS).length,
    revenue: rentals.reduce((acc, rental) => acc + (rental.total_cost || 0), 0)
  };

  const equipmentStatusData = {
    labels: ['Available', 'Rented', 'In Repair'],
    datasets: [{
      data: [
        equipment.filter(e => e.status === STATUS.EQUIPMENT.AVAILABLE).length,
        equipment.filter(e => e.status === STATUS.EQUIPMENT.RENTED).length,
        equipment.filter(e => e.status === STATUS.EQUIPMENT.IN_REPAIR).length
      ],
      backgroundColor: [
        CHART_COLORS.green,
        CHART_COLORS.black,
        CHART_COLORS.darkGreen
      ],
      borderWidth: 0
    }]
  };

  const rentalTrendData = {
    labels: ['This Week', '1 Week Ago', '2 Weeks Ago', '3 Weeks Ago', '4 Weeks Ago'],
    datasets: [{
      label: 'Weekly Rentals',
      data: [
        // Get rentals for current week
        rentals.filter(r => {
          const date = new Date(r.created_at);
          const now = new Date();
          const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
          return date >= weekStart;
        }).length,
        // 1 week ago
        rentals.filter(r => {
          const date = new Date(r.created_at);
          const now = new Date();
          const weekStart = new Date(now.setDate(now.getDate() - now.getDay() - 7));
          const weekEnd = new Date(now.setDate(now.getDate() + 7));
          return date >= weekStart && date < weekEnd;
        }).length,
        // 2 weeks ago
        rentals.filter(r => {
          const date = new Date(r.created_at);
          const now = new Date();
          const weekStart = new Date(now.setDate(now.getDate() - now.getDay() - 14));
          const weekEnd = new Date(now.setDate(now.getDate() + 7));
          return date >= weekStart && date < weekEnd;
        }).length,
        // 3 weeks ago
        rentals.filter(r => {
          const date = new Date(r.created_at);
          const now = new Date();
          const weekStart = new Date(now.setDate(now.getDate() - now.getDay() - 21));
          const weekEnd = new Date(now.setDate(now.getDate() + 7));
          return date >= weekStart && date < weekEnd;
        }).length,
        // 4 weeks ago
        rentals.filter(r => {
          const date = new Date(r.created_at);
          const now = new Date();
          const weekStart = new Date(now.setDate(now.getDate() - now.getDay() - 28));
          const weekEnd = new Date(now.setDate(now.getDate() + 7));
          return date >= weekStart && date < weekEnd;
        }).length,
      ],
      borderColor: CHART_COLORS.green,
      backgroundColor: `${CHART_COLORS.green}15`, // Very light green
      fill: true,
      tension: 0.4
    }]
  };

  const pieChartOptions = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: CHART_COLORS.text,
          padding: 20,
          font: {
            size: 12,
            weight: 500
          },
          usePointStyle: true, // Makes the legend items circular instead of square
          pointStyle: 'circle'
        }
      }
    }
  };

  const lineChartOptions = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          color: CHART_COLORS.text
        },
        grid: {
          color: `${CHART_COLORS.text}15`
        }
      },
      x: {
        ticks: {
          color: CHART_COLORS.text
        },
        grid: {
          color: `${CHART_COLORS.text}15`
        }
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Total Rentals</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">{stats.totalRentals}</p>
          <p className="mt-2 text-sm text-gray-600">↑ Active: {stats.activeRentals}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Equipment</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">{stats.totalEquipment}</p>
          <p className="mt-2 text-sm text-gray-600">↑ Available: {stats.availableEquipment}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Active Repairs</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">{stats.activeRepairs}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Revenue</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            ${stats.revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Charts */}
      {chartReady && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Equipment Status</h3>
            <div className="h-72">
              <Pie 
                data={equipmentStatusData}
                options={pieChartOptions}
              />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Rental Trend</h3>
            <div className="h-64">
              <Line 
                data={rentalTrendData}
                options={lineChartOptions}
              />
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6">
          <h3 className="text-lg font-semibold">Recent Activity</h3>
        </div>
        <div className="border-t border-gray-200">
          {activities.slice(0, 3).map((activity) => (
            <div key={activity.id} className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                  <p className="text-sm text-gray-500">{activity.timestamp}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full
                  ${activity.action_type === 'create' ? 'bg-emerald-100 text-emerald-800' : ''}
                  ${activity.action_type === 'update' ? 'bg-slate-100 text-slate-800' : ''}
                  ${activity.action_type === 'delete' ? 'bg-red-100 text-red-800' : ''}
                `}>
                  {activity.action_type}
                </span>
              </div>
            </div>
          ))}
          {activities.length === 0 && (
            <div className="p-6">
              <p className="text-slate-500 text-sm">No recent activity</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}