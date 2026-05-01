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

interface EmployeeRank {
  id: number;
  name: string;
  department: string;
  visit_count: number;
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
    const period = searchParams.get('period') || 'month';

    const instanceId = currentUser.instance_id;

    let dateCondition = '';
    if (period === 'week') {
      dateCondition = 'AND DATE(g.created_at) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)';
    } else if (period === 'month') {
      dateCondition = 'AND MONTH(g.created_at) = MONTH(CURDATE()) AND YEAR(g.created_at) = YEAR(CURDATE())';
    } else if (period === 'year') {
      dateCondition = 'AND YEAR(g.created_at) = YEAR(CURDATE())';
    }

    const employees = await query(
      `SELECT 
        e.id,
        e.name,
        e.department,
        COUNT(g.id) as visit_count
      FROM employees e
      LEFT JOIN guests g ON g.employee_id = e.id AND g.status IN ('done', 'active') ${dateCondition}
      WHERE e.instance_id = ? AND e.is_active = true
      GROUP BY e.id, e.name, e.department
      ORDER BY visit_count DESC
      LIMIT 10`,
      [instanceId]
    ) as EmployeeRank[];

    return NextResponse.json({
      success: true,
      employees,
      period,
    });
  } catch (error) {
    console.error('Top Employees API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}