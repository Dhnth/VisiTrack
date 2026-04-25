import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { auth } from '@/lib/auth';
import ExcelJS from 'exceljs';

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const users = await query(
    'SELECT id, instance_id, role FROM users WHERE email = ?',
    [session.user.email]
  ) as { id: number; instance_id: number; role: string }[];

  const currentUser = users[0];
  if (!currentUser || currentUser.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || 'all';
  const startDate = searchParams.get('startDate') || '';
  const endDate = searchParams.get('endDate') || '';
  const officerId = searchParams.get('officerId') || '';
  const employeeId = searchParams.get('employeeId') || '';

  const instanceId = currentUser.instance_id;

  let whereClause = 'WHERE g.instance_id = ?';
  const params: (string | number)[] = [instanceId];

  if (search) {
    whereClause += ' AND (g.name LIKE ? OR g.institution LIKE ? OR g.purpose LIKE ? OR e.name LIKE ?)';
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm, searchTerm);
  }

  if (status !== 'all') {
    whereClause += ' AND g.status = ?';
    params.push(status);
  }

  if (startDate) {
    whereClause += ' AND DATE(g.created_at) >= ?';
    params.push(startDate);
  }

  if (endDate) {
    whereClause += ' AND DATE(g.created_at) <= ?';
    params.push(endDate);
  }

  if (officerId) {
    whereClause += ' AND g.created_by = ?';
    params.push(parseInt(officerId));
  }

  if (employeeId) {
    whereClause += ' AND g.employee_id = ?';
    params.push(parseInt(employeeId));
  }

  const guests = await query(`
    SELECT 
      g.name,
      g.institution,
      g.purpose,
      g.status,
      g.check_in_at,
      g.check_out_at,
      g.created_at,
      e.name as employee_name,
      e.department as employee_department,
      u.name as validated_by
    FROM guests g
    LEFT JOIN employees e ON g.employee_id = e.id
    LEFT JOIN users u ON g.created_by = u.id
    ${whereClause}
    ORDER BY g.created_at DESC
  `, params) as {
    name: string;
    institution: string | null;
    purpose: string;
    status: string;
    check_in_at: Date | null;
    check_out_at: Date | null;
    created_at: Date;
    employee_name: string;
    employee_department: string;
    validated_by: string | null;
  }[];

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('History Kunjungan');

  worksheet.columns = [
    { header: 'No', key: 'no', width: 8 },
    { header: 'Tanggal', key: 'tanggal', width: 20 },
    { header: 'Nama Tamu', key: 'name', width: 25 },
    { header: 'Institusi', key: 'institution', width: 25 },
    { header: 'Tujuan', key: 'purpose', width: 20 },
    { header: 'Karyawan Tujuan', key: 'employee', width: 25 },
    { header: 'Departemen', key: 'department', width: 20 },
    { header: 'Status', key: 'status', width: 15 },
    { header: 'Check In', key: 'check_in', width: 20 },
    { header: 'Check Out', key: 'check_out', width: 20 },
    { header: 'Divalidasi Oleh', key: 'validated_by', width: 20 },
  ];

  // Style Header
  const headerRow = worksheet.getRow(1);
  headerRow.height = 25;
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11, name: 'Calibri' };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF800016' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFCCCCCC' } },
      left: { style: 'thin', color: { argb: 'FFCCCCCC' } },
      bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } },
      right: { style: 'thin', color: { argb: 'FFCCCCCC' } }
    };
  });

  // Isi data
  guests.forEach((guest, index) => {
    const formatDateTime = (date: Date | null) => {
      if (!date) return '-';
      return new Date(date).toLocaleString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const getStatusText = (status: string) => {
      const statusMap: Record<string, string> = {
        pending: 'Pending',
        active: 'Sedang Berkunjung',
        done: 'Selesai',
        rejected: 'Ditolak'
      };
      return statusMap[status] || status;
    };

    const row = worksheet.addRow({
      no: index + 1,
      tanggal: formatDateTime(guest.created_at),
      name: guest.name,
      institution: guest.institution || '-',
      purpose: guest.purpose,
      employee: guest.employee_name,
      department: guest.employee_department,
      status: getStatusText(guest.status),
      check_in: formatDateTime(guest.check_in_at),
      check_out: formatDateTime(guest.check_out_at),
      validated_by: guest.validated_by || 'System',
    });

    row.height = 20;
    row.eachCell((cell, colNumber) => {
      cell.alignment = { vertical: 'middle' };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFCCCCCC' } },
        left: { style: 'thin', color: { argb: 'FFCCCCCC' } },
        bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } },
        right: { style: 'thin', color: { argb: 'FFCCCCCC' } }
      };
      
      // Warna khusus untuk status
      if (colNumber === 8) {
        if (guest.status === 'active') {
          cell.font = { color: { argb: 'FF10B981' }, bold: true };
        } else if (guest.status === 'pending') {
          cell.font = { color: { argb: 'FFF59E0B' }, bold: true };
        } else if (guest.status === 'done') {
          cell.font = { color: { argb: 'FF3B82F6' }, bold: true };
        } else if (guest.status === 'rejected') {
          cell.font = { color: { argb: 'FFEF4444' }, bold: true };
        }
      }
    });
  });

  // Tambah total baris
  worksheet.addRow([]);
  const totalRow = worksheet.addRow({ name: `Total Data: ${guests.length}` });
  totalRow.getCell(1).font = { bold: true, size: 11 };
  totalRow.getCell(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFF5F5F5' }
  };

  // Auto filter
  worksheet.autoFilter = 'A1:K1';


  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="history_${new Date().toISOString().split('T')[0]}.xlsx"`,
    },
  });
}