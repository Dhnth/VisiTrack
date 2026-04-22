import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userCheck = (await query("SELECT role FROM users WHERE email = ?", [
    session.user.email,
  ])) as { role: string }[];

  if (!userCheck[0] || userCheck[0].role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period") || "month";
  const instanceIds = searchParams.get("instanceIds") || "all";

  const dateFormat = "%Y-%m-%d";
  let groupBy = "DATE(created_at)";
  let limit = 30;
  if (period === "month") {
    groupBy = "DATE(created_at)";
    limit = 30;
  }
  if (period === "quarter") {
    groupBy = "WEEK(created_at)";
    limit = 12;
  }
  if (period === "year") {
    groupBy = "MONTH(created_at)";
    limit = 12;
  }

  // 1. Overview Stats untuk Super Admin
  const statsRes = (await query(`
    SELECT 
      (SELECT COUNT(*) FROM instances) as total_instances,
      (SELECT COUNT(*) FROM instances WHERE is_active = 1 AND subscription_status = 'active') as active_instances,
      (SELECT COUNT(*) FROM users WHERE role = 'admin') as total_admins,
      (SELECT COUNT(*) FROM users WHERE role = 'petugas') as total_petugas,
      (SELECT COUNT(*) FROM employees WHERE is_active = 1) as total_employees,
      (SELECT SUM(CASE WHEN plan = 'enterprise' THEN 500 WHEN plan = 'business' THEN 299 WHEN plan = 'starter' THEN 99 ELSE 0 END) FROM instances WHERE subscription_status = 'active') as revenue_mrr,
      (SELECT COUNT(*) FROM instances WHERE subscription_status = 'trial') as trial_instances,
      (SELECT COUNT(*) FROM instances WHERE subscription_status = 'expired') as expired_instances
  `)) as Record<string, number>[];

  // 2. Multi-Series Data
  let trendQuery = "";
  let trendParams: (string | number)[] = [];

  if (instanceIds !== "all") {
    const ids = instanceIds.split(",").map(Number);
    const instanceConditions = ids
      .map(
        (id, idx) =>
          `SUM(CASE WHEN instance_id = ? THEN 1 ELSE 0 END) as inst_${idx}`,
      )
      .join(", ");

    // Get instance names
    const instanceNames = (await query(
      `SELECT id, name FROM instances WHERE id IN (${ids.map(() => "?").join(",")})`,
      ids,
    )) as { id: number; name: string }[];

    const nameMap = new Map(instanceNames.map((i) => [i.id, i.name]));

    trendQuery = `
      SELECT 
        DATE_FORMAT(created_at, '%d %b') as period,
        ${instanceConditions}
      FROM guests
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL ${limit} DAY)
      GROUP BY DATE(created_at)
      ORDER BY period ASC
    `;

    trendParams = ids.flatMap((id) => [
      id,
      nameMap.get(id) || `instansi_${id}`,
    ]);
  } else {
    // Top 6 instansi berdasarkan kunjungan terbaru
    const topInstances = (await query(`
      SELECT i.id, i.name
      FROM instances i
      LEFT JOIN guests g ON g.instance_id = i.id AND g.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY i.id
      ORDER BY COUNT(g.id) DESC
      LIMIT 6
    `)) as { id: number; name: string }[];

    if (topInstances.length > 0) {
      const instanceConditions = topInstances
        .map(
          (_, idx) =>
            `SUM(CASE WHEN instance_id = ? THEN 1 ELSE 0 END) as inst_${idx}`,
        )
        .join(", ");

      trendQuery = `
        SELECT 
          DATE_FORMAT(created_at, '%d %b') as period,
          ${instanceConditions}
        FROM guests
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL ${limit} DAY)
        GROUP BY DATE(created_at)
        ORDER BY period ASC
      `;

      trendParams = topInstances.map(i => i.id);
    } else {
      trendQuery = `
        SELECT DATE_FORMAT(created_at, '%d %b') as period, 0 as total
        FROM guests
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL ${limit} DAY)
        GROUP BY DATE(created_at)
        ORDER BY period ASC
      `;
    }
  }

  const trendRes = (await query(trendQuery, trendParams)) as Record<
    string,
    string | number
  >[];

  // 3. Daftar semua instansi untuk filter
  const instancesList = (await query(`
    SELECT id, name, slug 
    FROM instances 
    ORDER BY name
  `)) as { id: number; name: string; slug: string }[];

  // 4. Kunjungan per Instansi (ranking)
  const instanceRankingRes = (await query(`
    SELECT 
      i.id,
      i.name,
      COUNT(g.id) as total_visits
    FROM instances i
    LEFT JOIN guests g ON g.instance_id = i.id AND g.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    GROUP BY i.id
    ORDER BY total_visits DESC
    LIMIT 8
  `)) as { id: number; name: string; total_visits: number }[];

  const totalVisits = instanceRankingRes.reduce(
    (sum, inst) => sum + inst.total_visits,
    0,
  );
  const instanceRankingWithPercent = instanceRankingRes.map((inst) => ({
    ...inst,
    percentage:
      totalVisits > 0 ? Math.round((inst.total_visits / totalVisits) * 100) : 0,
  }));

  // 5. Admin Paling Aktif
  const adminRankingRes = (await query(`
    SELECT 
      u.id, u.name, u.email, i.name as instance_name,
      COUNT(g.id) as total_guests_handled
    FROM users u
    LEFT JOIN guests g ON g.created_by = u.id
    LEFT JOIN instances i ON u.instance_id = i.id
    WHERE u.role = 'admin'
    GROUP BY u.id
    ORDER BY total_guests_handled DESC
    LIMIT 8
  `)) as {
    id: number;
    name: string;
    email: string;
    instance_name: string;
    total_guests_handled: number;
  }[];

  // 6. Distribusi Paket
  const planDistributionRes = (await query(`
    SELECT plan, COUNT(*) as count FROM instances GROUP BY plan
  `)) as { plan: string; count: number }[];

  return NextResponse.json({
    success: true,
    overview: statsRes[0],
    trend: trendRes,
    instances: instancesList,
    instanceRanking: instanceRankingWithPercent,
    topAdmins: adminRankingRes,
    planDistribution: planDistributionRes,
  });
}
