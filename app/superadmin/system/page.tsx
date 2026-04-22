'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Database, Download, Trash2, Settings, Clock,
  HardDrive, Activity, Server, RefreshCw, Shield,
  AlertCircle, Loader2, X, FileArchive, FileText as FileIcon
} from 'lucide-react';

interface BackupFile {
  name: string;
  size: number;
  sizeFormatted: string;
  createdAt: string;
  type: 'database' | 'full';
}

interface BackupConfig {
  autoBackup: boolean;
  frequency: string;
  retention: number;
  lastBackup: string | null;
  includeFiles: boolean;
}

interface DiskUsage {
  used: number;
  usedFormatted: string;
  total: number;
  totalFormatted: string;
  percent: number;
  uploadsSize: string;
  backupsSize: string;
}

export default function BackupSystemPage() {
  const [backups, setBackups] = useState<BackupFile[]>([]);
  const [config, setConfig] = useState<BackupConfig | null>(null);
  const [diskUsage, setDiskUsage] = useState<DiskUsage | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deleteBackupFile, setDeleteBackupFile] = useState<BackupFile | null>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [tempConfig, setTempConfig] = useState({
    autoBackup: false,
    frequency: 'daily',
    retention: 30,
    includeFiles: true
  });
  const [savingConfig, setSavingConfig] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // FETCH DATA
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      // Fetch backup list & disk usage
      const listRes = await fetch('/api/superadmin/backup?action=list');
      const listData = await listRes.json();
      if (listData.success) {
        setBackups(listData.backups);
        setDiskUsage(listData.diskUsage);
      }

      // Fetch config
      const configRes = await fetch('/api/superadmin/backup?action=config');
      const configData = await configRes.json();
      if (configData.success) {
        setConfig(configData.config);
        setTempConfig({
          autoBackup: configData.config.autoBackup,
          frequency: configData.config.frequency,
          retention: configData.config.retention,
          includeFiles: configData.config.includeFiles
        });
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  const createBackup = async () => {
    setCreating(true);
    const res = await fetch('/api/superadmin/backup?action=manual', { method: 'POST' });
    const data = await res.json();
    if (data.success) {
      // Refresh data
      const listRes = await fetch('/api/superadmin/backup?action=list');
      const listData = await listRes.json();
      if (listData.success) {
        setBackups(listData.backups);
        setDiskUsage(listData.diskUsage);
      }
      const configRes = await fetch('/api/superadmin/backup?action=config');
      const configData = await configRes.json();
      if (configData.success) {
        setConfig(configData.config);
      }
      setSuccessMessage(`Backup berhasil dibuat!\nDatabase: ${data.dbSize}\n${data.zipFile ? `Files: ${data.zipSize}` : ''}`);
      setShowSuccessModal(true);
    } else {
      setErrorMessage('Gagal membuat backup: ' + (data.error || 'Unknown error'));
      setShowErrorModal(true);
    }
    setCreating(false);
  };

  const downloadBackup = (fileName: string) => {
    window.open(`/api/superadmin/backup?action=download&file=${encodeURIComponent(fileName)}`, '_blank');
  };

  const confirmDeleteBackup = (backup: BackupFile) => {
    setDeleteBackupFile(backup);
  };

  const handleDeleteBackup = async () => {
    if (!deleteBackupFile) return;
    
    const res = await fetch(`/api/superadmin/backup?file=${encodeURIComponent(deleteBackupFile.name)}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      setBackups(backups.filter(b => b.name !== deleteBackupFile.name));
      setDeleteBackupFile(null);
      setSuccessMessage('Backup berhasil dihapus');
      setShowSuccessModal(true);
    } else {
      setErrorMessage('Gagal menghapus backup');
      setShowErrorModal(true);
    }
  };

  const openConfigModal = () => {
    if (config) {
      setTempConfig({
        autoBackup: config.autoBackup,
        frequency: config.frequency,
        retention: config.retention,
        includeFiles: config.includeFiles
      });
    }
    setShowConfigModal(true);
  };

  const saveConfig = async () => {
    setSavingConfig(true);
    const res = await fetch('/api/superadmin/backup?action=config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tempConfig)
    });
    const data = await res.json();
    if (data.success) {
      setConfig({
        ...config!,
        autoBackup: tempConfig.autoBackup,
        frequency: tempConfig.frequency,
        retention: tempConfig.retention,
        includeFiles: tempConfig.includeFiles,
        lastBackup: config?.lastBackup || null
      });
      setShowConfigModal(false);
      setSuccessMessage('Konfigurasi backup berhasil disimpan');
      setShowSuccessModal(true);
    } else {
      setErrorMessage('Gagal menyimpan konfigurasi');
      setShowErrorModal(true);
    }
    setSavingConfig(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDiskColor = (percent: number) => {
    if (percent < 50) return 'text-green-600';
    if (percent < 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#407BA7]"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Database className="text-[#407BA7]" /> Backup & System
          </h1>
          <p className="text-gray-500 text-sm mt-1">Kelola backup database dan pantau kesehatan sistem</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={openConfigModal}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
          >
            <Settings size={16} />
            Konfigurasi
          </button>
          <button
            onClick={createBackup}
            disabled={creating}
            className="flex items-center gap-2 px-4 py-2 bg-[#407BA7] text-white rounded-lg hover:bg-[#356a8f] transition disabled:opacity-50"
          >
            {creating ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw size={16} />}
            {creating ? 'Membuat Backup...' : 'Backup Now'}
          </button>
        </div>
      </div>

      {/* System Health Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <Server size={16} className="text-green-500" />
            <span className="text-xs text-gray-500">Database</span>
          </div>
          <p className="text-sm font-semibold text-green-600">Connected</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <HardDrive size={16} className="text-blue-500" />
            <span className="text-xs text-gray-500">Disk Usage</span>
          </div>
          <p className={`text-sm font-semibold ${getDiskColor(diskUsage?.percent || 0)}`}>
            {diskUsage?.percent || 0}%
          </p>
          <p className="text-xs text-gray-400">
            {diskUsage?.usedFormatted || '0 B'} / {diskUsage?.totalFormatted || '0 B'}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <Activity size={16} className="text-yellow-500" />
            <span className="text-xs text-gray-500">Backup Size</span>
          </div>
          <p className="text-sm font-semibold">{diskUsage?.backupsSize || '0 B'}</p>
          <p className="text-xs text-gray-400">Total backup files</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={16} className="text-orange-500" />
            <span className="text-xs text-gray-500">Last Backup</span>
          </div>
          <p className="text-sm font-semibold">
            {config?.lastBackup ? formatDate(config.lastBackup) : 'Belum pernah'}
          </p>
        </div>
      </div>

      {/* Backup Config Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Settings size={18} className="text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-800">Konfigurasi Backup</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Auto Backup</label>
            <div className="flex items-center gap-2">
              {config?.autoBackup ? (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  Aktif
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-500 rounded-full text-xs">
                  Nonaktif
                </span>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Frekuensi</label>
            <p className="text-sm text-gray-600 capitalize">{config?.frequency || 'daily'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Retention</label>
            <p className="text-sm text-gray-600">{config?.retention || 30} hari</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Include Files</label>
            <p className="text-sm text-gray-600">{config?.includeFiles ? 'Ya (foto upload)' : 'Tidak'}</p>
          </div>
        </div>
      </div>

      {/* Backup List Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">Daftar Backup</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipe</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama File</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ukuran</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {backups.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                    Belum ada backup. Klik &quot;Backup Now&quot; untuk membuat backup pertama.
                  </td>
                </tr>
              ) : (
                backups.map((backup) => (
                  <tr key={backup.name} className="hover:bg-gray-50">
                    <td className="px-6 py-3">
                      {backup.type === 'database' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                          <Database size={12} /> Database
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                          <FileArchive size={12} /> Full
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-700 font-mono">{backup.name}</td>
                    <td className="px-6 py-3 text-sm text-gray-500">{formatDate(backup.createdAt)}</td>
                    <td className="px-6 py-3 text-sm text-gray-500">{backup.sizeFormatted}</td>
                    <td className="px-6 py-3 flex gap-2">
                      <button
                        onClick={() => downloadBackup(backup.name)}
                        className="p-1 text-[#407BA7] hover:bg-blue-50 rounded transition"
                        title="Download"
                      >
                        <Download size={18} />
                      </button>
                      <button
                        onClick={() => confirmDeleteBackup(backup)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded transition"
                        title="Hapus"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Disk Usage Detail */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Detail Penggunaan Disk</h2>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Total Penyimpanan</span>
              <span className="text-gray-600">{diskUsage?.usedFormatted || '0 B'} / {diskUsage?.totalFormatted || '0 B'}</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${(diskUsage?.percent || 0) > 75 ? 'bg-red-500' : (diskUsage?.percent || 0) > 50 ? 'bg-yellow-500' : 'bg-green-500'}`}
                style={{ width: `${diskUsage?.percent || 0}%` }}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Backup Files:</span>
              <span className="font-medium">{diskUsage?.backupsSize || '0 B'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Uploaded Files (foto, logo):</span>
              <span className="font-medium">{diskUsage?.uploadsSize || '0 B'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Warning Note */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex gap-3">
        <AlertCircle size={20} className="text-yellow-600 shrink-0" />
        <div>
          <p className="text-sm font-medium text-yellow-800">Catatan Penting</p>
          <p className="text-xs text-yellow-700 mt-1">
            Backup full mencakup database SQL dan file upload (foto tamu, logo instansi).
            File backup disimpan di folder server dan akan otomatis dihapus sesuai retention.
          </p>
        </div>
      </div>

      {/* Modal Konfigurasi Backup */}
      <AnimatePresence>
        {showConfigModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowConfigModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-800">Konfigurasi Backup</h3>
                <button
                  onClick={() => setShowConfigModal(false)}
                  className="p-1 rounded-lg hover:bg-gray-100 transition"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Auto Backup
                  </label>
                  <button
                    onClick={() => setTempConfig({ ...tempConfig, autoBackup: !tempConfig.autoBackup })}
                    className={`w-12 h-6 rounded-full transition ${tempConfig.autoBackup ? 'bg-[#407BA7]' : 'bg-gray-300'}`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${tempConfig.autoBackup ? 'translate-x-6' : 'translate-x-0.5'} mt-0.5`} />
                  </button>
                  <p className="text-xs text-gray-400 mt-1">
                    Backup akan dijalankan otomatis sesuai jadwal (via cron job)
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Frekuensi
                  </label>
                  <select
                    value={tempConfig.frequency}
                    onChange={(e) => setTempConfig({ ...tempConfig, frequency: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#407BA7]"
                    disabled={!tempConfig.autoBackup}
                  >
                    <option value="daily">Harian</option>
                    <option value="weekly">Mingguan</option>
                    <option value="monthly">Bulanan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Retention (hari)
                  </label>
                  <input
                    type="number"
                    value={tempConfig.retention}
                    onChange={(e) => setTempConfig({ ...tempConfig, retention: parseInt(e.target.value) || 30 })}
                    min={1}
                    max={365}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#407BA7]"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Backup akan otomatis dihapus setelah melebihi batas hari
                  </p>
                </div>
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <button
                      onClick={() => setTempConfig({ ...tempConfig, includeFiles: !tempConfig.includeFiles })}
                      className={`w-10 h-5 rounded-full transition ${tempConfig.includeFiles ? 'bg-[#407BA7]' : 'bg-gray-300'}`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full transition-transform ${tempConfig.includeFiles ? 'translate-x-5' : 'translate-x-0.5'} mt-0.5`} />
                    </button>
                    <span className="text-sm text-gray-700">Include file uploads (foto tamu, logo)</span>
                  </label>
                  <p className="text-xs text-gray-400 mt-1 ml-11">
                    Backup juga akan menyimpan file foto dan logo instansi
                  </p>
                </div>
              </div>
              <div className="flex gap-3 justify-end mt-6">
                <button
                  onClick={() => setShowConfigModal(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                >
                  Batal
                </button>
                <button
                  onClick={saveConfig}
                  disabled={savingConfig}
                  className="px-4 py-2 bg-[#407BA7] text-white rounded-lg hover:bg-[#356a8f] transition disabled:opacity-50"
                >
                  {savingConfig ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Konfirmasi Hapus Backup */}
      <AnimatePresence>
        {deleteBackupFile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setDeleteBackupFile(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-full bg-red-100">
                  <Trash2 size={24} className="text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Hapus Backup?</h3>
              </div>
              <p className="text-gray-600 mb-6">
                Apakah Anda yakin ingin menghapus backup &quot;{deleteBackupFile.name}&quot;?
                <br />
                <span className="text-red-500 text-sm">
                  Tindakan ini tidak dapat dibatalkan!
                </span>
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setDeleteBackupFile(null)}
                  className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                >
                  Batal
                </button>
                <button
                  onClick={handleDeleteBackup}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Hapus
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Success */}
      <AnimatePresence>
        {showSuccessModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowSuccessModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-full bg-green-100">
                  <RefreshCw size={24} className="text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Berhasil!</h3>
              </div>
              <p className="text-gray-600 whitespace-pre-line">{successMessage}</p>
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="px-4 py-2 bg-[#407BA7] text-white rounded-lg hover:bg-[#356a8f] transition"
                >
                  Tutup
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Error */}
      <AnimatePresence>
        {showErrorModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowErrorModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-full bg-red-100">
                  <AlertCircle size={24} className="text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Gagal!</h3>
              </div>
              <p className="text-gray-600">{errorMessage}</p>
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowErrorModal(false)}
                  className="px-4 py-2 bg-[#407BA7] text-white rounded-lg hover:bg-[#356a8f] transition"
                >
                  Tutup
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}