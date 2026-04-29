import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';
import { auth } from '@/lib/auth';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const users = await query(
      'SELECT id, instance_id, role FROM users WHERE email = ?',
      [session.user.email]
    ) as { id: number; instance_id: number; role: string }[];

    const currentUser = users[0];
    if (!currentUser || currentUser.role !== 'petugas') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'File tidak ditemukan' }, { status: 400 });
    }

    // Validasi file
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Format file harus PNG, JPG, atau WebP' },
        { status: 400 }
      );
    }

    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Ukuran file maksimal 2MB' },
        { status: 400 }
      );
    }

    // Get instance slug
    const instanceResult = await query(
      'SELECT slug FROM instances WHERE id = ?',
      [currentUser.instance_id]
    ) as { slug: string }[];

    const slug = instanceResult[0]?.slug;
    if (!slug) {
      return NextResponse.json({ error: 'Instance not found' }, { status: 404 });
    }

    // Simpan file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const timestamp = Date.now();
    const ext = path.extname(file.name);
    const fileName = `temp_${timestamp}${ext}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', slug, 'temp');
    const filePath = path.join(uploadDir, fileName);

    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    await writeFile(filePath, buffer);
    const fileUrl = `/uploads/${slug}/temp/${fileName}`;

    return NextResponse.json({
      success: true,
      url: fileUrl,
    });
  } catch (error) {
    console.error('Upload temp error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}