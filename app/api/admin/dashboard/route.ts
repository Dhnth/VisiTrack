import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { auth } from '@/lib/auth';

interface DashboardStats {
  total_guests_today: number;
  total_guests_this_month: number;
  total_guests_last_month: number;
  total_pending: number;
  total_active: number;
  total_employees: number;
  active_visits: number;
  guest_growth: number;
}

interface Guest {
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

interface TopEmployee {
  id: number;
  name: string;
  department: string;
  total_visits: number;
}

interface HourlyActivity {
  hour: number;
  total: number;
}

interface RecentActivity {
  id: number;
  action: string;
  description: string;
  user_name: string;
  created_at: string;
}

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get user and instance
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
  const chartRange = searchParams.get('chartRange') || '7d';

  // 1. Main Statistics
  const statsRes = await query(`
    SELECT 
      (SELECT COUNT(*) FROM guests WHERE instance_id = ? AND DATE(created_at) = CURDATE()) as total_guests_today,
      (SELECT COUNT(*) FROM guests WHERE instance_id = ? AND MONTH(created_at) = MONTH(CURDATE()) AND YEAR(created_at) = YEAR(CURDATE())) as total_guests_this_month,
      (SELECT COUNT(*) FROM guests WHERE instance_id = ? AND MONTH(created_at) = MONTH(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)) AND YEAR(created_at) = YEAR(DATE_SUB(CURDATE(), INTERVAL 1 MONTH))) as total_guests_last_month,
      (SELECT COUNT(*) FROM guests WHERE instance_id = ? AND status = 'pending') as total_pending,
      (SELECT COUNT(*) FROM guests WHERE instance_id = ? AND status = 'active') as total_active,
      (SELECT COUNT(*) FROM employees WHERE instance_id = ? AND is_active = 1) as total_employees,
      (SELECT COUNT(*) FROM guests WHERE instance_id = ? AND status = 'active') as active_visits
  `, [instanceId, instanceId, instanceId, instanceId, instanceId, instanceId, instanceId]) as DashboardStats[];

  const stats = statsRes[0];

  // Hitung growth
  const guestGrowth = stats.total_guests_last_month > 0 
    ? ((stats.total_guests_this_month - stats.total_guests_last_month) / stats.total_guests_last_month) * 100 
    : 0;

  // 2. Chart Data
  let limit = 7;
  let dateFormat = '%d %b';
  if (chartRange === '30d') { limit = 30; dateFormat = '%d %b'; }
  if (chartRange === '12m') { limit = 12; dateFormat = '%b %Y'; }

  const chartData = await query(`
    SELECT 
      DATE_FORMAT(created_at, '${chartRange === '12m' ? '%b %Y' : dateFormat}') as period,
      COUNT(*) as total
    FROM guests
    WHERE instance_id = ? AND created_at >= ${chartRange === '12m' ? 'DATE_SUB(NOW(), INTERVAL 12 MONTH)' : 'DATE_SUB(NOW(), INTERVAL 30 DAY)'}
    GROUP BY ${chartRange === '12m' ? 'MONTH(created_at), YEAR(created_at)' : 'DATE(created_at)'}
    ORDER BY created_at ASC
  `, [instanceId]) as ChartData[];

  // 3. Top 5 Karyawan Paling Sering Dikunjungi
  const topEmployees = await query(`
    SELECT 
      e.id,
      e.name,
      e.department,
      COUNT(g.id) as total_visits
    FROM employees e
    LEFT JOIN guests g ON g.employee_id = e.id AND g.instance_id = ?
    WHERE e.instance_id = ? AND e.is_active = 1
    GROUP BY e.id
    ORDER BY total_visits DESC
    LIMIT 5
  `, [instanceId, instanceId]) as TopEmployee[];

  // 4. Aktivitas per Jam (Jam Sibuk)
  const hourlyActivity = await query(`
    SELECT 
      HOUR(created_at) as hour,
      COUNT(*) as total
    FROM guests
    WHERE instance_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    GROUP BY HOUR(created_at)
    ORDER BY hour ASC
  `, [instanceId]) as HourlyActivity[];

  // 5. Tamu Pending
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
  `, [instanceId]) as Guest[];

  // 6. Tamu Active
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
  `, [instanceId]) as Guest[];

  // 7. Aktivitas Terbaru (5 terakhir)
  const recentActivities = await query(`
    SELECT 
      al.id,
      al.action,
      al.description,
      u.name as user_name,
      al.created_at
    FROM activity_logs al
    LEFT JOIN users u ON al.user_id = u.id
    WHERE al.instance_id = ?
    ORDER BY al.created_at DESC
    LIMIT 5
  `, [instanceId]) as RecentActivity[];

  return NextResponse.json({
    success: true,
    stats: {
      ...stats,
      guest_growth: Math.round(guestGrowth * 10) / 10,
    },
    chartData,
    topEmployees,
    hourlyActivity,
    pendingGuests,
    activeGuests,
    recentActivities,
    chartRange
  });
}