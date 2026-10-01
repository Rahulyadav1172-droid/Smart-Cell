'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Users,
  ShieldCheck,
  Building,
  Award,
  TrendingUp,
  RefreshCw,
  Radio,
  FileSpreadsheet,
} from 'lucide-react';
import { UserSession } from '@/lib/types';
import { AYODHYA_THANAS } from '@/data/thanas';

interface DashboardModuleProps {
  user: UserSession;
  onNavigateToTab: (tab: 'cplan' | 'eoffice' | 'notices') => void;
}

export const DashboardModule: React.FC<DashboardModuleProps> = ({ user, onNavigateToTab }) => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/stats');
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Failed to load stats', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-4 sm:p-5 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white">
              जनपद अयोध्या • स्मार्ट सेल कमान एनालिटिक्स
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            समस्त 21 थानों का संभ्रांत नागरिक C-Plan प्रगति मीटर एवं प्रदर्शन विश्लेषण
          </p>
        </div>

        <button
          onClick={fetchStats}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium bg-slate-900 border border-slate-700 text-slate-300 hover:text-white"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>लाइव डाटा रिफ्रेश</span>
        </button>
      </div>

      {/* KPI STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Thanas */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 uppercase tracking-wider block font-medium">
              सक्रिय पुलिस थाने / यूनिट्स
            </span>
            <span className="text-2xl font-extrabold text-white">
              21 <span className="text-xs font-normal text-slate-400">इकाइयां</span>
            </span>
          </div>
        </div>

        {/* Card 2: Total C-Plan Records */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 uppercase tracking-wider block font-medium">
              कुल पंजीकृत संभ्रांत नागरिक
            </span>
            <span className="text-2xl font-extrabold text-amber-300">
              {stats?.totalRecords ?? '—'} <span className="text-xs font-normal text-slate-400">नागरिक</span>
            </span>
          </div>
        </div>

        {/* Card 3: Verified Records */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 uppercase tracking-wider block font-medium">
              सत्यापित एवं लॉक प्रविष्टियां
            </span>
            <span className="text-2xl font-extrabold text-emerald-300">
              {stats?.verifiedRecords ?? '—'} <span className="text-xs font-normal text-slate-400">सत्यापित</span>
            </span>
          </div>
        </div>

        {/* Card 4: System Health */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-xs text-slate-400 uppercase tracking-wider block font-medium">
              डुप्लीकेट डिटेक्शन इंजन
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-950 border border-emerald-600 text-emerald-300 inline-block mt-1">
              100% एक्टिव (Zero Collision)
            </span>
          </div>
        </div>

      </div>

      {/* THANA PROGRESS & LEADERBOARD */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Top Performing Thanas */}
        <div className="glass-panel-gold rounded-2xl p-5 border border-amber-500/30 lg:col-span-1 shadow-xl">
          <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-700/60">
            <Award className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-white text-base">
              शीर्ष प्रदर्शनकारी थाने (Top Contributing)
            </h3>
          </div>

          <div className="space-y-3">
            {stats?.topPerformingThanas?.map((item: any, idx: number) => (
              <div
                key={item.thanaId}
                className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      idx === 0
                        ? 'bg-amber-500 text-slate-950'
                        : idx === 1
                        ? 'bg-slate-300 text-slate-950'
                        : idx === 2
                        ? 'bg-amber-700 text-white'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <span className="text-sm font-semibold text-white">{item.name}</span>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-blue-950 border border-blue-700 text-blue-300 font-mono font-bold">
                  {item.count} प्रविष्टियां
                </span>
              </div>
            ))}
          </div>

          <div className="mt-5 pt-3 border-t border-slate-800">
            <button
              onClick={() => onNavigateToTab('cplan')}
              className="w-full py-2.5 rounded-xl text-xs font-semibold text-amber-300 bg-amber-950/60 border border-amber-800/80 hover:bg-amber-900/60 transition-colors flex items-center justify-center gap-2"
            >
              <span>समस्त C-Plan रिकॉर्ड देखें</span>
              <TrendingUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right: Circle-Wise Breakdown */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800 lg:col-span-2 shadow-xl">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Building className="w-5 h-5 text-blue-400" />
              <h3 className="font-bold text-white text-base">
                सर्किल अनुसार थाना वितरण (Ayodhya Police Circles)
              </h3>
            </div>
            <span className="text-xs text-slate-400">कुल सर्किल: 6</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {[
              {
                circle: 'सर्किल नगर / अयोध्या',
                thanas: ['कोतवाली नगर', 'कोतवाली कैंट', 'कोतवाली अयोध्या', 'महिला थाना', 'पूराकलंदर'],
              },
              {
                circle: 'सर्किल RJB / सुरक्षा',
                thanas: ['राम जन्म भूमि थाना'],
              },
              {
                circle: 'सर्किल बीकापुर',
                thanas: ['कोतवाली बीकापुर', 'तारुन', 'हैदरगंज'],
              },
              {
                circle: 'सर्किल मिल्कीपुर',
                thanas: ['कोतवाली इनायत नगर', 'कुमारगंज', 'खंडासा'],
              },
              {
                circle: 'सर्किल रूदौली',
                thanas: ['कोतवाली रूदौली', 'मवई', 'पटरंगा', 'बाबा बाजार'],
              },
              {
                circle: 'स्पेशल क्राइम यूनिट्स',
                thanas: ['साइबर थाना', 'ए.एच.टी.यू (AHTU)', 'रौनाही', 'महाराजगंज', 'गोसाईंगंज'],
              },
            ].map((grp) => (
              <div key={grp.circle} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-xs font-bold text-amber-400 block mb-2">{grp.circle}</span>
                <div className="flex flex-wrap gap-1.5">
                  {grp.thanas.map((th) => (
                    <span
                      key={th}
                      className="text-[11px] px-2 py-0.5 rounded bg-slate-800/90 text-slate-300 border border-slate-700/60"
                    >
                      {th}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>

    </div>
  );
};
