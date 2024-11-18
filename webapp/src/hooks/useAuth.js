import { useEffect } from 'react';
import { auth } from '@/lib/firebase/firebase-config';
import { onAuthStateChanged } from 'firebase/auth';
import useAuthStore from '@/store/authStore';

export function useAuth() {
  const { setUser, setLoading } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, setLoading]);

  return useAuthStore();
}
