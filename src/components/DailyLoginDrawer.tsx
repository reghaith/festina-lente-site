'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';

interface DailyLoginDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DailyStatus {
  claimedToday: boolean;
  streak: number;
  todaysReward: number;
  lastClaim: string | null;
}

export function DailyLoginDrawer({ isOpen, onClose }: DailyLoginDrawerProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('daily');
  const [dailyStatus, setDailyStatus] = useState<DailyStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDailyStatus = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/daily/claim?userId=${user.id}`);
      const data = await response.json();

      if (data.success) {
        setDailyStatus(data);
        setError(null);
      } else {
        setError(data.error || 'Failed to load daily status');
        console.error('API Error:', data.error);
      }
    } catch (error) {
      setError('Network error - check database connection');
      console.error('Network Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const claimDailyReward = async () => {
    if (!user?.id || claiming) return;

    try {
      setClaiming(true);
      setError(null);
      const response = await fetch('/api/daily/claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id }),
      });

      const data = await response.json();

      if (data.success) {
        // Refresh status to show updated data
        await fetchDailyStatus();
        // Could add a success animation or toast here
      } else {
        setError(data.error || 'Failed to claim daily reward');
        console.error('Claim failed:', data.error);
      }
    } catch (error) {
      setError('Network error - check database connection');
      console.error('Failed to claim daily reward:', error);
    } finally {
      setClaiming(false);
    }
  };

  useEffect(() => {
    if (isOpen && user?.id) {
      fetchDailyStatus();
    }
  }, [isOpen, user?.id]);

  if (!user) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed left-0 top-0 h-full w-80 max-w-[90vw] bg-background border-r border-divider shadow-2xl z-50 transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-divider">
            <h2 className="text-xl font-bold text-primary">Daily Earn</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-surface-primary hover:bg-surface-secondary border border-divider flex items-center justify-center transition-colors duration-200"
            >
              <svg className="w-4 h-4 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-divider">
            <button
              onClick={() => setActiveTab('daily')}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors duration-200 ${
                activeTab === 'daily'
                  ? 'text-accent border-b-2 border-accent bg-surface-secondary'
                  : 'text-secondary hover:text-primary hover:bg-surface-secondary'
              }`}
            >
              Daily
            </button>
            <button
              onClick={() => setActiveTab('achievements')}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors duration-200 ${
                activeTab === 'achievements'
                  ? 'text-accent border-b-2 border-accent bg-surface-secondary'
                  : 'text-secondary hover:text-primary hover:bg-surface-secondary'
              }`}
            >
              Achievements
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'daily' && (
              <div className="space-y-6">
                {/* Daily Status Card */}
                <div className="bg-surface-primary rounded-xl border border-divider p-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>

                    {loading ? (
                      <div className="animate-pulse">
                        <div className="h-6 bg-surface-secondary rounded w-32 mx-auto mb-2"></div>
                        <div className="h-4 bg-surface-secondary rounded w-24 mx-auto"></div>
                      </div>
                    ) : error ? (
                      <div className="text-center">
                        <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="w-8 h-8 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-bold text-error mb-2">Connection Error</h3>
                        <p className="text-secondary text-sm mb-4">{error}</p>
                        <button
                          onClick={fetchDailyStatus}
                          className="bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors duration-200"
                        >
                          Try Again
                        </button>
                      </div>
                    ) : dailyStatus ? (
                      <>
                        <h3 className="text-lg font-bold text-primary mb-2">
                          {dailyStatus.claimedToday ? 'Already Earned!' : 'Ready to Earn'}
                        </h3>
                        <p className="text-secondary text-sm mb-4">
                          Earn streak: {dailyStatus.streak} days
                        </p>
                        <div className="text-2xl font-bold text-success mb-4">
                          +{dailyStatus.todaysReward} EXP
                        </div>

                        <button
                          onClick={claimDailyReward}
                          disabled={dailyStatus.claimedToday || claiming}
                          className={`w-full py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-200 ${
                            dailyStatus.claimedToday
                              ? 'bg-disabled text-muted cursor-not-allowed'
                              : claiming
                              ? 'bg-accent text-white cursor-wait'
                              : 'bg-success hover:bg-success text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                          }`}
                        >
                          {claiming
                            ? 'Claiming...'
                            : dailyStatus.claimedToday
                            ? '✓ Claimed Today'
                            : 'Earn'
                          }
                        </button>
                      </>
                    ) : (
                      <div className="text-secondary">Loading daily status...</div>
                    )}
                  </div>
                </div>

                {/* Streak Info */}
                <div className="bg-surface-primary rounded-xl border border-divider p-4">
                  <h4 className="text-sm font-semibold text-primary mb-2">Earn Streak</h4>
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      {[...Array(7)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-3 h-3 rounded-full ${
                            (dailyStatus?.streak || 0) > i
                              ? 'bg-success'
                              : 'bg-surface-secondary'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-secondary">
                      {dailyStatus?.streak || 0}/7 days
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'achievements' && (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-secondary mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <h3 className="text-lg font-bold text-primary mb-2">Coming Soon</h3>
                <p className="text-secondary text-sm">Achievement system will be available soon!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}