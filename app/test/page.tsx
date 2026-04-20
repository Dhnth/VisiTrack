"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ScanQrCode, Mail, Lock, Eye, EyeOff, ArrowRight, Check } from "lucide-react";

export default function SignInPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle sign in logic here
    console.log({ email, password, rememberMe });
  };

  return (
    <>
      <main>
        {/* Hero Section */}
        <section className="min-h-[95vh] mt-5 rounded-2xl mx-5 flex flex-col items-center relative overflow-hidden border border-black/30 shadow-inner shadow-black/40">
          <div
            className="absolute inset-0 pointer-events-none h-full rounded-xl z-0 w-full"
            style={{
              backgroundImage: "url(/images/bg-home.svg)",
              backgroundRepeat: "repeat",
              backgroundSize: "221px",
              maskImage: "linear-gradient(to bottom, black 0%, transparent 70%)",
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-center mt-4 z-10"
          >
            <h1 className="text-2xl font-bold text-gray-800">VisiTrack</h1>
            <p className="text-gray-500 text-sm mt-1">
              Sign in to your account
            </p>
          </motion.div>

          <form onSubmit={handleSubmit} className="mt-8 z-10 w-full max-w-md px-4">
            {/* Email Field */}
            <div className="flex flex-col gap-1.5 mb-4">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full h-11 pl-9 pr-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#407BA7] focus:border-transparent transition-all duration-200 text-sm bg-white"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-1.5 mb-4">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full h-11 pl-9 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#407BA7] focus:border-transparent transition-all duration-200 text-sm bg-white"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between mb-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <div
                  onClick={() => setRememberMe(!rememberMe)}
                  className={`w-4 h-4 rounded border flex items-center justify-center transition-all duration-200 cursor-pointer ${
                    rememberMe ? "bg-[#407BA7] border-[#407BA7]" : "border-gray-300 bg-white"
                  }`}
                >
                  {rememberMe && <Check className="size-3 text-white" />}
                </div>
                <span className="text-sm text-gray-600">Remember me</span>
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-[#407BA7] hover:underline transition"
              >
                Forgot password?
              </Link>
            </div>

            {/* Sign In Button */}
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full h-11 bg-[#407BA7] text-white rounded-lg font-medium hover:bg-[#356a8f] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
            >
              Sign In
              <ArrowRight size={16} />
            </motion.button>

          </form>

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
    </>
  );
}