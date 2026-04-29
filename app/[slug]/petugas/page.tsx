'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import {
  UserCheck,
  Users,
  Clock,
  User,
  QrCode,
  FileText,
  PlusCircle,
  ChevronRight,
  Building,
  Briefcase
} from 'lucide-react';

// ============ TYPES ============
interface PendingGuest {
  id: number;
  name: string;
  institution: string | null;
  purpose: string;
  photo_url: string | null;
  created_at: string;
  employee_name: string | null;
  employee_department: string | null;
}

interface ActiveGuest {
  id: number;
  name: string;
  institution: string | null;
  purpose: string;
  photo_url: string | null;
  check_in_at: string;
  employee_name: string | null;
  employee_department: string | null;
}

interface DashboardStats {
  pending_count: number;
  active_count: number;
  today_count: number;
}

// Color palette
const colors = {
  primary: '#800016',
  primaryDark: '#A0001C',
  primaryDarker: '#C00021',
  primaryLight: '#FF002B',
  white: '#FFFFFF',
  secondary: '#407BA7',
  secondaryDark: '#004E89',
  secondaryDarker: '#002962',
  secondaryDarkest: '#00043A',
};

// ============ MAIN COMPONENT ============
export default function PetugasDashboard() {
  const params = useParams();
  const slug = params.slug as string;

  const [pendingList, setPendingList] = useState<PendingGuest[]>([]);
  const [activeList, setActiveList] = useState<ActiveGuest[]>([]);
  const [stats, setStats] = useState<DashboardStats>({ pending_count: 0, active_count: 0, today_count: 0 });
  const [loading, setLoading] = useState(true);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const fetchDashboard = async () => {
    try {
      const res = await fetch('/api/petugas/dashboard');
      const data = await res.json();
      if (data.success) {
        setPendingList(data.pending?.slice(0, 5) || []);
        setActiveList(data.active?.slice(0, 5) || []);
        setStats({
          pending_count: data.pending_count || 0,
          active_count: data.active_count || 0,
          today_count: data.today_count || 0,
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: colors.secondary }}></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: colors.secondaryDarkest }}>
            Dashboard Petugas
          </h1>
          <p className="text-gray-500 text-sm mt-1">Pantau dan kelola kunjungan tamu</p>
        </div>
        <Link
          href={`/${slug}/petugas/input-manual`}
          className="flex items-center gap-2 px-4 py-2 rounded-xl transition shadow-sm"
          style={{ backgroundColor: colors.secondary, color: colors.white }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.secondaryDark}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colors.secondary}
        >
          <PlusCircle size={18} />
          Input Manual Tamu
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl p-5 text-white cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          style={{ background: `linear-gradient(135deg, ${colors.secondary}, ${colors.secondaryDark})` }}
          onClick={() => window.location.href = `/${slug}/petugas/validasi`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">Menunggu Validasi</p>
              <p className="text-4xl font-bold mt-1">{stats.pending_count}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <UserCheck size={24} className="text-white" />
            </div>
          </div>
          <div className="mt-3 text-white/70 text-xs flex items-center gap-1">
            Lihat semua <ChevronRight size={12} />
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl p-5 cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          style={{ background: `linear-gradient(135deg, ${colors.white}, #f8f9fa)`, border: `1px solid ${colors.secondary}` }}
          onClick={() => window.location.href = `/${slug}/petugas/berkunjung`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Sedang Berkunjung</p>
              <p className="text-4xl font-bold mt-1" style={{ color: colors.secondaryDarkest }}>{stats.active_count}</p>
            </div>
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: `${colors.secondary}20` }}>
              <Users size={24} style={{ color: colors.secondary }} />
            </div>
          </div>
          <div className="mt-3 text-xs flex items-center gap-1" style={{ color: colors.secondary }}>
            Lihat semua <ChevronRight size={12} />
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl p-5 cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          style={{ background: `linear-gradient(135deg, ${colors.white}, #f8f9fa)`, border: `1px solid ${colors.secondary}` }}
          onClick={() => window.location.href = `/${slug}/petugas/history`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Kunjungan Hari Ini</p>
              <p className="text-4xl font-bold mt-1" style={{ color: colors.secondaryDarkest }}>{stats.today_count}</p>
            </div>
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: `${colors.secondary}20` }}>
              <Clock size={24} style={{ color: colors.secondary }} />
            </div>
          </div>
          <div className="mt-3 text-xs flex items-center gap-1" style={{ color: colors.secondary }}>
            Lihat semua <ChevronRight size={12} />
          </div>
        </motion.div>
      </div>

      {/* Two Columns: Pending & Active (Max 5 items each, no button) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Validation Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl shadow-sm overflow-hidden"
          style={{ backgroundColor: colors.white, border: `1px solid ${colors.secondary}20` }}
        >
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${colors.secondary}20`, background: `linear-gradient(135deg, ${colors.secondary}05, ${colors.white})` }}>
            <h2 className="font-semibold flex items-center gap-2" style={{ color: colors.secondaryDarkest }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: `${colors.secondary}15` }}>
                <UserCheck size={16} style={{ color: colors.secondary }} />
              </div>
              Menunggu Validasi
              {stats.pending_count > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs rounded-full" style={{ backgroundColor: `${colors.secondary}15`, color: colors.secondary }}>
                  {stats.pending_count}
                </span>
              )}
            </h2>
            {stats.pending_count > 5 && (
              <Link href={`/${slug}/petugas/validasi`} className="text-xs flex items-center gap-1 hover:underline" style={{ color: colors.secondary }}>
                Lihat semua <ChevronRight size={12} />
              </Link>
            )}
          </div>
          <div className="p-4">
            <div className="space-y-3">
              {pendingList.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: `${colors.secondary}10` }}>
                    <UserCheck size={32} style={{ color: colors.secondary }} />
                  </div>
                  <p className="text-sm" style={{ color: colors.secondary }}>Tidak ada tamu yang menunggu validasi</p>
                </div>
              ) : (
                pendingList.map((guest) => (
                  <Link
                    key={guest.id}
                    href={`/${slug}/petugas/validasi/${guest.id}`}
                    className="block p-3 rounded-xl transition-all duration-200 hover:shadow-md"
                    style={{ backgroundColor: `${colors.secondary}05`, border: `1px solid ${colors.secondary}10` }}
                  >
                    <div className="flex gap-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0" style={{ backgroundColor: `${colors.secondary}10` }}>
                        {guest.photo_url ? (
                          <Image src={guest.photo_url} alt={guest.name} width={48} height={48} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <User size={20} style={{ color: colors.secondary }} />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate" style={{ color: colors.secondaryDarkest }}>{guest.name}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Briefcase size={10} style={{ color: colors.secondary }} />
                          <p className="text-xs truncate" style={{ color: colors.secondary }}>{guest.purpose}</p>
                        </div>
                        {guest.institution && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <Building size={10} style={{ color: colors.secondary }} />
                            <p className="text-xs truncate" style={{ color: colors.secondary }}>{guest.institution}</p>
                          </div>
                        )}
                        {guest.employee_name && (
                          <p className="text-xs mt-1" style={{ color: colors.secondaryDark }}>Tujuan: {guest.employee_name}</p>
                        )}
                        <p className="text-xs mt-1" style={{ color: colors.secondaryDarker }}>{formatDate(guest.created_at)}</p>
                      </div>
                      <div className="flex-shrink-0">
                        <span className="px-2 py-1 text-xs rounded-full" style={{ backgroundColor: `${colors.secondary}15`, color: colors.secondary }}>
                          Pending
                        </span>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </motion.div>

        {/* Active Visitors Section (No Pulang Button) */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-2xl shadow-sm overflow-hidden"
          style={{ backgroundColor: colors.white, border: `1px solid ${colors.secondary}20` }}
        >
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${colors.secondary}20`, background: `linear-gradient(135deg, ${colors.secondary}05, ${colors.white})` }}>
            <h2 className="font-semibold flex items-center gap-2" style={{ color: colors.secondaryDarkest }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: `${colors.secondary}15` }}>
                <Users size={16} style={{ color: colors.secondary }} />
              </div>
              Sedang Berkunjung
              {stats.active_count > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs rounded-full" style={{ backgroundColor: `${colors.secondary}15`, color: colors.secondary }}>
                  {stats.active_count}
                </span>
              )}
            </h2>
            {stats.active_count > 5 && (
              <Link href={`/${slug}/petugas/berkunjung`} className="text-xs flex items-center gap-1 hover:underline" style={{ color: colors.secondary }}>
                Lihat semua <ChevronRight size={12} />
              </Link>
            )}
          </div>
          <div className="p-4">
            <div className="space-y-3">
              {activeList.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: `${colors.secondary}10` }}>
                    <Users size={32} style={{ color: colors.secondary }} />
                  </div>
                  <p className="text-sm" style={{ color: colors.secondary }}>Tidak ada tamu yang sedang berkunjung</p>
                </div>
              ) : (
                activeList.map((guest) => (
                  <Link
                    key={guest.id}
                    href={`/${slug}/petugas/berkunjung/${guest.id}`}
                    className="block p-3 rounded-xl transition-all duration-200 hover:shadow-md"
                    style={{ backgroundColor: `${colors.secondary}05`, border: `1px solid ${colors.secondary}10` }}
                  >
                    <div className="flex gap-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0" style={{ backgroundColor: `${colors.secondary}10` }}>
                        {guest.photo_url ? (
                          <Image src={guest.photo_url} alt={guest.name} width={48} height={48} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <User size={20} style={{ color: colors.secondary }} />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate" style={{ color: colors.secondaryDarkest }}>{guest.name}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Briefcase size={10} style={{ color: colors.secondary }} />
                          <p className="text-xs truncate" style={{ color: colors.secondary }}>{guest.purpose}</p>
                        </div>
                        {guest.institution && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <Building size={10} style={{ color: colors.secondary }} />
                            <p className="text-xs truncate" style={{ color: colors.secondary }}>{guest.institution}</p>
                          </div>
                        )}
                        {guest.employee_name && (
                          <p className="text-xs mt-1" style={{ color: colors.secondaryDark }}>Tujuan: {guest.employee_name}</p>
                        )}
                        <p className="text-xs mt-1" style={{ color: colors.secondaryDarker }}>
                          Check in: {formatTime(guest.check_in_at)}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <span className="px-2 py-1 text-xs rounded-full" style={{ backgroundColor: `${colors.secondary}15`, color: colors.secondary }}>
                          Aktif
                        </span>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Link
          href={`/${slug}/petugas/qrcode`}
          className="rounded-xl p-4 text-center transition-all duration-200 hover:shadow-md transform hover:-translate-y-0.5"
          style={{ backgroundColor: colors.white, border: `1px solid ${colors.secondary}20` }}
        >
          <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 transition" style={{ backgroundColor: `${colors.secondary}10` }}>
            <QrCode size={22} style={{ color: colors.secondary }} />
          </div>
          <p className="text-sm font-medium" style={{ color: colors.secondaryDarkest }}>QR Code Tamu</p>
        </Link>
        
        <Link
          href={`/${slug}/petugas/validasi`}
          className="rounded-xl p-4 text-center transition-all duration-200 hover:shadow-md transform hover:-translate-y-0.5"
          style={{ backgroundColor: colors.white, border: `1px solid ${colors.secondary}20` }}
        >
          <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 transition" style={{ backgroundColor: `${colors.secondary}10` }}>
            <UserCheck size={22} style={{ color: colors.secondary }} />
          </div>
          <p className="text-sm font-medium" style={{ color: colors.secondaryDarkest }}>Validasi Tamu</p>
          {stats.pending_count > 0 && (
            <span className="inline-block mt-1 px-2 py-0.5 text-xs rounded-full" style={{ backgroundColor: `${colors.secondary}15`, color: colors.secondary }}>
              {stats.pending_count} pending
            </span>
          )}
        </Link>
        
        <Link
          href={`/${slug}/petugas/berkunjung`}
          className="rounded-xl p-4 text-center transition-all duration-200 hover:shadow-md transform hover:-translate-y-0.5"
          style={{ backgroundColor: colors.white, border: `1px solid ${colors.secondary}20` }}
        >
          <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 transition" style={{ backgroundColor: `${colors.secondary}10` }}>
            <Users size={22} style={{ color: colors.secondary }} />
          </div>
          <p className="text-sm font-medium" style={{ color: colors.secondaryDarkest }}>Tamu Berkunjung</p>
          {stats.active_count > 0 && (
            <span className="inline-block mt-1 px-2 py-0.5 text-xs rounded-full" style={{ backgroundColor: `${colors.secondary}15`, color: colors.secondary }}>
              {stats.active_count} aktif
            </span>
          )}
        </Link>
        
        <Link
          href={`/${slug}/petugas/history`}
          className="rounded-xl p-4 text-center transition-all duration-200 hover:shadow-md transform hover:-translate-y-0.5"
          style={{ backgroundColor: colors.white, border: `1px solid ${colors.secondary}20` }}
        >
          <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 transition" style={{ backgroundColor: `${colors.secondary}10` }}>
            <FileText size={22} style={{ color: colors.secondary }} />
          </div>
          <p className="text-sm font-medium" style={{ color: colors.secondaryDarkest }}>History Hari Ini</p>
          <span className="inline-block mt-1 px-2 py-0.5 text-xs rounded-full" style={{ backgroundColor: `${colors.secondary}15`, color: colors.secondary }}>
            {stats.today_count} kunjungan
          </span>
        </Link>
      </div>
    </div>
  );
}