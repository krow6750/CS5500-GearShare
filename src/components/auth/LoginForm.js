'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/services/authService';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    console.log('Attempting login with:', { email, password });

    try {
      const user = await authService.login(email, password);
      localStorage.setItem('user', JSON.stringify(user));
      document.cookie = `token=authenticated; path=/`;
      console.log('User stored in localStorage:', user);
      await router.push('/dashboard');
    } catch (error) {
      setError('Invalid email or password');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 text-center">
              Welcome to GearShare
            </h2>
            <p className="mt-2 text-sm text-slate-600 text-center">
              Sign in to your account to continue
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">
                  Email address
                </label>
                <input
                  type="email"
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-900 placeholder:text-slate-400
                    focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-900 placeholder:text-slate-400
                    focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2.5 text-sm font-medium text-white bg-slate-900 rounded-md
                hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500
                disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
