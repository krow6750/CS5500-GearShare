'use client';

import { useState, useEffect, useMemo } from 'react';
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

const REPAIR_CHART_COLORS = {
  'In Repair': '#10B981',                                 
  'Dropped Off, Awaiting Repair': '#3B82F6',              
  'Finished, Picked Up': '#8B5CF6',                       
  'Can\'t Repair': '#EF4444',                           
  'Finished + Paid, In Drop-Box': '#F59E0B',            
  'Contacted, Awaiting Customer Response': '#EC4899',     
  'Finished, Customer Contacted': '#06B6D4',             
  'Awaiting Drop-Off': '#6366F1'                        
};

export default function DashboardStats({ rentals, equipment, repairs }) {
  const [chartReady, setChartReady] = useState(false);

  useEffect(() => {
    const initChart = async () => {
      const { Chart, ArcElement, Tooltip, Legend } = await import('chart.js');
      Chart.register(ArcElement, Tooltip, Legend);
      setChartReady(true);
    };
    initChart();
  }, []);

  useEffect(() => {
    console.log('DashboardStats Data:', {
      repairsData: repairs,
      repairsCount: repairs?.length,
      repairStatuses: repairs?.map(r => r.fields['Status']),
      firstRepair: repairs?.[0],
      rentalsData: rentals,
      firstRental: rentals?.[0]
    });
  }, [repairs, rentals]);

  useEffect(() => {
    console.log('DashboardStats Rentals Debug:', {
      rentalsData: rentals,
      rentalsType: typeof rentals,
      isArray: Array.isArray(rentals),
      firstRental: rentals?.[0],
      rawRentals: rentals
    });
  }, [rentals]);

  useEffect(() => {
    console.log('Equipment Debug:', {
      equipmentData: equipment,
      equipmentLength: equipment?.length,
      firstItem: equipment?.[0],
      stockItems: equipment?.[0]?.stock_items
    });
  }, [equipment]);

  if (!rentals || !equipment || !repairs) {
    return <LoadingSpinner />;
  }

  const rentalsArray = Array.isArray(rentals) ? rentals : [];
  const equipmentArray = Array.isArray(equipment) ? equipment.filter(item => !item.archived) : [];

  const stats = {
    totalRentals: rentalsArray.length,
    activeRentals: rentalsArray.filter(rental => 
      rental.status === 'RESERVED' || 
      rental.status === 'PICKED_UP'
    ).length,
    totalEquipment: equipmentArray.length,
    availableEquipment: equipmentArray.filter(item => 
      item.stock_items?.some(stockItem => 
        !stockItem.archived && stockItem.status === 'available'
      )
    ).length,
    revenue: (() => {
      const rentalRevenue = rentalsArray.reduce((acc, rental) => 
        acc + (rental.price_in_cents || 0), 0
      ) / 100;

      const repairRevenue = repairs.reduce((acc, repair) => {
        const amountPaid = parseFloat(repair.fields['Amount Paid'] || 0);
        return acc + (isNaN(amountPaid) ? 0 : amountPaid);
      }, 0);

      console.log('Revenue Calculation:', {
        rentalsArray: rentalsArray,
        rentalRevenue: rentalRevenue,
        repairs: repairs,
        repairRevenue: repairRevenue,
        totalRevenue: rentalRevenue + repairRevenue,
        sampleRental: rentalsArray[0],
        sampleRepair: repairs[0]
      });

      return rentalRevenue + repairRevenue;
    })()
  };

  const weeklyRevenue = (() => {
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    });

    return last7Days.reduce((acc, date) => {
      const rentalRevenue = rentalsArray
        .filter(rental => rental.starts_at?.split('T')[0] === date)
        .reduce((sum, rental) => {
          const amount = rental.price_in_cents?.toString().replace(/[$,]/g, '');
          const numericAmount = amount ? parseFloat(amount) : 0;
          return sum + numericAmount;
        }, 0) / 100; 

      const repairRevenue = repairs
        ?.filter(repair => repair.fields['Submitted On'] === date)
        .reduce((sum, repair) => {
          const amount = repair.fields['Amount Paid']?.toString().replace(/[$,]/g, '');
          const numericAmount = amount ? parseFloat(amount) : 0;
          return sum + numericAmount;
        }, 0) || 0;

      acc[date] = rentalRevenue + repairRevenue;

      console.log(`Revenue for ${date}:`, {
        rentals: rentalsArray.filter(rental => rental.starts_at?.split('T')[0] === date)
          .map(r => ({
            original: r.price_in_cents,
            parsed: parseFloat(r.price_in_cents?.toString().replace(/[$,]/g, '')) / 100
          })),
        rentalRevenue,
        repairs: repairs?.filter(repair => repair.fields['Submitted On'] === date)
          .map(r => ({
            original: r.fields['Amount Paid'],
            parsed: parseFloat(r.fields['Amount Paid']?.toString().replace(/[$,]/g, ''))
          })),
        repairRevenue,
        total: acc[date]
      });

      return acc;
    }, {});
  })();

  const repairStatusData = {
    labels: repairs?.reduce((acc, repair) => {
      const status = repair.fields['Status'];
      if (!acc.includes(status)) {
        acc.push(status);
      }
      return acc;
    }, []).map(status => {
      const count = repairs.filter(r => r.fields['Status'] === status).length;
      return `${status}\n(${count})`;
    }) || [],
    datasets: [{
      data: repairs?.reduce((acc, repair) => {
        const status = repair.fields['Status'];
        const statusIndex = acc.findIndex(item => item.status === status);
        if (statusIndex === -1) {
          acc.push({ status, count: 1 });
        } else {
          acc[statusIndex].count++;
        }
        return acc;
      }, []).map(item => item.count) || [],
      backgroundColor: repairs?.reduce((acc, repair) => {
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
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Equipment</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">{stats.totalEquipment}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Weekly Sales</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            ${Object.values(weeklyRevenue).reduce((sum, amount) => sum + amount, 0).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
          </p>
          <p className="text-xs text-gray-500 mt-1">Last 7 days combined</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Total Income</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            ${stats.revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-gray-500 mt-1">Combined repairs and rentals</p>
        </div>
      </div>


      {chartReady && (
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Repair Status Distribution</h3>
            <div className="h-[400px] relative w-full flex justify-center">
              <Pie 
                data={repairStatusData} 
                options={{ 
                  maintainAspectRatio: false,
                  plugins: {
                    title: {
                      display: true,
                      text: `Total Repair Tickets: ${repairs?.length || 0}`,
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
                        padding: 20,
                        font: {
                          size: 14
                        },
                        boxWidth: 15,
                        boxHeight: 15,
                        generateLabels: (chart) => {
                          const datasets = chart.data.datasets;
                          return chart.data.labels.map((label, i) => ({
                            text: label.split(',').join(',\n'),
                            fillStyle: datasets[0].backgroundColor[i],
                            strokeStyle: datasets[0].backgroundColor[i],
                            lineWidth: 0,
                            hidden: !chart.getDataVisibility(i),
                            index: i
                          }));
                        }
                      }
                    }
                  },
                  layout: {
                    padding: {
                      top: 20,
                      right: 200,  
                      bottom: 20,
                      left: 20
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