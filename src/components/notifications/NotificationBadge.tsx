// src/components/notifications/NotificationBadge.tsx
'use client';

import React from 'react';
import { Bell } from 'lucide-react';

interface NotificationBadgeProps {
  count: number;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'minimal';
}

export function NotificationBadge({ 
  count, 
  onClick, 
  size = 'md',
  variant = 'default' 
}: NotificationBadgeProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8', 
    lg: 'w-10 h-10'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const badgeSizes = {
    sm: 'w-4 h-4 text-xs',
    md: 'w-5 h-5 text-xs',
    lg: 'w-6 h-6 text-sm'
  };

  const containerClass = variant === 'minimal' 
    ? 'relative cursor-pointer text-gray-600 hover:text-gray-900 transition-colors'
    : `relative cursor-pointer ${sizeClasses[size]} bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors`;

  return (
    <div className={containerClass} onClick={onClick}>
      <Bell className={`${iconSizes[size]} ${count > 0 ? 'text-blue-600' : ''}`} />
      
      {count > 0 && (
        <div className={`absolute -top-1 -right-1 ${badgeSizes[size]} bg-red-500 text-white rounded-full flex items-center justify-center font-medium`}>
          {count > 99 ? '99+' : count}
        </div>
      )}
    </div>
  );
}