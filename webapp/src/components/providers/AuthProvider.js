'use client';

import { createContext, useContext, useEffect } from 'react';
import { auth } from '@/lib/firebase/firebase-config';
import { onAuthStateChanged } from 'firebase/auth';
import useAuthStore from '@/store/authStore';
import { useRouter, usePathname } from 'next/navigation';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const { setUser, setLoading } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Set user in store
        setUser({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
        });
        // Set auth token in cookie
        user.getIdToken().then((token) => {
          document.cookie = `token=${token}; path=/`;
        });
        
        // Only redirect if we're not already in the dashboard
        if (!pathname.startsWith('/dashboard')) {
          router.push('/dashboard');
        }
      } else {
        setUser(null);
        document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        
        // Only redirect to login if we're trying to access protected routes
        if (pathname.startsWith('/dashboard')) {
          router.push('/login');
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, setLoading, router, pathname]);

  return <AuthContext.Provider value={{}}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
