"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ChevronLeft,
  TrendingUp,
  Search,
  X,
  Crown,
  Medal,
  Trophy,
  User,
  Briefcase,
  Calendar,
  Star,
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

// Warna untuk rank berdasarkan color palette
const rankColors = {
  1: {
    bg: "bg-gradient-to-br from-[#407BA7] to-[#004E89]",
    border: "border-[#407BA7]",
    text: "text-[#407BA7]",
    shadow: "shadow-[#407BA7]/20",
    ribbon: "from-[#407BA7] to-[#004E89]",
  },
  2: {
    bg: "bg-gradient-to-br from-[#800016] to-[#A0001C]",
    border: "border-[#800016]",
    text: "text-[#800016]",
    shadow: "shadow-[#800016]/20",
    ribbon: "from-[#800016] to-[#A0001C]",
  },
  3: {
    bg: "bg-gradient-to-br from-[#800016] to-[#A0001C]",
    border: "border-[#800016]",
    text: "text-[#800016]",
    shadow: "shadow-[#800016]/20",
    ribbon: "from-[#800016] to-[#A0001C]",
  },
};

interface EmployeeRank {
  id: number;
  name: string;
  department: string;
  visit_count: number;
}

type Period = "week" | "month" | "year";

// Hall of Fame Card Component - dengan efek kaca untuk semua rank
const HallOfFameCard = ({
  employee,
  rank,
  period,
}: {
  employee: EmployeeRank;
  rank: number;
  period: string;
}) => {
  const rankStyle = rankColors[rank as 1 | 2 | 3];
  const periodText =
    period === "week"
      ? "Minggu Ini"
      : period === "month"
        ? "Bulan Ini"
        : "Tahun Ini";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank === 1 ? 0.2 : rank === 2 ? 0.3 : 0.4 }}
      className={`relative rounded-2xl p-6 text-center shadow-xl transform transition-all duration-300 hover:-translate-y-2 ${rankStyle.shadow} 
        ${rank === 1 ? "-mt-6 scale-105" : ""}
        ${rank === 2 ? "mt-6" : ""}
        ${rank === 3 ? "mt-10" : ""}
      `}
      style={{
        border: `2px solid ${rank === 1 ? colors.secondary : rank === 2 ? colors.primary : colors.primaryDarker}30`,
        background: "rgba(255, 255, 255, 0.2)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
    >
      {/* Rank Badge dengan efek kaca */}
      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
        <div
          className={`w-10 h-10 rounded-full ${rankStyle.bg} flex items-center justify-center shadow-lg`}
          style={{
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
          }}
        >
          {rank === 1 ? (
            <Crown size={20} className="text-white" />
          ) : (
            <Medal size={20} className="text-white" />
          )}
        </div>
      </div>

      {/* Title Ribbon */}
      <div className="mt-6">
        <span
          className={`text-xs font-semibold tracking-wider px-3 py-1 rounded-full bg-gradient-to-r ${rankStyle.ribbon} text-white`}
        >
          {rank === 1 ? "GOLD" : rank === 2 ? "SILVER" : "BRONZE"}
        </span>
      </div>

      {/* Name */}
      <h3
        className="text-xl font-bold mt-3"
        style={{ color: colors.secondaryDarkest }}
      >
        {employee.name}
      </h3>

      {/* Department */}
      <p className="text-sm mt-1" style={{ color: colors.secondaryDark }}>
        {employee.department}
      </p>

      {/* Stats */}
      <div
        className="mt-4 pt-3 border-t"
        style={{ borderColor: `${colors.secondary}20` }}
      >
        <div className="flex items-center justify-center gap-2">
          <TrendingUp size={16} style={{ color: colors.secondary }} />
          <span
            className="text-2xl font-bold"
            style={{ color: colors.secondary }}
          >
            {employee.visit_count}
          </span>
          <span className="text-xs" style={{ color: colors.secondaryDark }}>
            kunjungan
          </span>
        </div>
        <p className="text-xs mt-2" style={{ color: colors.secondaryDark }}>
          {periodText}
        </p>
      </div>
    </motion.div>
  );
};

export default function PpidRankingPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [employees, setEmployees] = useState<EmployeeRank[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>("month");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const fetchRanking = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/ppid/top-employees?period=${period}`);
      const data = await res.json();
      if (data.success) {
        setEmployees(data.employees);
      }
    } catch (error) {
      console.error("Error fetching ranking:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRanking();
  }, [period]);

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(search.toLowerCase()) ||
      emp.department.toLowerCase().includes(search.toLowerCase()),
  );

  // Hall of Fame (Top 3) - hanya tampil jika tidak ada search
  const showHallOfFame = search === "";
  const hallOfFame = employees.slice(0, 3);
  const tableData = search ? filteredEmployees : employees;

  const clearSearch = () => {
    setSearchInput("");
    setSearch("");
  };

  // Format number with dots
  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  // Get rank style for table
  const getTableRankStyle = (rank: number) => {
    if (rank === 1)
      return {
        bg: "from-[#407BA7] to-[#004E89]",
        text: "text-[#407BA7]",
        label: "bg-[#407BA7]",
      };
    if (rank === 2)
      return {
        bg: "from-[#800016] to-[#A0001C]",
        text: "text-[#800016]",
        label: "bg-[#800016]",
      };
    return {
      bg: "from-[#800016] to-[#A0001C]",
      text: "text-[#800000]",
      label: "bg-[#800016]",
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            href={`/${slug}/ppid`}
            className="inline-flex items-center gap-2 transition mb-2"
            style={{ color: colors.secondary }}
          >
            <ChevronLeft size={16} />
            Kembali ke Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <div
              className="p-2 rounded-xl"
              style={{ backgroundColor: `${colors.secondary}15` }}
            >
              <Trophy className="size-6" style={{ color: colors.secondary }} />
            </div>
            <div>
              <h1
                className="text-2xl font-bold"
                style={{ color: colors.secondaryDarkest }}
              >
                Hall of Fame Karyawan
              </h1>
              <p
                className="text-sm mt-0.5"
                style={{ color: colors.secondaryDark }}
              >
                Karyawan dengan kunjungan terbanyak
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Period Filter & Search */}
      <div
        className="rounded-xl p-4 flex flex-wrap items-center justify-between gap-3"
        style={{
          backgroundColor: colors.white,
          border: `1px solid ${colors.secondary}20`,
        }}
      >
        <div className="flex gap-2">
          {(["week", "month", "year"] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition"
              style={{
                backgroundColor:
                  period === p ? colors.secondary : "transparent",
                color: period === p ? colors.white : colors.secondaryDark,
                border: `1px solid ${colors.secondary}20`,
              }}
            >
              {p === "week"
                ? "Minggu Ini"
                : p === "month"
                  ? "Bulan Ini"
                  : "Tahun Ini"}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 size-4"
            style={{ color: colors.secondaryDark }}
          />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && setSearch(searchInput)}
            placeholder="Cari karyawan..."
            className="w-64 pl-9 pr-3 py-2 rounded-lg focus:outline-none focus:ring-2 text-sm"
            style={{
              border: `1px solid ${colors.secondary}20`,
              color: colors.secondaryDarkest,
              backgroundColor: colors.white,
            }}
            onFocus={(e) =>
              (e.currentTarget.style.borderColor = colors.secondary)
            }
            onBlur={(e) =>
              (e.currentTarget.style.borderColor = `${colors.secondary}20`)
            }
          />
          {searchInput && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 transition"
              style={{ color: colors.secondaryDark }}
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div
            className="animate-spin rounded-full h-8 w-8 border-b-2"
            style={{ borderColor: colors.secondary }}
          ></div>
        </div>
      ) : employees.length === 0 ? (
        <div
          className="rounded-xl p-12 text-center"
          style={{
            backgroundColor: colors.white,
            border: `1px solid ${colors.secondary}20`,
          }}
        >
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: `${colors.secondary}15` }}
          >
            <Trophy size={32} style={{ color: colors.secondary }} />
          </div>
          <h3
            className="text-lg font-medium mb-1"
            style={{ color: colors.secondaryDarkest }}
          >
            Tidak ada data
          </h3>
          <p className="text-sm" style={{ color: colors.secondaryDark }}>
            Belum ada data kunjungan untuk periode ini
          </p>
        </div>
      ) : (
        <>
          {/* Hall of Fame Section - Top 3 (hanya tampil jika tidak ada pencarian) */}
          {showHallOfFame && hallOfFame.length >= 3 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Rank 2 - Kiri */}
              <div className="order-2 md:order-1">
                <HallOfFameCard
                  employee={hallOfFame[1]}
                  rank={2}
                  period={period}
                />
              </div>
              {/* Rank 1 - Tengah (tertinggi) */}
              <div className="order-1 md:order-2">
                <HallOfFameCard
                  employee={hallOfFame[0]}
                  rank={1}
                  period={period}
                />
              </div>
              {/* Rank 3 - Kanan */}
              <div className="order-3">
                <HallOfFameCard
                  employee={hallOfFame[2]}
                  rank={3}
                  period={period}
                />
              </div>
            </div>
          )}

          {/* Ranking Table (semua karyawan termasuk top 3) */}
          <div
            className="rounded-xl overflow-hidden"
            style={{
              backgroundColor: colors.white,
              border: `1px solid ${colors.secondary}20`,
            }}
          >
            <div
              className="px-5 py-3 flex items-center justify-between"
              style={{
                borderBottom: `1px solid ${colors.secondary}20`,
                backgroundColor: `${colors.secondary}05`,
              }}
            >
              <h3
                className="font-semibold"
                style={{ color: colors.secondaryDarkest }}
              >
                Leaderboard Karyawan
              </h3>
              <div className="text-xs" style={{ color: colors.secondaryDark }}>
                Total {employees.length} karyawan
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr
                    className="border-b"
                    style={{ borderColor: `${colors.secondary}20` }}
                  >
                    <th
                      className="px-4 py-3 text-left text-xs font-medium uppercase"
                      style={{ color: colors.secondaryDark }}
                    >
                      Peringkat
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-medium uppercase"
                      style={{ color: colors.secondaryDark }}
                    >
                      Nama Karyawan
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-medium uppercase"
                      style={{ color: colors.secondaryDark }}
                    >
                      Departemen
                    </th>
                    <th
                      className="px-4 py-3 text-right text-xs font-medium uppercase"
                      style={{ color: colors.secondaryDark }}
                    >
                      Total Kunjungan
                    </th>
                    <th
                      className="px-4 py-3 text-center text-xs font-medium uppercase"
                      style={{ color: colors.secondaryDark }}
                    >
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody
                  className="divide-y"
                  style={{ borderColor: `${colors.secondary}10` }}
                >
                  {tableData.map((emp, idx) => {
                    const absoluteRank =
                      employees.findIndex((e) => e.id === emp.id) + 1;
                    const isTop3 = absoluteRank <= 3;
                    const rankStyle = getTableRankStyle(absoluteRank);

                    return (
                      <tr
                        key={emp.id}
                        className="hover:bg-gray-50 transition cursor-pointer"
                        onClick={() =>
                          (window.location.href = `/${slug}/ppid/employee/${emp.id}`)
                        }
                        style={{ backgroundColor: colors.white }}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {isTop3 ? (
                              <div
                                className={`w-8 h-8 rounded-full bg-gradient-to-br ${rankStyle.bg} flex items-center justify-center shadow-md`}
                              >
                                {absoluteRank === 1 ? (
                                  <Crown size={14} className="text-white" />
                                ) : (
                                  <Medal size={14} className="text-white" />
                                )}
                              </div>
                            ) : (
                              <div
                                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                                style={{
                                  backgroundColor: `${colors.secondary}10`,
                                  color: colors.secondaryDark,
                                }}
                              >
                                {absoluteRank}
                              </div>
                            )}
                            <span
                              className={`text-sm font-medium ${
                                isTop3 ? rankStyle.text : ""
                              }`}
                              style={{
                                color: !isTop3
                                  ? colors.secondaryDarkest
                                  : undefined,
                              }}
                            >
                              #{String(absoluteRank).padStart(3, "0")}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
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
                              ID: {String(emp.id).padStart(6, "0")}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className="text-sm"
                            style={{ color: colors.secondaryDark }}
                          >
                            {emp.department}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span
                            className="font-bold text-lg"
                            style={{ color: colors.secondary }}
                          >
                            {formatNumber(emp.visit_count)}
                          </span>
                          <span
                            className="text-xs ml-1"
                            style={{ color: colors.secondaryDark }}
                          >
                            kunjungan
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            className="px-3 py-1 text-xs rounded-lg transition"
                            style={{
                              backgroundColor: `${colors.secondary}10`,
                              color: colors.secondary,
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.backgroundColor = `${colors.secondary}20`)
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.backgroundColor = `${colors.secondary}10`)
                            }
                          >
                            Detail
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Info Footer */}
          <div
            className="rounded-xl p-3 text-center"
            style={{ backgroundColor: `${colors.secondary}05` }}
          >
            <p className="text-xs" style={{ color: colors.secondaryDark }}>
              Menampilkan {tableData.length} dari {employees.length} karyawan
              {search && (
                <span>
                  {" "}
                  (hasil pencarian: &quot;{search}&quot;)
                  <button
                    onClick={clearSearch}
                    className="ml-2 underline hover:no-underline"
                    style={{ color: colors.secondary }}
                  >
                    Tampilkan semua
                  </button>
                </span>
              )}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
