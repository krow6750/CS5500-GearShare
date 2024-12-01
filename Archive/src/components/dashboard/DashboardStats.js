'use client';

import { useState, useEffect } from 'react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import dynamic from 'next/dynamic';
import { useDashboardData } from '@/hooks/useDashboardData';

const Pie = dynamic(
  () => import('react-chartjs-2').then(mod => mod.Pie),
  { ssr: false }
);

const Line = dynamic(
  () => import('react-chartjs-2').then(mod => mod.Line),
  { ssr: false }
);

const REPAIR_CHART_COLORS = {
  'In Repair': '#10B981',                                  // emerald-500
  'Dropped Off, Awaiting Repair': '#3B82F6',              // blue-500
  'Finished, Picked Up': '#8B5CF6',                       // violet-500
  'Can\'t Repair': '#EF4444',                             // red-500
  'Finished + Paid, In Drop-Box': '#F59E0B',             // amber-500
  'Contacted, Awaiting Customer Response': '#EC4899',     // pink-500
  'Finished, Customer Contacted': '#06B6D4',              // cyan-500
  'Awaiting Drop-Off': '#6366F1'                         // indigo-500
};

export default function DashboardStats() {
  const [chartReady, setChartReady] = useState(false);
  const { rentals, equipment, repairs, isLoading, weeklyRevenue } = useDashboardData();

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

  useEffect(() => {
    console.log('DashboardStats Data:', {
      repairsData: repairs.data,
      repairsCount: repairs.data?.length,
      repairStatuses: repairs.data?.map(r => r.fields['Status']),
      firstRepair: repairs.data?.[0],
      rentalsData: rentals.data,
      firstRental: rentals.data?.[0]
    });
  }, [repairs.data, rentals.data]);

  useEffect(() => {
    console.log('DashboardStats Rentals Debug:', {
      rentalsData: rentals.data,
      rentalsType: typeof rentals.data,
      isArray: Array.isArray(rentals.data),
      firstRental: rentals.data?.[0],
      rawRentals: rentals
    });
  }, [rentals]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const rentalsArray = Array.isArray(rentals.data) ? rentals.data : [];
  const equipmentArray = Array.isArray(equipment.data) ? equipment.data : [];

  const stats = {
    totalRentals: rentalsArray.length,
    activeRentals: rentalsArray.filter(r => 
      r.attributes?.status === 'reserved' || 
      r.attributes?.status === 'started'
    ).length,
    totalEquipment: equipmentArray.length,
    availableEquipment: equipmentArray.filter(e => 
      e.attributes?.status === 'available'
    ).length,
    activeRepairs: (() => {
      const activeStatuses = [
        'Contacted, Awaiting Customer Response',
        'Awaiting Drop-Off',
        'Dropped Off, Awaiting Repair',
        'In Repair'
      ];
      
      const activeCount = repairs.data?.filter(r => 
        activeStatuses.includes(r.fields['Status'])
      )?.length || 0;

      console.log('Active Repairs Calculation:', {
        activeStatuses,
        total: activeCount,
        allStatuses: repairs.data?.map(r => r.fields['Status'])
      });

      return activeCount;
    })(),
    revenue: rentalsArray.reduce((acc, rental) => 
      acc + (rental.attributes?.price_in_cents || 0), 0
    ) / 100
  };

  // Add chart data
  const repairStatusData = {
    labels: repairs.data?.reduce((acc, repair) => {
      const status = repair.fields['Status'];
      if (!acc.includes(status)) {
        acc.push(status);
      }
      return acc;
    }, []).map(status => {
      // Count occurrences of this status
      const count = repairs.data.filter(r => r.fields['Status'] === status).length;
      // Format label with line break and count
      return `${status}\n(${count})`;
    }) || [],
    datasets: [{
      data: repairs.data?.reduce((acc, repair) => {
        const status = repair.fields['Status'];
        const statusIndex = acc.findIndex(item => item.status === status);
        if (statusIndex === -1) {
          acc.push({ status, count: 1 });
        } else {
          acc[statusIndex].count++;
        }
        return acc;
      }, []).map(item => item.count) || [],
      backgroundColor: repairs.data?.reduce((acc, repair) => {
        const status = repair.fields['Status'];
        if (!acc.includes(REPAIR_CHART_COLORS[status])) {
          acc.push(REPAIR_CHART_COLORS[status]);
        }
        return acc;
      }, []) || []
    }]
  };

  const revenueData = {
    labels: Object.keys(weeklyRevenue).sort(),
    datasets: [{
      label: 'Combined Sales',
      data: Object.keys(weeklyRevenue)
        .sort()
        .map(date => weeklyRevenue[date]),
      borderColor: REPAIR_CHART_COLORS['In Repair'],
      backgroundColor: REPAIR_CHART_COLORS['Dropped Off, Awaiting Repair'],
      fill: true
    }]
  };

  return (
    <div className="space-y-6">
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

      {/* Add charts section */}
      {chartReady && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-sm min-w-[600px] col-span-1">
            <h3 className="text-sm font-medium text-gray-500 mb-4">Repair Status Distribution</h3>
            <div className="h-64 relative overflow-visible w-full">
              <Pie 
                data={repairStatusData} 
                options={{ 
                  maintainAspectRatio: false,
                  plugins: {
                    title: {
                      display: true,
                      text: `Total Repair Tickets: ${repairs.data?.length || 0}`,
                      position: 'top',
                      padding: {
                        top: 10,
                        bottom: 30
                      },
                      font: {
                        size: 16,
                        weight: 'bold'
                      }
                    },
                    legend: {
                      position: 'right',
                      align: 'center',
                      labels: {
                        padding: 10,
                        usePointStyle: true,
                        font: {
                          size: 10
                        },
                        boxWidth: 10,
                        boxHeight: 10,
                        generateLabels: (chart) => {
                          const datasets = chart.data.datasets;
                          return chart.data.labels.map((label, i) => ({
                            text: label.split(',').join(',\n'),
                            fillStyle: datasets[0].backgroundColor[i],
                            strokeStyle: datasets[0].backgroundColor[i],
                            lineWidth: 0,
                            hidden: !chart.getDataVisibility(i),
                            index: i,
                            textDecoration: chart.getDataVisibility(i) ? '' : 'line-through'
                          }));
                        }
                      }
                    }
                  },
                  layout: {
                    padding: {
                      top: 20,
                      right: 160,
                      bottom: 20,
                      left: 20
                    }
                  }
                }} 
              />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-500 mb-4">Weekly Sales</h3>
            <div className="h-64">
              <Line 
                data={revenueData} 
                options={{ 
                  maintainAspectRatio: false,
                  plugins: {
                    tooltip: {
                      callbacks: {
                        label: (context) => `$${context.parsed.y.toLocaleString()}`
                      }
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: (value) => `$${value.toLocaleString()}`
                      }
                    }
                  }
                }} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}