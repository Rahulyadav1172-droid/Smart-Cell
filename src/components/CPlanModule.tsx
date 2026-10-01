'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Search,
  Download,
  Upload,
  Phone,
  ShieldCheck,
  ShieldAlert,
  X,
  FileSpreadsheet,
} from 'lucide-react';
import { PoliceMitraRecord, UserSession } from '@/lib/types';
import { AYODHYA_THANAS } from '@/data/thanas';

interface CPlanModuleProps {
  user: UserSession;
}

export const CPlanModule: React.FC<CPlanModuleProps> = ({ user }) => {
  const isSuperAdmin = user.role === 'SUPER_ADMIN';

  const [records, setRecords] = useState<PoliceMitraRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedThanaFilter, setSelectedThanaFilter] = useState<string>(isSuperAdmin ? 'all' : user.thanaId || '');
  const [showAddModal, setShowAddModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State matching the exact 11 columns
  const activeThanaObj = AYODHYA_THANAS.find((t) => t.id === user.thanaId) || AYODHYA_THANAS[0];

  const [formData, setFormData] = useState({
    district: 'अयोध्या',
    circle: activeThanaObj.circle,
    thanaId: activeThanaObj.id,
    thanaName: activeThanaObj.hindiName,
    halkaChowki: '',
    gramMohalla: '',
    majraName: '',
    distanceKm: '0',
    personName: '',
    designationProfession: 'संभ्रान्त नागरिक / पुलिस मित्र',
    mobileNumber: '',
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
  const [importSummary, setImportSummary] = useState<string | null>(null);

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
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save');

      // Success
      setShowAddModal(false);
      setFormData({
        district: 'अयोध्या',
        circle: activeThanaObj.circle,
        thanaId: activeThanaObj.id,
        thanaName: activeThanaObj.hindiName,
        halkaChowki: '',
        gramMohalla: '',
        majraName: '',
        distanceKm: '0',
        personName: '',
        designationProfession: 'संभ्रान्त नागरिक / पुलिस मित्र',
        mobileNumber: '',
      });
      setDuplicateInfo(null);
      fetchRecords();
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setFormSubmitting(false);
    }
  };

  // CSV Bulk Import Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
        if (lines.length < 2) return;

        // Parse CSV lines
        const newRecords = [];
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map((c) => c.replace(/^"|"$/g, '').trim());
          if (cols.length >= 7) {
            // Mapping exact columns
            newRecords.push({
              district: cols[1] || 'अयोध्या',
              circle: cols[2] || activeThanaObj.circle,
              thanaName: cols[3] || activeThanaObj.hindiName,
              thanaId: user.thanaId || 'kotwali-nagar',
              halkaChowki: cols[4] || '—',
              gramMohalla: cols[5] || '',
              majraName: cols[6] || 'मुख्य बस्ती',
              distanceKm: cols[7] || '0',
              personName: cols[8] || '',
              designationProfession: cols[9] || 'संभ्रान्त नागरिक',
              mobileNumber: cols[10] || '',
            });
          }
        }

        const res = await fetch('/api/cplan/records', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bulk: true, records: newRecords }),
        });

        const data = await res.json();
        if (data.success) {
          setImportSummary(
            `सफलतापूर्वक ${data.result.importedCount} रिकॉर्ड्स इम्पोर्ट हुए! (${data.result.skippedDuplicates} डुप्लीकेट छोड़े गए)`
          );
          fetchRecords();
          setTimeout(() => setImportSummary(null), 7000);
        }
      } catch (err) {
        alert('CSV फाइल पढ़ने में त्रुटि!');
      }
    };
    reader.readAsText(file);
  };

  // Export exact 11 columns to CSV
  const handleExportCSV = () => {
    if (records.length === 0) return;
    const headers = [
      'क्र0सं0',
      'जनपद',
      'सर्किल',
      'थाना',
      'हल्का/चौकी',
      'ग्राम/मौहल्ला',
      'मजरे का नाम',
      'मुख्य ग्राम/मुहल्ले से मजरे की दूरी (किमी में)',
      'संभ्रान्त व्यक्ति/पुलिस मित्र का नाम',
      'पदनाम/व्यवसाय',
      'मो0नं0',
    ];

    const rows = records.map((r, i) => [
      i + 1,
      `"${r.district || 'अयोध्या'}"`,
      `"${r.circle}"`,
      `"${r.thanaName}"`,
      `"${r.halkaChowki}"`,
      `"${r.gramMohalla}"`,
      `"${r.majraName}"`,
      `"${r.distanceKm}"`,
      `"${r.personName}"`,
      `"${r.designationProfession}"`,
      r.mobileNumber,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `Police_Mitra_Ayodhya_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  const filteredRecords = records.filter((r) => {
    const q = searchQuery.toLowerCase();
    return (
      r.personName.toLowerCase().includes(q) ||
      r.mobileNumber.includes(q) ||
      r.gramMohalla.toLowerCase().includes(q) ||
      r.majraName.toLowerCase().includes(q) ||
      r.thanaName.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4">
      
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white">
            संभ्रान्त व्यक्ति / पुलिस मित्र डेटाबेस (C-Plan)
          </h2>
          <p className="text-xs text-slate-400">
            {isSuperAdmin
              ? `जनपद अयोध्या • कुल ${records.length} संभ्रान्त नागरिक / पुलिस मित्र दर्ज`
              : `थाना ${user.thanaName} • ${records.length} रिकॉर्ड्स दर्ज`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="नाम, मोबाइल, गाँव..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-44 sm:w-60 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 pl-8 focus:outline-none focus:border-blue-500"
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

          {/* Import CSV Button */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".csv"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            title="Google Sheet की CSV फाइल अपलोड करें"
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300 bg-slate-900 border border-slate-800 hover:text-white hover:border-slate-700"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">CSV इम्पोर्ट</span>
          </button>

          {/* Export CSV Button */}
          <button
            onClick={handleExportCSV}
            title="Excel/CSV डाउनलोड करें"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Add Record */}
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ नई प्रविष्टि</span>
          </button>
        </div>
      </div>

      {importSummary && (
        <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-700 text-emerald-200 text-xs flex items-center gap-2">
          <span>{importSummary}</span>
        </div>
      )}

      {/* EXACT 11 COLUMNS TABLE */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/70 text-slate-400 font-semibold border-b border-slate-800 whitespace-nowrap">
              <tr>
                <th className="py-3 px-3">क्र0सं0</th>
                <th className="py-3 px-3">जनपद</th>
                <th className="py-3 px-3">सर्किल</th>
                <th className="py-3 px-3">थाना</th>
                <th className="py-3 px-3">हल्का/चौकी</th>
                <th className="py-3 px-3">ग्राम/मौहल्ला</th>
                <th className="py-3 px-3">मजरे का नाम</th>
                <th className="py-3 px-3">मुख्य ग्राम से दूरी (किमी)</th>
                <th className="py-3 px-3 font-bold text-amber-300">संभ्रान्त व्यक्ति/पुलिस मित्र का नाम</th>
                <th className="py-3 px-3">पदनाम/व्यवसाय</th>
                <th className="py-3 px-3 font-mono text-blue-300">मो0नं0</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 font-normal">
              {loading ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-500">
                    रिकॉर्ड्स लोड हो रहे हैं...
                  </td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-500">
                    कोई रिकॉर्ड उपलब्ध नहीं है। "+ नई प्रविष्टि" या "CSV इम्पोर्ट" से जोड़ें।
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r, i) => (
                  <tr key={r.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-3 text-slate-500 font-mono">{i + 1}</td>
                    <td className="py-3 px-3 text-slate-400">{r.district || 'अयोध्या'}</td>
                    <td className="py-3 px-3 text-slate-400">{r.circle}</td>
                    <td className="py-3 px-3 font-medium text-white">{r.thanaName}</td>
                    <td className="py-3 px-3 text-slate-300">{r.halkaChowki || '—'}</td>
                    <td className="py-3 px-3 font-semibold text-slate-200">{r.gramMohalla}</td>
                    <td className="py-3 px-3 text-slate-400">{r.majraName || '—'}</td>
                    <td className="py-3 px-3 font-mono text-slate-400">{r.distanceKm || '0'}</td>
                    <td className="py-3 px-3 font-semibold text-amber-300">{r.personName}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px]">
                        {r.designationProfession}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-blue-300">
                      {r.mobileNumber}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* NEW RECORD POPUP MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl animate-in fade-in zoom-in-95">
            
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
              <div>
                <h3 className="font-bold text-white text-base">
                  नई संभ्रान्त नागरिक / पुलिस मित्र प्रविष्टि
                </h3>
                <span className="text-xs text-amber-400 font-medium">थाना: {formData.thanaName}</span>
              </div>
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
              <div className="mb-3 p-2.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">हल्का / चौकी</label>
                  <input
                    type="text"
                    placeholder="उदा. चौकी सिविल लाइन्स / हल्का 2"
                    value={formData.halkaChowki}
                    onChange={(e) => setFormData({ ...formData, halkaChowki: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">ग्राम / मौहल्ला *</label>
                  <input
                    type="text"
                    required
                    placeholder="मुख्य ग्राम या मौहल्ले का नाम"
                    value={formData.gramMohalla}
                    onChange={(e) => setFormData({ ...formData, gramMohalla: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">मजरे का नाम</label>
                  <input
                    type="text"
                    placeholder="मजरे का नाम (यदि कोई हो)"
                    value={formData.majraName}
                    onChange={(e) => setFormData({ ...formData, majraName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">मुख्य ग्राम से दूरी (किमी में)</label>
                  <input
                    type="text"
                    placeholder="उदा. 2.5"
                    value={formData.distanceKm}
                    onChange={(e) => setFormData({ ...formData, distanceKm: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">संभ्रान्त व्यक्ति / पुलिस मित्र का नाम *</label>
                  <input
                    type="text"
                    required
                    placeholder="व्यक्ति का नाम"
                    value={formData.personName}
                    onChange={(e) => setFormData({ ...formData, personName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">पदनाम / व्यवसाय *</label>
                  <input
                    type="text"
                    required
                    placeholder="उदा. ग्राम प्रधान, व्यापारी, पूर्व सैनिक"
                    value={formData.designationProfession}
                    onChange={(e) => setFormData({ ...formData, designationProfession: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Mobile Number with Live Duplicate Check */}
              <div>
                <label className="block text-xs text-slate-400 mb-1 flex justify-between">
                  <span>मो0नं0 (10 अंक) *</span>
                  {checkingMobile && (
                    <span className="text-[10px] text-blue-400 animate-pulse">डुप्लीकेट जांच जारी...</span>
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

                {duplicateInfo?.isDuplicate && (
                  <div className="mt-1.5 p-2 rounded-lg bg-rose-950/70 border border-rose-800 text-rose-300 text-[11px] flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      ⚠️ <strong>डुप्लीकेट नंबर:</strong> यह नंबर पहले से <strong>{duplicateInfo.thanaName}</strong> में{' '}
                      <strong>{duplicateInfo.existingRecord?.personName}</strong> के नाम दर्ज है!
                    </span>
                  </div>
                )}
                {duplicateInfo && !duplicateInfo.isDuplicate && (
                  <span className="mt-1 text-[11px] text-emerald-400 block">
                    ✓ मोबाइल नंबर मान्य एवं यूनिक है (पूरे जनपद में उपलब्ध नहीं)
                  </span>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
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
