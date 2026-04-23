import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { auth } from '@/lib/auth';
import { createActivityLog } from '@/lib/activity-log';

interface Employee {
  id: number;
  nip: string | null;
  name: string;
  department: string;
  phone: string | null;
  is_active: boolean;
  created_at: Date;
}

async function getCurrentUser() {
  const session = await auth();
  if (!session?.user?.email) return null;
  
  const users = await query(
    'SELECT id, instance_id, role FROM users WHERE email = ?',
    [session.user.email]
  ) as { id: number; instance_id: number; role: string }[];
  
  return users[0] || null;
}

// GET - Ambil daftar karyawan
export async function GET(request: NextRequest) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || 'all';

  const offset = (page - 1) * limit;
  const instanceId = currentUser.instance_id;

  let whereClause = 'WHERE e.instance_id = ?';
  const params: (string | number)[] = [instanceId];

  if (search) {
    whereClause += ' AND (e.name LIKE ? OR e.nip LIKE ? OR e.department LIKE ? OR e.phone LIKE ?)';
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm, searchTerm);
  }

  if (status !== 'all') {
    whereClause += ' AND e.is_active = ?';
    params.push(status === 'active' ? 1 : 0);
  }

  // Get total count
  const countQuery = `SELECT COUNT(*) as total FROM employees e ${whereClause}`;
  const countResult = await query(countQuery, params) as { total: number }[];
  const total = countResult[0]?.total || 0;

  // Get paginated data
  const dataQuery = `
    SELECT e.* 
    FROM employees e 
    ${whereClause}
    ORDER BY e.created_at DESC
    LIMIT ? OFFSET ?
  `;
  const employees = await query(dataQuery, [...params, limit, offset]) as Employee[];

  return NextResponse.json({
    success: true,
    employees,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}

// POST - Tambah karyawan
export async function POST(request: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { nip, name, department, phone, is_active } = body;

    if (!name || !department) {
      return NextResponse.json(
        { error: 'Nama dan departemen wajib diisi' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO employees (instance_id, nip, name, department, phone, is_active, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [currentUser.instance_id, nip || null, name, department, phone || null, is_active !== false ? 1 : 0]
    ) as { insertId: number };

    await createActivityLog({
      instance_id: currentUser.instance_id,
      user_id: currentUser.id,
      action: 'INSERT',
      table_name: 'employees',
      record_id: result.insertId,
      description: `Menambahkan karyawan: ${name}`,
      new_data: { nip, name, department, phone, is_active },
      ip_address: request.headers.get('x-forwarded-for')?.split(',')[0] || undefined,
      user_agent: request.headers.get('user-agent') || undefined,
    });

    return NextResponse.json({
      success: true,
      message: 'Karyawan berhasil ditambahkan',
      employeeId: result.insertId,
    });
  } catch (error) {
    console.error('Create employee error:', error);
    return NextResponse.json(
      { error: 'Gagal menambahkan karyawan' },
      { status: 500 }
    );
  }
}

// PUT - Edit karyawan
export async function PUT(request: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { id, nip, name, department, phone, is_active } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID karyawan diperlukan' }, { status: 400 });
    }

    // Get old data
    const oldData = await query(
      'SELECT * FROM employees WHERE id = ? AND instance_id = ?',
      [id, currentUser.instance_id]
    ) as Record<string, unknown>[];

    if (oldData.length === 0) {
      return NextResponse.json({ error: 'Karyawan tidak ditemukan' }, { status: 404 });
    }

    const updates: string[] = [];
    const values: (string | number | null)[] = [];

    if (nip !== undefined) { updates.push('nip = ?'); values.push(nip || null); }
    if (name) { updates.push('name = ?'); values.push(name); }
    if (department) { updates.push('department = ?'); values.push(department); }
    if (phone !== undefined) { updates.push('phone = ?'); values.push(phone || null); }
    if (is_active !== undefined) { updates.push('is_active = ?'); values.push(is_active ? 1 : 0); }

    updates.push('updated_at = NOW()');
    values.push(id);

    await query(
      `UPDATE employees SET ${updates.join(', ')} WHERE id = ? AND instance_id = ?`,
      [...values, currentUser.instance_id]
    );

    await createActivityLog({
      instance_id: currentUser.instance_id,
      user_id: currentUser.id,
      action: 'UPDATE',
      table_name: 'employees',
      record_id: id,
      description: `Mengupdate karyawan: ${oldData[0].name as string}`,
      old_data: oldData[0],
      new_data: { nip, name, department, phone, is_active },
      ip_address: request.headers.get('x-forwarded-for')?.split(',')[0] || undefined,
      user_agent: request.headers.get('user-agent') || undefined,
    });

    return NextResponse.json({
      success: true,
      message: 'Karyawan berhasil diupdate',
    });
  } catch (error) {
    console.error('Update employee error:', error);
    return NextResponse.json(
      { error: 'Gagal mengupdate karyawan' },
      { status: 500 }
    );
  }
}

// DELETE - Hapus karyawan
export async function DELETE(request: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID karyawan diperlukan' }, { status: 400 });
    }

    const oldData = await query(
      'SELECT * FROM employees WHERE id = ? AND instance_id = ?',
      [id, currentUser.instance_id]
    ) as Record<string, unknown>[];

    if (oldData.length === 0) {
      return NextResponse.json({ error: 'Karyawan tidak ditemukan' }, { status: 404 });
    }

    // Cek apakah karyawan memiliki tamu
    const guestsCount = await query(
      'SELECT COUNT(*) as total FROM guests WHERE employee_id = ?',
      [id]
    ) as { total: number }[];

    if (guestsCount[0].total > 0) {
      return NextResponse.json(
        { error: 'Tidak dapat menghapus karyawan yang sudah memiliki data tamu' },
        { status: 400 }
      );
    }

    await query('DELETE FROM employees WHERE id = ? AND instance_id = ?', [id, currentUser.instance_id]);

    await createActivityLog({
      instance_id: currentUser.instance_id,
      user_id: currentUser.id,
      action: 'DELETE',
      table_name: 'employees',
      record_id: parseInt(id),
      description: `Menghapus karyawan: ${oldData[0].name as string}`,
      old_data: oldData[0],
      ip_address: request.headers.get('x-forwarded-for')?.split(',')[0] || undefined,
      user_agent: request.headers.get('user-agent') || undefined,
    });

    return NextResponse.json({
      success: true,
      message: 'Karyawan berhasil dihapus',
    });
  } catch (error) {
    console.error('Delete employee error:', error);
    return NextResponse.json(
      { error: 'Gagal menghapus karyawan' },
      { status: 500 }
    );
  }
}

// PATCH - Bulk action
export async function PATCH(request: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { action, ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'Pilih karyawan terlebih dahulu' }, { status: 400 });
    }

    const placeholders = ids.map(() => '?').join(',');

    if (action === 'activate') {
      await query(
        `UPDATE employees SET is_active = 1, updated_at = NOW() WHERE id IN (${placeholders}) AND instance_id = ?`,
        [...ids, currentUser.instance_id]
      );
    } else if (action === 'deactivate') {
      await query(
        `UPDATE employees SET is_active = 0, updated_at = NOW() WHERE id IN (${placeholders}) AND instance_id = ?`,
        [...ids, currentUser.instance_id]
      );
    } else if (action === 'delete') {
      // Cek apakah ada karyawan yang memiliki tamu
      const checkQuery = `SELECT COUNT(*) as total FROM guests WHERE employee_id IN (${placeholders})`;
      const checkResult = await query(checkQuery, ids) as { total: number }[];
      
      if (checkResult[0].total > 0) {
        return NextResponse.json(
          { error: 'Beberapa karyawan memiliki data tamu dan tidak dapat dihapus' },
          { status: 400 }
        );
      }
      
      await query(
        `DELETE FROM employees WHERE id IN (${placeholders}) AND instance_id = ?`,
        [...ids, currentUser.instance_id]
      );
    } else {
      return NextResponse.json({ error: 'Aksi tidak dikenal' }, { status: 400 });
    }

    await createActivityLog({
      instance_id: currentUser.instance_id,
      user_id: currentUser.id,
      action: 'UPDATE',
      table_name: 'employees',
      record_id: null,
      description: `${action} ${ids.length} karyawan`,
      ip_address: request.headers.get('x-forwarded-for')?.split(',')[0] || undefined,
      user_agent: request.headers.get('user-agent') || undefined,
    });

    return NextResponse.json({
      success: true,
      message: `${ids.length} karyawan berhasil diproses`,
    });
  } catch (error) {
    console.error('Bulk action error:', error);
    return NextResponse.json(
      { error: 'Gagal memproses aksi' },
      { status: 500 }
    );
  }
}