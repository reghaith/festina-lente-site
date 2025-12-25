'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return; // Do nothing while loading
    if (status === 'unauthenticated') {
      router.push('/login'); // Redirect to login if not authenticated
    } else if (status === 'authenticated' && (session?.user as any)?.role !== 'admin') {
      router.push('/dashboard'); // Redirect if authenticated but not admin
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <main className="main-content">
        <div className="card">
          <p>Loading admin panel...</p>
        </div>
      </main>
    );
  }

  if (status === 'unauthenticated' || (status === 'authenticated' && (session?.user as any)?.role !== 'admin')) {
    return (
      <main className="main-content">
        <div className="card">
          <p>You are not authorized to view this page.</p>
          <Link href="/" className="btn btn-primary" style={{ marginTop: '1rem' }}>Go to Home</Link>
        </div>
      </main>
    );
  }

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <nav className="sidebar-nav">
          <Link href="/admin">Admin Dashboard</Link>
          <Link href="/admin/users">User Management</Link>
          <Link href="/admin/withdrawals">Withdrawal Requests</Link>
          <Link href="/admin/fraud">Fraud Center</Link>
          <Link href="/admin/settings">Security Settings</Link>
        </nav>
      </aside>
      <main className="main-content">{children}</main>
    </div>
  );
}
