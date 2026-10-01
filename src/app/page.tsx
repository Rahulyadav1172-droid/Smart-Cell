'use client';

import React, { useState, useEffect } from 'react';
import { UserSession } from '@/lib/types';
import { Header } from '@/components/Header';
import { LoginView } from '@/components/LoginView';
import { CPlanModule } from '@/components/CPlanModule';
import { EOfficeModule } from '@/components/EOfficeModule';
import { Shield } from 'lucide-react';

export default function HomePage() {
  const [userSession, setUserSession] = useState<UserSession | null>(null);
  const [activeTab, setActiveTab] = useState<'cplan' | 'eoffice'>('cplan');
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
    setActiveTab('cplan');
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
        <Shield className="w-8 h-8 text-amber-400 animate-pulse" />
      </div>
    );
  }

  // Not logged in -> Show Ultra Clean Login
  if (!userSession) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  // Logged in -> Clean App with Header & Active Tab
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      
      {/* Universal Clean Header */}
      <Header
        user={userSession}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'cplan' && <CPlanModule user={userSession} />}
        {activeTab === 'eoffice' && <EOfficeModule user={userSession} />}
      </main>

      {/* Clean Minimal Footer */}
      <footer className="border-t border-slate-900 py-3 text-center text-xs text-slate-600">
        स्मार्ट सेल / साइबर सेल • पुलिस अधीक्षक कार्यालय जनपद अयोध्या
      </footer>

    </div>
  );
}
