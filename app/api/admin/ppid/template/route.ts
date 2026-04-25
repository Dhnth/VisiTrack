import { NextResponse } from 'next/server';
import ExcelJS from 'exceljs';

export async function GET() {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Template PPID');

  worksheet.columns = [
    { header: 'Nama', key: 'name', width: 30 },
    { header: 'Email', key: 'email', width: 35 },
  ];

  const headerRow = worksheet.getRow(1);
  headerRow.height = 25;
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12, name: 'Calibri' };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF800016' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFCCCCCC' } },
      left: { style: 'thin', color: { argb: 'FFCCCCCC' } },
      bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } },
      right: { style: 'thin', color: { argb: 'FFCCCCCC' } }
    };
  });

  const examples = [
    { name: 'Budi PPID', email: 'budi.ppid@example.com' },
    { name: 'Siti PPID', email: 'siti.ppid@example.com' },
  ];

  examples.forEach((example) => {
    const row = worksheet.addRow({
      name: example.name,
      email: example.email,
    });
    row.eachCell((cell) => {
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

  worksheet.addRow([]);
  const noteRow = worksheet.addRow({
    name: '* Nama dan Email wajib diisi. Data contoh boleh dihapus.',
  });
  noteRow.getCell(1).font = { color: { argb: 'FFFF0000' }, size: 10, italic: true };

  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="template_ppid.xlsx"',
    },
  });
}