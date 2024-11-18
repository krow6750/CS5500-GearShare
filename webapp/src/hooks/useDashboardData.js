'use client';

import { useQuery } from '@tanstack/react-query';
import { firebaseDB } from '@/lib/firebase/db';
import { COLLECTIONS } from '@/lib/firebase/models';
import { useState, useEffect } from 'react';

export function useDashboardData() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const rentals = useQuery({
    queryKey: ['rentals'],
    queryFn: async () => {
      if (!isClient) return [];
      try {
        const data = await firebaseDB.query(COLLECTIONS.RENTALS);
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error('Error fetching rentals:', error);
        return [];
      }
    },
    enabled: isClient,
    staleTime: 1000 * 60 * 5,
  });

  const equipment = useQuery({
    queryKey: ['equipment'],
    queryFn: async () => {
      if (!isClient) return [];
      try {
        const data = await firebaseDB.query(COLLECTIONS.EQUIPMENT);
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error('Error fetching equipment:', error);
        return [];
      }
    },
    enabled: isClient,
    staleTime: 1000 * 60 * 5,
  });

  const repairs = useQuery({
    queryKey: ['repairs'],
    queryFn: async () => {
      if (!isClient) return [];
      try {
        const data = await firebaseDB.query(COLLECTIONS.REPAIRS);
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error('Error fetching repairs:', error);
        return [];
      }
    },
    enabled: isClient,
    staleTime: 1000 * 60 * 5,
  });

  const activities = useQuery({
    queryKey: ['activities'],
    queryFn: async () => {
      if (!isClient) return [];
      try {
        const data = await firebaseDB.query(COLLECTIONS.ACTIVITY_LOGS, { limit: 5 });
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error('Error fetching activities:', error);
        return [];
      }
    },
    enabled: isClient,
    staleTime: 1000 * 60 * 5,
  });

  return {
    rentals: { data: rentals.data || [], ...rentals },
    equipment: { data: equipment.data || [], ...equipment },
    repairs: { data: repairs.data || [], ...repairs },
    activities: { data: activities.data || [], ...activities },
    isClient,
    isLoading: !isClient || rentals.isLoading || equipment.isLoading || repairs.isLoading || activities.isLoading
  };
} 