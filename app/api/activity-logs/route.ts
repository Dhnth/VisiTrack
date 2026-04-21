import { query } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import type { ActivityLogWithUser } from '@/types'

type UserSession = {
  id: number
  role: string
  instance_id: number | null
}

export async function GET(request: NextRequest) {
  const session = await auth()

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const searchParams = request.nextUrl.searchParams
  const limitParam = searchParams.get('limit')
  const limit = limitParam ? Number(limitParam) : 50

  if (Number.isNaN(limit) || limit <= 0) {
    return NextResponse.json({ error: 'Invalid limit' }, { status: 400 })
  }

  // ==================
  // GET CURRENT USER
  // ==================
  const userResult = await query(
    'SELECT id, role, instance_id FROM users WHERE email = ?',
    [session.user.email]
  )

  const currentUser = (userResult as UserSession[])[0]

  if (!currentUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  let sqlQuery = ''
  const queryParams: Array<string | number> = []

  // ==================
  // ROLE: SUPER ADMIN
  // ==================
  if (currentUser.role === 'super_admin') {
    sqlQuery = `
      SELECT 
        al.*, 
        u.name AS user_name, 
        u.email AS user_email, 
        u.role AS user_role
      FROM activity_logs al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE u.role = 'super_admin'
      ORDER BY al.created_at DESC
      LIMIT ?
    `

    queryParams.push(limit)
  }

  // ==================
  // ROLE: ADMIN
  // ==================
  else if (currentUser.role === 'admin') {
    if (!currentUser.instance_id) {
      return NextResponse.json({ error: 'Instance not found' }, { status: 404 })
    }

    sqlQuery = `
      SELECT 
        al.*, 
        u.name AS user_name, 
        u.email AS user_email, 
        u.role AS user_role
      FROM activity_logs al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE al.instance_id = ? 
        AND u.role != 'super_admin'
      ORDER BY al.created_at DESC
      LIMIT ?
    `

    queryParams.push(currentUser.instance_id, limit)
  }

  // ==================
  // ROLE: FORBIDDEN
  // ==================
  else {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // ==================
  // EXECUTE QUERY
  // ==================
  const logsResult = await query(sqlQuery, queryParams)

  const logs = logsResult as ActivityLogWithUser[]

  return NextResponse.json({ logs })
}