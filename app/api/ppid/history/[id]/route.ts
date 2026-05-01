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

interface GuestDetail {
  id: number;
  name: string;
  nik: string | null;
  institution: string | null;
  purpose: string;
  photo_url: string | null;
  status: string;
  check_in_at: string | null;
  check_out_at: string | null;
  created_at: string;
  employee_name: string | null;
  employee_department: string | null;
  employee_nip: string | null;
  created_by_name: string | null;
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
    const guestId = parseInt(resolvedParams.id);
    
    if (isNaN(guestId)) {
      return NextResponse.json({ error: 'Invalid guest ID' }, { status: 400 });
    }

    const instanceId = currentUser.instance_id;
    
    // Ambil setting checkout
    const settings = await query(
      'SELECT enable_checkout FROM settings WHERE instance_id = ? LIMIT 1',
      [instanceId]
    ) as { enable_checkout: number }[];
    const enableCheckout = settings[0]?.enable_checkout === 1;

    const guests = await query(
      `SELECT 
        g.id,
        g.name,
        g.nik,
        g.institution,
        g.purpose,
        g.photo_url,
        g.status,
        g.check_in_at,
        g.check_out_at,
        g.created_at,
        e.name as employee_name,
        e.department as employee_department,
        e.nip as employee_nip,
        u.name as created_by_name
      FROM guests g
      LEFT JOIN employees e ON g.employee_id = e.id
      LEFT JOIN users u ON g.created_by = u.id
      WHERE g.id = ? AND g.instance_id = ?`,
      [guestId, instanceId]
    ) as GuestDetail[];

    if (guests.length === 0) {
      return NextResponse.json({ error: 'Guest not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      guest: guests[0],
      enable_checkout: enableCheckout,
    });
  } catch (error) {
    console.error('PPID History Detail API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}