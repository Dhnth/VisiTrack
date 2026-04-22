import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { auth } from '@/lib/auth';

interface ActivityLogWithUser {
  id: number;
  instance_id: number | null;
  user_id: number | null;
  action: string;
  table_name: string | null;
  record_id: number | null;
  description: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: Date;
  user_name: string | null;
  user_email: string | null;
  user_role: string | null;
}

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get current user
  const userResult = await query(
    'SELECT id, role, instance_id FROM users WHERE email = ?',
    [session.user.email]
  ) as { id: number; role: string; instance_id: number | null }[];

  const currentUser = userResult[0];
  if (!currentUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // Query parameters
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const search = searchParams.get('search') || '';
  const startDate = searchParams.get('startDate') || '';
  const endDate = searchParams.get('endDate') || '';
  const action = searchParams.get('action') || '';

  const offset = (page - 1) * limit;

  // Build WHERE clause
  let whereClause = '';
  const params: (string | number)[] = [];

  if (currentUser.role === 'super_admin') {
    whereClause = "WHERE u.role = 'super_admin'";
  } else if (currentUser.role === 'admin') {
    whereClause = "WHERE al.instance_id = ? AND u.role != 'super_admin'";
    params.push(currentUser.instance_id!);
  } else {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Add search filter
  if (search) {
    const searchTerm = `%${search}%`;
    whereClause += whereClause.includes('WHERE') ? ' AND' : ' WHERE';
    whereClause += ` (u.name LIKE ? OR u.email LIKE ? OR al.description LIKE ? OR al.action LIKE ?)`;
    params.push(searchTerm, searchTerm, searchTerm, searchTerm);
  }

  // Add date filter
  if (startDate) {
    whereClause += whereClause.includes('WHERE') ? ' AND' : ' WHERE';
    whereClause += ` DATE(al.created_at) >= ?`;
    params.push(startDate);
  }
  if (endDate) {
    whereClause += whereClause.includes('WHERE') ? ' AND' : ' WHERE';
    whereClause += ` DATE(al.created_at) <= ?`;
    params.push(endDate);
  }

  // Add action filter
  if (action) {
    whereClause += whereClause.includes('WHERE') ? ' AND' : ' WHERE';
    whereClause += ` al.action = ?`;
    params.push(action);
  }

  // Get total count
  const countQuery = `
    SELECT COUNT(*) as total
    FROM activity_logs al
    LEFT JOIN users u ON al.user_id = u.id
    ${whereClause}
  `;
  const countResult = await query(countQuery, params) as { total: number }[];
  const total = countResult[0]?.total || 0;

  // Get paginated data
  const dataQuery = `
    SELECT 
      al.*,
      u.name as user_name,
      u.email as user_email,
      u.role as user_role
    FROM activity_logs al
    LEFT JOIN users u ON al.user_id = u.id
    ${whereClause}
    ORDER BY al.created_at DESC
    LIMIT ? OFFSET ?
  `;
  const logs = await query(dataQuery, [...params, limit, offset]) as ActivityLogWithUser[];

  return NextResponse.json({
    success: true,
    logs,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}