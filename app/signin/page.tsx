'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SignInPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const res = await fetch('/api/auth/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error)
      setLoading(false)
      return
    }

    // Simpan user ke localStorage atau session (sementara)
    localStorage.setItem('user', JSON.stringify(data.user))

    // Redirect berdasarkan role
    if (data.user.role === 'super_admin') {
      router.push('/superadmin')
    } else {
      router.push(`/${data.user.slug}/${data.user.role}`)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#00043A]">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#800016]">VisiTrack</h1>
          <p className="text-gray-600 mt-2">Sistem Manajemen Kunjungan</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#800016]"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#800016]"
              required
            />
          </div>

          {error && (
            <div className="mb-4 text-red-600 text-center">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#800016] text-white py-2 rounded-lg hover:bg-[#A0001C] transition disabled:opacity-50"
          >
            {loading ? 'Memproses...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-gray-500 text-sm mt-6">
          Demo: gunakan email dan password <strong>password123</strong>
        </p>
      </div>
    </div>
  )
}