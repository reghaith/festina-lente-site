'use client';

export default function TestEmailPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">EarnFlow - Email Already Exists</h1>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Email Already Registered
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>The email address you entered is already registered in our system.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">What to do next:</h2>

          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900">1. Try Logging In</h3>
              <p className="text-sm text-gray-600 mb-2">
                If this is your account, try logging in instead:
              </p>
              <a
                href="/login"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Go to Login
              </a>
            </div>

            <div>
              <h3 className="font-medium text-gray-900">2. Use a Different Email</h3>
              <p className="text-sm text-gray-600 mb-2">
                If you want to create a new account, use a different email address:
              </p>
              <a
                href="/register"
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Try Different Email
              </a>
            </div>

            <div>
              <h3 className="font-medium text-gray-900">3. Reset Password (Coming Soon)</h3>
              <p className="text-sm text-gray-600">
                Password reset functionality will be available soon.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-gray-50 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-2">Need Help?</h3>
          <p className="text-sm text-gray-600">
            If you're having trouble accessing your account, please contact support.
            For now, try using a completely new email address to create a fresh account.
          </p>
        </div>
      </div>
    </div>
  );
}