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
  Edit,
  Save,
  AlertCircle,
  CheckCircle,
  Users,
  Clock,
  Building,
  FileText,
} from "lucide-react";

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

interface Employee {
  id: number;
  name: string;
  department: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

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

export default function PetugasHistoryPage() {
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
  const [showFilters, setShowFilters] = useState(false);
  const [toastMessage, setToastMessage] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Edit modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState<HistoryGuest | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    institution: "",
    purpose: "",
    employee_id: "",
    status: "",
    check_in_at: "",
    check_out_at: "",
  });
  const [employeesList, setEmployeesList] = useState<Employee[]>([]);
  const [editLoading, setEditLoading] = useState(false);

  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setToastMessage({ type, message });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const formatDateTimeLocal = (dateString: string | null) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  const formatTimeWIB = (dateString: string | null) => {
    if (!dateString) return "-";

    const date = new Date(dateString);

    // 🔥 tambah 7 jam manual
    const wib = new Date(date.getTime() + 7 * 60 * 60 * 1000);

    return wib.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  // Fetch history (hanya untuk hari ini)
  const fetchHistory = async (page = 1) => {
    setLoading(true);
    try {
      const urlParams = new URLSearchParams();
      urlParams.append("page", page.toString());
      urlParams.append("limit", "10");
      if (search) urlParams.append("search", search);
      if (statusFilter !== "all") urlParams.append("status", statusFilter);

      const res = await fetch(`/api/petugas/history?${urlParams.toString()}`);
      const data = await res.json();
      if (data.success) {
        setGuests(data.guests || []);
        setPagination({
          page: data.pagination?.page || 1,
          limit: data.pagination?.limit || 10,
          total: data.pagination?.total || 0,
          totalPages: data.pagination?.totalPages || 0,
        });
      }
    } catch (error) {
      console.error("Error fetching history:", error);
      showToast("error", "Gagal memuat data");
    } finally {
      setLoading(false);
    }
  };

  // Fetch employees for edit dropdown
  const fetchEmployees = async () => {
    try {
      const res = await fetch("/api/petugas/employees");
      const data = await res.json();
      if (data.success) setEmployeesList(data.employees);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  // Open Edit Modal
  const openEditModal = async (guest: HistoryGuest) => {
    try {
      const res = await fetch(`/api/petugas/history?id=${guest.id}`);
      const data = await res.json();
      if (data.success && data.guest) {
        const g = data.guest;
        setSelectedGuest(guest);
        setEditFormData({
          name: g.name || "",
          institution: g.institution || "",
          purpose: g.purpose || "",
          employee_id: g.employee_id?.toString() || "",
          status: g.status || "done",
          check_in_at: formatDateTimeLocal(g.check_in_at),
          check_out_at: formatDateTimeLocal(g.check_out_at),
        });
        setShowEditModal(true);
      }
    } catch (error) {
      showToast("error", "Gagal mengambil data");
    }
  };

  // Handle Edit Submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGuest) return;

    setEditLoading(true);
    try {
      const payload = {
        id: selectedGuest.id,
        name: editFormData.name,
        institution: editFormData.institution,
        purpose: editFormData.purpose,
        employee_id: editFormData.employee_id
          ? parseInt(editFormData.employee_id)
          : null,
        status: editFormData.status,
        check_in_at: editFormData.check_in_at,
        check_out_at: editFormData.check_out_at,
      };

      const res = await fetch("/api/petugas/history", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success) {
        showToast("success", "Data berhasil diupdate");
        setShowEditModal(false);
        fetchHistory(pagination.page);
      } else {
        showToast("error", data.error || "Gagal update");
      }
    } catch (error) {
      showToast("error", "Terjadi kesalahan");
    } finally {
      setEditLoading(false);
    }
  };

  // Live search debounce
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
    fetchEmployees();
  }, []);

  useEffect(() => {
    fetchHistory(pagination.page);
  }, [search, statusFilter, pagination.page]);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, page }));
    }
  };

  const clearFilters = () => {
    setSearchInput("");
    setSearch("");
    setStatusFilter("all");
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  return (
    <>
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-20 right-4 z-50 px-4 py-3 rounded-xl shadow-lg flex items-center gap-2"
            style={{
              backgroundColor:
                toastMessage.type === "success"
                  ? colors.secondary
                  : colors.primaryLight,
              color: colors.white,
            }}
          >
            {toastMessage.type === "success" ? (
              <CheckCircle size={18} />
            ) : (
              <AlertCircle size={18} />
            )}
            <span>{toastMessage.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {showEditModal && selectedGuest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto py-8"
            onClick={() => setShowEditModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="rounded-2xl shadow-xl max-w-2xl w-full mx-4 p-6 max-h-[90vh] overflow-y-auto"
              style={{ backgroundColor: colors.white }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3
                  className="text-xl font-semibold"
                  style={{ color: colors.secondaryDarkest }}
                >
                  Edit Data Kunjungan
                </h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-1 rounded-lg hover:bg-gray-100 transition"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      className="block text-sm font-medium mb-1"
                      style={{ color: colors.secondaryDarkest }}
                    >
                      Nama Tamu
                    </label>
                    <input
                      type="text"
                      value={editFormData.name}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          name: e.target.value,
                        })
                      }
                      required
                      className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2"
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
                  <div>
                    <label
                      className="block text-sm font-medium mb-1"
                      style={{ color: colors.secondaryDarkest }}
                    >
                      Asal Instansi
                    </label>
                    <input
                      type="text"
                      value={editFormData.institution}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          institution: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2"
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
                  <div>
                    <label
                      className="block text-sm font-medium mb-1"
                      style={{ color: colors.secondaryDarkest }}
                    >
                      Tujuan
                    </label>
                    <input
                      type="text"
                      value={editFormData.purpose}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          purpose: e.target.value,
                        })
                      }
                      required
                      className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2"
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
                  <div>
                    <label
                      className="block text-sm font-medium mb-1"
                      style={{ color: colors.secondaryDarkest }}
                    >
                      Karyawan Tujuan
                    </label>
                    <select
                      value={editFormData.employee_id}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          employee_id: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 appearance-none"
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
                    >
                      <option value="">Pilih Karyawan</option>
                      {employeesList.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.name} - {emp.department}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium mb-1"
                      style={{ color: colors.secondaryDarkest }}
                    >
                      Status
                    </label>
                    <select
                      value={editFormData.status}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          status: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 appearance-none"
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
                    >
                      <option value="pending">Pending</option>
                      <option value="active">Sedang Berkunjung</option>
                      <option value="done">Selesai</option>
                      <option value="rejected">Ditolak</option>
                    </select>
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium mb-1"
                      style={{ color: colors.secondaryDarkest }}
                    >
                      Check In
                    </label>
                    <input
                      type="datetime-local"
                      value={editFormData.check_in_at}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          check_in_at: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2"
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
                  <div className="md:col-span-2">
                    <label
                      className="block text-sm font-medium mb-1"
                      style={{ color: colors.secondaryDarkest }}
                    >
                      Check Out
                    </label>
                    <input
                      type="datetime-local"
                      value={editFormData.check_out_at}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          check_out_at: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2"
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
                </div>

                <div className="flex gap-3 justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 rounded-lg transition"
                    style={{
                      border: `1px solid ${colors.secondary}20`,
                      color: colors.secondaryDark,
                    }}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={editLoading}
                    className="px-4 py-2 rounded-lg transition disabled:opacity-50 flex items-center gap-2"
                    style={{
                      backgroundColor: colors.secondary,
                      color: colors.white,
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor =
                        colors.secondaryDark)
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = colors.secondary)
                    }
                  >
                    {editLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Save size={16} />
                    )}
                    Simpan
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Link
              href={`/${slug}/petugas`}
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
                <History
                  className="size-6"
                  style={{ color: colors.secondary }}
                />
              </div>
              <div>
                <h1
                  className="text-2xl font-bold"
                  style={{ color: colors.secondaryDarkest }}
                >
                  History Kunjungan Hari Ini
                </h1>
                <p
                  className="text-sm mt-0.5"
                  style={{ color: colors.secondaryDark }}
                >
                  Riwayat kunjungan tamu hari ini (hanya bisa diedit)
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
                placeholder="Cari nama tamu, institusi, tujuan, karyawan... (live search)"
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
              {statusFilter !== "all" && (
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
              className="mt-4 pt-4 flex flex-wrap gap-4 items-end"
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
                  className="px-3 py-1.5 text-sm rounded-lg focus:outline-none focus:ring-2"
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
                >
                  <option value="all">Semua</option>
                  <option value="done">Selesai</option>
                  <option value="rejected">Ditolak</option>
                </select>
              </div>
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

        {/* Stats */}
        <div
          className="rounded-xl p-4"
          style={{
            backgroundColor: colors.white,
            border: `1px solid ${colors.secondary}20`,
          }}
        >
          <div className="flex items-center gap-2">
            <FileText
              className="size-4"
              style={{ color: colors.secondaryDark }}
            />
            <span className="text-sm" style={{ color: colors.secondaryDark }}>
              Total data: {pagination.total} • Halaman {pagination.page} dari{" "}
              {pagination.totalPages}
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
              Belum ada kunjungan hari ini
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
                        Waktu
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
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody
                    className="divide-y"
                    style={{ borderColor: `${colors.secondary}10` }}
                  >
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
                              style={{
                                backgroundColor: `${colors.secondary}10`,
                              }}
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
                                  <User
                                    size={14}
                                    style={{ color: colors.secondary }}
                                  />
                                </div>
                              )}
                            </div>
                            <span
                              className="text-sm font-medium"
                              style={{ color: colors.secondaryDarkest }}
                            >
                              {guest.name}
                            </span>
                          </div>
                        </td>
                        <td
                          className="px-4 py-3 text-sm"
                          style={{ color: colors.secondaryDark }}
                        >
                          {guest.purpose}
                        </td>
                        <td
                          className="px-4 py-3 text-sm"
                          style={{ color: colors.secondaryDark }}
                        >
                          {guest.employee_name || "-"}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${statusBadge[guest.status]}`}
                          >
                            {statusText[guest.status]}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => openEditModal(guest)}
                            className="p-1.5 rounded-lg transition"
                            style={{ color: colors.secondary }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.backgroundColor = `${colors.secondary}10`)
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                "transparent")
                            }
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
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
                    },
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
    </>
  );
}
