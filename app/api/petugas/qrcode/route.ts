import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { auth } from "@/lib/auth";
import crypto from "crypto";

interface User {
  id: number;
  instance_id: number;
  role: string;
  name: string;
  email: string;
}

interface Setting {
  qr_mode: "static" | "dynamic";
  token_interval: number | null;
}

interface Instance {
  slug: string;
}

async function getCurrentUser(): Promise<User | null> {
  const session = await auth();
  if (!session?.user?.email) return null;

  const users = (await query(
    "SELECT id, instance_id, role, name, email FROM users WHERE email = ?",
    [session.user.email],
  )) as User[];

  return users[0] || null;
}

async function generateStaticToken(
  instanceId: number,
  slug: string,
): Promise<string> {
  const existingToken = (await query(
    "SELECT token FROM access_token WHERE instance_id = ? AND expired_at IS NULL LIMIT 1",
    [instanceId],
  )) as { token: string }[];

  if (existingToken.length > 0) {
    return existingToken[0].token;
  }

  const token = crypto.randomBytes(32).toString("hex");
  await query(
    "INSERT INTO access_token (instance_id, token, expired_at, usage_count, created_at) VALUES (?, ?, NULL, 0, NOW())",
    [instanceId, token],
  );

  return token;
}

async function generateDynamicToken(
  instanceId: number,
  slug: string,
  intervalMinutes: number,
): Promise<{ token: string; expired_at: string }> {
  // 🔥 1. Ambil token terakhir + cek pakai MySQL (ANTI SALAH TIMEZONE)
  const existing = (await query(
    `
    SELECT token, expired_at 
    FROM access_token 
    WHERE instance_id = ?
    ORDER BY id DESC 
    LIMIT 1
    `,
    [instanceId],
  )) as { token: string; expired_at: string }[];

  if (existing.length > 0) {
    const check = (await query(
      `
      SELECT 
        UTC_TIMESTAMP() as now,
        ? as expired,
        (? > UTC_TIMESTAMP()) as is_valid
      `,
      [existing[0].expired_at, existing[0].expired_at],
    )) as { is_valid: number }[];

    if (check[0].is_valid === 1) {
      // ✅ token masih berlaku → pake yang lama
      return {
        token: existing[0].token,
        expired_at: existing[0].expired_at,
      };
    }
  }

  // 🔥 2. Kalau tidak ada / expired → buat baru
  const token = crypto.randomBytes(32).toString("hex");

  const result = (await query(
    `
    SELECT DATE_ADD(UTC_TIMESTAMP(), INTERVAL ? MINUTE) as expired
    `,
    [intervalMinutes],
  )) as { expired: string }[];

  const expiredAt = result[0].expired;

  // 🔥 3. Hapus token lama (biar bersih)
  await query("DELETE FROM access_token WHERE instance_id = ?", [instanceId]);

  // 🔥 4. Insert token baru
  await query(
    `
    INSERT INTO access_token 
    (instance_id, token, expired_at, usage_count, created_at) 
    VALUES (?, ?, ?, 0, UTC_TIMESTAMP())
    `,
    [instanceId, token, expiredAt],
  );

  return {
    token,
    expired_at: expiredAt,
  };
}
export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "petugas") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const instanceId = currentUser.instance_id;

    const settingsResult = (await query(
      "SELECT qr_mode, token_interval FROM settings WHERE instance_id = ? LIMIT 1",
      [instanceId],
    )) as Setting[];

    let qrMode: "static" | "dynamic" = "static";
    let tokenInterval: number | null = null;

    if (settingsResult.length > 0) {
      qrMode = settingsResult[0].qr_mode;
      tokenInterval = settingsResult[0].token_interval;
    }

    const instanceResult = (await query(
      "SELECT slug FROM instances WHERE id = ?",
      [instanceId],
    )) as Instance[];

    const slug = instanceResult[0]?.slug;
    if (!slug) {
      return NextResponse.json(
        { error: "Instance not found" },
        { status: 404 },
      );
    }

    let token: string;
    let expiredAt: string | null = null;

    if (qrMode === "static") {
      token = await generateStaticToken(instanceId, slug);
    } else {
      const interval = tokenInterval || 30;
      const result = await generateDynamicToken(instanceId, slug, interval);
      token = result.token;
      expiredAt = result.expired_at;
    }

    const formUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/${slug}/guest-form?token=${token}`;

    return NextResponse.json({
      success: true,
      qr_mode: qrMode,
      token,
      expired_at: expiredAt,
      form_url: formUrl,
    });
  } catch (error) {
    console.error("QR Code API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
