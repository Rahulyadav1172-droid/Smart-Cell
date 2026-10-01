'use client';

import React from 'react';
import { Shield, Users, Key, BarChart3, Bell, LogOut, Phone, Building } from 'lucide-react';
import { UserSession } from '@/lib/types';

interface HeaderProps {
  user: UserSession;
  activeTab: 'cplan' | 'eoffice' | 'dashboard' | 'notices';
  setActiveTab: (tab: 'cplan' | 'eoffice' | 'dashboard' | 'notices') => void;
  onLogout: () => void;
  unreadNoticesCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  activeTab,
  setActiveTab,
  onLogout,
  unreadNoticesCount = 0,
}) => {
  const isSuperAdmin = user.role === 'SUPER_ADMIN';

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-700/60 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Department Branding */}
          <div className="flex items-center gap-3.5">
            <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 p-0.5 shadow-lg shadow-amber-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Shield className="w-6 h-6 text-amber-400 animate-pulse" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-slate-950 rounded-full" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-950/80 border border-blue-500/40 text-blue-300 uppercase tracking-wider">
                  UP POLICE • AYODHYA
                </span>
                {isSuperAdmin ? (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300">
                    SUPER ADMIN
                  </span>
                ) : (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-300">
                    थाना CUG लॉगिन
                  </span>
                )}
              </div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
                <span className="gold-gradient-text">SMART CELL</span>
                <span className="text-slate-400 font-normal text-sm sm:text-base hidden sm:inline">| जिला पुलिस कमान पोर्टल</span>
              </h1>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/90 border border-slate-800">
            <button
              onClick={() => setActiveTab('cplan')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'cplan'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>C-Plan संभ्रांत नागरिक</span>
            </button>

            <button
              onClick={() => setActiveTab('eoffice')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'eoffice'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Key className="w-4 h-4" />
              <span>e-Office / VPN वॉल्ट</span>
            </button>

            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>जिला डैशबोर्ड</span>
            </button>

            <button
              onClick={() => setActiveTab('notices')}
              className={`relative flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'notices'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Bell className="w-4 h-4" />
              <span>आदेश / सूचनाएं</span>
              {unreadNoticesCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce">
                  {unreadNoticesCount}
                </span>
              )}
            </button>
          </nav>

          {/* User Status & Logout */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-semibold text-white flex items-center justify-end gap-1.5">
                <Building className="w-3.5 h-3.5 text-amber-400" />
                {user.thanaName}
              </div>
              <div className="text-xs text-slate-400 flex items-center justify-end gap-1 font-mono">
                <Phone className="w-3 h-3 text-slate-500" />
                CUG: {user.cug}
              </div>
            </div>

            <button
              onClick={onLogout}
              title="लॉगआउट करें"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium text-rose-300 bg-rose-950/40 border border-rose-800/50 hover:bg-rose-900/60 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">लॉगआउट</span>
            </button>
          </div>

        </div>

        {/* Mobile Navigation Tabs */}
        <div className="flex md:hidden items-center justify-between pb-3 gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('cplan')}
            className={`flex-1 py-1.5 px-2 text-xs font-medium rounded-lg text-center whitespace-nowrap ${
              activeTab === 'cplan' ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-300'
            }`}
          >
            C-Plan
          </button>
          <button
            onClick={() => setActiveTab('eoffice')}
            className={`flex-1 py-1.5 px-2 text-xs font-medium rounded-lg text-center whitespace-nowrap ${
              activeTab === 'eoffice' ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-300'
            }`}
          >
            e-Office / VPN
          </button>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex-1 py-1.5 px-2 text-xs font-medium rounded-lg text-center whitespace-nowrap ${
              activeTab === 'dashboard' ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-300'
            }`}
          >
            डैशबोर्ड
          </button>
          <button
            onClick={() => setActiveTab('notices')}
            className={`flex-1 py-1.5 px-2 text-xs font-medium rounded-lg text-center whitespace-nowrap ${
              activeTab === 'notices' ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-300'
            }`}
          >
            सूचनाएं
          </button>
        </div>

      </div>
    </header>
  );
};
