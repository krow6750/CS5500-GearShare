'use client';

import { useQuery } from '@tanstack/react-query';
import { airtableService } from '@/lib/airtable/airtableService';
import booqableService from '@/lib/booqable/booqableService';
import { useState, useEffect } from 'react';

export function useDashboardData() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const repairs = useQuery({
    queryKey: ['repairs'],
    queryFn: async () => {
      if (!isClient) return [];
      try {
        const data = await airtableService.fetchAllRepairTickets();
        console.log('Raw Airtable Repairs Data:', {
          firstRecord: data[0],
          totalCount: data.length,
          statuses: data.map(r => r.fields['Status']),
          fields: data[0]?.fields
        });
        return data;
      } catch (error) {
        console.error('Error fetching repairs:', error);
        return [];
      }
    },
    enabled: isClient,
    staleTime: 1000 * 60 * 5,
  });

  const booqableData = useQuery({
    queryKey: ['booqable-all'],
    queryFn: async () => {
      if (!isClient) return null;
      try {
        const data = await booqableService.fetchAllRelatedData();
        console.log('Booqable Raw Response:', {
          data,
          dataType: typeof data,
          ordersType: typeof data?.orders,
          isOrdersArray: Array.isArray(data?.orders),
          firstOrder: data?.orders?.[0]
        });
        return data;
      } catch (error) {
        console.error('Error fetching Booqable data:', error);
        return null;
      }
    },
    enabled: isClient,
    staleTime: 1000 * 60 * 5,
  });

  const rentalsData = Array.isArray(booqableData.data?.orders) 
    ? booqableData.data.orders 
    : [];
    
  const equipmentData = Array.isArray(booqableData.data?.products) 
    ? booqableData.data.products 
    : [];

  console.log('Dashboard Data Debug:', {
    repairsCount: repairs.data?.length || 0,
    repairStatuses: repairs.data?.map(r => r.fields['Status']),
    booqableOrdersCount: rentalsData.length,
    booqableProductsCount: equipmentData.length,
    rentalsDataType: typeof rentalsData,
    isRentalsArray: Array.isArray(rentalsData),
    rentalsData,
    equipmentData
  });

  const getWeeklyRevenue = () => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    console.log('Weekly Revenue Debug:', {
      repairData: repairs.data,
      rentalsData: rentalsData,
      oneWeekAgo: oneWeekAgo.toISOString(),
      now: now.toISOString()
    });

    const repairRevenue = repairs.data?.reduce((acc, repair) => {
      const date = new Date(repair.fields['Created Time']);
      const amount = parseFloat(repair.fields['Amount Paid'] || 0);
      
      if (date >= oneWeekAgo && date <= now) {
        const dateStr = date.toISOString().split('T')[0];
        acc[dateStr] = (acc[dateStr] || 0) + amount;
        console.log('Adding repair revenue:', { date: dateStr, amount, runningTotal: acc[dateStr] });
      }
      return acc;
    }, {}) || {};

    const rentalRevenue = rentalsData.reduce((acc, rental) => {
      const date = new Date(rental.attributes?.starts_at);
      const amount = (rental.attributes?.price_in_cents || 0) / 100;
      
      if (date >= oneWeekAgo && date <= now) {
        const dateStr = date.toISOString().split('T')[0];
        acc[dateStr] = (acc[dateStr] || 0) + amount;
        console.log('Adding rental revenue:', { date: dateStr, amount, runningTotal: acc[dateStr] });
      }
      return acc;
    }, {});

    const combinedRevenue = {};
    const allDates = new Set([...Object.keys(repairRevenue), ...Object.keys(rentalRevenue)]);
    
    allDates.forEach(date => {
      combinedRevenue[date] = (repairRevenue[date] || 0) + (rentalRevenue[date] || 0);
    });

    console.log('Combined Revenue:', combinedRevenue);

    return combinedRevenue;
  };

  return {
    rentals: { 
      data: rentalsData,
      ...booqableData 
    },
    equipment: { 
      data: equipmentData,
      ...booqableData 
    },
    repairs: { 
      data: repairs.data || [], 
      ...repairs 
    },
    weeklyRevenue: getWeeklyRevenue(),
    isClient,
    isLoading: !isClient || repairs.isLoading || booqableData.isLoading
  };
} 