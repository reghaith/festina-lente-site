'use client';

import { useState } from 'react';

export default function TestPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testRegistration = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User'
        }),
      });
      const data = await response.json();
      setResult({ type: 'registration', data, status: response.status });
    } catch (error: any) {
      setResult({ type: 'registration', error: error.message });
    }
    setLoading(false);
  };

  const testLogin = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123'
        }),
      });
      const data = await response.json();
      setResult({ type: 'login', data, status: response.status });
    } catch (error: any) {
      setResult({ type: 'login', error: error.message });
    }
    setLoading(false);
  };

  const checkUserStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/user-status?email=test@example.com');
      const data = await response.json();
      setResult({ type: 'user-status', data, status: response.status });
    } catch (error: any) {
      setResult({ type: 'user-status', error: error.message });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">Authentication Test</h1>

        <div className="space-y-4 mb-8">
          <button
            onClick={testRegistration}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded mr-4"
          >
            Test Registration
          </button>

          <button
            onClick={testLogin}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded mr-4"
          >
            Test Login
          </button>

          <button
            onClick={checkUserStatus}
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
          >
            Check User Status
          </button>
        </div>

        {loading && <p>Loading...</p>}

        {result && (
          <div className="bg-white p-4 rounded shadow">
            <h2 className="font-bold mb-2">Result ({result.type}):</h2>
            <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
