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
  instance_id: number;
  employee_id: number | null;
  created_by: number | null;
  name: string;
  nik: string | null;
  institution: string | null;
  purpose: string;
  photo_url: string | null;
  status: string;
  check_in_at: string | null;
  check_out_at: string | null;
  created_at: string;
  updated_at: string;
}

interface GuestDetail {
  id: number;
  instance_id: number;
  employee_id: number | null;
  created_by: number | null;
  name: string;
  nik: string | null;
  institution: string | null;
  purpose: string;
  photo_url: string | null;
  status: string;
  check_in_at: string | null;
  check_out_at: string | null;
  created_at: string;
  updated_at: string;
  employee_name: string | null;
  employee_department: string | null;
  employee_nip: string | null;
  created_by_name: string | null;
}

interface HistoryGuest {
  id: number;
  name: string;
  nik: string | null;
  institution: string | null;
  purpose: string;
  status: string;
  photo_url: string | null;
  check_in_at: string | null;
  check_out_at: string | null;
  created_at: string;
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

// GET - List history atau Detail
export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'super_admin')) {
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
    
    // Jika ada parameter id, return detail
    if (id) {
      const guestId = parseInt(id);
      if (isNaN(guestId)) {
        return NextResponse.json({ error: 'Invalid guest ID' }, { status: 400 });
      }

      let guest: GuestDetail | null = null;

      if (currentUser.role === 'super_admin') {
        const guests = await query(
          `SELECT 
            g.id,
            g.instance_id,
            g.employee_id,
            g.created_by,
            g.name,
            g.nik,
            g.institution,
            g.purpose,
            g.photo_url,
            g.status,
            g.check_in_at,
            g.check_out_at,
            g.created_at,
            g.updated_at,
            e.name as employee_name,
            e.department as employee_department,
            e.nip as employee_nip,
            u.name as created_by_name
          FROM guests g
          LEFT JOIN employees e ON g.employee_id = e.id
          LEFT JOIN users u ON g.created_by = u.id
          WHERE g.id = ?`,
          [guestId]
        ) as GuestDetail[];
        guest = guests[0] || null;
      } else {
        const guests = await query(
          `SELECT 
            g.id,
            g.instance_id,
            g.employee_id,
            g.created_by,
            g.name,
            g.nik,
            g.institution,
            g.purpose,
            g.photo_url,
            g.status,
            g.check_in_at,
            g.check_out_at,
            g.created_at,
            g.updated_at,
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
        guest = guests[0] || null;
      }

      if (!guest) {
        return NextResponse.json({ error: 'Guest not found' }, { status: 404 });
      }

      const responseGuest = {
        ...guest,
        photo_url: guest.photo_url || null,
      };

      return NextResponse.json({
        success: true,
        guest: responseGuest,
        enable_checkout: enableCheckout,
      });
    }

    // Jika tidak ada parameter id, return list
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';
    const officerId = searchParams.get('officerId') || '';
    const employeeId = searchParams.get('employeeId') || '';

    const offset = (page - 1) * limit;

    let whereClause = 'WHERE g.instance_id = ?';
    const params: (string | number)[] = [instanceId];

    if (search) {
      whereClause += ' AND (g.name LIKE ? OR g.nik LIKE ? OR g.institution LIKE ? OR g.purpose LIKE ? OR e.name LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (status !== 'all') {
      whereClause += ' AND g.status = ?';
      params.push(status);
    }

    if (startDate) {
      whereClause += ' AND DATE(g.created_at) >= ?';
      params.push(startDate);
    }

    if (endDate) {
      whereClause += ' AND DATE(g.created_at) <= ?';
      params.push(endDate);
    }

    if (officerId) {
      whereClause += ' AND g.created_by = ?';
      params.push(parseInt(officerId));
    }

    if (employeeId) {
      whereClause += ' AND g.employee_id = ?';
      params.push(parseInt(employeeId));
    }

    const countQuery = `
      SELECT COUNT(*) as total
      FROM guests g
      LEFT JOIN employees e ON g.employee_id = e.id
      ${whereClause}
    `;
    const countResult = await query(countQuery, params) as { total: number }[];
    const total = countResult[0]?.total || 0;

    const dataQuery = `
      SELECT 
        g.id,
        g.name,
        g.nik,
        g.institution,
        g.purpose,
        g.status,
        g.photo_url,
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
    const guests = await query(dataQuery, [...params, limit, offset]) as HistoryGuest[];

    const guestsWithHandleNull = guests.map(guest => ({
      ...guest,
      photo_url: guest.photo_url || null,
    }));

    return NextResponse.json({
      success: true,
      guests: guestsWithHandleNull,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      enable_checkout: enableCheckout,
    });
  } catch (error) {
    console.error('GET Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH - Edit kunjungan (sama seperti sebelumnya)
export async function PATCH(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'super_admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { id, name, nik, institution, purpose, employee_id, status, check_in_at, check_out_at, photo_url } = body;

    if (!id) {
      return NextResponse.json({ error: 'Guest ID required' }, { status: 400 });
    }

    let oldGuest: Guest | null = null;
    
    if (currentUser.role === 'super_admin') {
      const guests = await query('SELECT * FROM guests WHERE id = ?', [id]) as Guest[];
      oldGuest = guests[0] || null;
    } else {
      const guests = await query('SELECT * FROM guests WHERE id = ? AND instance_id = ?', [id, currentUser.instance_id]) as Guest[];
      oldGuest = guests[0] || null;
    }

    if (!oldGuest) {
      return NextResponse.json({ error: 'Guest not found' }, { status: 404 });
    }

    if ((name !== undefined && !name) || (purpose !== undefined && !purpose)) {
      return NextResponse.json(
        { error: 'Nama tamu dan tujuan kunjungan wajib diisi' },
        { status: 400 }
      );
    }

    const updateFields: string[] = [];
    const updateParams: (string | number | null)[] = [];

    if (name !== undefined) {
      updateFields.push('name = ?');
      updateParams.push(name);
    }
    if (nik !== undefined) {
      updateFields.push('nik = ?');
      updateParams.push(nik || null);
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
    if (photo_url !== undefined) {
      updateFields.push('photo_url = ?');
      updateParams.push(photo_url || null);
    }

    if (updateFields.length === 0) {
      return NextResponse.json({ error: 'No data to update' }, { status: 400 });
    }

    updateFields.push('updated_at = NOW()');
    updateParams.push(id);

    if (currentUser.role !== 'super_admin') {
      updateParams.push(currentUser.instance_id);
    }

    const queryStr = `
      UPDATE guests 
      SET ${updateFields.join(', ')} 
      WHERE id = ? ${currentUser.role !== 'super_admin' ? 'AND instance_id = ?' : ''}
    `;

    await query(queryStr, updateParams);

    await createActivityLog({
      instance_id: currentUser.role === 'super_admin' ? oldGuest.instance_id : currentUser.instance_id,
      user_id: currentUser.id,
      action: 'UPDATE',
      table_name: 'guests',
      record_id: id,
      description: `Mengupdate data kunjungan tamu: ${oldGuest.name}`,
      old_data: {
        name: oldGuest.name,
        nik: oldGuest.nik,
        institution: oldGuest.institution,
        purpose: oldGuest.purpose,
        employee_id: oldGuest.employee_id,
        status: oldGuest.status,
        check_in_at: oldGuest.check_in_at,
        check_out_at: oldGuest.check_out_at,
        photo_url: oldGuest.photo_url,
      },
      new_data: {
        name: name || oldGuest.name,
        nik: nik || oldGuest.nik,
        institution: institution || oldGuest.institution,
        purpose: purpose || oldGuest.purpose,
        employee_id: employee_id || oldGuest.employee_id,
        status: status || oldGuest.status,
        check_in_at: check_in_at || oldGuest.check_in_at,
        check_out_at: check_out_at || oldGuest.check_out_at,
        photo_url: photo_url || oldGuest.photo_url,
      },
    });

    return NextResponse.json({ success: true, message: 'Data kunjungan berhasil diupdate' });
  } catch (error) {
    console.error('PATCH Error:', error);
    return NextResponse.json({ error: 'Gagal mengupdate data kunjungan' }, { status: 500 });
  }
}

// DELETE - Hapus kunjungan
export async function DELETE(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'super_admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Guest ID required' }, { status: 400 });
    }

    const guestId = parseInt(id);
    let oldGuest: Guest | null = null;
    
    if (currentUser.role === 'super_admin') {
      const guests = await query('SELECT * FROM guests WHERE id = ?', [guestId]) as Guest[];
      oldGuest = guests[0] || null;
    } else {
      const guests = await query('SELECT * FROM guests WHERE id = ? AND instance_id = ?', [guestId, currentUser.instance_id]) as Guest[];
      oldGuest = guests[0] || null;
    }

    if (!oldGuest) {
      return NextResponse.json({ error: 'Guest not found' }, { status: 404 });
    }

    let deleteQuery = 'DELETE FROM guests WHERE id = ?';
    const deleteParams: (string | number)[] = [guestId];

    if (currentUser.role !== 'super_admin') {
      deleteQuery += ' AND instance_id = ?';
      deleteParams.push(currentUser.instance_id);
    }

    await query(deleteQuery, deleteParams);

    await createActivityLog({
      instance_id: currentUser.role === 'super_admin' ? oldGuest.instance_id : currentUser.instance_id,
      user_id: currentUser.id,
      action: 'DELETE',
      table_name: 'guests',
      record_id: guestId,
      description: `Menghapus data kunjungan tamu: ${oldGuest.name}`,
      old_data: {
        id: oldGuest.id,
        name: oldGuest.name,
        nik: oldGuest.nik,
        institution: oldGuest.institution,
        purpose: oldGuest.purpose,
        employee_id: oldGuest.employee_id,
        status: oldGuest.status,
        check_in_at: oldGuest.check_in_at,
        check_out_at: oldGuest.check_out_at,
        photo_url: oldGuest.photo_url,
      },
    });

    return NextResponse.json({ success: true, message: 'Data kunjungan berhasil dihapus' });
  } catch (error) {
    console.error('DELETE Error:', error);
    return NextResponse.json({ error: 'Gagal menghapus data kunjungan' }, { status: 500 });
  }
}