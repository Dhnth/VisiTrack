import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { auth } from '@/lib/auth';
import { createActivityLog } from '@/lib/activity-log';
import ExcelJS from 'exceljs';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const users = await query(
    'SELECT id, instance_id FROM users WHERE email = ? AND role = "admin"',
    [session.user.email]
  ) as { id: number; instance_id: number }[];

  const user = users[0];
  if (!user) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'File tidak ditemukan' }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);

    const worksheet = workbook.getWorksheet(1);
    if (!worksheet) {
      return NextResponse.json({ error: 'Worksheet tidak ditemukan' }, { status: 400 });
    }

    // Ambil default password dari kolom default_password
    const settings = await query(
      'SELECT default_password FROM settings WHERE instance_id = ? LIMIT 1',
      [user.instance_id]
    ) as { default_password: string }[];

    const defaultPasswordPlain = settings[0]?.default_password || 'password123';
    const defaultPassword = await bcrypt.hash(defaultPasswordPlain, 10);

    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    for (let i = 2; i <= worksheet.rowCount; i++) {
      const row = worksheet.getRow(i);
      const name = row.getCell(1).toString().trim();
      const email = row.getCell(2).toString().trim();

      if (!name && !email) continue;

      if (!name || !email) {
        errorCount++;
        errors.push(`Baris ${i}: Nama dan Email wajib diisi`);
        continue;
      }

      const existing = await query(
        'SELECT id FROM users WHERE email = ?',
        [email]
      ) as { id: number }[];

      if (existing.length === 0) {
        await query(
          `INSERT INTO users (instance_id, name, email, password, role, created_at, updated_at) 
           VALUES (?, ?, ?, ?, 'petugas', NOW(), NOW())`,
          [user.instance_id, name, email, defaultPassword]
        );
        successCount++;
      } else {
        errorCount++;
        errors.push(`Baris ${i}: Email ${email} sudah digunakan`);
      }
    }

    await createActivityLog({
      instance_id: user.instance_id,
      user_id: user.id,
      action: 'INSERT',
      table_name: 'users',
      record_id: null,
      description: `Import ${successCount} petugas dari Excel${errorCount > 0 ? ` (${errorCount} gagal)` : ''}`,
      ip_address: request.headers.get('x-forwarded-for')?.split(',')[0] || undefined,
      user_agent: request.headers.get('user-agent') || undefined,
    });

    return NextResponse.json({
      success: true,
      message: `Berhasil import ${successCount} petugas${errorCount > 0 ? `, ${errorCount} gagal` : ''}`,
      successCount,
      errorCount,
      errors: errors.slice(0, 10),
    });
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json(
      { error: 'Gagal import file Excel. Pastikan format file sesuai.' },
      { status: 500 }
    );
  }
}