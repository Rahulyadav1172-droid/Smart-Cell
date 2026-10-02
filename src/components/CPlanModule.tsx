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
  ExternalLink,
  RefreshCw,
  TableProperties,
  Edit3,
} from 'lucide-react';
import { PoliceMitraRecord, UserSession } from '@/lib/types';
import { AYODHYA_THANAS } from '@/data/thanas';

interface CPlanModuleProps {
  user: UserSession;
}

export const CPlanModule: React.FC<CPlanModuleProps> = ({ user }) => {
  const isSuperAdmin = user.role === 'SUPER_ADMIN';

  // Toggle between Embedded Live Google Sheet and Database Search View
  const [viewMode, setViewMode] = useState<'SHEET' | 'DATABASE'>('SHEET');

  // Google Sheet URL
  const defaultSheetUrl =
    'https://docs.google.com/spreadsheets/d/1c6-xAideMh4dA2N8mVtMVXgBenhHdrqATiwfzNHC4g4/edit?gid=331500214&rm=minimal';
  const [sheetUrl, setSheetUrl] = useState(defaultSheetUrl);
  const [editingSheetUrl, setEditingSheetUrl] = useState(false);
  const [tempSheetUrl, setTempSheetUrl] = useState(defaultSheetUrl);
  const [iframeKey, setIframeKey] = useState(1);

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

        const newRecords = [];
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map((c) => c.replace(/^"|"$/g, '').trim());
          if (cols.length >= 7) {
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

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

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

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedRecords = filteredRecords.slice(startIndex, startIndex + pageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedThanaFilter]);

  return (
    <div className="space-y-4">
      
      {/* Top Header Bar with Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>संभ्रान्त व्यक्ति / पुलिस मित्र डेटाबेस (C-Plan)</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/60 font-normal">
              लाइव शीट एक्टिव
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {isSuperAdmin
              ? `जनपद अयोध्या • कुल ${records.length.toLocaleString('en-IN')} संभ्रान्त नागरिक / पुलिस मित्र दर्ज`
              : `थाना ${user.thanaName} • सीधे टाइप करें अथवा एक्सेल से कॉपी-पेस्ट करें`}
          </p>
        </div>

        {/* View Switcher: Live Sheet vs Database */}
        <div className="flex items-center gap-2">
          
          <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800">
            <button
              onClick={() => setViewMode('SHEET')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'SHEET'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>लाइव गूगल शीट</span>
            </button>

            <button
              onClick={() => setViewMode('DATABASE')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'DATABASE'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <TableProperties className="w-3.5 h-3.5" />
              <span>डेटाबेस व्यू ({records.length > 0 ? records.length.toLocaleString('en-IN') : '28,509'})</span>
            </button>
          </div>

          {/* External Google Sheet Link Button */}
          <a
            href="https://docs.google.com/spreadsheets/d/1c6-xAideMh4dA2N8mVtMVXgBenhHdrqATiwfzNHC4g4/edit?gid=331500214"
            target="_blank"
            rel="noopener noreferrer"
            title="Google Sheets को नई विंडो में खोलें"
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300 bg-slate-900 border border-slate-800 hover:text-white hover:border-slate-700 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">नई विंडो में खोलें</span>
          </a>

          <button
            onClick={() => setIframeKey((k) => k + 1)}
            title="शीट रिफ्रेश करें"
            className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* VIEW 1: EMBEDDED LIVE GOOGLE SHEET (DIRECT TYPE / COPY-PASTE) */}
      {viewMode === 'SHEET' && (
        <div className="space-y-3">
          
          {/* Quick Guidance Bar */}
          <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>
                <strong>डायरेक्ट एंट्री एवं कॉपी-पेस्ट सक्रिय:</strong> आप किसी भी सेल पर क्लिक करके सीधे टाइप कर सकते हैं, या एक्सेल से 10-50 पंक्तियां कॉपी (Ctrl+C) करके यहाँ सीधे पेस्ट (Ctrl+V) कर सकते हैं।
              </span>
            </div>

            {isSuperAdmin && (
              <button
                onClick={() => setEditingSheetUrl(!editingSheetUrl)}
                className="text-[11px] text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1 shrink-0 ml-3"
              >
                <Edit3 className="w-3 h-3" />
                <span>शीट लिंक बदलें</span>
              </button>
            )}
          </div>

          {/* Admin Sheet URL Editor Modal */}
          {editingSheetUrl && (
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2">
              <input
                type="text"
                value={tempSheetUrl}
                onChange={(e) => setTempSheetUrl(e.target.value)}
                placeholder="Google Sheet Embed URL"
                className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
              />
              <button
                onClick={() => {
                  setSheetUrl(tempSheetUrl);
                  setEditingSheetUrl(false);
                  setIframeKey((k) => k + 1);
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white"
              >
                अपडेट करें
              </button>
              <button
                onClick={() => setEditingSheetUrl(false)}
                className="px-2 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                रद्द
              </button>
            </div>
          )}

          {/* Google Sheet Live Iframe */}
          <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative">
            <iframe
              key={iframeKey}
              src={sheetUrl}
              allow="clipboard-read; clipboard-write; fullscreen"
              className="w-full h-[82vh] min-h-[720px] border-0 bg-white"
              title="C-Plan Google Sheet"
            />
          </div>

        </div>
      )}

      {/* VIEW 2: DATABASE VIEW (SEARCH, FILTER, PAGINATION & CSV TOOLS) */}
      {viewMode === 'DATABASE' && (
        <div className="space-y-4">
          
          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="नाम, मोबाइल, गाँव खोजें..."
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
            </div>

            <div className="flex items-center gap-2">
              {/* Import CSV */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".csv"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                title="CSV फाइल अपलोड करें"
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300 bg-slate-900 border border-slate-800 hover:text-white"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>CSV इम्पोर्ट</span>
              </button>

              {/* Export CSV */}
              <button
                onClick={handleExportCSV}
                title="Excel/CSV डाउनलोड"
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
              >
                <Download className="w-4 h-4" />
              </button>

              {/* Add Record Modal Button */}
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-sm"
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
                        कोई रिकॉर्ड उपलब्ध नहीं है।
                      </td>
                    </tr>
                  ) : (
                    paginatedRecords.map((r, i) => (
                      <tr key={r.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-2.5 px-3 text-slate-500 font-mono">{startIndex + i + 1}</td>
                        <td className="py-2.5 px-3 text-slate-400">{r.district || 'अयोध्या'}</td>
                        <td className="py-2.5 px-3 text-slate-400">{r.circle}</td>
                        <td className="py-2.5 px-3 font-medium text-white">{r.thanaName}</td>
                        <td className="py-2.5 px-3 text-slate-300">{r.halkaChowki || '—'}</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-200">{r.gramMohalla}</td>
                        <td className="py-2.5 px-3 text-slate-400">{r.majraName || '—'}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-400">{r.distanceKm || '0'}</td>
                        <td className="py-2.5 px-3 font-semibold text-amber-300">{r.personName}</td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px]">
                            {r.designationProfession}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-blue-300">
                          {r.mobileNumber}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Clean Pagination Bar */}
            {filteredRecords.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-slate-950/70 border-t border-slate-800 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <span>
                    कुल <strong>{filteredRecords.length.toLocaleString('en-IN')}</strong> रिकॉर्ड्स | दिखा रहे हैं{' '}
                    <strong>{startIndex + 1}</strong> -{' '}
                    <strong>{Math.min(startIndex + pageSize, filteredRecords.length).toLocaleString('en-IN')}</strong>
                  </span>

                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-300 focus:outline-none ml-2"
                  >
                    <option value={25}>25 प्रति पेज</option>
                    <option value={50}>50 प्रति पेज</option>
                    <option value={100}>100 प्रति पेज</option>
                    <option value={250}>250 प्रति पेज</option>
                    <option value={500}>500 प्रति पेज</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5 font-medium">
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:text-white disabled:opacity-40 disabled:hover:text-slate-400"
                  >
                    « पहला
                  </button>
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:text-white disabled:opacity-40 disabled:hover:text-slate-400"
                  >
                    ‹ पिछला
                  </button>

                  <span className="px-3 py-1 font-mono text-slate-300">
                    पेज {currentPage} / {totalPages}
                  </span>

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:text-white disabled:opacity-40 disabled:hover:text-slate-400"
                  >
                    अगला ›
                  </button>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:text-white disabled:opacity-40 disabled:hover:text-slate-400"
                  >
                    अंतिम »
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      )}

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
