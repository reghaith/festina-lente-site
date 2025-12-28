'use client';

import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function HelpPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Navbar />
      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <Link
              href="/dashboard"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 mb-4"
            >
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
              Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Help & FAQ
            </h1>
            <p className="text-gray-600">Everything you need to know about earning with EarnFlow</p>
          </div>

          {/* How Earnings Work */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="text-2xl mr-3">💰</span>
              How Earnings Work
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Earning Process</h3>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start">
                    <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mr-3 mt-0.5">1</span>
                    <span>Complete any available surveys or offers</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mr-3 mt-0.5">2</span>
                    <span>Earnings are credited in ef points after approval</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-green-100 text-green-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mr-3 mt-0.5">3</span>
                    <span>Check your dashboard to see updated ef balance</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Point Conversion</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">1 USD from surveys</span>
                      <span className="font-semibold text-green-600">700 ef points</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">1 USD from bonuses</span>
                      <span className="font-semibold text-green-600">1000 ef points</span>
                    </div>
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Example: $1.25 survey</span>
                        <span className="font-medium text-blue-600">875 ef points</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Survey Guidelines */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="text-2xl mr-3">📋</span>
              Survey Guidelines
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Security & Trust</h3>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-3 mt-0.5">🔒</span>
                    <span>All surveys are securely embedded from our trusted partner CPX Research</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-3 mt-0.5">🛡️</span>
                    <span>Your personal information is protected and secure</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-3 mt-0.5">🎯</span>
                    <span>Survey availability changes based on current market research needs</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Best Practices</h3>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-3 mt-0.5">✅</span>
                    <span>Answer honestly and completely for the best experience</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-500 mr-3 mt-0.5">⏱️</span>
                    <span>Survey lengths vary from 5-30 minutes with different reward amounts</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-500 mr-3 mt-0.5">🕐</span>
                    <span>Earnings appear in your account within 24-48 hours after approval</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="text-2xl mr-3">❓</span>
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              <div className="border-b border-gray-100 pb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">How do I start earning?</h3>
                <p className="text-gray-600">Go to the Surveys page from your dashboard and click "Take Survey" on any available survey. Complete the survey in the secure iframe, and your earnings will be credited after approval.</p>
              </div>

              <div className="border-b border-gray-100 pb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">When do I get paid?</h3>
                <p className="text-gray-600">Earnings are credited to your account within 24-48 hours after survey approval. You can withdraw your ef points once you reach the minimum threshold.</p>
              </div>

              <div className="border-b border-gray-100 pb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">What are ef points?</h3>
                <p className="text-gray-600">ef points are EarnFlow's currency. You earn them by completing surveys and offers. They can be converted to cash or other rewards through our withdrawal system.</p>
              </div>

              <div className="border-b border-gray-100 pb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Are surveys safe and legitimate?</h3>
                <p className="text-gray-600">Yes! We partner with CPX Research, a trusted survey platform used by thousands of users worldwide. All surveys are securely embedded and your data is protected.</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I do multiple surveys?</h3>
                <p className="text-gray-600">Absolutely! You can complete as many surveys as you qualify for. Each survey offers different rewards, and there's no limit to how much you can earn.</p>
              </div>
            </div>
          </div>

          {/* Contact Support */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-6 text-white">
            <h2 className="text-2xl font-bold mb-4">Need More Help?</h2>
            <p className="mb-4">If you have any questions or need assistance, don't hesitate to reach out!</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="mailto:support@earnflow.com"
                className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors duration-200 text-center"
              >
                📧 Email Support
              </a>
              <Link
                href="/dashboard"
                className="bg-blue-500 hover:bg-blue-400 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 text-center"
              >
                🏠 Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Navbar() {
  const { user, signOut } = useAuth();

  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href={user ? "/dashboard" : "/"} className="flex items-center space-x-2 group hover:opacity-80 transition-opacity duration-200">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <span className="text-white font-bold text-sm">E</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                EarnFlow
              </span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="/dashboard"
              className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 hover:bg-blue-50"
            >
              Dashboard
            </Link>
            <Link
              href="/help"
              className="text-purple-600 bg-purple-50 px-3 py-2 rounded-lg text-sm font-medium"
            >
              Help
            </Link>
            <button
              onClick={() => signOut()}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}