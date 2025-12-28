'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { ThemeToggle } from './ThemeToggle';

export default function Navbar() {
  const { user, loading, signOut } = useAuth();

  if (loading) {
    return null;
  }

  return (
    <nav className="bg-surface-primary backdrop-blur-md shadow-lg border-b border-divider sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link
              href={user ? "/dashboard" : "/"}
              className="flex items-center space-x-2 group hover:opacity-80 transition-opacity duration-200"
            >
              <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <span className="text-white font-bold text-sm">E</span>
              </div>
              <span className="text-xl font-bold text-accent">
                EarnFlow
              </span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />

            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-secondary hover:text-accent px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 hover:bg-surface-secondary"
                >
                  Dashboard
                </Link>
                <Link
                  href="/surveys"
                  className="text-accent bg-surface-secondary px-3 py-2 rounded-lg text-sm font-medium"
                >
                  Surveys
                </Link>
                <Link
                  href="/help"
                  className="text-secondary hover:text-accent px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 hover:bg-surface-secondary"
                >
                  Help
                </Link>
                <button
                  onClick={() => signOut()}
                  className="bg-error hover:bg-error text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-secondary hover:text-accent px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 hover:bg-surface-secondary"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
