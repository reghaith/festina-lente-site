'use client';

export default function DebugPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">EarnFlow Debug Page</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Registration Test */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Test Registration</h2>
            <form className="space-y-4" onSubmit={handleRegister}>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                  placeholder="test@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                  placeholder="password123"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Name (optional)</label>
                <input
                  type="text"
                  value={registerName}
                  onChange={(e) => setRegisterName(e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                  placeholder="Test User"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Registering...' : 'Register'}
              </button>
            </form>
            {registerResult && (
              <div className="mt-4 p-3 bg-gray-100 rounded">
                <pre className="text-xs overflow-auto">{JSON.stringify(registerResult, null, 2)}</pre>
              </div>
            )}
          </div>

          {/* Login Test */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Test Login</h2>
            <form className="space-y-4" onSubmit={handleLogin}>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                  placeholder="test@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                  placeholder="password123"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>
            {loginResult && (
              <div className="mt-4 p-3 bg-gray-100 rounded">
                <pre className="text-xs overflow-auto">{JSON.stringify(loginResult, null, 2)}</pre>
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Debug Results</h2>
          <div className="space-y-4">
            <button
              onClick={checkEnv}
              className="bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700"
            >
              Check Environment
            </button>
            <button
              onClick={testAppwrite}
              className="bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 ml-4"
            >
              Test Appwrite API
            </button>
          </div>
          {debugResult && (
            <div className="mt-4 p-3 bg-gray-100 rounded">
              <pre className="text-xs overflow-auto">{JSON.stringify(debugResult, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Add the missing imports and state variables
import { useState } from 'react';

function DebugPageComponent() {
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [registerResult, setRegisterResult] = useState<any>(null);
  const [loginResult, setLoginResult] = useState<any>(null);
  const [debugResult, setDebugResult] = useState<any>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: registerEmail,
          password: registerPassword,
          name: registerName,
        }),
      });
      const data = await response.json();
      setRegisterResult({ status: response.status, data });
    } catch (error: any) {
      setRegisterResult({ error: error.message });
    }
    setLoading(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
        }),
      });
      const data = await response.json();
      setLoginResult({ status: response.status, data });
    } catch (error: any) {
      setLoginResult({ error: error.message });
    }
    setLoading(false);
  };

  const checkEnv = async () => {
    try {
      const response = await fetch('/api/env-check');
      const data = await response.json();
      setDebugResult({ type: 'env-check', data });
    } catch (error: any) {
      setDebugResult({ type: 'env-check', error: error.message });
    }
  };

  const testAppwrite = async () => {
    try {
      const response = await fetch('/api/debug-auth');
      const data = await response.json();
      setDebugResult({ type: 'appwrite-test', data });
    } catch (error: any) {
      setDebugResult({ type: 'appwrite-test', error: error.message });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">EarnFlow Debug Page</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Registration Test */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Test Registration</h2>
            <form className="space-y-4" onSubmit={handleRegister}>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                  placeholder="test@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                  placeholder="password123"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Name (optional)</label>
                <input
                  type="text"
                  value={registerName}
                  onChange={(e) => setRegisterName(e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                  placeholder="Test User"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Registering...' : 'Register'}
              </button>
            </form>
            {registerResult && (
              <div className="mt-4 p-3 bg-gray-100 rounded">
                <pre className="text-xs overflow-auto">{JSON.stringify(registerResult, null, 2)}</pre>
              </div>
            )}
          </div>

          {/* Login Test */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Test Login</h2>
            <form className="space-y-4" onSubmit={handleLogin}>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                  placeholder="test@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                  placeholder="password123"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>
            {loginResult && (
              <div className="mt-4 p-3 bg-gray-100 rounded">
                <pre className="text-xs overflow-auto">{JSON.stringify(loginResult, null, 2)}</pre>
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Debug Results</h2>
          <div className="space-y-4">
            <button
              onClick={checkEnv}
              className="bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700"
            >
              Check Environment
            </button>
            <button
              onClick={testAppwrite}
              className="bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 ml-4"
            >
              Test Appwrite API
            </button>
          </div>
          {debugResult && (
            <div className="mt-4 p-3 bg-gray-100 rounded">
              <pre className="text-xs overflow-auto">{JSON.stringify(debugResult, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DebugPageComponent;
