import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { auth } from '@/lib/auth';

interface User {
  id: number;
  instance_id: number;
  role: string;
  name: string;
  email: string;
}

interface Employee {
  id: number;
  name: string;
  department: string;
  nip: string | null;
  is_active: boolean;
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

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'petugas') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const instanceId = currentUser.instance_id;

    const employees = await query(
      `SELECT id, name, department, nip, is_active 
       FROM employees 
       WHERE instance_id = ? AND is_active = true 
       ORDER BY name ASC`,
      [instanceId]
    ) as Employee[];

    return NextResponse.json({
      success: true,
      employees,
    });
  } catch (error) {
    console.error('Employees API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}