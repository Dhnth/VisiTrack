import { query } from '@/lib/db'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

type UserWithSlug = {
  id: number
  name: string
  email: string
  password: string
  role: string
  instance_id: number | null
  slug: string | null
}

export async function POST(request: Request) {
  const { email, password } = await request.json()

  if (!email || !password) {
    return NextResponse.json({ error: 'Email dan password wajib diisi' }, { status: 400 })
  }

  // Cari user berdasarkan email
  const users = await query(
    `SELECT u.*, i.slug 
     FROM users u 
     LEFT JOIN instances i ON u.instance_id = i.id 
     WHERE u.email = ?`,
    [email]
  )

  const user = (users as UserWithSlug[])[0]

  if (!user) {
    return NextResponse.json({ error: 'Email atau password salah' }, { status: 401 })
  }

  // Cek password
  const passwordMatch = await bcrypt.compare(password, user.password)

  if (!passwordMatch) {
    return NextResponse.json({ error: 'Email atau password salah' }, { status: 401 })
  }

  // Return data user (tanpa password)
  return NextResponse.json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      instance_id: user.instance_id,
      slug: user.slug,
    },
  })
}