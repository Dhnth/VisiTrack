import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { auth } from '@/lib/auth';
import * as XLSX from 'xlsx';

export async function GET() {
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

  const employees = await query(
    `SELECT nip, name, department, phone, 
            CASE WHEN is_active = 1 THEN 'Aktif' ELSE 'Nonaktif' END as status,
            DATE_FORMAT(created_at, '%d/%m/%Y %H:%i') as created_at
     FROM employees 
     WHERE instance_id = ?
     ORDER BY name ASC`,
    [user.instance_id]
  ) as { nip: string | null; name: string; department: string; phone: string | null; status: string; created_at: string }[];

  const worksheetData = employees.map(emp => ({
    'NIP': emp.nip || '-',
    'Nama': emp.name,
    'Departemen': emp.department,
    'Telepon': emp.phone || '-',
    'Status': emp.status,
    'Tanggal Dibuat': emp.created_at,
  }));

  const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Karyawan');
  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="karyawan_${new Date().toISOString().split('T')[0]}.xlsx"`,
    },
  });
}