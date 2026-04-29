"use client";

import { useState, useEffect, JSX } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  User,
  Building,
  Briefcase,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Users,
  ArrowLeft,
  Home,
  Loader2
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

interface GuestStatus {
  id: number;
  name: string;
  nik: string | null;
  institution: string | null;
  purpose: string;
  photo_url: string | null;
  status: string;
  check_in_at: string | null;
  check_out_at: string | null;
  created_at: string;
  employee_name: string | null;
  employee_department: string | null;
  validated_by: string | null;
}

const statusConfig: Record<string, { text: string; color: string; bg: string; icon: JSX.Element; description: string }> = {
  pending: {
    text: "Menunggu Validasi",
    color: "#D97706",
    bg: "#FEF3C7",
    icon: <Clock size={20} />,
    description: "Data kunjungan Anda sedang diperiksa oleh petugas. Mohon tunggu sebentar."
  },
  active: {
    text: "Sedang Berkunjung",
    color: "#10B981",
    bg: "#D1FAE5",
    icon: <CheckCircle size={20} />,
    description: "Kunjungan Anda telah divalidasi. Selamat berkunjung!"
  },
  done: {
    text: "Selesai",
    color: "#3B82F6",
    bg: "#DBEAFE",
    icon: <CheckCircle size={20} />,
    description: "Kunjungan Anda telah selesai. Terima kasih telah berkunjung."
  },
  rejected: {
    text: "Ditolak",
    color: "#EF4444",
    bg: "#FEE2E2",
    icon: <XCircle size={20} />,
    description: "Maaf, kunjungan Anda ditolak. Silakan hubungi petugas untuk informasi lebih lanjut."
  },
};

export default function GuestStatusPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [nik, setNik] = useState("");
  const [searchNIK, setSearchNIK] = useState("");
  const [guest, setGuest] = useState<GuestStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchNIK.trim()) {
      setError("Masukkan NIK untuk mencari");
      return;
    }

    setLoading(true);
    setError("");
    setGuest(null);
    setHasSearched(true);

    try {
      const res = await fetch(`/api/guest/status?nik=${encodeURIComponent(searchNIK)}&slug=${slug}`);
      const data = await res.json();
      
      if (data.success && data.guest) {
        setGuest(data.guest);
        setNik(searchNIK);
      } else {
        setError(data.error || "Data tidak ditemukan");
        setGuest(null);
      }
    } catch (err) {
      console.error("Error fetching status:", err);
      setError("Terjadi kesalahan saat mencari data");
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchNIK("");
    setGuest(null);
    setError("");
    setHasSearched(false);
  };

  const status = guest ? statusConfig[guest.status] || statusConfig.pending : null;

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Pattern */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: "url(/images/bg-home.svg)",
          backgroundRepeat: "repeat",
          backgroundSize: "221px",
          maskImage: "linear-gradient(to bottom, black 0%, transparent 70%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, black 0%, transparent 100%)",
        }}
      />

      <div className="relative z-10 min-h-screen py-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            <Link
              href={`/${slug}/guest-form`}
              className="inline-flex items-center gap-2 text-sm mb-4 transition hover:underline"
              style={{ color: colors.secondary }}
            >
              <ArrowLeft size={16} />
              Kembali ke Form Kunjungan
            </Link>
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-2xl bg-white shadow-lg">
                <Image
                  src="/images/icon.svg"
                  alt="VisiTrack"
                  width={50}
                  height={50}
                />
              </div>
            </div>
            <h1 className="text-2xl font-bold" style={{ color: colors.secondaryDarkest }}>
              Cek Status Kunjungan
            </h1>
            <p className="text-sm mt-1" style={{ color: colors.secondaryDark }}>
              Masukkan NIK Anda untuk melihat status kunjungan
            </p>
          </motion.div>

          {/* Search Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="rounded-2xl shadow-xl overflow-hidden bg-white/95 backdrop-blur-sm mb-6"
            style={{ border: `1px solid ${colors.secondary}20` }}
          >
            <form onSubmit={handleSearch} className="p-6">
              <div className="relative">
                <User
                  className="absolute left-3 top-1/2 -translate-y-1/2 size-4"
                  style={{ color: colors.secondaryDark }}
                />
                <input
                  type="text"
                  value={searchNIK}
                  onChange={(e) => setSearchNIK(e.target.value)}
                  placeholder="Masukkan NIK Anda"
                  className="w-full pl-9 pr-24 py-3 rounded-xl focus:outline-none focus:ring-2"
                  style={{
                    border: `1px solid ${colors.secondary}20`,
                    color: colors.secondaryDarkest,
                    backgroundColor: colors.white,
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = colors.secondary)}
                  onBlur={(e) => (e.currentTarget.style.borderColor = `${colors.secondary}20`)}
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded-lg transition disabled:opacity-50 text-sm font-medium"
                  style={{ backgroundColor: colors.secondary, color: colors.white }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = colors.secondaryDark)}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = colors.secondary)}
                >
                  {loading ? "Mencari..." : "Cari"}
                </button>
              </div>
            </form>
          </motion.div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="rounded-xl p-4 mb-6"
                style={{ backgroundColor: "#FEE2E2", border: "1px solid #FCA5A5" }}
              >
                <div className="flex items-center gap-2">
                  <AlertCircle size={18} className="text-red-600" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin" size={32} style={{ color: colors.secondary }} />
            </div>
          )}

          {/* Result Card */}
          {guest && status && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-5"
            >
              {/* Status Banner */}
              <div
                className="rounded-2xl p-6 text-center"
                style={{ backgroundColor: status.bg }}
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  {status.icon}
                  <h2 className="text-xl font-semibold" style={{ color: status.color }}>
                    {status.text}
                  </h2>
                </div>
                <p className="text-sm" style={{ color: status.color }}>
                  {status.description}
                </p>
              </div>

              {/* Guest Info */}
              <div className="rounded-2xl shadow-sm overflow-hidden bg-white/95 backdrop-blur-sm" style={{ border: `1px solid ${colors.secondary}20` }}>
                <div className="p-5 border-b" style={{ borderColor: `${colors.secondary}20` }}>
                  <h2 className="font-semibold flex items-center gap-2" style={{ color: colors.secondaryDarkest }}>
                    <User size={18} style={{ color: colors.secondary }} />
                    Informasi Tamu
                  </h2>
                </div>
                <div className="p-5 space-y-4">
                  <div className="flex justify-between py-2 border-b" style={{ borderColor: `${colors.secondary}10` }}>
                    <span className="text-sm" style={{ color: colors.secondaryDark }}>Nama Lengkap</span>
                    <span className="text-sm font-medium" style={{ color: colors.secondaryDarkest }}>{guest.name}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b" style={{ borderColor: `${colors.secondary}10` }}>
                    <span className="text-sm" style={{ color: colors.secondaryDark }}>NIK</span>
                    <span className="text-sm" style={{ color: colors.secondaryDarkest }}>{guest.nik || "-"}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b" style={{ borderColor: `${colors.secondary}10` }}>
                    <span className="text-sm" style={{ color: colors.secondaryDark }}>Asal Instansi</span>
                    <span className="text-sm" style={{ color: colors.secondaryDarkest }}>{guest.institution || "-"}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b" style={{ borderColor: `${colors.secondary}10` }}>
                    <span className="text-sm" style={{ color: colors.secondaryDark }}>Tujuan Kunjungan</span>
                    <span className="text-sm" style={{ color: colors.secondaryDarkest }}>{guest.purpose}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-sm" style={{ color: colors.secondaryDark }}>Tanggal Kunjungan</span>
                    <span className="text-sm" style={{ color: colors.secondaryDarkest }}>{formatDateTime(guest.created_at)}</span>
                  </div>
                </div>
              </div>

              {/* Employee Info */}
              {guest.employee_name && (
                <div className="rounded-2xl shadow-sm overflow-hidden bg-white/95 backdrop-blur-sm" style={{ border: `1px solid ${colors.secondary}20` }}>
                  <div className="p-5 border-b" style={{ borderColor: `${colors.secondary}20` }}>
                    <h2 className="font-semibold flex items-center gap-2" style={{ color: colors.secondaryDarkest }}>
                      <Users size={18} style={{ color: colors.secondary }} />
                      Karyawan Tujuan
                    </h2>
                  </div>
                  <div className="p-5 space-y-4">
                    <div className="flex justify-between py-2 border-b" style={{ borderColor: `${colors.secondary}10` }}>
                      <span className="text-sm" style={{ color: colors.secondaryDark }}>Nama Karyawan</span>
                      <span className="text-sm font-medium" style={{ color: colors.secondaryDarkest }}>{guest.employee_name}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-sm" style={{ color: colors.secondaryDark }}>Departemen</span>
                      <span className="text-sm" style={{ color: colors.secondaryDarkest }}>{guest.employee_department || "-"}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Timeline */}
              <div className="rounded-2xl shadow-sm overflow-hidden bg-white/95 backdrop-blur-sm" style={{ border: `1px solid ${colors.secondary}20` }}>
                <div className="p-5 border-b" style={{ borderColor: `${colors.secondary}20` }}>
                  <h2 className="font-semibold flex items-center gap-2" style={{ color: colors.secondaryDarkest }}>
                    <Clock size={18} style={{ color: colors.secondary }} />
                    Timeline Kunjungan
                  </h2>
                </div>
                <div className="p-5">
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="relative">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: `${colors.secondary}15` }}>
                          <Calendar size={14} style={{ color: colors.secondary }} />
                        </div>
                        {guest.check_in_at && <div className="absolute top-8 left-4 w-0.5 h-8" style={{ backgroundColor: `${colors.secondary}20` }}></div>}
                      </div>
                      <div>
                        <p className="text-sm font-medium" style={{ color: colors.secondaryDarkest }}>Pendaftaran</p>
                        <p className="text-xs" style={{ color: colors.secondaryDark }}>{formatDateTime(guest.created_at)}</p>
                      </div>
                    </div>

                    {guest.check_in_at && (
                      <div className="flex gap-3">
                        <div className="relative">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: `${colors.secondary}15` }}>
                            <CheckCircle size={14} style={{ color: colors.secondary }} />
                          </div>
                          {guest.check_out_at && <div className="absolute top-8 left-4 w-0.5 h-8" style={{ backgroundColor: `${colors.secondary}20` }}></div>}
                        </div>
                        <div>
                          <p className="text-sm font-medium" style={{ color: colors.secondaryDarkest }}>Validasi / Check In</p>
                          <p className="text-xs" style={{ color: colors.secondaryDark }}>{formatDateTime(guest.check_in_at)}</p>
                          {guest.validated_by && <p className="text-xs" style={{ color: colors.secondaryDark }}>Oleh: {guest.validated_by}</p>}
                        </div>
                      </div>
                    )}

                    {guest.check_out_at && (
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: `${colors.secondary}15` }}>
                          <CheckCircle size={14} style={{ color: colors.secondary }} />
                        </div>
                        <div>
                          <p className="text-sm font-medium" style={{ color: colors.secondaryDarkest }}>Check Out</p>
                          <p className="text-xs" style={{ color: colors.secondaryDark }}>{formatDateTime(guest.check_out_at)}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Link
                  href="/"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition font-medium"
                  style={{ backgroundColor: colors.secondary, color: colors.white }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = colors.secondaryDark)}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = colors.secondary)}
                >
                  <Home size={16} />
                  Kembali ke Beranda
                </Link>
                <button
                  onClick={clearSearch}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition font-medium"
                  style={{ border: `1px solid ${colors.secondary}20`, color: colors.secondaryDark }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = `${colors.secondary}10`)}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  <Search size={16} />
                  Cek NIK Lain
                </button>
              </div>
            </motion.div>
          )}

          {/* Empty State - Belum Cari */}
          {!hasSearched && !loading && !guest && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: `${colors.secondary}10` }}>
                <Search size={32} style={{ color: colors.secondary }} />
              </div>
              <p className="text-sm" style={{ color: colors.secondaryDark }}>
                Masukkan NIK Anda di atas untuk melihat status kunjungan
              </p>
            </motion.div>
          )}

          {/* Not Found State */}
          {hasSearched && !loading && !guest && !error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: `${colors.primaryLight}15` }}>
                <AlertCircle size={32} style={{ color: colors.primaryLight }} />
              </div>
              <p className="text-sm" style={{ color: colors.secondaryDark }}>
                Data tidak ditemukan. Pastikan NIK yang Anda masukkan benar.
              </p>
            </motion.div>
          )}

          {/* Footer */}
          <p className="text-center text-xs mt-8" style={{ color: colors.secondaryDark }}>
            © {new Date().getFullYear()} VisiTrack. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}