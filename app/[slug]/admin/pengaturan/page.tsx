'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings, QrCode, Building2, Upload, Save, KeyRound, AlertCircle, CheckCircle, RefreshCw,
  HelpCircle, X, Clock, Shield, FileSpreadsheet
} from 'lucide-react';
import Image from 'next/image';

interface InstanceProfile {
  name: string;
  slug: string;
  address: string;
  phone: string;
  logo: string | null;
}

interface QrSettings {
  qr_mode: 'static' | 'dynamic';
  token_interval: number | null;
}

interface ImportSettings {
  defaultPassword: string;
}

// Modal Info Component
function InfoModal({ isOpen, onClose, title, content, icon }: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
  icon: React.ReactNode;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-blue-100">
                  {icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
              </div>
              <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100">
                <X size={20} />
              </button>
            </div>
            <p className="text-gray-600 leading-relaxed">{content}</p>
            <div className="flex justify-end mt-6">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-[#407BA7] text-white rounded-lg hover:bg-[#356a8f] transition"
              >
                Tutup
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function PengaturanPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profile, setProfile] = useState<InstanceProfile>({
    name: '',
    slug: '',
    address: '',
    phone: '',
    logo: null,
  });
  const [qrSettings, setQrSettings] = useState<QrSettings>({
    qr_mode: 'static',
    token_interval: null,
  });
  const [importSettings, setImportSettings] = useState<ImportSettings>({
    defaultPassword: 'password123',
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modal states
  const [infoModal, setInfoModal] = useState<{
    isOpen: boolean;
    title: string;
    content: string;
    icon: React.ReactNode;
  }>({
    isOpen: false,
    title: '',
    content: '',
    icon: null,
  });

  // FETCH DATA
  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      if (data.success) {
        setProfile(data.instance);
        setQrSettings(data.qrSettings);
        setImportSettings(data.importSettings);
      }
      setLoading(false);
    };
    fetchSettings();
  }, []);

  const saveProfile = async () => {
    setSaving(true);
    const res = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: profile.name,
        address: profile.address,
        phone: profile.phone,
      }),
    });
    const data = await res.json();
    if (data.success) {
      setMessage({ type: 'success', text: data.message });
      setTimeout(() => setMessage(null), 3000);
    } else {
      setMessage({ type: 'error', text: data.error });
      setTimeout(() => setMessage(null), 3000);
    }
    setSaving(false);
  };

  const saveQrSettings = async () => {
    setSaving(true);
    const res = await fetch('/api/admin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        qr_mode: qrSettings.qr_mode,
        token_interval: qrSettings.token_interval,
      }),
    });
    const data = await res.json();
    if (data.success) {
      setMessage({ type: 'success', text: data.message });
      setTimeout(() => setMessage(null), 3000);
    } else {
      setMessage({ type: 'error', text: data.error });
      setTimeout(() => setMessage(null), 3000);
    }
    setSaving(false);
  };

  const saveImportSettings = async () => {
    setSaving(true);
    const res = await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        defaultPassword: importSettings.defaultPassword,
      }),
    });
    const data = await res.json();
    if (data.success) {
      setMessage({ type: 'success', text: data.message });
      setTimeout(() => setMessage(null), 3000);
    } else {
      setMessage({ type: 'error', text: data.error });
      setTimeout(() => setMessage(null), 3000);
    }
    setSaving(false);
  };

  const uploadLogo = async (file: File) => {
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/admin/settings/logo', {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    if (data.success) {
      setProfile({ ...profile, logo: data.logoUrl });
      setMessage({ type: 'success', text: data.message });
      setTimeout(() => setMessage(null), 3000);
    } else {
      setMessage({ type: 'error', text: data.error });
      setTimeout(() => setMessage(null), 3000);
    }
    setUploading(false);
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadLogo(file);
    }
  };

  // Info modal handlers
  const showQrInfo = () => {
    setInfoModal({
      isOpen: true,
      title: 'Pengaturan QR Code',
      content: 'STATIC: QR Code tetap berlaku selamanya. Cocok untuk tempat yang jarang berubah.\n\nDYNAMIC: QR Code akan expired setelah waktu tertentu dan otomatis regenerate. Cocok untuk keamanan lebih tinggi.',
      icon: <QrCode size={24} className="text-blue-600" />,
    });
  };

  const showProfileInfo = () => {
    setInfoModal({
      isOpen: true,
      title: 'Profil Instansi',
      content: 'Informasi dasar instansi Anda. Nama akan muncul di dashboard, alamat dan telepon untuk kontak. Logo akan ditampilkan di sidebar dan halaman login instansi.',
      icon: <Building2 size={24} className="text-blue-600" />,
    });
  };

  const showImportInfo = () => {
    setInfoModal({
      isOpen: true,
      title: 'Pengaturan Import Data',
      content: 'Password default ini akan digunakan untuk semua petugas dan PPID yang diimport melalui file Excel. Pastikan mengubah password setelah login pertama atau beritahu pengguna untuk segera mengganti password.',
      icon: <FileSpreadsheet size={24} className="text-blue-600" />,
    });
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
      <div className="flex items-center gap-3">
        <Settings className="size-7 text-[#407BA7]" />
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Pengaturan</h1>
          <p className="text-gray-500 text-sm mt-1">
            Kelola konfigurasi instansi {slug}
          </p>
        </div>
      </div>

      {/* Message Toast */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-20 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 ${
              message.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
            }`}
          >
            {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            <span>{message.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info Modal */}
      <InfoModal
        isOpen={infoModal.isOpen}
        onClose={() => setInfoModal({ ...infoModal, isOpen: false })}
        title={infoModal.title}
        content={infoModal.content}
        icon={infoModal.icon}
      />

      {/* 1. Profile Instansi */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Building2 size={18} /> Profil Instansi
            </h2>
            <button
              onClick={showProfileInfo}
              className="text-gray-400 hover:text-[#407BA7] transition"
              title="Informasi"
            >
              <HelpCircle size={18} />
            </button>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center border-2 border-gray-200">
              {profile.logo ? (
                <Image
                  src={profile.logo}
                  alt={profile.name}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Building2 size={32} className="text-gray-400" />
              )}
            </div>
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/png,image/jpeg,image/svg+xml"
                onChange={handleLogoChange}
                disabled={uploading}
                className="hidden"
              />
              <div className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                <Upload size={16} />
                <span>{uploading ? 'Uploading...' : 'Upload Logo'}</span>
              </div>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Instansi</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#407BA7]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug (URL)</label>
              <input
                type="text"
                value={profile.slug}
                disabled
                className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
              />
              <p className="text-xs text-gray-400 mt-1">Slug tidak dapat diubah</p>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
              <textarea
                value={profile.address}
                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#407BA7]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telepon</label>
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#407BA7]"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={saveProfile}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-[#800016] text-white rounded-lg hover:bg-[#A0001C] transition disabled:opacity-50"
            >
              {saving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
              Simpan Profil
            </button>
          </div>
        </div>
      </div>

      {/* 2. Pengaturan QR Code */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <QrCode size={18} /> Pengaturan QR Code
            </h2>
            <button
              onClick={showQrInfo}
              className="text-gray-400 hover:text-[#407BA7] transition"
              title="Informasi"
            >
              <HelpCircle size={18} />
            </button>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mode QR Code</label>
              <select
                value={qrSettings.qr_mode}
                onChange={(e) => setQrSettings({ ...qrSettings, qr_mode: e.target.value as 'static' | 'dynamic' })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#407BA7]"
              >
                <option value="static">Static (Token tidak pernah expired)</option>
                <option value="dynamic">Dynamic (Token expired otomatis)</option>
              </select>
            </div>
            {qrSettings.qr_mode === 'dynamic' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Interval Kadaluwarsa (menit)</label>
                <input
                  type="number"
                  value={qrSettings.token_interval || ''}
                  onChange={(e) => setQrSettings({ ...qrSettings, token_interval: parseInt(e.target.value) || 30 })}
                  min={1}
                  max={1440}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#407BA7]"
                />
                <p className="text-xs text-gray-400 mt-1">Token akan expired setelah X menit</p>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={saveQrSettings}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-[#800016] text-white rounded-lg hover:bg-[#A0001C] transition disabled:opacity-50"
            >
              {saving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
              Simpan QR Settings
            </button>
          </div>
        </div>
      </div>

      {/* 3. Pengaturan Import Data */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <KeyRound size={18} /> Pengaturan Import Data
            </h2>
            <button
              onClick={showImportInfo}
              className="text-gray-400 hover:text-[#407BA7] transition"
              title="Informasi"
            >
              <HelpCircle size={18} />
            </button>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Default Password untuk Import</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={importSettings.defaultPassword}
                onChange={(e) => setImportSettings({ defaultPassword: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#407BA7]"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Password default untuk petugas/PPID yang diimport via Excel
            </p>
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-xs text-yellow-700 flex items-center gap-1">
                <AlertCircle size={14} />
                Password tersimpan di database dalam bentuk hash (terenkripsi)
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={saveImportSettings}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-[#800016] text-white rounded-lg hover:bg-[#A0001C] transition disabled:opacity-50"
            >
              {saving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
              Simpan Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}