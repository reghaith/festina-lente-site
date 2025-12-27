'use client';

import { useSession } from '@/lib/appwrite-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface PointLog {
  action: string;
  points: number;
  createdAt: string;
}

export default function DashboardPage() {
  const { user, loading } = useSession();
  const router = useRouter();
  const [pointsBalance, setPointsBalance] = useState<number | null>(null);
  const [recentLogs, setRecentLogs] = useState<PointLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (user) {
      fetchDashboardData();
    }
  }, [loading, user, router]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/user/dashboard');
      if (res.ok) {
        const data = await res.json();
        setPointsBalance(data.pointsBalance);
        setRecentLogs(data.recentLogs);
      } else {
        console.error('Failed to fetch dashboard data');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="main-content">
        <div className="card">
          <p>Loading dashboard...</p>
        </div>
      </main>
    );
  }

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <nav className="sidebar-nav">
          <Link href="/dashboard" className="active">
            Dashboard
          </Link>
          <Link href="/earn">Earn</Link>
          <Link href="/withdraw">Withdraw</Link>
          <Link href="/faq">FAQ</Link>
        </nav>
      </aside>

      <main className="main-content">
        <h1 className="page-title">Dashboard</h1>
        <div className="card">
          <h3>Points Balance</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 600, color: 'var(--primary-color)' }}>
            {pointsBalance !== null ? pointsBalance.toLocaleString() : '...'}
          </p>
          <p>Equivalent to ${pointsBalance !== null ? (pointsBalance / 1000).toFixed(2) : '...'}</p>
        </div>
        <div className="card">
          <h3>Recent Transactions</h3>
          {recentLogs.length > 0 ? (
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {recentLogs.map((log, index) => (
                <li
                  key={index}
                  style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #eee' }}
                >
                  <span>{log.action.replace(/_/g, ' ')}</span>
                  <strong>
                    <span style={{ color: log.points >= 0 ? 'var(--secondary-color)' : 'red' }}>
                      {log.points >= 0 ? '+' : ''}
                      {log.points.toLocaleString()}
                    </span>
                  </strong>
                </li>
              ))}
            </ul>
          ) : (
            <p>No transactions yet.</p>
          )}
        </div>
      </main>
    </div>
  );
}
