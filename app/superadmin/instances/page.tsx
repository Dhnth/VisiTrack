"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  Eye,
  RefreshCw,
  AlertCircle,
  Calendar,
  Users,
  FileText,
  Power,
  PowerOff,
  ExternalLink,
  Plus,
  Edit,
  Trash2,
  X,
  UserPlus,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Instance {
  id: number;
  name: string;
  slug: string;
  address: string;
  phone: string;
  subscription_status: "active" | "expired" | "trial";
  subscription_start: Date;
  subscription_end: Date;
  is_active: boolean;
  total_users: number;
  total_guests: number;
  created_at: Date;
  days_left: number;
}

interface FormData {
  id?: number;
  name: string;
  slug: string;
  address: string;
  phone: string;
  subscription_start: string;
  subscription_end: string;
}

const statusColors = {
  active: "bg-green-100 text-green-700",
  expired: "bg-red-100 text-red-700",
  trial: "bg-orange-100 text-orange-700",
};

const statusNames = {
  active: "Aktif",
  expired: "Expired",
  trial: "Trial",
};

export default function InstancesPage() {
  const router = useRouter();
  const [instances, setInstances] = useState<Instance[]>([]);
  const [filteredInstances, setFilteredInstances] = useState<Instance[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showFilter, setShowFilter] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedInstance, setSelectedInstance] = useState<Instance | null>(
    null,
  );
  const [actionInstance, setActionInstance] = useState<Instance | null>(null);
  const [deleteInstance, setDeleteInstance] = useState<Instance | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [newInstanceId, setNewInstanceId] = useState<number | null>(null);
  const [newInstanceName, setNewInstanceName] = useState("");
  const [formData, setFormData] = useState<FormData>({
    name: "",
    slug: "",
    address: "",
    phone: "",
    subscription_start: "",
    subscription_end: "",
  });
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  const fetchInstances = useCallback(async () => {
    try {
      const res = await fetch("/api/superadmin/instances");
      const data = await res.json();
      if (data.success) {
        setInstances(data.instances);
        setFilteredInstances(data.instances);
      }
    } catch (err) {
      console.error("Failed to fetch instances:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInstances();
  }, [fetchInstances]);

  useEffect(() => {
    let filtered = [...instances];

    if (searchTerm) {
      filtered = filtered.filter(
        (inst) =>
          inst.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          inst.slug.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (inst) => inst.subscription_status === statusFilter,
      );
    }

    setFilteredInstances(filtered);
  }, [searchTerm, statusFilter, instances]);

  const openAddModal = () => {
    setModalMode("add");
    setSelectedInstance(null);
    setFormData({
      name: "",
      slug: "",
      address: "",
      phone: "",
      subscription_start: "",
      subscription_end: "",
    });
    setFormError("");
    setFormSuccess("");
    setShowModal(true);
  };

  const openEditModal = (instance: Instance) => {
    setModalMode("edit");
    setSelectedInstance(instance);
    setFormData({
      id: instance.id,
      name: instance.name,
      slug: instance.slug,
      address: instance.address,
      phone: instance.phone,
      subscription_start: new Date(instance.subscription_start)
        .toISOString()
        .split("T")[0],
      subscription_end: new Date(instance.subscription_end)
        .toISOString()
        .split("T")[0],
    });
    setFormError("");
    setFormSuccess("");
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setFormError("");
    setFormSuccess("");

    try {
      const url = "/api/superadmin/instances";
      const method = modalMode === "add" ? "POST" : "PUT";
      const body =
        modalMode === "add"
          ? formData
          : { ...formData, id: selectedInstance?.id };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (data.success) {
        if (modalMode === "add") {
          setNewInstanceId(data.instanceId);
          setNewInstanceName(formData.name);
          setShowModal(false);
          setShowSuccessModal(true);
        } else {
          setFormSuccess(data.message);
          setTimeout(() => {
            setShowModal(false);
            fetchInstances();
          }, 1500);
        }
      } else {
        setFormError(data.error);
      }
    } catch (err) {
      setFormError("Terjadi kesalahan");
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddAdmin = () => {
    if (newInstanceId) {
      router.push(
        `/superadmin/admins?instanceId=${newInstanceId}&instanceName=${encodeURIComponent(newInstanceName)}`,
      );
    }
  };

  const toggleInstanceStatus = async (instance: Instance) => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/superadmin/instances", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: instance.id,
          is_active: !instance.is_active,
        }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchInstances();
      }
    } catch (err) {
      console.error("Failed to toggle instance:", err);
    } finally {
      setActionLoading(false);
      setActionInstance(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteInstance) return;
    setActionLoading(true);
    try {
      const res = await fetch(
        `/api/superadmin/instances?id=${deleteInstance.id}`,
        {
          method: "DELETE",
        },
      );
      const data = await res.json();
      if (data.success) {
        await fetchInstances();
        setDeleteInstance(null);
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert("Gagal menghapus instansi");
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const getDaysLeftColor = (days: number) => {
    if (days < 0) return "text-red-600";
    if (days < 7) return "text-orange-500";
    return "text-gray-500";
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
          <h1 className="text-2xl font-bold text-gray-800">Instansi</h1>
          <p className="text-gray-500 text-sm mt-1">
            Kelola semua instansi yang terdaftar
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-[#800016] text-white rounded-lg hover:bg-[#A0001C] transition"
        >
          <Plus size={18} />
          Tambah Instansi
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari instansi..."
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
            Filter
          </button>
          <AnimatePresence>
            {showFilter && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-4"
              >
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Status Langganan
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full p-2 border border-gray-200 rounded-lg text-sm"
                  >
                    <option value="all">Semua</option>
                    <option value="active">Aktif</option>
                    <option value="expired">Expired</option>
                    <option value="trial">Trial</option>
                  </select>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <button
          onClick={fetchInstances}
          className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-2xl font-bold text-gray-800">{instances.length}</p>
          <p className="text-sm text-gray-500">Total Instansi</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-2xl font-bold text-green-600">
            {instances.filter((i) => i.subscription_status === "active").length}
          </p>
          <p className="text-sm text-gray-500">Instansi Aktif</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-2xl font-bold text-red-600">
            {
              instances.filter((i) => i.subscription_status === "expired")
                .length
            }
          </p>
          <p className="text-sm text-gray-500">Instansi Expired</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-2xl font-bold text-orange-600">
            {instances.filter((i) => i.subscription_status === "trial").length}
          </p>
          <p className="text-sm text-gray-500">Instansi Trial</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Instansi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Telepon
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status Langganan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Masa Aktif
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Users
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Kunjungan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredInstances.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    Tidak ada data instansi
                  </td>
                </tr>
              ) : (
                filteredInstances.map((instance, idx) => (
                  <motion.tr
                    key={instance.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: idx * 0.03 }}
                    className="hover:bg-gray-50 transition"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-800">
                          {instance.name}
                        </p>
                        <p className="text-xs text-gray-400">{instance.slug}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {instance.phone}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[instance.subscription_status]}`}
                      >
                        {statusNames[instance.subscription_status]}
                      </span>
                      {!instance.is_active && (
                        <span className="ml-2 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          Nonaktif
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <Calendar size={14} className="text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {new Date(
                            instance.subscription_end,
                          ).toLocaleDateString("id-ID")}
                        </span>
                      </div>
                      <p
                        className={`text-xs mt-1 ${getDaysLeftColor(instance.days_left)}`}
                      >
                        {instance.days_left < 0
                          ? "Sudah expired"
                          : `${instance.days_left} hari lagi`}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <Users size={14} className="text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {instance.total_users}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <FileText size={14} className="text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {instance.total_guests}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/${instance.slug}/admin`}
                          className="p-1.5 rounded-lg hover:bg-gray-100 transition"
                          title="Lihat Detail"
                        >
                          <Eye size={16} className="text-gray-500" />
                        </Link>
                        <button
                          onClick={() => openEditModal(instance)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 transition"
                          title="Edit"
                        >
                          <Edit size={16} className="text-blue-500" />
                        </button>
                        <button
                          onClick={() => setDeleteInstance(instance)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 transition"
                          title="Hapus"
                        >
                          <Trash2 size={16} className="text-red-500" />
                        </button>
                        <button
                          onClick={() => setActionInstance(instance)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 transition"
                          title={
                            instance.is_active ? "Nonaktifkan" : "Aktifkan"
                          }
                        >
                          {instance.is_active ? (
                            <PowerOff size={16} className="text-red-500" />
                          ) : (
                            <Power size={16} className="text-green-500" />
                          )}
                        </button>
                        <Link
                          href={`/${instance.slug}`}
                          target="_blank"
                          className="p-1.5 rounded-lg hover:bg-gray-100 transition"
                          title="Buka Instansi"
                        >
                          <ExternalLink size={16} className="text-gray-500" />
                        </Link>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 p-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-800">
                  {modalMode === "add"
                    ? "Tambah Instansi Baru"
                    : "Edit Instansi"}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1 rounded-lg hover:bg-gray-100 transition"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nama Instansi *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#407BA7]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Slug (URL) *
                    </label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          slug: e.target.value.toLowerCase().replace(/\s/g, ""),
                        })
                      }
                      placeholder="contoh: smkn1banjar"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#407BA7]"
                      required
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Akan digunakan di URL: /{formData.slug || "slug"}/...
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Alamat *
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#407BA7]"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Telepon *
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#407BA7]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tanggal Mulai Langganan *
                    </label>
                    <input
                      type="date"
                      value={formData.subscription_start}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          subscription_start: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#407BA7]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tanggal Berakhir Langganan *
                    </label>
                    <input
                      type="date"
                      value={formData.subscription_end}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          subscription_end: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#407BA7]"
                      required
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Harga: Rp50.000 / bulan
                    </p>
                  </div>
                </div>

                {formError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm">{formError}</p>
                  </div>
                )}
                {formSuccess && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-600 text-sm">{formSuccess}</p>
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
                    {actionLoading
                      ? "Memproses..."
                      : modalMode === "add"
                        ? "Tambah"
                        : "Simpan"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Konfirmasi Toggle Status */}
      <AnimatePresence>
        {actionInstance && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setActionInstance(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-full bg-amber-100">
                  <AlertCircle size={24} className="text-amber-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {actionInstance.is_active
                    ? "Nonaktifkan Instansi?"
                    : "Aktifkan Instansi?"}
                </h3>
              </div>
              <p className="text-gray-600 mb-6">
                {actionInstance.is_active
                  ? `Instansi "${actionInstance.name}" akan dinonaktifkan. Pengguna tidak bisa login dan tamu tidak bisa mengisi form.`
                  : `Instansi "${actionInstance.name}" akan diaktifkan kembali.`}
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setActionInstance(null)}
                  className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                >
                  Batal
                </button>
                <button
                  onClick={() => toggleInstanceStatus(actionInstance)}
                  disabled={actionLoading}
                  className={`px-4 py-2 rounded-lg text-white transition ${
                    actionInstance.is_active
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-green-600 hover:bg-green-700"
                  } disabled:opacity-50`}
                >
                  {actionLoading
                    ? "Memproses..."
                    : actionInstance.is_active
                      ? "Nonaktifkan"
                      : "Aktifkan"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Konfirmasi Hapus */}
      <AnimatePresence>
        {deleteInstance && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setDeleteInstance(null)}
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
                <h3 className="text-lg font-semibold text-gray-800">
                  Hapus Instansi?
                </h3>
              </div>
              <p className="text-gray-600 mb-6">
                Apakah Anda yakin ingin menghapus instansi &quot;
                {deleteInstance.name}&quot;?
                <br />
                <span className="text-red-500 text-sm">
                  Tindakan ini tidak dapat dibatalkan!
                </span>
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setDeleteInstance(null)}
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

      {/* Modal Success - Arahkan Tambah Admin */}
      <AnimatePresence>
        {showSuccessModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowSuccessModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-full bg-green-100">
                  <UserPlus size={24} className="text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Instansi Berhasil Dibuat!
                </h3>
              </div>
              <p className="text-gray-600 mb-2">
                Instansi <strong>{newInstanceName}</strong> berhasil
                ditambahkan.
              </p>
              <p className="text-gray-600 mb-6">
                Apakah Anda ingin menambahkan admin untuk instansi ini sekarang?
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                >
                  Nanti Saja
                </button>
                <button
                  onClick={handleAddAdmin}
                  className="px-4 py-2 bg-[#800016] text-white rounded-lg hover:bg-[#A0001C] transition"
                >
                  Tambah Admin
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
