'use client';

import Link from 'next/link';
import { useSession } from '@/lib/appwrite-auth';

export default function Navbar() {
  const { user, loading, logout } = useSession();

  if (loading) {
    return null;
  }

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link href="/" className="logo">
          EarnFlow
        </Link>
        <div className="nav-links">
          {user ? (
            <>
              <Link href="/dashboard" className="btn btn-primary">
                Dashboard
              </Link>
              <button onClick={() => logout()} className="btn">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-primary">
                Login
              </Link>
              <Link href="/register" className="btn btn-secondary">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
