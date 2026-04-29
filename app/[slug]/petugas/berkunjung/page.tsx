"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  Users,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  User,
  Briefcase,
  LogOut,
  Clock,
  Building,
} from "lucide-react";

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

export default function BerkunjungPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [guests, setGuests] = useState<ActiveGuest[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [checkoutLoading, setCheckoutLoading] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [showCheckoutModal, setShowCheckoutModal] =
    useState<ActiveGuest | null>(null);

  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setToastMessage({ type, message });
    setTimeout(() => setToastMessage(null), 3000);
  };

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

  const fetchData = async (page = 1) => {
    setLoading(true);
    try {
      const urlParams = new URLSearchParams();
      urlParams.append("page", page.toString());
      urlParams.append("limit", "12");
      if (search) urlParams.append("search", search);

      const res = await fetch(`/api/petugas/active?${urlParams.toString()}`);
      const data = await res.json();
      if (data.success) {
        setGuests(data.guests || []);
        setPagination({
          page: data.pagination?.page || 1,
          limit: data.pagination?.limit || 12,
          total: data.pagination?.total || 0,
          totalPages: data.pagination?.totalPages || 0,
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      showToast("error", "Gagal memuat data");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async (guest: ActiveGuest) => {
    setCheckoutLoading(guest.id);
    try {
      const res = await fetch("/api/petugas/active", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: guest.id }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("success", `${guest.name} telah pulang`);
        setShowCheckoutModal(null);
        fetchData(pagination.page);
      } else {
        showToast("error", data.error || "Gagal checkout");
      }
    } catch (error) {
      showToast("error", "Terjadi kesalahan");
    } finally {
      setCheckoutLoading(null);
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
    fetchData(pagination.page);
  }, [search, pagination.page]);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, page }));
    }
  };

  const clearSearch = () => {
    setSearchInput("");
    setSearch("");
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
            <AlertCircle size={18} />
            <span>{toastMessage.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Konfirmasi Checkout */}
      <AnimatePresence>
        {showCheckoutModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowCheckoutModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="rounded-2xl shadow-xl max-w-md w-full mx-4 p-6"
              style={{ backgroundColor: colors.white }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="p-2 rounded-full"
                  style={{ backgroundColor: `${colors.secondary}15` }}
                >
                  <LogOut size={24} style={{ color: colors.secondary }} />
                </div>
                <h3
                  className="text-lg font-semibold"
                  style={{ color: colors.secondaryDarkest }}
                >
                  Konfirmasi Kepulangan
                </h3>
              </div>
              <p className="mb-6" style={{ color: colors.secondaryDark }}>
                Apakah{" "}
                <strong style={{ color: colors.secondaryDarkest }}>
                  {showCheckoutModal.name}
                </strong>{" "}
                sudah selesai berkunjung?
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowCheckoutModal(null)}
                  className="px-4 py-2 rounded-lg transition"
                  style={{
                    border: `1px solid ${colors.secondary}20`,
                    color: colors.secondaryDark,
                  }}
                >
                  Batal
                </button>
                <button
                  onClick={() => handleCheckout(showCheckoutModal)}
                  disabled={checkoutLoading === showCheckoutModal.id}
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
                  {checkoutLoading === showCheckoutModal.id ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <LogOut size={16} />
                  )}
                  Ya, Tamu Pulang
                </button>
              </div>
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
                <Users className="size-6" style={{ color: colors.secondary }} />
              </div>
              <div>
                <h1
                  className="text-2xl font-bold"
                  style={{ color: colors.secondaryDarkest }}
                >
                  Tamu Berkunjung
                </h1>
                <p
                  className="text-sm mt-0.5"
                  style={{ color: colors.secondaryDark }}
                >
                  Daftar tamu yang sedang berkunjung
                </p>
              </div>
            </div>
          </div>
          <div
            className="px-3 py-1.5 rounded-full text-sm font-medium text-center"
            style={{
              backgroundColor: `${colors.secondary}15`,
              color: colors.secondary,
            }}
          >
            {guests.length} Tamu Aktif
          </div>
        </div>

        {/* Search */}
        <div
          className="rounded-xl p-4"
          style={{
            backgroundColor: colors.white,
            border: `1px solid ${colors.secondary}20`,
          }}
        >
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 size-4"
              style={{ color: colors.secondaryDark }}
            />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Cari nama tamu, institusi, atau tujuan..."
              className="w-full pl-9 pr-10 py-2 rounded-lg focus:outline-none focus:ring-2"
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
                <X size={16} />
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
              <Users size={32} style={{ color: colors.secondary }} />
            </div>
            <h3
              className="text-lg font-medium mb-1"
              style={{ color: colors.secondaryDarkest }}
            >
              Tidak ada tamu
            </h3>
            <p className="text-sm" style={{ color: colors.secondaryDark }}>
              Belum ada tamu yang sedang berkunjung
            </p>
          </div>
        ) : (
          <>
            {/* Card Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {guests.map((guest, idx) => (
                <motion.div
                  key={guest.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="rounded-xl overflow-hidden transition-all duration-200 hover:shadow-md"
                  style={{
                    backgroundColor: colors.white,
                    border: `1px solid ${colors.secondary}20`,
                  }}
                >
                  <div className="p-4">
                    {/* Foto dan Nama */}
                    <div className="flex gap-3">
                      <div
                        className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0"
                        style={{ backgroundColor: `${colors.secondary}10` }}
                      >
                        {guest.photo_url ? (
                          <Image
                            src={guest.photo_url}
                            alt={guest.name}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <User
                              size={28}
                              style={{ color: colors.secondary }}
                            />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className="font-semibold truncate"
                          style={{ color: colors.secondaryDarkest }}
                        >
                          {guest.name}
                        </p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Briefcase
                            size={12}
                            style={{ color: colors.secondary }}
                          />
                          <p
                            className="text-sm truncate"
                            style={{ color: colors.secondaryDark }}
                          >
                            {guest.purpose}
                          </p>
                        </div>
                        {guest.institution && (
                          <div className="flex items-center gap-1 mt-1">
                            <Building
                              size={10}
                              style={{ color: colors.secondary }}
                            />
                            <p
                              className="text-xs truncate"
                              style={{ color: colors.secondaryDark }}
                            >
                              {guest.institution}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Info Karyawan Tujuan */}
                    {guest.employee_name && (
                      <div
                        className="mt-3 pt-3"
                        style={{ borderTop: `1px solid ${colors.secondary}10` }}
                      >
                        <p
                          className="text-xs"
                          style={{ color: colors.secondaryDark }}
                        >
                          Bertemu dengan:
                        </p>
                        <p
                          className="text-sm font-medium"
                          style={{ color: colors.secondaryDarkest }}
                        >
                          {guest.employee_name}
                        </p>
                        {guest.employee_department && (
                          <p
                            className="text-xs"
                            style={{ color: colors.secondaryDark }}
                          >
                            {guest.employee_department}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Check-in Time & Tombol Pulang */}
                    <div
                      className="mt-3 pt-3 flex items-center justify-between"
                      style={{ borderTop: `1px solid ${colors.secondary}10` }}
                    >
                      <div
                        className="flex items-center gap-1 text-xs"
                        style={{ color: colors.secondaryDark }}
                      >
                        <Clock size={12} />
                        <span>Check in: {formatTimeWIB(guest.check_in_at)}</span>
                      </div>
                      <button
                        onClick={() => setShowCheckoutModal(guest)}
                        disabled={checkoutLoading === guest.id}
                        className="px-3 py-1.5 text-sm rounded-lg transition flex items-center gap-1 disabled:opacity-50"
                        style={{
                          backgroundColor: colors.secondary,
                          color: colors.white,
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor =
                            colors.secondaryDark)
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor =
                            colors.secondary)
                        }
                      >
                        {checkoutLoading === guest.id ? (
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                        ) : (
                          <LogOut size={14} />
                        )}
                        Pulang
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
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
