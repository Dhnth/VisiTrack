// app/reset-password/page.tsx
"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ScanQrCode,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [validating, setValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [tokenError, setTokenError] = useState("");

  // Validate token
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setTokenValid(false);
        setTokenError("Token tidak ditemukan");
        setValidating(false);
        return;
      }

      try {
        const res = await fetch(`/api/auth/validate-reset-token?token=${token}`);
        const data = await res.json();

        if (data.valid) {
          setTokenValid(true);
        } else {
          setTokenValid(false);
          setTokenError(data.error || "Token tidak valid");
        }
      } catch (err) {
        console.error("Validate token error:", err);
        setTokenValid(false);
        setTokenError("Terjadi kesalahan");
      } finally {
        setValidating(false);
      }
    };

    validateToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password minimal 6 karakter");
      return;
    }

    if (password !== confirmPassword) {
      setError("Password dan konfirmasi password tidak cocok");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Terjadi kesalahan");
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/signin");
      }, 3000);
    } catch (err) {
      console.error("Reset password error:", err);
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <div className="text-center">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#407BA7]"></div>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className=" text-center">
        <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <AlertCircle size={40} className="text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Invalid Token</h1>
        <p className="text-gray-600 mb-6">
          {tokenError || "Token reset password tidak valid atau sudah expired."}
        </p>
        <Link
          href="/forgot-password"
          className="inline-flex items-center gap-2 px-6 py-2 bg-[#407BA7] text-white rounded-lg hover:bg-[#356a8f] transition"
        >
          Minta Link Reset
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={40} className="text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Password Direset!</h1>
        <p className="text-gray-600 mb-6">
          Password Anda berhasil direset. Mengarahkan ke halaman login...
        </p>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#407BA7]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Reset Password</h2>
        <p className="text-gray-500 text-sm mt-1">
          Masukkan password baru Anda
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-sm font-medium text-gray-700">
            New Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimal 6 karakter"
              className="w-full h-11 pl-9 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#407BA7] focus:border-transparent transition-all duration-200 text-sm bg-white"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
            Confirm New Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <input
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Konfirmasi password baru"
              className="w-full h-11 pl-9 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#407BA7] focus:border-transparent transition-all duration-200 text-sm bg-white"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
            >
              {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm text-center">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 bg-[#407BA7] text-white rounded-lg font-medium hover:bg-[#356a8f] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Processing..." : "Reset Password"}
        </button>

        <Link
          href="/signin"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#407BA7] transition-colors duration-200 group w-full"
        >
          <ArrowLeft
            size={16}
            className="group-hover:-translate-x-0.5 transition-transform duration-200"
          />
          <span>Back to Sign In</span>
        </Link>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <main>
      <section className="min-h-[95vh] mt-5 rounded-2xl mx-5 flex flex-col items-center relative overflow-hidden border border-black/30 shadow-inner shadow-black/40">
        <div
          className="absolute inset-0 pointer-events-none h-full rounded-xl z-0 w-full"
          style={{
            backgroundImage: "url(/images/bg-home.svg)",
            backgroundRepeat: "repeat",
            backgroundSize: "221px",
            maskImage:
              "linear-gradient(to bottom, black 0%, transparent 70%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, black 0%, transparent 100%)",
          }}
        />

        <motion.div
          initial={{ opacity: 0, rotate: 0, x: -100, y: -50 }}
          animate={{ opacity: 1, rotate: 45, x: 0, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="absolute -top-20 -left-15 md:-top-10 md:-left-5 bg-white border border-black/20 rounded-2xl z-10"
        >
          <ScanQrCode size={200} strokeWidth={1.5} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="rounded-2xl shadow-xl size-18 grid place-items-center mt-20 bg-white border border-black/10 z-10"
        >
          <Image
            src="/images/icon.svg"
            alt="Logo VisiTrack"
            width={60}
            height={60}
            className="size-15"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center mt-4 z-10"
        >
          <h1 className="text-2xl font-bold text-gray-800">VisiTrack</h1>
          <p className="text-gray-500 text-sm mt-1">
            Create new password
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
          className="mt-8 z-10 w-full max-w-md px-4"
        >
          <Suspense fallback={
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#407BA7]"></div>
              </div>
            </div>
          }>
            <ResetPasswordForm />
          </Suspense>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 100, rotate: 0 }}
          animate={{ opacity: 1, x: 0, rotate: 15 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="rounded-2xl shadow-xl w-85 h-165 place-items-center mt-30 absolute bg-white border border-black/30 -right-10 -bottom-100 z-10 hidden md:grid"
        >
          <p className="mt-10 font-medium text-2xl w-full text-left ml-20">
            Today`s Guest
          </p>
          <Image
            src="/images/layout.svg"
            alt="Layout Tamu VisiTrack"
            width={300}
            height={638}
          />
        </motion.div>
      </section>
    </main>
  );
}