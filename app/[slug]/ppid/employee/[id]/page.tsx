"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  Building,
  Briefcase,
  Calendar,
  Clock,
  Phone,
  Mail,
  Users,
  Eye,
  X,
  TrendingUp,
  CheckCircle,
  AlertCircle,
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

interface EmployeeDetail {
  id: number;
  name: string;
  nip: string | null;
  department: string;
  phone: string | null;
  is_active: boolean;
  total_visits: number;
}

interface GuestVisit {
  id: number;
  name: string;
  nik: string | null;
  institution: string | null;
  purpose: string;
  status: string;
  check_in_at: string | null;
  check_out_at: string | null;
  created_at: string;
  photo_url: string | null;
}

const statusConfig: Record<string, { text: string; color: string; bg: string }> = {
  active: {
    text: "Sedang Berkunjung",
    color: "#10B981",
    bg: "#D1FAE5",
  },
  done: {
    text: "Selesai",
    color: "#3B82F6",
    bg: "#DBEAFE",
  },
};

const formatDateTimeWIB = (dateString: string | null) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  date.setHours(date.getHours() + 7);
  return date.toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function EmployeeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const id = params.id as string;

  const [employee, setEmployee] = useState<EmployeeDetail | null>(null);
  const [guests, setGuests] = useState<GuestVisit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedGuest, setSelectedGuest] = useState<GuestVisit | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/ppid/employee/${id}`);
        const data = await res.json();

        if (data.success) {
          setEmployee(data.employee);
          setGuests(data.guests);
        } else {
          setError(data.error || "Gagal memuat data");
        }
      } catch (error) {
        console.error("Error fetching employee:", error);
        setError("Terjadi kesalahan saat memuat data");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  const openGuestModal = (guest: GuestVisit) => {
    setSelectedGuest(guest);
    setShowModal(true);
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

  if (error || !employee) {
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
            href={`/${slug}/ppid/employee`}
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl transition"
            style={{ backgroundColor: colors.secondary, color: colors.white }}
          >
            <ArrowLeft size={16} />
            Kembali ke Ranking
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Modal Detail Tamu */}
      <AnimatePresence>
        {showModal && selectedGuest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="rounded-2xl shadow-xl max-w-md w-full mx-4 overflow-hidden"
              style={{ backgroundColor: colors.white }}
            >
              <div
                className="p-5 flex items-center justify-between"
                style={{ borderBottom: `1px solid ${colors.secondary}20` }}
              >
                <h3 className="text-xl font-semibold" style={{ color: colors.secondaryDarkest }}>
                  Detail Tamu
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1 rounded-lg transition"
                  style={{ color: colors.secondaryDark }}
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-5 space-y-4">
                <div className="flex gap-3">
                  <div
                    className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0"
                    style={{ backgroundColor: `${colors.secondary}10` }}
                  >
                    {selectedGuest.photo_url ? (
                      <Image
                        src={selectedGuest.photo_url}
                        alt={selectedGuest.name}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User size={28} style={{ color: colors.secondary }} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-lg" style={{ color: colors.secondaryDarkest }}>
                      {selectedGuest.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Briefcase size={14} style={{ color: colors.secondaryDark }} />
                      <p className="text-sm" style={{ color: colors.secondaryDark }}>
                        {selectedGuest.purpose}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between py-2 border-b" style={{ borderColor: `${colors.secondary}10` }}>
                    <span className="text-sm" style={{ color: colors.secondaryDark }}>NIK</span>
                    <span className="text-sm" style={{ color: colors.secondaryDarkest }}>
                      {selectedGuest.nik || "-"}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b" style={{ borderColor: `${colors.secondary}10` }}>
                    <span className="text-sm" style={{ color: colors.secondaryDark }}>Asal Instansi</span>
                    <span className="text-sm" style={{ color: colors.secondaryDarkest }}>
                      {selectedGuest.institution || "-"}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b" style={{ borderColor: `${colors.secondary}10` }}>
                    <span className="text-sm" style={{ color: colors.secondaryDark }}>Status</span>
                    <span
                      className="text-xs px-2 py-1 rounded-full"
                      style={{
                        backgroundColor: statusConfig[selectedGuest.status]?.bg,
                        color: statusConfig[selectedGuest.status]?.color,
                      }}
                    >
                      {statusConfig[selectedGuest.status]?.text || selectedGuest.status}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b" style={{ borderColor: `${colors.secondary}10` }}>
                    <span className="text-sm" style={{ color: colors.secondaryDark }}>Tanggal Kunjungan</span>
                    <span className="text-sm" style={{ color: colors.secondaryDarkest }}>
                      {formatDateTimeWIB(selectedGuest.created_at)}
                    </span>
                  </div>
                  {selectedGuest.check_in_at && (
                    <div className="flex justify-between py-2">
                      <span className="text-sm" style={{ color: colors.secondaryDark }}>Check In</span>
                      <span className="text-sm" style={{ color: colors.secondaryDarkest }}>
                        {formatDateTimeWIB(selectedGuest.check_in_at)}
                      </span>
                    </div>
                  )}
                </div>
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
              href={`/${slug}/ppid/employee`}
              className="inline-flex items-center gap-2 transition mb-2"
              style={{ color: colors.secondary }}
            >
              <ArrowLeft size={16} />
              Kembali ke Ranking
            </Link>
            <div className="flex items-center gap-3">
              <div
                className="p-2 rounded-xl"
                style={{ backgroundColor: `${colors.secondary}15` }}
              >
                <User className="size-6" style={{ color: colors.secondary }} />
              </div>
              <div>
                <h1
                  className="text-2xl font-bold"
                  style={{ color: colors.secondaryDarkest }}
                >
                  Detail Karyawan
                </h1>
                <p
                  className="text-sm mt-0.5"
                  style={{ color: colors.secondaryDark }}
                >
                  Informasi lengkap karyawan dan riwayat kunjungan
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Employee Info Card */}
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
            className="px-5 py-4 flex items-center gap-3"
            style={{
              borderBottom: `1px solid ${colors.secondary}20`,
              background: `linear-gradient(135deg, ${colors.secondary}05, ${colors.white})`,
            }}
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${colors.secondary}20` }}
            >
              <User size={24} style={{ color: colors.secondary }} />
            </div>
            <div>
              <h2 className="text-xl font-bold" style={{ color: colors.secondaryDarkest }}>
                {employee.name}
              </h2>
              <p className="text-sm" style={{ color: colors.secondaryDark }}>
                {employee.department}
              </p>
            </div>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs uppercase tracking-wider" style={{ color: colors.secondaryDark }}>
                  NIP
                </label>
                <p className="mt-1" style={{ color: colors.secondaryDarkest }}>
                  {employee.nip || "-"}
                </p>
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider" style={{ color: colors.secondaryDark }}>
                  Telepon
                </label>
                <p className="mt-1 flex items-center gap-1" style={{ color: colors.secondaryDarkest }}>
                  <Phone size={14} style={{ color: colors.secondaryDark }} />
                  {employee.phone || "-"}
                </p>
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider" style={{ color: colors.secondaryDark }}>
                  Status
                </label>
                <p className="mt-1">
                  <span
                    className="text-xs px-2 py-1 rounded-full"
                    style={{
                      backgroundColor: employee.is_active ? `${colors.secondary}15` : "#FEE2E2",
                      color: employee.is_active ? colors.secondary : "#EF4444",
                    }}
                  >
                    {employee.is_active ? "Aktif" : "Nonaktif"}
                  </span>
                </p>
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider" style={{ color: colors.secondaryDark }}>
                  Total Kunjungan
                </label>
                <p className="mt-1 flex items-center gap-1" style={{ color: colors.secondaryDarkest }}>
                  <TrendingUp size={14} style={{ color: colors.secondary }} />
                  <span className="text-2xl font-bold" style={{ color: colors.secondary }}>
                    {employee.total_visits}
                  </span>
                  <span className="text-sm">kunjungan</span>
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Guest Visits List */}
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
            <h2 className="font-semibold flex items-center gap-2" style={{ color: colors.secondaryDarkest }}>
              <Users size={18} style={{ color: colors.secondary }} />
              Riwayat Kunjungan
            </h2>
          </div>
          <div className="p-4">
            {guests.length === 0 ? (
              <div className="text-center py-8">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3"
                  style={{ backgroundColor: `${colors.secondary}10` }}
                >
                  <Users size={28} style={{ color: colors.secondary }} />
                </div>
                <p className="text-sm" style={{ color: colors.secondaryDark }}>
                  Belum ada tamu yang berkunjung ke karyawan ini
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {guests.map((guest) => (
                  <div
                    key={guest.id}
                    onClick={() => openGuestModal(guest)}
                    className="p-3 rounded-xl cursor-pointer transition hover:shadow-md"
                    style={{
                      backgroundColor: `${colors.secondary}05`,
                      border: `1px solid ${colors.secondary}10`,
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0"
                            style={{ backgroundColor: `${colors.secondary}10` }}
                          >
                            {guest.photo_url ? (
                              <Image
                                src={guest.photo_url}
                                alt={guest.name}
                                width={40}
                                height={40}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <User size={20} style={{ color: colors.secondary }} />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium" style={{ color: colors.secondaryDarkest }}>
                              {guest.name}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <Briefcase size={12} style={{ color: colors.secondaryDark }} />
                              <p className="text-xs" style={{ color: colors.secondaryDark }}>
                                {guest.purpose}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex items-center gap-1">
                            <Calendar size={12} style={{ color: colors.secondaryDark }} />
                            <p className="text-xs" style={{ color: colors.secondaryDark }}>
                              {formatDateTimeWIB(guest.created_at)}
                            </p>
                          </div>
                          <span
                            className="text-xs px-2 py-0.5 rounded-full"
                            style={{
                              backgroundColor: statusConfig[guest.status]?.bg,
                              color: statusConfig[guest.status]?.color,
                            }}
                          >
                            {statusConfig[guest.status]?.text || guest.status}
                          </span>
                        </div>
                      </div>
                      <button
                        className="p-1.5 rounded-lg transition"
                        style={{ color: colors.secondary }}
                      >
                        <Eye size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </>
  );
}