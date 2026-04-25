import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { auth } from '@/lib/auth';
import { createActivityLog } from '@/lib/activity-log';
import bcrypt from 'bcryptjs';

interface Ppid {
  id: number;
  name: string;
  email: string;
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

function generateRandomPassword(length: number = 10): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%';
  let password = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  return password;
}

// GET - Ambil daftar PPID
export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';

    const offset = (page - 1) * limit;
    const instanceId = currentUser.instance_id;

    let whereClause = 'WHERE instance_id = ? AND role = "ppid"';
    const params: (string | number)[] = [instanceId];

    if (search) {
      whereClause += ' AND (name LIKE ? OR email LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }

    const countQuery = `SELECT COUNT(*) as total FROM users ${whereClause}`;
    const countResult = await query(countQuery, params) as { total: number }[];
    const total = countResult[0]?.total || 0;

    const dataQuery = `
      SELECT id, name, email, created_at
      FROM users 
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;
    const ppids = await query(dataQuery, [...params, limit, offset]) as Ppid[];

    return NextResponse.json({
      success: true,
      ppids,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('GET ppid error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Tambah PPID
export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { name, email, generatePassword, password: manualPassword } = body;

    if (!name || !email) {
      return NextResponse.json({ error: 'Nama dan email wajib diisi' }, { status: 400 });
    }

    const existingEmail = await query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    ) as { id: number }[];

    if (existingEmail.length > 0) {
      return NextResponse.json({ error: 'Email sudah digunakan' }, { status: 400 });
    }

    let password = '';
    let isRandomGenerated = false;

    if (generatePassword) {
      password = generateRandomPassword(10);
      isRandomGenerated = true;
    } else {
      password = manualPassword;
    }

    if (!password) {
      return NextResponse.json({ error: 'Password wajib diisi' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await query(
      `INSERT INTO users (instance_id, name, email, password, role, created_at, updated_at) 
       VALUES (?, ?, ?, ?, 'ppid', NOW(), NOW())`,
      [currentUser.instance_id, name, email, hashedPassword]
    ) as { insertId: number };

    await createActivityLog({
      instance_id: currentUser.instance_id,
      user_id: currentUser.id,
      action: 'INSERT',
      table_name: 'users',
      record_id: result.insertId,
      description: `Menambahkan PPID: ${name} (${email})`,
      new_data: { name, email },
      ip_address: request.headers.get('x-forwarded-for')?.split(',')[0] || undefined,
      user_agent: request.headers.get('user-agent') || undefined,
    });

    return NextResponse.json({
      success: true,
      message: 'PPID berhasil ditambahkan',
      ppidId: result.insertId,
      password: isRandomGenerated ? password : undefined,
      isRandomGenerated,
    });
  } catch (error) {
    console.error('POST ppid error:', error);
    return NextResponse.json({ error: 'Gagal menambahkan PPID' }, { status: 500 });
  }
}

// PUT - Edit PPID
export async function PUT(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { id, name, email, resetPassword } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID PPID diperlukan' }, { status: 400 });
    }

    const oldData = await query(
      'SELECT * FROM users WHERE id = ? AND instance_id = ? AND role = "ppid"',
      [id, currentUser.instance_id]
    ) as Record<string, unknown>[];

    if (oldData.length === 0) {
      return NextResponse.json({ error: 'PPID tidak ditemukan' }, { status: 404 });
    }

    const updates: string[] = [];
    const values: (string | number | null)[] = [];

    if (name) { updates.push('name = ?'); values.push(name); }
    if (email) {
      const existingEmail = await query(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email, id]
      ) as { id: number }[];
      if (existingEmail.length > 0) {
        return NextResponse.json({ error: 'Email sudah digunakan oleh PPID lain' }, { status: 400 });
      }
      updates.push('email = ?');
      values.push(email);
    }

    let newPassword = '';
    let isRandomGenerated = false;
    
    if (resetPassword) {
      newPassword = generateRandomPassword(10);
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      updates.push('password = ?');
      values.push(hashedPassword);
      isRandomGenerated = true;
    }

    updates.push('updated_at = NOW()');
    values.push(id);

    if (updates.length > 1) {
      await query(
        `UPDATE users SET ${updates.join(', ')} WHERE id = ? AND instance_id = ? AND role = 'ppid'`,
        [...values, currentUser.instance_id]
      );
    }

    await createActivityLog({
      instance_id: currentUser.instance_id,
      user_id: currentUser.id,
      action: 'UPDATE',
      table_name: 'users',
      record_id: id,
      description: `Mengupdate PPID: ${oldData[0].name as string}`,
      old_data: oldData[0],
      new_data: { name, email },
      ip_address: request.headers.get('x-forwarded-for')?.split(',')[0] || undefined,
      user_agent: request.headers.get('user-agent') || undefined,
    });

    return NextResponse.json({
      success: true,
      message: resetPassword ? 'Password PPID berhasil direset' : 'PPID berhasil diupdate',
      resetPassword: resetPassword || false,
      newPassword: resetPassword ? newPassword : undefined,
      isRandomGenerated,
    });
  } catch (error) {
    console.error('PUT ppid error:', error);
    return NextResponse.json({ error: 'Gagal mengupdate PPID' }, { status: 500 });
  }
}

// DELETE - Hapus PPID
export async function DELETE(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID PPID diperlukan' }, { status: 400 });
    }

    const oldData = await query(
      'SELECT * FROM users WHERE id = ? AND instance_id = ? AND role = "ppid"',
      [id, currentUser.instance_id]
    ) as Record<string, unknown>[];

    if (oldData.length === 0) {
      return NextResponse.json({ error: 'PPID tidak ditemukan' }, { status: 404 });
    }

    await query('DELETE FROM users WHERE id = ? AND instance_id = ? AND role = "ppid"', [id, currentUser.instance_id]);

    await createActivityLog({
      instance_id: currentUser.instance_id,
      user_id: currentUser.id,
      action: 'DELETE',
      table_name: 'users',
      record_id: parseInt(id),
      description: `Menghapus PPID: ${oldData[0].name as string}`,
      old_data: oldData[0],
      ip_address: request.headers.get('x-forwarded-for')?.split(',')[0] || undefined,
      user_agent: request.headers.get('user-agent') || undefined,
    });

    return NextResponse.json({
      success: true,
      message: 'PPID berhasil dihapus',
    });
  } catch (error) {
    console.error('DELETE ppid error:', error);
    return NextResponse.json({ error: 'Gagal menghapus PPID' }, { status: 500 });
  }
}

// PATCH - Bulk delete
export async function PATCH(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { action, ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'Pilih PPID terlebih dahulu' }, { status: 400 });
    }

    if (action === 'delete') {
      const placeholders = ids.map(() => '?').join(',');
      await query(
        `DELETE FROM users WHERE id IN (${placeholders}) AND instance_id = ? AND role = 'ppid'`,
        [...ids, currentUser.instance_id]
      );

      await createActivityLog({
        instance_id: currentUser.instance_id,
        user_id: currentUser.id,
        action: 'DELETE',
        table_name: 'users',
        record_id: null,
        description: `Menghapus ${ids.length} PPID`,
        ip_address: request.headers.get('x-forwarded-for')?.split(',')[0] || undefined,
        user_agent: request.headers.get('user-agent') || undefined,
      });
    } else {
      return NextResponse.json({ error: 'Aksi tidak dikenal' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `${ids.length} PPID berhasil dihapus`,
    });
  } catch (error) {
    console.error('PATCH ppid error:', error);
    return NextResponse.json({ error: 'Gagal memproses aksi' }, { status: 500 });
  }
}