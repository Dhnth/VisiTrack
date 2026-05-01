"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  History,
  Search,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  User,
  Briefcase,
  Eye,
  AlertCircle,
  Users,
  Clock,
  Building,
  FileText,
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

interface HistoryGuest {
  id: number;
  name: string;
  nik: string | null;
  institution: string | null;
  purpose: string;
  status: string;
  photo_url: string | null;
  check_in_at: string | null;
  check_out_at: string | null;
  created_at: string;
  employee_name: string | null;
  employee_department: string | null;
  validated_by: string | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const statusBadge: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  active: "bg-green-100 text-green-700",
  done: "bg-blue-100 text-blue-700",
  rejected: "bg-red-100 text-red-700",
};

const statusText: Record<string, string> = {
  pending: "Pending",
  active: "Sedang Berkunjung",
  done: "Selesai",
  rejected: "Ditolak",
};

// Format waktu WIB
const formatTimeWIB = (dateString: string | null) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  // Tambah 7 jam untuk WIB
  date.setHours(date.getHours() + 7);
  return date.toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Format waktu untuk check-in/check-out
const formatTimeOnly = (dateString: string | null) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  date.setHours(date.getHours() + 7);
  return date.toLocaleString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function PpidHistoryPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [guests, setGuests] = useState<HistoryGuest[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [enableCheckout, setEnableCheckout] = useState(true);

  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  const fetchHistory = async (page = 1) => {
    setLoading(true);
    try {
      const urlParams = new URLSearchParams();
      urlParams.append("page", page.toString());
      urlParams.append("limit", "10");
      if (search) urlParams.append("search", search);
      if (statusFilter !== "all") urlParams.append("status", statusFilter);
      if (startDate) urlParams.append("startDate", startDate);
      if (endDate) urlParams.append("endDate", endDate);

      const res = await fetch(`/api/ppid/history?${urlParams.toString()}`);
      const data = await res.json();
      if (data.success) {
        setGuests(data.guests || []);
        setPagination({
          page: data.pagination?.page || 1,
          limit: data.pagination?.limit || 10,
          total: data.pagination?.total || 0,
          totalPages: data.pagination?.totalPages || 0,
        });
        if (data.enable_checkout !== undefined) {
          setEnableCheckout(data.enable_checkout);
        }
      }
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      setSearch(searchInput);
      setPagination((prev) => ({ ...prev, page: 1 }));
    }, 500);
    return () => {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    };
  }, [searchInput]);

  useEffect(() => {
    fetchHistory(pagination.page);
  }, [search, statusFilter, startDate, endDate, pagination.page]);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, page }));
    }
  };

  const clearFilters = () => {
    setSearchInput("");
    setSearch("");
    setStatusFilter("all");
    setStartDate("");
    setEndDate("");
    setPagination((prev) => ({ ...prev, page: 1 }));
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
              <History className="size-6" style={{ color: colors.secondary }} />
            </div>
            <div>
              <h1
                className="text-2xl font-bold"
                style={{ color: colors.secondaryDarkest }}
              >
                History Kunjungan
              </h1>
              <p
                className="text-sm mt-0.5"
                style={{ color: colors.secondaryDark }}
              >
                Riwayat semua kunjungan tamu
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div
        className="rounded-xl p-4"
        style={{
          backgroundColor: colors.white,
          border: `1px solid ${colors.secondary}20`,
        }}
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 size-4"
              style={{ color: colors.secondaryDark }}
            />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Cari nama tamu, institusi, tujuan, karyawan..."
              className="w-full pl-9 pr-3 py-2 rounded-lg focus:outline-none focus:ring-2"
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
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg transition"
            style={{
              border: `1px solid ${colors.secondary}20`,
              color: colors.secondaryDark,
            }}
          >
            <Filter size={16} /> Filter
            {(statusFilter !== "all" || startDate || endDate) && (
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: colors.secondary }}
              ></span>
            )}
          </button>
          <button
            onClick={() => fetchHistory(pagination.page)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg transition"
            style={{
              border: `1px solid ${colors.secondary}20`,
              color: colors.secondaryDark,
            }}
          >
            <RefreshCw size={16} /> Refresh
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div
            className="mt-4 pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4"
            style={{ borderTop: `1px solid ${colors.secondary}10` }}
          >
            <div>
              <label
                className="block text-xs mb-1"
                style={{ color: colors.secondaryDark }}
              >
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 text-sm"
                style={{
                  border: `1px solid ${colors.secondary}20`,
                  color: colors.secondaryDarkest,
                  backgroundColor: colors.white,
                }}
              >
                <option value="all">Semua</option>
                <option value="pending">Pending</option>
                <option value="active">Sedang Berkunjung</option>
                <option value="done">Selesai</option>
                <option value="rejected">Ditolak</option>
              </select>
            </div>
            <div>
              <label
                className="block text-xs mb-1"
                style={{ color: colors.secondaryDark }}
              >
                Dari Tanggal
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 text-sm"
                style={{
                  border: `1px solid ${colors.secondary}20`,
                  color: colors.secondaryDarkest,
                  backgroundColor: colors.white,
                }}
              />
            </div>
            <div>
              <label
                className="block text-xs mb-1"
                style={{ color: colors.secondaryDark }}
              >
                Sampai Tanggal
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 text-sm"
                style={{
                  border: `1px solid ${colors.secondary}20`,
                  color: colors.secondaryDarkest,
                  backgroundColor: colors.white,
                }}
              />
            </div>
            {(statusFilter !== "all" || startDate || endDate) && (
              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="text-sm flex items-center gap-1 transition"
                  style={{ color: colors.primaryLight }}
                >
                  <X size={14} /> Hapus Filter
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Stats */}
      <div
        className="rounded-xl p-4"
        style={{
          backgroundColor: colors.white,
          border: `1px solid ${colors.secondary}20`,
        }}
      >
        <div className="flex items-center gap-2">
          <FileText className="size-4" style={{ color: colors.secondaryDark }} />
          <span className="text-sm" style={{ color: colors.secondaryDark }}>
            Total data: {pagination.total} • Halaman {pagination.page} dari {pagination.totalPages}
          </span>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div
            className="animate-spin rounded-full h-8 w-8 border-b-2"
            style={{ borderColor: colors.secondary }}
          ></div>
        </div>
      ) : guests.length === 0 ? (
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
            <History size={32} style={{ color: colors.secondary }} />
          </div>
          <h3
            className="text-lg font-medium mb-1"
            style={{ color: colors.secondaryDarkest }}
          >
            Tidak ada data
          </h3>
          <p className="text-sm" style={{ color: colors.secondaryDark }}>
            Belum ada kunjungan
          </p>
        </div>
      ) : (
        <>
          <div
            className="rounded-xl shadow-sm overflow-hidden"
            style={{
              backgroundColor: colors.white,
              border: `1px solid ${colors.secondary}20`,
            }}
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead
                  className="border-b"
                  style={{
                    borderColor: `${colors.secondary}20`,
                    backgroundColor: `${colors.secondary}05`,
                  }}
                >
                  <tr>
                    <th
                      className="px-4 py-3 text-left text-xs font-medium uppercase"
                      style={{ color: colors.secondaryDark }}
                    >
                      Tanggal
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-medium uppercase"
                      style={{ color: colors.secondaryDark }}
                    >
                      Nama Tamu
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-medium uppercase"
                      style={{ color: colors.secondaryDark }}
                    >
                      Tujuan
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-medium uppercase"
                      style={{ color: colors.secondaryDark }}
                    >
                      Karyawan Tujuan
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-medium uppercase"
                      style={{ color: colors.secondaryDark }}
                    >
                      Status
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-medium uppercase"
                      style={{ color: colors.secondaryDark }}
                    >
                      Waktu
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-medium uppercase"
                      style={{ color: colors.secondaryDark }}
                    >
                      Detail
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: `${colors.secondary}10` }}>
                  {guests.map((guest) => (
                    <tr
                      key={guest.id}
                      className="hover:bg-gray-50 transition"
                      style={{ backgroundColor: colors.white }}
                    >
                      <td
                        className="px-4 py-3 text-sm"
                        style={{ color: colors.secondaryDark }}
                      >
                        {formatTimeWIB(guest.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-8 h-8 rounded-full overflow-hidden shrink-0"
                            style={{ backgroundColor: `${colors.secondary}10` }}
                          >
                            {guest.photo_url ? (
                              <Image
                                src={guest.photo_url}
                                alt={guest.name}
                                width={32}
                                height={32}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <User size={14} style={{ color: colors.secondary }} />
                              </div>
                            )}
                          </div>
                          <div>
                            <span
                              className="text-sm font-medium"
                              style={{ color: colors.secondaryDarkest }}
                            >
                              {guest.name}
                            </span>
                            {guest.institution && (
                              <p className="text-xs" style={{ color: colors.secondaryDark }}>
                                {guest.institution}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td
                        className="px-4 py-3 text-sm"
                        style={{ color: colors.secondaryDark }}
                      >
                        <div className="flex items-center gap-1">
                          <Briefcase size={14} style={{ color: colors.secondaryDark }} />
                          <span>{guest.purpose}</span>
                        </div>
                      </td>
                      <td
                        className="px-4 py-3 text-sm"
                        style={{ color: colors.secondaryDark }}
                      >
                        <div className="flex items-center gap-1">
                          <Users size={14} style={{ color: colors.secondaryDark }} />
                          <span>{guest.employee_name || "-"}</span>
                        </div>
                        {guest.employee_department && (
                          <p className="text-xs" style={{ color: colors.secondaryDark }}>
                            {guest.employee_department}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${statusBadge[guest.status]}`}
                        >
                          {statusText[guest.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: colors.secondaryDark }}>
                        {/* Menampilkan check-in dan check-out dengan benar */}
                        {enableCheckout ? (
                          <>
                            {guest.check_in_at && guest.status === "active" && (
                              <div className="flex items-center gap-1">
                                <Clock size={12} />
                                <span className="text-xs">
                                  Check in: {formatTimeOnly(guest.check_in_at)}
                                </span>
                              </div>
                            )}
                            {guest.check_out_at && guest.status === "done" && (
                              <div className="flex items-center gap-1 mt-1">
                                <Clock size={12} />
                                <span className="text-xs">
                                  Check out: {formatTimeOnly(guest.check_out_at)}
                                </span>
                              </div>
                            )}
                            {guest.check_in_at && guest.status === "done" && (
                              <div className="flex items-center gap-1">
                                <Clock size={12} />
                                <span className="text-xs">
                                  Check in: {formatTimeOnly(guest.check_in_at)}
                                </span>
                              </div>
                            )}
                          </>
                        ) : (
                          guest.check_in_at && (
                            <div className="flex items-center gap-1">
                              <Clock size={12} />
                              <span className="text-xs">
                                Check in: {formatTimeOnly(guest.check_in_at)}
                              </span>
                            </div>
                          )
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/${slug}/ppid/history/${guest.id}`}
                          className="p-1.5 rounded-lg transition inline-flex"
                          style={{ color: colors.secondary }}
                        >
                          <Eye size={16} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 pt-4">
              <button
                onClick={() => goToPage(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="p-2 rounded-lg transition disabled:opacity-50"
                style={{
                  border: `1px solid ${colors.secondary}20`,
                  backgroundColor: colors.white,
                  color: colors.secondaryDark,
                }}
              >
                <ChevronLeft size={16} />
              </button>
              <div className="flex gap-1">
                {Array.from(
                  { length: Math.min(5, pagination.totalPages) },
                  (_, i) => {
                    let pageNum;
                    if (pagination.totalPages <= 5) pageNum = i + 1;
                    else if (pagination.page <= 3) pageNum = i + 1;
                    else if (pagination.page >= pagination.totalPages - 2)
                      pageNum = pagination.totalPages - 4 + i;
                    else pageNum = pagination.page - 2 + i;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => goToPage(pageNum)}
                        className="w-8 h-8 rounded-lg text-sm transition"
                        style={{
                          backgroundColor:
                            pagination.page === pageNum
                              ? colors.secondary
                              : colors.white,
                          color:
                            pagination.page === pageNum
                              ? colors.white
                              : colors.secondaryDark,
                          border:
                            pagination.page === pageNum
                              ? "none"
                              : `1px solid ${colors.secondary}20`,
                        }}
                      >
                        {pageNum}
                      </button>
                    );
                  }
                )}
              </div>
              <button
                onClick={() => goToPage(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="p-2 rounded-lg transition disabled:opacity-50"
                style={{
                  border: `1px solid ${colors.secondary}20`,
                  backgroundColor: colors.white,
                  color: colors.secondaryDark,
                }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}