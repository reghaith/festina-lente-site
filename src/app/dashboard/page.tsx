'use client';

import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import Navbar from '@/components/Navbar';

export default function DashboardPage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [userBalance, setUserBalance] = useState({
    available_balance: 0,
    pending_balance: 0,
    total_earned: 0
  });
  const [loadingBalance, setLoadingBalance] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  useEffect(() => {
    const fetchBalance = async () => {
      if (!user) return;

      try {
        const response = await fetch(`/api/balance?userId=${user.id}`);
        const data = await response.json();

        if (data.success) {
          setUserBalance(data.balance);
        }
      } catch (error) {
        console.error('Failed to fetch balance:', error);
      } finally {
        setLoadingBalance(false);
      }
    };

    fetchBalance();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <LoadingSpinner size="large" text="Loading your dashboard..." />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <Navbar />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex space-x-3">
                <Link
                  href="/surveys"
                  className="inline-flex items-center px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" clipRule="evenodd" />
                  </svg>
                  Surveys
                </Link>
                <Link
                  href="/offers"
                  className="inline-flex items-center px-4 py-2 bg-warning text-white rounded-lg hover:bg-warning transition-colors duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0v-1H3a1 1 0 010-2h1v-1a1 1 0 011-1zM12 2a1 1 0 010 2h3a1 1 0 011 1v3h1a1 1 0 010 2h-1v1a1 1 0 01-2 0v-1h-3a1 1 0 010-2h1V6a1 1 0 00-1-1h-1a1 1 0 010-2h1zm0 10a1 1 0 010 2h3a1 1 0 011 1v3h1a1 1 0 010 2h-1v1a1 1 0 01-2 0v-1h-3a1 1 0 010-2h1v-1a1 1 0 00-1-1h-1a1 1 0 010-2h1z" clipRule="evenodd" />
                  </svg>
                  Offers
                </Link>
                <Link
                  href="/withdraw"
                  className="inline-flex items-center px-4 py-2 bg-success text-white rounded-lg hover:bg-success transition-colors duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  Withdraw
                </Link>
                <Link
                  href="/help"
                  className="inline-flex items-center px-4 py-2 bg-warning text-white rounded-lg hover:bg-warning transition-colors duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Help & FAQ
                </Link>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-primary mb-2">
              Dashboard
            </h1>
            <p className="text-secondary">Track your earnings and manage your account</p>
          </div>
          {/* Welcome Section */}
          <div className="bg-surface-primary rounded-xl shadow-xl border border-divider p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-primary">Welcome back, {user.name || user.email?.split('@')[0] || 'User'}! 👋</h2>
                <p className="text-secondary">Ready to earn more today? Check out your progress below.</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-success">
                  {loadingBalance ? '...' : userBalance.available_balance.toFixed(0)} ef
                </div>
                <div className="text-sm text-muted">
                  Available balance
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Points Balance Card */}
            <div className="bg-surface-primary overflow-hidden shadow-xl rounded-xl border border-divider hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"/>
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                     <dl>
                       <dt className="text-sm font-medium text-muted">
                         Points Balance
                       </dt>
                       <dd className="text-2xl font-bold text-primary mt-1">
                         {loadingBalance ? '...' : userBalance.available_balance.toFixed(0)} ef
                       </dd>
                     </dl>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Next reward at 100 points</span>
                    <span>0%</span>
                  </div>
                  <div className="mt-2 bg-gray-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full transition-all duration-300" style={{ width: '0%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Completed Surveys Card */}
            <div className="bg-surface-primary overflow-hidden shadow-xl rounded-xl border border-divider hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-muted truncate">
                        Completed Surveys
                      </dt>
                      <dd className="text-2xl font-bold text-primary mt-1">
                        0
                      </dd>
                    </dl>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs text-muted">
                    <span>This month</span>
                    <span>0/5 goal</span>
                  </div>
                  <div className="mt-2 bg-surface-secondary rounded-full h-2">
                    <div className="bg-gradient-to-r from-blue-400 to-indigo-500 h-2 rounded-full transition-all duration-300" style={{ width: '0%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Total Earned Card */}
            <div className="bg-surface-primary overflow-hidden shadow-xl rounded-xl border border-divider hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-muted truncate">
                        Total Earned
                      </dt>
                      <dd className="text-2xl font-medium text-primary">
                        {loadingBalance ? '...' : userBalance.total_earned.toFixed(0)} ef
                      </dd>
                    </dl>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs text-muted">
                    <span>Lifetime earnings</span>
                    <span>$5.00 goal</span>
                  </div>
                  <div className="mt-2 bg-surface-secondary rounded-full h-2">
                    <div className="bg-gradient-to-r from-purple-400 to-pink-500 h-2 rounded-full transition-all duration-300" style={{ width: '0%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <div className="bg-surface-primary shadow-xl rounded-xl border border-divider overflow-hidden">
              <div className="px-6 py-5 sm:p-6">
                <h3 className="text-xl font-bold text-primary mb-6 flex items-center">
                  <svg className="w-6 h-6 text-blue-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Quick Actions
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Link href="/surveys" className="group bg-accent hover:bg-accent-hover text-white px-6 py-4 rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2 group-hover:animate-bounce" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                    Take Survey
                  </Link>
                  <Link href="/offers" className="group bg-success hover:bg-success text-white px-6 py-4 rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2 group-hover:animate-bounce" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z" clipRule="evenodd" />
                    </svg>
                    View Offers
                  </Link>
                  <Link href="/withdraw" className="group bg-warning hover:bg-warning text-white px-6 py-4 rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2 group-hover:animate-bounce" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"/>
                    </svg>
                    Withdraw Funds
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


