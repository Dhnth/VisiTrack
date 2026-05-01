import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    { error: 'API endpoint not found' },
    { status: 404 }
  );
}