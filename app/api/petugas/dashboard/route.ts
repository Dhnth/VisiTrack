import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { auth } from '@/lib/auth';

interface User {
  id: number;
  instance_id: number;
  role: string;
  name: string;
  email: string;
}

interface PendingGuest {
  id: number;
  name: string;
  institution: string | null;
  purpose: string;
  photo_url: string | null;
  created_at: string;
  employee_name: string | null;
  employee_department: string | null;
}

interface ActiveGuest {
  id: number;
  name: string;
  institution: string | null;
  purpose: string;
  photo_url: string | null;
  check_in_at: string;
  employee_name: string | null;
  employee_department: string | null;
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

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'petugas') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const instanceId = currentUser.instance_id;

    // Get pending list
    const pendingList = await query(
      `SELECT 
        g.id,
        g.name,
        g.institution,
        g.purpose,
        g.photo_url,
        g.created_at,
        e.name as employee_name,
        e.department as employee_department
      FROM guests g
      LEFT JOIN employees e ON g.employee_id = e.id
      WHERE g.instance_id = ? AND g.status = 'pending'
      ORDER BY g.created_at ASC
      LIMIT 20`,
      [instanceId]
    ) as PendingGuest[];

    // Get active list
    const activeList = await query(
      `SELECT 
        g.id,
        g.name,
        g.institution,
        g.purpose,
        g.photo_url,
        g.check_in_at,
        e.name as employee_name,
        e.department as employee_department
      FROM guests g
      LEFT JOIN employees e ON g.employee_id = e.id
      WHERE g.instance_id = ? AND g.status = 'active'
      ORDER BY g.check_in_at ASC
      LIMIT 20`,
      [instanceId]
    ) as ActiveGuest[];

    // Get today's count
    const todayResult = await query(
      `SELECT COUNT(*) as total
      FROM guests
      WHERE instance_id = ? AND DATE(created_at) = CURDATE()`,
      [instanceId]
    ) as { total: number }[];

    const pendingCount = pendingList.length;
    const activeCount = activeList.length;
    const todayCount = todayResult[0]?.total || 0;

    return NextResponse.json({
      success: true,
      pending: pendingList,
      pending_count: pendingCount,
      active: activeList,
      active_count: activeCount,
      today_count: todayCount,
    });
  } catch (error) {
    console.error('Dashboard API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}