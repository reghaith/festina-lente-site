'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link href="/" className="logo">
          EarnFlow
        </Link>
        <div className="nav-links">
          {session ? (
            <>
              <Link href="/dashboard" className="btn btn-primary">
                Dashboard
              </Link>
              <button onClick={() => signOut()} className="btn">
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
