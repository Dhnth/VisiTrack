'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Activity, Clock, User, Mail, LogIn, LogOut, Database, Edit, Trash2 } from 'lucide-react'
import type { ActivityLogWithUser } from '@/types'

const actionIcons = {
  LOGIN: <LogIn className="size-4 text-green-500" />,
  LOGOUT: <LogOut className="size-4 text-red-500" />,
  INSERT: <Database className="size-4 text-blue-500" />,
  UPDATE: <Edit className="size-4 text-yellow-500" />,
  DELETE: <Trash2 className="size-4 text-red-500" />,
}

const actionColors = {
  LOGIN: 'bg-green-100 text-green-700',
  LOGOUT: 'bg-red-100 text-red-700',
  INSERT: 'bg-blue-100 text-blue-700',
  UPDATE: 'bg-yellow-100 text-yellow-700',
  DELETE: 'bg-red-100 text-red-700',
}

export default function ActivityLogsPage() {
  const { status } = useSession()
  const router = useRouter()
  const [logs, setLogs] = useState<ActivityLogWithUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin')
      return
    }

    if (status === 'authenticated') {
      fetchLogs()
    }
  }, [status, router])

  const fetchLogs = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/activity-logs?limit=100')
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to fetch logs')
        return
      }

      setLogs(data.logs)
    } catch {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'medium',
    }).format(date)
  }

  const getActionBadge = (action: string) => {
    const colorClass = actionColors[action as keyof typeof actionColors] || 'bg-gray-100 text-gray-700'
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
        {action}
      </span>
    )
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#407BA7]"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 text-center">
          <p className="text-lg font-semibold">Error</p>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="size-8 text-[#407BA7]" />
            <h1 className="text-3xl font-bold text-gray-800">Activity Logs</h1>
          </div>
          <p className="text-gray-500">
            Track all user activities across the system
          </p>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="size-4 text-gray-400" />
              <span className="text-sm text-gray-500">
                Total logs: {logs.length}
              </span>
            </div>
            <button
              onClick={fetchLogs}
              className="text-sm text-[#407BA7] hover:underline"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IP Address
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      No activity logs found
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(log.created_at as unknown as string)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1">
                            <User className="size-3 text-gray-400" />
                            <span className="text-sm font-medium text-gray-800">
                              {log.user_name || 'Unknown'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 mt-0.5">
                            <Mail className="size-3 text-gray-400" />
                            <span className="text-xs text-gray-500">
                              {log.user_email || '-'}
                            </span>
                          </div>
                          <span className="text-xs text-gray-400 mt-0.5 capitalize">
                            {log.user_role || '-'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {actionIcons[log.action as keyof typeof actionIcons]}
                          {getActionBadge(log.action)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {log.description || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 font-mono">
                        {log.ip_address || '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}