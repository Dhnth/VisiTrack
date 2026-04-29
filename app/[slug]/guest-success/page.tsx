"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle, Home, Clock, FileText, ArrowRight } from "lucide-react";
import Image from "next/image";

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

export default function GuestSuccessPage() {
  const params = useParams();
  const slug = params.slug as string;

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

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center mb-8"
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

          {/* Success Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="rounded-2xl shadow-xl overflow-hidden bg-white/95 backdrop-blur-sm text-center"
            style={{ border: `1px solid ${colors.secondary}20` }}
          >
            <div className="p-8">
              {/* Success Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.4, type: "spring" }}
                className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{ backgroundColor: `${colors.secondary}15` }}
              >
                <CheckCircle size={48} style={{ color: colors.secondary }} />
              </motion.div>

              {/* Title */}
              <h1
                className="text-2xl font-bold mb-2"
                style={{ color: colors.secondaryDarkest }}
              >
                Berhasil!
              </h1>

              {/* Message */}
              <p className="mb-6" style={{ color: colors.secondaryDark }}>
                Data kunjungan Anda telah terkirim. Silakan menunggu validasi dari petugas.
              </p>

              {/* Info Box */}
              <div
                className="p-4 rounded-xl mb-6 text-left"
                style={{ backgroundColor: `${colors.secondary}10`, border: `1px solid ${colors.secondary}20` }}
              >
                <div className="flex items-start gap-3 mb-3">
                  <Clock size={18} style={{ color: colors.secondary }} className="mt-0.5" />
                  <div>
                    <p className="text-sm font-medium" style={{ color: colors.secondaryDarkest }}>Proses Validasi</p>
                    <p className="text-xs" style={{ color: colors.secondaryDark }}>
                      Petugas akan memverifikasi data Anda. Proses ini biasanya memakan waktu 1-5 menit.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FileText size={18} style={{ color: colors.secondary }} className="mt-0.5" />
                  <div>
                    <p className="text-sm font-medium" style={{ color: colors.secondaryDarkest }}>Status Kunjungan</p>
                    <p className="text-xs" style={{ color: colors.secondaryDark }}>
                      Setelah divalidasi, status kunjungan Anda akan berubah menjadi &quot;Sedang Berkunjung&quot;.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Link
                  href="/"
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl transition w-full font-medium"
                  style={{ backgroundColor: colors.secondary, color: colors.white }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = colors.secondaryDark)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = colors.secondary)
                  }
                >
                  <Home size={18} />
                  Kembali ke Beranda
                </Link>
                
                <Link
                  href={`/${slug}/guest-status`}
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl transition w-full font-medium"
                  style={{ border: `1px solid ${colors.secondary}20`, color: colors.secondaryDark }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = `${colors.secondary}10`)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                >
                  Cek Status Kunjungan
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
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
  );
}