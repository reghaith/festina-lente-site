'use client';

import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Survey {
  id: string;
  title: string;
  description: string;
  reward: number;
  time: string;
  completed: boolean;
}

export default function SurveysPage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [surveys, setSurveys] = useState<Survey[]>([
    {
      id: '1',
      title: 'Product Feedback Survey',
      description: 'Help us improve our products by sharing your feedback',
      reward: 25,
      time: '5 min',
      completed: false
    },
    {
      id: '2',
      title: 'Lifestyle Preferences',
      description: 'Tell us about your daily habits and preferences',
      reward: 30,
      time: '7 min',
      completed: false
    },
    {
      id: '3',
      title: 'Tech Usage Survey',
      description: 'Share your technology usage patterns',
      reward: 20,
      time: '4 min',
      completed: true
    },
    {
      id: '4',
      title: 'Entertainment Survey',
      description: 'What are your favorite entertainment options?',
      reward: 35,
      time: '8 min',
      completed: false
    }
  ]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  const takeSurvey = (surveyId: string) => {
    // In a real app, this would navigate to the actual survey
    alert(`Starting survey: ${surveys.find(s => s.id === surveyId)?.title}\n\nReward: $${surveys.find(s => s.id === surveyId)?.reward} points\n\n(This is a demo - in production this would open the actual survey)`);

    // Mark survey as completed for demo purposes
    setSurveys(prev => prev.map(survey =>
      survey.id === surveyId ? { ...survey, completed: true } : survey
    ));
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Navbar />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Available Surveys
            </h1>
            <p className="text-gray-600">Complete surveys to earn points and rewards</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {surveys.map((survey) => (
              <div key={survey.id} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{survey.title}</h3>
                      <p className="text-gray-600 text-sm mb-4">{survey.description}</p>
                    </div>
                    {survey.completed && (
                      <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                        ✓ Completed
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-green-600 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"/>
                        </svg>
                        <span className="text-lg font-bold text-green-600">${survey.reward}</span>
                      </div>
                      <div className="flex items-center text-gray-500">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm">{survey.time}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => takeSurvey(survey.id)}
                    disabled={survey.completed}
                    className={`w-full py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-200 ${
                      survey.completed
                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                    }`}
                  >
                    {survey.completed ? 'Completed' : 'Take Survey'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Survey Guidelines</h3>
            <ul className="space-y-2 text-gray-600 text-sm">
              <li>• Answer honestly for the best experience</li>
              <li>• Complete surveys in one sitting when possible</li>
              <li>• Points are credited immediately after completion</li>
              <li>• Survey availability may change over time</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function Navbar() {
  const { signOut } = useAuth();

  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2 group">
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