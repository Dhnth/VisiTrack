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
  CheckCircle,
  AlertCircle,
  Users,
  Camera,
  RefreshCw,
  X,
  ChevronLeft,
  Save,
  UserPlus
} from "lucide-react";

interface Employee {
  id: number;
  name: string;
  department: string;
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

export default function InputManualPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    nik: "",
    institution: "",
    purpose: "",
    employee_id: "",
  });
  
  // Photo states
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [timer, setTimer] = useState(3);
  const [showTimerOverlay, setShowTimerOverlay] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [toastMessage, setToastMessage] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Refs for camera
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setToastMessage({ type, message });
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Fetch employees
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await fetch("/api/petugas/employees");
        const data = await res.json();
        if (data.success) {
          setEmployees(data.employees);
        }
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };
    fetchEmployees();
  }, []);

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

  // Save captured photo
  const saveCapturedPhoto = async () => {
    if (!capturedPhoto) return;

    setUploadingPhoto(true);
    try {
      const blob = await (await fetch(capturedPhoto)).blob();
      const formData = new FormData();
      formData.append("file", blob, "camera-photo.jpg");

      const res = await fetch("/api/petugas/upload-temp", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      
      if (data.success) {
        setPhotoUrl(data.url);
        setShowPreviewModal(false);
        setCapturedPhoto(null);
        showToast("success", "Foto berhasil diambil");
      } else {
        showToast("error", data.error || "Gagal upload foto");
      }
    } catch (err) {
      console.error("Upload error:", err);
      showToast("error", "Terjadi kesalahan saat upload foto");
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.purpose) {
      showToast("error", "Nama tamu dan tujuan kunjungan wajib diisi");
      return;
    }

    if (!photoUrl) {
      showToast("error", "Foto tamu wajib diambil");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        nik: formData.nik || null,
        institution: formData.institution || null,
        purpose: formData.purpose,
        employee_id: formData.employee_id ? parseInt(formData.employee_id) : null,
        photo_url: photoUrl,
      };

      const res = await fetch("/api/petugas/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      
      if (data.success) {
        showToast("success", "Tamu berhasil ditambahkan");
        setTimeout(() => {
          router.push(`/${slug}/petugas`);
        }, 1500);
      } else {
        showToast("error", data.error || "Gagal menambahkan tamu");
      }
    } catch (err) {
      console.error("Submit error:", err);
      showToast("error", "Terjadi kesalahan");
    } finally {
      setSubmitting(false);
    }
  };

  // Cleanup
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
              backgroundColor: toastMessage.type === "success" ? colors.secondary : colors.primaryLight,
              color: colors.white,
            }}
          >
            {toastMessage.type === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
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
              <div className="p-5" style={{ borderBottom: `1px solid ${colors.secondary}20` }}>
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold" style={{ color: colors.secondaryDarkest }}>Ambil Foto Tamu</h3>
                  <button
                    onClick={() => setShowPhotoModal(false)}
                    className="p-1 rounded-lg transition"
                    style={{ color: colors.secondaryDark }}
                  >
                    <X size={20} />
                  </button>
                </div>
                <p className="text-sm mt-1" style={{ color: colors.secondaryDark }}>Pastikan wajah tamu terlihat jelas</p>
              </div>

              <div className="p-5">
                <div className="rounded-xl p-6 text-center" style={{ backgroundColor: `${colors.secondary}10`, border: `1px solid ${colors.secondary}20` }}>
                  <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: `${colors.secondary}20` }}>
                    <Camera size={36} style={{ color: colors.secondary }} />
                  </div>
                  <p className="text-sm font-medium mb-2" style={{ color: colors.secondaryDarkest }}>Ambil Foto Baru</p>
                  <p className="text-xs" style={{ color: colors.secondaryDark }}>Gunakan kamera untuk mengambil foto tamu</p>
                </div>

                <button
                  onClick={startCamera}
                  className="w-full mt-4 py-3 rounded-xl transition flex items-center justify-center gap-2 font-medium"
                  style={{ backgroundColor: colors.secondary, color: colors.white }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.secondaryDark}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colors.secondary}
                >
                  <Camera size={18} />
                  Buka Kamera
                </button>
              </div>

              <div className="p-4" style={{ borderTop: `1px solid ${colors.secondary}10`, backgroundColor: `${colors.secondary}05` }}>
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
                <div className="absolute inset-0 border-2 rounded-2xl pointer-events-none" style={{ borderColor: `${colors.secondary}80` }}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-40 h-40 rounded-full border-2 flex items-center justify-center" style={{ borderColor: `${colors.secondary}60` }}>
                      <div className="w-32 h-32 rounded-full border flex items-center justify-center" style={{ borderColor: `${colors.secondary}30` }}>
                        <User size={48} style={{ color: `${colors.secondary}40` }} />
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
                      <span className="text-7xl font-bold text-white">{timer}</span>
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
                  <div className="w-16 h-16 rounded-full border-4" style={{ borderColor: colors.secondary }}></div>
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
              onClick={(e) => e.stopPropagation()}
              className="rounded-2xl shadow-xl max-w-md w-full mx-4 overflow-hidden"
              style={{ backgroundColor: colors.white }}
            >
              <div className="p-5" style={{ borderBottom: `1px solid ${colors.secondary}20` }}>
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold" style={{ color: colors.secondaryDarkest }}>Preview Foto</h3>
                  <button
                    onClick={cancelPreview}
                    className="p-1 rounded-lg transition"
                    style={{ color: colors.secondaryDark }}
                  >
                    <X size={20} />
                  </button>
                </div>
                <p className="text-sm mt-1" style={{ color: colors.secondaryDark }}>Apakah foto ini sudah sesuai?</p>
              </div>

              <div className="p-5">
                <div className="relative rounded-xl overflow-hidden mb-4" style={{ backgroundColor: `${colors.secondary}10` }}>
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
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#CA8A04"}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#EAB308"}
                  >
                    <RefreshCw size={18} />
                    Foto Ulang
                  </button>
                  <button
                    onClick={saveCapturedPhoto}
                    disabled={uploadingPhoto}
                    className="py-2.5 rounded-xl transition flex items-center justify-center gap-2 font-medium disabled:opacity-50"
                    style={{ backgroundColor: colors.secondary, color: colors.white }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.secondaryDark}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colors.secondary}
                  >
                    {uploadingPhoto ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Mengupload...
                      </>
                    ) : (
                      <>
                        <CheckCircle size={18} />
                        Gunakan Foto
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <canvas ref={canvasRef} className="hidden" />

      {/* Main Content */}
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
              <div className="p-2 rounded-xl" style={{ backgroundColor: `${colors.secondary}15` }}>
                <UserPlus className="size-6" style={{ color: colors.secondary }} />
              </div>
              <div>
                <h1 className="text-2xl font-bold" style={{ color: colors.secondaryDarkest }}>Input Manual Tamu</h1>
                <p className="text-sm mt-0.5" style={{ color: colors.secondaryDark }}>Tambah kunjungan tamu secara manual</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="rounded-2xl shadow-sm overflow-hidden" style={{ backgroundColor: colors.white, border: `1px solid ${colors.secondary}20` }}>
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Photo Section */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-xl overflow-hidden flex items-center justify-center" style={{ backgroundColor: `${colors.secondary}10`, border: `2px dashed ${colors.secondary}30` }}>
                  {photoUrl ? (
                    <Image
                      src={photoUrl}
                      alt="Foto Tamu"
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Camera size={32} style={{ color: colors.secondary }} />
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setShowPhotoModal(true)}
                  className="absolute -bottom-2 -right-2 p-1.5 rounded-full transition shadow-md"
                  style={{ backgroundColor: colors.secondary, color: colors.white }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.secondaryDark}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colors.secondary}
                >
                  <Camera size={14} />
                </button>
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: colors.secondaryDarkest }}>Foto Tamu</p>
                <p className="text-xs" style={{ color: colors.secondaryDark }}>Klik ikon kamera untuk mengambil foto</p>
                <p className="text-xs" style={{ color: colors.secondaryDark }}>Foto wajib diambil langsung dari kamera</p>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: colors.secondaryDarkest }}>
                  Nama Tamu <span style={{ color: colors.primaryLight }}>*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4" style={{ color: colors.secondaryDark }} />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="Masukkan nama lengkap"
                    className="w-full pl-9 pr-3 py-2 rounded-lg focus:outline-none focus:ring-2"
                    style={{
                      border: `1px solid ${colors.secondary}20`,
                      color: colors.secondaryDarkest,
                      backgroundColor: colors.white,
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = colors.secondary}
                    onBlur={(e) => e.currentTarget.style.borderColor = `${colors.secondary}20`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: colors.secondaryDarkest }}>NIK</label>
                <input
                  type="text"
                  value={formData.nik}
                  onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                  placeholder="Nomor Induk Kependudukan (opsional)"
                  className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2"
                  style={{
                    border: `1px solid ${colors.secondary}20`,
                    color: colors.secondaryDarkest,
                    backgroundColor: colors.white,
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = colors.secondary}
                  onBlur={(e) => e.currentTarget.style.borderColor = `${colors.secondary}20`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: colors.secondaryDarkest }}>Asal Instansi</label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 size-4" style={{ color: colors.secondaryDark }} />
                  <input
                    type="text"
                    value={formData.institution}
                    onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                    placeholder="Nama instansi/perusahaan (opsional)"
                    className="w-full pl-9 pr-3 py-2 rounded-lg focus:outline-none focus:ring-2"
                    style={{
                      border: `1px solid ${colors.secondary}20`,
                      color: colors.secondaryDarkest,
                      backgroundColor: colors.white,
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = colors.secondary}
                    onBlur={(e) => e.currentTarget.style.borderColor = `${colors.secondary}20`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: colors.secondaryDarkest }}>
                  Tujuan Kunjungan <span style={{ color: colors.primaryLight }}>*</span>
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 size-4" style={{ color: colors.secondaryDark }} />
                  <input
                    type="text"
                    value={formData.purpose}
                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                    required
                    placeholder="Tujuan kunjungan"
                    className="w-full pl-9 pr-3 py-2 rounded-lg focus:outline-none focus:ring-2"
                    style={{
                      border: `1px solid ${colors.secondary}20`,
                      color: colors.secondaryDarkest,
                      backgroundColor: colors.white,
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = colors.secondary}
                    onBlur={(e) => e.currentTarget.style.borderColor = `${colors.secondary}20`}
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1" style={{ color: colors.secondaryDarkest }}>Karyawan Tujuan</label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 size-4" style={{ color: colors.secondaryDark }} />
                  <select
                    value={formData.employee_id}
                    onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 rounded-lg focus:outline-none focus:ring-2 appearance-none"
                    style={{
                      border: `1px solid ${colors.secondary}20`,
                      color: colors.secondaryDarkest,
                      backgroundColor: colors.white,
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = colors.secondary}
                    onBlur={(e) => e.currentTarget.style.borderColor = `${colors.secondary}20`}
                  >
                    <option value="">Pilih karyawan yang dituju (opsional)</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} - {emp.department}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Info Note */}
            <div className="p-3 rounded-lg" style={{ backgroundColor: `${colors.secondary}10`, border: `1px solid ${colors.secondary}20` }}>
              <p className="text-xs flex items-start gap-2" style={{ color: colors.secondaryDark }}>
                <AlertCircle size={14} className="mt-0.5 flex-shrink-0" style={{ color: colors.secondary }} />
                Tamu yang diinput manual akan langsung status <strong style={{ color: colors.secondaryDarkest }}>Sedang Berkunjung</strong> tanpa perlu validasi.
              </p>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 justify-end pt-4">
              <Link
                href={`/${slug}/petugas`}
                className="px-4 py-2 rounded-lg transition"
                style={{ border: `1px solid ${colors.secondary}20`, color: colors.secondaryDark }}
              >
                Batal
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 rounded-lg transition disabled:opacity-50 flex items-center gap-2"
                style={{ backgroundColor: colors.secondary, color: colors.white }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.secondaryDark}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colors.secondary}
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Simpan & Check In
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}