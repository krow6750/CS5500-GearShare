'use client';
 
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    console.log('Redirecting to login');
    router.replace('/login');
    console.log('Redirection to login complete');
  }, [router]);

  return null;
}