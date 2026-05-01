"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Users,
  Calendar,
  TrendingUp,
  FileText,
  Download,
  ChevronRight,
  UserCheck,
  Clock,
  Eye,
  Briefcase,
} from "lucide-react";

// Color palette
const colors = {
  primary: "#800016",
  primaryDark: "#A0001C",
  primaryDarker: "#C00021",
  primaryLight: "#FF002B",
  white: "#FFFFFF",
  secondary: "#407BA7",
  secondaryDark: "#004E89",
  secondaryDarker: "#002962",
  secondaryDarkest: "#00043A",
};

interface DashboardStats {
  total_visits_today: number;
  total_visits_this_month: number;
  total_visits_all_time: number;
  total_employees: number;
  total_guests: number;
  pending_validations: number;
}

interface EmployeeRank {
  id: number;
  name: string;
  department: string;
  visit_count: number;
}

interface RecentVisit {
  id: number;
  name: string;
  institution: string | null;
  purpose: string;
  status: string;
  created_at: string;
  employee_name: string | null;
}

type Period = "week" | "month" | "year";

export default function PpidDashboardPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [stats, setStats] = useState<DashboardStats>({
    total_visits_today: 0,
    total_visits_this_month: 0,
    total_visits_all_time: 0,
    total_employees: 0,
    total_guests: 0,
    pending_validations: 0,
  });
  const [topEmployees, setTopEmployees] = useState<EmployeeRank[]>([]);
  const [recentVisits, setRecentVisits] = useState<RecentVisit[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<Period>("month");

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        // Fetch stats
        const statsRes = await fetch(`/api/ppid/dashboard`);
        const statsData = await statsRes.json();
        if (statsData.success) {
          setStats(statsData.stats);
        }

        // Fetch top employees
        const topRes = await fetch(
          `/api/ppid/top-employees?period=${selectedPeriod}`,
        );
        const topData = await topRes.json();
        if (topData.success) {
          setTopEmployees(topData.employees);
        }

        // Fetch recent visits
        const recentRes = await fetch(`/api/ppid/recent-visits?limit=10`);
        const recentData = await recentRes.json();
        if (recentData.success) {
          setRecentVisits(recentData.visits);
        }
      } catch (error) {
        console.error("Error fetching dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [selectedPeriod]);

  const formatTimeWIB = (dateString: string) => {
    const date = new Date(dateString);
    // Tambah 7 jam untuk WIB
    date.setHours(date.getHours() + 7);
    return date.toLocaleString("id-ID", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (
    status: string,
  ): { backgroundColor: string; color: string } => {
    const statusConfig: Record<string, { bg: string; text: string }> = {
      pending: { bg: "#FEF3C7", text: "#D97706" },
      active: { bg: "#D1FAE5", text: "#10B981" },
      done: { bg: "#DBEAFE", text: "#3B82F6" },
      rejected: { bg: "#FEE2E2", text: "#EF4444" },
    };
    const config = statusConfig[status] || statusConfig.pending;
    return { backgroundColor: config.bg, color: config.text };
  };

  const statusText: Record<string, string> = {
    pending: "Pending",
    active: "Sedang Berkunjung",
    done: "Selesai",
    rejected: "Ditolak",
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div
          className="animate-spin rounded-full h-8 w-8 border-b-2"
          style={{ borderColor: colors.secondary }}
        ></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ color: colors.secondaryDarkest }}
          >
            Dashboard PPID
          </h1>
          <p className="text-sm mt-1" style={{ color: colors.secondaryDark }}>
            Pantau statistik kunjungan dan kinerja karyawan
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl p-4"
          style={{
            backgroundColor: colors.white,
            border: `1px solid ${colors.secondary}20`,
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs" style={{ color: colors.secondaryDark }}>
                Kunjungan Hari Ini
              </p>
              <p
                className="text-2xl font-bold mt-1"
                style={{ color: colors.secondaryDarkest }}
              >
                {stats.total_visits_today}
              </p>
            </div>
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${colors.secondary}15` }}
            >
              <Calendar size={20} style={{ color: colors.secondary }} />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl p-4"
          style={{
            backgroundColor: colors.white,
            border: `1px solid ${colors.secondary}20`,
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs" style={{ color: colors.secondaryDark }}>
                Kunjungan Bulan Ini
              </p>
              <p
                className="text-2xl font-bold mt-1"
                style={{ color: colors.secondaryDarkest }}
              >
                {stats.total_visits_this_month}
              </p>
            </div>
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${colors.secondary}15` }}
            >
              <FileText size={20} style={{ color: colors.secondary }} />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl p-4"
          style={{
            backgroundColor: colors.white,
            border: `1px solid ${colors.secondary}20`,
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs" style={{ color: colors.secondaryDark }}>
                Total Kunjungan
              </p>
              <p
                className="text-2xl font-bold mt-1"
                style={{ color: colors.secondaryDarkest }}
              >
                {stats.total_visits_all_time}
              </p>
            </div>
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${colors.secondary}15` }}
            >
              <Users size={20} style={{ color: colors.secondary }} />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="rounded-2xl p-4"
          style={{
            backgroundColor: colors.white,
            border: `1px solid ${colors.secondary}20`,
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs" style={{ color: colors.secondaryDark }}>
                Total Karyawan
              </p>
              <p
                className="text-2xl font-bold mt-1"
                style={{ color: colors.secondaryDarkest }}
              >
                {stats.total_employees}
              </p>
            </div>
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${colors.secondary}15` }}
            >
              <Users size={20} style={{ color: colors.secondary }} />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl p-4"
          style={{
            backgroundColor: colors.white,
            border: `1px solid ${colors.secondary}20`,
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs" style={{ color: colors.secondaryDark }}>
                Total Tamu
              </p>
              <p
                className="text-2xl font-bold mt-1"
                style={{ color: colors.secondaryDarkest }}
              >
                {stats.total_guests}
              </p>
            </div>
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${colors.secondary}15` }}
            >
              <UserCheck size={20} style={{ color: colors.secondary }} />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="rounded-2xl p-4"
          style={{
            backgroundColor: colors.white,
            border: `1px solid ${colors.secondary}20`,
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs" style={{ color: colors.secondaryDark }}>
                Menunggu Validasi
              </p>
              <p
                className="text-2xl font-bold mt-1"
                style={{ color: colors.secondaryDarkest }}
              >
                {stats.pending_validations}
              </p>
            </div>
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${colors.secondary}15` }}
            >
              <Clock size={20} style={{ color: colors.secondary }} />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Employees Ranking */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl overflow-hidden"
          style={{
            backgroundColor: colors.white,
            border: `1px solid ${colors.secondary}20`,
          }}
        >
          <div
            className="px-5 py-4 flex items-center justify-between"
            style={{
              borderBottom: `1px solid ${colors.secondary}20`,
              background: `linear-gradient(135deg, ${colors.secondary}05, ${colors.white})`,
            }}
          >
            <h2
              className="font-semibold flex items-center gap-2"
              style={{ color: colors.secondaryDarkest }}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${colors.secondary}15` }}
              >
                <TrendingUp size={16} style={{ color: colors.secondary }} />
              </div>
              Ranking Karyawan Paling Sering Dikunjungi
            </h2>
            <div className="flex gap-2">
              {(["week", "month", "year"] as Period[]).map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className="px-3 py-1 text-xs rounded-lg transition"
                  style={{
                    backgroundColor:
                      selectedPeriod === period
                        ? colors.secondary
                        : "transparent",
                    color:
                      selectedPeriod === period
                        ? colors.white
                        : colors.secondaryDark,
                    border: `1px solid ${colors.secondary}20`,
                  }}
                >
                  {period === "week"
                    ? "Minggu Ini"
                    : period === "month"
                      ? "Bulan Ini"
                      : "Tahun Ini"}
                </button>
              ))}
            </div>
          </div>
          <div className="p-4">
            {topEmployees.length === 0 ? (
              <div className="text-center py-8">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3"
                  style={{ backgroundColor: `${colors.secondary}10` }}
                >
                  <TrendingUp size={28} style={{ color: colors.secondary }} />
                </div>
                <p className="text-sm" style={{ color: colors.secondaryDark }}>
                  Belum ada data kunjungan
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {topEmployees.map((emp, idx) => (
                  <div
                    key={emp.id}
                    className="p-3 rounded-xl flex items-center justify-between"
                    style={{
                      backgroundColor: `${colors.secondary}05`,
                      border: `1px solid ${colors.secondary}10`,
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
                        style={{
                          backgroundColor: `${colors.secondary}20`,
                          color: colors.secondary,
                        }}
                      >
                        {idx + 1}
                      </div>
                      <div>
                        <p
                          className="font-medium"
                          style={{ color: colors.secondaryDarkest }}
                        >
                          {emp.name}
                        </p>
                        <p
                          className="text-xs"
                          style={{ color: colors.secondaryDark }}
                        >
                          {emp.department}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className="font-bold text-lg"
                        style={{ color: colors.secondary }}
                      >
                        {emp.visit_count}
                      </p>
                      <p
                        className="text-xs"
                        style={{ color: colors.secondaryDark }}
                      >
                        kunjungan
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 pt-3 text-center">
              <Link
                href={`/${slug}/ppid/ranking`}
                className="text-sm flex items-center justify-center gap-1 hover:underline"
                style={{ color: colors.secondary }}
              >
                Lihat semua <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Recent Visits */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-2xl overflow-hidden"
          style={{
            backgroundColor: colors.white,
            border: `1px solid ${colors.secondary}20`,
          }}
        >
          <div
            className="px-5 py-4"
            style={{
              borderBottom: `1px solid ${colors.secondary}20`,
              background: `linear-gradient(135deg, ${colors.secondary}05, ${colors.white})`,
            }}
          >
            <h2
              className="font-semibold flex items-center gap-2"
              style={{ color: colors.secondaryDarkest }}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${colors.secondary}15` }}
              >
                <Eye size={16} style={{ color: colors.secondary }} />
              </div>
              Kunjungan Terbaru
            </h2>
          </div>
          <div className="p-4 overflow-y-auto" style={{ maxHeight: "400px" }}>
            {recentVisits.length === 0 ? (
              <div className="text-center py-8">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3"
                  style={{ backgroundColor: `${colors.secondary}10` }}
                >
                  <Eye size={28} style={{ color: colors.secondary }} />
                </div>
                <p className="text-sm" style={{ color: colors.secondaryDark }}>
                  Belum ada kunjungan
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentVisits.map((visit) => (
                  <Link
                    key={visit.id}
                    href={`/${slug}/ppid/history/${visit.id}`}
                    className="block p-3 rounded-xl transition hover:shadow-md"
                    style={{
                      backgroundColor: `${colors.secondary}05`,
                      border: `1px solid ${colors.secondary}10`,
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p
                          className="font-medium"
                          style={{ color: colors.secondaryDarkest }}
                        >
                          {visit.name}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Briefcase
                            size={12}
                            style={{ color: colors.secondaryDark }}
                          />
                          <p
                            className="text-xs"
                            style={{ color: colors.secondaryDark }}
                          >
                            {visit.purpose}
                          </p>
                        </div>
                        {visit.employee_name && (
                          <div className="flex items-center gap-2 mt-0.5">
                            <Users
                              size={10}
                              style={{ color: colors.secondaryDark }}
                            />
                            <p
                              className="text-xs"
                              style={{ color: colors.secondaryDark }}
                            >
                              Tujuan: {visit.employee_name}
                            </p>
                          </div>
                        )}
                        <p
                          className="text-xs mt-1"
                          style={{ color: colors.secondaryDarker }}
                        >
                          {formatTimeWIB(visit.created_at)}
                        </p>
                      </div>
                      <div
                        className="px-2 py-1 rounded-full text-xs font-medium"
                        style={getStatusBadge(visit.status)}
                      >
                        {statusText[visit.status]}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
            <div className="mt-4 pt-3 text-center">
              <Link
                href={`/${slug}/ppid/history`}
                className="text-sm flex items-center justify-center gap-1 hover:underline"
                style={{ color: colors.secondary }}
              >
                Lihat semua history <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
