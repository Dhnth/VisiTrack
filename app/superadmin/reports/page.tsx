'use client';

import { useEffect, useState } from 'react';
import {
  Building2, Users, UserCheck, Calendar, Activity,
  Award, BarChart3, Download, FileText, AlertCircle,
  TrendingUp, Briefcase, PieChart, ChevronRight,
  Target, Zap, Filter, X, DollarSign, Clock
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RePieChart,
  Pie, Cell, Legend
} from 'recharts';

// ==================== TYPES ====================
interface OverviewStats {
  total_instances: number;
  active_instances: number;
  total_admins: number;
  total_petugas: number;
  total_employees: number;
  revenue_mrr: number;
  trial_instances: number;
  expired_instances: number;
}

interface Instance {
  id: number;
  name: string;
  slug: string;
}

interface InstanceRanking {
  id: number;
  name: string;
  total_visits: number;
  percentage: number;
}

interface AdminRanking {
  id: number;
  name: string;
  email: string;
  instance_name: string;
  total_guests_handled: number;
}

interface PlanDistribution {
  plan: string;
  count: number;
}

// Warna untuk multi-series area chart
const CHART_COLORS = [
  '#407BA7', '#FF002B', '#004E89', '#C00021', '#A0001C',
  '#002962', '#800016', '#00043A', '#FF5C73', '#4D94C8'
];

// ==================== HELPER COMPONENTS ====================
function StatCard({ title, value, icon, color }: { 
  title: string; 
  value: number | string; 
  icon: React.ReactNode; 
  color?: string 
}) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2 rounded-lg ${color || 'bg-blue-50'}`}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-800">{typeof value === 'number' ? value.toLocaleString('id-ID') : value}</p>
      <p className="text-xs text-gray-500 mt-1">{title}</p>
    </div>
  );
}

function TopPerformerCard({ admin, rank }: { admin: AdminRanking; rank: number }) {
  const rankColors = ['bg-yellow-500', 'bg-gray-400', 'bg-amber-600', 'bg-blue-500'];
  const rankColor = rank < 4 ? rankColors[rank - 1] : 'bg-gray-300';
  
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-full ${rankColor} flex items-center justify-center text-white font-bold text-sm`}>
          {rank}
        </div>
        <div>
          <p className="font-medium text-gray-800">{admin.name}</p>
          <p className="text-xs text-gray-400">{admin.instance_name}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-bold text-[#407BA7]">{admin.total_guests_handled}</p>
        <p className="text-xs text-gray-400">validasi</p>
      </div>
    </div>
  );
}

// Custom gradient untuk area chart
const createGradient = (color: string, id: string) => (
  <defs>
    <linearGradient id={`gradient-${id}`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor={color} stopOpacity={0.8} />
      <stop offset="100%" stopColor={color} stopOpacity={0.05} />
    </linearGradient>
  </defs>
);

// ==================== MAIN PAGE ====================
export default function SuperAdminReportsPage() {
  const [period, setPeriod] = useState<'month' | 'quarter' | 'year'>('month');
  const [selectedInstances, setSelectedInstances] = useState<string[]>([]);
  const [instances, setInstances] = useState<Instance[]>([]);
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<OverviewStats | null>(null);
  const [trend, setTrend] = useState<Record<string, string | number>[]>([]);
  const [instanceRanking, setInstanceRanking] = useState<InstanceRanking[]>([]);
  const [topAdmins, setTopAdmins] = useState<AdminRanking[]>([]);
  const [planDistribution, setPlanDistribution] = useState<PlanDistribution[]>([]);

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      const instanceIdsParam = selectedInstances.length === 0 ? 'all' : selectedInstances.join(',');
      const res = await fetch(`/api/superadmin/reports/visits?period=${period}&instanceIds=${instanceIdsParam}`);
      const data = await res.json();
      if (data.success) {
        setOverview(data.overview);
        setTrend(data.trend);
        setInstances(data.instances || []);
        setInstanceRanking(data.instanceRanking);
        setTopAdmins(data.topAdmins);
        setPlanDistribution(data.planDistribution);
      }
      setLoading(false);
    };
    fetchReports();
  }, [period, selectedInstances]);

  const handleInstanceToggle = (instanceId: number) => {
    const idStr = instanceId.toString();
    if (selectedInstances.includes(idStr)) {
      setSelectedInstances(selectedInstances.filter(id => id !== idStr));
    } else {
      setSelectedInstances([...selectedInstances, idStr]);
    }
  };

  const selectAllInstances = () => {
    setSelectedInstances([]);
  };

  const clearSelection = () => {
    setSelectedInstances([]);
  };

  const exportToCSV = () => {
    const headers = ['Periode', ...Object.keys(trend[0] || {}).filter(k => k !== 'period')];
    const rows = trend.map(t => [t.period, ...Object.keys(t).filter(k => k !== 'period').map(k => t[k])]);
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', `trend_${period}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const PLAN_COLORS = ['#407BA7', '#004E89', '#002962', '#00043A'];
  const areaKeys = Object.keys(trend[0] || {}).filter(key => key !== 'period');

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#407BA7]"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* ==================== HEADER ==================== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <span>Dashboard</span>
            <ChevronRight size={14} />
            <span className="text-gray-800">Reports & Analytics</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Platform Insights</h1>
          <p className="text-gray-500 text-sm mt-1">Laporan kinerja seluruh platform VisiTrack</p>
        </div>
        <div className="flex gap-2">
          {(['month', 'quarter', 'year'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                period === p ? 'bg-[#407BA7] text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {p === 'month' ? '30 Hari' : p === 'quarter' ? '3 Bulan' : 'Tahunan'}
            </button>
          ))}
        </div>
      </div>

      {/* ==================== KPI CARDS (Super Admin Only) ==================== */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <StatCard title="Total Instansi" value={overview?.total_instances || 0} icon={<Building2 size={18} className="text-[#407BA7]" />} color="bg-blue-50" />
        <StatCard title="Instansi Aktif" value={overview?.active_instances || 0} icon={<Target size={18} className="text-green-600" />} color="bg-green-50" />
        <StatCard title="Instansi Trial" value={overview?.trial_instances || 0} icon={<Clock size={18} className="text-yellow-600" />} color="bg-yellow-50" />
        <StatCard title="Instansi Expired" value={overview?.expired_instances || 0} icon={<AlertCircle size={18} className="text-red-500" />} color="bg-red-50" />
        <StatCard title="Total Admin" value={overview?.total_admins || 0} icon={<Users size={18} className="text-purple-600" />} color="bg-purple-50" />
        <StatCard title="Total Petugas" value={overview?.total_petugas || 0} icon={<UserCheck size={18} className="text-orange-600" />} color="bg-orange-50" />
        <StatCard title="Total Karyawan" value={overview?.total_employees || 0} icon={<Briefcase size={18} className="text-teal-600" />} color="bg-teal-50" />
        <StatCard title="MRR" value={`Rp ${(overview?.revenue_mrr || 0).toLocaleString('id-ID')}`} icon={<DollarSign size={18} className="text-green-600" />} color="bg-green-50" />
      </div>

      {/* ==================== CHARTS SECTION ==================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT: Multi-Series Area Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Tren Kunjungan</h2>
              <p className="text-xs text-gray-400 mt-1">Perkembangan jumlah tamu dari waktu ke waktu</p>
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              {/* Multi-Select Filter Instansi */}
              <div className="relative">
                <button
                  onClick={() => document.getElementById('instanceDropdown')?.classList.toggle('hidden')}
                  className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white hover:bg-gray-50"
                >
                  <Filter size={14} />
                  <span>Filter Instansi</span>
                  {selectedInstances.length > 0 && (
                    <span className="bg-[#407BA7] text-white text-xs px-1.5 rounded-full">{selectedInstances.length}</span>
                  )}
                </button>
                <div id="instanceDropdown" className="hidden absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-80 overflow-y-auto">
                  <div className="p-2 border-b border-gray-100 flex justify-between">
                    <button onClick={selectAllInstances} className="text-xs text-[#407BA7] hover:underline">Semua</button>
                    <button onClick={clearSelection} className="text-xs text-red-500 hover:underline">Reset</button>
                  </div>
                  {instances.map((inst) => (
                    <label key={inst.id} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedInstances.includes(inst.id.toString())}
                        onChange={() => handleInstanceToggle(inst.id)}
                        className="rounded border-gray-300 text-[#407BA7] focus:ring-[#407BA7]"
                      />
                      <span className="text-sm text-gray-700">{inst.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              <button onClick={exportToCSV} className="flex items-center gap-1 text-sm text-[#407BA7] hover:underline">
                <Download size={16} /> Export
              </button>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="period" tick={{ fontSize: 11 }} stroke="#888" />
                <YAxis tick={{ fontSize: 11 }} stroke="#888" />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', fontSize: '12px' }}
                />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px' }} />
                {areaKeys.map((key, idx) => (
                  <Area
                    key={key}
                    type="monotone"
                    dataKey={key}
                    name={key}
                    stackId="1"
                    stroke={CHART_COLORS[idx % CHART_COLORS.length]}
                    strokeWidth={3}
                    fill={`url(#gradient-${idx})`}
                    fillOpacity={1}
                  />
                ))}
                <defs>
                  {areaKeys.map((_, idx) => (
                    <linearGradient key={`grad-${idx}`} id={`gradient-${idx}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={CHART_COLORS[idx % CHART_COLORS.length]} stopOpacity={0.7} />
                      <stop offset="100%" stopColor={CHART_COLORS[idx % CHART_COLORS.length]} stopOpacity={0.05} />
                    </linearGradient>
                  ))}
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RIGHT: Plan Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <PieChart size={18} className="text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-800">Distribusi Paket</h2>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={planDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="count"
                  label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                  labelLine={false}
                >
                  {planDistribution.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={PLAN_COLORS[index % PLAN_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </RePieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ==================== BOTTOM SECTION ==================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* LEFT: Instance Ranking */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 size={18} className="text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-800">Kunjungan per Instansi</h2>
            <span className="text-xs text-gray-400 ml-2">(30 hari terakhir)</span>
          </div>
          <div className="space-y-4">
            {instanceRanking.map((inst) => (
              <div key={inst.id} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700 truncate max-w-[200px]">{inst.name}</span>
                  <span className="text-gray-500 font-medium">{inst.total_visits} kunjungan</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#407BA7] to-[#004E89] rounded-full transition-all duration-500"
                    style={{ width: `${inst.percentage}%` }}
                  />
                </div>
              </div>
            ))}
            {instanceRanking.length === 0 && (
              <p className="text-center text-gray-400 py-8">Belum ada data kunjungan</p>
            )}
          </div>
        </div>

        {/* RIGHT: Top Performers */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Award size={18} className="text-yellow-500" />
            <h2 className="text-lg font-semibold text-gray-800">Top Admin Performers</h2>
            <span className="text-xs text-gray-400 ml-2">Berdasarkan jumlah validasi</span>
          </div>
          <div className="max-h-80 overflow-y-auto pr-2">
            {topAdmins.map((admin, idx) => (
              <TopPerformerCard key={admin.id} admin={admin} rank={idx + 1} />
            ))}
            {topAdmins.length === 0 && (
              <p className="text-center text-gray-400 py-8">Belum ada aktivitas admin</p>
            )}
          </div>
        </div>
      </div>

      {/* ==================== QUICK INSIGHTS ==================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-[#800016] to-[#A0001C] rounded-xl p-5 text-white">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={18} />
            <span className="text-sm opacity-80">Total Pertumbuhan</span>
          </div>
          <p className="text-3xl font-bold">{overview?.total_instances?.toLocaleString() || 0}</p>
          <p className="text-sm opacity-80 mt-1">Instansi Terdaftar</p>
        </div>
        <div className="bg-gradient-to-r from-[#002962] to-[#004E89] rounded-xl p-5 text-white">
          <div className="flex items-center gap-2 mb-3">
            <Briefcase size={18} />
            <span className="text-sm opacity-80">Sumber Daya</span>
          </div>
          <p className="text-3xl font-bold">{overview?.total_employees?.toLocaleString() || 0}</p>
          <p className="text-sm opacity-80 mt-1">Total Karyawan Terdaftar</p>
        </div>
        <div className="bg-gradient-to-r from-[#407BA7] to-[#004E89] rounded-xl p-5 text-white">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign size={18} />
            <span className="text-sm opacity-80">Pendapatan</span>
          </div>
          <p className="text-3xl font-bold">Rp {(overview?.revenue_mrr || 0).toLocaleString('id-ID')}</p>
          <p className="text-sm opacity-80 mt-1">MRR (Monthly)</p>
        </div>
      </div>
    </div>
  );
}