"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  QrCode,
  RefreshCw,
  Download,
  Copy,
  CheckCircle,
  AlertCircle,
  Info,
  Clock,
  Share2,
  Printer,
  ChevronLeft,
} from "lucide-react";
import Link from "next/link";

interface QrData {
  qr_mode: "static" | "dynamic";
  token: string;
  expired_at: string | null;
  form_url: string;
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

export default function QrCodePage() {
  const params = useParams();
  const slug = params.slug as string;

  const [qrData, setQrData] = useState<QrData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const qrImageRef = useRef<HTMLImageElement>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setToastMessage({ type, message });
    setTimeout(() => setToastMessage(null), 3000);
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

const formatDateWIB = (dateString: string | null) => {
  if (!dateString) return "-";

  const date = new Date(dateString);

  // 🔥 tambah 7 jam manual
  const wib = new Date(date.getTime() + 7 * 60 * 60 * 1000);

  return wib.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

  const fetchQrCode = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const res = await fetch("/api/petugas/qrcode");
      const data = await res.json();
      if (data.success) {
        setQrData(data);
        if (isRefresh) {
          showToast("success", "QR Code berhasil direfresh");
        }
      } else {
        showToast("error", data.error || "Gagal memuat QR Code");
      }
    } catch (error) {
      console.error("Error fetching QR:", error);
      showToast("error", "Terjadi kesalahan");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };


  const handleCopyLink = async () => {
    if (!qrData?.form_url) return;
    try {
      await navigator.clipboard.writeText(qrData.form_url);
      setCopied(true);
      showToast("success", "Link berhasil disalin");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      showToast("error", "Gagal menyalin link");
    }
  };

  const handleDownload = () => {
    if (!qrData?.form_url) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = `/api/petugas/qrcode/image?url=${encodeURIComponent(qrData.form_url)}&t=${Date.now()}`;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(img, 0, 0);

      const link = document.createElement("a");
      link.download = `qrcode-${slug}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      showToast("success", "QR Code berhasil diunduh");
    };

    img.onerror = () => {
      showToast("error", "Gagal mengunduh QR Code");
    };
  };

  const handlePrint = () => {
    window.print();
  };

  useEffect(() => {
    fetchQrCode();
  }, []);

  const qrImageUrl = qrData?.form_url
    ? `/api/petugas/qrcode/image?url=${encodeURIComponent(qrData.form_url)}&t=${Date.now()}`
    : "";

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
                toastMessage.type === "success" ? colors.secondary : colors.primaryLight,
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

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Link
              href={`/${slug}/petugas`}
              className="inline-flex items-center gap-2 text-gray-500 hover:underline transition mb-2"
              style={{ color: colors.secondary }}
            >
              <ChevronLeft size={16} />
              Kembali ke Dashboard
            </Link>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl" style={{ backgroundColor: `${colors.secondary}15` }}>
                <QrCode className="size-6" style={{ color: colors.secondary }} />
              </div>
              <div>
                <h1 className="text-2xl font-bold" style={{ color: colors.secondaryDarkest }}>
                  QR Code Form Tamu
                </h1>
                <p className="text-sm mt-0.5" style={{ color: colors.secondaryDark }}>
                  Scan QR code untuk mengisi formulir kunjungan tamu
                </p>
              </div>
            </div>
          </div>
          {qrData?.qr_mode === "dynamic" && (
            <button
              onClick={() => fetchQrCode(true)}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 disabled:opacity-50 shadow-sm"
              style={{ backgroundColor: colors.secondary, color: colors.white }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.secondaryDark}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colors.secondary}
            >
              <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} />
              Refresh QR Code
            </button>
          )}
        </div>

        {/* QR Code Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* QR Code Display */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl shadow-sm overflow-hidden"
            style={{ backgroundColor: colors.white, border: `1px solid ${colors.secondary}20` }}
          >
            <div className="px-5 py-4" style={{ borderBottom: `1px solid ${colors.secondary}20`, background: `linear-gradient(135deg, ${colors.secondary}05, ${colors.white})` }}>
              <h2 className="font-semibold flex items-center gap-2" style={{ color: colors.secondaryDarkest }}>
                <div className="p-1 rounded-lg" style={{ backgroundColor: `${colors.secondary}15` }}>
                  <QrCode size={16} style={{ color: colors.secondary }} />
                </div>
                Kode QR
              </h2>
            </div>
            <div className="p-6 flex flex-col items-center">
              {loading ? (
                <div className="w-64 h-64 flex flex-col items-center justify-center gap-3">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: colors.secondary }}></div>
                  <p className="text-sm" style={{ color: colors.secondaryDark }}>Memuat QR Code...</p>
                </div>
              ) : qrData ? (
                <>
                  <div className="p-4 rounded-2xl shadow-lg" style={{ backgroundColor: colors.white, border: `1px solid ${colors.secondary}20` }}>
                    <img
                      ref={qrImageRef}
                      src={qrImageUrl}
                      alt="QR Code"
                      className="w-64 h-64"
                    />
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={handleDownload}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 text-sm"
                      style={{ backgroundColor: `${colors.secondary}10`, color: colors.secondary }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = `${colors.secondary}20`}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = `${colors.secondary}10`}
                    >
                      <Download size={16} />
                      Download
                    </button>
                    <button
                      onClick={handlePrint}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 text-sm"
                      style={{ backgroundColor: `${colors.secondary}10`, color: colors.secondary }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = `${colors.secondary}20`}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = `${colors.secondary}10`}
                    >
                      <Printer size={16} />
                      Print
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: `${colors.primaryLight}15` }}>
                    <AlertCircle size={32} style={{ color: colors.primaryLight }} />
                  </div>
                  <p className="text-sm" style={{ color: colors.secondaryDark }}>Gagal memuat QR Code</p>
                  <button
                    onClick={() => fetchQrCode()}
                    className="mt-4 px-4 py-2 rounded-xl transition-all duration-200"
                    style={{ backgroundColor: colors.secondary, color: colors.white }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.secondaryDark}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colors.secondary}
                  >
                    Coba Lagi
                  </button>
                </div>
              )}
            </div>
          </motion.div>

          {/* Information Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-5"
          >
            {/* Status Card */}
            <div className="rounded-2xl shadow-sm overflow-hidden" style={{ backgroundColor: colors.white, border: `1px solid ${colors.secondary}20` }}>
              <div className="px-5 py-4" style={{ borderBottom: `1px solid ${colors.secondary}20`, background: `linear-gradient(135deg, ${colors.secondary}05, ${colors.white})` }}>
                <h2 className="font-semibold flex items-center gap-2" style={{ color: colors.secondaryDarkest }}>
                  <div className="p-1 rounded-lg" style={{ backgroundColor: `${colors.secondary}15` }}>
                    <Info size={16} style={{ color: colors.secondary }} />
                  </div>
                  Status QR Code
                </h2>
              </div>
              <div className="p-5 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm" style={{ color: colors.secondaryDark }}>Mode</span>
                  <span
                    className="px-2.5 py-1 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: qrData?.qr_mode === "static" ? `${colors.secondary}15` : `${colors.secondary}15`,
                      color: colors.secondary,
                    }}
                  >
                    {qrData?.qr_mode === "static" ? "Static (Permanen)" : "Dynamic (Berubah)"}
                  </span>
                </div>

                {qrData?.qr_mode === "dynamic" && qrData?.expired_at && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm" style={{ color: colors.secondaryDark }}>Token Expired</span>
                    <div className="text-right">
                      <span className="font-medium text-sm" style={{ color: colors.secondaryDarkest }}>
                        {formatTimeWIB(qrData.expired_at)} WIB
                      </span>
                      <p className="text-xs" style={{ color: colors.secondaryDark }}>{formatDateWIB(qrData.expired_at)}</p>
                    </div>
                  </div>
                )}

                {qrData?.qr_mode === "dynamic" ? (
                  <div className="p-3 rounded-xl" style={{ backgroundColor: `${colors.secondary}10`, border: `1px solid ${colors.secondary}20` }}>
                    <div className="flex items-start gap-2">
                      <Clock size={14} className="flex-shrink-0 mt-0.5" style={{ color: colors.secondary }} />
                      <p className="text-xs" style={{ color: colors.secondaryDark }}>
                        Token akan expired secara otomatis sesuai interval yang telah ditentukan. Setelah expired, QR code akan otomatis berganti.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl" style={{ backgroundColor: `${colors.secondary}10`, border: `1px solid ${colors.secondary}20` }}>
                    <div className="flex items-start gap-2">
                      <Info size={14} className="flex-shrink-0 mt-0.5" style={{ color: colors.secondary }} />
                      <p className="text-xs" style={{ color: colors.secondaryDark }}>
                        Mode static: QR code tetap berlaku selamanya. Token tidak akan pernah expired.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Link Card */}
            <div className="rounded-2xl shadow-sm overflow-hidden" style={{ backgroundColor: colors.white, border: `1px solid ${colors.secondary}20` }}>
              <div className="px-5 py-4" style={{ borderBottom: `1px solid ${colors.secondary}20`, background: `linear-gradient(135deg, ${colors.secondary}05, ${colors.white})` }}>
                <h2 className="font-semibold flex items-center gap-2" style={{ color: colors.secondaryDarkest }}>
                  <div className="p-1 rounded-lg" style={{ backgroundColor: `${colors.secondary}15` }}>
                    <Share2 size={16} style={{ color: colors.secondary }} />
                  </div>
                  Link Form Tamu
                </h2>
              </div>
              <div className="p-5">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 p-3 rounded-xl text-sm break-all font-mono" style={{ backgroundColor: `${colors.secondary}05`, border: `1px solid ${colors.secondary}10`, color: colors.secondaryDark }}>
                    {qrData?.form_url || "Memuat..."}
                  </div>
                  <button
                    onClick={handleCopyLink}
                    disabled={!qrData}
                    className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 text-sm disabled:opacity-50"
                    style={{ backgroundColor: colors.secondary, color: colors.white }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.secondaryDark}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colors.secondary}
                  >
                    {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                    {copied ? "Tersalin" : "Salin Link"}
                  </button>
                </div>
                <p className="text-xs mt-3" style={{ color: colors.secondaryDark }}>
                  Gunakan link ini untuk dibagikan melalui WhatsApp, email, atau media sosial lainnya.
                </p>
              </div>
            </div>

            {/* Instruction Card */}
            <div className="rounded-2xl shadow-sm overflow-hidden" style={{ backgroundColor: colors.white, border: `1px solid ${colors.secondary}20` }}>
              <div className="px-5 py-4" style={{ borderBottom: `1px solid ${colors.secondary}20`, background: `linear-gradient(135deg, ${colors.secondary}05, ${colors.white})` }}>
                <h2 className="font-semibold flex items-center gap-2" style={{ color: colors.secondaryDarkest }}>
                  <div className="p-1 rounded-lg" style={{ backgroundColor: `${colors.secondary}15` }}>
                    <Info size={16} style={{ color: colors.secondary }} />
                  </div>
                  Petunjuk Penggunaan
                </h2>
              </div>
              <div className="p-5 space-y-4">
                {[
                  "Tempelkan QR code di pintu masuk / area resepsionis",
                  "Tamu scan QR code menggunakan HP mereka",
                  "Tamu mengisi form dan upload foto selfie",
                  "Validasi tamu di halaman Dashboard → Tamu Validasi",
                ].map((step, index) => (
                  <div key={index} className="flex gap-3 items-start">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5"
                      style={{ backgroundColor: `${colors.secondary}15`, color: colors.secondary }}
                    >
                      {index + 1}
                    </div>
                    <p className="text-sm" style={{ color: colors.secondaryDarkest }}>{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .bg-white,
          .bg-white * {
            visibility: visible;
          }
          .bg-white {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            margin: 0;
            padding: 20px;
          }
          button,
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}