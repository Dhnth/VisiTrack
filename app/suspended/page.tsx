"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ShieldAlert, Home, HelpCircle } from "lucide-react";

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

export default function SuspendedPage() {
  return (
    <div className="min-h-[95vh] mt-5 px-4 md:px-0 rounded-2xl mx-5 flex flex-col items-center relative overflow-hidden border border-black/30 shadow-inner shadow-black/40 justify-center">
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

      <div className="relative z-10 max-w-md w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl p-8 text-center "
          style={{
            border: `1px solid ${colors.secondary}20`,
          }}
        >
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ backgroundColor: `${colors.primaryLight}15` }}
          >
            <ShieldAlert size={48} style={{ color: colors.primaryLight }} />
          </div>

          <h1
            className="text-2xl font-bold mb-3"
            style={{ color: colors.secondaryDarkest }}
          >
            Instansi Dinonaktifkan
          </h1>

          <p className="text-sm mb-6" style={{ color: colors.secondaryDark }}>
            Instansi Anda sedang dalam status nonaktif. Silakan hubungi super admin untuk informasi lebih lanjut.
          </p>

          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl transition w-full"
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
            <Home size={16} />
            Kembali ke Beranda
          </Link>
        </motion.div>

        <p className="text-center text-xs mt-6" style={{ color: colors.secondaryDark }}>
          © {new Date().getFullYear()} VisiTrack. All rights reserved.
        </p>
      </div>
    </div>
  );
}