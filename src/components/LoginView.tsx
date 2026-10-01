'use client';

import React, { useState } from 'react';
import { Shield, Lock, Phone, KeyRound, Building, CheckCircle2, AlertCircle } from 'lucide-react';
import { AYODHYA_THANAS, SMART_CELL_ADMIN } from '@/data/thanas';
import { UserSession } from '@/lib/types';

interface LoginViewProps {
  onLoginSuccess: (user: UserSession) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [loginType, setLoginType] = useState<'THANA' | 'ADMIN'>('THANA');
  const [cugNumber, setCugNumber] = useState('');
  const [pin, setPin] = useState('');
  const [adminPin, setAdminPin] = useState('');
  const [selectedThanaId, setSelectedThanaId] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleThanaSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const thanaId = e.target.value;
    setSelectedThanaId(thanaId);
    const thana = AYODHYA_THANAS.find((t) => t.id === thanaId);
    if (thana) {
      setCugNumber(thana.cug);
      setPin('123456'); // Pre-fill default PIN for seamless testing
      setErrorMessage('');
    }
  };

  const handleQuickPick = (thanaId: string) => {
    setSelectedThanaId(thanaId);
    const thana = AYODHYA_THANAS.find((t) => t.id === thanaId);
    if (thana) {
      setCugNumber(thana.cug);
      setPin('123456');
      setErrorMessage('');
    }
  };

  const handleThanaLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cug: cugNumber, pin }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'लॉगिन असफल रहा!');
      }

      onLoginSuccess(data.user);
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: 'SUPER_ADMIN',
          cug: SMART_CELL_ADMIN.cug,
          pin: adminPin || 'admin123',
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Admin login failed');
      }

      onLoginSuccess(data.user);
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Glow Accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-blue-600/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-[400px] h-[300px] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        
        {/* Emblem & Branding */}
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 p-1 shadow-2xl shadow-amber-500/30">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Shield className="w-10 h-10 text-amber-400" />
            </div>
          </div>
          
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-700/80 text-xs font-semibold text-blue-400 uppercase tracking-widest">
            <span>उत्तर प्रदेश पुलिस • जनपद अयोध्या</span>
          </div>

          <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            <span className="gold-gradient-text">स्मार्ट सेल</span> कमान पोर्टल
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            C-Plan संभ्रांत नागरिक डाटाबेस एवं e-Office वॉल्ट प्रणाली
          </p>
        </div>

        {/* Login Box */}
        <div className="mt-8 glass-panel rounded-2xl p-6 sm:p-8 shadow-2xl border border-slate-800">
          
          {/* Mode Tabs */}
          <div className="flex rounded-xl bg-slate-900/90 p-1 border border-slate-800 mb-6">
            <button
              type="button"
              onClick={() => {
                setLoginType('THANA');
                setErrorMessage('');
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                loginType === 'THANA'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Phone className="w-4 h-4" />
              <span>थाना CUG लॉगिन</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setLoginType('ADMIN');
                setErrorMessage('');
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                loginType === 'ADMIN'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <KeyRound className="w-4 h-4" />
              <span>स्मार्ट सेल (Admin)</span>
            </button>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-5 p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs sm:text-sm flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* THANA CUG LOGIN FORM */}
          {loginType === 'THANA' && (
            <form onSubmit={handleThanaLogin} className="space-y-4">
              
              {/* Thana Selection Dropdown */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  1. अपना थाना / स्पेशल यूनिट चुनें:
                </label>
                <div className="relative">
                  <select
                    value={selectedThanaId}
                    onChange={handleThanaSelect}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                  >
                    <option value="">-- जनपद के 21 थानों में से चुनें --</option>
                    {AYODHYA_THANAS.map((thana) => (
                      <option key={thana.id} value={thana.id}>
                        {thana.hindiName} ({thana.name}) - CUG: {thana.cug}
                      </option>
                    ))}
                  </select>
                  <Building className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
                </div>
              </div>

              {/* CUG Mobile Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  2. अधिकृत CUG मोबाइल नंबर:
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    maxLength={10}
                    placeholder="945440XXXX"
                    value={cugNumber}
                    onChange={(e) => setCugNumber(e.target.value)}
                    required
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 pl-10"
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>
              </div>

              {/* 6-Digit PIN */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    3. सुरक्षा पिन (Security PIN):
                  </label>
                  <span className="text-[11px] text-amber-400 font-mono">डिफ़ॉल्ट PIN: 123456</span>
                </div>
                <div className="relative">
                  <input
                    type="password"
                    maxLength={6}
                    placeholder="••••••"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    required
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500 pl-10"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>
              </div>

              {/* Quick Pick Demo Pills */}
              <div className="pt-2">
                <span className="text-[11px] text-slate-400 block mb-1.5 font-medium">त्वरित डेमो चयन (Quick Pick):</span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: 'kotwali-nagar', label: 'कोतवाली नगर' },
                    { id: 'kotwali-ayodhya', label: 'कोतवाली अयोध्या' },
                    { id: 'cyber-thana', label: 'साइबर थाना' },
                    { id: 'kotwali-bikapur', label: 'बीकापुर' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleQuickPick(item.id)}
                      className={`text-[11px] px-2.5 py-1 rounded-md border transition-all ${
                        selectedThanaId === item.id
                          ? 'bg-blue-600/30 border-blue-500 text-blue-300'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50"
              >
                {loading ? 'सत्यापित किया जा रहा है...' : 'थाना पोर्टल में प्रवेश करें'}
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* SMART CELL ADMIN LOGIN FORM */}
          {loginType === 'ADMIN' && (
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/60 text-xs text-amber-200/90 leading-relaxed">
                🛡️ <strong>स्मार्ट सेल एडमिनिस्ट्रेटर एक्सेस:</strong> इसके माध्यम से जनपद के सभी 21 थानों का मास्टर डाटा, e-Office VPN क्रेडेंशियल वितरण एवं समग्र निगरानी उपलब्ध होगी।
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  एडमिन आईडी / CUG:
                </label>
                <div className="relative">
                  <input
                    type="text"
                    disabled
                    value="smartcell (अयोध्या मुख्यालय)"
                    className="w-full bg-slate-900/60 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-300 font-mono pl-10"
                  />
                  <Shield className="w-4 h-4 text-amber-400 absolute left-3.5 top-3" />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    मास्टर एडमिन पिन:
                  </label>
                  <span className="text-[11px] text-amber-400 font-mono">PIN: admin123</span>
                </div>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="admin123"
                    value={adminPin}
                    onChange={(e) => setAdminPin(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-amber-500 pl-10"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 shadow-lg shadow-amber-500/25 transition-all disabled:opacity-50"
              >
                {loading ? 'सत्यापन जारी है...' : 'स्मार्ट सेल कमान डैशबोर्ड खोलें'}
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </form>
          )}

        </div>

        {/* Footer Note */}
        <div className="mt-6 text-center text-xs text-slate-500">
          गोपनीय एवं आंतरिक उपयोग हेतु • पुलिस अधीक्षक कार्यालय, जनपद अयोध्या (उ.प्र.)
        </div>

      </div>
    </div>
  );
};
