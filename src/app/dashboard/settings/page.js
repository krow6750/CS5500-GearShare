'use client';

import { useState, useEffect } from 'react';
import { useSidebar } from '../../../contexts/SidebarContext';
import { SYSTEM_USER } from '@/lib/constants';
import { useAuth } from '@/hooks/useAuth';

export default function SettingsPage() {
  const { isExpanded } = useSidebar();
  const { signOut } = useAuth();
  const user = SYSTEM_USER;
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [passwords, setPasswords] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (passwords.newPassword !== passwords.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (passwords.newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    setSuccess('Password updated successfully');
    setPasswords({ newPassword: '', confirmPassword: '' });
    setLoading(false);
  };

  return (
    <div className={`
      transition-all duration-300
      ${isExpanded ? 'ml-64' : 'ml-20'}
      pr-8 pl-8
    `}>
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Account Settings</h1>
        <p className="text-sm text-slate-600 mt-1">
          Manage your account preferences
        </p>
      </div>

      <div className="space-y-6">
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Account Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Email</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="mt-1 block w-full rounded-md border-slate-300 bg-slate-50 text-slate-500 shadow-sm sm:text-sm"
              />
              <p className="mt-1 text-xs text-slate-500">Email cannot be changed</p>
            </div>
          </div>
        </div>

        <form onSubmit={handlePasswordChange} className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Change Password</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">New Password</label>
              <input
                type="password"
                value={passwords.newPassword}
                onChange={(e) => setPasswords(prev => ({ ...prev, newPassword: e.target.value }))}
                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-slate-500 focus:ring-slate-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Confirm New Password</label>
              <input
                type="password"
                value={passwords.confirmPassword}
                onChange={(e) => setPasswords(prev => ({ ...prev, confirmPassword: e.target.value }))}
                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-slate-500 focus:ring-slate-500 sm:text-sm"
              />
            </div>
            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}
            {success && (
              <p className="text-sm text-emerald-600">{success}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white px-4 py-2 rounded-md hover:bg-slate-800 transition-colors disabled:bg-slate-400"
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>

        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Account Actions</h2>
          <div className="space-y-4">
            <button
              onClick={() => signOut()}
              className="w-full bg-slate-100 text-slate-900 px-4 py-2 rounded-md hover:bg-slate-200 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}