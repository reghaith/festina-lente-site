'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Withdrawal {
  id: number;
  pointsRequested: number;
  amountUsd: number;
  paymentMethod: string;
  paymentAddress: string;
  status: string;
  requestedAt: string;
  processedAt: string | null;
}

export default function WithdrawPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [pointsBalance, setPointsBalance] = useState<number | null>(null);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [pointsAmount, setPointsAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('PayPal');
  const [paymentAddress, setPaymentAddress] = useState('');

  const MIN_WITHDRAWAL_POINTS = 5000; // $5

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchWithdrawalData();
    }
  }, [status, router]);

  const fetchWithdrawalData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/user/withdrawals');
      if (res.ok) {
        const data = await res.json();
        setPointsBalance(data.pointsBalance);
        setWithdrawals(data.withdrawals);
      } else {
        console.error('Failed to fetch withdrawal data');
        setError('Failed to load withdrawal data.');
      }
    } catch (error) {
      console.error('Error fetching withdrawal data:', error);
      setError('Error loading withdrawal data.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setFormLoading(true);

    const parsedPoints = parseInt(pointsAmount);

    if (isNaN(parsedPoints) || parsedPoints < MIN_WITHDRAWAL_POINTS) {
      setError(`Minimum withdrawal is ${MIN_WITHDRAWAL_POINTS} points.`);
      setFormLoading(false);
      return;
    }
    if (pointsBalance !== null && parsedPoints > pointsBalance) {
      setError('Insufficient points balance.');
      setFormLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pointsAmount: parsedPoints,
          paymentMethod,
          paymentAddress,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(data.message || 'Withdrawal request submitted successfully!');
        setPointsAmount('');
        setPaymentAddress('');
        fetchWithdrawalData(); // Refresh data
      } else {
        setError(data.message || 'Failed to submit withdrawal request.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setFormLoading(false);
    }
  };

  const hasPendingWithdrawal = withdrawals.some(w => w.status === 'pending');
  const canWithdraw = pointsBalance !== null && pointsBalance >= MIN_WITHDRAWAL_POINTS && !hasPendingWithdrawal && !formLoading;

  if (status === 'loading' || loading) {
    return (
      <main className="main-content">
        <div className="card">
          <p>Loading withdrawal page...</p>
        </div>
      </main>
    );
  }

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <nav className="sidebar-nav">
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/earn">Earn</Link>
          <Link href="/withdraw" className="active">
            Withdraw
          </Link>
          <Link href="/faq">FAQ</Link>
        </nav>
      </aside>

      <main className="main-content">
        <h1 className="page-title">Withdraw Earnings</h1>

        {error && <div className="card" style={{ backgroundColor: '#f8d7da', color: '#721c24', marginBottom: '1rem' }}><p>{error}</p></div>}
        {success && <div className="card" style={{ backgroundColor: '#d4edda', color: '#155724', marginBottom: '1rem' }}><p>{success}</p></div>}
        
        <div className="card">
          <h3>Your Balance</h3>
          <p style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--primary-color)' }}>
            {pointsBalance !== null ? pointsBalance.toLocaleString() : '...'} Points
          </p>
          <p style={{ marginTop: '1rem', color: '#6B7280' }}>
            Note: Minimum withdrawal is {MIN_WITHDRAWAL_POINTS.toLocaleString()} points (${(MIN_WITHDRAWAL_POINTS / 1000).toFixed(2)}).
          </p>
        </div>

        <div className="card">
          <h3>Request Withdrawal</h3>
          {hasPendingWithdrawal ? (
            <p>You have a withdrawal request that is currently pending. Please wait for it to be processed before making a new one.</p>
          ) : (
            <form style={{ marginTop: '2rem' }} onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="pointsAmount">Amount (in points)</label>
                <input
                  type="number"
                  id="pointsAmount"
                  className="form-control"
                  placeholder={`e.g., ${MIN_WITHDRAWAL_POINTS}`}
                  min={MIN_WITHDRAWAL_POINTS}
                  max={pointsBalance !== null ? pointsBalance : undefined}
                  required
                  value={pointsAmount}
                  onChange={(e) => setPointsAmount(e.target.value)}
                  disabled={!canWithdraw}
                />
              </div>
              <div className="form-group">
                <label htmlFor="paymentMethod">Payment Method</label>
                <select
                  id="paymentMethod"
                  className="form-control"
                  required
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  disabled={!canWithdraw}
                >
                  <option value="PayPal">PayPal</option>
                  <option value="USDT_TRC20">USDT (TRC20)</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="paymentAddress">Payment Address (PayPal Email or USDT Address)</label>
                <input
                  type="text"
                  id="paymentAddress"
                  className="form-control"
                  required
                  value={paymentAddress}
                  onChange={(e) => setPaymentAddress(e.target.value)}
                  disabled={!canWithdraw}
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={!canWithdraw}>
                {formLoading ? 'Submitting...' : (pointsBalance !== null && pointsBalance < MIN_WITHDRAWAL_POINTS ? 'Insufficient Points' : 'Request Withdrawal')}
              </button>
            </form>
          )}
        </div>

        <div className="card">
          <h3>Withdrawal History</h3>
          {withdrawals.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left' }}>
                  <th style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>Date</th>
                  <th style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>Amount</th>
                  <th style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>Method</th>
                  <th style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.map((w) => (
                  <tr key={w.id}>
                    <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{new Date(w.requestedAt).toLocaleDateString()}</td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>${w.amountUsd.toFixed(2)}</td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{w.paymentMethod}</td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{w.status.charAt(0).toUpperCase() + w.status.slice(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No withdrawal history.</p>
          )}
        </div>
      </main>
    </div>
  );
}
