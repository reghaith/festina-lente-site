'use client';

import { useSession } from '@/lib/appwrite-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface UserData {
  id: number;
  name: string | null;
  email: string;
  role: string;
  pointsBalance: number;
  fraudStatus: string;
  flags: { flagType: string; createdAt: string }[];
}

export default function AdminUserManagementPage() {
  const { user, loading } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<UserData[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (user) {
      fetchUsers();
    }
  }, [loading, user, router]);

  const fetchUsers = async () => {
    setError('');
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
      } else {
        setError('Failed to fetch users.');
      }
    } catch (err) {
      setError('An error occurred while fetching users.');
    }
  };

  const handleAction = async (userId: number, action: 'ban' | 'unban' | 'whitelist') => {
    if (!confirm(`Are you sure you want to ${action} this user?`)) return;

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      if (res.ok) {
        fetchUsers(); // Refresh the list
      } else {
        const data = await res.json();
        setError(data.message || `Failed to ${action} user.`);
      }
    } catch (err) {
      setError(`An error occurred while performing ${action} action.`);
    }
  };

  if (loading) {
    return (
      <div className="card">
        <p>Loading users...</p>
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
      <h1 className="page-title">User Management</h1>
      {error && <div className="card" style={{ backgroundColor: '#f8d7da', color: '#721c24', marginBottom: '1rem' }}><p>{error}</p></div>}
      <div className="card">
        <h2>All Users</h2>
        <table className="wp-list-table widefat fixed striped">
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Points</th>
              <th>Fraud Status</th>
              <th>Active Flags</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>{user.pointsBalance.toLocaleString()}</td>
                  <td>
                    <span style={{ color: user.fraudStatus === 'banned' ? 'red' : user.fraudStatus === 'flagged' ? 'orange' : 'green', fontWeight: 'bold' }}>
                      {user.fraudStatus ? user.fraudStatus.charAt(0).toUpperCase() + user.fraudStatus.slice(1) : 'Clean'}
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
                <td colSpan={8}>No users found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
