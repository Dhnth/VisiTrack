// app/api/instance-id/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const slug = searchParams.get('slug');

    if (!slug) {
      return NextResponse.json({ error: 'Slug required' }, { status: 400 });
    }

    const instances = await query(
      'SELECT id FROM instances WHERE slug = ?',
      [slug]
    ) as { id: number }[];

    if (instances.length === 0) {
      return NextResponse.json({ error: 'Instance not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      instanceId: instances[0].id,
    });
  } catch (error) {
    console.error('Error fetching instance ID:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}