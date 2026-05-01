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
    if (!currentUser || currentUser.role !== 'ppid') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const instanceId = currentUser.instance_id;

    // Total kunjungan hari ini
    const todayResult = await query(
      `SELECT COUNT(*) as total FROM guests 
       WHERE instance_id = ? AND DATE(created_at) = CURDATE()`,
      [instanceId]
    ) as { total: number }[];
    const totalVisitsToday = todayResult[0]?.total || 0;

    // Total kunjungan bulan ini
    const monthResult = await query(
      `SELECT COUNT(*) as total FROM guests 
       WHERE instance_id = ? AND MONTH(created_at) = MONTH(CURDATE()) AND YEAR(created_at) = YEAR(CURDATE())`,
      [instanceId]
    ) as { total: number }[];
    const totalVisitsThisMonth = monthResult[0]?.total || 0;

    // Total kunjungan semua waktu
    const allResult = await query(
      `SELECT COUNT(*) as total FROM guests WHERE instance_id = ?`,
      [instanceId]
    ) as { total: number }[];
    const totalVisitsAllTime = allResult[0]?.total || 0;

    // Total karyawan aktif
    const employeesResult = await query(
      `SELECT COUNT(*) as total FROM employees WHERE instance_id = ? AND is_active = true`,
      [instanceId]
    ) as { total: number }[];
    const totalEmployees = employeesResult[0]?.total || 0;

    // Total tamu (semua)
    const guestsResult = await query(
      `SELECT COUNT(*) as total FROM guests WHERE instance_id = ?`,
      [instanceId]
    ) as { total: number }[];
    const totalGuests = guestsResult[0]?.total || 0;

    // Pending validations
    const pendingResult = await query(
      `SELECT COUNT(*) as total FROM guests 
       WHERE instance_id = ? AND status = 'pending'`,
      [instanceId]
    ) as { total: number }[];
    const pendingValidations = pendingResult[0]?.total || 0;

    return NextResponse.json({
      success: true,
      stats: {
        total_visits_today: totalVisitsToday,
        total_visits_this_month: totalVisitsThisMonth,
        total_visits_all_time: totalVisitsAllTime,
        total_employees: totalEmployees,
        total_guests: totalGuests,
        pending_validations: pendingValidations,
      },
    });
  } catch (error) {
    console.error('Dashboard API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}