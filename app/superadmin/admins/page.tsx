"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  X,
  Eye,
  Building2,
  Mail,
  User,
  Key,
  Copy,
  Check,
  RefreshCw as ResetIcon,
} from "lucide-react";
import Link from "next/link";

interface Instance {
  id: number;
  name: string;
  slug: string;
}

interface Admin {
  id: number;
  name: string;
  email: string;
  role: string;
  instance_id: number;
  instance_name: string;
  instance_slug: string;
  created_at: Date;
}

interface FormData {
  id?: number;
  name: string;
  email: string;
  password: string;
  instance_id: string;
}

export default function AdminsPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [filteredAdmins, setFilteredAdmins] = useState<Admin[]>([]);
  const [instances, setInstances] = useState<Instance[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [instanceFilter, setInstanceFilter] = useState<string>("all");
  const [showFilter, setShowFilter] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [deleteAdmin, setDeleteAdmin] = useState<Admin | null>(null);
  const [resetAdmin, setResetAdmin] = useState<Admin | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [generateRandom, setGenerateRandom] = useState(true);
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    instance_id: "",
  });
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  const fetchAdmins = useCallback(async () => {
    try {
      const res = await fetch("/api/superadmin/admins");
      const data = await res.json();
      if (data.success) {
        setAdmins(data.admins);
        setFilteredAdmins(data.admins);
      }
    } catch (err) {
      console.error("Failed to fetch admins:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchInstances = useCallback(async () => {
    try {
      const res = await fetch("/api/superadmin/instances");
      const data = await res.json();
      if (data.success) {
        setInstances(data.instances);
      }
    } catch (err) {
      console.error("Failed to fetch instances:", err);
    }
  }, []);

  useEffect(() => {
    fetchAdmins();
    fetchInstances();
  }, [fetchAdmins, fetchInstances]);

  useEffect(() => {
    let filtered = [...admins];

    if (searchTerm) {
      filtered = filtered.filter(
        (admin) =>
          admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          admin.instance_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (instanceFilter !== "all") {
      filtered = filtered.filter(
        (admin) => admin.instance_id === parseInt(instanceFilter)
      );
    }

    setFilteredAdmins(filtered);
  }, [searchTerm, instanceFilter, admins]);

  const openAddModal = () => {
    setModalMode("add");
    setSelectedAdmin(null);
    setFormData({
      name: "",
      email: "",
      password: "",
      instance_id: "",
    });
    setGenerateRandom(true);
    setGeneratedPassword("");
    setFormError("");
    setFormSuccess("");
    setShowPassword(false);
    setShowModal(true);
  };

  const openEditModal = (admin: Admin) => {
    setModalMode("edit");
    setSelectedAdmin(admin);
    setFormData({
      id: admin.id,
      name: admin.name,
      email: admin.email,
      password: "",
      instance_id: admin.instance_id.toString(),
    });
    setGenerateRandom(false);
    setGeneratedPassword("");
    setFormError("");
    setFormSuccess("");
    setShowPassword(false);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setFormError("");
    setFormSuccess("");

    try {
      const url = "/api/superadmin/admins";
      const method = modalMode === "add" ? "POST" : "PUT";
      
      const body = modalMode === "add"
        ? {
            name: formData.name,
            email: formData.email,
            instance_id: formData.instance_id,
            generatePassword: generateRandom,
            ...(generateRandom ? {} : { password: formData.password }),
          }
        : {
            id: selectedAdmin?.id,
            name: formData.name,
            email: formData.email,
            instance_id: formData.instance_id,
            ...(formData.password ? { password: formData.password } : {}),
          };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (data.success) {
        if (modalMode === "add" && data.isRandomGenerated) {
          setGeneratedPassword(data.password);
          setFormSuccess(`${data.message}\nPassword: ${data.password}`);
        } else {
          setFormSuccess(data.message);
        }
        
        if (modalMode === "add" && data.isRandomGenerated) {
          setActionLoading(false);
        } else {
          setTimeout(() => {
            setShowModal(false);
            fetchAdmins();
          }, 1500);
        }
      } else {
        setFormError(data.error);
        setActionLoading(false);
      }
    } catch (err) {
      setFormError("Terjadi kesalahan");
      console.error(err);
      setActionLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetAdmin) return;
    setActionLoading(true);
    try {
      const res = await fetch("/api/superadmin/admins", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: resetAdmin.id,
          resetPassword: true,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setGeneratedPassword(data.newPassword);
        setFormSuccess(`Password berhasil direset!\nPassword baru: ${data.newPassword}`);
        setResetAdmin(null);
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert("Gagal mereset password");
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteAdmin) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/superadmin/admins?id=${deleteAdmin.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        await fetchAdmins();
        setDeleteAdmin(null);
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert("Gagal menghapus admin");
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-[#800016] border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Admin Instansi</h1>
          <p className="text-gray-500 text-sm mt-1">
            Kelola semua admin yang mengelola instansi
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-[#800016] text-white rounded-lg hover:bg-[#A0001C] transition"
        >
          <Plus size={18} />
          Tambah Admin
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari admin atau instansi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#407BA7]"
          />
        </div>
        <div className="relative">
          <button
            onClick={() => setShowFilter(!showFilter)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
          >
            <Filter size={16} />
            Filter Instansi
          </button>
          <AnimatePresence>
            {showFilter && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-4"
              >
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Pilih Instansi
                </label>
                <select
                  value={instanceFilter}
                  onChange={(e) => setInstanceFilter(e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded-lg text-sm"
                >
                  <option value="all">Semua Instansi</option>
                  {instances.map((inst) => (
                    <option key={inst.id} value={inst.id}>
                      {inst.name}
                    </option>
                  ))}
                </select>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <button
          onClick={fetchAdmins}
          className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-2xl font-bold text-gray-800">{admins.length}</p>
          <p className="text-sm text-gray-500">Total Admin</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-2xl font-bold text-green-600">
            {instances.length}
          </p>
          <p className="text-sm text-gray-500">Total Instansi</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-2xl font-bold text-blue-600">
            {instances.filter((i) => i.id).length}
          </p>
          <p className="text-sm text-gray-500">Instansi dengan Admin</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Admin
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Instansi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Bergabung
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredAdmins.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    Tidak ada data admin
                  </td>
                </tr>
              ) : (
                filteredAdmins.map((admin, idx) => (
                  <motion.tr
                    key={admin.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: idx * 0.03 }}
                    className="hover:bg-gray-50 transition"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#800016]/10 text-[#800016] flex items-center justify-center font-medium">
                          {admin.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{admin.name}</p>
                          <p className="text-xs text-gray-400">
                            ID: {admin.id}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <Mail size={14} className="text-gray-400" />
                        <span className="text-sm text-gray-600">{admin.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/${admin.instance_slug}`}
                        target="_blank"
                        className="flex items-center gap-1 hover:text-[#800016] transition"
                      >
                        <Building2 size={14} className="text-gray-400" />
                        <span className="text-sm text-gray-600">{admin.instance_name}</span>
                        <Eye size={12} className="text-gray-400" />
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">
                        {new Date(admin.created_at).toLocaleDateString("id-ID")}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(admin)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 transition"
                          title="Edit"
                        >
                          <Edit size={16} className="text-blue-500" />
                        </button>
                        <button
                          onClick={() => setResetAdmin(admin)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 transition"
                          title="Reset Password"
                        >
                          <ResetIcon size={16} className="text-orange-500" />
                        </button>
                        <button
                          onClick={() => setDeleteAdmin(admin)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 transition"
                          title="Hapus"
                        >
                          <Trash2 size={16} className="text-red-500" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form (Tambah/Edit) */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => !generatedPassword && setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-800">
                  {modalMode === "add" ? "Tambah Admin Baru" : "Edit Admin"}
                </h3>
                {!generatedPassword && (
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-1 rounded-lg hover:bg-gray-100 transition"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>

              {generatedPassword ? (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-700 font-medium mb-2">
                      {modalMode === "add" ? "Admin berhasil ditambahkan!" : "Password berhasil direset!"}
                    </p>
                    <div className="flex items-center gap-2 mt-3">
                      <code className="flex-1 p-2 bg-white border border-gray-200 rounded-lg font-mono text-sm">
                        {generatedPassword}
                      </code>
                      <button
                        onClick={() => copyToClipboard(generatedPassword)}
                        className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                      >
                        {copied ? <Check size={18} className="text-green-600" /> : <Copy size={18} className="text-gray-600" />}
                      </button>
                    </div>
                    <p className="text-sm text-gray-500 mt-3">
                      Simpan password ini. Password tidak akan ditampilkan lagi.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setGeneratedPassword("");
                      setShowModal(false);
                      fetchAdmins();
                    }}
                    className="w-full px-4 py-2 bg-[#800016] text-white rounded-lg hover:bg-[#A0001C] transition"
                  >
                    Tutup
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nama Lengkap *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#407BA7]"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#407BA7]"
                        required
                      />
                    </div>
                  </div>

                  {modalMode === "add" && (
                    <div>
                      <label className="flex items-center gap-2 mb-2">
                        <input
                          type="checkbox"
                          checked={generateRandom}
                          onChange={(e) => setGenerateRandom(e.target.checked)}
                          className="rounded border-gray-300 text-[#800016] focus:ring-[#800016]"
                        />
                        <span className="text-sm text-gray-700">
                          Generate password otomatis
                        </span>
                      </label>
                      
                      {!generateRandom && (
                        <div className="relative">
                          <Key className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                          <input
                            type={showPassword ? "text" : "password"}
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            placeholder="Masukkan password"
                            className="w-full pl-9 pr-10 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#407BA7]"
                            required={!generateRandom}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? "👁️" : "🔒"}
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {modalMode === "edit" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Password (kosongkan jika tidak diubah)
                      </label>
                      <div className="relative">
                        <Key className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                        <input
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          className="w-full pl-9 pr-10 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#407BA7]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? "👁️" : "🔒"}
                        </button>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Instansi *
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                      <select
                        value={formData.instance_id}
                        onChange={(e) => setFormData({ ...formData, instance_id: e.target.value })}
                        className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#407BA7] appearance-none"
                        required
                      >
                        <option value="">Pilih Instansi</option>
                        {instances.map((inst) => (
                          <option key={inst.id} value={inst.id}>
                            {inst.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {formError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-600 text-sm">{formError}</p>
                    </div>
                  )}

                  <div className="flex gap-3 justify-end pt-4">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={actionLoading}
                      className="px-4 py-2 bg-[#800016] text-white rounded-lg hover:bg-[#A0001C] transition disabled:opacity-50"
                    >
                      {actionLoading ? "Memproses..." : modalMode === "add" ? "Tambah" : "Simpan"}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Konfirmasi Reset Password */}
      <AnimatePresence>
        {resetAdmin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setResetAdmin(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-full bg-orange-100">
                  <ResetIcon size={24} className="text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Reset Password?</h3>
              </div>
              <p className="text-gray-600 mb-6">
                Apakah Anda yakin ingin mereset password admin &quot;{resetAdmin.name}&quot;?
                <br />
                <span className="text-orange-500 text-sm">
                  Password baru akan digenerate secara otomatis.
                </span>
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setResetAdmin(null)}
                  className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                >
                  Batal
                </button>
                <button
                  onClick={handleResetPassword}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition disabled:opacity-50"
                >
                  {actionLoading ? "Memproses..." : "Reset Password"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Konfirmasi Hapus */}
      <AnimatePresence>
        {deleteAdmin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setDeleteAdmin(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-full bg-red-100">
                  <Trash2 size={24} className="text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Hapus Admin?</h3>
              </div>
              <p className="text-gray-600 mb-6">
                Apakah Anda yakin ingin menghapus admin &quot;{deleteAdmin.name}&quot;?
                <br />
                <span className="text-red-500 text-sm">
                  Tindakan ini tidak dapat dibatalkan!
                </span>
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setDeleteAdmin(null)}
                  className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                >
                  Batal
                </button>
                <button
                  onClick={handleDelete}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                >
                  {actionLoading ? "Memproses..." : "Hapus"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}