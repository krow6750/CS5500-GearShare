'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  HomeIcon, 
  ClipboardDocumentListIcon,
  WrenchScrewdriverIcon,
  CubeIcon,
  ClockIcon,
  Cog6ToothIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EnvelopeIcon 
} from '@heroicons/react/24/outline';
import { useSidebar } from '../../contexts/SidebarContext';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Equipment', href: '/dashboard/equipment', icon: CubeIcon },
  { name: 'Repairs', href: '/dashboard/repairs', icon: WrenchScrewdriverIcon },
  { name: 'Rentals', href: '/dashboard/rentals', icon: ClipboardDocumentListIcon },
  { name: 'Activity', href: '/dashboard/activity', icon: ClockIcon },
  { name: 'Email Templates', href: '/dashboard/email-templates', icon: EnvelopeIcon }, 
  { name: 'Settings', href: '/dashboard/settings', icon: Cog6ToothIcon },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { isExpanded, setIsExpanded } = useSidebar();

  return (
    <div className={`
      h-full bg-[#09090B] text-slate-200
      transition-all duration-300 ease-in-out
      ${isExpanded ? 'w-64' : 'w-20'}
    `}>
      <div className="flex items-center h-16 px-6 relative">
        <span className={`text-white font-bold transition-all duration-300 ${
          isExpanded ? 'text-xl' : 'text-sm'
        }`}>
          {isExpanded ? 'GearShare' : 'GS'}
        </span>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="absolute -right-4 top-1/2 -translate-y-1/2 z-50
            bg-[#09090B] text-slate-200 p-2 rounded-full shadow-lg
            hover:bg-slate-800 transition-all duration-300 ease-in-out
            border border-slate-700 w-8 h-8 flex items-center justify-center"
        >
          {isExpanded ? (
            <ChevronLeftIcon className="h-5 w-5" />
          ) : (
            <ChevronRightIcon className="h-5 w-5" />
          )}
        </button>
      </div>

      <nav className="mt-8">
        {navigation.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`
              flex items-center px-6 py-3
              transition-colors duration-200
              ${pathname === item.href 
                ? 'bg-[#18181B] text-emerald-500 border-r-2 border-emerald-500' 
                : 'text-slate-400 hover:bg-[#18181B] hover:text-slate-200'}
            `}
          >
            <item.icon className={`h-5 w-5 ${isExpanded ? 'mr-3' : ''}`} />
            {isExpanded && <span className="font-medium">{item.name}</span>}
          </Link>
        ))}
      </nav>
    </div>
  );
}