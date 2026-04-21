import { query } from '@/lib/db'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import type { User, SignInResponse } from '@/types'

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
    return NextResponse.json(
      { error: 'Email dan password wajib diisi' },
      { status: 400 }
    )
  }

  // Get user from database
  const users = await query(
    `SELECT u.*, i.slug 
     FROM users u 
     LEFT JOIN instances i ON u.instance_id = i.id 
     WHERE u.email = ?`,
    [email]
  )

  const user = (users as UserWithSlug[])[0]

  if (!user) {
    return NextResponse.json(
      { error: 'Email atau password salah' },
      { status: 401 }
    )
  }

  // Verify password
  const passwordMatch = await bcrypt.compare(password, user.password)

  if (!passwordMatch) {
    return NextResponse.json(
      { error: 'Email atau password salah' },
      { status: 401 }
    )
  }

  // Get IP address and user agent
  const ipAddress = request.headers.get('x-forwarded-for') || 'unknown'
  const userAgent = request.headers.get('user-agent') || 'unknown'

  // Insert activity log
  await query(
    `INSERT INTO activity_logs 
     (instance_id, user_id, action, description, ip_address, user_agent, created_at) 
     VALUES (?, ?, 'LOGIN', ?, ?, ?, NOW())`,
    [
      user.instance_id,
      user.id,
      `User ${user.name} logged in successfully`,
      ipAddress,
      userAgent
    ]
  )

  // Return user data (without password)
  const responseData: SignInResponse = {
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as User['role'],
      instance_id: user.instance_id,
      slug: user.slug,
    },
  }

  return NextResponse.json(responseData)
}