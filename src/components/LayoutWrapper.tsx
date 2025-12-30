'use client';

import { useState } from 'react';
import { FloatingActionButton } from '@/components/FloatingActionButton';
import { DailyLoginDrawer } from '@/components/DailyLoginDrawer';

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <>
      {children}

      {/* Daily Login Components */}
      <FloatingActionButton
        onClick={() => setIsDrawerOpen(true)}
        isOpen={isDrawerOpen}
      />

      <DailyLoginDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </>
  );
}