'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth';
import { usePathname } from 'next/navigation';

interface FloatingActionButtonProps {
  onClick: () => void;
  isOpen: boolean;
}

export function FloatingActionButton({ onClick, isOpen }: FloatingActionButtonProps) {
  const { user } = useAuth();
  const pathname = usePathname();
  const [mouseInDashboardArea, setMouseInDashboardArea] = useState(false);

  // Only show for authenticated users
  if (!user) return null;

  // Track mouse position to detect if it's over dashboard content area
  useEffect(() => {
    if (pathname !== '/dashboard') return;

    const handleMouseMove = (e: MouseEvent) => {
      // Check if mouse is within dashboard content area bounds
      // Dashboard content area is typically centered with padding
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // Approximate dashboard content area (centered, with margins)
      const contentLeft = Math.max(16, viewportWidth * 0.05); // 5% margin or 16px min
      const contentRight = Math.min(viewportWidth - 16, viewportWidth * 0.95);
      const contentTop = 120; // Below navbar/header area
      const contentBottom = viewportHeight - 32; // Above bottom margin

      const inArea = e.clientX >= contentLeft &&
                     e.clientX <= contentRight &&
                     e.clientY >= contentTop &&
                     e.clientY <= contentBottom;

      setMouseInDashboardArea(inArea);
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, [pathname]);

  // Only show glow effect on dashboard when mouse is in content area
  const showGlow = pathname === '/dashboard' && mouseInDashboardArea;

  return (
    <div className="fixed left-6 top-1/2 transform -translate-y-1/2 z-40">
      <button
        onClick={onClick}
        className={`
          relative w-14 h-14 rounded-full
          bg-accent hover:bg-accent-hover
          border border-divider
          shadow-xl hover:shadow-2xl
          transform hover:scale-110
          transition-all duration-300 ease-out
          group overflow-hidden
          ${isOpen ? 'rotate-180' : ''}
        `}
        title="Daily Earn & Rewards"
      >
        {/* Orbiting white semi-circle */}
        <div className="absolute inset-0 rounded-full overflow-hidden">
          <div
            className="absolute inset-0 rounded-full border-2 border-white animate-spin"
            style={{
              animationDuration: '2s',
              clipPath: 'polygon(50% 50%, 50% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 50%)'
            }}
          />
        </div>

        {/* Inner arrow icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg
            className={`w-6 h-6 text-white transition-transform duration-300 ease-out ${
              isOpen ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>

        {/* Subtle glow effect on hover - only on dashboard */}
        {showGlow && (
          <div className="absolute inset-0 rounded-full bg-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        )}
      </button>

      {/* Tooltip */}
      <div className="absolute left-full ml-3 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
        <div className="bg-surface-primary text-primary px-3 py-2 rounded-lg border border-divider shadow-lg text-sm whitespace-nowrap">
          Daily Earn
          <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-surface-primary"></div>
        </div>
      </div>
    </div>
  );
}