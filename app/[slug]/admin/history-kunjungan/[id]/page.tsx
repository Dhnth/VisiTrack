'use client';

import { JSX, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowLeft, User, Building, Briefcase, Calendar, Clock,
  CheckCircle, XCircle, AlertCircle, Users, FileText, Printer, Download
} from 'lucide-react';

interface GuestDetail {
  id: number;
  name: string;
  nik: string | null;
  institution: string | null;
  purpose: string;
  photo_url: string | null;
  status: string;
  check_in_at: string | null;
  check_out_at: string | null;
  created_at: string;
  updated_at: string;
  employee_name: string | null;
  employee_department: string | null;
  employee_nip: string | null;
  created_by_name: string | null;
  instance_name?: string;
  instance_slug?: string;
}

const statusConfig: Record<string, { text: string; color: string; bg: string; icon: JSX.Element }> = {
  pending: {
    text: 'Pending',
    color: 'text-yellow-700',
    bg: 'bg-yellow-100',
    icon: <AlertCircle size={20} className="text-yellow-600" />
  },
  active: {
    text: 'Sedang Berkunjung',
    color: 'text-green-700',
    bg: 'bg-green-100',
    icon: <CheckCircle size={20} className="text-green-600" />
  },
  done: {
    text: 'Selesai',
    color: 'text-blue-700',
    bg: 'bg-blue-100',
    icon: <CheckCircle size={20} className="text-blue-600" />
  },
  rejected: {
    text: 'Ditolak',
    color: 'text-red-700',
    bg: 'bg-red-100',
    icon: <XCircle size={20} className="text-red-600" />
  },
};

export default function HistoryDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const id = params.id as string;

  const [guest, setGuest] = useState<GuestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/admin/history?id=${id}`);
        const data = await res.json();
        
        if (data.success && data.guest) {
          setGuest(data.guest);
        } else {
          setError(data.error || 'Gagal memuat data');
        }
      } catch (err) {
        console.error('Error fetching detail:', err);
        setError('Terjadi kesalahan saat memuat data');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDetail();
    }
  }, [id]);

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#407BA7]"></div>
      </div>
    );
  }

  if (error || !guest) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Error</h2>
          <p className="text-gray-500">{error || 'Data tidak ditemukan'}</p>
          <Link
            href={`/${slug}/admin/history-kunjungan`}
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-[#407BA7] text-white rounded-lg hover:bg-[#356a8f] transition"
          >
            <ArrowLeft size={16} />
            Kembali ke History
          </Link>
        </div>
      </div>
    );
  }

  const status = statusConfig[guest.status] || statusConfig.pending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            href={`/${slug}/admin/history-kunjungan`}
            className="inline-flex items-center gap-2 text-gray-500 hover:text-[#407BA7] transition mb-2"
          >
            <ArrowLeft size={16} />
            Kembali ke History
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Detail Kunjungan</h1>
          <p className="text-gray-500 text-sm mt-1">
            Informasi lengkap kunjungan tamu
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Photo & Status */}
        <div className="lg:col-span-1 space-y-6">
          {/* Photo Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
          >
            <div className="p-4 border-b border-gray-100 bg-gray-50">
              <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                <User size={18} /> Foto Tamu
              </h2>
            </div>
            <div className="p-6 flex justify-center">
              <div className="relative">
                {guest.photo_url ? (
                  <Image
                    src={guest.photo_url}
                    alt={guest.name}
                    width={200}
                    height={200}
                    className="rounded-lg object-cover border border-gray-200"
                  />
                ) : (
                  <div className="w-48 h-48 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200">
                    <User size={64} className="text-gray-400" />
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Status Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
          >
            <div className="p-4 border-b border-gray-100 bg-gray-50">
              <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                <FileText size={18} /> Status Kunjungan
              </h2>
            </div>
            <div className="p-6">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${status.bg}`}>
                {status.icon}
                <span className={`font-medium ${status.color}`}>{status.text}</span>
              </div>
              
              <div className="mt-4 space-y-2 text-sm">
                {guest.check_in_at && (
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500">Check In</span>
                    <span className="font-medium text-gray-700">{formatDateTime(guest.check_in_at)}</span>
                  </div>
                )}
                {guest.check_out_at && (
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500">Check Out</span>
                    <span className="font-medium text-gray-700">{formatDateTime(guest.check_out_at)}</span>
                  </div>
                )}
                <div className="flex justify-between py-2">
                  <span className="text-gray-500">Durasi</span>
                  <span className="font-medium text-gray-700">
                    {guest.check_in_at && guest.check_out_at ? (
                      (() => {
                        const start = new Date(guest.check_in_at);
                        const end = new Date(guest.check_out_at);
                        const diffMs = end.getTime() - start.getTime();
                        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                        const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                        return `${diffHours} jam ${diffMinutes} menit`;
                      })()
                    ) : guest.check_in_at ? 'Masih berkunjung' : '-'}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column - Guest Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Guest Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
          >
            <div className="p-4 border-b border-gray-100 bg-gray-50">
              <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                <User size={18} /> Informasi Tamu
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-wider">Nama Lengkap</label>
                  <p className="text-gray-800 font-medium mt-1">{guest.name}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-wider">NIK</label>
                  <p className="text-gray-800 mt-1">{guest.nik || '-'}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-wider">Asal Instansi</label>
                  <p className="text-gray-800 mt-1 flex items-center gap-1">
                    <Building size={14} className="text-gray-400" />
                    {guest.institution || '-'}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-wider">Tujuan Kunjungan</label>
                  <p className="text-gray-800 mt-1 flex items-center gap-1">
                    <Briefcase size={14} className="text-gray-400" />
                    {guest.purpose}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-wider">Tanggal Kunjungan</label>
                  <p className="text-gray-800 mt-1 flex items-center gap-1">
                    <Calendar size={14} className="text-gray-400" />
                    {formatDate(guest.created_at)}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-wider">Waktu Kunjungan</label>
                  <p className="text-gray-800 mt-1 flex items-center gap-1">
                    <Clock size={14} className="text-gray-400" />
                    {formatTime(guest.created_at)}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Employee Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
          >
            <div className="p-4 border-b border-gray-100 bg-gray-50">
              <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                <Users size={18} /> Informasi Karyawan Tujuan
              </h2>
            </div>
            <div className="p-6">
              {guest.employee_name ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-400 uppercase tracking-wider">Nama Karyawan</label>
                    <p className="text-gray-800 font-medium mt-1">{guest.employee_name}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 uppercase tracking-wider">NIP</label>
                    <p className="text-gray-800 mt-1">{guest.employee_nip || '-'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs text-gray-400 uppercase tracking-wider">Departemen</label>
                    <p className="text-gray-800 mt-1">{guest.employee_department || '-'}</p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">Tidak ada data karyawan yang dituju</p>
              )}
            </div>
          </motion.div>

          {/* Validation Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
          >
            <div className="p-4 border-b border-gray-100 bg-gray-50">
              <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                <CheckCircle size={18} /> Informasi Validasi
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-wider">Divalidasi Oleh</label>
                  <p className="text-gray-800 mt-1">{guest.created_by_name || 'System (Input Manual)'}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-wider">Waktu Validasi</label>
                  <p className="text-gray-800 mt-1">{formatDateTime(guest.check_in_at || guest.created_at)}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs text-gray-400 uppercase tracking-wider">Catatan</label>
                  <p className="text-gray-800 mt-1">
                    {guest.status === 'pending' && 'Menunggu validasi oleh petugas'}
                    {guest.status === 'active' && 'Tamu sedang berkunjung'}
                    {guest.status === 'done' && 'Kunjungan selesai'}
                    {guest.status === 'rejected' && 'Kunjungan ditolak'}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <Link
              href={`/${slug}/admin/history-kunjungan`}
              className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
            >
              Kembali
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}