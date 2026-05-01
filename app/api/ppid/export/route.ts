import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { auth } from '@/lib/auth';
import ExcelJS from 'exceljs';

interface User {
  id: number;
  instance_id: number;
  role: string;
  name: string;
  email: string;
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

// Color palette sesuai dashboard
const colors = {
  primary: "#800016",
  primaryDark: "#A0001C",
  primaryDarker: "#C00021",
  primaryLight: "#FF002B",
  secondary: "#407BA7",
  secondaryDark: "#004E89",
  secondaryDarker: "#002962",
  secondaryDarkest: "#00043A",
};

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'ppid') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';
    const status = searchParams.get('status') || 'all';

    const instanceId = currentUser.instance_id;

    let whereClause = 'WHERE g.instance_id = ?';
    const params: (string | number)[] = [instanceId];

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

    const guests = await query(`
      SELECT 
        g.name,
        g.nik,
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
      nik: string | null;
      institution: string | null;
      purpose: string;
      status: string;
      check_in_at: Date | null;
      check_out_at: Date | null;
      created_at: Date;
      employee_name: string | null;
      employee_department: string | null;
      validated_by: string | null;
    }[];

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'VisiTrack';
    workbook.lastModifiedBy = 'VisiTrack';
    workbook.created = new Date();
    workbook.modified = new Date();
    
    const worksheet = workbook.addWorksheet('Laporan Kunjungan');

    // Define columns
    worksheet.columns = [
      { header: 'No', key: 'no', width: 8 },
      { header: 'Tanggal Kunjungan', key: 'tanggal', width: 20 },
      { header: 'Nama Tamu', key: 'name', width: 25 },
      { header: 'NIK', key: 'nik', width: 20 },
      { header: 'Asal Instansi', key: 'institution', width: 25 },
      { header: 'Tujuan', key: 'purpose', width: 20 },
      { header: 'Karyawan Tujuan', key: 'employee', width: 25 },
      { header: 'Departemen', key: 'department', width: 20 },
      { header: 'Status', key: 'status', width: 18 },
      { header: 'Check In', key: 'check_in', width: 20 },
      { header: 'Check Out', key: 'check_out', width: 20 },
      { header: 'Divalidasi Oleh', key: 'validated_by', width: 20 },
    ];

    // Style Header dengan warna primary (#800016)
    const headerRow = worksheet.getRow(1);
    headerRow.height = 28;
    headerRow.eachCell((cell) => {
      cell.font = { 
        bold: true, 
        color: { argb: 'FFFFFFFF' }, 
        size: 11, 
        name: 'Calibri' 
      };
      cell.fill = { 
        type: 'pattern', 
        pattern: 'solid', 
        fgColor: { argb: colors.secondary.replace('#', 'FF') } 
      };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFCCCCCC' } },
        left: { style: 'thin', color: { argb: 'FFCCCCCC' } },
        bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } },
        right: { style: 'thin', color: { argb: 'FFCCCCCC' } }
      };
    });

    // Format helper functions
    const formatDateTime = (date: Date | null) => {
      if (!date) return '-';
      const d = new Date(date);
      d.setHours(d.getHours() + 7); // Convert to WIB
      return d.toLocaleString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const formatDate = (date: Date | null) => {
      if (!date) return '-';
      const d = new Date(date);
      d.setHours(d.getHours() + 7);
      return d.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
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

    const getStatusColor = (status: string): string => {
      const colorMap: Record<string, string> = {
        pending: 'FFF59E0B', // Yellow
        active: 'FF10B981', // Green
        done: 'FF3B82F6',   // Blue
        rejected: 'FFEF4444' // Red
      };
      return colorMap[status] || 'FF6B7280';
    };

    // Fill data
    guests.forEach((guest, index) => {
      const row = worksheet.addRow({
        no: index + 1,
        tanggal: formatDate(guest.created_at),
        name: guest.name,
        nik: guest.nik || '-',
        institution: guest.institution || '-',
        purpose: guest.purpose,
        employee: guest.employee_name || '-',
        department: guest.employee_department || '-',
        status: getStatusText(guest.status),
        check_in: formatDateTime(guest.check_in_at),
        check_out: formatDateTime(guest.check_out_at),
        validated_by: guest.validated_by || 'System',
      });

      row.height = 22;
      row.eachCell((cell, colNumber) => {
        cell.alignment = { vertical: 'middle' };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE0E0E0' } },
          left: { style: 'thin', color: { argb: 'FFE0E0E0' } },
          bottom: { style: 'thin', color: { argb: 'FFE0E0E0' } },
          right: { style: 'thin', color: { argb: 'FFE0E0E0' } }
        };
        
        // Warna khusus untuk kolom status (colNumber = 9)
        if (colNumber === 9) {
          cell.font = { 
            color: { argb: getStatusColor(guest.status) }, 
            bold: true,
            size: 10
          };
        }
      });
    });

    // Add empty row
    worksheet.addRow([]);

    // Add summary row
    const summaryRow = worksheet.addRow({
      name: `Total Data: ${guests.length} kunjungan`,
    });
    summaryRow.getCell(1).font = { bold: true, size: 11, color: { argb: colors.secondary.replace('#', 'FF') } };
    summaryRow.getCell(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF5F5F5' }
    };

    // Merge summary row
    worksheet.mergeCells(`A${worksheet.rowCount}:L${worksheet.rowCount}`);

    // Auto filter on header row
    worksheet.autoFilter = 'A1:L1';

    // Set column styles for better readability
    worksheet.getColumn('tanggal').alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.getColumn('status').alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.getColumn('check_in').alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.getColumn('check_out').alignment = { horizontal: 'center', vertical: 'middle' };

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();

    const fileName = `laporan_kunjungan_${new Date().toISOString().split('T')[0]}.xlsx`;

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`,
      },
    });
  } catch (error) {
    console.error('Export API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}