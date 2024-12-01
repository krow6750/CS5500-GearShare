'use client';

import { createContext } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  return <AuthContext.Provider value={{}}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
