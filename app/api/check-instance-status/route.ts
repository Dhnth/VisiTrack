import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { query } from '@/lib/db';

interface User {
  id: number;
  instance_id: number | null;
  role: string;
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const users = await query(
      'SELECT id, instance_id, role FROM users WHERE email = ?',
      [session.user.email]
    ) as User[];

    const currentUser = users[0];
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Super admin tidak perlu cek status instansi
    if (currentUser.role === 'super_admin') {
      return NextResponse.json({
        success: true,
        status: 'active',
        role: 'super_admin',
      });
    }

    // Cek status instansi
    const instances = await query(
      'SELECT subscription_status, is_active FROM instances WHERE id = ?',
      [currentUser.instance_id]
    ) as { subscription_status: string; is_active: number }[];

    if (instances.length === 0) {
      return NextResponse.json({ error: 'Instance not found' }, { status: 404 });
    }

    const instance = instances[0];

    // Cek apakah expired
    if (instance.subscription_status === 'expired') {
      return NextResponse.json({
        success: false,
        status: 'expired',
        message: 'Langganan instansi telah berakhir',
      });
    }

    // Cek apakah dinonaktifkan
    if (instance.is_active === 0) {
      return NextResponse.json({
        success: false,
        status: 'suspended',
        message: 'Instansi dinonaktifkan',
      });
    }

    return NextResponse.json({
      success: true,
      status: 'active',
      role: currentUser.role,
    });
  } catch (error) {
    console.error('Check instance status error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}