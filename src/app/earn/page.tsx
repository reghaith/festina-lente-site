'use client';

import { useSession } from '@/lib/appwrite-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function EarnPage() {
  const { user, loading } = useSession();
  const router = useRouter();

  const [lootablyUrl, setLootablyUrl] = useState('');
  const [cpxAppId, setCpxAppId] = useState('');
  const [cpxHash, setCpxHash] = useState('');
  const [loadingConfig, setLoadingConfig] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (user) {
      fetchAdNetworkConfig();
    }
  }, [loading, user, router]);

  const fetchAdNetworkConfig = async () => {
    setLoadingConfig(true);
    try {
      const res = await fetch('/api/config/ad-networks');
      if (res.ok) {
        const config = await res.json();
        setLootablyUrl(config.lootablyUrl);
        setCpxAppId(config.cpxAppId);
        setCpxHash(config.cpxHash);
      } else {
        console.error('Failed to fetch ad network config');
      }
    } catch (error) {
      console.error('Error fetching ad network config:', error);
    } finally {
      setLoadingConfig(false);
    }
  };

  if (loading || loadingConfig) {
    return (
      <main className="main-content">
        <div className="card">
          <p>Loading earning opportunities...</p>
        </div>
      </main>
    );
  }

  const userId = user?.id;
  const lootablyFinalUrl = lootablyUrl ? `${lootablyUrl}/${userId}` : '';
  const cpxFinalUrl = cpxAppId && cpxHash && userId ? `https://offers.cpx-research.com/index.php?app_id=${cpxAppId}&ext_user_id=${userId}&secure_hash=${cpxHash}` : '';

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <nav className="sidebar-nav">
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/earn" className="active">
            Earn
          </Link>
          <Link href="/withdraw">Withdraw</Link>
          <Link href="/faq">FAQ</Link>
        </nav>
      </aside>

      <main className="main-content">
        <h1 className="page-title">Earn Points</h1>
        <p style={{ marginBottom: '2rem' }}>Complete offers or surveys from our partners to earn points.</p>

        <div className="card" style={{ marginBottom: '2rem' }}>
          <h2>Lootably Offerwall</h2>
          {lootablyFinalUrl ? (
            <iframe src={lootablyFinalUrl} style={{ width: '100%', height: '800px', border: '1px solid #ccc', borderRadius: '8px' }}></iframe>
          ) : (
            <p>Lootably has not been configured by the administrator or URL is missing.</p>
          )}
        </div>

        <div className="card">
          <h2>CPX Research Surveys</h2>
          {cpxFinalUrl ? (
            <iframe src={cpxFinalUrl} style={{ width: '100%', height: '800px', border: '1px solid #ccc', borderRadius: '8px' }}></iframe>
          ) : (
            <p>CPX Research has not been configured by the administrator or details are missing.</p>
          )}
        </div>
      </main>
    </div>
  );
}
