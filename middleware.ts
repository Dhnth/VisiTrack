import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Daftar path yang tidak perlu autentikasi
  const publicPaths = ['/signin', '/api/auth', '/forbidden', '/'];
  if (publicPaths.some(path => pathname.startsWith(path)) || pathname === '/') {
    return NextResponse.next();
  }

  // Dapatkan token dari session
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  
  // Jika tidak login, redirect ke signin
  if (!token) {
    const signInUrl = new URL('/signin', request.url);
    signInUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signInUrl);
  }

  const userRole = token.role as string;
  const userSlug = token.slug as string;

  // Cek akses berdasarkan role dan path
  let isAllowed = false;

  if (userRole === 'super_admin') {
    isAllowed = pathname.startsWith('/superadmin');
  } else if (userRole === 'admin') {
    isAllowed = pathname.startsWith(`/${userSlug}/admin`);
  } else if (userRole === 'petugas') {
    isAllowed = pathname.startsWith(`/${userSlug}/petugas`);
  } else if (userRole === 'ppid') {
    isAllowed = pathname.startsWith(`/${userSlug}/ppid`);
  }

  // Jika tidak diizinkan, redirect ke forbidden
  if (!isAllowed && !pathname.startsWith('/api')) {
    return NextResponse.redirect(new URL('/forbidden', request.url));
  }

  return NextResponse.next();
}

// Konfigurasi matcher untuk route yang diproteksi
export const config = {
  matcher: [
    '/superadmin/:path*',
    '/:slug/admin/:path*',
    '/:slug/petugas/:path*',
    '/:slug/ppid/:path*',
  ],
};