'use client';

import { useSession } from '@/lib/appwrite-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface SecuritySettings {
  ipApiKey: string;
  maxEarningsPerDay: number;
  maxOffersPerHour: number;
  minAccountAgeWithdraw: number;
}

export default function AdminSecuritySettingsPage() {
  const { user, loading } = useSession();
  const router = useRouter();
  const [settings, setSettings] = useState<SecuritySettings | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (user) {
      fetchSettings();
    }
  }, [loading, user, router]);

  const fetchSettings = async () => {
    setError('');
    try {
      const res = await fetch('/api/admin/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(data.settings);
      } else {
        setError('Failed to fetch settings.');
      }
    } catch (err) {
      setError('An error occurred while fetching settings.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        setSuccess('Settings updated successfully!');
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to update settings.');
      }
    } catch (err) {
      setError('An error occurred while updating settings.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="card">
        <p>Loading security settings...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="card">
        <p>You are not authorized to view this page.</p>
        <Link href="/" className="btn btn-primary" style={{ marginTop: '1rem' }}>Go to Home</Link>
      </div>
    );
  }

  return (
    <>
      <h1 className="page-title">Security Settings</h1>
      {error && <div className="card" style={{ backgroundColor: '#f8d7da', color: '#721c24', marginBottom: '1rem' }}><p>{error}</p></div>}
      {success && <div className="card" style={{ backgroundColor: '#d4edda', color: '#155724', marginBottom: '1rem' }}><p>{success}</p></div>}
      
      <div className="card">
        <h2>Anti-Fraud Configuration</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="ipApiKey">IP Intelligence API Key</label>
            <input
              type="text"
              id="ipApiKey"
              className="form-control"
              value={settings?.ipApiKey || ''}
              onChange={(e) => setSettings({ ...settings!, ipApiKey: e.target.value })}
            />
            <p className="description">API key for your chosen IP intelligence service (e.g., IPinfo, AbstractAPI). Leave blank to disable VPN/proxy checks.</p>
          </div>

          <div className="form-group">
            <label htmlFor="maxEarningsPerDay">Max Earnings Per Day (Points)</label>
            <input
              type="number"
              id="maxEarningsPerDay"
              className="form-control"
              value={settings?.maxEarningsPerDay || 0}
              onChange={(e) => setSettings({ ...settings!, maxEarningsPerDay: parseInt(e.target.value) || 0 })}
            />
            <p className="description">Maximum number of points a single user can earn in a 24-hour period.</p>
          </div>

          <div className="form-group">
            <label htmlFor="maxOffersPerHour">Max Offers Per Hour</label>
            <input
              type="number"
              id="maxOffersPerHour"
              className="form-control"
              value={settings?.maxOffersPerHour || 0}
              onChange={(e) => setSettings({ ...settings!, maxOffersPerHour: parseInt(e.target.value) || 0 })}
            />
            <p className="description">Maximum number of offers a single user can complete in a 1-hour period.</p>
          </div>

          <div className="form-group">
            <label htmlFor="minAccountAgeWithdraw">Minimum Account Age for Withdrawal (Days)</label>
            <input
              type="number"
              id="minAccountAgeWithdraw"
              className="form-control"
              value={settings?.minAccountAgeWithdraw || 0}
              onChange={(e) => setSettings({ ...settings!, minAccountAgeWithdraw: parseInt(e.target.value) || 0 })}
            />
            <p className="description">The minimum number of days a user account must exist before they can request a withdrawal.</p>
          </div>

          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Saving...' : 'Save Settings'}
          </button>
        </form>
      </div>
    </>
  );
}
