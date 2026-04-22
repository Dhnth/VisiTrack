import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { auth } from '@/lib/auth';

interface DashboardStats {
  total_guests_today: number;
  total_pending: number;
  total_active: number;
  total_employees: number;
  total_guests_this_month: number;
  pending_percent: number;
  active_percent: number;
  done_percent: number;
  rejected_percent: number;
}

interface RecentGuest {
  id: number;
  name: string;
  institution: string | null;
  purpose: string;
  status: string;
  photo_url: string;
  check_in_at: string | null;
  created_at: string;
  employee_name: string;
  employee_department: string;
}

interface ChartData {
  period: string;
  total: number;
}

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Ambil user dan instance_id
  const users = await query(
    'SELECT id, instance_id, role FROM users WHERE email = ?',
    [session.user.email]
  ) as { id: number; instance_id: number; role: string }[];

  const user = users[0];
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const instanceId = user.instance_id;
  const { searchParams } = new URL(request.url);
  const period = searchParams.get('period') || 'week';

  // 1. Statistik Dashboard
  const statsRes = await query(`
    SELECT 
      (SELECT COUNT(*) FROM guests WHERE instance_id = ? AND DATE(created_at) = CURDATE()) as total_guests_today,
      (SELECT COUNT(*) FROM guests WHERE instance_id = ? AND status = 'pending') as total_pending,
      (SELECT COUNT(*) FROM guests WHERE instance_id = ? AND status = 'active') as total_active,
      (SELECT COUNT(*) FROM employees WHERE instance_id = ? AND is_active = 1) as total_employees,
      (SELECT COUNT(*) FROM guests WHERE instance_id = ? AND MONTH(created_at) = MONTH(CURDATE()) AND YEAR(created_at) = YEAR(CURDATE())) as total_guests_this_month
  `, [instanceId, instanceId, instanceId, instanceId, instanceId]) as DashboardStats[];

  const stats = statsRes[0];

  // Hitung persentase status (untuk pie chart)
  const statusCounts = await query(`
    SELECT 
      status,
      COUNT(*) as total
    FROM guests
    WHERE instance_id = ?
    GROUP BY status
  `, [instanceId]) as { status: string; total: number }[];

  let pendingPercent = 0, activePercent = 0, donePercent = 0, rejectedPercent = 0;
  const totalStatus = statusCounts.reduce((sum, s) => sum + s.total, 0);
  if (totalStatus > 0) {
    for (const s of statusCounts) {
      if (s.status === 'pending') pendingPercent = Math.round((s.total / totalStatus) * 100);
      if (s.status === 'active') activePercent = Math.round((s.total / totalStatus) * 100);
      if (s.status === 'done') donePercent = Math.round((s.total / totalStatus) * 100);
      if (s.status === 'rejected') rejectedPercent = Math.round((s.total / totalStatus) * 100);
    }
  }

  // 2. Tamu Pending (untuk divalidasi)
  const pendingGuests = await query(`
    SELECT 
      g.id, g.name, g.institution, g.purpose, g.status, g.photo_url, 
      g.check_in_at, g.created_at,
      e.name as employee_name, e.department as employee_department
    FROM guests g
    LEFT JOIN employees e ON g.employee_id = e.id
    WHERE g.instance_id = ? AND g.status = 'pending'
    ORDER BY g.created_at ASC
    LIMIT 10
  `, [instanceId]) as RecentGuest[];

  // 3. Tamu Active (sedang berkunjung)
  const activeGuests = await query(`
    SELECT 
      g.id, g.name, g.institution, g.purpose, g.status, g.photo_url, 
      g.check_in_at, g.created_at,
      e.name as employee_name, e.department as employee_department
    FROM guests g
    LEFT JOIN employees e ON g.employee_id = e.id
    WHERE g.instance_id = ? AND g.status = 'active'
    ORDER BY g.check_in_at DESC
    LIMIT 10
  `, [instanceId]) as RecentGuest[];

  // 4. Chart Data (tren kunjungan)
  let groupBy = 'DATE(created_at)';
  let limit = 7;
  if (period === 'week') { groupBy = 'DATE(created_at)'; limit = 7; }
  if (period === 'month') { groupBy = 'WEEK(created_at)'; limit = 4; }
  if (period === 'year') { groupBy = 'MONTH(created_at)'; limit = 12; }

  const chartRes = await query(`
    SELECT 
      DATE_FORMAT(created_at, '%d %b') as period,
      COUNT(*) as total
    FROM guests
    WHERE instance_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL ${limit} DAY)
    GROUP BY DATE(created_at)
    ORDER BY period ASC
  `, [instanceId]) as ChartData[];

  return NextResponse.json({
    success: true,
    stats: {
      ...stats,
      pending_percent: pendingPercent,
      active_percent: activePercent,
      done_percent: donePercent,
      rejected_percent: rejectedPercent,
    },
    pendingGuests,
    activeGuests,
    chart: chartRes,
    period
  });
}