import { NextResponse } from 'next/server';
import ExcelJS from 'exceljs';

export async function GET() {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Template Karyawan');

  // Set kolom
  worksheet.columns = [
    { header: 'Nama', key: 'name', width: 30 },
    { header: 'Departemen', key: 'department', width: 25 },
    { header: 'NIP', key: 'nip', width: 20 },
    { header: 'Telepon', key: 'phone', width: 18 },
  ];

  // Style Header
  const headerRow = worksheet.getRow(1);
  headerRow.height = 25;
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12, name: 'Calibri' };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF800016' }
    };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFCCCCCC' } },
      left: { style: 'thin', color: { argb: 'FFCCCCCC' } },
      bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } },
      right: { style: 'thin', color: { argb: 'FFCCCCCC' } }
    };
  });

  // Contoh data (3 baris contoh)
  const examples = [
    { name: 'Ahmad Sudrajat', department: 'Teknik Komputer', nip: '198001012010011001', phone: '081234567890' },
    { name: 'Siti Aminah', department: 'Bahasa Inggris', nip: '198502152011012002', phone: '081234567891' },
    { name: 'Budi Santoso', department: 'Matematika', nip: '199003102012013003', phone: '081234567892' },
  ];

  examples.forEach((example) => {
    const row = worksheet.addRow({
      name: example.name,
      department: example.department,
      nip: example.nip,
      phone: example.phone,
    });
    row.eachCell({ includeEmpty: false }, (cell) => {
      cell.font = { color: { argb: 'FF666666' }, italic: true };
      cell.alignment = { vertical: 'middle' };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFCCCCCC' } },
        left: { style: 'thin', color: { argb: 'FFCCCCCC' } },
        bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } },
        right: { style: 'thin', color: { argb: 'FFCCCCCC' } }
      };
    });
  });

  // Tambah catatan
  worksheet.addRow([]);
  const noteRow = worksheet.addRow({
    name: '* Nama dan Departemen wajib diisi. Data contoh boleh dihapus.',
  });
  noteRow.getCell(1).font = { color: { argb: 'FFFF0000' }, size: 10, italic: true };


  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="template_karyawan.xlsx"',
    },
  });
}