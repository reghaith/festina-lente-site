'use client';

import { AuthProvider } from '@/lib/appwrite-auth';
import Navbar from '@/components/Navbar';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <Navbar />
      {children}
    </AuthProvider>
  );
}