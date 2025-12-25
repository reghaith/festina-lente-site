'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated') {
      router.push('/login');
    }
    // TODO: Add actual role check here: if (session?.user?.role !== 'admin') router.push('/unauthorized');
  }, [session, status, router]);

  if (status === 'loading' || status === 'unauthenticated') {
    return (
      <div className="card">
        <p>Loading admin dashboard...</p>
      </div>
    );
  }

  return (
    <>
      <h1 className="page-title">Admin Dashboard</h1>
      <div className="card">
        <h2>Welcome, {session?.user?.name || 'Admin'}!</h2>
        <p>This is your central hub for managing the EarnFlow platform.</p>
        <p>Use the sidebar to navigate through different administration sections.</p>
      </div>
      {/* Add more admin-specific widgets/summaries here */}
    </>
  );
}
