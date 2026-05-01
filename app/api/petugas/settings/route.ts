import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { auth } from '@/lib/auth';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const users = await query(
      'SELECT id, instance_id FROM users WHERE email = ?',
      [session.user.email]
    ) as { id: number; instance_id: number }[];

    const currentUser = users[0];
    if (!currentUser) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const instanceId = currentUser.instance_id;

    // Ambil enable_checkout dari kolom langsung (bukan setting_key)
    const settings = await query(
      'SELECT enable_checkout FROM settings WHERE instance_id = ? LIMIT 1',
      [instanceId]
    ) as { enable_checkout: number }[];

    const enableCheckout = settings[0]?.enable_checkout === 1;

    return NextResponse.json({
      success: true,
      enable_checkout: enableCheckout,
    });
  } catch (error) {
    console.error('Settings API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}