import { NextRequest, NextResponse } from 'next/server';
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
  name: string;
  email: string;
}

interface GuestDetail {
  id: number;
  name: string;
  nik: string | null;
  institution: string | null;
  purpose: string;
  photo_url: string | null;
  status: string;
  created_at: string;
  employee_name: string | null;
  employee_department: string | null;
}

async function getCurrentUser(): Promise<User | null> {
  const session = await auth();
  if (!session?.user?.email) return null;
  
  const users = await query(
    'SELECT id, instance_id, role, name, email FROM users WHERE email = ?',
    [session.user.email]
  ) as User[];
  
  return users[0] || null;
}

// GET - Detail pending guest
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'petugas') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const resolvedParams = await params;
    const guestId = parseInt(resolvedParams.id);
    
    if (isNaN(guestId)) {
      return NextResponse.json({ error: 'Invalid guest ID' }, { status: 400 });
    }

    const instanceId = currentUser.instance_id;

    const guestResult = await query(
      `SELECT 
        g.id,
        g.name,
        g.nik,
        g.institution,
        g.purpose,
        g.photo_url,
        g.status,
        g.created_at,
        e.name as employee_name,
        e.department as employee_department
      FROM guests g
      LEFT JOIN employees e ON g.employee_id = e.id
      WHERE g.id = ? AND g.instance_id = ? AND g.status = 'pending'`,
      [guestId, instanceId]
    ) as GuestDetail[];

    if (guestResult.length === 0) {
      return NextResponse.json({ error: 'Guest not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      guest: guestResult[0],
    });
  } catch (error) {
    console.error('Pending Detail GET API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Upload ulang foto
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'petugas') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const resolvedParams = await params;
    const guestId = parseInt(resolvedParams.id);
    
    if (isNaN(guestId)) {
      return NextResponse.json({ error: 'Invalid guest ID' }, { status: 400 });
    }

    const instanceId = currentUser.instance_id;

    // Get instance slug
    const instanceResult = await query(
      'SELECT slug FROM instances WHERE id = ?',
      [instanceId]
    ) as { slug: string }[];

    const slug = instanceResult[0]?.slug;
    if (!slug) {
      return NextResponse.json({ error: 'Instance not found' }, { status: 404 });
    }

    // Get old photo
    const oldPhotoResult = await query(
      'SELECT photo_url, name FROM guests WHERE id = ? AND instance_id = ?',
      [guestId, instanceId]
    ) as { photo_url: string | null; name: string }[];

    if (oldPhotoResult.length === 0) {
      return NextResponse.json({ error: 'Guest not found' }, { status: 404 });
    }

    const oldPhotoUrl = oldPhotoResult[0].photo_url;
    const guestName = oldPhotoResult[0].name;

    // Get file from form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 400 });
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
      [photoUrl, guestId, instanceId]
    );

    // Create activity log
    await createActivityLog({
      instance_id: instanceId,
      user_id: currentUser.id,
      action: 'UPDATE',
      table_name: 'guests',
      record_id: guestId,
      description: `Meminta ulang foto untuk tamu: ${guestName}`,
      new_data: { photo_url: photoUrl },
    });

    return NextResponse.json({
      success: true,
      message: 'Foto berhasil diupload',
      photo_url: photoUrl,
    });
  } catch (error) {
    console.error('Upload Photo API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}