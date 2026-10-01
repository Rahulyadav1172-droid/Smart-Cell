'use client';

import React, { useState, useEffect } from 'react';
import { UserSession } from '@/lib/types';
import { Header } from '@/components/Header';
import { LoginView } from '@/components/LoginView';
import { CPlanModule } from '@/components/CPlanModule';
import { EOfficeModule } from '@/components/EOfficeModule';
import { DashboardModule } from '@/components/DashboardModule';
import { NoticesModule } from '@/components/NoticesModule';
import { Shield, Lock } from 'lucide-react';

export default function HomePage() {
  const [userSession, setUserSession] = useState<UserSession | null>(null);
  const [activeTab, setActiveTab] = useState<'cplan' | 'eoffice' | 'dashboard' | 'notices'>('cplan');
  const [initialized, setInitialized] = useState(false);

  // Restore session from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('smart_cell_user_session');
      if (saved) {
        setUserSession(JSON.parse(saved));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setInitialized(true);
    }
  }, []);

  const handleLoginSuccess = (user: UserSession) => {
    setUserSession(user);
    try {
      localStorage.setItem('smart_cell_user_session', JSON.stringify(user));
    } catch (e) {
      console.error(e);
    }
    // Default tab based on role
    if (user.role === 'SUPER_ADMIN') {
      setActiveTab('dashboard');
    } else {
      setActiveTab('cplan');
    }
  };

  const handleLogout = () => {
    setUserSession(null);
    try {
      localStorage.removeItem('smart_cell_user_session');
    } catch (e) {
      console.error(e);
    }
  };

  if (!initialized) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Shield className="w-8 h-8 text-amber-400 animate-pulse" />
          <span className="text-xs text-slate-400 font-medium">पोर्टल लोड हो रहा है...</span>
        </div>
      </div>
    );
  }

  // Not logged in -> Show Login View
  if (!userSession) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  // Logged in -> Show App with Header and Active Tab
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      
      {/* Universal Header with Navigation */}
      <Header
        user={userSession}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        unreadNoticesCount={2}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'cplan' && <CPlanModule user={userSession} />}
        {activeTab === 'eoffice' && <EOfficeModule user={userSession} />}
        {activeTab === 'dashboard' && (
          <DashboardModule user={userSession} onNavigateToTab={setActiveTab} />
        )}
        {activeTab === 'notices' && <NoticesModule user={userSession} />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/80 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-amber-500/80" />
            <span>स्मार्ट सेल / साइबर सेल • पुलिस अधीक्षक कार्यालय जनपद अयोध्या</span>
          </div>
          <span>आंतरिक उपयोग हेतु सुरक्षित प्रणाली • एन.आई.सी e-Office एवं C-Plan मानक</span>
        </div>
      </footer>

    </div>
  );
}
