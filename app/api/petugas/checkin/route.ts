import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { auth } from '@/lib/auth';
import { createActivityLog } from '@/lib/activity-log';

interface User {
  id: number;
  instance_id: number;
  role: string;
  name: string;
  email: string;
}

interface InsertResult {
  insertId: number;
  affectedRows: number;
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

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'petugas') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { name, nik, institution, purpose, employee_id, photo_url } = body;

    if (!name || !purpose) {
      return NextResponse.json(
        { error: 'Nama tamu dan tujuan kunjungan wajib diisi' },
        { status: 400 }
      );
    }

    const instanceId = currentUser.instance_id;
    const checkInAt = new Date().toISOString().slice(0, 19).replace('T', ' ');

    // Insert new guest with status 'active'
    const result = await query(
      `INSERT INTO guests 
       (instance_id, employee_id, created_by, name, nik, institution, purpose, photo_url, status, check_in_at, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, NOW(), NOW())`,
      [
        instanceId,
        employee_id || null,
        currentUser.id,
        name,
        nik || null,
        institution || null,
        purpose,
        photo_url || null,
        checkInAt,
      ]
    ) as InsertResult;

    const guestId = result.insertId;

    // Create activity log
    await createActivityLog({
      instance_id: instanceId,
      user_id: currentUser.id,
      action: 'INSERT',
      table_name: 'guests',
      record_id: guestId,
      description: `Input manual tamu: ${name}`,
      new_data: { name, nik, institution, purpose, employee_id, photo_url },
    });

    return NextResponse.json({
      success: true,
      message: 'Tamu berhasil ditambahkan',
      guest_id: guestId,
    });
  } catch (error) {
    console.error('Checkin API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}