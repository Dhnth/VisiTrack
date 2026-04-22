'use client';

import { useEffect, useState } from 'react';
import {
  Calendar, Users, Clock,
  TrendingUp, UserCheck, RefreshCw,
  User, Building2, Briefcase
} from 'lucide-react';
import Image from 'next/image';
import { useParams } from 'next/navigation';

interface DashboardStats {
  total_guests_today: number;
  total_pending: number;
  total_active: number;
  total_employees: number;
  total_guests_this_month: number;
  pending_percent: number;
  active_percent: number;
  done_percent: number;
  rejected_percent: number;
}

interface Guest {
  id: number;
  name: string;
  institution: string | null;
  purpose: string;
  status: string;
  photo_url: string;
  check_in_at: string | null;
  created_at: string;
  employee_name: string;
  employee_department: string;
}

interface ChartData {
  period: string;
  total: number;
}

export default function AdminDashboardPage() {
  const params = useParams();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [pendingGuests, setPendingGuests] = useState<Guest[]>([]);
  const [activeGuests, setActiveGuests] = useState<Guest[]>([]);
  const [chart, setChart] = useState<ChartData[]>([]);
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('week');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      const res = await fetch(`/api/admin/dashboard?period=${period}`);
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setPendingGuests(data.pendingGuests);
        setActiveGuests(data.activeGuests);
        setChart(data.chart);
      }
      setLoading(false);
    };
    fetchDashboard();
  }, [period]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const maxChart = Math.max(...chart.map(c => c.total), 1);

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
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">
            Selamat datang, Admin {params.slug}
          </p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard
          title="Kunjungan Hari Ini"
          value={stats?.total_guests_today || 0}
          icon={<Calendar size={20} />}
          color="bg-blue-50 text-blue-600"
        />
        <StatCard
          title="Pending Validasi"
          value={stats?.total_pending || 0}
          icon={<Clock size={20} />}
          color="bg-yellow-50 text-yellow-600"
        />
        <StatCard
          title="Sedang Berkunjung"
          value={stats?.total_active || 0}
          icon={<UserCheck size={20} />}
          color="bg-green-50 text-green-600"
        />
        <StatCard
          title="Total Karyawan"
          value={stats?.total_employees || 0}
          icon={<Users size={20} />}
          color="bg-purple-50 text-purple-600"
        />
        <StatCard
          title="Kunjungan Bulan Ini"
          value={stats?.total_guests_this_month || 0}
          icon={<TrendingUp size={20} />}
          color="bg-orange-50 text-orange-600"
        />
      </div>

      {/* Chart & Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Tren Kunjungan</h2>
            <div className="flex gap-2">
              {(['week', 'month', 'year'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-3 py-1 text-sm rounded-lg transition ${
                    period === p
                      ? 'bg-[#407BA7] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {p === 'week' ? '7 Hari' : p === 'month' ? 'Bulan' : 'Tahun'}
                </button>
              ))}
            </div>
          </div>
          <div className="relative h-64">
            <div className="absolute left-0 top-0 bottom-8 w-12 flex flex-col justify-between text-xs text-gray-400">
              <span>{maxChart}</span>
              <span>{Math.round(maxChart / 2)}</span>
              <span>0</span>
            </div>
            <div className="ml-12 h-full flex items-end gap-2">
              {chart.map((item, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className="w-full bg-linear-to-t from-[#407BA7] to-[#004E89] rounded-t-lg transition-all duration-500"
                    style={{ height: `${(item.total / maxChart) * 100}%`, minHeight: '4px' }}
                  />
                  <span className="text-xs text-gray-500">{item.period}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Distribusi Status</h2>
          <div className="space-y-3">
            <StatusBar label="Pending" value={stats?.pending_percent || 0} color="bg-yellow-500" />
            <StatusBar label="Sedang Berkunjung" value={stats?.active_percent || 0} color="bg-green-500" />
            <StatusBar label="Selesai" value={stats?.done_percent || 0} color="bg-blue-500" />
            <StatusBar label="Ditolak" value={stats?.rejected_percent || 0} color="bg-red-500" />
          </div>
        </div>
      </div>

      {/* Pending Guests (Hanya Lihat, Tanpa Tombol Aksi) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Guests - View Only */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-yellow-50">
            <h2 className="text-lg font-semibold text-yellow-800 flex items-center gap-2">
              <Clock size={18} /> Menunggu Validasi ({pendingGuests.length})
            </h2>
            <p className="text-xs text-yellow-600 mt-1">*Hanya melihat, validasi dilakukan oleh petugas</p>
          </div>
          <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
            {pendingGuests.length === 0 ? (
              <p className="text-center text-gray-400 py-8">Tidak ada tamu pending</p>
            ) : (
              pendingGuests.map((guest) => (
                <GuestCardViewOnly
                  key={guest.id}
                  guest={guest}
                  formatDate={formatDate}
                />
              ))
            )}
          </div>
        </div>

        {/* Active Guests - View Only */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-green-50">
            <h2 className="text-lg font-semibold text-green-800 flex items-center gap-2">
              <UserCheck size={18} /> Sedang Berkunjung ({activeGuests.length})
            </h2>
            <p className="text-xs text-green-600 mt-1">*Hanya melihat, checkout dilakukan oleh petugas</p>
          </div>
          <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
            {activeGuests.length === 0 ? (
              <p className="text-center text-gray-400 py-8">Tidak ada tamu aktif</p>
            ) : (
              activeGuests.map((guest) => (
                <GuestCardViewOnly
                  key={guest.id}
                  guest={guest}
                  formatDate={formatDate}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== HELPER COMPONENTS ====================

function StatCard({ title, value, icon, color }: { title: string; value: number; icon: React.ReactNode; color: string }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div className={`p-2 rounded-lg ${color} w-fit mb-3`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-gray-800">{value.toLocaleString()}</p>
      <p className="text-xs text-gray-500 mt-1">{title}</p>
    </div>
  );
}

function StatusBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-600">{label}</span>
        <span className="text-gray-500">{value}%</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

// Guest Card untuk Admin (HANYA LIHAT, tanpa tombol)
function GuestCardViewOnly({ guest, formatDate }: { guest: Guest; formatDate: (date: string) => string }) {
  return (
    <div className="p-4 hover:bg-gray-50 transition">
      <div className="flex gap-4">
        {/* Photo */}
        <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden shrink-0">
          {guest.photo_url ? (
            <Image src={guest.photo_url} alt={guest.name} width={48} height={48} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-300">
              <User size={24} className="text-gray-500" />
            </div>
          )}
        </div>
        {/* Info */}
        <div className="flex-1">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="font-semibold text-gray-800">{guest.name}</h3>
            <span className="text-xs text-gray-400">{formatDate(guest.created_at)}</span>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-gray-500">
            {guest.institution && (
              <span className="flex items-center gap-1"><Building2 size={12} /> {guest.institution}</span>
            )}
            <span className="flex items-center gap-1"><Briefcase size={12} /> {guest.purpose}</span>
            <span className="flex items-center gap-1"><Users size={12} /> {guest.employee_name} ({guest.employee_department})</span>
          </div>
          {/* Status Badge */}
          <div className="mt-2">
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              guest.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
              guest.status === 'active' ? 'bg-green-100 text-green-700' :
              guest.status === 'done' ? 'bg-blue-100 text-blue-700' :
              'bg-red-100 text-red-700'
            }`}>
              {guest.status === 'pending' ? 'Menunggu Validasi' :
               guest.status === 'active' ? 'Sedang Berkunjung' :
               guest.status === 'done' ? 'Selesai' : 'Ditolak'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}