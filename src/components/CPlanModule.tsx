'use client';

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Download,
  Phone,
  ShieldCheck,
  ShieldAlert,
  X,
  Building2,
  RefreshCw,
} from 'lucide-react';
import { CPlanRecord, UserSession } from '@/lib/types';
import { AYODHYA_THANAS } from '@/data/thanas';

interface CPlanModuleProps {
  user: UserSession;
}

export const CPlanModule: React.FC<CPlanModuleProps> = ({ user }) => {
  const isSuperAdmin = user.role === 'SUPER_ADMIN';

  const [records, setRecords] = useState<CPlanRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedThanaFilter, setSelectedThanaFilter] = useState<string>(isSuperAdmin ? 'all' : user.thanaId || '');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    personName: '',
    relativeName: '',
    mobileNumber: '',
    villageOrWard: '',
    categoryProfession: 'संभ्रांत नागरिक',
    beatConstableName: '',
    remarks: '',
  });

  // Duplicate Check
  const [checkingMobile, setCheckingMobile] = useState(false);
  const [duplicateInfo, setDuplicateInfo] = useState<{
    isDuplicate: boolean;
    thanaName?: string;
    existingRecord?: any;
  } | null>(null);

  const [formSubmitting, setFormSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const thanaParam = isSuperAdmin ? selectedThanaFilter : user.thanaId;
      const res = await fetch(`/api/cplan/records?thanaId=${thanaParam}`);
      const data = await res.json();
      if (data.success) {
        setRecords(data.records);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [selectedThanaFilter, user.thanaId]);

  // Live duplicate mobile check debounce
  useEffect(() => {
    const cleaned = formData.mobileNumber.replace(/\D/g, '').slice(-10);
    if (cleaned.length === 10) {
      setCheckingMobile(true);
      const timer = setTimeout(async () => {
        try {
          const res = await fetch(`/api/cplan/check-mobile?mobile=${cleaned}`);
          const data = await res.json();
          setDuplicateInfo(data);
        } catch (e) {
          console.error(e);
        } finally {
          setCheckingMobile(false);
        }
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setDuplicateInfo(null);
    }
  }, [formData.mobileNumber]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (duplicateInfo?.isDuplicate) {
      setErrorMessage('यह मोबाइल नंबर पहले से पंजीकृत है!');
      return;
    }

    setFormSubmitting(true);
    try {
      const res = await fetch('/api/cplan/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          thanaId: user.thanaId || 'smart-cell-hq',
          thanaName: user.thanaName,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save');

      // Success -> Close modal & reset
      setShowAddModal(false);
      setFormData({
        personName: '',
        relativeName: '',
        mobileNumber: '',
        villageOrWard: '',
        categoryProfession: 'संभ्रांत नागरिक',
        beatConstableName: '',
        remarks: '',
      });
      setDuplicateInfo(null);
      fetchRecords();
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleExportCSV = () => {
    if (records.length === 0) return;
    const headers = ['थाना', 'नाम', 'पिता/पति', 'मोबाइल', 'गाँव/वार्ड', 'श्रेणी', 'बीट आरक्षी', 'स्टेटस'];
    const rows = records.map((r) => [
      `"${r.thanaName}"`,
      `"${r.personName}"`,
      `"${r.relativeName}"`,
      r.mobileNumber,
      `"${r.villageOrWard}"`,
      `"${r.categoryProfession}"`,
      `"${r.beatConstableName || ''}"`,
      r.status,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `C-Plan_Ayodhya_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  const filteredRecords = records.filter((r) => {
    const q = searchQuery.toLowerCase();
    return (
      r.personName.toLowerCase().includes(q) ||
      r.mobileNumber.includes(q) ||
      r.villageOrWard.toLowerCase().includes(q) ||
      r.thanaName.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4">
      
      {/* Clean Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white">C-Plan संभ्रांत नागरिक</h2>
          <p className="text-xs text-slate-400">
            {isSuperAdmin
              ? `जनपद अयोध्या • कुल ${records.length} नागरिक पंजीकृत`
              : `थाना ${user.thanaName} • ${records.length} नागरिक दर्ज`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              placeholder="नाम, मोबाइल, गाँव..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-48 sm:w-64 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 pl-8 focus:outline-none focus:border-blue-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
          </div>

          {/* Admin Thana Filter */}
          {isSuperAdmin && (
            <select
              value={selectedThanaFilter}
              onChange={(e) => setSelectedThanaFilter(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
            >
              <option value="all">समस्त 21 थाने</option>
              {AYODHYA_THANAS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          )}

          {/* Export Button */}
          <button
            onClick={handleExportCSV}
            title="Excel/CSV डाउनलोड"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Add Record Button */}
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>नई प्रविष्टि</span>
          </button>
        </div>
      </div>

      {/* Clean Table */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 text-slate-400 uppercase font-medium border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 w-12">#</th>
                {isSuperAdmin && <th className="py-3 px-4">थाना</th>}
                <th className="py-3 px-4 font-semibold">व्यक्ति का नाम</th>
                <th className="py-3 px-4">पिता / पति</th>
                <th className="py-3 px-4">मोबाइल नंबर</th>
                <th className="py-3 px-4">गाँव / वार्ड</th>
                <th className="py-3 px-4">श्रेणी</th>
                <th className="py-3 px-4">बीट आरक्षी</th>
                <th className="py-3 px-4 text-right">स्थिति</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading ? (
                <tr>
                  <td colSpan={isSuperAdmin ? 9 : 8} className="py-12 text-center text-slate-500">
                    लोड हो रहा है...
                  </td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={isSuperAdmin ? 9 : 8} className="py-12 text-center text-slate-500">
                    कोई रिकॉर्ड उपलब्ध नहीं है। ऊपर दिए गए "नई प्रविष्टि" बटन से जोड़ें।
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r, i) => (
                  <tr key={r.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 text-slate-500 font-mono">{i + 1}</td>
                    {isSuperAdmin && (
                      <td className="py-3 px-4 font-medium text-amber-400/90">
                        {r.thanaName}
                      </td>
                    )}
                    <td className="py-3 px-4 font-semibold text-white">
                      {r.personName}
                    </td>
                    <td className="py-3 px-4 text-slate-400">{r.relativeName}</td>
                    <td className="py-3 px-4 font-mono font-medium text-blue-300">
                      {r.mobileNumber}
                    </td>
                    <td className="py-3 px-4 text-slate-300">{r.villageOrWard}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[11px]">
                        {r.categoryProfession}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">{r.beatConstableName || '—'}</td>
                    <td className="py-3 px-4 text-right">
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/40">
                        <ShieldCheck className="w-3 h-3" />
                        सत्यापित
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Clean Add Record Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in-95">
            
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">
                नया संभ्रांत नागरिक पंजीकरण
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setErrorMessage('');
                  setDuplicateInfo(null);
                }}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {errorMessage && (
              <div className="mb-3 p-2.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    व्यक्ति का नाम *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="नाम"
                    value={formData.personName}
                    onChange={(e) => setFormData({ ...formData, personName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    पिता / पति का नाम *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="पिता / पति"
                    value={formData.relativeName}
                    onChange={(e) => setFormData({ ...formData, relativeName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Mobile Number with Live Duplicate Check */}
              <div>
                <label className="block text-xs text-slate-400 mb-1 flex justify-between">
                  <span>मोबाइल नंबर (10 अंक) *</span>
                  {checkingMobile && (
                    <span className="text-[10px] text-blue-400 animate-pulse">जांच जारी...</span>
                  )}
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    maxLength={10}
                    required
                    placeholder="10 अंकों का मोबाइल नंबर"
                    value={formData.mobileNumber}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        mobileNumber: e.target.value.replace(/\D/g, ''),
                      })
                    }
                    className={`w-full bg-slate-950 border rounded-xl px-3 py-2 text-xs text-white font-mono pl-9 focus:outline-none ${
                      duplicateInfo?.isDuplicate
                        ? 'border-rose-500 ring-1 ring-rose-500'
                        : duplicateInfo?.isDuplicate === false
                        ? 'border-emerald-500'
                        : 'border-slate-800 focus:border-blue-500'
                    }`}
                  />
                  <Phone className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                </div>

                {/* Instant Alert */}
                {duplicateInfo?.isDuplicate && (
                  <div className="mt-1.5 p-2 rounded-lg bg-rose-950/70 border border-rose-800 text-rose-300 text-[11px] flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      डुप्लीकेट! यह नंबर पहले से <strong>{duplicateInfo.thanaName}</strong> में{' '}
                      <strong>{duplicateInfo.existingRecord?.personName}</strong> के नाम दर्ज है।
                    </span>
                  </div>
                )}
                {duplicateInfo && !duplicateInfo.isDuplicate && (
                  <span className="mt-1 text-[11px] text-emerald-400 block">
                    ✓ नंबर मान्य एवं यूनिक है
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    गाँव / वार्ड / मोहल्ला *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="गाँव या वार्ड"
                    value={formData.villageOrWard}
                    onChange={(e) => setFormData({ ...formData, villageOrWard: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    श्रेणी / पेशा *
                  </label>
                  <select
                    value={formData.categoryProfession}
                    onChange={(e) =>
                      setFormData({ ...formData, categoryProfession: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="संभ्रांत नागरिक">संभ्रांत नागरिक</option>
                    <option value="ग्राम प्रधान">ग्राम प्रधान</option>
                    <option value="बीडीसी सदस्य / सभासद">बीडीसी सदस्य / सभासद</option>
                    <option value="व्यापारी / उद्योगपति">व्यापारी</option>
                    <option value="पूर्व सैनिक / सुरक्षा बल">पूर्व सैनिक</option>
                    <option value="शिक्षक / चिकित्सक">शिक्षक / चिकित्सक</option>
                    <option value="धार्मिक प्रतिनिधि">धार्मिक प्रतिनिधि</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  बीट आरक्षी / हल्का इंचार्ज
                </label>
                <input
                  type="text"
                  placeholder="उदा. का. दिनेश कुमार"
                  value={formData.beatConstableName}
                  onChange={(e) => setFormData({ ...formData, beatConstableName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-1.5 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting || !!duplicateInfo?.isDuplicate}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-all disabled:opacity-50"
                >
                  {formSubmitting ? 'सुरक्षित हो रहा है...' : 'सुरक्षित करें'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
