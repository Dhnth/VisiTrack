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

interface RecentVisit {
  id: number;
  name: string;
  nik: string | null;
  institution: string | null;
  purpose: string;
  status: string;
  created_at: string;
  employee_name: string | null;
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
    const limit = parseInt(searchParams.get('limit') || '10');

    const instanceId = currentUser.instance_id;

    const visits = await query(
      `SELECT 
        g.id,
        g.name,
        g.nik,
        g.institution,
        g.purpose,
        g.status,
        g.created_at,
        e.name as employee_name
      FROM guests g
      LEFT JOIN employees e ON g.employee_id = e.id
      WHERE g.instance_id = ? AND g.status IN ('active', 'done')
      ORDER BY g.created_at DESC
      LIMIT ?`,
      [instanceId, limit]
    ) as RecentVisit[];

    return NextResponse.json({
      success: true,
      visits,
    });
  } catch (error) {
    console.error('Recent Visits API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}