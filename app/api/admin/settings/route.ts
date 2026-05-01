import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { auth } from '@/lib/auth';
import { createActivityLog } from '@/lib/activity-log';
import { writeFile, mkdir, unlink } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

interface User {
  id: number;
  instance_id: number;
  role: string;
}

interface Instance {
  name: string;
  slug: string;
  address: string;
  phone: string;
  logo: string | null;
}

interface Settings {
  qr_mode: string;
  token_interval: number | null;
  enable_checkout: number;
  auto_checkout_time: string | null;
  default_password: string;
}

async function getCurrentUser(): Promise<User | null> {
  const session = await auth();
  if (!session?.user?.email) return null;
  
  const users = await query(
    'SELECT id, instance_id, role FROM users WHERE email = ?',
    [session.user.email]
  ) as User[];
  
  return users[0] || null;
}

// GET - Ambil semua pengaturan instansi
export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const instanceId = currentUser.instance_id;

    // Ambil data instansi
    const instances = await query(
      'SELECT name, slug, address, phone, logo FROM instances WHERE id = ?',
      [instanceId]
    ) as Instance[];

    const instance = instances[0];

    if (!instance) {
      return NextResponse.json({ error: 'Instance not found' }, { status: 404 });
    }

    // Ambil semua settings dalam satu baris
    const settings = await query(
      'SELECT qr_mode, token_interval, enable_checkout, auto_checkout_time, default_password FROM settings WHERE instance_id = ? LIMIT 1',
      [instanceId]
    ) as Settings[];

    const setting = settings[0] || { 
      qr_mode: 'static', 
      token_interval: null,
      enable_checkout: 1,
      auto_checkout_time: null,
      default_password: 'password123'
    };

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
        defaultPassword: setting.default_password,
      },
      checkoutSettings: {
        enable_checkout: setting.enable_checkout === 1,
        auto_checkout_time: setting.auto_checkout_time,
      },
    });
  } catch (error) {
    console.error('GET settings error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update profile instansi dan checkout settings
export async function PUT(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { name, address, phone, enable_checkout, auto_checkout_time } = body;
    const instanceId = currentUser.instance_id;
    let hasUpdate = false;

    // Update profil instansi
    const updates: string[] = [];
    const values: (string | number)[] = [];

    if (name !== undefined) { 
      updates.push('name = ?'); 
      values.push(name); 
    }
    if (address !== undefined) { 
      updates.push('address = ?'); 
      values.push(address); 
    }
    if (phone !== undefined) { 
      updates.push('phone = ?'); 
      values.push(phone); 
    }

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
      hasUpdate = true;
    }

    // Update settings (QR, checkout, dll) jika ada
    if (enable_checkout !== undefined || auto_checkout_time !== undefined) {
      const existing = await query(
        'SELECT id FROM settings WHERE instance_id = ?',
        [instanceId]
      ) as { id: number }[];

      if (existing.length > 0) {
        const updateFields: string[] = [];
        const updateValues: (string | number | null)[] = [];

        if (enable_checkout !== undefined) {
          updateFields.push('enable_checkout = ?');
          updateValues.push(enable_checkout ? 1 : 0);
        }
        if (auto_checkout_time !== undefined) {
          updateFields.push('auto_checkout_time = ?');
          updateValues.push(auto_checkout_time || null);
        }
        updateFields.push('updated_at = NOW()');
        updateValues.push(instanceId);

        await query(
          `UPDATE settings SET ${updateFields.join(', ')} WHERE instance_id = ?`,
          updateValues
        );
      } else {
        await query(
          `INSERT INTO settings (instance_id, qr_mode, token_interval, enable_checkout, auto_checkout_time, default_password, created_at, updated_at) 
           VALUES (?, 'static', NULL, ?, ?, 'password123', NOW(), NOW())`,
          [instanceId, enable_checkout !== undefined ? (enable_checkout ? 1 : 0) : 1, auto_checkout_time || null]
        );
      }
      hasUpdate = true;
    }

    if (!hasUpdate) {
      return NextResponse.json({ error: 'No data to update' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Pengaturan berhasil diupdate',
    });
  } catch (error) {
    console.error('PUT settings error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH - Update QR settings
export async function PATCH(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

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
        `INSERT INTO settings (instance_id, qr_mode, token_interval, enable_checkout, auto_checkout_time, default_password, created_at, updated_at) 
         VALUES (?, ?, ?, 1, NULL, 'password123', NOW(), NOW())`,
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
    console.error('PATCH settings error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Update default password untuk import
export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

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
      'SELECT id FROM settings WHERE instance_id = ?',
      [instanceId]
    ) as { id: number }[];

    if (existing.length > 0) {
      await query(
        'UPDATE settings SET default_password = ?, updated_at = NOW() WHERE instance_id = ?',
        [defaultPassword, instanceId]
      );
    } else {
      await query(
        `INSERT INTO settings (instance_id, qr_mode, token_interval, enable_checkout, auto_checkout_time, default_password, created_at, updated_at) 
         VALUES (?, 'static', NULL, 1, NULL, ?, NOW(), NOW())`,
        [instanceId, defaultPassword]
      );
    }

    await createActivityLog({
      instance_id: instanceId,
      user_id: currentUser.id,
      action: 'UPDATE',
      table_name: 'settings',
      record_id: instanceId,
      description: 'Mengupdate default password import',
      new_data: { defaultPassword },
      ip_address: request.headers.get('x-forwarded-for')?.split(',')[0] || undefined,
      user_agent: request.headers.get('user-agent') || undefined,
    });

    return NextResponse.json({
      success: true,
      message: 'Default password import berhasil diupdate',
    });
  } catch (error) {
    console.error('POST settings error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}