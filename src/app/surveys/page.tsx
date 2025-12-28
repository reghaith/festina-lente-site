'use client';

import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface Survey {
  id: string;
  title: string;
  description: string;
  reward: number;
  time: string;
  status?: string;
  country?: string;
  category?: string;
  completed: boolean;
}

export default function SurveysPage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loadingSurveys, setLoadingSurveys] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSurvey, setSelectedSurvey] = useState<string | null>(null);
  const [iframeUrl, setIframeUrl] = useState<string>('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  useEffect(() => {
    // Load mock surveys for demonstration
    // In production, you might show available offers or categories
    setSurveys([
      {
        id: 'cpx_offers',
        title: 'CPX Research Surveys',
            description: 'Complete surveys and offers from our trusted partner CPX Research. Earn ef points for sharing your opinions.',
        reward: 0, // Variable rewards
        time: '5-30 min',
        completed: false,
        category: 'All Categories'
      }
    ]);
    setLoadingSurveys(false);
  }, []);

  const takeSurvey = async (surveyId: string) => {
    if (!user) return;

    try {
      const response = await fetch(`/api/cpx/redirect?userId=${user.id}`);
      const data = await response.json();

      if (data.success) {
        setSelectedSurvey(surveyId);
        setIframeUrl(data.iframeUrl);
      } else {
        // Handle error silently or show a better UI notification
        console.error('Failed to load surveys');
      }
    } catch (error) {
      console.error('Failed to load surveys:', error);
    }
  };

  const closeIframe = () => {
    setSelectedSurvey(null);
    setIframeUrl('');
    // Refresh surveys list
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <LoadingSpinner size="large" text="Loading surveys..." />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (loadingSurveys) {
    return (
      <div className="min-h-screen bg-background transition-colors duration-300">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <LoadingSpinner size="large" text="Loading available surveys..." />
          </div>
        </div>
      </div>
    );
  }

  if (selectedSurvey && iframeUrl) {
    return (
      <div className="min-h-screen bg-background transition-colors duration-300">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-primary">Complete Surveys</h1>
                <p className="text-secondary">Earn money by completing surveys below</p>
              </div>
              <button
                onClick={closeIframe}
                className="bg-disabled hover:bg-disabled text-muted px-4 py-2 rounded-lg font-medium"
              >
                ← Back to Surveys
              </button>
            </div>

            <div className="bg-surface-primary rounded-xl shadow-xl border border-divider overflow-hidden">
              <iframe
                src={iframeUrl}
                width="100%"
                height="600"
                frameBorder="0"
                className="w-full min-h-[600px] sm:min-h-[700px] md:min-h-[800px]"
                title="CPX Research Surveys"
              />
            </div>

          </div>
        </div>
      </div>
    );
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
                  href="/dashboard"
                  className="inline-flex items-center px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                  Dashboard
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
              Available Surveys
            </h1>
            <p className="text-secondary">
              Complete surveys from our trusted partner CPX Research to earn real money
              {error && <span className="text-error ml-2">(Using demo data)</span>}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {surveys.map((survey) => (
              <div key={survey.id} className="bg-surface-primary rounded-xl shadow-xl border border-divider overflow-hidden hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{survey.title}</h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">{survey.description}</p>
                    </div>
                    {survey.completed && (
                      <div className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-sm font-medium">
                        ✓ Completed
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center justify-between">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-green-600 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"/>
                        </svg>
                        <span className="text-lg font-bold text-green-600">Variable Payouts (ef)</span>
                      </div>
                      <div className="flex items-center text-gray-500">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm">{survey.time}</span>
                      </div>
                    </div>
                    <div className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full">
                      🔒 Secure Platform
                    </div>
                  </div>
                    {survey.category && (
                      <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full">
                        {survey.category}
                      </span>
                    )}
                  </div>
                  </div>

                  <button
                    onClick={() => takeSurvey(survey.id)}
                    disabled={survey.completed}
                    className={`w-full py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-200 ${
                      survey.completed
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                    }`}
                  >
                    {survey.completed ? 'Completed' : 'Take Survey'}
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
              href="/surveys"
              className="text-blue-600 bg-blue-50 px-3 py-2 rounded-lg text-sm font-medium"
            >
              Surveys
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