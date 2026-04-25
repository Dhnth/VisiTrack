import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { auth } from '@/lib/auth';
import { createActivityLog } from '@/lib/activity-log';
import bcrypt from 'bcryptjs';

interface Officer {
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

// GET - Ambil daftar petugas
export async function GET(request: NextRequest) {
  try {
    console.log('🔥 GET /api/admin/officers started');
    
    const currentUser = await getCurrentUser();
    console.log('Current user:', currentUser);
    
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';

    const offset = (page - 1) * limit;
    const instanceId = currentUser.instance_id;

    let whereClause = 'WHERE instance_id = ? AND role = "petugas"';
    const params: (string | number)[] = [instanceId];

    if (search) {
      whereClause += ' AND (name LIKE ? OR email LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM users ${whereClause}`;
    console.log('Count query:', countQuery);
    console.log('Count params:', params);
    
    const countResult = await query(countQuery, params) as { total: number }[];
    const total = countResult[0]?.total || 0;
    console.log('Total:', total);

    // Get paginated data
    const dataQuery = `
      SELECT id, name, email, created_at
      FROM users 
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;
    const dataParams = [...params, limit, offset];
    console.log('Data query:', dataQuery);
    console.log('Data params:', dataParams);
    
    const officers = await query(dataQuery, dataParams) as Officer[];
    console.log('Officers count:', officers.length);

    return NextResponse.json({
      success: true,
      officers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('🔥 ERROR in GET /api/admin/officers:', error);
    return NextResponse.json(
      { error: 'Internal server error', detail: String(error) },
      { status: 500 }
    );
  }
}

// POST - Tambah petugas
export async function POST(request: Request) {
  try {
    console.log('🔥 POST /api/admin/officers started');
    
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { name, email, generatePassword } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Nama dan email wajib diisi' },
        { status: 400 }
      );
    }

    // Cek email sudah ada
    const existingEmail = await query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    ) as { id: number }[];

    if (existingEmail.length > 0) {
      return NextResponse.json(
        { error: 'Email sudah digunakan' },
        { status: 400 }
      );
    }

    let password = body.password;
    let isRandomGenerated = false;

    if (generatePassword || !password) {
      password = generateRandomPassword(10);
      isRandomGenerated = true;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await query(
      `INSERT INTO users (instance_id, name, email, password, role, created_at, updated_at) 
       VALUES (?, ?, ?, ?, 'petugas', NOW(), NOW())`,
      [currentUser.instance_id, name, email, hashedPassword]
    ) as { insertId: number };

    await createActivityLog({
      instance_id: currentUser.instance_id,
      user_id: currentUser.id,
      action: 'INSERT',
      table_name: 'users',
      record_id: result.insertId,
      description: `Menambahkan petugas: ${name} (${email})`,
      new_data: { name, email },
      ip_address: request.headers.get('x-forwarded-for')?.split(',')[0] || undefined,
      user_agent: request.headers.get('user-agent') || undefined,
    });

    return NextResponse.json({
      success: true,
      message: 'Petugas berhasil ditambahkan',
      officerId: result.insertId,
      password: isRandomGenerated ? password : undefined,
      isRandomGenerated,
    });
  } catch (error) {
    console.error('🔥 ERROR in POST /api/admin/officers:', error);
    return NextResponse.json(
      { error: 'Gagal menambahkan petugas', detail: String(error) },
      { status: 500 }
    );
  }
}

// PUT - Edit petugas (tanpa is_active)
export async function PUT(request: Request) {
  try {
    console.log('🔥 PUT /api/admin/officers started');
    
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { id, name, email, resetPassword } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID petugas diperlukan' }, { status: 400 });
    }

    // Get old data
    const oldData = await query(
      'SELECT * FROM users WHERE id = ? AND instance_id = ? AND role = "petugas"',
      [id, currentUser.instance_id]
    ) as Record<string, unknown>[];

    if (oldData.length === 0) {
      return NextResponse.json({ error: 'Petugas tidak ditemukan' }, { status: 404 });
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
        return NextResponse.json(
          { error: 'Email sudah digunakan oleh petugas lain' },
          { status: 400 }
        );
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
        `UPDATE users SET ${updates.join(', ')} WHERE id = ? AND instance_id = ? AND role = 'petugas'`,
        [...values, currentUser.instance_id]
      );
    }

    await createActivityLog({
      instance_id: currentUser.instance_id,
      user_id: currentUser.id,
      action: 'UPDATE',
      table_name: 'users',
      record_id: id,
      description: `Mengupdate petugas: ${oldData[0].name as string}`,
      old_data: oldData[0],
      new_data: { name, email },
      ip_address: request.headers.get('x-forwarded-for')?.split(',')[0] || undefined,
      user_agent: request.headers.get('user-agent') || undefined,
    });

    return NextResponse.json({
      success: true,
      message: resetPassword ? 'Password petugas berhasil direset' : 'Petugas berhasil diupdate',
      resetPassword: resetPassword || false,
      newPassword: resetPassword ? newPassword : undefined,
      isRandomGenerated,
    });
  } catch (error) {
    console.error('🔥 ERROR in PUT /api/admin/officers:', error);
    return NextResponse.json(
      { error: 'Gagal mengupdate petugas', detail: String(error) },
      { status: 500 }
    );
  }
}

// DELETE - Hapus petugas
export async function DELETE(request: Request) {
  try {
    console.log('🔥 DELETE /api/admin/officers started');
    
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID petugas diperlukan' }, { status: 400 });
    }

    const oldData = await query(
      'SELECT * FROM users WHERE id = ? AND instance_id = ? AND role = "petugas"',
      [id, currentUser.instance_id]
    ) as Record<string, unknown>[];

    if (oldData.length === 0) {
      return NextResponse.json({ error: 'Petugas tidak ditemukan' }, { status: 404 });
    }

    await query('DELETE FROM users WHERE id = ? AND instance_id = ? AND role = "petugas"', [id, currentUser.instance_id]);

    await createActivityLog({
      instance_id: currentUser.instance_id,
      user_id: currentUser.id,
      action: 'DELETE',
      table_name: 'users',
      record_id: parseInt(id),
      description: `Menghapus petugas: ${oldData[0].name as string}`,
      old_data: oldData[0],
      ip_address: request.headers.get('x-forwarded-for')?.split(',')[0] || undefined,
      user_agent: request.headers.get('user-agent') || undefined,
    });

    return NextResponse.json({
      success: true,
      message: 'Petugas berhasil dihapus',
    });
  } catch (error) {
    console.error('🔥 ERROR in DELETE /api/admin/officers:', error);
    return NextResponse.json(
      { error: 'Gagal menghapus petugas', detail: String(error) },
      { status: 500 }
    );
  }
}

// PATCH - Bulk action (tanpa is_active, hanya delete)
export async function PATCH(request: Request) {
  try {
    console.log('🔥 PATCH /api/admin/officers started');
    
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { action, ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'Pilih petugas terlebih dahulu' }, { status: 400 });
    }

    const placeholders = ids.map(() => '?').join(',');

    if (action === 'delete') {
      await query(
        `DELETE FROM users WHERE id IN (${placeholders}) AND instance_id = ? AND role = 'petugas'`,
        [...ids, currentUser.instance_id]
      );
    } else {
      return NextResponse.json({ error: 'Aksi tidak dikenal (hanya delete yang tersedia)' }, { status: 400 });
    }

    await createActivityLog({
      instance_id: currentUser.instance_id,
      user_id: currentUser.id,
      action: 'UPDATE',
      table_name: 'users',
      record_id: null,
      description: `Delete ${ids.length} petugas`,
      ip_address: request.headers.get('x-forwarded-for')?.split(',')[0] || undefined,
      user_agent: request.headers.get('user-agent') || undefined,
    });

    return NextResponse.json({
      success: true,
      message: `${ids.length} petugas berhasil dihapus`,
    });
  } catch (error) {
    console.error('🔥 ERROR in PATCH /api/admin/officers:', error);
    return NextResponse.json(
      { error: 'Gagal memproses aksi', detail: String(error) },
      { status: 500 }
    );
  }
}