'use client';

import { useSession } from '@/lib/appwrite-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminDashboardPage() {
  const { user, loading } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  if (loading || !user) {
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
        <h2>Welcome, {user?.name || 'Admin'}!</h2>
        <p>This is your central hub for managing the EarnFlow platform.</p>
        <p>Use the sidebar to navigate through different administration sections.</p>
      </div>
    </>
  );
}
