import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { auth } from '@/lib/auth';
import ExcelJS from 'exceljs';

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

  const ppids = await query(
    `SELECT name, email, DATE_FORMAT(created_at, '%d/%m/%Y %H:%i') as created_at
     FROM users 
     WHERE instance_id = ? AND role = 'ppid'
     ORDER BY name ASC`,
    [user.instance_id]
  ) as { name: string; email: string; created_at: string }[];

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Data PPID');

  worksheet.columns = [
    { header: 'No', key: 'no', width: 8 },
    { header: 'Nama', key: 'name', width: 30 },
    { header: 'Email', key: 'email', width: 35 },
    { header: 'Tanggal Dibuat', key: 'created_at', width: 20 },
  ];

  const headerRow = worksheet.getRow(1);
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF800016' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
  });

  ppids.forEach((ppid, index) => {
    const row = worksheet.addRow({
      no: index + 1,
      name: ppid.name,
      email: ppid.email,
      created_at: ppid.created_at,
    });
    row.eachCell((cell) => {
      cell.alignment = { vertical: 'middle' };
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    });
  });

  worksheet.addRow([]);
  const totalRow = worksheet.addRow({ name: `Total PPID: ${ppids.length}` });
  totalRow.getCell(1).font = { bold: true };

  worksheet.autoFilter = 'A1:D1';

  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="ppid_${new Date().toISOString().split('T')[0]}.xlsx"`,
    },
  });
}