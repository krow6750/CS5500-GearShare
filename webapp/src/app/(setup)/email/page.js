'use client';

import { useState, useEffect } from 'react';

export default function EmailSetup() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkConfiguration();
  }, []);

  const checkConfiguration = async () => {
    try {
      const response = await fetch('/api/email/check-config');
      const data = await response.json();
      setIsConfigured(data.isConfigured);
    } catch (error) {
      setError('Failed to check configuration');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTest = async () => {
    try {
      setStatus('Sending test email...');
      setError('');

      const response = await fetch('/api/email/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('✅ Test email sent successfully!');
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      setError(error.message);
      setStatus('❌ Failed to send test email');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-lg mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-gray-900">Email Configuration</h1>
        
        {!isConfigured ? (
          <div className="space-y-4">
            <div className="bg-orange-100 p-6 rounded-lg border border-orange-300">
              <h2 className="font-semibold text-orange-800 text-lg">
                ⚠️ SendGrid Not Configured
              </h2>
              <p className="mt-2 text-orange-900">Please follow these steps:</p>
              <ol className="list-decimal list-inside mt-3 space-y-2 text-orange-900">
                <li>Sign up at <a 
                  href="https://signup.sendgrid.com/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-600 hover:underline font-medium"
                >SendGrid</a></li>
                <li>Create an API key</li>
                <li>Verify your sender email</li>
                <li>Add these to your <code className="bg-orange-50 px-2 py-1 rounded">.env.local</code> file:</li>
              </ol>
              <div className="mt-4 bg-gray-900 text-gray-100 p-4 rounded-md font-mono text-sm">
                <p>SENDGRID_API_KEY=your_api_key_here</p>
                <p>SENDGRID_VERIFIED_SENDER=your@verified.email</p>
              </div>
              <p className="mt-4 text-orange-900 font-medium">
                After adding these, restart your Next.js server.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-green-100 p-4 rounded-lg border border-green-300">
              <p className="text-green-800 font-medium">✅ SendGrid is configured!</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Test Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="Enter your email"
              />
            </div>

            <button
              onClick={handleTest}
              disabled={!email}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              Send Test Email
            </button>

            {(status || error) && (
              <div className={`p-4 rounded-lg ${error ? 'bg-red-100 border border-red-300' : 'bg-gray-100 border border-gray-300'}`}>
                {status && <p className="text-gray-900">{status}</p>}
                {error && <p className="text-red-600 mt-2">{error}</p>}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 