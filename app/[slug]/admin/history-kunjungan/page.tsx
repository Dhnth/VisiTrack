'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  History, Search, Filter, X, ChevronLeft, ChevronRight,
  RefreshCw, User, Briefcase, Eye, Download, Edit, Trash2,
  AlertCircle, CheckCircle, Users, Save, Building,
  FileText, Clock, Upload, Camera
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface Employee {
  id: number;
  name: string;
  department: string;
}

interface Officer {
  id: number;
  name: string;
  email: string;
}

interface Guest {
  id: number;
  name: string;
  institution: string | null;
  purpose: string;
  status: string;
  photo_url: string | null;
  check_in_at: string | null;
  check_out_at: string | null;
  created_at: string;
  employee_name: string | null;
  employee_department: string | null;
  validated_by: string | null;
}

interface GuestDetail {
  id: number;
  name: string;
  nik: string | null;
  institution: string | null;
  purpose: string;
  employee_id: number | null;
  status: string;
  photo_url: string | null;
  check_in_at: string | null;
  check_out_at: string | null;
  employee_name: string | null;
  employee_department: string | null;
  created_by_name: string | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const statusBadge: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  active: 'bg-green-100 text-green-700',
  done: 'bg-blue-100 text-blue-700',
  rejected: 'bg-red-100 text-red-700',
};

const statusText: Record<string, string> = {
  pending: 'Pending',
  active: 'Sedang Berkunjung',
  done: 'Selesai',
  rejected: 'Ditolak',
};

export default function HistoryPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [guests, setGuests] = useState<Guest[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [enableCheckout, setEnableCheckout] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [officerFilter, setOfficerFilter] = useState<string>('all');
  const [employeeFilter, setEmployeeFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [officers, setOfficers] = useState<Officer[]>([]);

  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    nik: '',
    institution: '',
    purpose: '',
    employee_id: '',
    status: '',
    check_in_at: '',
    check_out_at: '',
    photo_url: '',
  });
  const [employeesList, setEmployeesList] = useState<Employee[]>([]);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  
  // Photo upload states
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  // Show toast helper
  const showToast = (type: 'success' | 'error', message: string) => {
    setToastMessage({ type, message });
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Format date time local
  const formatDateTimeLocal = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTimeWIB = (dateString: string | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const wib = new Date(date.getTime() + 7 * 60 * 60 * 1000);
    return wib.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  };

  // Live search with debounce
  useEffect(() => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    debounceTimeout.current = setTimeout(() => {
      setPagination(prev => ({ ...prev, page: 1 }));
      setSearch(searchInput);
    }, 500);
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [searchInput]);

  // Fetch data
  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      const urlParams = new URLSearchParams();
      urlParams.append('page', pagination.page.toString());
      urlParams.append('limit', '10');
      if (search) urlParams.append('search', search);
      if (statusFilter !== 'all') urlParams.append('status', statusFilter);
      if (startDate) urlParams.append('startDate', startDate);
      if (endDate) urlParams.append('endDate', endDate);
      if (officerFilter !== 'all') urlParams.append('officerId', officerFilter);
      if (employeeFilter !== 'all') urlParams.append('employeeId', employeeFilter);

      const res = await fetch(`/api/admin/history?${urlParams.toString()}`);
      const data = await res.json();
      if (data.success) {
        setGuests(data.guests);
        setPagination(data.pagination);
        if (data.enable_checkout !== undefined) {
          setEnableCheckout(data.enable_checkout);
        }
      }
      setLoading(false);
    };
    fetchHistory();
  }, [pagination.page, search, statusFilter, startDate, endDate, officerFilter, employeeFilter]);

  // Fetch employees and officers for filters
  useEffect(() => {
    const fetchFilters = async () => {
      const [empRes, offRes] = await Promise.all([
        fetch(`/api/admin/employees?limit=100`),
        fetch(`/api/admin/officers?limit=100`),
      ]);
      const empData = await empRes.json();
      const offData = await offRes.json();
      if (empData.success) setEmployees(empData.employees);
      if (offData.success) setOfficers(offData.officers);
    };
    fetchFilters();
  }, []);

  // Fetch all employees for edit dropdown
  useEffect(() => {
    const fetchAllEmployees = async () => {
      const res = await fetch(`/api/admin/employees?limit=1000`);
      const data = await res.json();
      if (data.success) setEmployeesList(data.employees);
    };
    fetchAllEmployees();
  }, []);

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleStartDateChange = (value: string) => {
    setStartDate(value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleEndDateChange = (value: string) => {
    setEndDate(value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setSearchInput('');
    setSearch('');
    setStatusFilter('all');
    setStartDate('');
    setEndDate('');
    setOfficerFilter('all');
    setEmployeeFilter('all');
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page }));
    }
  };

  const handleExportExcel = () => {
    const urlParams = new URLSearchParams();
    if (search) urlParams.append('search', search);
    if (statusFilter !== 'all') urlParams.append('status', statusFilter);
    if (startDate) urlParams.append('startDate', startDate);
    if (endDate) urlParams.append('endDate', endDate);
    if (officerFilter !== 'all') urlParams.append('officerId', officerFilter);
    if (employeeFilter !== 'all') urlParams.append('employeeId', employeeFilter);

    window.open(`/api/admin/history/export?${urlParams.toString()}`, '_blank');
  };

  // Handle photo upload
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedGuest) return;

    setUploadingPhoto(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('guestId', selectedGuest.id.toString());

    try {
      const res = await fetch('/api/admin/history/upload-photo', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        setEditFormData(prev => ({ ...prev, photo_url: data.photoUrl }));
        showToast('success', 'Foto berhasil diupload');
      } else {
        showToast('error', data.error || 'Gagal upload foto');
      }
    } catch (error) {
      console.error('Upload error:', error);
      showToast('error', 'Terjadi kesalahan saat upload');
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Trigger file input
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Open Edit Modal
  const openEditModal = async (guest: Guest) => {
    try {
      const res = await fetch(`/api/admin/history?id=${guest.id}`);
      const data = await res.json();

      if (data.success && data.guest) {
        const g = data.guest as GuestDetail;
        setSelectedGuest(guest);
        setEditFormData({
          name: g.name || '',
          nik: g.nik || '',
          institution: g.institution || '',
          purpose: g.purpose || '',
          employee_id: g.employee_id?.toString() || '',
          status: g.status || 'pending',
          check_in_at: formatDateTimeLocal(g.check_in_at),
          check_out_at: formatDateTimeLocal(g.check_out_at),
          photo_url: g.photo_url || '',
        });
        setEditError('');
        setEditSuccess('');
        setShowEditModal(true);
      } else {
        showToast('error', data.error || 'Gagal mengambil data');
      }
    } catch (error) {
      console.error(error);
      showToast('error', 'Terjadi kesalahan');
    }
  };

  // Handle Edit Submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGuest) return;

    setEditLoading(true);
    setEditError('');
    setEditSuccess('');

    const payload: Record<string, unknown> = {
      id: selectedGuest.id,
      name: editFormData.name,
      purpose: editFormData.purpose,
    };

    if (editFormData.nik) payload.nik = editFormData.nik;
    if (editFormData.institution) payload.institution = editFormData.institution;
    if (editFormData.employee_id) payload.employee_id = parseInt(editFormData.employee_id);
    else payload.employee_id = null;
    if (editFormData.status) payload.status = editFormData.status;
    if (editFormData.check_in_at) payload.check_in_at = editFormData.check_in_at;
    if (editFormData.check_out_at) payload.check_out_at = editFormData.check_out_at;
    if (editFormData.photo_url) payload.photo_url = editFormData.photo_url;

    const res = await fetch('/api/admin/history', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (data.success) {
      setEditSuccess(data.message);
      showToast('success', data.message);
      setTimeout(() => {
        setShowEditModal(false);
        window.location.reload();
      }, 1500);
    } else {
      setEditError(data.error);
      showToast('error', data.error);
    }
    setEditLoading(false);
  };

  // Open Delete Modal
  const openDeleteModal = (guest: Guest) => {
    setSelectedGuest(guest);
    setShowDeleteModal(true);
  };

  // Handle Delete
  const handleDelete = async () => {
    if (!selectedGuest) return;

    setDeleteLoading(true);
    const res = await fetch(`/api/admin/history?id=${selectedGuest.id}`, {
      method: 'DELETE',
    });

    const data = await res.json();
    if (data.success) {
      showToast('success', data.message);
      setTimeout(() => {
        setShowDeleteModal(false);
        window.location.reload();
      }, 1500);
    } else {
      showToast('error', data.error);
      setShowDeleteModal(false);
    }
    setDeleteLoading(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#407BA7]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-20 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 ${
              toastMessage.type === 'success' ? 'bg-green-500' : 'bg-red-500'
            } text-white`}
          >
            {toastMessage.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            <span>{toastMessage.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <History className="size-7 text-[#407BA7]" />
            <h1 className="text-2xl font-bold text-gray-800">History Kunjungan</h1>
          </div>
          <p className="text-gray-500 text-sm">Riwayat semua kunjungan tamu di instansi {slug}</p>
        </div>
        <button
          onClick={handleExportExcel}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          <Download size={18} />
          Export Excel
        </button>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Cari nama tamu, institusi, tujuan, karyawan... (live search)"
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#407BA7]"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
          >
            <Filter size={16} /> Filter
            {(statusFilter !== 'all' || startDate || endDate || officerFilter !== 'all' || employeeFilter !== 'all') && (
              <span className="w-2 h-2 bg-[#407BA7] rounded-full" />
            )}
          </button>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
          >
            <RefreshCw size={16} /> Refresh
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              >
                <option value="all">Semua Status</option>
                <option value="pending">Pending</option>
                <option value="active">Sedang Berkunjung</option>
                <option value="done">Selesai</option>
                <option value="rejected">Ditolak</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Divalidasi Oleh</label>
              <select
                value={officerFilter}
                onChange={(e) => setOfficerFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              >
                <option value="all">Semua Petugas</option>
                {officers.map((off) => (
                  <option key={off.id} value={off.id}>{off.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Karyawan Tujuan</label>
              <select
                value={employeeFilter}
                onChange={(e) => setEmployeeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              >
                <option value="all">Semua Karyawan</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>{emp.name} ({emp.department})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Dari Tanggal</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => handleStartDateChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Sampai Tanggal</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => handleEndDateChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              />
            </div>
            {(statusFilter !== 'all' || startDate || endDate || officerFilter !== 'all' || employeeFilter !== 'all') && (
              <div className="flex items-end">
                <button onClick={clearFilters} className="text-sm text-red-500 hover:text-red-600 transition flex items-center gap-1">
                  <X size={14} /> Hapus Filter
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center gap-2">
          <FileText className="size-4 text-gray-400" />
          <span className="text-sm text-gray-500">Total data: {pagination.total} • Halaman {pagination.page} dari {pagination.totalPages}</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Tamu</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tujuan</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Karyawan Tujuan</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Divalidasi</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {guests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                    Belum ada data kunjungan
                   </td>
                 </tr>
              ) : (
                guests.map((guest, idx) => (
                  <motion.tr
                    key={guest.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: idx * 0.02 }}
                    className="hover:bg-gray-50 transition"
                  >
                    <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                      {formatDate(guest.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden shrink-0">
                          {guest.photo_url ? (
                            <Image src={guest.photo_url} alt={guest.name} width={32} height={32} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-300">
                              <User size={14} className="text-gray-500" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">{guest.name}</p>
                          {guest.institution && <p className="text-xs text-gray-400">{guest.institution}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Briefcase size={14} className="text-gray-400" />
                        <span>{guest.purpose}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Users size={14} className="text-gray-400" />
                        <span>{guest.employee_name || '-'}</span>
                      </div>
                      {guest.employee_department && (
                        <p className="text-xs text-gray-400">{guest.employee_department}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusBadge[guest.status]}`}>
                        {statusText[guest.status]}
                      </span>
                      {enableCheckout ? (
                        <>
                          {guest.check_in_at && guest.status === 'active' && (
                            <p className="text-xs text-gray-400 mt-1">
                              Check in: {formatTimeWIB(guest.check_in_at)}
                            </p>
                          )}
                          {guest.check_out_at && guest.status === 'done' && (
                            <p className="text-xs text-gray-400 mt-1">
                              Check out: {formatTimeWIB(guest.check_out_at)}
                            </p>
                          )}
                        </>
                      ) : (
                        guest.check_in_at && (
                          <p className="text-xs text-gray-400 mt-1">
                            Check in: {formatTimeWIB(guest.check_in_at)}
                          </p>
                        )
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {guest.validated_by || 'System'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Link
                          href={`/${slug}/admin/history-kunjungan/${guest.id}`}
                          className="p-1.5 rounded-lg hover:bg-gray-100 transition"
                          title="Lihat Detail"
                        >
                          <Eye size={16} className="text-[#407BA7]" />
                        </Link>
                        <button
                          onClick={() => openEditModal(guest)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 transition"
                          title="Edit"
                        >
                          <Edit size={16} className="text-blue-500" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(guest)}
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

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <button
            onClick={() => goToPage(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition disabled:opacity-50"
          >
            <ChevronLeft size={16} />
          </button>
          <div className="flex gap-1">
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              let pageNum;
              if (pagination.totalPages <= 5) pageNum = i + 1;
              else if (pagination.page <= 3) pageNum = i + 1;
              else if (pagination.page >= pagination.totalPages - 2) pageNum = pagination.totalPages - 4 + i;
              else pageNum = pagination.page - 2 + i;
              return (
                <button
                  key={pageNum}
                  onClick={() => goToPage(pageNum)}
                  className={`w-8 h-8 rounded-lg text-sm transition ${
                    pagination.page === pageNum
                      ? 'bg-[#407BA7] text-white'
                      : 'border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
          <button
            onClick={() => goToPage(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Modal Edit with Photo Upload */}
      <AnimatePresence>
        {showEditModal && selectedGuest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto py-8"
            onClick={() => setShowEditModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 p-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-800">Edit Data Kunjungan</h3>
                <button onClick={() => setShowEditModal(false)} className="p-1 rounded-lg hover:bg-gray-100">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-4">
                {/* Photo Upload Section */}
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                      {editFormData.photo_url ? (
                        <Image
                          src={editFormData.photo_url}
                          alt="Foto Tamu"
                          width={80}
                          height={80}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Camera size={32} className="text-gray-400" />
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={triggerFileInput}
                      disabled={uploadingPhoto}
                      className="absolute -bottom-2 -right-2 p-1.5 bg-[#407BA7] text-white rounded-full hover:bg-[#356a8f] transition disabled:opacity-50"
                      title="Upload Foto"
                    >
                      {uploadingPhoto ? (
                        <RefreshCw size={14} className="animate-spin" />
                      ) : (
                        <Upload size={14} />
                      )}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Foto Tamu</p>
                    <p className="text-xs text-gray-400">Klik ikon upload untuk mengganti foto</p>
                    <p className="text-xs text-gray-400">Format: PNG, JPG, WebP (max 2MB)</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nama Tamu <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                      <input
                        type="text"
                        value={editFormData.name}
                        onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                        required
                        className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#407BA7]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">NIK</label>
                    <input
                      type="text"
                      value={editFormData.nik}
                      onChange={(e) => setEditFormData({ ...editFormData, nik: e.target.value })}
                      placeholder="Nomor Induk Kependudukan"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#407BA7]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Asal Instansi</label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                      <input
                        type="text"
                        value={editFormData.institution}
                        onChange={(e) => setEditFormData({ ...editFormData, institution: e.target.value })}
                        className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#407BA7]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tujuan <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                      <input
                        type="text"
                        value={editFormData.purpose}
                        onChange={(e) => setEditFormData({ ...editFormData, purpose: e.target.value })}
                        required
                        className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#407BA7]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Karyawan Tujuan</label>
                    <select
                      value={editFormData.employee_id}
                      onChange={(e) => setEditFormData({ ...editFormData, employee_id: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#407BA7]"
                    >
                      <option value="">Pilih Karyawan</option>
                      {employeesList.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.name} - {emp.department}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={editFormData.status}
                      onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#407BA7]"
                    >
                      <option value="pending">Pending</option>
                      <option value="active">Sedang Berkunjung</option>
                      <option value="done">Selesai</option>
                      <option value="rejected">Ditolak</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Check In</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                      <input
                        type="datetime-local"
                        value={editFormData.check_in_at}
                        onChange={(e) => setEditFormData({ ...editFormData, check_in_at: e.target.value })}
                        className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#407BA7]"
                      />
                    </div>
                  </div>

                  {enableCheckout && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Check Out</label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                        <input
                          type="datetime-local"
                          value={editFormData.check_out_at}
                          onChange={(e) => setEditFormData({ ...editFormData, check_out_at: e.target.value })}
                          className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#407BA7]"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {editError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm">{editError}</p>
                  </div>
                )}
                {editSuccess && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-600 text-sm">{editSuccess}</p>
                  </div>
                )}

                <div className="flex gap-3 justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={editLoading}
                    className="px-4 py-2 bg-[#407BA7] text-white rounded-lg hover:bg-[#356a8f] transition disabled:opacity-50 flex items-center gap-2"
                  >
                    {editLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        Simpan
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Delete Confirm */}
      <AnimatePresence>
        {showDeleteModal && selectedGuest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowDeleteModal(false)}
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
                  <AlertCircle size={24} className="text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Hapus Kunjungan?</h3>
              </div>
              <p className="text-gray-600 mb-6">
                Apakah Anda yakin ingin menghapus kunjungan dari <strong>{selectedGuest.name}</strong>?
                <br />
                <span className="text-red-500 text-sm">
                  Tindakan ini tidak dapat dibatalkan!
                </span>
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleteLoading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 flex items-center gap-2"
                >
                  {deleteLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Menghapus...
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} />
                      Hapus
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}