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

interface Guest {
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
  employee_id: number | null;
  employee_name: string | null;
  employee_department: string | null;
  validated_by: string | null;
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

// GET - History hari ini atau detail guest
export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'petugas') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const instanceId = currentUser.instance_id;
    
    // Ambil setting checkout
    const settings = await query(
      'SELECT enable_checkout FROM settings WHERE instance_id = ? LIMIT 1',
      [instanceId]
    ) as { enable_checkout: number }[];
    const enableCheckout = settings[0]?.enable_checkout === 1;
    
    // Jika ada parameter id, return detail (untuk edit)
    if (id) {
      const guestId = parseInt(id);
      if (isNaN(guestId)) {
        return NextResponse.json({ error: 'Invalid guest ID' }, { status: 400 });
      }

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
          g.employee_id,
          e.name as employee_name,
          e.department as employee_department
        FROM guests g
        LEFT JOIN employees e ON g.employee_id = e.id
        WHERE g.id = ? AND g.instance_id = ?`,
        [guestId, instanceId]
      ) as Guest[];

      if (guests.length === 0) {
        return NextResponse.json({ error: 'Guest not found' }, { status: 404 });
      }

      const decryptedGuest = {
        ...guests[0],
        nik: guests[0].nik ? guests[0].nik : null
      };

      return NextResponse.json({
        success: true,
        guest: decryptedGuest,
        enable_checkout: enableCheckout,
      });
    }

    // Jika tidak ada parameter id, return list history hari ini
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';

    const offset = (page - 1) * limit;

    // 🔥 PERBAIKAN: Filter berdasarkan enable_checkout
    let whereClause: string;
    const params: (string | number)[] = [instanceId];

    if (enableCheckout) {
      // Jika checkout aktif: filter berdasarkan check_out_at untuk done, check_in_at untuk active
      whereClause = `
        WHERE g.instance_id = ? 
        AND (
          (g.status = 'done' AND DATE(g.check_out_at) = CURDATE())
          OR (g.status = 'rejected' AND DATE(g.created_at) = CURDATE())
          OR (g.status = 'active' AND DATE(g.check_in_at) = CURDATE())
        )
      `;
    } else {
      // Jika checkout nonaktif: semua kunjungan hari ini berdasarkan created_at
      whereClause = `
        WHERE g.instance_id = ? 
        AND DATE(g.created_at) = CURDATE()
      `;
    }

    if (search) {
      whereClause += ' AND (g.name LIKE ? OR g.institution LIKE ? OR g.purpose LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (status !== 'all') {
      whereClause += ' AND g.status = ?';
      params.push(status);
    }

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM guests g
      ${whereClause}
    `;
    const countResult = await query(countQuery, params) as { total: number }[];
    const total = countResult[0]?.total || 0;

    // Get paginated data
    const dataQuery = `
      SELECT 
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
        u.name as validated_by
      FROM guests g
      LEFT JOIN employees e ON g.employee_id = e.id
      LEFT JOIN users u ON g.created_by = u.id
      ${whereClause}
      ORDER BY g.created_at DESC
      LIMIT ? OFFSET ?
    `;
    const guests = await query(dataQuery, [...params, limit, offset]) as Guest[];

    const guestsWithDecryptedNIK = guests.map(guest => ({
      ...guest,
      nik: guest.nik ? guest.nik : null
    }));

    return NextResponse.json({
      success: true,
      guests: guestsWithDecryptedNIK,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      enable_checkout: enableCheckout,
    });
  } catch (error) {
    console.error('History GET API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH - Edit history
export async function PATCH(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'petugas') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { id, name, institution, purpose, employee_id, status, check_in_at, check_out_at } = body;

    if (!id) {
      return NextResponse.json({ error: 'Guest ID required' }, { status: 400 });
    }

    const guestId = parseInt(id);
    const instanceId = currentUser.instance_id;

    const oldGuest = await query(
      'SELECT name, status, check_out_at, created_at FROM guests WHERE id = ? AND instance_id = ?',
      [guestId, instanceId]
    ) as { name: string; status: string; check_out_at: string | null; created_at: string }[];

    if (oldGuest.length === 0) {
      return NextResponse.json({ error: 'Guest not found' }, { status: 404 });
    }

    const today = new Date();
    const isTodayCheckout = oldGuest[0].check_out_at && new Date(oldGuest[0].check_out_at).toDateString() === today.toDateString();
    const isTodayCreated = new Date(oldGuest[0].created_at).toDateString() === today.toDateString();

    if (!isTodayCheckout && !isTodayCreated) {
      return NextResponse.json(
        { error: 'Hanya dapat mengedit kunjungan yang checkout hari ini' },
        { status: 403 }
      );
    }

    const updateFields: string[] = [];
    const updateParams: (string | number | null)[] = [];

    if (name !== undefined) {
      updateFields.push('name = ?');
      updateParams.push(name);
    }
    if (institution !== undefined) {
      updateFields.push('institution = ?');
      updateParams.push(institution || null);
    }
    if (purpose !== undefined) {
      updateFields.push('purpose = ?');
      updateParams.push(purpose);
    }
    if (employee_id !== undefined) {
      updateFields.push('employee_id = ?');
      updateParams.push(employee_id || null);
    }
    if (status !== undefined) {
      updateFields.push('status = ?');
      updateParams.push(status);
    }
    if (check_in_at !== undefined) {
      updateFields.push('check_in_at = ?');
      updateParams.push(check_in_at || null);
    }
    if (check_out_at !== undefined) {
      updateFields.push('check_out_at = ?');
      updateParams.push(check_out_at || null);
    }

    if (updateFields.length === 0) {
      return NextResponse.json({ error: 'No data to update' }, { status: 400 });
    }

    updateFields.push('updated_at = NOW()');
    updateParams.push(guestId);
    updateParams.push(instanceId);

    const queryStr = `
      UPDATE guests 
      SET ${updateFields.join(', ')} 
      WHERE id = ? AND instance_id = ?
    `;

    await query(queryStr, updateParams);

    await createActivityLog({
      instance_id: instanceId,
      user_id: currentUser.id,
      action: 'UPDATE',
      table_name: 'guests',
      record_id: guestId,
      description: `Mengupdate data kunjungan tamu: ${oldGuest[0].name}`,
      new_data: { name, institution, purpose, employee_id, status, check_in_at, check_out_at },
    });

    return NextResponse.json({
      success: true,
      message: 'Data kunjungan berhasil diupdate',
    });
  } catch (error) {
    console.error('History PATCH API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}