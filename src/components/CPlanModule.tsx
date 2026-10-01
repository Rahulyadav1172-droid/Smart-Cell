'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Phone,
  ShieldAlert,
  ShieldCheck,
  Lock,
  Download,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Building,
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
  const [refreshing, setRefreshing] = useState(false);
  const [showAddForm, setShowAddForm] = useState(!isSuperAdmin); // Thanas see form right away
  const [selectedThanaFilter, setSelectedThanaFilter] = useState<string>(isSuperAdmin ? 'all' : user.thanaId || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Form state
  const [formData, setFormData] = useState({
    personName: '',
    relativeName: '',
    mobileNumber: '',
    villageOrWard: '',
    categoryProfession: 'संभ्रांत नागरिक',
    beatConstableName: '',
    beatConstableMobile: '',
    remarks: '',
  });

  // Live duplicate checking state
  const [checkingMobile, setCheckingMobile] = useState(false);
  const [mobileDuplicateInfo, setMobileDuplicateInfo] = useState<{
    isDuplicate: boolean;
    existingRecord?: CPlanRecord;
    thanaName?: string;
  } | null>(null);

  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formSuccessMessage, setFormSuccessMessage] = useState('');
  const [formErrorMessage, setFormErrorMessage] = useState('');

  // Fetch records
  const fetchRecords = async () => {
    try {
      setRefreshing(true);
      const thanaParam = isSuperAdmin ? selectedThanaFilter : user.thanaId;
      const res = await fetch(`/api/cplan/records?thanaId=${thanaParam}`);
      const data = await res.json();
      if (data.success) {
        setRecords(data.records);
      }
    } catch (err) {
      console.error('Failed to fetch records', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [selectedThanaFilter, user.thanaId]);

  // Live Mobile Duplicate Debounce Check
  useEffect(() => {
    const cleaned = formData.mobileNumber.replace(/\D/g, '').slice(-10);
    if (cleaned.length === 10) {
      setCheckingMobile(true);
      const timer = setTimeout(async () => {
        try {
          const res = await fetch(`/api/cplan/check-mobile?mobile=${cleaned}`);
          const data = await res.json();
          setMobileDuplicateInfo(data);
        } catch (err) {
          console.error(err);
        } finally {
          setCheckingMobile(false);
        }
      }, 350);

      return () => clearTimeout(timer);
    } else {
      setMobileDuplicateInfo(null);
      setCheckingMobile(false);
    }
  }, [formData.mobileNumber]);

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrorMessage('');
    setFormSuccessMessage('');

    if (mobileDuplicateInfo?.isDuplicate) {
      setFormErrorMessage('डुप्लीकेट मोबाइल नंबर दर्ज नहीं किया जा सकता!');
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
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit record');
      }

      setFormSuccessMessage('✓ C-Plan संभ्रांत नागरिक विवरण सफलता पूर्वक दर्ज एवं लॉक हो गया!');
      setFormData({
        personName: '',
        relativeName: '',
        mobileNumber: '',
        villageOrWard: '',
        categoryProfession: 'संभ्रांत नागरिक',
        beatConstableName: '',
        beatConstableMobile: '',
        remarks: '',
      });
      setMobileDuplicateInfo(null);
      fetchRecords();

      // Clear success alert after 5 seconds
      setTimeout(() => setFormSuccessMessage(''), 5000);
    } catch (err: any) {
      setFormErrorMessage(err.message);
    } finally {
      setFormSubmitting(false);
    }
  };

  // Export to CSV Function
  const handleExportCSV = () => {
    if (records.length === 0) return;

    const headers = [
      'Record ID',
      'Thana Name',
      'Person Name',
      'Relative Name',
      'Mobile Number',
      'Village/Ward',
      'Category/Profession',
      'Beat Constable',
      'Status',
      'Entry Date',
    ];

    const rows = records.map((r) => [
      r.id,
      `"${r.thanaName}"`,
      `"${r.personName}"`,
      `"${r.relativeName}"`,
      r.mobileNumber,
      `"${r.villageOrWard}"`,
      `"${r.categoryProfession}"`,
      `"${r.beatConstableName || ''}"`,
      r.status,
      new Date(r.createdAt).toLocaleDateString('en-IN'),
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `C-Plan_Ayodhya_${user.thanaName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered Records
  const filteredRecords = records.filter((r) => {
    const matchesSearch =
      r.personName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.mobileNumber.includes(searchQuery) ||
      r.villageOrWard.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.thanaName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      categoryFilter === 'ALL' || r.categoryProfession === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-4 sm:p-5 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white">
              C-Plan संभ्रांत नागरिक डाटाबेस प्रबंधन
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {isSuperAdmin
              ? 'जनपद अयोध्या के सभी 21 थानों का मास्टर संभ्रांत नागरिक डाटा एवं लाइव डुप्लीकेट डिटेक्शन'
              : `थाना ${user.thanaName} के अंतर्गत संभ्रांत व्यक्तियों की प्रविष्टि एवं रिकॉर्ड`}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              showAddForm
                ? 'bg-slate-800 text-slate-200 border border-slate-700'
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>{showAddForm ? 'फ़ॉर्म छिपाएं' : '+ नया संभ्रांत नागरिक जोड़ें'}</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium bg-emerald-950/70 border border-emerald-700/60 text-emerald-300 hover:bg-emerald-900/60 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Excel / CSV निर्यात</span>
          </button>

          <button
            onClick={fetchRecords}
            disabled={refreshing}
            title="रिफ्रेश करें"
            className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Security Notice: Write-Once / Tamper-Proofing */}
      <div className="flex items-center gap-3 p-3.5 rounded-xl bg-blue-950/40 border border-blue-800/50 text-blue-200 text-xs sm:text-sm">
        <Lock className="w-4 h-4 text-blue-400 shrink-0" />
        <span>
          <strong>सुरक्षा एवं प्रमाणिकता नियम:</strong> स्मार्ट सेल सुरक्षा प्रोटोकॉल के तहत एक बार विवरण दर्ज होने के पश्चात थाना स्तर पर रिकॉर्ड स्वतः सुरक्षित (Locked) हो जाता है। कोई भी ऑपरेटर पूर्व दर्ज डाटा मिटा नहीं सकता।
        </span>
      </div>

      {/* DATA ENTRY FORM WITH LIVE DUPLICATE CHECK */}
      {showAddForm && (
        <div className="glass-panel-gold p-5 sm:p-6 rounded-2xl shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-700/60">
            <div className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-white text-base">
                नया संभ्रांत नागरिक पंजीकरण फ़ॉर्म (C-Plan Entry)
              </h3>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
              पंजीकरण इकाई: {user.thanaName}
            </span>
          </div>

          {formSuccessMessage && (
            <div className="mb-4 p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-600 text-emerald-200 text-sm flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{formSuccessMessage}</span>
            </div>
          )}

          {formErrorMessage && (
            <div className="mb-4 p-3.5 rounded-xl bg-rose-950/80 border border-rose-600 text-rose-200 text-sm flex items-center gap-2.5">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
              <span>{formErrorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              
              {/* Person Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  व्यक्ति का नाम <span className="text-rose-400">*</span>:
                </label>
                <input
                  type="text"
                  placeholder="उदा. राम शरण वर्मा"
                  value={formData.personName}
                  onChange={(e) => setFormData({ ...formData, personName: e.target.value })}
                  required
                  className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Relative Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  पिता / पति का नाम <span className="text-rose-400">*</span>:
                </label>
                <input
                  type="text"
                  placeholder="उदा. श्री दीनदयाल वर्मा"
                  value={formData.relativeName}
                  onChange={(e) => setFormData({ ...formData, relativeName: e.target.value })}
                  required
                  className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Mobile Number with Live Duplicate Checking */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1 flex justify-between">
                  <span>मोबाइल नंबर <span className="text-rose-400">*</span>:</span>
                  {checkingMobile && (
                    <span className="text-[11px] text-blue-400 animate-pulse">जांच जारी है...</span>
                  )}
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    maxLength={10}
                    placeholder="10 अंकों का मोबाइल नंबर"
                    value={formData.mobileNumber}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        mobileNumber: e.target.value.replace(/\D/g, ''),
                      })
                    }
                    required
                    className={`w-full bg-slate-900/90 border rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:ring-2 pl-10 ${
                      mobileDuplicateInfo?.isDuplicate
                        ? 'border-rose-500 ring-rose-500/50 ring-2'
                        : mobileDuplicateInfo?.isDuplicate === false
                        ? 'border-emerald-500 ring-emerald-500/30 ring-1'
                        : 'border-slate-700 focus:ring-amber-500'
                    }`}
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>

                {/* Instant Live Duplicate Alert Badge */}
                {mobileDuplicateInfo?.isDuplicate && (
                  <div className="mt-2 p-2.5 rounded-lg bg-rose-950/90 border border-rose-600 text-rose-200 text-xs flex items-start gap-2 shadow-lg">
                    <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <strong>⚠️ डुप्लीकेट प्रविष्टि अस्वीकृत:</strong> यह मोबाइल नंबर पहले से{' '}
                      <span className="text-amber-300 font-bold">
                        {mobileDuplicateInfo.thanaName}
                      </span>{' '}
                      में{' '}
                      <span className="underline font-semibold">
                        {mobileDuplicateInfo.existingRecord?.personName}
                      </span>{' '}
                      के नाम पर दर्ज है!
                    </div>
                  </div>
                )}

                {mobileDuplicateInfo && !mobileDuplicateInfo.isDuplicate && (
                  <div className="mt-1.5 flex items-center gap-1.5 text-xs text-emerald-400">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>✓ मोबाइल नंबर सत्यापित (जनपद भर में यूनिक है)</span>
                  </div>
                )}
              </div>

              {/* Village / Ward */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  गाँव / वार्ड / मोहल्ला <span className="text-rose-400">*</span>:
                </label>
                <input
                  type="text"
                  placeholder="उदा. ग्राम पंचायत रायपुर / वार्ड 5"
                  value={formData.villageOrWard}
                  onChange={(e) => setFormData({ ...formData, villageOrWard: e.target.value })}
                  required
                  className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Category / Profession */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  संभ्रांत श्रेणी / व्यवसाय <span className="text-rose-400">*</span>:
                </label>
                <select
                  value={formData.categoryProfession}
                  onChange={(e) => setFormData({ ...formData, categoryProfession: e.target.value })}
                  className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
                >
                  <option value="संभ्रांत नागरिक">संभ्रांत नागरिक</option>
                  <option value="ग्राम प्रधान">ग्राम प्रधान</option>
                  <option value="बीडीसी सदस्य / सभासद">बीडीसी सदस्य / सभासद</option>
                  <option value="व्यापारी / उद्योगपति">व्यापारी / उद्योगपति</option>
                  <option value="पूर्व सैनिक / सुरक्षा बल">पूर्व सैनिक / सुरक्षा बल</option>
                  <option value="शिक्षक / अधिवक्ता / चिकित्सक">शिक्षक / अधिवक्ता / चिकित्सक</option>
                  <option value="धार्मिक प्रतिनिधि / पुजारी / मौलवी">धार्मिक प्रतिनिधि / पुजारी / मौलवी</option>
                  <option value="सामाजिक कार्यकर्ता / एनजीओ">सामाजिक कार्यकर्ता / एनजीओ</option>
                  <option value="अन्य प्रतिष्ठित नागरिक">अन्य प्रतिष्ठित नागरिक</option>
                </select>
              </div>

              {/* Beat Constable */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  बीट आरक्षी / हल्का इंचार्ज:
                </label>
                <input
                  type="text"
                  placeholder="उदा. का. दिनेश कुमार (बीट सं. 2)"
                  value={formData.beatConstableName}
                  onChange={(e) => setFormData({ ...formData, beatConstableName: e.target.value })}
                  className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

            </div>

            {/* Remarks */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                विशेष टिप्पणी / संपर्क संदर्भ:
              </label>
              <input
                type="text"
                placeholder="उदा. शांति समिति सदस्य, त्योहारों में कानून व्यवस्था सहयोग, आदि"
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-400 hover:text-white bg-slate-900 border border-slate-800"
              >
                रद्द करें
              </button>

              <button
                type="submit"
                disabled={formSubmitting || !!mobileDuplicateInfo?.isDuplicate}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 shadow-lg shadow-amber-500/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {formSubmitting ? (
                  'सुरक्षित किया जा रहा है...'
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>डाटा सुरक्षित करें एवं लॉक करें</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* FILTER & SEARCH BAR */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col md:flex-row gap-3 items-center justify-between">
        
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="नाम, मोबाइल, गाँव या थाना खोजें..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white pl-9 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        {/* Filter dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          
          {/* Admin Thana Filter */}
          {isSuperAdmin && (
            <div className="flex items-center gap-1.5">
              <Building className="w-4 h-4 text-slate-400" />
              <select
                value={selectedThanaFilter}
                onChange={(e) => setSelectedThanaFilter(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">-- समस्त 21 थाने --</option>
                {AYODHYA_THANAS.map((thana) => (
                  <option key={thana.id} value={thana.id}>
                    {thana.hindiName} ({thana.name})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Category Filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">समस्त श्रेणियां</option>
              <option value="संभ्रांत नागरिक">संभ्रांत नागरिक</option>
              <option value="ग्राम प्रधान">ग्राम प्रधान</option>
              <option value="बीडीसी सदस्य / सभासद">बीडीसी सदस्य / सभासद</option>
              <option value="व्यापारी / उद्योगपति">व्यापारी / उद्योगपति</option>
              <option value="पूर्व सैनिक / सुरक्षा बल">पूर्व सैनिक / सुरक्षा बल</option>
              <option value="शिक्षक / अधिवक्ता / चिकित्सक">शिक्षक / अधिवक्ता / चिकित्सक</option>
              <option value="धार्मिक प्रतिनिधि / पुजारी / मौलवी">धार्मिक प्रतिनिधि</option>
            </select>
          </div>

          <span className="text-xs text-slate-400 px-2 py-1 rounded bg-slate-900 border border-slate-800">
            कुल रिकॉर्ड: <strong>{filteredRecords.length}</strong>
          </span>
        </div>

      </div>

      {/* RECORDS TABLE VIEW */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/90 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 font-semibold">क्र.सं.</th>
                <th className="py-3 px-4 font-semibold">थाना</th>
                <th className="py-3 px-4 font-semibold">संभ्रांत व्यक्ति का नाम</th>
                <th className="py-3 px-4 font-semibold">पिता / पति का नाम</th>
                <th className="py-3 px-4 font-semibold">मोबाइल नंबर</th>
                <th className="py-3 px-4 font-semibold">गाँव / वार्ड</th>
                <th className="py-3 px-4 font-semibold">श्रेणी / व्यवसाय</th>
                <th className="py-3 px-4 font-semibold">बीट आरक्षी</th>
                <th className="py-3 px-4 font-semibold">स्थिति (Status)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-normal">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    रिकॉर्ड लोड हो रहे हैं...
                  </td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    कोई रिकॉर्ड नहीं मिला। ऊपर दिए गए बटन से नया संभ्रांत नागरिक विवरण दर्ज करें।
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record, index) => (
                  <tr
                    key={record.id}
                    className="hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-4 text-xs font-mono text-slate-400">
                      {index + 1}
                    </td>
                    <td className="py-3 px-4 font-medium text-white flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>{record.thanaName}</span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-amber-300">
                      {record.personName}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {record.relativeName}
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-blue-300">
                      {record.mobileNumber}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {record.villageOrWard}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-200">
                        {record.categoryProfession}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-400">
                      {record.beatConstableName || '—'}
                    </td>
                    <td className="py-3 px-4">
                      {record.status === 'VERIFIED' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-600/50 text-emerald-300">
                          <ShieldCheck className="w-3 h-3" />
                          सत्यापित
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-950/80 border border-amber-600/50 text-amber-300">
                          <Lock className="w-3 h-3" />
                          दर्ज (Locked)
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
