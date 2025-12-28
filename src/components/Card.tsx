"use client";

import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'small' | 'medium' | 'large';
  shadow?: 'none' | 'small' | 'medium' | 'large';
  hover?: boolean;
  dark?: boolean;
}

export function Card({ 
  children, 
  className = '', 
  padding = 'medium',
  shadow = 'medium', 
  hover = true,
  dark = false 
}: CardProps) {
  const paddingClasses = {
    small: 'p-4',
    medium: 'p-6',
    large: 'p-8'
  };

  const shadowClasses = {
    none: '',
    small: 'shadow-md',
    medium: 'shadow-lg', 
    large: 'shadow-xl'
  };

  return (
    <div 
      className={`
        bg-white dark:bg-gray-800
        rounded-xl border border-gray-100 dark:border-gray-700
        ${paddingClasses[padding]}
        ${shadowClasses[shadow]}
        ${hover ? 'hover:shadow-xl transform hover:scale-105 transition-all duration-300' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}