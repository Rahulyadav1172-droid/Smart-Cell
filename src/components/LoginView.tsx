'use client';

import React, { useState } from 'react';
import { Shield, Phone, Lock, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { UserSession } from '@/lib/types';
import { AYODHYA_THANAS, SMART_CELL_ADMIN } from '@/data/thanas';

interface LoginViewProps {
  onLoginSuccess: (user: UserSession) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [cugNumber, setCugNumber] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Auto-detect Thana name as user types CUG
  const detectedThana =
    cugNumber.trim() === 'smartcell' || cugNumber.trim() === SMART_CELL_ADMIN.cug
      ? { name: 'स्मार्ट सेल मुख्यालय (Super Admin)', isAdmin: true }
      : AYODHYA_THANAS.find((t) => t.cug === cugNumber.trim());

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!cugNumber.trim()) {
      setErrorMessage('कृपया CUG मोबाइल नंबर दर्ज करें!');
      return;
    }
    if (!pin.trim()) {
      setErrorMessage('कृपया अपना सिक्योरिटी पिन दर्ज करें!');
      return;
    }

    setLoading(true);
    try {
      const cleanInput = cugNumber.trim();
      const isAdmin = cleanInput === 'smartcell' || cleanInput === SMART_CELL_ADMIN.cug;

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cug: cleanInput,
          pin: pin.trim(),
          role: isAdmin ? 'SUPER_ADMIN' : 'THANA',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'लॉगिन विफल रहा!');
      }

      onLoginSuccess(data.user);
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 sm:px-6">
      
      {/* Background Soft Glow */}
      <div className="absolute w-[500px] h-[300px] bg-blue-600/10 blur-[140px] rounded-full pointer-events-none" />

      <div className="w-full max-w-sm relative z-10">
        
        {/* Simple Clean Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mb-3 shadow-lg shadow-amber-500/5">
            <Shield className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">
            स्मार्ट सेल अयोध्या
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            पुलिस कमान पोर्टल • C-Plan एवं e-Office
          </p>
        </div>

        {/* Ultra-Clean Login Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-2xl backdrop-blur-xl">
          
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            
            {/* CUG Input */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                CUG मोबाइल नंबर
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="945440XXXX या smartcell"
                  value={cugNumber}
                  onChange={(e) => {
                    setCugNumber(e.target.value);
                    setErrorMessage('');
                  }}
                  autoFocus
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 font-mono focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 pl-10 transition-colors"
                />
                <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              </div>

              {/* Detected Thana Name Hint */}
              {detectedThana && (
                <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-amber-400 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>थाना: {detectedThana.name}</span>
                </div>
              )}
            </div>

            {/* PIN Input */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-medium text-slate-300">
                  सुरक्षा पिन (PIN)
                </label>
                <span className="text-[10px] text-slate-500">डिफ़ॉल्ट: 123456</span>
              </div>
              <div className="relative">
                <input
                  type="password"
                  placeholder="••••••"
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value);
                    setErrorMessage('');
                  }}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 font-mono tracking-widest focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 pl-10 transition-colors"
                />
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 active:scale-[0.99] shadow-lg shadow-blue-600/20 transition-all disabled:opacity-50"
            >
              <span>{loading ? 'सत्यापित हो रहा है...' : 'लॉगइन करें'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

        </div>

        {/* Clean Footer */}
        <p className="mt-6 text-center text-xs text-slate-600">
          जनपद अयोध्या पुलिस • केवल अधिकृत उपयोग हेतु
        </p>

      </div>
    </div>
  );
};
