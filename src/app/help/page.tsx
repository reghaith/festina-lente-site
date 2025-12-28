'use client';

import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import Navbar from '@/components/Navbar';

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
      <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <LoadingSpinner size="large" text="Loading help..." />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <Navbar />
      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <Link
              href="/dashboard"
              className="inline-flex items-center px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors duration-200 mb-4 shadow-md hover:shadow-lg transform hover:scale-105"
            >
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
              Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-primary mb-2">
              Help & FAQ
            </h1>
            <p className="text-secondary">Everything you need to know about earning with EarnFlow</p>
          </div>

          <div className="bg-surface-primary rounded-xl shadow-xl border border-divider p-6 mb-8">
            <h2 className="text-2xl font-bold text-primary mb-6 flex items-center">
              <span className="text-2xl mr-3">💰</span>
              Earning Process
            </h2>
            <div className="space-y-4">
              <div className="flex items-start">
                <span className="bg-accent text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium mr-4 mt-0.5">1</span>
                <div>
                  <h3 className="text-lg font-semibold text-primary mb-2">Sign Up</h3>
                  <p className="text-secondary">Create your free account and verify your email to start earning.</p>
                </div>
              </div>
              <div className="flex items-start">
                <span className="bg-accent text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium mr-4 mt-0.5">2</span>
                <div>
                  <h3 className="text-lg font-semibold text-primary mb-2">Complete Surveys</h3>
                  <p className="text-secondary">Take surveys from our trusted partners and earn points for each completion.</p>
                </div>
              </div>
              <div className="flex items-start">
                <span className="bg-success text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium mr-4 mt-0.5">3</span>
                <div>
                  <h3 className="text-lg font-semibold text-primary mb-2">Get Paid</h3>
                  <p className="text-secondary">Withdraw your earnings to PayPal, bank transfer, or other payment methods.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-accent rounded-xl shadow-xl p-6 text-white">
            <h2 className="text-2xl font-bold mb-4">Need More Help?</h2>
            <p className="mb-4">If you have any questions or need assistance, don&apos;t hesitate to reach out!</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="mailto:support@earnflow.com"
                className="bg-surface-primary text-accent border border-accent px-6 py-3 rounded-lg font-semibold hover:bg-surface-secondary transition-colors duration-200 text-center"
              >
                📧 Email Support
              </a>
              <Link
                href="/dashboard"
                className="bg-white text-accent px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200 text-center shadow-md hover:shadow-lg"
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