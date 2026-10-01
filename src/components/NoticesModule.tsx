'use client';

import React, { useState, useEffect } from 'react';
import { Bell, AlertTriangle, Send, Shield, PlusCircle, CheckCircle2 } from 'lucide-react';
import { BroadcastNotice, UserSession } from '@/lib/types';

interface NoticesModuleProps {
  user: UserSession;
}

export const NoticesModule: React.FC<NoticesModuleProps> = ({ user }) => {
  const isSuperAdmin = user.role === 'SUPER_ADMIN';

  const [notices, setNotices] = useState<BroadcastNotice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [priority, setPriority] = useState<'NORMAL' | 'HIGH' | 'URGENT'>('NORMAL');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/notices');
      const data = await res.json();
      if (data.success) {
        setNotices(data.notices);
      }
    } catch (err) {
      console.error('Failed to fetch notices', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handlePostNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newContent) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/notices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          content: newContent,
          priority,
          issuedBy: 'स्मार्ट सेल / पुलिस अधीक्षक कार्यालय अयोध्या',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSuccessMsg('✓ आधिकारिक सूचना समस्त 21 थानों के पोर्टल पर प्रसारित कर दी गई!');
      setNewTitle('');
      setNewContent('');
      setShowAddForm(false);
      fetchNotices();
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-4 sm:p-5 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white">
              स्मार्ट सेल आधिकारिक आदेश एवं सूचना प्रसारण
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            जनपद के सभी 21 थानों हेतु C-Plan, e-Office एवं साइबर सुरक्षा संबंधी निर्देश
          </p>
        </div>

        {isSuperAdmin && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-500/20"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{showAddForm ? 'फ़ॉर्म बंद करें' : '+ नया आधिकारिक आदेश जारी करें'}</span>
          </button>
        )}
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-600 text-emerald-200 text-sm flex items-center gap-2.5">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* CREATE NOTICE FORM (FOR ADMIN) */}
      {isSuperAdmin && showAddForm && (
        <div className="glass-panel-gold p-5 rounded-2xl border border-amber-500/30">
          <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
            <Send className="w-4 h-4 text-amber-400" />
            समस्त थानों हेतु नया निर्देश जारी करें:
          </h3>

          <form onSubmit={handlePostNotice} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                आदेश / सूचना का शीर्षक:
              </label>
              <input
                type="text"
                placeholder="उदा. C-Plan संभ्रांत नागरिक डाटा सत्यापन निर्देश"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                विस्तृत विवरण एवं निर्देश:
              </label>
              <textarea
                rows={3}
                placeholder="निर्देश का पूर्ण पाठ यहां दर्ज करें..."
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-semibold text-slate-300 mr-2">प्राथमिकता:</label>
                <select
                  value={priority}
                  onChange={(e: any) => setPriority(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                >
                  <option value="NORMAL">सामान्य (NORMAL)</option>
                  <option value="HIGH">अति-महत्वपूर्ण (HIGH)</option>
                  <option value="URGENT">अति-तत्काल (URGENT)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-amber-600 hover:bg-amber-500 shadow-md shadow-amber-500/25"
              >
                {submitting ? 'प्रसारण जारी है...' : 'अभी प्रसारित करें'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* NOTICES LIST */}
      <div className="space-y-4">
        {loading ? (
          <div className="glass-panel p-8 text-center text-slate-400 text-sm">
            निर्देश लोड हो रहे हैं...
          </div>
        ) : notices.length === 0 ? (
          <div className="glass-panel p-8 text-center text-slate-400 text-sm">
            कोई नया आदेश उपलब्ध नहीं है।
          </div>
        ) : (
          notices.map((n) => (
            <div
              key={n.id}
              className={`glass-panel p-5 rounded-2xl border transition-all ${
                n.priority === 'URGENT'
                  ? 'border-rose-600/50 bg-rose-950/20'
                  : n.priority === 'HIGH'
                  ? 'border-amber-500/40 bg-amber-950/20'
                  : 'border-slate-800'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  {n.priority === 'URGENT' && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 border border-rose-600 text-rose-300 animate-pulse">
                      अति-तत्काल (URGENT)
                    </span>
                  )}
                  {n.priority === 'HIGH' && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 border border-amber-600 text-amber-300">
                      महत्वपूर्ण
                    </span>
                  )}
                  <h4 className="font-bold text-white text-base">{n.title}</h4>
                </div>
                <span className="text-xs text-slate-400">
                  {new Date(n.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>

              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                {n.content}
              </p>

              <div className="mt-3 pt-2 text-xs text-amber-400/80 flex items-center gap-1.5 font-medium">
                <Shield className="w-3.5 h-3.5" />
                <span>जारीकर्ता: {n.issuedBy}</span>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};
