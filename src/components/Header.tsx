'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Leaf } from 'lucide-react';

export default function Header() {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/85 backdrop-blur-md border-b border-emerald-100 px-4 py-3 shadow-xs">
      <div className="max-w-md mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <Leaf className="w-5 h-5 fill-white/20 stroke-white" />
          </div>
          <div>
            <h1 className="font-bold text-slate-800 text-base leading-tight tracking-tight flex items-center gap-1">
              Waste<span className="text-emerald-600 font-extrabold">2Wealth</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-medium tracking-wide">AI Upcycling Assistant</p>
          </div>
        </Link>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500" />
          <span>AI Vision</span>
        </div>
      </div>
    </header>
  );
}
