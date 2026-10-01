'use client';

import React from 'react';
import { Shield, Users, Key, LogOut } from 'lucide-react';
import { UserSession } from '@/lib/types';

interface HeaderProps {
  user: UserSession;
  activeTab: 'cplan' | 'eoffice';
  setActiveTab: (tab: 'cplan' | 'eoffice') => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  activeTab,
  setActiveTab,
  onLogout,
}) => {
  const isSuperAdmin = user.role === 'SUPER_ADMIN';

  return (
    <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                <span>स्मार्ट सेल अयोध्या</span>
                {isSuperAdmin && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 font-semibold border border-amber-500/30">
                    ADMIN
                  </span>
                )}
              </div>
              <span className="text-[11px] text-slate-400 block font-normal">
                {user.thanaName}
              </span>
            </div>
          </div>

          {/* Clean Segmented Tabs (C-Plan vs e-Office) */}
          <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800">
            <button
              onClick={() => setActiveTab('cplan')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'cplan'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>C-Plan संभ्रांत नागरिक</span>
            </button>

            <button
              onClick={() => setActiveTab('eoffice')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'eoffice'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Key className="w-4 h-4" />
              <span>e-Office VPN वॉल्ट</span>
            </button>
          </div>

          {/* User Status & Logout */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <span className="text-xs text-slate-400 font-mono">CUG: {user.cug}</span>
            </div>

            <button
              onClick={onLogout}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-rose-300 hover:bg-slate-800 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>लॉगआउट</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
