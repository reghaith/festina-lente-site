'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface WithdrawalData {
  id: number;
  userId: number;
  userName: string | null;
  pointsRequested: number;
  amountUsd: number;
  paymentMethod: string;
  paymentAddress: string;
  status: string;
  requestedAt: string;
  processedAt: string | null;
}

export default function AdminWithdrawalRequestsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [withdrawals, setWithdrawals] = useState<WithdrawalData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated' || (session?.user as any)?.role !== 'admin') {
      router.push('/login'); // Redirect if not admin
    } else {
      fetchWithdrawals();
    }
  }, [session, status, router]);

  const fetchWithdrawals = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/withdrawals');
      if (res.ok) {
        const data = await res.json();
        setWithdrawals(data.withdrawals);
      } else {
        setError('Failed to fetch withdrawals.');
      }
    } catch (err) {
      setError('An error occurred while fetching withdrawals.');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (withdrawalId: number, action: 'approve' | 'reject') => {
    if (!confirm(`Are you sure you want to ${action} this withdrawal request?`)) return;

    try {
      const res = await fetch(`/api/admin/withdrawals/${withdrawalId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      if (res.ok) {
        fetchWithdrawals(); // Refresh the list
      } else {
        const data = await res.json();
        setError(data.message || `Failed to ${action} withdrawal.`);
      }
    } catch (err) {
      setError(`An error occurred while performing ${action} action.`);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="card">
        <p>Loading withdrawal requests...</p>
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
      <h1 className="page-title">Withdrawal Requests</h1>
      {error && <div className="card" style={{ backgroundColor: '#f8d7da', color: '#721c24', marginBottom: '1rem' }}><p>{error}</p></div>}
      <div className="card">
        <h2>All Requests</h2>
        <table className="wp-list-table widefat fixed striped">
          <thead>
            <tr>
              <th>ID</th>
              <th>User</th>
              <th>Points</th>
              <th>Amount (USD)</th>
              <th>Method</th>
              <th>Address</th>
              <th>Status</th>
              <th>Requested At</th>
              <th>Processed At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {withdrawals.length > 0 ? (
              withdrawals.map((withdrawal) => (
                <tr key={withdrawal.id}>
                  <td>{withdrawal.id}</td>
                  <td>{withdrawal.userName} (ID: {withdrawal.userId})</td>
                  <td>{withdrawal.pointsRequested.toLocaleString()}</td>
                  <td>${withdrawal.amountUsd.toFixed(2)}</td>
                  <td>{withdrawal.paymentMethod}</td>
                  <td>{withdrawal.paymentAddress}</td>
                  <td>
                    <span style={{ color: withdrawal.status === 'approved' ? 'green' : withdrawal.status === 'rejected' ? 'red' : 'orange', fontWeight: 'bold' }}>
                      {withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1)}
                    </span>
                  </td>
                  <td>{new Date(withdrawal.requestedAt).toLocaleString()}</td>
                  <td>{withdrawal.processedAt ? new Date(withdrawal.processedAt).toLocaleString() : 'N/A'}</td>
                  <td>
                    {withdrawal.status === 'pending' ? (
                      <>
                        <button onClick={() => handleAction(withdrawal.id, 'approve')} className="btn btn-primary" style={{ marginRight: '0.5rem' }}>Approve</button>
                        <button onClick={() => handleAction(withdrawal.id, 'reject')} className="btn btn-secondary">Reject</button>
                      </>
                    ) : (
                      'Processed'
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={10}>No withdrawal requests found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
