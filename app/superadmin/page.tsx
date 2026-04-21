"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowUp,
  ArrowDown,
  Eye,
  AlertCircle,
  Download,
  RefreshCw,
  Database,
  Settings,
  CheckCircle,
  XCircle,
  TrendingUp,
  Users,
  Building2,
  UserCheck,
  Clock,
  Crown,
  Briefcase,
  GraduationCap,
} from "lucide-react";
import { auth } from "@/lib/auth";

interface DashboardStats {
  total_instances: number;
  total_users: number;
  total_admins: number;
  total_petugas: number;
  total_ppid: number;
  active_instances: number;
  expired_instances: number;
  trial_instances: number;
  total_revenue: number;
}

interface ExpiringInstance {
  id: number;
  name: string;
  slug: string;
  plan: string;
  subscription_end: Date;
  days_left: number;
  is_expired: boolean;
}

interface RecentActivity {
  id: number;
  action: string;
  description: string | null;
  user_name?: string;
  instance_name?: string;
  created_at: Date;
}

interface PlanStats {
  starter: number;
  business: number;
  enterprise: number;
}

interface DashboardResponse {
  success: boolean;
  stats: DashboardStats;
  expiring_instances: ExpiringInstance[];
  recent_activities: RecentActivity[];
  plan_stats: PlanStats;
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Baru saja";
  if (diffMins < 60) return `${diffMins} menit lalu`;
  if (diffHours < 24) return `${diffHours} jam lalu`;
  return `${diffDays} hari lalu`;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

const StatsCard = ({
  title,
  value,
  change,
  isPositive,
  icon: Icon,
  delay,
}: {
  title: string;
  value: string | number;
  change: string;
  isPositive: boolean;
  icon: React.ElementType;
  delay: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    whileHover={{ y: -4, transition: { duration: 0.2 } }}
    className="bg-white rounded-xl shadow-sm border border-gray-200 p-5"
  >
    <div className="flex items-center justify-between mb-3">
      <div className="p-2 rounded-lg bg-[#407BA7]/10 text-[#407BA7]">
        <Icon size={20} />
      </div>
      <div
        className={`flex items-center gap-1 text-xs font-medium ${
          isPositive ? "text-green-600" : "text-red-600"
        }`}
      >
        {isPositive ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
        {change}
      </div>
    </div>
    <h3 className="text-2xl font-bold text-gray-800">
      {typeof value === "number" ? value.toLocaleString() : value}
    </h3>
    <p className="text-sm text-gray-500 mt-1">{title}</p>
  </motion.div>
);

export default function SuperAdminDashboard() {

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [expiringInstances, setExpiringInstances] = useState<ExpiringInstance[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [planStats, setPlanStats] = useState<PlanStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/superadmin/dashboard");
      const data: DashboardResponse = await res.json();

      if (!data.success) {
        throw new Error("Failed to fetch data");
      }

      setStats(data.stats);
      setExpiringInstances(data.expiring_instances);
      setRecentActivities(data.recent_activities);
      setPlanStats(data.plan_stats);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-[#800016] border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">{error}</p>
          <button
            onClick={handleRefresh}
            className="mt-4 px-4 py-2 bg-[#800016] text-white rounded-lg"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Instansi",
      value: stats?.total_instances ?? 0,
      change: "+3",
      isPositive: true,
      icon: Building2,
      delay: 0.1,
    },
    {
      title: "Total Pengguna",
      value: stats?.total_users ?? 0,
      change: "+12",
      isPositive: true,
      icon: Users,
      delay: 0.15,
    },
    {
      title: "Total Admin",
      value: stats?.total_admins ?? 0,
      change: "+5",
      isPositive: true,
      icon: UserCheck,
      delay: 0.2,
    },
    {
      title: "Total Petugas",
      value: stats?.total_petugas ?? 0,
      change: "+8",
      isPositive: true,
      icon: Clock,
      delay: 0.25,
    },
    {
      title: "Pendapatan",
      value: formatCurrency(stats?.total_revenue ?? 0),
      change: "+15%",
      isPositive: true,
      icon: TrendingUp,
      delay: 0.3,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between flex-wrap gap-4"
      >
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition"
          >
            <Download size={16} />
            Export Report
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-3 py-2 text-sm text-white bg-[#800016] rounded-lg hover:bg-[#A0001C] transition disabled:opacity-50"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </motion.button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-5">
        {statCards.map((card) => (
          <StatsCard key={card.title} {...card} />
        ))}
      </div>

      {/* Stats Ringkasan Instansi */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex items-center gap-4"
        >
          <div className="p-3 rounded-full bg-green-100">
            <CheckCircle size={24} className="text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Instansi Aktif</p>
            <p className="text-2xl font-bold text-gray-800">
              {stats?.active_instances ?? 0}
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex items-center gap-4"
        >
          <div className="p-3 rounded-full bg-red-100">
            <XCircle size={24} className="text-red-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Instansi Expired</p>
            <p className="text-2xl font-bold text-gray-800">
              {stats?.expired_instances ?? 0}
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.45 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex items-center gap-4"
        >
          <div className="p-3 rounded-full bg-blue-100">
            <Clock size={24} className="text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Instansi Trial</p>
            <p className="text-2xl font-bold text-gray-800">
              {stats?.trial_instances ?? 0}
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex items-center gap-4"
        >
          <div className="p-3 rounded-full bg-purple-100">
            <TrendingUp size={24} className="text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total PPID</p>
            <p className="text-2xl font-bold text-gray-800">
              {stats?.total_ppid ?? 0}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Plan Distribution & Expiring Instances */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Plan Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.55 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-5"
        >
          <h3 className="font-semibold text-gray-800 mb-4">Distribusi Paket</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GraduationCap size={18} className="text-[#407BA7]" />
                <span className="text-sm text-gray-600">Starter</span>
              </div>
              <span className="text-sm font-semibold text-gray-800">
                {planStats?.starter ?? 0} instansi
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Briefcase size={18} className="text-[#800016]" />
                <span className="text-sm text-gray-600">Business</span>
              </div>
              <span className="text-sm font-semibold text-gray-800">
                {planStats?.business ?? 0} instansi
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crown size={18} className="text-[#FF002B]" />
                <span className="text-sm text-gray-600">Enterprise</span>
              </div>
              <span className="text-sm font-semibold text-gray-800">
                {planStats?.enterprise ?? 0} instansi
              </span>
            </div>
          </div>
        </motion.div>

        {/* Instansi Expired Alert */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertCircle size={18} className="text-[#FF002B]" />
              <h3 className="font-semibold text-gray-800">
                Instansi Akan Expired
              </h3>
            </div>
            <Link
              href="/superadmin/instances"
              className="text-xs text-[#407BA7] hover:underline"
            >
              Lihat semua
            </Link>
          </div>
          <div className="space-y-3">
            {expiringInstances.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                Tidak ada instansi yang akan expired
              </p>
            ) : (
              expiringInstances.map((inst, idx) => (
                <motion.div
                  key={inst.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-800 text-sm">
                      {inst.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {inst.plan === 'starter' ? 'Starter' : inst.plan === 'business' ? 'Business' : 'Enterprise'}
                    </p>
                    <p
                      className={`text-xs mt-0.5 ${
                        inst.is_expired
                          ? "text-red-600"
                          : inst.days_left <= 7
                          ? "text-orange-500"
                          : "text-gray-500"
                      }`}
                    >
                      {inst.is_expired
                        ? "Sudah expired!"
                        : `${inst.days_left} hari lagi`}
                    </p>
                  </div>
                  <button className="px-3 py-1 text-xs text-white bg-[#407BA7] rounded-lg hover:bg-[#356a8f] transition">
                    Perpanjang
                  </button>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity Log */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.65 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Aktivitas Terbaru</h3>
            <Link
              href="/superadmin/logs"
              className="text-xs text-[#407BA7] hover:underline flex items-center gap-1"
            >
              Lihat semua <Eye size={12} />
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {recentActivities.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                Belum ada aktivitas
              </p>
            ) : (
              recentActivities.map((activity, idx) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.03 }}
                  className="py-3 first:pt-0 last:pb-0 border-b border-gray-100 last:border-0"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-gray-800">
                        {activity.description || activity.action}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {activity.user_name ?? "System"}
                        {activity.instance_name && ` • ${activity.instance_name}`}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400 whitespace-nowrap ml-4">
                      {formatRelativeTime(new Date(activity.created_at))}
                    </span>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.7 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-5"
        >
          <h3 className="font-semibold text-gray-800 mb-4">Tindakan Cepat</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { name: "Tambah Instansi", desc: "Buat instansi baru", icon: Building2 },
              { name: "Kelola Admin", desc: "Tambah admin instansi", icon: Users },
              { name: "Backup Data", desc: "Backup seluruh sistem", icon: Database },
              { name: "Pengaturan", desc: "Konfigurasi sistem", icon: Settings },
            ].map((item, idx) => (
              <motion.button
                key={item.name}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, delay: 0.75 + idx * 0.05 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition text-left"
              >
                <item.icon size={18} className="text-[#407BA7]" />
                <div>
                  <p className="text-sm font-medium text-gray-800">{item.name}</p>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* System Health */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.8 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-5"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <h3 className="font-semibold text-gray-800">System Health</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Database Status", value: "Connected", status: "green" },
            { label: "Last Backup", value: "2026-04-20 02:00", status: "gray" },
            { label: "API Latency", value: "124ms", status: "gray" },
            { label: "Uptime", value: "99.97%", status: "gray" },
          ].map((item, idx) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2, delay: 0.85 + idx * 0.05 }}
            >
              <p className="text-xs text-gray-500">{item.label}</p>
              <p className={`text-sm font-medium mt-1 text-${item.status}-600`}>
                {item.value}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
