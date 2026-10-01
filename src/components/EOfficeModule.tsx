'use client';

import React, { useState, useEffect } from 'react';
import {
  Key,
  ShieldCheck,
  Eye,
  EyeOff,
  Copy,
  Check,
  Building,
  Edit3,
  RefreshCw,
  Search,
  Lock,
  Download,
  AlertTriangle,
  Server,
  Mail,
  Phone,
} from 'lucide-react';
import { EOfficeCredential, UserSession } from '@/lib/types';
import { AYODHYA_THANAS } from '@/data/thanas';

interface EOfficeModuleProps {
  user: UserSession;
}

export const EOfficeModule: React.FC<EOfficeModuleProps> = ({ user }) => {
  const isSuperAdmin = user.role === 'SUPER_ADMIN';

  const [credentials, setCredentials] = useState<EOfficeCredential[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');

  // Editing state for Admin
  const [editingCred, setEditingCred] = useState<EOfficeCredential | null>(null);
  const [editFormData, setEditFormData] = useState({
    vpnUsername: '',
    vpnPassword: '',
    eofficeId: '',
    nicEmail: '',
    assignedSystemIp: '',
    notes: '',
  });
  const [savingEdit, setSavingEdit] = useState(false);
  const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchCredentials = async () => {
    try {
      setLoading(true);
      const thanaParam = isSuperAdmin ? 'all' : user.thanaId;
      const res = await fetch(`/api/eoffice/credentials?thanaId=${thanaParam}`);
      const data = await res.json();
      if (data.success) {
        setCredentials(data.credentials);
      }
    } catch (err) {
      console.error('Failed to fetch eOffice credentials', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCredentials();
  }, [user.thanaId]);

  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleEditClick = (cred: EOfficeCredential) => {
    setEditingCred(cred);
    setEditFormData({
      vpnUsername: cred.vpnUsername,
      vpnPassword: cred.vpnPassword,
      eofficeId: cred.eofficeId,
      nicEmail: cred.nicEmail,
      assignedSystemIp: cred.assignedSystemIp || '',
      notes: cred.notes || '',
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCred) return;

    setSavingEdit(true);
    try {
      const res = await fetch('/api/eoffice/credentials', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          thanaId: editingCred.thanaId,
          ...editFormData,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update credentials');
      }

      setAlertMessage({
        type: 'success',
        text: `✓ थाना ${editingCred.thanaName} के VPN एवं e-Office क्रेडेंशियल सफलतापूर्वक अपडेट हुए!`,
      });
      setEditingCred(null);
      fetchCredentials();
      setTimeout(() => setAlertMessage(null), 5000);
    } catch (err: any) {
      setAlertMessage({ type: 'error', text: err.message });
    } finally {
      setSavingEdit(false);
    }
  };

  const handleExportCSV = () => {
    if (credentials.length === 0) return;

    const headers = [
      'Thana Name',
      'CUG Number',
      'VPN Username',
      'VPN Password',
      'eOffice ID',
      'NIC Email',
      'System IP',
      'Last Updated',
    ];

    const rows = credentials.map((c) => [
      `"${c.thanaName}"`,
      c.cug,
      `"${c.vpnUsername}"`,
      `"${c.vpnPassword}"`,
      `"${c.eofficeId}"`,
      `"${c.nicEmail}"`,
      `"${c.assignedSystemIp || ''}"`,
      new Date(c.updatedAt).toLocaleDateString('en-IN'),
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Ayodhya_Police_eOffice_VPN_Vault_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredCredentials = credentials.filter((c) =>
    c.thanaName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.cug.includes(searchQuery) ||
    c.vpnUsername.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-4 sm:p-5 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white">
              e-Office एवं NIC VPN क्रेडेंशियल वॉल्ट
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {isSuperAdmin
              ? 'जनपद के सभी 21 थानों के e-Office FortiClient VPN पासवर्ड एवं सिस्टम वितरण'
              : `थाना ${user.thanaName} के लिए आवंटित सुरक्षित NIC VPN एवं e-Office क्रेडेंशियल`}
          </p>
        </div>

        {isSuperAdmin && (
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium bg-emerald-950/70 border border-emerald-700/60 text-emerald-300 hover:bg-emerald-900/60 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>क्रेडेंशियल बैकअप डाउनलोड</span>
            </button>
            <button
              onClick={fetchCredentials}
              className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-400 hover:text-white"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {alertMessage && (
        <div
          className={`p-3.5 rounded-xl border text-sm flex items-center gap-2.5 ${
            alertMessage.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-600 text-emerald-200'
              : 'bg-rose-950/80 border-rose-600 text-rose-200'
          }`}
        >
          {alertMessage.type === 'success' ? (
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
          )}
          <span>{alertMessage.text}</span>
        </div>
      )}

      {/* THANA VIEW: SINGLE SECURE CARD */}
      {!isSuperAdmin && credentials.length > 0 && (
        <div className="max-w-2xl mx-auto glass-panel-gold rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-700/60">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">
                  {user.thanaName}
                </h3>
                <span className="text-xs text-amber-300/80 font-mono">
                  अधिकृत CUG: {user.cug}
                </span>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950 border border-emerald-600 text-emerald-300">
              सक्रिय (Active VPN)
            </span>
          </div>

          <div className="space-y-4">
            
            {/* VPN Username */}
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block font-medium">FortiClient VPN यूजरनेम:</span>
                <span className="text-sm font-mono font-semibold text-white">
                  {credentials[0]?.vpnUsername}
                </span>
              </div>
              <button
                onClick={() => copyToClipboard(credentials[0]?.vpnUsername, 'vpn-user')}
                className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                title="कॉपी करें"
              >
                {copiedId === 'vpn-user' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            {/* VPN Password (Masked) */}
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block font-medium">FortiClient VPN पासवर्ड:</span>
                <span className="text-sm font-mono font-bold text-amber-400 tracking-wider">
                  {visiblePasswords[credentials[0]?.id]
                    ? credentials[0]?.vpnPassword
                    : '••••••••••••••••'}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => togglePasswordVisibility(credentials[0]?.id)}
                  className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                  title={visiblePasswords[credentials[0]?.id] ? 'छिपाएं' : 'देखें'}
                >
                  {visiblePasswords[credentials[0]?.id] ? (
                    <EyeOff className="w-4 h-4 text-amber-400" />
                  ) : (
                    <Eye className="w-4 h-4 text-slate-400" />
                  )}
                </button>
                <button
                  onClick={() => copyToClipboard(credentials[0]?.vpnPassword, 'vpn-pass')}
                  className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                  title="पासवर्ड कॉपी करें"
                >
                  {copiedId === 'vpn-pass' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* e-Office ID & NIC Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
                <span className="text-xs text-slate-400 block font-medium">e-Office लॉगइन आईडी:</span>
                <span className="text-sm font-mono text-blue-300 font-semibold">
                  {credentials[0]?.eofficeId}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
                <span className="text-xs text-slate-400 block font-medium">आवंटित सिस्टम IP:</span>
                <span className="text-sm font-mono text-emerald-300 font-semibold">
                  {credentials[0]?.assignedSystemIp || '10.152.44.52'}
                </span>
              </div>
            </div>

            {/* Advisory */}
            <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-800/40 text-xs text-amber-200/90 leading-relaxed">
              ⚠️ <strong>गोपनीयता निर्देश:</strong> यह पासवर्ड केवल अधिकृत e-Office कंप्यूटर ऑपरेटर के उपयोग हेतु है। पासवर्ड कभी भी WhatsApp या सार्वजनिक डायरी में न लिखें।
            </div>

          </div>
        </div>
      )}

      {/* SUPER ADMIN VIEW: FULL DISTRICT GRID */}
      {isSuperAdmin && (
        <div className="space-y-4">
          
          {/* Search bar */}
          <div className="glass-panel p-3.5 rounded-xl flex items-center justify-between">
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                placeholder="थाना नाम, CUG या VPN यूजर खोजें..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white pl-9 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>

            <span className="text-xs text-slate-400 hidden sm:inline">
              कुल सक्रिय थाने: <strong>{filteredCredentials.length}</strong> / 21
            </span>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCredentials.map((cred) => (
              <div
                key={cred.id}
                className="glass-panel rounded-2xl p-5 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                    <div>
                      <h4 className="font-bold text-white text-base flex items-center gap-1.5">
                        <Building className="w-4 h-4 text-amber-400" />
                        {cred.thanaName}
                      </h4>
                      <span className="text-xs text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-500" />
                        CUG: {cred.cug}
                      </span>
                    </div>

                    <button
                      onClick={() => handleEditClick(cred)}
                      className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                      title="संपादित करें"
                    >
                      <Edit3 className="w-4 h-4 text-amber-400" />
                    </button>
                  </div>

                  {/* VPN Credentials details */}
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80">
                      <span className="text-slate-400">VPN यूजर:</span>
                      <span className="font-mono text-white font-medium">{cred.vpnUsername}</span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80">
                      <span className="text-slate-400">VPN पासवर्ड:</span>
                      <div className="flex items-center gap-1.5 font-mono">
                        <span className="text-amber-300 font-semibold">
                          {visiblePasswords[cred.id] ? cred.vpnPassword : '••••••••••••'}
                        </span>
                        <button
                          onClick={() => togglePasswordVisibility(cred.id)}
                          className="text-slate-400 hover:text-white"
                        >
                          {visiblePasswords[cred.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => copyToClipboard(cred.vpnPassword, cred.id)}
                          className="text-slate-400 hover:text-white"
                        >
                          {copiedId === cred.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80">
                      <span className="text-slate-400">e-Office ID:</span>
                      <span className="font-mono text-blue-300">{cred.eofficeId}</span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80">
                      <span className="text-slate-400">सिस्टम IP:</span>
                      <span className="font-mono text-emerald-300">{cred.assignedSystemIp || '10.152.44.X'}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                  <span>अंतिम अपडेट: {new Date(cred.updatedAt).toLocaleDateString('en-IN')}</span>
                  <span className="text-slate-400">स्मार्ट सेल HQ</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* EDIT MODAL FOR SMART CELL ADMIN */}
      {editingCred && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-panel-gold rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-slate-700 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-700">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-amber-400" />
                  क्रेडेंशियल संपादन: {editingCred.thanaName}
                </h3>
                <span className="text-xs text-slate-400">CUG: {editingCred.cug}</span>
              </div>
              <button
                onClick={() => setEditingCred(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  FortiClient VPN यूजरनेम:
                </label>
                <input
                  type="text"
                  value={editFormData.vpnUsername}
                  onChange={(e) => setEditFormData({ ...editFormData, vpnUsername: e.target.value })}
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  FortiClient VPN पासवर्ड:
                </label>
                <input
                  type="text"
                  value={editFormData.vpnPassword}
                  onChange={(e) => setEditFormData({ ...editFormData, vpnPassword: e.target.value })}
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    e-Office ID:
                  </label>
                  <input
                    type="text"
                    value={editFormData.eofficeId}
                    onChange={(e) => setEditFormData({ ...editFormData, eofficeId: e.target.value })}
                    required
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    सिस्टम IP:
                  </label>
                  <input
                    type="text"
                    value={editFormData.assignedSystemIp}
                    onChange={(e) => setEditFormData({ ...editFormData, assignedSystemIp: e.target.value })}
                    placeholder="10.152.44.X"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  NIC ईमेल:
                </label>
                <input
                  type="email"
                  value={editFormData.nicEmail}
                  onChange={(e) => setEditFormData({ ...editFormData, nicEmail: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingCred(null)}
                  className="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-400 hover:text-white bg-slate-900 border border-slate-800"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-amber-600 hover:bg-amber-500 shadow-lg shadow-amber-500/25 disabled:opacity-50"
                >
                  {savingEdit ? 'अपडेट जारी है...' : 'सुरक्षित करें'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
