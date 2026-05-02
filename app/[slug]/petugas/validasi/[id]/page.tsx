"use client";

import { useEffect, useState, useRef } from "react";
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
  CheckCircle,
  XCircle,
  AlertCircle,
  Users,
  Camera,
  RefreshCw,
  X,
  Trash2,
  ChevronLeft,
  ChevronRight,
  UserCheck,
} from "lucide-react";

interface GuestDetail {
  id: number;
  name: string;
  nik: string | null;
  institution: string | null;
  purpose: string;
  photo_url: string | null;
  status: string;
  created_at: string;
  employee_name: string | null;
  employee_department: string | null;
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

export default function ValidasiDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const id = params.id as string;

  const [guest, setGuest] = useState<GuestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [timer, setTimer] = useState(3);
  const [showTimerOverlay, setShowTimerOverlay] = useState(false);
  const [toastMessage, setToastMessage] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setToastMessage({ type, message });
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await fetch(`/api/petugas/pending/${id}`);
        const data = await res.json();
        if (data.success) {
          setGuest(data.guest);
        } else {
          setError(data.error || "Gagal memuat data");
        }
      } catch (err) {
        setError("Terjadi kesalahan");
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  // Start camera
  const startCamera = async () => {
    setShowCamera(true);
    setCapturedPhoto(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      showToast(
        "error",
        "Tidak dapat mengakses kamera. Pastikan izin kamera diberikan.",
      );
      setShowCamera(false);
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  // Capture photo with timer overlay
  const startCaptureWithTimer = () => {
    let countdown = 3;
    setTimer(countdown);
    setShowTimerOverlay(true);

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      countdown -= 1;
      setTimer(countdown);

      if (countdown <= 0) {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        setShowTimerOverlay(false);
        doCapturePhoto();
      }
    }, 1000);
  };

  // Do actual capture
  const doCapturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        ctx.setTransform(1, 0, 0, 1, 0, 0);
      }

      const photoDataUrl = canvas.toDataURL("image/jpeg", 0.8);
      setCapturedPhoto(photoDataUrl);
      stopCamera();
      setShowPreviewModal(true);
    }
  };

  // Retake photo
  const retakePhoto = () => {
    setShowPreviewModal(false);
    setCapturedPhoto(null);
    startCamera();
  };

  // Cancel preview
  const cancelPreview = () => {
    setShowPreviewModal(false);
    setCapturedPhoto(null);
  };

  // Upload captured photo
  const uploadCapturedPhoto = async () => {
    if (!capturedPhoto) return;

    setUploadingPhoto(true);
    try {
      const blob = await (await fetch(capturedPhoto)).blob();
      const formData = new FormData();
      formData.append("file", blob, "camera-photo.jpg");

      const res = await fetch(`/api/petugas/pending/${id}`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        setGuest((prev) =>
          prev ? { ...prev, photo_url: data.photo_url } : null,
        );
        showToast("success", "Foto berhasil diambil dan disimpan");
        setShowPreviewModal(false);
        setCapturedPhoto(null);
        setShowPhotoModal(false);
      } else {
        showToast("error", data.error || "Gagal upload foto");
        setShowPreviewModal(true);
      }
    } catch (err) {
      console.error("Upload error:", err);
      showToast("error", "Terjadi kesalahan saat upload");
      setShowPreviewModal(true);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleAction = async (action: "approve" | "reject") => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/petugas/pending", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("success", data.message);
        setTimeout(() => {
          router.push(`/${slug}/petugas/validasi`);
        }, 1500);
      } else {
        showToast("error", data.error);
      }
    } catch (err) {
      showToast("error", "Terjadi kesalahan");
    } finally {
      setActionLoading(false);
    }
  };

  // Format datetime ke WIB (UTC+7)
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
      second: "2-digit",
    });
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

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
            href={`/${slug}/petugas/validasi`}
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl transition"
            style={{ backgroundColor: colors.secondary, color: colors.white }}
          >
            <ArrowLeft size={16} />
            Kembali ke Validasi
          </Link>
        </div>
      </div>
    );
  }

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

      {/* Modal Pilih Kamera */}
      <AnimatePresence>
        {showPhotoModal && !showCamera && !capturedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowPhotoModal(false)}
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
                className="p-5"
                style={{ borderBottom: `1px solid ${colors.secondary}20` }}
              >
                <div className="flex items-center justify-between">
                  <h3
                    className="text-xl font-semibold"
                    style={{ color: colors.secondaryDarkest }}
                  >
                    Ganti Foto Tamu
                  </h3>
                  <button
                    onClick={() => setShowPhotoModal(false)}
                    className="p-1 rounded-lg transition"
                    style={{ color: colors.secondaryDark }}
                  >
                    <X size={20} />
                  </button>
                </div>
                <p
                  className="text-sm mt-1"
                  style={{ color: colors.secondaryDark }}
                >
                  Ambil foto langsung dari kamera
                </p>
              </div>

              <div className="p-5">
                <div
                  className="rounded-xl p-6 text-center"
                  style={{
                    backgroundColor: `${colors.secondary}10`,
                    border: `1px solid ${colors.secondary}20`,
                  }}
                >
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
                    style={{ backgroundColor: `${colors.secondary}20` }}
                  >
                    <Camera size={36} style={{ color: colors.secondary }} />
                  </div>
                  <p
                    className="text-sm font-medium mb-2"
                    style={{ color: colors.secondaryDarkest }}
                  >
                    Ambil Foto Baru
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: colors.secondaryDark }}
                  >
                    Pastikan wajah tamu terlihat jelas
                  </p>
                </div>

                <button
                  onClick={startCamera}
                  className="w-full mt-4 py-3 rounded-xl transition flex items-center justify-center gap-2 font-medium"
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
                  <Camera size={18} />
                  Buka Kamera
                </button>
              </div>

              <div
                className="p-4"
                style={{
                  borderTop: `1px solid ${colors.secondary}10`,
                  backgroundColor: `${colors.secondary}05`,
                }}
              >
                <button
                  onClick={() => setShowPhotoModal(false)}
                  className="w-full py-2 transition font-medium"
                  style={{ color: colors.secondaryDark }}
                >
                  Batal
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Kamera */}
      <AnimatePresence>
        {showCamera && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
          >
            <div className="relative w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold text-lg">Ambil Foto</h3>
                <button
                  onClick={() => {
                    stopCamera();
                    setShowTimerOverlay(false);
                    if (timerRef.current) clearInterval(timerRef.current);
                  }}
                  className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="relative bg-black rounded-2xl overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full aspect-square object-cover"
                  style={{ transform: "scaleX(-1)" }}
                />
                <div
                  className="absolute inset-0 border-2 rounded-2xl pointer-events-none"
                  style={{ borderColor: `${colors.secondary}80` }}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div
                      className="w-40 h-40 rounded-full border-2 flex items-center justify-center"
                      style={{ borderColor: `${colors.secondary}60` }}
                    >
                      <div
                        className="w-32 h-32 rounded-full border flex items-center justify-center"
                        style={{ borderColor: `${colors.secondary}30` }}
                      >
                        <User
                          size={48}
                          style={{ color: `${colors.secondary}40` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {showTimerOverlay && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                    <motion.div
                      key={timer}
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 1.5, opacity: 0 }}
                      className="w-32 h-32 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${colors.secondary}E6` }}
                    >
                      <span className="text-7xl font-bold text-white">
                        {timer}
                      </span>
                    </motion.div>
                  </div>
                )}

                <div className="absolute bottom-4 left-0 right-0 text-center">
                  <p className="text-white/80 text-xs bg-black/50 inline-block px-3 py-1 rounded-full">
                    {showTimerOverlay
                      ? `Foto akan diambil dalam ${timer} detik`
                      : "Tekan tombol kamera untuk mulai timer 3 detik"}
                  </p>
                </div>
              </div>

              <div className="flex justify-center mt-6">
                <button
                  onClick={startCaptureWithTimer}
                  disabled={showTimerOverlay}
                  className="p-3 bg-white rounded-full shadow-lg hover:bg-gray-100 transition transform hover:scale-105 active:scale-95 disabled:opacity-50"
                >
                  <div
                    className="w-16 h-16 rounded-full border-4"
                    style={{ borderColor: colors.secondary }}
                  ></div>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Preview Foto */}
      <AnimatePresence>
        {showPreviewModal && capturedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="rounded-2xl shadow-xl max-w-md w-full mx-4 overflow-hidden"
              style={{ backgroundColor: colors.white }}
            >
              <div
                className="p-5"
                style={{ borderBottom: `1px solid ${colors.secondary}20` }}
              >
                <div className="flex items-center justify-between">
                  <h3
                    className="text-xl font-semibold"
                    style={{ color: colors.secondaryDarkest }}
                  >
                    Preview Foto
                  </h3>
                  <button
                    onClick={cancelPreview}
                    className="p-1 rounded-lg transition"
                    style={{ color: colors.secondaryDark }}
                  >
                    <X size={20} />
                  </button>
                </div>
                <p
                  className="text-sm mt-1"
                  style={{ color: colors.secondaryDark }}
                >
                  Apakah foto ini sudah sesuai?
                </p>
              </div>

              <div className="p-5">
                <div
                  className="relative rounded-xl overflow-hidden mb-4"
                  style={{ backgroundColor: `${colors.secondary}10` }}
                >
                  <img
                    src={capturedPhoto}
                    alt="Preview"
                    className="w-full aspect-square object-cover"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={retakePhoto}
                    disabled={uploadingPhoto}
                    className="py-2.5 rounded-xl transition flex items-center justify-center gap-2 font-medium disabled:opacity-50"
                    style={{ backgroundColor: "#EAB308", color: colors.white }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#CA8A04")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "#EAB308")
                    }
                  >
                    <RefreshCw size={18} />
                    Foto Ulang
                  </button>
                  <button
                    onClick={uploadCapturedPhoto}
                    disabled={uploadingPhoto}
                    className="py-2.5 rounded-xl transition flex items-center justify-center gap-2 font-medium disabled:opacity-50"
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
                    {uploadingPhoto ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Mengupload...
                      </>
                    ) : (
                      <>
                        <CheckCircle size={18} />
                        Ya, Gunakan
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Main Content */}
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Link
              href={`/${slug}/petugas/validasi`}
              className="inline-flex items-center gap-2 transition mb-2"
              style={{ color: colors.secondary }}
            >
              <ChevronLeft size={16} />
              Kembali ke Validasi
            </Link>
            <div className="flex items-center gap-3">
              <div
                className="p-2 rounded-xl"
                style={{ backgroundColor: `${colors.secondary}15` }}
              >
                <UserCheck size={24} style={{ color: colors.secondary }} />
              </div>
              <div>
                <h1
                  className="text-2xl font-bold"
                  style={{ color: colors.secondaryDarkest }}
                >
                  Validasi Tamu
                </h1>
                <p
                  className="text-sm mt-0.5"
                  style={{ color: colors.secondaryDark }}
                >
                  Periksa data dan foto tamu sebelum validasi
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
            Menunggu Validasi
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Photo Section */}
          <div
            className="rounded-2xl shadow-sm overflow-hidden"
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
                <Camera size={18} style={{ color: colors.secondary }} />
                Foto Tamu
              </h2>
            </div>
            <div className="p-6 flex flex-col items-center">
              <div className="relative">
                <div
                  className="w-64 h-64 rounded-xl overflow-hidden flex items-center justify-center relative"
                  style={{
                    backgroundColor: `${colors.secondary}10`,
                    border: `2px dashed ${colors.secondary}30`,
                  }}
                >
                  {guest.photo_url ? (
                    <Image
                      src={guest.photo_url}
                      alt={guest.name}
                      width={256}
                      height={256}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center">
                      <User size={48} style={{ color: colors.secondary }} />
                      <p
                        className="text-sm mt-2"
                        style={{ color: colors.secondaryDark }}
                      >
                        Belum ada foto
                      </p>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setShowPhotoModal(true)}
                  className="absolute -bottom-2 -right-2 p-2.5 rounded-full transition shadow-md"
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
                  <Camera size={16} />
                </button>
              </div>
              <div className="flex gap-2 mt-4">
                <div
                  className="flex items-center gap-1 text-xs"
                  style={{ color: colors.secondaryDark }}
                >
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span>Wajah jelas</span>
                </div>
                <div
                  className="flex items-center gap-1 text-xs"
                  style={{ color: colors.secondaryDark }}
                >
                  <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                  <span>Pencahayaan cukup</span>
                </div>
                <div
                  className="flex items-center gap-1 text-xs"
                  style={{ color: colors.secondaryDark }}
                >
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span>Ekspresi netral</span>
                </div>
              </div>
            </div>
          </div>

          {/* Info Section */}
          <div className="space-y-5">
            {/* Guest Info */}
            <div
              className="rounded-2xl shadow-sm overflow-hidden"
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
              <div className="p-5 space-y-3">
                <div
                  className="flex justify-between py-2"
                  style={{ borderBottom: `1px solid ${colors.secondary}10` }}
                >
                  <span
                    className="text-sm"
                    style={{ color: colors.secondaryDark }}
                  >
                    Nama Lengkap
                  </span>
                  <span
                    className="text-sm font-medium"
                    style={{ color: colors.secondaryDarkest }}
                  >
                    {guest.name}
                  </span>
                </div>
                <div
                  className="flex justify-between py-2"
                  style={{ borderBottom: `1px solid ${colors.secondary}10` }}
                >
                  <span
                    className="text-sm"
                    style={{ color: colors.secondaryDark }}
                  >
                    NIK
                  </span>
                  <span
                    className="text-sm"
                    style={{ color: colors.secondaryDarkest }}
                  >
                    {guest.nik || "-"}
                  </span>
                </div>
                <div
                  className="flex justify-between py-2"
                  style={{ borderBottom: `1px solid ${colors.secondary}10` }}
                >
                  <span
                    className="text-sm"
                    style={{ color: colors.secondaryDark }}
                  >
                    Asal Instansi
                  </span>
                  <span
                    className="text-sm"
                    style={{ color: colors.secondaryDarkest }}
                  >
                    {guest.institution || "-"}
                  </span>
                </div>
                <div
                  className="flex justify-between py-2"
                  style={{ borderBottom: `1px solid ${colors.secondary}10` }}
                >
                  <span
                    className="text-sm"
                    style={{ color: colors.secondaryDark }}
                  >
                    Tujuan Kunjungan
                  </span>
                  <span
                    className="text-sm"
                    style={{ color: colors.secondaryDarkest }}
                  >
                    {guest.purpose}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span
                    className="text-sm"
                    style={{ color: colors.secondaryDark }}
                  >
                    Tanggal/Waktu
                  </span>
                  <span
                    className="text-sm"
                    style={{ color: colors.secondaryDarkest }}
                  >
                    {formatDateTimeWIB(guest.created_at)}
                  </span>
                </div>
              </div>
            </div>

            {/* Employee Info */}
            <div
              className="rounded-2xl shadow-sm overflow-hidden"
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
                  Karyawan Tujuan
                </h2>
              </div>
              <div className="p-5">
                {guest.employee_name ? (
                  <div className="space-y-3">
                    <div
                      className="flex justify-between py-2"
                      style={{
                        borderBottom: `1px solid ${colors.secondary}10`,
                      }}
                    >
                      <span
                        className="text-sm"
                        style={{ color: colors.secondaryDark }}
                      >
                        Nama Karyawan
                      </span>
                      <span
                        className="text-sm font-medium"
                        style={{ color: colors.secondaryDarkest }}
                      >
                        {guest.employee_name}
                      </span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span
                        className="text-sm"
                        style={{ color: colors.secondaryDark }}
                      >
                        Departemen
                      </span>
                      <span
                        className="text-sm"
                        style={{ color: colors.secondaryDarkest }}
                      >
                        {guest.employee_department || "-"}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p
                    className="text-sm text-center py-4"
                    style={{ color: colors.secondaryDark }}
                  >
                    Tidak ada data karyawan yang dituju
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => handleAction("reject")}
                disabled={actionLoading}
                className="flex-1 px-4 py-3 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50 font-medium shadow-sm"
                style={{ backgroundColor: "#EF4444", color: colors.white }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#DC2626")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "#EF4444")
                }
              >
                {actionLoading ? (
                  <RefreshCw size={18} className="animate-spin" />
                ) : (
                  <XCircle size={18} />
                )}
                Tolak
              </button>
              <button
                onClick={() => handleAction("approve")}
                disabled={actionLoading}
                className="flex-1 px-4 py-3 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50 font-medium shadow-sm"
                style={{
                  backgroundColor: colors.secondary,
                  color: colors.white,
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = colors.secondaryDark)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = colors.secondary)
                }
              >
                {actionLoading ? (
                  <RefreshCw size={18} className="animate-spin" />
                ) : (
                  <CheckCircle size={18} />
                )}
                Validasi
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}