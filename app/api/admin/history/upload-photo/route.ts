import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, unlink } from 'fs/promises';
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
    if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'super_admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const guestId = formData.get('guestId') as string;

    if (!file) {
      return NextResponse.json({ error: 'File tidak ditemukan' }, { status: 400 });
    }

    if (!guestId) {
      return NextResponse.json({ error: 'Guest ID diperlukan' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Format file harus PNG, JPG, atau WebP' },
        { status: 400 }
      );
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Ukuran file maksimal 2MB' },
        { status: 400 }
      );
    }

    // Get instance slug and old photo
    const instanceQuery = await query(
      'SELECT slug FROM instances WHERE id = ?',
      [currentUser.instance_id]
    ) as { slug: string }[];

    const slug = instanceQuery[0]?.slug;
    if (!slug) {
      return NextResponse.json({ error: 'Instance not found' }, { status: 404 });
    }

    // Get old photo URL
    const guestQuery = await query(
      'SELECT photo_url FROM guests WHERE id = ? AND instance_id = ?',
      [parseInt(guestId), currentUser.instance_id]
    ) as { photo_url: string | null }[];

    const oldPhotoUrl = guestQuery[0]?.photo_url;

    // Delete old photo if exists
    if (oldPhotoUrl) {
      const oldPhotoPath = path.join(process.cwd(), 'public', oldPhotoUrl);
      if (existsSync(oldPhotoPath)) {
        await unlink(oldPhotoPath);
      }
    }

    // Save new photo
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const ext = path.extname(file.name);
    const fileName = `guest_${guestId}_${Date.now()}${ext}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', slug, 'guests');
    const filePath = path.join(uploadDir, fileName);

    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    await writeFile(filePath, buffer);
    const photoUrl = `/uploads/${slug}/guests/${fileName}`;

    // Update database
    await query(
      'UPDATE guests SET photo_url = ?, updated_at = NOW() WHERE id = ? AND instance_id = ?',
      [photoUrl, parseInt(guestId), currentUser.instance_id]
    );

    return NextResponse.json({
      success: true,
      message: 'Foto berhasil diupload',
      photoUrl,
    });
  } catch (error) {
    console.error('Upload photo error:', error);
    return NextResponse.json(
      { error: 'Gagal upload foto' },
      { status: 500 }
    );
  }
}