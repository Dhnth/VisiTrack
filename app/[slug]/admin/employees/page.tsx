'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, Plus, Edit, Trash2, Download, Upload,
  RefreshCw, X, AlertCircle, ChevronLeft, ChevronRight,
  CheckSquare, Square
} from 'lucide-react';

interface Employee {
  id: number;
  nip: string | null;
  name: string;
  department: string;
  phone: string | null;
  is_active: boolean;
  created_at: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function EmployeesPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState({
    nip: '',
    name: '',
    department: '',
    phone: '',
    is_active: true,
  });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importLoading, setImportLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<Employee | null>(null);

  // FETCH DATA - langsung di dalam useEffect
  useEffect(() => {
    const fetchEmployees = async () => {
      setLoading(true);
      const urlParams = new URLSearchParams();
      urlParams.append('page', pagination.page.toString());
      urlParams.append('limit', '10');
      if (search) urlParams.append('search', search);
      if (statusFilter !== 'all') urlParams.append('status', statusFilter);

      const res = await fetch(`/api/admin/employees?${urlParams.toString()}`);
      const data = await res.json();
      if (data.success) {
        setEmployees(data.employees);
        setPagination(data.pagination);
      }
      setLoading(false);
    };
    fetchEmployees();
  }, [pagination.page, search, statusFilter]);

  const handleSearch = () => {
    setSearch(searchInput);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  const clearFilters = () => {
    setSearchInput('');
    setSearch('');
    setStatusFilter('all');
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page }));
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === employees.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(employees.map(e => e.id));
    }
  };

  const toggleSelect = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBulkAction = async (action: 'activate' | 'deactivate' | 'delete') => {
    if (selectedIds.length === 0) {
      alert('Pilih karyawan terlebih dahulu');
      return;
    }

    if (action === 'delete' && !confirm(`Hapus ${selectedIds.length} karyawan?`)) return;

    const res = await fetch('/api/admin/employees', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ids: selectedIds }),
    });
    const data = await res.json();
    if (data.success) {
      setSelectedIds([]);
      window.location.reload();
    } else {
      alert(data.error);
    }
  };

  const openAddModal = () => {
    setModalMode('add');
    setSelectedEmployee(null);
    setFormData({ nip: '', name: '', department: '', phone: '', is_active: true });
    setFormError('');
    setFormSuccess('');
    setShowModal(true);
  };

  const openEditModal = (employee: Employee) => {
    setModalMode('edit');
    setSelectedEmployee(employee);
    setFormData({
      nip: employee.nip || '',
      name: employee.name,
      department: employee.department,
      phone: employee.phone || '',
      is_active: employee.is_active,
    });
    setFormError('');
    setFormSuccess('');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setFormError('');
    setFormSuccess('');

    const url = '/api/admin/employees';
    const method = modalMode === 'add' ? 'POST' : 'PUT';
    const body = modalMode === 'add'
      ? formData
      : { ...formData, id: selectedEmployee?.id };

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();

    if (data.success) {
      setFormSuccess(data.message);
      setTimeout(() => {
        setShowModal(false);
        window.location.reload();
      }, 1500);
    } else {
      setFormError(data.error);
    }
    setActionLoading(false);
  };

  const handleDelete = async (employee: Employee) => {
    const res = await fetch(`/api/admin/employees?id=${employee.id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      window.location.reload();
    } else {
      alert(data.error);
    }
    setShowDeleteConfirm(null);
  };

  const handleExport = async () => {
    window.open('/api/admin/employees/export', '_blank');
  };

  const handleImport = async () => {
    if (!importFile) {
      alert('Pilih file Excel terlebih dahulu');
      return;
    }

    setImportLoading(true);
    const formData = new FormData();
    formData.append('file', importFile);

    const res = await fetch('/api/admin/employees/import', {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    if (data.success) {
      alert(data.message);
      setShowImportModal(false);
      setImportFile(null);
      window.location.reload();
    } else {
      alert(data.error);
    }
    setImportLoading(false);
  };

  const downloadTemplate = () => {
    // Simple template download without XLSX in client
    const csvContent = 'Nama,Departemen,NIP,Telepon\nJohn Doe,Teknik,12345,08123456789';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template_karyawan.csv';
    a.click();
    URL.revokeObjectURL(url);
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Data Karyawan</h1>
          <p className="text-gray-500 text-sm mt-1">
            Kelola data karyawan untuk keperluan kunjungan tamu
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-[#800016] text-white rounded-lg hover:bg-[#A0001C] transition"
          >
            <Plus size={18} />
            Tambah Karyawan
          </button>
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
          >
            <Upload size={18} />
            Import
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
          >
            <Download size={18} />
            Export
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Cari berdasarkan nama, NIP, departemen, telepon..."
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#407BA7]"
          />
        </div>
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-[#407BA7] text-white rounded-lg hover:bg-[#356a8f] transition"
        >
          Cari
        </button>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
        >
          <Filter size={16} />
          Filter
          {statusFilter !== 'all' && <span className="w-2 h-2 bg-[#407BA7] rounded-full" />}
        </button>
        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Filter Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-lg shadow-sm p-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#407BA7]"
                >
                  <option value="all">Semua</option>
                  <option value="active">Aktif</option>
                  <option value="inactive">Nonaktif</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="text-sm text-red-500 hover:text-red-600 transition flex items-center gap-1"
                >
                  <X size={14} /> Hapus Filter
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <div className="bg-[#407BA7]/10 rounded-lg p-3 flex items-center justify-between">
          <span className="text-sm text-[#407BA7] font-medium">{selectedIds.length} karyawan dipilih</span>
          <div className="flex gap-2">
            <button
              onClick={() => handleBulkAction('activate')}
              className="px-3 py-1 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
            >
              Aktifkan
            </button>
            <button
              onClick={() => handleBulkAction('deactivate')}
              className="px-3 py-1 text-sm bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
            >
              Nonaktifkan
            </button>
            <button
              onClick={() => handleBulkAction('delete')}
              className="px-3 py-1 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            >
              Hapus
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left">
                  <button onClick={toggleSelectAll} className="text-gray-500">
                    {selectedIds.length === employees.length && employees.length > 0 ? (
                      <CheckSquare size={18} className="text-[#407BA7]" />
                    ) : (
                      <Square size={18} />
                    )}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">NIP</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Departemen</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Telepon</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {employees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                    Belum ada data karyawan
                  </td>
                </tr>
              ) : (
                employees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3">
                      <button onClick={() => toggleSelect(employee.id)}>
                        {selectedIds.includes(employee.id) ? (
                          <CheckSquare size={18} className="text-[#407BA7]" />
                        ) : (
                          <Square size={18} className="text-gray-400" />
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{employee.nip || '-'}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">{employee.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{employee.department}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{employee.phone || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        employee.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {employee.is_active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(employee)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 transition"
                          title="Edit"
                        >
                          <Edit size={16} className="text-blue-500" />
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(employee)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 transition"
                          title="Hapus"
                        >
                          <Trash2 size={16} className="text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
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

      {/* Modal Add/Edit */}
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
              className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-800">
                  {modalMode === 'add' ? 'Tambah Karyawan' : 'Edit Karyawan'}
                </h3>
                <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-gray-100">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">NIP</label>
                  <input
                    type="text"
                    value={formData.nip}
                    onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                    placeholder="Opsional"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#407BA7]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#407BA7]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Departemen *</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#407BA7]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telepon</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Opsional"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#407BA7]"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="rounded border-gray-300 text-[#407BA7] focus:ring-[#407BA7]"
                    />
                    <span className="text-sm text-gray-700">Aktif</span>
                  </label>
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
                  <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                    Batal
                  </button>
                  <button type="submit" disabled={actionLoading} className="px-4 py-2 bg-[#800016] text-white rounded-lg hover:bg-[#A0001C] transition disabled:opacity-50">
                    {actionLoading ? 'Memproses...' : modalMode === 'add' ? 'Tambah' : 'Simpan'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Import */}
      <AnimatePresence>
        {showImportModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowImportModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-800">Import Karyawan</h3>
                <button onClick={() => setShowImportModal(false)} className="p-1 rounded-lg hover:bg-gray-100">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Upload file Excel (.xlsx) dengan kolom: <strong>Nama, Departemen, NIP, Telepon</strong>
                </p>
                <button
                  onClick={downloadTemplate}
                  className="text-sm text-[#407BA7] hover:underline flex items-center gap-1"
                >
                  <Download size={14} /> Download Template CSV
                </button>
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                  className="w-full"
                />
                {importFile && (
                  <p className="text-sm text-green-600">File: {importFile.name}</p>
                )}
                <div className="flex gap-3 justify-end pt-4">
                  <button onClick={() => setShowImportModal(false)} className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                    Batal
                  </button>
                  <button onClick={handleImport} disabled={importLoading} className="px-4 py-2 bg-[#800016] text-white rounded-lg hover:bg-[#A0001C] transition disabled:opacity-50">
                    {importLoading ? 'Memproses...' : 'Import'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Delete Confirm */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowDeleteConfirm(null)}
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
                <h3 className="text-lg font-semibold text-gray-800">Hapus Karyawan?</h3>
              </div>
              <p className="text-gray-600 mb-6">
                Apakah Anda yakin ingin menghapus karyawan &quot;{showDeleteConfirm.name}&quot;?
                <br />
                <span className="text-red-500 text-sm">Tindakan ini tidak dapat dibatalkan!</span>
              </p>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setShowDeleteConfirm(null)} className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                  Batal
                </button>
                <button onClick={() => handleDelete(showDeleteConfirm)} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                  Hapus
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}