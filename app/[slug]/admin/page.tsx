'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import {
  Calendar, Users, Clock, TrendingUp, UserCheck, 
  RefreshCw, Award, Eye, Activity, Zap, User,
  Building2, Briefcase, ChevronRight
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';

interface DashboardStats {
  total_guests_today: number;
  total_guests_this_month: number;
  total_guests_last_month: number;
  total_pending: number;
  total_active: number;
  total_employees: number;
  active_visits: number;
  guest_growth: number;
}

interface ChartData {
  period: string;
  total: number;
}

interface TopEmployee {
  id: number;
  name: string;
  department: string;
  total_visits: number;
}

interface HourlyActivity {
  hour: number;
  total: number;
}

interface Guest {
  id: number;
  name: string;
  institution: string | null;
  purpose: string;
  status: string;
  photo_url: string;
  created_at: string;
  employee_name: string;
  employee_department: string;
}

interface RecentActivity {
  id: number;
  action: string;
  description: string;
  user_name: string;
  created_at: string;
}

// Warna untuk bar chart jam sibuk
const HOUR_COLORS = [
  '#94a3b8', '#94a3b8', '#94a3b8', '#94a3b8', '#94a3b8', '#94a3b8',
  '#fbbf24', '#f59e0b', '#f97316', '#ef4444', '#ef4444', '#ef4444',
  '#10b981', '#10b981', '#10b981', '#10b981', '#10b981', '#10b981',
  '#3b82f6', '#3b82f6', '#3b82f6', '#8b5cf6', '#8b5cf6', '#8b5cf6'
];

export default function AdminDashboardPage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [topEmployees, setTopEmployees] = useState<TopEmployee[]>([]);
  const [hourlyActivity, setHourlyActivity] = useState<HourlyActivity[]>([]);
  const [pendingGuests, setPendingGuests] = useState<Guest[]>([]);
  const [activeGuests, setActiveGuests] = useState<Guest[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [chartRange, setChartRange] = useState<'7d' | '30d' | '12m'>('7d');
  const [loading, setLoading] = useState(true);

  // FETCH DATA - langsung di dalam useEffect
  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      const res = await fetch(`/api/admin/dashboard?chartRange=${chartRange}`);
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setChartData(data.chartData);
        setTopEmployees(data.topEmployees);
        setHourlyActivity(data.hourlyActivity);
        setPendingGuests(data.pendingGuests);
        setActiveGuests(data.activeGuests);
        setRecentActivities(data.recentActivities);
      }
      setLoading(false);
    };
    fetchDashboard();
  }, [chartRange]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 4 && hour < 11) return "Selamat Pagi";
    if (hour >= 11 && hour < 15) return "Selamat Siang";
    if (hour >= 15 && hour < 18) return "Selamat Sore";
    return "Selamat Malam";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diff < 60) return `${diff} detik lalu`;
    if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
    return date.toLocaleDateString('id-ID');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#407BA7]"></div>
      </div>
    );
  }

  const maxChart = Math.max(...chartData.map(c => c.total), 1);

  return (
    <div className="space-y-6">
      {/* Header with Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-800">{getGreeting()}, Admin</h1>
            <span className="text-sm text-gray-400">
              {new Date().toLocaleDateString('id-ID', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
              })}
            </span>
          </div>
          <p className="text-gray-500 text-sm mt-1">
            Ringkasan kinerja instansi {slug}
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

      {/* Main KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard
          title="Kunjungan Hari Ini"
          value={stats?.total_guests_today || 0}
          icon={<Calendar size={22} />}
          color="bg-blue-50"
          iconColor="text-blue-600"
        />
        <KpiCard
          title="Kunjungan Bulan Ini"
          value={stats?.total_guests_this_month?.toLocaleString() || 0}
          trend={stats?.guest_growth}
          subValue={`vs ${stats?.total_guests_last_month?.toLocaleString() || 0} bulan lalu`}
          icon={<TrendingUp size={22} />}
          color="bg-emerald-50"
          iconColor="text-emerald-600"
        />
        <KpiCard
          title="Sedang Berkunjung"
          value={stats?.active_visits || 0}
          icon={<UserCheck size={22} />}
          color="bg-green-50"
          iconColor="text-green-600"
        />
        <KpiCard
          title="Total Karyawan"
          value={stats?.total_employees || 0}
          icon={<Users size={22} />}
          color="bg-purple-50"
          iconColor="text-purple-600"
        />
      </div>

      {/* Secondary Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <SmallStatCard title="Pending Validasi" value={stats?.total_pending || 0} icon={<Clock size={14} />} color="text-yellow-600" bgColor="bg-yellow-50" />
        <SmallStatCard title="Sedang Berkunjung" value={stats?.total_active || 0} icon={<Activity size={14} />} color="text-green-600" bgColor="bg-green-50" />
        <SmallStatCard title="Total Karyawan" value={stats?.total_employees || 0} icon={<Users size={14} />} color="text-teal-600" bgColor="bg-teal-50" />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex justify-between items-center mb-5">
            <div>
              <h2 className="text-base font-semibold text-gray-800">Tren Kunjungan</h2>
              <p className="text-xs text-gray-400 mt-0.5">Perkembangan jumlah tamu dari waktu ke waktu</p>
            </div>
            <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
              {[
                { key: '7d', label: '7 Hari' },
                { key: '30d', label: '30 Hari' },
                { key: '12m', label: '12 Bulan' }
              ].map((option) => (
                <button
                  key={option.key}
                  onClick={() => setChartRange(option.key as typeof chartRange)}
                  className={`px-3 py-1.5 text-xs rounded-md transition ${
                    chartRange === option.key
                      ? 'bg-white shadow-sm text-[#407BA7] font-medium'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="period" tick={{ fontSize: 11 }} stroke="#888" tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} stroke="#888" tickLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', fontSize: '12px' }}
                  formatter={(value) => [`${value} tamu`, 'Kunjungan']}
                />
                <Line 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#407BA7" 
                  strokeWidth={2.5}
                  dot={{ fill: '#407BA7', strokeWidth: 2, r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Peak Hours Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-base font-semibold text-gray-800 mb-3">Jam Sibuk Kunjungan</h2>
          <p className="text-xs text-gray-400 mb-4">Aktivitas tertinggi dalam 7 hari terakhir</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyActivity} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="hour" tick={{ fontSize: 10 }} stroke="#888" tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} stroke="#888" tickLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', fontSize: '12px' }}
                  formatter={(value) => [`${value} kunjungan`, 'Jumlah']}
                  labelFormatter={(label) => `${label}:00 - ${label + 1}:00`}
                />
                <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                  {hourlyActivity.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={HOUR_COLORS[entry.hour]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-center text-xs text-gray-400 mt-2">
            🕐 Warna merah = jam tersibuk
          </p>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Employees */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
            <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
              <Award size={18} className="text-yellow-500" />
              Karyawan Paling Sering Dikunjungi
            </h2>
          </div>
          <div className="divide-y divide-gray-100">
            {topEmployees.length === 0 ? (
              <p className="text-center text-gray-400 py-8">Belum ada data</p>
            ) : (
              topEmployees.map((emp, idx) => (
                <div key={emp.id} className="px-5 py-3 hover:bg-gray-50 transition">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">
                        {idx + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{emp.name}</p>
                        <p className="text-xs text-gray-400">{emp.department}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-[#407BA7]">{emp.total_visits.toLocaleString()}</p>
                      <p className="text-xs text-gray-400">kunjungan</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="px-5 py-3 border-t border-gray-100 bg-gray-50">
            <Link href={`/${slug}/admin/employees`} className="text-sm text-[#407BA7] hover:underline flex items-center gap-1">
              Lihat semua karyawan <ChevronRight size={14} />
            </Link>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
            <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
              <Activity size={18} className="text-blue-500" />
              Aktivitas Terbaru
            </h2>
          </div>
          <div className="divide-y divide-gray-100">
            {recentActivities.length === 0 ? (
              <p className="text-center text-gray-400 py-8">Belum ada aktivitas</p>
            ) : (
              recentActivities.map((activity) => (
                <div key={activity.id} className="px-5 py-3 hover:bg-gray-50 transition">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-gray-800">{activity.description}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-gray-400">{activity.user_name || 'System'}</span>
                        <span className="text-xs text-gray-400">{formatDate(activity.created_at)}</span>
                      </div>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600 ml-3">
                      {activity.action}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="px-5 py-3 border-t border-gray-100 bg-gray-50">
            <Link href={`/${slug}/admin/activity-logs`} className="text-sm text-[#407BA7] hover:underline flex items-center gap-1">
              Lihat semua aktivitas <Eye size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* Pending & Active Guests Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Guests */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 bg-yellow-50">
            <h2 className="text-base font-semibold text-yellow-800 flex items-center gap-2">
              <Clock size={18} /> Menunggu Validasi ({pendingGuests.length})
            </h2>
            <p className="text-xs text-yellow-600 mt-0.5">*Hanya melihat, validasi dilakukan oleh petugas</p>
          </div>
          <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
            {pendingGuests.length === 0 ? (
              <p className="text-center text-gray-400 py-8">Tidak ada tamu pending</p>
            ) : (
              pendingGuests.map((guest) => (
                <GuestCard key={guest.id} guest={guest} type="pending" />
              ))
            )}
          </div>
        </div>

        {/* Active Guests */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 bg-green-50">
            <h2 className="text-base font-semibold text-green-800 flex items-center gap-2">
              <UserCheck size={18} /> Sedang Berkunjung ({activeGuests.length})
            </h2>
            <p className="text-xs text-green-600 mt-0.5">*Hanya melihat, checkout dilakukan oleh petugas</p>
          </div>
          <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
            {activeGuests.length === 0 ? (
              <p className="text-center text-gray-400 py-8">Tidak ada tamu aktif</p>
            ) : (
              activeGuests.map((guest) => (
                <GuestCard key={guest.id} guest={guest} type="active" />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== HELPER COMPONENTS ====================

function KpiCard({ 
  title, 
  value, 
  subValue, 
  trend, 
  icon, 
  color, 
  iconColor 
}: { 
  title: string; 
  value: string | number; 
  subValue?: string; 
  trend?: number; 
  icon: React.ReactNode; 
  color: string; 
  iconColor: string;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <div className="flex justify-between items-start">
        <div className={`p-2 rounded-lg ${color}`}>
          <div className={iconColor}>{icon}</div>
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-0.5 text-xs font-medium ${trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-500'}`}>
            {trend > 0 ? <TrendingUp size={12} /> : null}
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-800 mt-3">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{title}</p>
      {subValue && <p className="text-xs text-gray-400 mt-1">{subValue}</p>}
    </div>
  );
}

function SmallStatCard({ title, value, icon, color, bgColor }: { 
  title: string; 
  value: number; 
  icon: React.ReactNode; 
  color: string; 
  bgColor: string;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3">
      <div className="flex items-center gap-2">
        <div className={`p-1 rounded ${bgColor}`}>
          <div className={color}>{icon}</div>
        </div>
        <div>
          <p className="text-lg font-bold text-gray-800">{value.toLocaleString()}</p>
          <p className="text-xs text-gray-400">{title}</p>
        </div>
      </div>
    </div>
  );
}

function GuestCard({ guest, type }: { guest: Guest; type: 'pending' | 'active' }) {
  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
            <span className="text-xs text-gray-400">{formatDateTime(guest.created_at)}</span>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-gray-500">
            {guest.institution && (
              <span className="flex items-center gap-1"><Building2 size={12} /> {guest.institution}</span>
            )}
            <span className="flex items-center gap-1"><Briefcase size={12} /> {guest.purpose}</span>
            <span className="flex items-center gap-1"><Users size={12} /> {guest.employee_name} ({guest.employee_department})</span>
          </div>
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