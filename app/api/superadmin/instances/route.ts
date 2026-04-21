import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { createActivityLog } from '@/lib/activity-log';
import { auth } from '@/lib/auth';

interface InstanceRow {
  id: number;
  name: string;
  slug: string;
  address: string;
  phone: string;
  plan: string;
  subscription_status: string;
  subscription_end: Date;
  is_active: number;
  total_users: number;
  total_guests: number;
  created_at: Date;
}

// Helper untuk ambil user dari session
async function getCurrentUser() {
  const session = await auth();
  if (!session?.user?.email) return null;
  
  const users = await query(
    'SELECT id, instance_id, role FROM users WHERE email = ?',
    [session.user.email]
  ) as { id: number; instance_id: number | null; role: string }[];
  
  return users[0] || null;
}

// GET - Ambil semua instansi
export async function GET() {
  try {
    const instances = await query(`
      SELECT 
        i.id,
        i.name,
        i.slug,
        i.address,
        i.phone,
        i.plan,
        i.subscription_status,
        i.subscription_end,
        i.is_active,
        i.created_at,
        COUNT(DISTINCT u.id) as total_users,
        COUNT(DISTINCT g.id) as total_guests
      FROM instances i
      LEFT JOIN users u ON u.instance_id = i.id
      LEFT JOIN guests g ON g.instance_id = i.id
      GROUP BY i.id
      ORDER BY i.created_at DESC
    `) as InstanceRow[];

    const formattedInstances = instances.map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      address: row.address,
      phone: row.phone,
      plan: row.plan,
      subscription_status: row.subscription_status,
      subscription_end: row.subscription_end,
      is_active: row.is_active === 1,
      total_users: row.total_users,
      total_guests: row.total_guests,
      created_at: row.created_at,
      days_left: Math.ceil((new Date(row.subscription_end).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
    }));

    return NextResponse.json({
      success: true,
      instances: formattedInstances,
    });
  } catch (error) {
    console.error('Instances API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch instances' },
      { status: 500 }
    );
  }
}

// POST - Tambah instansi baru
export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    const body = await request.json();
    const { name, slug, address, phone, plan, subscription_end } = body;

    if (!name || !slug || !address || !phone || !plan || !subscription_end) {
      return NextResponse.json(
        { success: false, error: 'Semua field wajib diisi' },
        { status: 400 }
      );
    }

    const existingSlug = await query(
      'SELECT id FROM instances WHERE slug = ?',
      [slug]
    ) as { id: number }[];

    if (existingSlug.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Slug sudah digunakan. Gunakan slug lain.' },
        { status: 400 }
      );
    }

    const subscription_start = new Date().toISOString().split('T')[0];
    const subscription_status = new Date(subscription_end) > new Date() ? 'active' : 'expired';

    const result = await query(
      `INSERT INTO instances 
        (name, slug, address, phone, plan, subscription_start, subscription_end, subscription_status, is_active, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [name, slug, address, phone, plan, subscription_start, subscription_end, subscription_status, 1]
    ) as { insertId: number };

    await query(
      `INSERT INTO settings (instance_id, qr_mode, created_at, updated_at) 
       VALUES (?, 'static', NOW(), NOW())`,
      [result.insertId]
    );

    // LOG ACTIVITY
    if (currentUser) {
      await createActivityLog({
        instance_id: null,
        user_id: currentUser.id,
        action: 'INSERT',
        table_name: 'instances',
        record_id: result.insertId,
        description: `Menambahkan instansi baru: ${name} (${slug})`,
        new_data: { name, slug, address, phone, plan, subscription_end },
        ip_address: request.headers.get('x-forwarded-for') || undefined,
        user_agent: request.headers.get('user-agent') || undefined,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Instansi berhasil ditambahkan',
      instanceId: result.insertId,
    });
  } catch (error) {
    console.error('Create Instance Error:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menambahkan instansi' },
      { status: 500 }
    );
  }
}

// PUT - Edit instansi
export async function PUT(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    const body = await request.json();
    const { id, name, slug, address, phone, plan, subscription_end, is_active } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID instansi diperlukan' },
        { status: 400 }
      );
    }

    const oldData = await query(
      'SELECT * FROM instances WHERE id = ?',
      [id]
    ) as Record<string, unknown>[];

    if (slug) {
      const existingSlug = await query(
        'SELECT id FROM instances WHERE slug = ? AND id != ?',
        [slug, id]
      ) as { id: number }[];

      if (existingSlug.length > 0) {
        return NextResponse.json(
          { success: false, error: 'Slug sudah digunakan. Gunakan slug lain.' },
          { status: 400 }
        );
      }
    }

    let subscription_status = '';
    if (subscription_end) {
      subscription_status = new Date(subscription_end) > new Date() ? 'active' : 'expired';
    }

    const updates: string[] = [];
    const values: (string | number | boolean)[] = [];

    if (name) { updates.push('name = ?'); values.push(name); }
    if (slug) { updates.push('slug = ?'); values.push(slug); }
    if (address) { updates.push('address = ?'); values.push(address); }
    if (phone) { updates.push('phone = ?'); values.push(phone); }
    if (plan) { updates.push('plan = ?'); values.push(plan); }
    if (subscription_end) { updates.push('subscription_end = ?'); values.push(subscription_end); }
    if (subscription_status) { updates.push('subscription_status = ?'); values.push(subscription_status); }
    if (is_active !== undefined) { updates.push('is_active = ?'); values.push(is_active ? 1 : 0); }

    updates.push('updated_at = NOW()');
    values.push(id);

    if (updates.length > 1) {
      await query(
        `UPDATE instances SET ${updates.join(', ')} WHERE id = ?`,
        values
      );
    }

    if (currentUser && oldData[0]) {
      const newData: Record<string, unknown> = {};
      if (name) newData.name = name;
      if (slug) newData.slug = slug;
      if (address) newData.address = address;
      if (phone) newData.phone = phone;
      if (plan) newData.plan = plan;
      if (subscription_end) newData.subscription_end = subscription_end;
      if (is_active !== undefined) newData.is_active = is_active;

      await createActivityLog({
        instance_id: null,
        user_id: currentUser.id,
        action: 'UPDATE',
        table_name: 'instances',
        record_id: parseInt(id),
        description: `Mengupdate instansi: ${oldData[0].name as string}`,
        old_data: oldData[0],
        new_data: newData,
        ip_address: request.headers.get('x-forwarded-for') || undefined,
        user_agent: request.headers.get('user-agent') || undefined,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Instansi berhasil diupdate',
    });
  } catch (error) {
    console.error('Update Instance Error:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengupdate instansi' },
      { status: 500 }
    );
  }
}

// DELETE - Hapus instansi
export async function DELETE(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID instansi diperlukan' },
        { status: 400 }
      );
    }

    const oldData = await query(
      'SELECT name, slug FROM instances WHERE id = ?',
      [id]
    ) as { name: string; slug: string }[];

    const usersCount = await query(
      'SELECT COUNT(*) as total FROM users WHERE instance_id = ?',
      [id]
    ) as { total: number }[];
    const guestsCount = await query(
      'SELECT COUNT(*) as total FROM guests WHERE instance_id = ?',
      [id]
    ) as { total: number }[];

    if (usersCount[0].total > 0 || guestsCount[0].total > 0) {
      return NextResponse.json(
        { success: false, error: 'Tidak bisa menghapus instansi yang sudah memiliki data pengguna atau tamu' },
        { status: 400 }
      );
    }

    await query('DELETE FROM settings WHERE instance_id = ?', [id]);
    await query('DELETE FROM access_token WHERE instance_id = ?', [id]);
    await query('DELETE FROM activity_logs WHERE instance_id = ?', [id]);
    await query('DELETE FROM instances WHERE id = ?', [id]);

    if (currentUser && oldData[0]) {
      await createActivityLog({
        instance_id: null,
        user_id: currentUser.id,
        action: 'DELETE',
        table_name: 'instances',
        record_id: parseInt(id),
        description: `Menghapus instansi: ${oldData[0].name} (${oldData[0].slug})`,
        old_data: oldData[0],
        ip_address: request.headers.get('x-forwarded-for') || undefined,
        user_agent: request.headers.get('user-agent') || undefined,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Instansi berhasil dihapus',
    });
  } catch (error) {
    console.error('Delete Instance Error:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menghapus instansi' },
      { status: 500 }
    );
  }
}