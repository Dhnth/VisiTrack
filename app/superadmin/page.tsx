"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Building2,
  Users,
  UserCheck,
  Calendar,
  TrendingUp,
  Activity,
  Clock,
  Eye,
  Award,
  RefreshCw,
  ChevronRight,
  DollarSign,
  TrendingDown,
  Zap,
  AlertCircle,
  Rocket,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";

interface DashboardStats {
  total_instances: number;
  active_instances: number;
  expired_instances: number;
  trial_instances: number;
  total_admins: number;
  total_petugas: number;
  total_ppid: number;
  total_employees: number;
  total_guests_all_time: number;
  total_guests_today: number;
  total_guests_this_month: number;
  total_guests_last_month: number;
  active_visits: number;
  pending_approvals: number;
  revenue_mrr: number;
  revenue_last_month: number;
  guest_growth: number;
  revenue_growth: number;
}

interface ChartData {
  period: string;
  total: number;
}

interface TopInstance {
  id: number;
  name: string;
  slug: string;
  total_visits: number;
  growth: number;
}

interface FastestGrowingInstance {
  id: number;
  name: string;
  slug: string;
  current_month: number;
  last_month: number;
  growth_percent: number;
}

interface HourlyActivity {
  hour: number;
  total: number;
}

interface RecentActivity {
  id: number;
  action: string;
  description: string;
  user_name: string;
  user_email: string;
  user_role: string;
  created_at: string;
}

// Warna untuk bar chart jam sibuk
const HOUR_COLORS = [
  "#94a3b8",
  "#94a3b8",
  "#94a3b8",
  "#94a3b8",
  "#94a3b8",
  "#94a3b8",
  "#fbbf24",
  "#f59e0b",
  "#f97316",
  "#ef4444",
  "#ef4444",
  "#ef4444",
  "#10b981",
  "#10b981",
  "#10b981",
  "#10b981",
  "#10b981",
  "#10b981",
  "#3b82f6",
  "#3b82f6",
  "#3b82f6",
  "#8b5cf6",
  "#8b5cf6",
  "#8b5cf6",
];

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [topInstances, setTopInstances] = useState<TopInstance[]>([]);
  const [fastestGrowing, setFastestGrowing] = useState<
    FastestGrowingInstance[]
  >([]);
  const [hourlyActivity, setHourlyActivity] = useState<HourlyActivity[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>(
    [],
  );
  const [chartRange, setChartRange] = useState<"7d" | "30d" | "12m">("7d");
  const [loading, setLoading] = useState(true);

  // FETCH DATA - langsung di dalam useEffect
  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      const res = await fetch(
        `/api/superadmin/dashboard?chartRange=${chartRange}`,
      );
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setChartData(data.chartData);
        setTopInstances(data.topInstances);
        setFastestGrowing(data.fastestGrowing);
        setHourlyActivity(data.hourlyActivity);
        setRecentActivities(data.recentActivities);
      }
      setLoading(false);
    };
    fetchDashboard();
  }, [chartRange]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return `${diff} detik lalu`;
    if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
    return date.toLocaleDateString("id-ID");
  };

  const getGrowthColor = (percent: number) => {
    if (percent > 0) return "text-green-600";
    if (percent < 0) return "text-red-600";
    return "text-gray-500";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#407BA7]"></div>
      </div>
    );
  }
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 4 && hour < 11) return "Selamat Pagi";
    if (hour >= 11 && hour < 15) return "Selamat Siang";
    if (hour >= 15 && hour < 18) return "Selamat Sore";
    return "Selamat Malam";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-800">
              {getGreeting()}, Super Admin
            </h1>
            <span className="text-sm text-gray-400">
              {new Date().toLocaleDateString("id-ID", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
          <p className="text-gray-500 text-sm mt-1">
            Ringkasan kinerja seluruh platform VisiTrack
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
          title="Total Instansi"
          value={stats?.total_instances || 0}
          subValue={`${stats?.active_instances || 0} aktif`}
          icon={<Building2 size={22} />}
          color="bg-blue-50"
          iconColor="text-blue-600"
        />
        <KpiCard
          title="Kunjungan Bulan Ini"
          value={stats?.total_guests_this_month?.toLocaleString() || 0}
          trend={stats?.guest_growth}
          subValue={`vs ${stats?.total_guests_last_month?.toLocaleString() || 0} bulan lalu`}
          icon={<Calendar size={22} />}
          color="bg-emerald-50"
          iconColor="text-emerald-600"
        />
        <KpiCard
          title="Pendapatan (MRR)"
          value={formatCurrency(stats?.revenue_mrr || 0)}
          trend={stats?.revenue_growth}
          subValue={`dari ${formatCurrency(stats?.revenue_last_month || 0)}`}
          icon={<DollarSign size={22} />}
          color="bg-amber-50"
          iconColor="text-amber-600"
        />
        <KpiCard
          title="Aktivitas Hari Ini"
          value={stats?.total_guests_today || 0}
          subValue={`${stats?.active_visits || 0} sedang berkunjung`}
          icon={<Zap size={22} />}
          color="bg-purple-50"
          iconColor="text-purple-600"
        />
      </div>

      {/* Secondary Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <SmallStatCard
          title="Instansi Aktif"
          value={stats?.active_instances || 0}
          icon={<Activity size={14} />}
          color="text-green-600"
          bgColor="bg-green-50"
        />
        <SmallStatCard
          title="Instansi Trial"
          value={stats?.trial_instances || 0}
          icon={<Clock size={14} />}
          color="text-yellow-600"
          bgColor="bg-yellow-50"
        />
        <SmallStatCard
          title="Instansi Expired"
          value={stats?.expired_instances || 0}
          icon={<AlertCircle size={14} />}
          color="text-red-600"
          bgColor="bg-red-50"
        />
        <SmallStatCard
          title="Total Admin"
          value={stats?.total_admins || 0}
          icon={<Users size={14} />}
          color="text-blue-600"
          bgColor="bg-blue-50"
        />
        <SmallStatCard
          title="Total Petugas"
          value={stats?.total_petugas || 0}
          icon={<UserCheck size={14} />}
          color="text-orange-600"
          bgColor="bg-orange-50"
        />
        <SmallStatCard
          title="Total Karyawan"
          value={stats?.total_employees || 0}
          icon={<Users size={14} />}
          color="text-teal-600"
          bgColor="bg-teal-50"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex justify-between items-center mb-5">
            <div>
              <h2 className="text-base font-semibold text-gray-800">
                Tren Kunjungan
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Perkembangan jumlah tamu dari waktu ke waktu
              </p>
            </div>
            <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
              {[
                { key: "7d", label: "7 Hari" },
                { key: "30d", label: "30 Hari" },
                { key: "12m", label: "12 Bulan" },
              ].map((option) => (
                <button
                  key={option.key}
                  onClick={() => setChartRange(option.key as typeof chartRange)}
                  className={`px-3 py-1.5 text-xs rounded-md transition ${
                    chartRange === option.key
                      ? "bg-white shadow-sm text-[#407BA7] font-medium"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="period"
                  tick={{ fontSize: 11 }}
                  stroke="#888"
                  tickLine={false}
                />
                <YAxis tick={{ fontSize: 11 }} stroke="#888" tickLine={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    fontSize: "12px",
                  }}
                  formatter={(value) => [`${value} tamu`, "Kunjungan"]}
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#407BA7"
                  strokeWidth={2.5}
                  dot={{ fill: "#407BA7", strokeWidth: 2, r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Peak Hours Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-base font-semibold text-gray-800 mb-3">
            Jam Sibuk Kunjungan
          </h2>
          <p className="text-xs text-gray-400 mb-4">
            Aktivitas tertinggi dalam 7 hari terakhir
          </p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={hourlyActivity}
                margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="hour"
                  tick={{ fontSize: 10 }}
                  stroke="#888"
                  tickLine={false}
                />
                <YAxis tick={{ fontSize: 10 }} stroke="#888" tickLine={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    fontSize: "12px",
                  }}
                  formatter={(value) => [`${value} kunjungan`, "Jumlah"]}
                  labelFormatter={(label) => `${label}:00 - ${label + 1}:00`}
                />
                <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                  {hourlyActivity.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={HOUR_COLORS[entry.hour]}
                    />
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
        {/* Top Instances */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
            <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
              <Award size={18} className="text-yellow-500" />
              Instansi dengan Kunjungan Terbanyak
            </h2>
          </div>
          <div className="divide-y divide-gray-100">
            {topInstances.length === 0 ? (
              <p className="text-center text-gray-400 py-8">Belum ada data</p>
            ) : (
              topInstances.map((inst, idx) => (
                <div
                  key={inst.id}
                  className="px-5 py-3 hover:bg-gray-50 transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">
                        {idx + 1}
                      </div>
                      <div>
                        <Link
                          href={`/${inst.slug}/admin`}
                          className="font-medium text-gray-800 hover:text-[#407BA7] transition"
                        >
                          {inst.name}
                        </Link>
                        <p className="text-xs text-gray-400">{inst.slug}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-[#407BA7]">
                        {inst.total_visits.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-400">kunjungan</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="px-5 py-3 border-t border-gray-100 bg-gray-50">
            <Link
              href="/superadmin/instances"
              className="text-sm text-[#407BA7] hover:underline flex items-center gap-1"
            >
              Lihat semua instansi <ChevronRight size={14} />
            </Link>
          </div>
        </div>

        {/* Fastest Growing Instances */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
            <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
              <Rocket size={18} className="text-blue-500" />
              Instansi dengan Pertumbuhan Tercepat
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Berdasarkan kunjungan bulan ini vs bulan lalu
            </p>
          </div>
          <div className="divide-y divide-gray-100">
            {fastestGrowing.length === 0 ? (
              <p className="text-center text-gray-400 py-8">
                Belum ada data pertumbuhan
              </p>
            ) : (
              fastestGrowing.map((inst, idx) => (
                <div
                  key={inst.id}
                  className="px-5 py-3 hover:bg-gray-50 transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">
                        {idx + 1}
                      </div>
                      <div>
                        <Link
                          href={`/${inst.slug}/admin`}
                          className="font-medium text-gray-800 hover:text-[#407BA7] transition"
                        >
                          {inst.name}
                        </Link>
                        <p className="text-xs text-gray-400">{inst.slug}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-semibold ${getGrowthColor(inst.growth_percent)}`}
                      >
                        {inst.growth_percent > 0 ? "+" : ""}
                        {inst.growth_percent}%
                      </p>
                      <p className="text-xs text-gray-400">
                        {inst.current_month} kunjungan (bulan ini)
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
          <h2 className="text-base font-semibold text-gray-800">
            Aktivitas Terbaru
          </h2>
        </div>
        <div className="divide-y divide-gray-100">
          {recentActivities.length === 0 ? (
            <p className="text-center text-gray-400 py-8">
              Belum ada aktivitas
            </p>
          ) : (
            recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="px-5 py-3 hover:bg-gray-50 transition"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-gray-800">
                      {activity.description}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-gray-400">
                        {activity.user_name || "System"}
                      </span>
                      {activity.user_role && (
                        <>
                          <span className="text-xs text-gray-300">•</span>
                          <span
                            className={`text-xs px-1.5 py-0.5 rounded-full ${
                              activity.user_role === "super_admin"
                                ? "bg-red-100 text-red-600"
                                : activity.user_role === "admin"
                                  ? "bg-blue-100 text-blue-600"
                                  : activity.user_role === "petugas"
                                    ? "bg-green-100 text-green-600"
                                    : "bg-purple-100 text-purple-600"
                            }`}
                          >
                            {activity.user_role}
                          </span>
                        </>
                      )}
                      <span className="text-xs text-gray-400">
                        {formatDate(activity.created_at)}
                      </span>
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
          <Link
            href="/superadmin/activity-logs"
            className="text-sm text-[#407BA7] hover:underline flex items-center gap-1"
          >
            Lihat semua aktivitas <Eye size={14} />
          </Link>
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
  iconColor,
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
          <div
            className={`flex items-center gap-0.5 text-xs font-medium ${trend > 0 ? "text-green-600" : trend < 0 ? "text-red-600" : "text-gray-500"}`}
          >
            {trend > 0 ? (
              <TrendingUp size={12} />
            ) : trend < 0 ? (
              <TrendingDown size={12} />
            ) : null}
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

function SmallStatCard({
  title,
  value,
  icon,
  color,
  bgColor,
}: {
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
          <p className="text-lg font-bold text-gray-800">
            {value.toLocaleString()}
          </p>
          <p className="text-xs text-gray-400">{title}</p>
        </div>
      </div>
    </div>
  );
}
