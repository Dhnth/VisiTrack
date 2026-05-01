"use client";

import { JSX, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  Building,
  Briefcase,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Users,
  FileText,
  Printer,
  Download,
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

interface GuestDetail {
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
  updated_at: string;
  employee_name: string | null;
  employee_department: string | null;
  employee_nip: string | null;
  created_by_name: string | null;
}

const statusConfig: Record<string, { text: string; color: string; bg: string; icon: JSX.Element }> = {
  pending: {
    text: "Pending",
    color: "#D97706",
    bg: "#FEF3C7",
    icon: <AlertCircle size={20} />,
  },
  active: {
    text: "Sedang Berkunjung",
    color: "#10B981",
    bg: "#D1FAE5",
    icon: <CheckCircle size={20} />,
  },
  done: {
    text: "Selesai",
    color: "#3B82F6",
    bg: "#DBEAFE",
    icon: <CheckCircle size={20} />,
  },
  rejected: {
    text: "Ditolak",
    color: "#EF4444",
    bg: "#FEE2E2",
    icon: <XCircle size={20} />,
  },
};

// Format datetime ke WIB
const formatDateTimeWIB = (dateString: string | null) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  // Tambah 7 jam untuk WIB
  date.setHours(date.getHours() + 7);
  return date.toLocaleString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Format tanggal ke WIB
const formatDateWIB = (dateString: string | null) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  date.setHours(date.getHours() + 7);
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

// Format waktu ke WIB
const formatTimeWIB = (dateString: string | null) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  date.setHours(date.getHours() + 7);
  return date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Format waktu dengan detik untuk durasi
const formatTimeWithSeconds = (dateString: string | null) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  date.setHours(date.getHours() + 7);
  return date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

export default function PpidHistoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const id = params.id as string;

  const [guest, setGuest] = useState<GuestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [enableCheckout, setEnableCheckout] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/ppid/history/${id}`);
        const data = await res.json();

        if (data.success && data.guest) {
          setGuest(data.guest);
          if (data.enable_checkout !== undefined) {
            setEnableCheckout(data.enable_checkout);
          }
        } else {
          setError(data.error || "Gagal memuat data");
        }
      } catch (error) {
        console.error("Error fetching detail:", error);
        setError("Terjadi kesalahan saat memuat data");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDetail();
    }
  }, [id]);

  // Hitung durasi kunjungan dengan benar
  const getDuration = () => {
    if (!guest?.check_in_at) return "-";
    
    const start = new Date(guest.check_in_at);
    // Jika sudah checkout, gunakan waktu checkout, jika belum gunakan waktu sekarang
    const end = guest.check_out_at ? new Date(guest.check_out_at) : new Date();
    
    const diffMs = end.getTime() - start.getTime();
    
    // Validasi jika diffMs negatif (data tidak valid)
    if (diffMs < 0) return "Data tidak valid";
    
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const diffSeconds = Math.floor((diffMs % (1000 * 60)) / 1000);
    
    if (guest.check_out_at) {
      // Sudah selesai, tampilkan durasi lengkap
      if (diffHours > 0) {
        return `${diffHours} jam ${diffMinutes} menit ${diffSeconds} detik`;
      } else if (diffMinutes > 0) {
        return `${diffMinutes} menit ${diffSeconds} detik`;
      } else {
        return `${diffSeconds} detik`;
      }
    } else {
      // Masih berkunjung, tampilkan durasi sementara
      if (diffHours > 0) {
        return `Masih berkunjung (${diffHours} jam ${diffMinutes} menit)`;
      } else if (diffMinutes > 0) {
        return `Masih berkunjung (${diffMinutes} menit)`;
      } else {
        return `Masih berkunjung (${diffSeconds} detik)`;
      }
    }
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

  if (error || !guest) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
          <h2
            className="text-xl font-semibold mb-2"
            style={{ color: colors.secondaryDarkest }}
          >
            Error
          </h2>
          <p className="text-sm" style={{ color: colors.secondaryDark }}>
            {error || "Data tidak ditemukan"}
          </p>
          <Link
            href={`/${slug}/ppid/history`}
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl transition"
            style={{ backgroundColor: colors.secondary, color: colors.white }}
          >
            <ArrowLeft size={16} />
            Kembali ke History
          </Link>
        </div>
      </div>
    );
  }

  const status = statusConfig[guest.status] || statusConfig.pending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            href={`/${slug}/ppid/history`}
            className="inline-flex items-center gap-2 transition mb-2"
            style={{ color: colors.secondary }}
          >
            <ArrowLeft size={16} />
            Kembali ke History
          </Link>
          <div className="flex items-center gap-3">
            <div
              className="p-2 rounded-xl"
              style={{ backgroundColor: `${colors.secondary}15` }}
            >
              <FileText className="size-6" style={{ color: colors.secondary }} />
            </div>
            <div>
              <h1
                className="text-2xl font-bold"
                style={{ color: colors.secondaryDarkest }}
              >
                Detail Kunjungan
              </h1>
              <p
                className="text-sm mt-0.5"
                style={{ color: colors.secondaryDark }}
              >
                Informasi lengkap kunjungan tamu
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Photo & Status */}
        <div className="lg:col-span-1 space-y-6">
          {/* Photo Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
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
                <User size={18} style={{ color: colors.secondary }} />
                Foto Tamu
              </h2>
            </div>
            <div className="p-6 flex justify-center">
              <div className="relative">
                {guest.photo_url ? (
                  <Image
                    src={guest.photo_url}
                    alt={guest.name}
                    width={200}
                    height={200}
                    className="rounded-xl object-cover"
                    style={{ border: `1px solid ${colors.secondary}20` }}
                  />
                ) : (
                  <div
                    className="w-48 h-48 rounded-xl flex items-center justify-center"
                    style={{
                      backgroundColor: `${colors.secondary}10`,
                      border: `1px solid ${colors.secondary}20`,
                    }}
                  >
                    <User size={64} style={{ color: colors.secondaryDark }} />
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Status Card - Menampilkan check-in/out dengan benar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
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
                <FileText size={18} style={{ color: colors.secondary }} />
                Status Kunjungan
              </h2>
            </div>
            <div className="p-5">
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
                style={{ backgroundColor: status.bg }}
              >
                {status.icon}
                <span className="font-medium" style={{ color: status.color }}>
                  {status.text}
                </span>
              </div>

              <div className="mt-4 space-y-3 text-sm">
                {/* Check In Time */}
                <div className="flex justify-between py-2 border-b" style={{ borderColor: `${colors.secondary}10` }}>
                  <span className="text-sm" style={{ color: colors.secondaryDark }}>
                    Check In
                  </span>
                  <span className="font-medium" style={{ color: colors.secondaryDarkest }}>
                    {formatDateTimeWIB(guest.check_in_at || guest.created_at)}
                  </span>
                </div>
                
                {/* Check Out Time - Hanya tampil jika checkout diaktifkan */}
                {enableCheckout && (
                  <div className="flex justify-between py-2 border-b" style={{ borderColor: `${colors.secondary}10` }}>
                    <span className="text-sm" style={{ color: colors.secondaryDark }}>
                      Check Out
                    </span>
                    <span className="font-medium" style={{ color: colors.secondaryDarkest }}>
                      {guest.check_out_at ? formatDateTimeWIB(guest.check_out_at) : "-"}
                    </span>
                  </div>
                )}
                
                {/* Duration - Hanya tampil jika checkout diaktifkan */}
                {enableCheckout && (
                  <div className="flex justify-between py-2">
                    <span className="text-sm" style={{ color: colors.secondaryDark }}>
                      Durasi
                    </span>
                    <span className="font-medium" style={{ color: colors.secondaryDarkest }}>
                      {getDuration()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column - Guest Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Guest Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
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
                <User size={18} style={{ color: colors.secondary }} />
                Informasi Tamu
              </h2>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs uppercase tracking-wider" style={{ color: colors.secondaryDark }}>
                    Nama Lengkap
                  </label>
                  <p className="font-medium mt-1" style={{ color: colors.secondaryDarkest }}>
                    {guest.name}
                  </p>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wider" style={{ color: colors.secondaryDark }}>
                    NIK
                  </label>
                  <p className="mt-1" style={{ color: colors.secondaryDarkest }}>
                    {guest.nik || "-"}
                  </p>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wider" style={{ color: colors.secondaryDark }}>
                    Asal Instansi
                  </label>
                  <p className="mt-1 flex items-center gap-1" style={{ color: colors.secondaryDarkest }}>
                    <Building size={14} style={{ color: colors.secondaryDark }} />
                    {guest.institution || "-"}
                  </p>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wider" style={{ color: colors.secondaryDark }}>
                    Tujuan Kunjungan
                  </label>
                  <p className="mt-1 flex items-center gap-1" style={{ color: colors.secondaryDarkest }}>
                    <Briefcase size={14} style={{ color: colors.secondaryDark }} />
                    {guest.purpose}
                  </p>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wider" style={{ color: colors.secondaryDark }}>
                    Tanggal Kunjungan
                  </label>
                  <p className="mt-1 flex items-center gap-1" style={{ color: colors.secondaryDarkest }}>
                    <Calendar size={14} style={{ color: colors.secondaryDark }} />
                    {formatDateWIB(guest.created_at)}
                  </p>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wider" style={{ color: colors.secondaryDark }}>
                    Waktu Kunjungan
                  </label>
                  <p className="mt-1 flex items-center gap-1" style={{ color: colors.secondaryDarkest }}>
                    <Clock size={14} style={{ color: colors.secondaryDark }} />
                    {formatTimeWIB(guest.created_at)}
                  </p>
                </div>
                
                {/* Tampilkan check-in dengan format terpisah jika ada */}
                {guest.check_in_at && (
                  <div>
                    <label className="text-xs uppercase tracking-wider" style={{ color: colors.secondaryDark }}>
                      Waktu Check In
                    </label>
                    <p className="mt-1 flex items-center gap-1" style={{ color: colors.secondaryDarkest }}>
                      <Clock size={14} style={{ color: colors.secondaryDark }} />
                      {formatTimeWithSeconds(guest.check_in_at)}
                    </p>
                  </div>
                )}
                
                {/* Tampilkan check-out jika enable checkout dan data ada */}
                {enableCheckout && guest.check_out_at && (
                  <div>
                    <label className="text-xs uppercase tracking-wider" style={{ color: colors.secondaryDark }}>
                      Waktu Check Out
                    </label>
                    <p className="mt-1 flex items-center gap-1" style={{ color: colors.secondaryDarkest }}>
                      <Clock size={14} style={{ color: colors.secondaryDark }} />
                      {formatTimeWithSeconds(guest.check_out_at)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Employee Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
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
                <Users size={18} style={{ color: colors.secondary }} />
                Informasi Karyawan Tujuan
              </h2>
            </div>
            <div className="p-5">
              {guest.employee_name ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs uppercase tracking-wider" style={{ color: colors.secondaryDark }}>
                      Nama Karyawan
                    </label>
                    <p className="font-medium mt-1" style={{ color: colors.secondaryDarkest }}>
                      {guest.employee_name}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-wider" style={{ color: colors.secondaryDark }}>
                      NIP
                    </label>
                    <p className="mt-1" style={{ color: colors.secondaryDarkest }}>
                      {guest.employee_nip || "-"}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs uppercase tracking-wider" style={{ color: colors.secondaryDark }}>
                      Departemen
                    </label>
                    <p className="mt-1" style={{ color: colors.secondaryDarkest }}>
                      {guest.employee_department || "-"}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm" style={{ color: colors.secondaryDark }}>
                  Tidak ada data karyawan yang dituju
                </p>
              )}
            </div>
          </motion.div>

          {/* Validation Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
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
                <CheckCircle size={18} style={{ color: colors.secondary }} />
                Informasi Validasi
              </h2>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs uppercase tracking-wider" style={{ color: colors.secondaryDark }}>
                    Divalidasi Oleh
                  </label>
                  <p className="mt-1" style={{ color: colors.secondaryDarkest }}>
                    {guest.created_by_name || "System (Input Manual)"}
                  </p>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wider" style={{ color: colors.secondaryDark }}>
                    Waktu Validasi
                  </label>
                  <p className="mt-1" style={{ color: colors.secondaryDarkest }}>
                    {formatDateTimeWIB(guest.check_in_at || guest.created_at)}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs uppercase tracking-wider" style={{ color: colors.secondaryDark }}>
                    Catatan
                  </label>
                  <p className="mt-1" style={{ color: colors.secondaryDarkest }}>
                    {guest.status === "pending" && "Menunggu validasi oleh petugas"}
                    {guest.status === "active" && enableCheckout 
                      ? "Tamu sedang berkunjung" 
                      : guest.status === "active" && !enableCheckout 
                      ? "Tamu telah melakukan check-in" 
                      : ""}
                    {guest.status === "done" && "Kunjungan selesai"}
                    {guest.status === "rejected" && "Kunjungan ditolak"}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <Link
              href={`/${slug}/ppid/history`}
              className="px-4 py-2 rounded-xl transition"
              style={{
                border: `1px solid ${colors.secondary}20`,
                color: colors.secondaryDark,
              }}
            >
              Kembali
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}