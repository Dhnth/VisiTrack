import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { auth } from '@/lib/auth';
import { createActivityLog } from '@/lib/activity-log';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

async function getCurrentUser() {
  const session = await auth();
  if (!session?.user?.email) return null;
  
  const users = await query(
    'SELECT id, instance_id, role FROM users WHERE email = ?',
    [session.user.email]
  ) as { id: number; instance_id: number; role: string }[];
  
  return users[0] || null;
}

// GET - Ambil semua pengaturan instansi
export async function GET() {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const instanceId = currentUser.instance_id;

  // Ambil data instansi
  const instances = await query(
    'SELECT name, slug, address, phone, logo FROM instances WHERE id = ?',
    [instanceId]
  ) as { name: string; slug: string; address: string; phone: string; logo: string | null }[];

  const instance = instances[0];

  if (!instance) {
    return NextResponse.json({ error: 'Instance not found' }, { status: 404 });
  }

  // Ambil settings (QR mode)
  const settings = await query(
    'SELECT qr_mode, token_interval FROM settings WHERE instance_id = ?',
    [instanceId]
  ) as { qr_mode: string; token_interval: number | null }[];

  const setting = settings[0] || { qr_mode: 'static', token_interval: null };

  // Ambil default password untuk import
  const importSettings = await query(
    "SELECT setting_value FROM settings WHERE instance_id = ? AND setting_key = 'import_default_password'",
    [instanceId]
  ) as { setting_value: string }[];

  const defaultPassword = importSettings[0]?.setting_value || 'password123';

  return NextResponse.json({
    success: true,
    instance: {
      name: instance.name,
      slug: instance.slug,
      address: instance.address,
      phone: instance.phone,
      logo: instance.logo,
    },
    qrSettings: {
      qr_mode: setting.qr_mode,
      token_interval: setting.token_interval,
    },
    importSettings: {
      defaultPassword,
    },
  });
}

// PUT - Update profile instansi
export async function PUT(request: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { name, address, phone } = body;
    const instanceId = currentUser.instance_id;

    const updates: string[] = [];
    const values: (string | number)[] = [];

    if (name) { updates.push('name = ?'); values.push(name); }
    if (address) { updates.push('address = ?'); values.push(address); }
    if (phone) { updates.push('phone = ?'); values.push(phone); }

    if (updates.length > 0) {
      updates.push('updated_at = NOW()');
      values.push(instanceId);

      await query(
        `UPDATE instances SET ${updates.join(', ')} WHERE id = ?`,
        values
      );

      await createActivityLog({
        instance_id: instanceId,
        user_id: currentUser.id,
        action: 'UPDATE',
        table_name: 'instances',
        record_id: instanceId,
        description: 'Mengupdate profil instansi',
        new_data: { name, address, phone },
        ip_address: request.headers.get('x-forwarded-for')?.split(',')[0] || undefined,
        user_agent: request.headers.get('user-agent') || undefined,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Profil instansi berhasil diupdate',
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: 'Gagal mengupdate profil instansi' },
      { status: 500 }
    );
  }
}

// PATCH - Update QR settings
export async function PATCH(request: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { qr_mode, token_interval } = body;
    const instanceId = currentUser.instance_id;

    const existing = await query(
      'SELECT id FROM settings WHERE instance_id = ?',
      [instanceId]
    ) as { id: number }[];

    if (existing.length > 0) {
      await query(
        'UPDATE settings SET qr_mode = ?, token_interval = ?, updated_at = NOW() WHERE instance_id = ?',
        [qr_mode, token_interval || null, instanceId]
      );
    } else {
      await query(
        'INSERT INTO settings (instance_id, qr_mode, token_interval, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())',
        [instanceId, qr_mode, token_interval || null]
      );
    }

    await createActivityLog({
      instance_id: instanceId,
      user_id: currentUser.id,
      action: 'UPDATE',
      table_name: 'settings',
      record_id: instanceId,
      description: `Mengupdate pengaturan QR: mode ${qr_mode}${token_interval ? `, interval ${token_interval} menit` : ''}`,
      new_data: { qr_mode, token_interval },
      ip_address: request.headers.get('x-forwarded-for')?.split(',')[0] || undefined,
      user_agent: request.headers.get('user-agent') || undefined,
    });

    return NextResponse.json({
      success: true,
      message: 'Pengaturan QR berhasil diupdate',
    });
  } catch (error) {
    console.error('Update QR settings error:', error);
    return NextResponse.json(
      { error: 'Gagal mengupdate pengaturan QR' },
      { status: 500 }
    );
  }
}

// POST - Update default password untuk import
export async function POST(request: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { defaultPassword } = body;
    const instanceId = currentUser.instance_id;

    if (!defaultPassword || defaultPassword.length < 4) {
      return NextResponse.json(
        { error: 'Password minimal 4 karakter' },
        { status: 400 }
      );
    }

    const existing = await query(
      "SELECT id FROM settings WHERE instance_id = ? AND setting_key = 'import_default_password'",
      [instanceId]
    ) as { id: number }[];

    if (existing.length > 0) {
      await query(
        "UPDATE settings SET setting_value = ?, updated_at = NOW() WHERE instance_id = ? AND setting_key = 'import_default_password'",
        [defaultPassword, instanceId]
      );
    } else {
      await query(
        "INSERT INTO settings (instance_id, setting_key, setting_value, created_at, updated_at) VALUES (?, 'import_default_password', ?, NOW(), NOW())",
        [instanceId, defaultPassword]
      );
    }

    await createActivityLog({
      instance_id: instanceId,
      user_id: currentUser.id,
      action: 'UPDATE',
      table_name: 'settings',
      record_id: instanceId,
      description: `Mengupdate default password import menjadi: ${defaultPassword}`,
      new_data: { defaultPassword },
      ip_address: request.headers.get('x-forwarded-for')?.split(',')[0] || undefined,
      user_agent: request.headers.get('user-agent') || undefined,
    });

    return NextResponse.json({
      success: true,
      message: 'Default password import berhasil diupdate',
    });
  } catch (error) {
    console.error('Update default password error:', error);
    return NextResponse.json(
      { error: 'Gagal mengupdate default password' },
      { status: 500 }
    );
  }
}

// POST - Upload logo (dipisah ke endpoint terpisah)
export async function POST_LOGO(request: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const instanceId = currentUser.instance_id;

    // Ambil slug instansi
    const instances = await query(
      'SELECT slug FROM instances WHERE id = ?',
      [instanceId]
    ) as { slug: string }[];

    const slug = instances[0]?.slug;
    if (!slug) {
      return NextResponse.json({ error: 'Instance not found' }, { status: 404 });
    }

    if (!file) {
      return NextResponse.json({ error: 'File tidak ditemukan' }, { status: 400 });
    }

    const allowedTypes = ['image/png', 'image/jpeg', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Format file harus PNG, JPG, atau SVG' },
        { status: 400 }
      );
    }

    if (file.size > 1024 * 1024) {
      return NextResponse.json(
        { error: 'Ukuran file maksimal 1MB' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const ext = path.extname(file.name);
    const fileName = `logo${ext}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', slug);
    const filePath = path.join(uploadDir, fileName);

    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    await writeFile(filePath, buffer);
    const logoUrl = `/uploads/${slug}/logo${ext}`;

    await query(
      'UPDATE instances SET logo = ?, updated_at = NOW() WHERE id = ?',
      [logoUrl, instanceId]
    );

    await createActivityLog({
      instance_id: instanceId,
      user_id: currentUser.id,
      action: 'UPDATE',
      table_name: 'instances',
      record_id: instanceId,
      description: 'Mengupdate logo instansi',
      new_data: { logo: logoUrl },
      ip_address: request.headers.get('x-forwarded-for')?.split(',')[0] || undefined,
      user_agent: request.headers.get('user-agent') || undefined,
    });

    return NextResponse.json({
      success: true,
      message: 'Logo berhasil diupload',
      logoUrl,
    });
  } catch (error) {
    console.error('Upload logo error:', error);
    return NextResponse.json(
      { error: 'Gagal upload logo' },
      { status: 500 }
    );
  }
}