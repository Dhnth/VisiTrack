import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { decrypt } from '@/lib/encryption';

interface Guest {
  id: number;
  name: string;
  nik: string | null;
  institution: string | null;
  purpose: string;
  photo_url: string | null;
  status: string;
  check_in_at: string | null;
  check_out_at: string | null;
  created_at: string;
  employee_name: string | null;
  employee_department: string | null;
  validated_by: string | null;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const nik = searchParams.get('nik');
    const slug = searchParams.get('slug');

    if (!nik || !slug) {
      return NextResponse.json(
        { error: 'NIK dan slug required' },
        { status: 400 }
      );
    }

    // Get instance by slug
    const instances = await query(
      'SELECT id FROM instances WHERE slug = ?',
      [slug]
    ) as { id: number }[];

    if (instances.length === 0) {
      return NextResponse.json({ error: 'Instansi tidak ditemukan' }, { status: 404 });
    }

    const instanceId = instances[0].id;

    // Ambil semua data lalu dekripsi dan filter di Node.js
    const allGuests = await query(
      `SELECT 
        g.id,
        g.name,
        g.nik,
        g.institution,
        g.purpose,
        g.photo_url,
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
      WHERE g.instance_id = ?
      ORDER BY g.created_at DESC`,
      [instanceId]
    ) as Guest[];

    // Decrypt NIK dan filter
    let foundGuest: Guest | null = null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const guest of allGuests) {
      if (guest.nik) {
        const decryptedNIK = decrypt(guest.nik);
        if (decryptedNIK === nik) {
          // Cek apakah kunjungan hari ini (berdasarkan created_at)
          const guestDate = new Date(guest.created_at);
          guestDate.setHours(0, 0, 0, 0);
          
          if (guestDate.getTime() === today.getTime()) {
            foundGuest = { ...guest, nik: decryptedNIK };
            break;
          }
        }
      }
    }

    if (!foundGuest) {
      return NextResponse.json({ error: 'Tidak ada kunjungan hari ini dengan NIK tersebut' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      guest: foundGuest,
    });
  } catch (error) {
    console.error('Status API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}