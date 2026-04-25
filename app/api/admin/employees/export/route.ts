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

  const employees = await query(
    `SELECT nip, name, department, phone, 
            CASE WHEN is_active = 1 THEN 'Aktif' ELSE 'Nonaktif' END as status,
            DATE_FORMAT(created_at, '%d/%m/%Y %H:%i') as created_at
     FROM employees 
     WHERE instance_id = ?
     ORDER BY name ASC`,
    [user.instance_id]
  ) as { nip: string | null; name: string; department: string; phone: string | null; status: string; created_at: string }[];

  // Buat workbook dan worksheet
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Data Karyawan');

  // Set kolom
  worksheet.columns = [
    { header: 'No', key: 'no', width: 8 },
    { header: 'NIP', key: 'nip', width: 15 },
    { header: 'Nama', key: 'name', width: 25 },
    { header: 'Departemen', key: 'department', width: 20 },
    { header: 'Telepon', key: 'phone', width: 15 },
    { header: 'Status', key: 'status', width: 12 },
    { header: 'Tanggal Dibuat', key: 'created_at', width: 18 },
  ];

  // Style Header
  const headerRow = worksheet.getRow(1);
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF800016' } // warna maroon (#800016)
    };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
  });

  // Isi data
  employees.forEach((emp, index) => {
    const row = worksheet.addRow({
      no: index + 1,
      nip: emp.nip || '-',
      name: emp.name,
      department: emp.department,
      phone: emp.phone || '-',
      status: emp.status,
      created_at: emp.created_at,
    });

    // Style baris data
    row.eachCell((cell, colNumber) => {
      cell.alignment = { vertical: 'middle' };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      
      // Warna khusus untuk status
      if (colNumber === 6) {
        if (emp.status === 'Aktif') {
          cell.font = { color: { argb: 'FF10B981' } }; // hijau
        } else {
          cell.font = { color: { argb: 'FFEF4444' } }; // merah
        }
      }
    });
  });

  // Tambah total baris
  worksheet.addRow([]);
  const totalRow = worksheet.addRow({
    name: `Total Karyawan: ${employees.length}`,
  });
  totalRow.getCell(1).font = { bold: true };

  // Auto filter
  worksheet.autoFilter = 'A1:G1';

  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="karyawan_${new Date().toISOString().split('T')[0]}.xlsx"`,
    },
  });
}