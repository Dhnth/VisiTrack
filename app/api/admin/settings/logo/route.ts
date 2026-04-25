import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { auth } from '@/lib/auth';
import { createActivityLog } from '@/lib/activity-log';
import { writeFile, mkdir, unlink } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const users = await query(
    'SELECT id, instance_id, role FROM users WHERE email = ?',
    [session.user.email]
  ) as { id: number; instance_id: number; role: string }[];

  const currentUser = users[0];
  if (!currentUser || currentUser.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const instanceId = currentUser.instance_id;

    // Ambil slug dan logo lama
    const instances = await query(
      'SELECT slug, logo FROM instances WHERE id = ?',
      [instanceId]
    ) as { slug: string; logo: string | null }[];

    const slug = instances[0]?.slug;
    const oldLogo = instances[0]?.logo;

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

    // Hapus logo lama jika ada
    if (oldLogo) {
      const oldLogoPath = path.join(process.cwd(), 'public', oldLogo);
      if (existsSync(oldLogoPath)) {
        await unlink(oldLogoPath);
      }
    }

    // Upload logo baru
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

    // Simpan ke database
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