import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { createActivityLog } from '@/lib/activity-log';
import { auth } from '@/lib/auth';

interface AdminRow {
  id: number;
  name: string;
  email: string;
  role: string;
  instance_id: number;
  instance_name: string;
  instance_slug: string;
  created_at: Date;
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

async function getCurrentUser() {
  const session = await auth();
  if (!session?.user?.email) return null;
  
  const users = await query(
    'SELECT id, instance_id, role FROM users WHERE email = ?',
    [session.user.email]
  ) as { id: number; instance_id: number | null; role: string }[];
  
  return users[0] || null;
}

// GET - Ambil semua admin instansi
export async function GET() {
  try {
    const admins = await query(`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.role,
        u.instance_id,
        u.created_at,
        i.name as instance_name,
        i.slug as instance_slug
      FROM users u
      LEFT JOIN instances i ON u.instance_id = i.id
      WHERE u.role = 'admin'
      ORDER BY u.created_at DESC
    `) as AdminRow[];

    const formattedAdmins = admins.map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      role: row.role,
      instance_id: row.instance_id,
      instance_name: row.instance_name,
      instance_slug: row.instance_slug,
      created_at: row.created_at,
    }));

    return NextResponse.json({
      success: true,
      admins: formattedAdmins,
    });
  } catch (error) {
    console.error('Admins API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch admins' },
      { status: 500 }
    );
  }
}

// POST - Tambah admin baru
export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    const body = await request.json();
    const { name, email, instance_id, generatePassword } = body;

    if (!name || !email || !instance_id) {
      return NextResponse.json(
        { success: false, error: 'Nama, email, dan instansi wajib diisi' },
        { status: 400 }
      );
    }

    const existingEmail = await query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    ) as { id: number }[];

    if (existingEmail.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Email sudah digunakan' },
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
      `INSERT INTO users (name, email, password, role, instance_id, created_at, updated_at) 
       VALUES (?, ?, ?, 'admin', ?, NOW(), NOW())`,
      [name, email, hashedPassword, instance_id]
    ) as { insertId: number };

    const instance = await query(
      'SELECT name FROM instances WHERE id = ?',
      [instance_id]
    ) as { name: string }[];

    if (currentUser) {
      await createActivityLog({
        instance_id: currentUser.instance_id,
        user_id: currentUser.id,
        action: 'INSERT',
        table_name: 'users',
        record_id: result.insertId,
        description: `Menambahkan admin baru: ${name} (${email}) untuk instansi ${instance[0]?.name}`,
        new_data: { name, email, instance_id, role: 'admin' },
        ip_address: request.headers.get('x-forwarded-for') || undefined,
        user_agent: request.headers.get('user-agent') || undefined,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Admin berhasil ditambahkan',
      adminId: result.insertId,
      instance_name: instance[0]?.name,
      password: isRandomGenerated ? password : undefined,
      isRandomGenerated,
    });
  } catch (error) {
    console.error('Create Admin Error:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menambahkan admin' },
      { status: 500 }
    );
  }
}

// PUT - Edit admin
export async function PUT(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    const body = await request.json();
    const { id, name, email, password, instance_id, resetPassword } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID admin diperlukan' },
        { status: 400 }
      );
    }

    const oldData = await query(
      'SELECT name, email, instance_id FROM users WHERE id = ? AND role = "admin"',
      [id]
    ) as { name: string; email: string; instance_id: number }[];

    const updates: string[] = [];
    const values: (string | number)[] = [];

    if (name) {
      updates.push('name = ?');
      values.push(name);
    }
    if (email) {
      const existingEmail = await query(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email, id]
      ) as { id: number }[];
      if (existingEmail.length > 0) {
        return NextResponse.json(
          { success: false, error: 'Email sudah digunakan oleh admin lain' },
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
    } else if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updates.push('password = ?');
      values.push(hashedPassword);
    }
    
    if (instance_id) {
      updates.push('instance_id = ?');
      values.push(instance_id);
    }

    updates.push('updated_at = NOW()');
    values.push(id);

    if (updates.length > 1) {
      await query(
        `UPDATE users SET ${updates.join(', ')} WHERE id = ? AND role = 'admin'`,
        values
      );
    }

    if (currentUser && oldData[0]) {
      const newData: Record<string, unknown> = {};
      if (name) newData.name = name;
      if (email) newData.email = email;
      if (instance_id) newData.instance_id = instance_id;
      if (resetPassword) newData.password_reset = true;

      let description = `Mengupdate admin: ${oldData[0].name}`;
      if (resetPassword) description += ' (password direset)';
      
      await createActivityLog({
        instance_id: currentUser.instance_id,
        user_id: currentUser.id,
        action: 'UPDATE',
        table_name: 'users',
        record_id: parseInt(id),
        description,
        old_data: oldData[0],
        new_data: newData,
        ip_address: request.headers.get('x-forwarded-for') || undefined,
        user_agent: request.headers.get('user-agent') || undefined,
      });
    }

    return NextResponse.json({
      success: true,
      message: resetPassword ? 'Password berhasil direset' : 'Admin berhasil diupdate',
      resetPassword: resetPassword || false,
      newPassword: resetPassword ? newPassword : undefined,
      isRandomGenerated,
    });
  } catch (error) {
    console.error('Update Admin Error:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengupdate admin' },
      { status: 500 }
    );
  }
}

// DELETE - Hapus admin
export async function DELETE(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID admin diperlukan' },
        { status: 400 }
      );
    }

    const oldData = await query(
      'SELECT name, email, instance_id FROM users WHERE id = ? AND role = "admin"',
      [id]
    ) as { name: string; email: string; instance_id: number }[];

    const guestsCount = await query(
      'SELECT COUNT(*) as total FROM guests WHERE created_by = ?',
      [id]
    ) as { total: number }[];

    if (guestsCount[0].total > 0) {
      return NextResponse.json(
        { success: false, error: 'Tidak bisa menghapus admin yang sudah memiliki data tamu' },
        { status: 400 }
      );
    }

    await query('DELETE FROM users WHERE id = ? AND role = "admin"', [id]);

    if (currentUser && oldData[0]) {
      await createActivityLog({
        instance_id: currentUser.instance_id,
        user_id: currentUser.id,
        action: 'DELETE',
        table_name: 'users',
        record_id: parseInt(id),
        description: `Menghapus admin: ${oldData[0].name} (${oldData[0].email})`,
        old_data: oldData[0],
        ip_address: request.headers.get('x-forwarded-for') || undefined,
        user_agent: request.headers.get('user-agent') || undefined,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Admin berhasil dihapus',
    });
  } catch (error) {
    console.error('Delete Admin Error:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menghapus admin' },
      { status: 500 }
    );
  }
}