import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { auth } from "@/lib/auth";
import { createActivityLog } from "@/lib/activity-log";
import ExcelJS from "exceljs";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const users = (await query(
    'SELECT id, instance_id FROM users WHERE email = ? AND role = "admin"',
    [session.user.email],
  )) as { id: number; instance_id: number }[];

  const user = users[0];
  if (!user) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "File tidak ditemukan" },
        { status: 400 },
      );
    }

    const buffer = await file.arrayBuffer();
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);

    const worksheet = workbook.getWorksheet(1);
    if (!worksheet) {
      return NextResponse.json(
        { error: "Worksheet tidak ditemukan" },
        { status: 400 },
      );
    }

    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    // Mulai dari baris 2 (skip header)
    for (let i = 2; i <= worksheet.rowCount; i++) {
      const row = worksheet.getRow(i);

      const name = row.getCell(1).toString().trim();
      const department = row.getCell(2).toString().trim();
      const nip = row.getCell(3).toString().trim();
      const phone = row.getCell(4).toString().trim();

      // Lewati baris kosong
      if (!name && !department && !nip && !phone) continue;

      if (!name || !department) {
        errorCount++;
        errors.push(`Baris ${i}: Nama dan Departemen wajib diisi`);
        continue;
      }

      let existingEmployee = null;

      if (nip) {
        const existing = (await query(
          "SELECT id FROM employees WHERE instance_id = ? AND nip = ?",
          [user.instance_id, nip],
        )) as { id: number }[];

        if (existing.length > 0) {
          existingEmployee = existing[0];
        }
      }

      if (existingEmployee) {
        await query(
          `UPDATE employees 
       SET name = ?, department = ?, phone = ?, updated_at = NOW()
       WHERE id = ? AND instance_id = ?`,
          [
            name,
            department,
            phone || null,
            existingEmployee.id,
            user.instance_id,
          ],
        );
        successCount++;
      } else {
        await query(
          `INSERT INTO employees (instance_id, nip, name, department, phone, is_active, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, 1, NOW(), NOW())`,
          [user.instance_id, nip || null, name, department, phone || null],
        );
        successCount++;
      }
    }
    await createActivityLog({
      instance_id: user.instance_id,
      user_id: user.id,
      action: "INSERT",
      table_name: "employees",
      record_id: null,
      description: `Import ${successCount} karyawan dari Excel${errorCount > 0 ? ` (${errorCount} gagal)` : ""}`,
      ip_address:
        request.headers.get("x-forwarded-for")?.split(",")[0] || undefined,
      user_agent: request.headers.get("user-agent") || undefined,
    });

    return NextResponse.json({
      success: true,
      message: `Berhasil import ${successCount} karyawan${errorCount > 0 ? `, ${errorCount} gagal` : ""}`,
      successCount,
      errorCount,
      errors: errors.slice(0, 10),
    });
  } catch (error) {
    console.error("Import error:", error);
    return NextResponse.json(
      { error: "Gagal import file Excel. Pastikan format file sesuai." },
      { status: 500 },
    );
  }
}
