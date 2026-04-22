import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { auth } from '@/lib/auth';

interface DashboardStats {
  total_instances: number;
  active_instances: number;
  expired_instances: number;
  trial_instances: number;
  total_admins: number;
  total_petugas: number;
  total_ppid: number;
  total_employees: number;
  total_guests_all_time: number;
  total_guests_today: number;
  total_guests_this_month: number;
  total_guests_last_month: number;
  active_visits: number;
  pending_approvals: number;
  revenue_mrr: number;
  revenue_last_month: number;
  guest_growth: number;
  revenue_growth: number;
}

interface TopInstance {
  id: number;
  name: string;
  slug: string;
  total_visits: number;
  growth: number;
}

interface FastestGrowingInstance {
  id: number;
  name: string;
  slug: string;
  current_month: number;
  last_month: number;
  growth_percent: number;
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
  user_email: string;
  user_role: string;
  created_at: string;
}

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userCheck = await query(
    'SELECT role FROM users WHERE email = ?',
    [session.user.email]
  ) as { role: string }[];
  
  if (!userCheck[0] || userCheck[0].role !== 'super_admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const chartRange = searchParams.get('chartRange') || '7d';

  // 1. Main Statistics
  const statsRes = await query(`
    SELECT 
      (SELECT COUNT(*) FROM instances) as total_instances,
      (SELECT COUNT(*) FROM instances WHERE subscription_status = 'active') as active_instances,
      (SELECT COUNT(*) FROM instances WHERE subscription_status = 'expired') as expired_instances,
      (SELECT COUNT(*) FROM instances WHERE subscription_status = 'trial') as trial_instances,
      (SELECT COUNT(*) FROM users WHERE role = 'admin') as total_admins,
      (SELECT COUNT(*) FROM users WHERE role = 'petugas') as total_petugas,
      (SELECT COUNT(*) FROM users WHERE role = 'ppid') as total_ppid,
      (SELECT COUNT(*) FROM employees) as total_employees,
      (SELECT COUNT(*) FROM guests) as total_guests_all_time,
      (SELECT COUNT(*) FROM guests WHERE DATE(created_at) = CURDATE()) as total_guests_today,
      (SELECT COUNT(*) FROM guests WHERE MONTH(created_at) = MONTH(CURDATE()) AND YEAR(created_at) = YEAR(CURDATE())) as total_guests_this_month,
      (SELECT COUNT(*) FROM guests WHERE MONTH(created_at) = MONTH(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)) AND YEAR(created_at) = YEAR(DATE_SUB(CURDATE(), INTERVAL 1 MONTH))) as total_guests_last_month,
      (SELECT COUNT(*) FROM guests WHERE status = 'active') as active_visits,
      (SELECT COUNT(*) FROM guests WHERE status = 'pending') as pending_approvals,
      (SELECT SUM(50000) FROM instances WHERE subscription_status = 'active') as revenue_mrr,
      (SELECT SUM(50000) FROM instances WHERE subscription_status = 'active' AND created_at < DATE_SUB(CURDATE(), INTERVAL 1 MONTH)) as revenue_last_month
  `) as DashboardStats[];

  const stats = statsRes[0];

  // Hitung persentase perubahan
  const guestGrowth = stats.total_guests_last_month > 0 
    ? ((stats.total_guests_this_month - stats.total_guests_last_month) / stats.total_guests_last_month) * 100 
    : 0;
  
  const revenueGrowth = stats.revenue_last_month > 0 
    ? ((stats.revenue_mrr - stats.revenue_last_month) / stats.revenue_last_month) * 100 
    : 0;

  // 2. Chart Data (Tren Kunjungan)
  let limit = 7;
  const dateFormat = '%d %b';
  if (chartRange === '30d') limit = 30;
  if (chartRange === '12m') limit = 12;

  const chartData = await query(`
    SELECT 
      DATE_FORMAT(created_at, '${chartRange === '12m' ? '%b %Y' : dateFormat}') as period,
      COUNT(*) as total
    FROM guests
    WHERE created_at >= ${chartRange === '12m' ? 'DATE_SUB(NOW(), INTERVAL 12 MONTH)' : 'DATE_SUB(NOW(), INTERVAL 30 DAY)'}
    GROUP BY ${chartRange === '12m' ? 'MONTH(created_at), YEAR(created_at)' : 'DATE(created_at)'}
    ORDER BY created_at ASC
  `) as { period: string; total: number }[];

  // 3. Top 5 Instansi dengan Kunjungan Terbanyak
  const topInstances = await query(`
    SELECT 
      i.id,
      i.name,
      i.slug,
      COUNT(g.id) as total_visits,
      COALESCE((
        SELECT COUNT(*) * 100.0 / NULLIF((SELECT COUNT(*) FROM guests WHERE instance_id = i.id AND created_at >= DATE_SUB(NOW(), INTERVAL 60 DAY)), 0)
        FROM guests g2 
        WHERE g2.instance_id = i.id AND g2.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      ), 0) as growth
    FROM instances i
    LEFT JOIN guests g ON g.instance_id = i.id
    GROUP BY i.id
    ORDER BY total_visits DESC
    LIMIT 5
  `) as TopInstance[];

  // 4. Instansi dengan Pertumbuhan Tercepat (Ganti Admin Paling Aktif)
  const fastestGrowing = await query(`
    SELECT 
      i.id,
      i.name,
      i.slug,
      COALESCE((
        SELECT COUNT(*) FROM guests 
        WHERE instance_id = i.id 
        AND MONTH(created_at) = MONTH(CURDATE()) 
        AND YEAR(created_at) = YEAR(CURDATE())
      ), 0) as current_month,
      COALESCE((
        SELECT COUNT(*) FROM guests 
        WHERE instance_id = i.id 
        AND MONTH(created_at) = MONTH(DATE_SUB(CURDATE(), INTERVAL 1 MONTH))
        AND YEAR(created_at) = YEAR(DATE_SUB(CURDATE(), INTERVAL 1 MONTH))
      ), 0) as last_month
    FROM instances i
    HAVING current_month > 0 OR last_month > 0
    ORDER BY (CASE WHEN last_month > 0 THEN (current_month - last_month) * 100.0 / last_month ELSE 100 END) DESC
    LIMIT 5
  `) as FastestGrowingInstance[];

  // Hitung growth percent
  const fastestGrowingWithPercent = fastestGrowing.map(inst => ({
    ...inst,
    growth_percent: inst.last_month > 0 
      ? Math.round(((inst.current_month - inst.last_month) / inst.last_month) * 100)
      : inst.current_month > 0 ? 100 : 0
  }));

  // 5. Aktivitas per Jam (Jam Sibuk)
  const hourlyActivity = await query(`
    SELECT 
      HOUR(created_at) as hour,
      COUNT(*) as total
    FROM guests
    WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    GROUP BY HOUR(created_at)
    ORDER BY hour ASC
  `) as HourlyActivity[];

  // 6. Aktivitas Terbaru (5 terakhir saja)
  const recentActivities = await query(`
    SELECT 
      al.id,
      al.action,
      al.description,
      u.name as user_name,
      u.email as user_email,
      u.role as user_role,
      al.created_at
    FROM activity_logs al
    LEFT JOIN users u ON al.user_id = u.id
    ORDER BY al.created_at DESC
    LIMIT 5
  `) as RecentActivity[];

  return NextResponse.json({
    success: true,
    stats: {
      ...stats,
      guest_growth: Math.round(guestGrowth * 10) / 10,
      revenue_growth: Math.round(revenueGrowth * 10) / 10,
    },
    chartData,
    topInstances,
    fastestGrowing: fastestGrowingWithPercent,
    hourlyActivity,
    recentActivities,
    chartRange
  });
}