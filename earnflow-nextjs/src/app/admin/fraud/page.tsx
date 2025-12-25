'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface FlaggedUser {
  id: number;
  name: string | null;
  email: string;
  fraudStatus: string;
  flags: { flagType: string; createdAt: string }[];
}

interface FraudLog {
  id: number;
  userName: string | null;
  flagType: string;
  flagMeta: string | null;
  createdAt: string;
  isActive: boolean;
}

export default function AdminFraudCenterPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [flaggedUsers, setFlaggedUsers] = useState<FlaggedUser[]>([]);
  const [fraudLogs, setFraudLogs] = useState<FraudLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated' || (session?.user as any)?.role !== 'admin') {
      router.push('/login'); // Redirect if not admin
    } else {
      fetchFraudData();
    }
  }, [session, status, router]);

  const fetchFraudData = async () => {
    setLoading(true);
    setError('');
    try {
      const [usersRes, logsRes] = await Promise.all([
        fetch('/api/admin/fraud'),
        fetch('/api/admin/fraud/logs'),
      ]);

      if (usersRes.ok) {
        const data = await usersRes.json();
        setFlaggedUsers(data.flaggedUsers);
      } else {
        setError('Failed to fetch flagged users.');
      }

      if (logsRes.ok) {
        const data = await logsRes.json();
        setFraudLogs(data.fraudLogs);
      } else {
        setError(prev => prev + ' Failed to fetch fraud logs.');
      }
    } catch (err) {
      setError('An error occurred while fetching fraud data.');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (userId: number, action: 'ban' | 'unban' | 'whitelist') => {
    if (!confirm(`Are you sure you want to ${action} this user?`)) return;

    try {
      const res = await fetch(`/api/admin/fraud/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      if (res.ok) {
        fetchFraudData(); // Refresh the list
      } else {
        const data = await res.json();
        setError(data.message || `Failed to ${action} user.`);
      }
    } catch (err) {
      setError(`An error occurred while performing ${action} action.`);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="card">
        <p>Loading fraud center...</p>
      </div>
    );
  }

  if (status === 'unauthenticated' || (session?.user as any)?.role !== 'admin') {
    return (
      <div className="card">
        <p>You are not authorized to view this page.</p>
        <Link href="/" className="btn btn-primary" style={{ marginTop: '1rem' }}>Go to Home</Link>
      </div>
    );
  }

  return (
    <>
      <h1 className="page-title">Fraud Center</h1>
      {error && <div className="card" style={{ backgroundColor: '#f8d7da', color: '#721c24', marginBottom: '1rem' }}><p>{error}</p></div>}
      
      <div className="card">
        <h2>Flagged & Banned Users</h2>
        <table className="wp-list-table widefat fixed striped">
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Email</th>
              <th>Fraud Status</th>
              <th>Active Flags</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {flaggedUsers.length > 0 ? (
              flaggedUsers.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <span style={{ color: user.fraudStatus === 'banned' ? 'red' : user.fraudStatus === 'flagged' ? 'orange' : 'green', fontWeight: 'bold' }}>
                      {user.fraudStatus.charAt(0).toUpperCase() + user.fraudStatus.slice(1)}
                    </span>
                  </td>
                  <td>
                    {user.flags.length > 0 ? (
                      <ul>
                        {user.flags.map((flag, idx) => (
                          <li key={idx}>{flag.flagType.replace(/_/g, ' ')} ({new Date(flag.createdAt).toLocaleDateString()})</li>
                        ))}
                      </ul>
                    ) : (
                      'None'
                    )}
                  </td>
                  <td>
                    {user.fraudStatus === 'banned' ? (
                      <button onClick={() => handleAction(user.id, 'unban')} className="btn btn-secondary" style={{ marginRight: '0.5rem' }}>Unban</button>
                    ) : (user.fraudStatus === 'whitelisted' ? (
                      <button onClick={() => handleAction(user.id, 'unban')} className="btn btn-secondary" style={{ marginRight: '0.5rem' }}>Un-whitelist</button>
                    ) : (
                      <>
                        <button onClick={() => handleAction(user.id, 'ban')} className="btn btn-primary" style={{ marginRight: '0.5rem' }}>Ban</button>
                        <button onClick={() => handleAction(user.id, 'whitelist')} className="btn">Whitelist</button>
                      </>
                    ))}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6}>No flagged or banned users found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="card" style={{ marginTop: '2rem' }}>
        <h2>Detailed Fraud Log</h2>
        <table className="wp-list-table widefat fixed striped">
          <thead>
            <tr>
              <th>ID</th>
              <th>User</th>
              <th>Flag Type</th>
              <th>Metadata</th>
              <th>Timestamp</th>
              <th>Active</th>
            </tr>
          </thead>
          <tbody>
            {fraudLogs.length > 0 ? (
              fraudLogs.map((log) => (
                <tr key={log.id}>
                  <td>{log.id}</td>
                  <td>{log.userName}</td>
                  <td>{log.flagType.replace(/_/g, ' ')}</td>
                  <td>{log.flagMeta || 'N/A'}</td>
                  <td>{new Date(log.createdAt).toLocaleString()}</td>
                  <td>{log.isActive ? 'Yes' : 'No'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6}>No fraud logs found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
