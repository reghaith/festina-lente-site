'use client';

import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Offer {
  id: string;
  title: string;
  description: string;
  reward: number;
  type: 'signup' | 'download' | 'trial';
  company: string;
  completed: boolean;
}

export default function OffersPage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [offers, setOffers] = useState<Offer[]>([
    {
      id: '1',
      title: 'Sign up for Premium Service',
      description: 'Create a free account and get rewarded for your first purchase',
      reward: 150,
      type: 'signup',
      company: 'TechCorp',
      completed: false
    },
    {
      id: '2',
      title: 'Download Mobile App',
      description: 'Install our partner app and complete the welcome tutorial',
      reward: 75,
      type: 'download',
      company: 'AppStore',
      completed: true
    },
    {
      id: '3',
      title: 'Free Trial Subscription',
      description: 'Start a 30-day free trial and earn points when you subscribe',
      reward: 200,
      type: 'trial',
      company: 'StreamPlus',
      completed: false
    },
    {
      id: '4',
      title: 'Credit Card Signup',
      description: 'Apply for a new credit card through our partner and get approved',
      reward: 300,
      type: 'signup',
      company: 'FinanceBank',
      completed: false
    },
    {
      id: '5',
      title: 'Shopping Portal Registration',
      description: 'Sign up for our partner shopping portal and make your first purchase',
      reward: 100,
      type: 'signup',
      company: 'ShopHub',
      completed: false
    },
    {
      id: '6',
      title: 'Gaming App Download',
      description: 'Download and play our partner gaming app for 30 minutes',
      reward: 50,
      type: 'download',
      company: 'GameZone',
      completed: false
    }
  ]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  const completeOffer = (offerId: string) => {
    const offer = offers.find(o => o.id === offerId);
    if (!offer) return;

    // In a real app, this would redirect to the actual offer
    alert(`Starting offer: ${offer.title}\n\nReward: $${offer.reward} points\nCompany: ${offer.company}\n\n(This is a demo - in production this would redirect to the partner offer)`);

    // Mark offer as completed for demo purposes
    setOffers(prev => prev.map(offer =>
      offer.id === offerId ? { ...offer, completed: true } : offer
    ));
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'signup': return 'bg-blue-100 text-blue-800';
      case 'download': return 'bg-green-100 text-green-800';
      case 'trial': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'signup': return '📝';
      case 'download': return '📱';
      case 'trial': return '⏰';
      default: return '🎯';
    }
  };

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:bg-gray-900 transition-colors duration-300">
      <Navbar />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex space-x-3">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                  Dashboard
                </Link>
                <Link
                  href="/help"
                  className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200"
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Help & FAQ
                </Link>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Available Offers
            </h1>
            <p className="text-gray-600">Complete offers from our partners to earn bonus points</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {offers.map((offer) => (
              <div key={offer.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-2xl">{getTypeIcon(offer.type)}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(offer.type)}`}>
                          {offer.type.charAt(0).toUpperCase() + offer.type.slice(1)}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{offer.title}</h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">{offer.description}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">by {offer.company}</p>
                    </div>
                    {offer.completed && (
                      <div className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-sm font-medium">
                        ✓ Completed
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-green-600 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"/>
                      </svg>
                      <span className="text-xl font-bold text-green-600 dark:text-green-400">${offer.reward} ef</span>
                    </div>
                  </div>

                  <button
                    onClick={() => completeOffer(offer.id)}
                    disabled={offer.completed}
                    className={`w-full py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-200 ${
                      offer.completed
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                    }`}
                  >
                    {offer.completed ? 'Completed' : 'Start Offer'}
                  </button>
                </div>
              </div>
            ))}
          </div>


        </div>
      </div>
    </div>
  );
}

function Navbar() {
  const { user, signOut } = useAuth();

  return (
    <nav className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-lg border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 transition-colors duration-300">
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
              href="/offers"
              className="text-green-600 bg-green-50 px-3 py-2 rounded-lg text-sm font-medium"
            >
              Offers
            </Link>
            <Link
              href="/help"
              className="text-gray-700 hover:text-purple-600 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 hover:bg-purple-50"
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