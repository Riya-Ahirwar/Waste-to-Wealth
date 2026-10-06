'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, User } from 'lucide-react';
import { clsx } from 'clsx';

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    {
      name: 'Home',
      href: '/',
      icon: Home,
    },
    {
      name: 'Profile',
      href: '/profile',
      icon: User,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/80 px-6 py-2 safe-area-pb shadow-lg">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(
                'flex flex-col items-center py-1.5 px-6 rounded-2xl transition-all',
                isActive
                  ? 'text-emerald-700 font-bold bg-emerald-50'
                  : 'text-slate-400 hover:text-slate-700 font-medium'
              )}
            >
              <Icon className={clsx('w-5 h-5 mb-0.5 transition-transform', isActive && 'scale-110 text-emerald-600')} />
              <span className="text-xs">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
