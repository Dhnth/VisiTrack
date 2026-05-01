import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { auth } from '@/lib/auth';

interface User {
  id: number;
  instance_id: number;
  role: string;
  name: string;
  email: string;
}

interface HistoryGuest {
  id: number;
  name: string;
  nik: string | null;
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

async function getCurrentUser(): Promise<User | null> {
  const session = await auth();
  if (!session?.user?.email) return null;
  
  const users = await query(
    'SELECT id, instance_id, role, name, email FROM users WHERE email = ?',
    [session.user.email]
  ) as User[];
  
  return users[0] || null;
}

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'ppid') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';

    const offset = (page - 1) * limit;
    const instanceId = currentUser.instance_id;
    
    // Ambil setting checkout
    const settings = await query(
      'SELECT enable_checkout FROM settings WHERE instance_id = ? LIMIT 1',
      [instanceId]
    ) as { enable_checkout: number }[];
    const enableCheckout = settings[0]?.enable_checkout === 1;

    let whereClause = 'WHERE g.instance_id = ?';
    const params: (string | number)[] = [instanceId];

    if (search) {
      whereClause += ' AND (g.name LIKE ? OR g.institution LIKE ? OR g.purpose LIKE ? OR e.name LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (status !== 'all') {
      whereClause += ' AND g.status = ?';
      params.push(status);
    }

    if (startDate) {
      whereClause += ' AND DATE(g.created_at) >= ?';
      params.push(startDate);
    }

    if (endDate) {
      whereClause += ' AND DATE(g.created_at) <= ?';
      params.push(endDate);
    }

    const countQuery = `
      SELECT COUNT(*) as total
      FROM guests g
      LEFT JOIN employees e ON g.employee_id = e.id
      ${whereClause}
    `;
    const countResult = await query(countQuery, params) as { total: number }[];
    const total = countResult[0]?.total || 0;

    const dataQuery = `
      SELECT 
        g.id,
        g.name,
        g.nik,
        g.institution,
        g.purpose,
        g.status,
        g.photo_url,
        g.check_in_at,
        g.check_out_at,
        g.created_at,
        e.name as employee_name,
        e.department as employee_department,
        u.name as validated_by
      FROM guests g
      LEFT JOIN employees e ON g.employee_id = e.id
      LEFT JOIN users u ON g.created_by = u.id
      ${whereClause}
      ORDER BY g.created_at DESC
      LIMIT ? OFFSET ?
    `;
    const guests = await query(dataQuery, [...params, limit, offset]) as HistoryGuest[];

    return NextResponse.json({
      success: true,
      guests,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      enable_checkout: enableCheckout,
    });
  } catch (error) {
    console.error('PPID History API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}