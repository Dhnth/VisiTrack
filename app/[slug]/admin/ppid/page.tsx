'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Plus, Edit, Trash2, Download, Upload,
  RefreshCw, X, ChevronLeft, ChevronRight,
  CheckSquare, Square, FileSpreadsheet, FileText, CheckCircle,
  Eye, EyeOff, KeyRound, Shield
} from 'lucide-react';

interface Ppid {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface OfficerRequestBody {
  name: string;
  email: string;
  id?: number;
  generatePassword?: boolean;
  password?: string;
  resetPassword?: boolean;
}

export default function PpidPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [ppids, setPpids] = useState<Ppid[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedPpid, setSelectedPpid] = useState<Ppid | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [passwordMethod, setPasswordMethod] = useState<'auto' | 'manual'>('auto');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importLoading, setImportLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<Ppid | null>(null);
  const [showResetPasswordConfirm, setShowResetPasswordConfirm] = useState<Ppid | null>(null);
  const [showExportSuccess, setShowExportSuccess] = useState(false);
  const [showImportSuccess, setShowImportSuccess] = useState(false);
  const [importResult, setImportResult] = useState<{ success: number; fail: number } | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [generatedPpidName, setGeneratedPpidName] = useState('');
  const [isResetPassword, setIsResetPassword] = useState(false);

  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    debounceTimeout.current = setTimeout(() => {
      setPagination(prev => ({ ...prev, page: 1 }));
      setSearch(searchInput);
    }, 500);
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [searchInput]);

  useEffect(() => {
    const fetchPpids = async () => {
      setLoading(true);
      const urlParams = new URLSearchParams();
      urlParams.append('page', pagination.page.toString());
      urlParams.append('limit', '10');
      if (search) urlParams.append('search', search);
      const res = await fetch(`/api/admin/ppid?${urlParams.toString()}`);
      const data = await res.json();
      if (data.success) {
        setPpids(data.ppids);
        setPagination(prev => ({ ...prev, ...data.pagination }));
      }
      setLoading(false);
    };
    fetchPpids();
  }, [pagination.page, search]);

  const clearSearch = () => {
    setSearchInput('');
    setSearch('');
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page }));
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === ppids.length && ppids.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(ppids.map(e => e.id));
    }
  };

  const toggleSelect = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      alert('Pilih PPID terlebih dahulu');
      return;
    }
    if (!confirm(`Hapus ${selectedIds.length} PPID?`)) return;
    const res = await fetch('/api/admin/ppid', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', ids: selectedIds }),
    });
    const data = await res.json();
    if (data.success) {
      setSelectedIds([]);
      window.location.reload();
    } else {
      alert(data.error);
    }
  };

  const openAddModal = () => {
    setModalMode('add');
    setSelectedPpid(null);
    setFormData({ name: '', email: '', password: '' });
    setPasswordMethod('auto');
    setShowPassword(false);
    setFormError('');
    setFormSuccess('');
    setShowModal(true);
  };

  const openEditModal = (ppid: Ppid) => {
    setModalMode('edit');
    setSelectedPpid(ppid);
    setFormData({ name: ppid.name, email: ppid.email, password: '' });
    setPasswordMethod('auto');
    setShowPassword(false);
    setFormError('');
    setFormSuccess('');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setFormError('');
    setFormSuccess('');

    let body: OfficerRequestBody;
    if (modalMode === 'add') {
      if (passwordMethod === 'auto') {
        body = { name: formData.name, email: formData.email, generatePassword: true };
      } else {
        if (!formData.password) {
          setFormError('Password wajib diisi untuk mode manual');
          setActionLoading(false);
          return;
        }
        body = { name: formData.name, email: formData.email, generatePassword: false, password: formData.password };
      }
    } else {
      body = { name: formData.name, email: formData.email, id: selectedPpid?.id };
    }

    const url = '/api/admin/ppid';
    const method = modalMode === 'add' ? 'POST' : 'PUT';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const data = await res.json();

    if (data.success) {
      if (modalMode === 'add' && data.password) {
        setGeneratedPassword(data.password);
        setGeneratedPpidName(formData.name);
        setIsResetPassword(false);
        setShowPasswordModal(true);
        setShowModal(false);
      } else if (modalMode === 'edit' && data.resetPassword && data.newPassword) {
        setGeneratedPassword(data.newPassword);
        setGeneratedPpidName(selectedPpid?.name || '');
        setIsResetPassword(true);
        setShowPasswordModal(true);
        setShowModal(false);
      } else {
        setFormSuccess(data.message);
        setTimeout(() => {
          setShowModal(false);
          window.location.reload();
        }, 1500);
      }
    } else {
      setFormError(data.error);
    }
    setActionLoading(false);
  };

  const handleResetPassword = async (ppid: Ppid) => {
    const res = await fetch('/api/admin/ppid', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: ppid.id, resetPassword: true }),
    });
    const data = await res.json();
    if (data.success) {
      setGeneratedPassword(data.newPassword);
      setGeneratedPpidName(ppid.name);
      setIsResetPassword(true);
      setShowPasswordModal(true);
    } else {
      alert(data.error);
    }
    setShowResetPasswordConfirm(null);
  };

  const handleDelete = async (ppid: Ppid) => {
    const res = await fetch(`/api/admin/ppid?id=${ppid.id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      window.location.reload();
    } else {
      alert(data.error);
    }
    setShowDeleteConfirm(null);
  };

  const handleExport = async () => {
    window.open('/api/admin/ppid/export', '_blank');
    setShowExportSuccess(true);
    setTimeout(() => setShowExportSuccess(false), 3000);
  };

  const downloadTemplate = async () => {
    window.open('/api/admin/ppid/template', '_blank');
  };

  const handleImport = async () => {
    if (!importFile) {
      alert('Pilih file Excel terlebih dahulu');
      return;
    }
    setImportLoading(true);
    const fd = new FormData();
    fd.append('file', importFile);
    const res = await fetch('/api/admin/ppid/import', { method: 'POST', body: fd });
    const data = await res.json();
    if (data.success) {
      setImportResult({ success: data.successCount || 0, fail: data.errorCount || 0 });
      setShowImportSuccess(true);
      setTimeout(() => {
        setShowImportSuccess(false);
        setShowImportModal(false);
        setImportFile(null);
        window.location.reload();
      }, 3000);
    } else {
      alert(data.error);
    }
    setImportLoading(false);
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    alert('Password berhasil disalin ke clipboard');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#407BA7]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <Shield className="size-7 text-[#407BA7]" />
            <h1 className="text-2xl font-bold text-gray-800">Data PPID</h1>
          </div>
          <p className="text-gray-500 text-sm mt-1">
            Kelola data Pejabat Pengelola Informasi dan Dokumentasi
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={openAddModal} className="flex items-center gap-2 px-4 py-2 bg-[#800016] text-white rounded-lg hover:bg-[#A0001C] transition">
            <Plus size={18} /> Tambah PPID
          </button>
          <button onClick={() => setShowImportModal(true)} className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
            <Upload size={18} /> Import
          </button>
          <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
            <Download size={18} /> Export Excel
          </button>
        </div>
      </div>

      {/* Toasts */}
      <AnimatePresence>
        {showExportSuccess && (
          <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }} className="fixed top-20 right-4 z-50 bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2">
            <CheckCircle size={18} /> <span>Export Excel berhasil! File sedang didownload.</span>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showImportSuccess && importResult && (
          <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }} className="fixed top-20 right-4 z-50 bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2">
            <CheckCircle size={18} /> <span>Import berhasil! {importResult.success} data ditambahkan{importResult.fail > 0 ? `, ${importResult.fail} gagal` : ''}.</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
          <input type="text" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Cari berdasarkan nama atau email... (live search)" className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#407BA7]" />
        </div>
        {searchInput && <button onClick={clearSearch} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition">Clear</button>}
        <button onClick={() => window.location.reload()} className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <div className="bg-[#407BA7]/10 rounded-lg p-3 flex items-center justify-between">
          <span className="text-sm text-[#407BA7] font-medium">{selectedIds.length} PPID dipilih</span>
          <button onClick={handleBulkDelete} className="px-3 py-1 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition">Hapus ({selectedIds.length})</button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left">
                  <button onClick={toggleSelectAll} className="text-gray-500">
                    {selectedIds.length === ppids.length && ppids.length > 0 ? <CheckSquare size={18} className="text-[#407BA7]" /> : <Square size={18} />}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {ppids.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-gray-400">Belum ada data PPID</td>
                </tr>
              ) : (
                ppids.map((ppid) => (
                  <tr key={ppid.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3">
                      <button onClick={() => toggleSelect(ppid.id)}>
                        {selectedIds.includes(ppid.id) ? <CheckSquare size={18} className="text-[#407BA7]" /> : <Square size={18} className="text-gray-400" />}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">{ppid.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{ppid.email}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEditModal(ppid)} className="p-1.5 rounded-lg hover:bg-gray-100 transition" title="Edit"><Edit size={16} className="text-blue-500" /></button>
                        <button onClick={() => setShowResetPasswordConfirm(ppid)} className="p-1.5 rounded-lg hover:bg-gray-100 transition" title="Reset Password"><KeyRound size={16} className="text-orange-500" /></button>
                        <button onClick={() => setShowDeleteConfirm(ppid)} className="p-1.5 rounded-lg hover:bg-gray-100 transition" title="Hapus"><Trash2 size={16} className="text-red-500" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <button onClick={() => goToPage(pagination.page - 1)} disabled={pagination.page === 1} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition disabled:opacity-50"><ChevronLeft size={16} /></button>
          <div className="flex gap-1">
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              let pageNum;
              if (pagination.totalPages <= 5) pageNum = i + 1;
              else if (pagination.page <= 3) pageNum = i + 1;
              else if (pagination.page >= pagination.totalPages - 2) pageNum = pagination.totalPages - 4 + i;
              else pageNum = pagination.page - 2 + i;
              return (
                <button key={pageNum} onClick={() => goToPage(pageNum)} className={`w-8 h-8 rounded-lg text-sm transition ${pagination.page === pageNum ? 'bg-[#407BA7] text-white' : 'border border-gray-200 hover:bg-gray-50'}`}>
                  {pageNum}
                </button>
              );
            })}
          </div>
          <button onClick={() => goToPage(pagination.page + 1)} disabled={pagination.page === pagination.totalPages} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition"><ChevronRight size={16} /></button>
        </div>
      )}

      {/* Modal Add/Edit */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-800">{modalMode === 'add' ? 'Tambah PPID' : 'Edit PPID'}</h3>
                <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-gray-100"><X size={20} /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Nama *</label><input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#407BA7]" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Email *</label><input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#407BA7]" /></div>
                {modalMode === 'add' && (
                  <>
                    <div><label className="block text-sm font-medium text-gray-700 mb-2">Metode Password</label><div className="flex gap-4"><label className="flex items-center gap-2 cursor-pointer"><input type="radio" checked={passwordMethod === 'auto'} onChange={() => setPasswordMethod('auto')} className="text-[#407BA7] focus:ring-[#407BA7]" /><span className="text-sm text-gray-700">Generate Otomatis</span></label><label className="flex items-center gap-2 cursor-pointer"><input type="radio" checked={passwordMethod === 'manual'} onChange={() => setPasswordMethod('manual')} className="text-[#407BA7] focus:ring-[#407BA7]" /><span className="text-sm text-gray-700">Buat Manual</span></label></div></div>
                    {passwordMethod === 'manual' && (<div><label className="block text-sm font-medium text-gray-700 mb-1">Password *</label><div className="relative"><input type={showPassword ? 'text' : 'password'} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#407BA7] pr-10" /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></div></div>)}
                  </>
                )}
                {formError && <div className="p-3 bg-red-50 border border-red-200 rounded-lg"><p className="text-red-600 text-sm">{formError}</p></div>}
                {formSuccess && <div className="p-3 bg-green-50 border border-green-200 rounded-lg"><p className="text-green-600 text-sm whitespace-pre-line">{formSuccess}</p></div>}
                <div className="flex gap-3 justify-end pt-4"><button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">Batal</button><button type="submit" disabled={actionLoading} className="px-4 py-2 bg-[#800016] text-white rounded-lg hover:bg-[#A0001C] transition disabled:opacity-50">{actionLoading ? 'Memproses...' : modalMode === 'add' ? 'Tambah' : 'Simpan'}</button></div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Import */}
      <AnimatePresence>
        {showImportModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowImportModal(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
              <div className="flex items-center justify-between mb-4"><h3 className="text-xl font-semibold text-gray-800">Import PPID</h3><button onClick={() => setShowImportModal(false)} className="p-1 rounded-lg hover:bg-gray-100"><X size={20} /></button></div>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center"><FileSpreadsheet size={48} className="mx-auto text-gray-400 mb-3" /><p className="text-sm text-gray-600 mb-2">Upload file Excel (.xlsx) dengan kolom:</p><p className="text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded inline-block"><strong>Nama</strong>, <strong>Email</strong></p></div>
                <button onClick={downloadTemplate} className="text-sm text-[#407BA7] hover:underline flex items-center gap-1 mx-auto"><FileText size={14} /> Download Template Excel</button>
                <input type="file" accept=".xlsx,.xls" onChange={(e) => setImportFile(e.target.files?.[0] || null)} className="w-full border border-gray-200 rounded-lg p-2 text-sm" />
                {importFile && <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-2 rounded-lg"><CheckCircle size={16} /> <span>File: {importFile.name}</span></div>}
                <div className="flex gap-3 justify-end pt-4"><button onClick={() => setShowImportModal(false)} className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">Batal</button><button onClick={handleImport} disabled={importLoading} className="px-4 py-2 bg-[#800016] text-white rounded-lg hover:bg-[#A0001C] transition disabled:opacity-50">{importLoading ? 'Memproses...' : 'Import'}</button></div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Password */}
      <AnimatePresence>
        {showPasswordModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowPasswordModal(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
              <div className="flex items-center gap-3 mb-4"><div className="p-2 rounded-full bg-green-100"><KeyRound size={24} className="text-green-600" /></div><h3 className="text-lg font-semibold text-gray-800">{isResetPassword ? 'Password Berhasil Direset' : 'PPID Berhasil Ditambahkan'}</h3></div>
              <p className="text-gray-600 mb-2">{isResetPassword ? `Password untuk PPID "${generatedPpidName}" telah direset.` : `PPID "${generatedPpidName}" berhasil ditambahkan.`}</p>
              <div className="bg-gray-100 rounded-lg p-3 mb-4"><p className="text-xs text-gray-500 mb-1">Password:</p><div className="flex items-center justify-between gap-2"><code className="text-sm font-mono font-bold text-gray-800 break-all">{generatedPassword}</code><button onClick={() => copyToClipboard(generatedPassword)} className="px-2 py-1 text-xs bg-[#407BA7] text-white rounded hover:bg-[#356a8f] transition">Salin</button></div></div>
              <p className="text-xs text-yellow-600 bg-yellow-50 p-2 rounded-lg mb-4">⚠️ Simpan password ini dengan aman. Password tidak akan ditampilkan lagi setelah modal ini ditutup.</p>
              <div className="flex justify-end"><button onClick={() => { setShowPasswordModal(false); window.location.reload(); }} className="px-4 py-2 bg-[#800016] text-white rounded-lg hover:bg-[#A0001C] transition">Tutup</button></div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Reset Password Confirm */}
      <AnimatePresence>
        {showResetPasswordConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowResetPasswordConfirm(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
              <div className="flex items-center gap-3 mb-4"><div className="p-2 rounded-full bg-orange-100"><KeyRound size={24} className="text-orange-600" /></div><h3 className="text-lg font-semibold text-gray-800">Reset Password?</h3></div>
              <p className="text-gray-600 mb-6">{`Apakah Anda yakin ingin mereset password PPID "${showResetPasswordConfirm.name}"?`}<br /><span className="text-orange-500 text-sm">Password baru akan digenerate secara acak.</span></p>
              <div className="flex gap-3 justify-end"><button onClick={() => setShowResetPasswordConfirm(null)} className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">Batal</button><button onClick={() => handleResetPassword(showResetPasswordConfirm)} className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">Reset Password</button></div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Delete Confirm */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowDeleteConfirm(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
              <div className="flex items-center gap-3 mb-4"><div className="p-2 rounded-full bg-red-100"><Trash2 size={24} className="text-red-600" /></div><h3 className="text-lg font-semibold text-gray-800">Hapus PPID?</h3></div>
              <p className="text-gray-600 mb-6">{`Apakah Anda yakin ingin menghapus PPID "${showDeleteConfirm.name}"?`}<br /><span className="text-red-500 text-sm">Tindakan ini tidak dapat dibatalkan!</span></p>
              <div className="flex gap-3 justify-end"><button onClick={() => setShowDeleteConfirm(null)} className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">Batal</button><button onClick={() => handleDelete(showDeleteConfirm)} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Hapus</button></div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}