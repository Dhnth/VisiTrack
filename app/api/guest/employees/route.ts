import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const slug = searchParams.get('slug');

    if (!slug) {
      return NextResponse.json({ error: 'Slug required' }, { status: 400 });
    }

    // Get instance by slug
    const instances = await query(
      'SELECT id FROM instances WHERE slug = ?',
      [slug]
    ) as { id: number }[];

    if (instances.length === 0) {
      return NextResponse.json({ error: 'Instance not found' }, { status: 404 });
    }

    const instanceId = instances[0].id;

    // Get active employees
    const employees = await query(
      `SELECT id, name, department 
       FROM employees 
       WHERE instance_id = ? AND is_active = true 
       ORDER BY name ASC`,
      [instanceId]
    ) as { id: number; name: string; department: string }[];

    return NextResponse.json({
      success: true,
      employees,
    });
  } catch (error) {
    console.error('Get employees error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}