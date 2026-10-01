'use client';

import React, { useState, useEffect } from 'react';
import {
  Key,
  Eye,
  EyeOff,
  Copy,
  Check,
  Search,
  Download,
  Edit2,
  X,
  Lock,
} from 'lucide-react';
import { EOfficeCredential, UserSession } from '@/lib/types';

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
    assignedSystemIp: '',
  });
  const [savingEdit, setSavingEdit] = useState(false);

  const fetchCredentials = async () => {
    try {
      setLoading(true);
      const thanaParam = isSuperAdmin ? 'all' : user.thanaId;
      const res = await fetch(`/api/eoffice/credentials?thanaId=${thanaParam}`);
      const data = await res.json();
      if (data.success) {
        setCredentials(data.credentials);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCredentials();
  }, [user.thanaId]);

  const togglePassword = (id: string) => {
    setVisiblePasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleEditClick = (cred: EOfficeCredential) => {
    setEditingCred(cred);
    setEditFormData({
      vpnUsername: cred.vpnUsername,
      vpnPassword: cred.vpnPassword,
      eofficeId: cred.eofficeId,
      assignedSystemIp: cred.assignedSystemIp || '',
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
      if (!res.ok) throw new Error(data.error);

      setEditingCred(null);
      fetchCredentials();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleExportCSV = () => {
    if (credentials.length === 0) return;
    const headers = ['थाना', 'CUG', 'VPN User', 'VPN Password', 'eOffice ID', 'System IP'];
    const rows = credentials.map((c) => [
      `"${c.thanaName}"`,
      c.cug,
      `"${c.vpnUsername}"`,
      `"${c.vpnPassword}"`,
      `"${c.eofficeId}"`,
      `"${c.assignedSystemIp || ''}"`,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `eOffice_VPN_Vault_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  const filteredCredentials = credentials.filter(
    (c) =>
      c.thanaName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.cug.includes(searchQuery) ||
      c.vpnUsername.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white">e-Office एवं VPN क्रेडेंशियल वॉल्ट</h2>
          <p className="text-xs text-slate-400">
            {isSuperAdmin
              ? 'जनपद के सभी 21 थानों के FortiClient VPN एवं e-Office क्रेडेंशियल'
              : `थाना ${user.thanaName} के अधिकृत क्रेडेंशियल`}
          </p>
        </div>

        {isSuperAdmin && (
          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="text"
                placeholder="थाना खोजें..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 sm:w-60 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 pl-8 focus:outline-none focus:border-blue-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
            </div>

            <button
              onClick={handleExportCSV}
              title="CSV डाउनलोड"
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* THANA USER: SINGLE CLEAN CARD */}
      {!isSuperAdmin && credentials.length > 0 && (
        <div className="max-w-xl mx-auto bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="font-bold text-white text-base">{user.thanaName}</h3>
              <span className="text-xs text-slate-400 font-mono">CUG: {user.cug}</span>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/60">
              सक्रिय (Active)
            </span>
          </div>

          <div className="space-y-3">
            
            {/* VPN User */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800/80">
              <div>
                <span className="text-[11px] text-slate-400 block">FortiClient VPN यूजर:</span>
                <span className="text-xs font-mono font-semibold text-white">
                  {credentials[0]?.vpnUsername}
                </span>
              </div>
              <button
                onClick={() => copyText(credentials[0]?.vpnUsername, 'vpn-u')}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                {copiedId === 'vpn-u' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            {/* VPN Password */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800/80">
              <div>
                <span className="text-[11px] text-slate-400 block">FortiClient VPN पासवर्ड:</span>
                <span className="text-xs font-mono font-bold text-amber-300">
                  {visiblePasswords[credentials[0]?.id] ? credentials[0]?.vpnPassword : '••••••••••••••••'}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => togglePassword(credentials[0]?.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white"
                >
                  {visiblePasswords[credentials[0]?.id] ? <EyeOff className="w-4 h-4 text-amber-400" /> : <Eye className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => copyText(credentials[0]?.vpnPassword, 'vpn-p')}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white"
                >
                  {copiedId === 'vpn-p' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* e-Office ID & IP */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                <span className="text-[11px] text-slate-400 block">e-Office ID:</span>
                <span className="text-xs font-mono text-blue-300 font-semibold">
                  {credentials[0]?.eofficeId}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                <span className="text-[11px] text-slate-400 block">सिस्टम IP:</span>
                <span className="text-xs font-mono text-emerald-300 font-semibold">
                  {credentials[0]?.assignedSystemIp || '10.152.44.X'}
                </span>
              </div>
            </div>

          </div>

          <p className="text-[11px] text-slate-500 text-center pt-2">
            गोपनीय क्रेडेंशियल • किसी बाहरी व्यक्ति या व्हाट्सएप पर साझा न करें
          </p>

        </div>
      )}

      {/* SUPER ADMIN: CLEAN TABLE OF 21 THANAS */}
      {isSuperAdmin && (
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 text-slate-400 uppercase font-medium border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4 w-12">#</th>
                  <th className="py-3 px-4 font-semibold">थाना</th>
                  <th className="py-3 px-4">CUG नंबर</th>
                  <th className="py-3 px-4">VPN यूजर</th>
                  <th className="py-3 px-4">VPN पासवर्ड</th>
                  <th className="py-3 px-4">e-Office ID</th>
                  <th className="py-3 px-4">सिस्टम IP</th>
                  <th className="py-3 px-4 text-right">कार्य</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-500">
                      लोड हो रहा है...
                    </td>
                  </tr>
                ) : filteredCredentials.map((c, i) => (
                  <tr key={c.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 text-slate-500 font-mono">{i + 1}</td>
                    <td className="py-3 px-4 font-semibold text-white">{c.thanaName}</td>
                    <td className="py-3 px-4 font-mono text-slate-400">{c.cug}</td>
                    <td className="py-3 px-4 font-mono text-slate-300">{c.vpnUsername}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 font-mono">
                        <span className="text-amber-300 font-medium">
                          {visiblePasswords[c.id] ? c.vpnPassword : '••••••••••••'}
                        </span>
                        <button
                          onClick={() => togglePassword(c.id)}
                          className="text-slate-500 hover:text-white"
                        >
                          {visiblePasswords[c.id] ? <EyeOff className="w-3 h-3 text-amber-400" /> : <Eye className="w-3 h-3" />}
                        </button>
                        <button
                          onClick={() => copyText(c.vpnPassword, c.id)}
                          className="text-slate-500 hover:text-white"
                        >
                          {copiedId === c.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-blue-300">{c.eofficeId}</td>
                    <td className="py-3 px-4 font-mono text-emerald-300">{c.assignedSystemIp || '10.152.44.X'}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleEditClick(c)}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
                      >
                        एडिट
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Credential Modal */}
      {editingCred && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">
                संपादित करें: {editingCred.thanaName}
              </h3>
              <button onClick={() => setEditingCred(null)} className="text-slate-400 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5">
              <div>
                <label className="block text-xs text-slate-400 mb-1">VPN यूजर</label>
                <input
                  type="text"
                  required
                  value={editFormData.vpnUsername}
                  onChange={(e) => setEditFormData({ ...editFormData, vpnUsername: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">VPN पासवर्ड</label>
                <input
                  type="text"
                  required
                  value={editFormData.vpnPassword}
                  onChange={(e) => setEditFormData({ ...editFormData, vpnPassword: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">e-Office ID</label>
                  <input
                    type="text"
                    required
                    value={editFormData.eofficeId}
                    onChange={(e) => setEditFormData({ ...editFormData, eofficeId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">सिस्टम IP</label>
                  <input
                    type="text"
                    value={editFormData.assignedSystemIp}
                    onChange={(e) => setEditFormData({ ...editFormData, assignedSystemIp: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingCred(null)}
                  className="px-3.5 py-1.5 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500"
                >
                  {savingEdit ? 'अपडेट जारी...' : 'सुरक्षित करें'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
