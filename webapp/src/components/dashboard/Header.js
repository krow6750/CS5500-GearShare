'use client';

import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { auth } from '@/lib/firebase/firebase-config';
import { useAuth } from '@/hooks/useAuth';
import { useSidebar } from '../../contexts/SidebarContext';

export default function Header() {
  const { user } = useAuth();
  const { isExpanded } = useSidebar();

  const handleSignOut = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className={`
      fixed top-0 right-0 bg-white shadow-sm z-20 transition-all duration-300
      ${isExpanded ? 'left-64' : 'left-20'}
    `}>
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <div className="flex flex-shrink-0 items-center">
              <h1 className="text-xl font-bold text-slate-900">GearShare Admin</h1>
            </div>
          </div>
          <div className="flex items-center">
            <Menu as="div" className="relative ml-3">
              <Menu.Button className="flex rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-500">
                <span className="sr-only">Open user menu</span>
                <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-medium">
                  {user?.email?.charAt(0).toUpperCase()}
                </div>
              </Menu.Button>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 z-50 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <Menu.Item>
                    <button
                      onClick={handleSignOut}
                      className="block w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                    >
                      Sign out
                    </button>
                  </Menu.Item>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
        </div>
      </div>
    </header>
  );
}