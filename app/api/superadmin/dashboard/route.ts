import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

interface StatsRow {
  total: number;
  total_revenue?: number;
}

interface ExpiringInstanceRow {
  id: number;
  name: string;
  slug: string;
  plan: string;
  subscription_end: Date;
  subscription_status: string;
  days_left: number;
  is_expired: number;
}

interface RecentActivityRow {
  id: number;
  action: string;
  description: string | null;
  user_name: string | null;
  instance_name: string | null;
  created_at: Date;
}

export async function GET() {
  try {
    // 1. Total Instansi
    const totalInstancesResult = await query(
      'SELECT COUNT(*) as total FROM instances'
    ) as StatsRow[];
    const totalInstances = Number(totalInstancesResult[0]?.total ?? 0);

    // 2. Total Users (semua role)
    const totalUsersResult = await query(
      'SELECT COUNT(*) as total FROM users'
    ) as StatsRow[];
    const totalUsers = Number(totalUsersResult[0]?.total ?? 0);

    // 3. Total Admin Instansi (bukan super_admin)
    const totalAdminsResult = await query(
      `SELECT COUNT(*) as total FROM users WHERE role = 'admin'`
    ) as StatsRow[];
    const totalAdmins = Number(totalAdminsResult[0]?.total ?? 0);

    // 4. Total Petugas
    const totalPetugasResult = await query(
      `SELECT COUNT(*) as total FROM users WHERE role = 'petugas'`
    ) as StatsRow[];
    const totalPetugas = Number(totalPetugasResult[0]?.total ?? 0);

    // 5. Total PPID
    const totalPpidResult = await query(
      `SELECT COUNT(*) as total FROM users WHERE role = 'ppid'`
    ) as StatsRow[];
    const totalPpid = Number(totalPpidResult[0]?.total ?? 0);

    // 6. Instansi Aktif (subscription_status = 'active' AND is_active = true)
    const activeInstancesResult = await query(
      `SELECT COUNT(*) as total FROM instances 
       WHERE subscription_status = 'active' AND is_active = true`
    ) as StatsRow[];
    const activeInstances = Number(activeInstancesResult[0]?.total ?? 0);

    // 7. Instansi Expired (subscription_status = 'expired' OR subscription_end < CURDATE())
    const expiredInstancesResult = await query(
      `SELECT COUNT(*) as total FROM instances 
       WHERE subscription_status = 'expired' OR subscription_end < CURDATE()`
    ) as StatsRow[];
    const expiredInstances = Number(expiredInstancesResult[0]?.total ?? 0);

    // 8. Instansi Trial
    const trialInstancesResult = await query(
      `SELECT COUNT(*) as total FROM instances WHERE subscription_status = 'trial'`
    ) as StatsRow[];
    const trialInstances = Number(trialInstancesResult[0]?.total ?? 0);

    // 9. Total Pendapatan (estimasi dari plan)
    const revenueResult = await query(
      `SELECT 
        SUM(CASE 
          WHEN plan = 'starter' THEN 99000
          WHEN plan = 'business' THEN 299000
          WHEN plan = 'enterprise' THEN 0
          ELSE 0
        END) as total_revenue
       FROM instances 
       WHERE subscription_status = 'active'`
    ) as StatsRow[];
    const totalRevenue = revenueResult[0]?.total_revenue ?? 0;

    // 10. Instansi yang akan expired (dalam 30 hari)
    const expiringInstancesResult = await query(
      `SELECT 
        id, name, slug, plan, subscription_end, subscription_status,
        DATEDIFF(subscription_end, CURDATE()) as days_left,
        CASE WHEN subscription_end < CURDATE() THEN 1 ELSE 0 END as is_expired
       FROM instances 
       WHERE subscription_status = 'active' 
         AND subscription_end BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)
       ORDER BY days_left ASC
       LIMIT 5`
    ) as ExpiringInstanceRow[];
    
    const expiringInstances = expiringInstancesResult.map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      plan: row.plan,
      subscription_end: row.subscription_end,
      subscription_status: row.subscription_status,
      days_left: row.days_left,
      is_expired: row.is_expired === 1,
    }));

    // 11. Aktivitas terbaru dari super_admin dan admin
    const activitiesResult = await query(
      `SELECT 
        al.id, al.action, al.description, al.created_at,
        u.name as user_name,
        i.name as instance_name
       FROM activity_logs al
       LEFT JOIN users u ON al.user_id = u.id
       LEFT JOIN instances i ON al.instance_id = i.id
       ORDER BY al.created_at DESC
       LIMIT 10`
    ) as RecentActivityRow[];

    const recentActivities = activitiesResult.map((row) => ({
      id: row.id,
      action: row.action,
      description: row.description,
      user_name: row.user_name ?? undefined,
      instance_name: row.instance_name ?? undefined,
      created_at: row.created_at,
    }));

    // 12. Statistik plan distribution
    const planStatsResult = await query(
      `SELECT plan, COUNT(*) as total 
       FROM instances 
       GROUP BY plan`
    ) as { plan: string; total: number }[];

    const planStats = {
      starter: 0,
      business: 0,
      enterprise: 0,
    };
    planStatsResult.forEach((row) => {
      if (row.plan === 'starter') planStats.starter = row.total;
      if (row.plan === 'business') planStats.business = row.total;
      if (row.plan === 'enterprise') planStats.enterprise = row.total;
    });

    return NextResponse.json({
      success: true,
      stats: {
        total_instances: totalInstances,
        total_users: totalUsers,
        total_admins: totalAdmins,
        total_petugas: totalPetugas,
        total_ppid: totalPpid,
        active_instances: activeInstances,
        expired_instances: expiredInstances,
        trial_instances: trialInstances,
        total_revenue: totalRevenue,
      },
      expiring_instances: expiringInstances,
      recent_activities: recentActivities,
      plan_stats: planStats,
    });
  } catch (error) {
    console.error('Dashboard API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}