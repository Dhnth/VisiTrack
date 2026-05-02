"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  User,
  Building,
  Briefcase,
  Camera,
  X,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Users,
  ArrowLeft,
  ChevronDown,
  Search,
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

// Searchable Select Component
function SearchableSelect({
  options,
  value,
  onChange,
  placeholder,
  label,
}: {
  options: Employee[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((opt) => opt.id.toString() === value);

  const filteredOptions = options.filter(
    (opt) =>
      opt.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opt.department.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <label
        className="block text-sm font-medium mb-1"
        style={{ color: colors.secondaryDarkest }}
      >
        {label}
      </label>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 rounded-lg cursor-pointer flex items-center justify-between transition-all duration-200"
        style={{
          border: `1px solid ${colors.secondary}20`,
          backgroundColor: colors.white,
          minHeight: "42px",
        }}
      >
        <span
          style={{
            color: selectedOption
              ? colors.secondaryDarkest
              : colors.secondaryDark,
          }}
        >
          {selectedOption
            ? `${selectedOption.name} - ${selectedOption.department}`
            : placeholder}
        </span>
        <ChevronDown
          size={16}
          style={{
            color: colors.secondaryDark,
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
          }}
          className="transition-transform duration-200"
        />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-1 rounded-lg shadow-lg overflow-hidden"
            style={{
              backgroundColor: colors.white,
              border: `1px solid ${colors.secondary}20`,
            }}
          >
            <div
              className="p-2 border-b"
              style={{ borderColor: `${colors.secondary}10` }}
            >
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 size-4"
                  style={{ color: colors.secondaryDark }}
                />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cari karyawan..."
                  className="w-full pl-9 pr-3 py-1.5 text-sm rounded-lg focus:outline-none focus:ring-2"
                  style={{
                    border: `1px solid ${colors.secondary}20`,
                    backgroundColor: colors.white,
                    color: colors.secondaryDarkest,
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
            <div className="max-h-48 overflow-y-auto">
              {filteredOptions.length === 0 ? (
                <div
                  className="px-3 py-2 text-sm text-center"
                  style={{ color: colors.secondaryDark }}
                >
                  Tidak ada karyawan
                </div>
              ) : (
                filteredOptions.map((opt) => (
                  <div
                    key={opt.id}
                    onClick={() => {
                      onChange(opt.id.toString());
                      setIsOpen(false);
                      setSearchTerm("");
                    }}
                    className="px-3 py-2 cursor-pointer transition-colors duration-150 hover:bg-gray-50"
                    style={{
                      backgroundColor:
                        value === opt.id.toString()
                          ? `${colors.secondary}10`
                          : "transparent",
                      borderBottom: `1px solid ${colors.secondary}10`,
                    }}
                  >
                    <div
                      className="font-medium text-sm"
                      style={{ color: colors.secondaryDarkest }}
                    >
                      {opt.name}
                    </div>
                    <div
                      className="text-xs"
                      style={{ color: colors.secondaryDark }}
                    >
                      {opt.department}
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function GuestFormPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const slug = params.slug as string;
  const urlToken = searchParams.get("token");

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);
  const [tokenChecking, setTokenChecking] = useState(true);
  const [pageReady, setPageReady] = useState(false);
  const [savedToken, setSavedToken] = useState<string | null>(null);

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

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setToastMessage({ type, message });
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Check token validity & remove token from URL
  useEffect(() => {
    const checkToken = async () => {
      // Cek apakah sudah ada token di sessionStorage
      const storedToken = sessionStorage.getItem("guest_token");

      if (storedToken) {
        // Token sudah ada, langsung set ready
        setSavedToken(storedToken);
        setPageReady(true);
        setTokenChecking(false);
        return;
      }

      if (!urlToken) {
        setTokenValid(false);
        setTokenChecking(false);
        return;
      }

      try {
        const res = await fetch(`/api/guest/validate-token?token=${urlToken}`);
        const data = await res.json();

        if (!data.success) {
          setTokenValid(false);
          setTokenChecking(false);
          return;
        }

        // Simpan token ke sessionStorage
        sessionStorage.setItem("guest_token", urlToken);
        setSavedToken(urlToken);

        // Hapus token dari URL (replace, bukan push)
        const cleanUrl = `/${slug}/guest-form`;
        router.replace(cleanUrl);

        // Set page ready
        setPageReady(true);
        setTokenChecking(false);
      } catch (error) {
        console.error("Token validation error:", error);
        setTokenValid(false);
        setTokenChecking(false);
      }
    };
    checkToken();
  }, [urlToken, router, slug]);

  // Fetch employees (hanya jika page ready)
  useEffect(() => {
    if (!pageReady) return;

    const fetchEmployees = async () => {
      try {
        const res = await fetch(`/api/guest/employees?slug=${slug}`);
        const data = await res.json();
        if (data.success) {
          setEmployees(data.employees);
        }
      } catch (error) {
        console.error("Error fetching employees:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, [slug, pageReady]);

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
      let errorMessage = "Tidak dapat mengakses kamera.";
      if (err instanceof Error) {
        if (err.name === "NotAllowedError") {
          errorMessage = "Izin kamera ditolak. Silakan izinkan akses kamera.";
        } else if (err.name === "NotFoundError") {
          errorMessage = "Tidak ada kamera yang terdeteksi di perangkat Anda.";
        } else if (err.name === "NotReadableError") {
          errorMessage = "Kamera sedang digunakan oleh aplikasi lain.";
        }
      }
      showToast("error", errorMessage);
      setShowCamera(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
    setShowTimerOverlay(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const startCaptureWithTimer = () => {
    let countdown = 3;
    setTimer(countdown);
    setShowTimerOverlay(true);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      countdown -= 1;
      setTimer(countdown);
      if (countdown <= 0) {
        if (timerRef.current) clearInterval(timerRef.current);
        setShowTimerOverlay(false);
        doCapturePhoto();
      }
    }, 1000);
  };

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

  const retakePhoto = () => {
    setShowPreviewModal(false);
    setCapturedPhoto(null);
    startCamera();
  };

  const cancelPreview = () => {
    setShowPreviewModal(false);
    setCapturedPhoto(null);
    setShowPhotoModal(true);
  };

  // Save captured photo - upload ke server dulu
  const saveCapturedPhoto = async () => {
    if (!capturedPhoto) return;

    setUploadingPhoto(true);
    try {
      // Konversi base64 ke blob
      const blob = await (await fetch(capturedPhoto)).blob();
      const formData = new FormData();
      formData.append("file", blob, "camera-photo.jpg");
      formData.append("slug", slug);

      const res = await fetch("/api/guest/upload-photo", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        setPhotoUrl(data.url);
        setShowPreviewModal(false);
        setCapturedPhoto(null);
        setShowPhotoModal(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.purpose) {
      showToast("error", "Nama tamu dan tujuan kunjungan wajib diisi");
      return;
    }
    if (!photoUrl) {
      showToast("error", "Foto wajib diambil");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        token: savedToken,
        name: formData.name,
        nik: formData.nik || null,
        institution: formData.institution || null,
        purpose: formData.purpose,
        employee_id: formData.employee_id
          ? parseInt(formData.employee_id)
          : null,
        photo_url: photoUrl,
      };

      const res = await fetch("/api/guest/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success) {
        sessionStorage.removeItem("guest_token");
        showToast("success", "Kunjungan berhasil didaftarkan");
        setTimeout(() => router.push(`/${slug}/guest-success`), 1500);
      } else {
        showToast("error", data.error || "Gagal mendaftarkan kunjungan");
      }
    } catch (err) {
      console.error("Submit error:", err);
      showToast("error", "Terjadi kesalahan");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    return () => {
      if (streamRef.current)
        streamRef.current.getTracks().forEach((track) => track.stop());
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  if (tokenChecking) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div
          className="animate-spin rounded-full h-8 w-8 border-b-2"
          style={{ borderColor: colors.secondary }}
        ></div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-center max-w-md">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: `${colors.primaryLight}15` }}
          >
            <AlertCircle size={40} style={{ color: colors.primaryLight }} />
          </div>
          <h1
            className="text-2xl font-bold mb-2"
            style={{ color: colors.secondaryDarkest }}
          >
            Token Tidak Valid
          </h1>
          <p className="mb-6" style={{ color: colors.secondaryDark }}>
            Token yang Anda gunakan sudah expired atau tidak valid. Silakan scan
            QR code yang tersedia di lokasi.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-2 rounded-xl transition"
            style={{ backgroundColor: colors.secondary, color: colors.white }}
          >
            <ArrowLeft size={16} />
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  if (!pageReady) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div
          className="animate-spin rounded-full h-8 w-8 border-b-2"
          style={{ borderColor: colors.secondary }}
        ></div>
      </div>
    );
  }

  return (
    <>
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
                    Foto Selfie
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
                    Pastikan wajah anda terlihat jelas
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
                <h3 className="text-white font-semibold text-lg">
                  Ambil Foto Selfie
                </h3>
                <button
                  onClick={stopCamera}
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
                  muted
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
                      : "Posisikan wajah di dalam lingkaran, lalu tekan tombol kamera"}
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
                    onClick={saveCapturedPhoto}
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

      {/* Background Pattern */}
      <div className="min-h-screen relative overflow-hidden">
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

        <div className="relative z-10 py-8 px-4">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="flex justify-center mb-4"
              >
                <div className="p-3 rounded-2xl bg-white shadow-lg">
                  <Image
                    src="/images/icon.svg"
                    alt="VisiTrack"
                    width={50}
                    height={50}
                  />
                </div>
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-2xl font-bold"
                style={{ color: colors.secondaryDarkest }}
              >
                Form Kunjungan Tamu
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-sm mt-1"
                style={{ color: colors.secondaryDark }}
              >
                Isi data diri Anda dengan lengkap
              </motion.p>
            </div>

            {/* Form */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="rounded-2xl shadow-xl overflow-hidden bg-white/95 backdrop-blur-sm"
              style={{ border: `1px solid ${colors.secondary}20` }}
            >
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {/* Photo Section */}
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div
                      className="w-20 h-20 rounded-xl overflow-hidden flex items-center justify-center cursor-pointer"
                      style={{
                        backgroundColor: `${colors.secondary}10`,
                        border: `2px dashed ${colors.secondary}30`,
                      }}
                      onClick={() => setShowPhotoModal(true)}
                    >
                      {photoUrl ? (
                        <img
                          src={photoUrl}
                          alt="Foto Selfie"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Camera size={32} style={{ color: colors.secondary }} />
                      )}
                    </div>
                  </div>
                  <div>
                    <p
                      className="text-sm font-medium"
                      style={{ color: colors.secondaryDarkest }}
                    >
                      Foto Selfie
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: colors.secondaryDark }}
                    >
                      Klik area foto untuk mengambil foto
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: colors.secondaryDark }}
                    >
                      Foto wajib diambil langsung dari kamera
                    </p>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label
                      className="block text-sm font-medium mb-1"
                      style={{ color: colors.secondaryDarkest }}
                    >
                      Nama Lengkap{" "}
                      <span style={{ color: colors.primaryLight }}>*</span>
                    </label>
                    <div className="relative">
                      <User
                        className="absolute left-3 top-1/2 -translate-y-1/2 size-4"
                        style={{ color: colors.secondaryDark }}
                      />
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        required
                        placeholder="Masukkan nama lengkap Anda"
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
                  </div>

                  <div>
                    <label
                      className="block text-sm font-medium mb-1"
                      style={{ color: colors.secondaryDarkest }}
                    >
                      NIK
                    </label>
                    <input
                      type="text"
                      value={formData.nik}
                      onChange={(e) =>
                        setFormData({ ...formData, nik: e.target.value })
                      }
                      placeholder="Nomor Induk Kependudukan (opsional)"
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
                    <div className="relative">
                      <Building
                        className="absolute left-3 top-1/2 -translate-y-1/2 size-4"
                        style={{ color: colors.secondaryDark }}
                      />
                      <input
                        type="text"
                        value={formData.institution}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            institution: e.target.value,
                          })
                        }
                        placeholder="Nama instansi/perusahaan (opsional)"
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
                  </div>

                  <div className="md:col-span-2">
                    <label
                      className="block text-sm font-medium mb-1"
                      style={{ color: colors.secondaryDarkest }}
                    >
                      Tujuan Kunjungan{" "}
                      <span style={{ color: colors.primaryLight }}>*</span>
                    </label>
                    <div className="relative">
                      <Briefcase
                        className="absolute left-3 top-1/2 -translate-y-1/2 size-4"
                        style={{ color: colors.secondaryDark }}
                      />
                      <input
                        type="text"
                        value={formData.purpose}
                        onChange={(e) =>
                          setFormData({ ...formData, purpose: e.target.value })
                        }
                        required
                        placeholder="Tujuan kunjungan Anda"
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
                  </div>

                  <div className="md:col-span-2">
                    <SearchableSelect
                      options={employees}
                      value={formData.employee_id}
                      onChange={(val) =>
                        setFormData({ ...formData, employee_id: val })
                      }
                      placeholder="Pilih karyawan yang ingin dituju"
                      label="Karyawan Tujuan"
                    />
                  </div>
                </div>

                {/* Info Note */}
                <div
                  className="p-3 rounded-lg"
                  style={{
                    backgroundColor: `${colors.secondary}10`,
                    border: `1px solid ${colors.secondary}20`,
                  }}
                >
                  <p
                    className="text-xs flex items-start gap-2"
                    style={{ color: colors.secondaryDark }}
                  >
                    <AlertCircle
                      size={14}
                      className="mt-0.5 flex-shrink-0"
                      style={{ color: colors.secondary }}
                    />
                    Data Anda akan tersimpan dan menunggu validasi dari petugas.
                  </p>
                </div>

                {/* Submit Buttons */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full px-4 py-3 rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2 font-medium"
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
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Memproses...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={18} />
                      Kirim Kunjungan
                    </>
                  )}
                </button>
              </form>
            </motion.div>

            {/* Footer */}
            <p
              className="text-center text-xs mt-6"
              style={{ color: colors.secondaryDark }}
            >
              © {new Date().getFullYear()} VisiTrack. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}