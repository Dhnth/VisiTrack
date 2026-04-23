import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { auth } from '@/lib/auth';
import { createActivityLog } from '@/lib/activity-log';
import * as XLSX from 'xlsx';

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
    const workbook = XLSX.read(buffer);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet) as Record<string, string>[];

    let successCount = 0;
    let errorCount = 0;

    for (const row of data) {
      const name = row['Nama'] || row['name'];
      const department = row['Departemen'] || row['department'];
      const nip = row['NIP'] || row['nip'];
      const phone = row['Telepon'] || row['phone'];

      if (!name || !department) {
        errorCount++;
        continue;
      }

      await query(
        `INSERT INTO employees (instance_id, nip, name, department, phone, is_active, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, 1, NOW(), NOW())`,
        [user.instance_id, nip || null, name, department, phone || null]
      );
      successCount++;
    }

    await createActivityLog({
      instance_id: user.instance_id,
      user_id: user.id,
      action: 'INSERT',
      table_name: 'employees',
      record_id: null,
      description: `Import ${successCount} karyawan dari Excel`,
      ip_address: request.headers.get('x-forwarded-for')?.split(',')[0] || undefined,
      user_agent: request.headers.get('user-agent') || undefined,
    });

    return NextResponse.json({
      success: true,
      message: `Berhasil import ${successCount} karyawan${errorCount > 0 ? `, ${errorCount} gagal` : ''}`,
    });
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json(
      { error: 'Gagal import file Excel' },
      { status: 500 }
    );
  }
}