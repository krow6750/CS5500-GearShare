'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const SidebarContext = createContext();

export function SidebarProvider({ children }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Get initial state from localStorage
    const savedState = localStorage.getItem('sidebarExpanded');
    if (savedState !== null) {
      setIsExpanded(JSON.parse(savedState));
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    // Only save to localStorage after initial mount
    if (mounted) {
      localStorage.setItem('sidebarExpanded', JSON.stringify(isExpanded));
    }
  }, [isExpanded, mounted]);

  // Don't render children until after hydration
  if (!mounted) {
    return null;
  }

  return (
    <SidebarContext.Provider value={{ isExpanded, setIsExpanded }}>
      {children}
    </SidebarContext.Provider>
  );
}

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}; 