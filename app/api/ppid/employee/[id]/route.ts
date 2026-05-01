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

interface EmployeeDetail {
  id: number;
  name: string;
  nip: string | null;
  department: string;
  phone: string | null;
  is_active: boolean;
  total_visits: number;
}

interface GuestVisit {
  id: number;
  name: string;
  nik: string | null;
  institution: string | null;
  purpose: string;
  status: string;
  check_in_at: string | null;
  check_out_at: string | null;
  created_at: string;
  photo_url: string | null;
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'ppid') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const resolvedParams = await params;
    const employeeId = parseInt(resolvedParams.id);
    
    if (isNaN(employeeId)) {
      return NextResponse.json({ error: 'Invalid employee ID' }, { status: 400 });
    }

    const instanceId = currentUser.instance_id;

    // Get employee detail
    const employees = await query(
      `SELECT 
        e.id,
        e.name,
        e.nip,
        e.department,
        e.phone,
        e.is_active,
        COUNT(g.id) as total_visits
      FROM employees e
      LEFT JOIN guests g ON g.employee_id = e.id AND g.status IN ('done', 'active')
      WHERE e.id = ? AND e.instance_id = ?
      GROUP BY e.id`,
      [employeeId, instanceId]
    ) as EmployeeDetail[];

    if (employees.length === 0) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    // Get guest visits
    const guests = await query(
      `SELECT 
        g.id,
        g.name,
        g.nik,
        g.institution,
        g.purpose,
        g.status,
        g.check_in_at,
        g.check_out_at,
        g.created_at,
        g.photo_url
      FROM guests g
      WHERE g.employee_id = ? AND g.instance_id = ? AND g.status IN ('done', 'active')
      ORDER BY g.created_at DESC`,
      [employeeId, instanceId]
    ) as GuestVisit[];

    return NextResponse.json({
      success: true,
      employee: employees[0],
      guests,
    });
  } catch (error) {
    console.error('Employee Detail API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}