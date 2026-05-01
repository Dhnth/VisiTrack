"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ChevronLeft,
  Download,
  FileSpreadsheet,
  Calendar,
  Filter,
  X,
  AlertCircle,
  CheckCircle,
  Loader2,
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

export default function PpidExportPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setToastMessage({ type, message });
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Set default date range (last 30 days)
  useEffect(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    setEndDate(today.toISOString().split("T")[0]);
    setStartDate(thirtyDaysAgo.toISOString().split("T")[0]);
  }, []);

  const handleExport = async () => {
    setLoading(true);
    try {
      const urlParams = new URLSearchParams();
      if (startDate) urlParams.append("startDate", startDate);
      if (endDate) urlParams.append("endDate", endDate);
      if (status !== "all") urlParams.append("status", status);

      const res = await fetch(`/api/ppid/export?${urlParams.toString()}`);
      
      if (!res.ok) {
        throw new Error("Export failed");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `laporan_kunjungan_${startDate}_${endDate}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      showToast("success", "Laporan berhasil diexport");
    } catch (error) {
      console.error("Export error:", error);
      showToast("error", "Gagal mengexport laporan");
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    setEndDate(today.toISOString().split("T")[0]);
    setStartDate(thirtyDaysAgo.toISOString().split("T")[0]);
    setStatus("all");
  };

  const statusOptions = [
    { value: "all", label: "Semua Status" },
    { value: "pending", label: "Pending" },
    { value: "active", label: "Sedang Berkunjung" },
    { value: "done", label: "Selesai" },
    { value: "rejected", label: "Ditolak" },
  ];

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
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

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            href={`/${slug}/ppid`}
            className="inline-flex items-center gap-2 transition mb-2"
            style={{ color: colors.secondary }}
          >
            <ChevronLeft size={16} />
            Kembali ke Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <div
              className="p-2 rounded-xl"
              style={{ backgroundColor: `${colors.secondary}15` }}
            >
              <Download className="size-6" style={{ color: colors.secondary }} />
            </div>
            <div>
              <h1
                className="text-2xl font-bold"
                style={{ color: colors.secondaryDarkest }}
              >
                Laporan & Export Data
              </h1>
              <p
                className="text-sm mt-0.5"
                style={{ color: colors.secondaryDark }}
              >
                Export data kunjungan ke Excel
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Export Form */}
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
              <Filter size={18} style={{ color: colors.secondary }} />
              Filter Data
            </h2>
          </div>
          <div className="p-5 space-y-5">
            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  style={{ color: colors.secondaryDarkest }}
                >
                  Dari Tanggal
                </label>
                <div className="relative">
                  <Calendar
                    className="absolute left-3 top-1/2 -translate-y-1/2 size-4"
                    style={{ color: colors.secondaryDark }}
                  />
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-lg focus:outline-none focus:ring-2"
                    style={{
                      border: `1px solid ${colors.secondary}20`,
                      color: colors.secondaryDarkest,
                      backgroundColor: colors.white,
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = colors.secondary)}
                  />
                </div>
              </div>
              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  style={{ color: colors.secondaryDarkest }}
                >
                  Sampai Tanggal
                </label>
                <div className="relative">
                  <Calendar
                    className="absolute left-3 top-1/2 -translate-y-1/2 size-4"
                    style={{ color: colors.secondaryDark }}
                  />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-lg focus:outline-none focus:ring-2"
                    style={{
                      border: `1px solid ${colors.secondary}20`,
                      color: colors.secondaryDarkest,
                      backgroundColor: colors.white,
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = colors.secondary)}
                  />
                </div>
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label
                className="block text-sm font-medium mb-1"
                style={{ color: colors.secondaryDarkest }}
              >
                Status Kunjungan
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 appearance-none"
                style={{
                  border: `1px solid ${colors.secondary}20`,
                  color: colors.secondaryDarkest,
                  backgroundColor: colors.white,
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = colors.secondary)}
              >
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Excel Format Info */}
            <div
              className="p-3 rounded-lg"
              style={{ backgroundColor: `${colors.secondary}10` }}
            >
              <div className="flex items-center gap-2">
                <FileSpreadsheet size={16} style={{ color: colors.secondary }} />
                <span className="text-sm" style={{ color: colors.secondaryDark }}>
                  Format Export: Excel (.xlsx)
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={clearFilters}
                className="px-4 py-2 rounded-lg transition"
                style={{
                  border: `1px solid ${colors.secondary}20`,
                  color: colors.secondaryDark,
                }}
              >
                Reset Filter
              </button>
              <button
                onClick={handleExport}
                disabled={loading}
                className="flex-1 px-4 py-2 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
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
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <Download size={16} />
                    Export Excel
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Info Card */}
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
              <FileSpreadsheet size={18} style={{ color: colors.secondary }} />
              Informasi Export
            </h2>
          </div>
          <div className="p-5 space-y-4">
            <div
              className="p-4 rounded-xl"
              style={{ backgroundColor: `${colors.secondary}10` }}
            >
              <p
                className="text-sm font-medium mb-2"
                style={{ color: colors.secondaryDarkest }}
              >
                📋 Data yang akan diexport:
              </p>
              <ul className="text-sm space-y-1.5" style={{ color: colors.secondaryDark }}>
                <li>• Nama Tamu</li>
                <li>• NIK</li>
                <li>• Asal Instansi</li>
                <li>• Tujuan Kunjungan</li>
                <li>• Status</li>
                <li>• Check In / Check Out</li>
                <li>• Tanggal Kunjungan</li>
                <li>• Karyawan Tujuan</li>
                <li>• Departemen</li>
                <li>• Divalidasi Oleh</li>
              </ul>
            </div>

            <div
              className="p-3 rounded-lg"
              style={{ backgroundColor: `${colors.secondary}05` }}
            >
              <p className="text-xs flex items-start gap-2" style={{ color: colors.secondaryDark }}>
                <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                File akan diunduh dalam format Excel (.xlsx) dan dapat dibuka dengan Microsoft Excel atau Google Sheets.
              </p>
            </div>

            {/* Quick Export Buttons */}
            <div className="pt-2">
              <p className="text-sm font-medium mb-3" style={{ color: colors.secondaryDarkest }}>
                Export Cepat:
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    const today = new Date();
                    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                    setStartDate(startOfMonth.toISOString().split("T")[0]);
                    setEndDate(today.toISOString().split("T")[0]);
                    setTimeout(() => handleExport(), 100);
                  }}
                  className="px-3 py-1.5 text-xs rounded-lg transition"
                  style={{
                    backgroundColor: `${colors.secondary}10`,
                    color: colors.secondary,
                  }}
                >
                  Bulan Ini
                </button>
                <button
                  onClick={() => {
                    const today = new Date();
                    const startOfYear = new Date(today.getFullYear(), 0, 1);
                    setStartDate(startOfYear.toISOString().split("T")[0]);
                    setEndDate(today.toISOString().split("T")[0]);
                    setTimeout(() => handleExport(), 100);
                  }}
                  className="px-3 py-1.5 text-xs rounded-lg transition"
                  style={{
                    backgroundColor: `${colors.secondary}10`,
                    color: colors.secondary,
                  }}
                >
                  Tahun Ini
                </button>
                <button
                  onClick={() => {
                    const today = new Date();
                    const lastMonth = new Date();
                    lastMonth.setMonth(today.getMonth() - 1);
                    setStartDate(lastMonth.toISOString().split("T")[0]);
                    setEndDate(today.toISOString().split("T")[0]);
                    setTimeout(() => handleExport(), 100);
                  }}
                  className="px-3 py-1.5 text-xs rounded-lg transition"
                  style={{
                    backgroundColor: `${colors.secondary}10`,
                    color: colors.secondary,
                  }}
                >
                  30 Hari Terakhir
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}