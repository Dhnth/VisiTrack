'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import {
  Activity, Clock, User, Mail, LogIn, LogOut,
  Database, Edit, Trash2, Search, Filter,
  X, ChevronLeft, ChevronRight, RefreshCw
} from 'lucide-react';

interface ActivityLog {
  id: number;
  action: string;
  description: string | null;
  ip_address: string | null;
  created_at: string;
  user_name: string | null;
  user_email: string | null;
  user_role: string | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const actionIcons: Record<string, React.ReactNode> = {
  LOGIN: <LogIn className="size-4 text-green-500" />,
  LOGOUT: <LogOut className="size-4 text-red-500" />,
  INSERT: <Database className="size-4 text-blue-500" />,
  UPDATE: <Edit className="size-4 text-yellow-500" />,
  DELETE: <Trash2 className="size-4 text-red-500" />,
};

const actionColors: Record<string, string> = {
  LOGIN: 'bg-green-100 text-green-700',
  LOGOUT: 'bg-red-100 text-red-700',
  INSERT: 'bg-blue-100 text-blue-700',
  UPDATE: 'bg-yellow-100 text-yellow-700',
  DELETE: 'bg-red-100 text-red-700',
};

const actionOptions = [
  { value: '', label: 'Semua Aksi' },
  { value: 'LOGIN', label: 'Login' },
  { value: 'LOGOUT', label: 'Logout' },
  { value: 'INSERT', label: 'Tambah Data' },
  { value: 'UPDATE', label: 'Update Data' },
  { value: 'DELETE', label: 'Hapus Data' },
];

export default function AdminActivityLogsPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedAction, setSelectedAction] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  // Live search with debounce
  useEffect(() => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    debounceTimeout.current = setTimeout(() => {
      setSearch(searchInput);
      setPagination(prev => ({ ...prev, page: 1 }));
    }, 500);
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [searchInput]);

  // Reset page when filters change
  const handleFilterChange = (callback: () => void) => {
    callback();
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // FETCH DATA
  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      const urlParams = new URLSearchParams();
      urlParams.append('page', pagination.page.toString());
      urlParams.append('limit', '20');
      if (search) urlParams.append('search', search);
      if (startDate) urlParams.append('startDate', startDate);
      if (endDate) urlParams.append('endDate', endDate);
      if (selectedAction) urlParams.append('action', selectedAction);

      const res = await fetch(`/api/activity-logs?${urlParams.toString()}`);
      const data = await res.json();

      if (data.success) {
        setLogs(data.logs);
        setPagination(data.pagination);
      }
      setLoading(false);
    };
    fetchLogs();
  }, [pagination.page, search, startDate, endDate, selectedAction]);

  const clearFilters = () => {
    setSearchInput('');
    setSearch('');
    setStartDate('');
    setEndDate('');
    setSelectedAction('');
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page }));
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'medium',
    }).format(date);
  };

  const getActionBadge = (action: string) => {
    const colorClass = actionColors[action] || 'bg-gray-100 text-gray-700';
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
        {action}
      </span>
    );
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
          <div className="flex items-center gap-3 mb-2">
            <Activity className="size-7 text-[#407BA7]" />
            <h1 className="text-2xl font-bold text-gray-800">Activity Logs</h1>
          </div>
          <p className="text-gray-500 text-sm">
            Log aktivitas untuk instansi {slug}
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input - Live Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Cari berdasarkan nama, email, deskripsi... (live search)"
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#407BA7]"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
          >
            <Filter size={16} />
            Filter
            {(startDate || endDate || selectedAction) && (
              <span className="w-2 h-2 bg-[#407BA7] rounded-full" />
            )}
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
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Dari Tanggal
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#407BA7]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Sampai Tanggal
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#407BA7]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Aksi
              </label>
              <select
                value={selectedAction}
                onChange={(e) => {
                  setSelectedAction(e.target.value);
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#407BA7]"
              >
                {actionOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            {(startDate || endDate || selectedAction) && (
              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 text-sm text-red-500 hover:text-red-600 transition"
                >
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
          <Clock className="size-4 text-gray-400" />
          <span className="text-sm text-gray-500">
            Total logs: {pagination.total} • Halaman {pagination.page} dari {pagination.totalPages}
          </span>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">Tidak ada activity logs</td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(log.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1">
                          <User className="size-3 text-gray-400" />
                          <span className="text-sm font-medium text-gray-800">{log.user_name || 'System'}</span>
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Mail className="size-3 text-gray-400" />
                          <span className="text-xs text-gray-500">{log.user_email || '-'}</span>
                        </div>
                        <span className="text-xs text-gray-400 mt-0.5 capitalize">{log.user_role || '-'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {actionIcons[log.action] || null}
                        {getActionBadge(log.action)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-md">{log.description || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 font-mono">
                      {log.ip_address === '::1' ? '127.0.0.1' : (log.ip_address || '-')}
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
          <button onClick={() => goToPage(pagination.page - 1)} disabled={pagination.page === 1} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition disabled:opacity-50">
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
                <button key={pageNum} onClick={() => goToPage(pageNum)} className={`w-8 h-8 rounded-lg text-sm transition ${pagination.page === pageNum ? 'bg-[#407BA7] text-white' : 'border border-gray-200 hover:bg-gray-50'}`}>
                  {pageNum}
                </button>
              );
            })}
          </div>
          <button onClick={() => goToPage(pagination.page + 1)} disabled={pagination.page === pagination.totalPages} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition">
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}