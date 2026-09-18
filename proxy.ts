import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

const locales = ['en', 'sw'] as const;
const defaultLocale = locales[0];

function getLocaleFromPath(pathname: string): { locale: string; pathnameWithoutLocale: string } {
  const segments = pathname.split('/').filter(Boolean);
  const firstSegment = segments[0];
  if (firstSegment && (locales as readonly string[]).includes(firstSegment)) {
    return { locale: firstSegment, pathnameWithoutLocale: '/' + segments.slice(1).join('/') };
  }
  return { locale: defaultLocale, pathnameWithoutLocale: pathname };
}

/** Paths that must never gain a locale prefix (APIs, Clerk, framework, assets). */
function skipLocaleRedirect(pathname: string): boolean {
  if (pathname.startsWith('/api') || pathname.startsWith('/trpc') || pathname.startsWith('/__clerk')) return true;
  if (pathname.startsWith('/_next') || pathname.startsWith('/_vercel')) return true;
  const last = pathname.split('/').pop() ?? '';
  if (last.includes('.')) return true;
  return (
    pathname === '/favicon.ico' ||
    pathname.startsWith('/robots') ||
    pathname.startsWith('/sitemap') ||
    pathname.startsWith('/icon') ||
    pathname.startsWith('/apple-icon')
  );
}

function hasLocalePrefix(pathname: string): boolean {
  return (locales as readonly string[]).some(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`)
  );
}

/**
 * Only these sections have localized routes (`app/[locale]/...`).
 * Every other page (sign-in, settings, onboarding, billing, ...) is
 * non-localized, so prefixing it would 404 — only add a locale
 * prefix here.
 */
function isLocaleRoutedPath(pathname: string): boolean {
  return pathname === '/dashboard' || pathname.startsWith('/dashboard/');
}

function isPublicRouteWithLocale(pathname: string): boolean {
  const { pathnameWithoutLocale } = getLocaleFromPath(pathname);
  return (
    pathnameWithoutLocale === '/' ||
    pathnameWithoutLocale.startsWith('/sign-in') ||
    pathnameWithoutLocale.startsWith('/sign-up') ||
    pathnameWithoutLocale.startsWith('/privacy') ||
    pathnameWithoutLocale.startsWith('/terms') ||
    pathnameWithoutLocale.startsWith('/acceptable-use') ||
    pathnameWithoutLocale.startsWith('/jinsi-ya-kufanya-biashara-mtandaoni-tanzania') ||
    pathnameWithoutLocale.startsWith('/sitemap') ||
    pathnameWithoutLocale.startsWith('/robots') ||
    pathnameWithoutLocale.startsWith('/icon') ||
    pathnameWithoutLocale.startsWith('/apple-icon') ||
    pathnameWithoutLocale === '/favicon.ico' ||
    pathnameWithoutLocale.startsWith('/api/webhooks') ||
    pathnameWithoutLocale.startsWith('/api/webhook') ||
    pathnameWithoutLocale.startsWith('/api/whatsapp/webhook')
  );
}

function isAuthRouteWithLocale(pathname: string): boolean {
  const { pathnameWithoutLocale } = getLocaleFromPath(pathname);
  return pathnameWithoutLocale.startsWith('/sign-in') || pathnameWithoutLocale.startsWith('/sign-up');
}

function isApiRouteWithLocale(pathname: string): boolean {
  const { pathnameWithoutLocale } = getLocaleFromPath(pathname);
  return pathnameWithoutLocale.startsWith('/api');
}

export default clerkMiddleware(async (auth, request) => {
  const pathname = request.nextUrl.pathname;
  // Extract locale from path
  const { locale, pathnameWithoutLocale } = getLocaleFromPath(pathname);

  // `/` serves the public landing page (app/page.tsx) — never redirect it.

  // Add locale prefix only for sections that actually have localized
  // routes (exact-segment match; skip non-page paths)
  if (!hasLocalePrefix(pathname) && !skipLocaleRedirect(pathname) && isLocaleRoutedPath(pathname)) {
    return NextResponse.redirect(new URL(`/${locale}${pathname}${request.nextUrl.search}`, request.url));
  }

  // Rate-limit sign-in / sign-up pages by trusted IP only.
  if (isAuthRouteWithLocale(pathname)) {
    const ip = getClientIp(request);
    if (ip) {
      const rl = checkRateLimit({ key: `auth:${ip}`, limit: 10, windowMs: 60_000 });
      if (!rl.success) {
        const retrySec = Math.max(1, Math.ceil((rl.reset - Date.now()) / 1000));
        const retryHeaders = { 'Retry-After': String(retrySec) };
        const isJson = request.headers.get('accept')?.includes('application/json');
        if (isJson) return NextResponse.json({ error: 'Too Many Requests' }, { status: 429, headers: retryHeaders });
        return new NextResponse('<h1>429 Too Many Requests</h1><p>Please wait a moment and retry.</p>', {
          status: 429,
          headers: { 'Content-Type': 'text/html; charset=utf-8', ...retryHeaders },
        });
      }
    }
  }

  // CORS preflight
  if (request.method === 'OPTIONS' && pathnameWithoutLocale.startsWith('/api/')) {
    return new NextResponse(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': request.headers.get('origin') ?? '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  if (!process.env.CLERK_SECRET_KEY) {
    if (!isPublicRouteWithLocale(pathname)) {
      if (isApiRouteWithLocale(pathname)) {
        return NextResponse.json({ error: 'Service not configured' }, { status: 503 });
      }
      return NextResponse.redirect(new URL('/', request.url));
    }
    return;
  }

  try {
    const { userId } = await auth();

    if (isAuthRouteWithLocale(pathname)) {
      if (userId) {
        const url = request.nextUrl.clone();
        url.pathname = '/dashboard';
        url.search = '';
        return NextResponse.redirect(url);
      }
      return;
    }

    if (!isPublicRouteWithLocale(pathname)) {
      if (!userId) {
        if (isApiRouteWithLocale(pathname)) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        await auth.protect();
      }
    }
  } catch (err: any) {
    const isKeyError =
      err?.reason === 'jwk-kid-mismatch' ||
      err?.message?.includes('signing key') ||
      err?.message?.includes('Handshake');

    const isApi = isApiRouteWithLocale(pathname);
    const isPublic = isPublicRouteWithLocale(pathname);

    if (isApi) {
      const status = err?.status === 401 || err?.message?.includes('Unauth') ? 401 : 500;
      return NextResponse.json({ error: 'Unauthorized' }, { status });
    }

    if (isPublic) {
      const res = NextResponse.redirect(new URL('/sign-in', request.url));
      res.cookies.delete('__session');
      res.cookies.delete('__client');
      return res;
    }

    // Clerk key rotation / handshake failure on a protected page:
    // fail gracefully (clear stale session, send to sign-in) instead of a 500.
    if (isKeyError) {
      const res = NextResponse.redirect(new URL('/sign-in', request.url));
      res.cookies.delete('__session');
      res.cookies.delete('__client');
      return res;
    }

    throw err;
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|xml|txt)).*)',
    '/(api|trpc)(.*)',
    '/__clerk/:path*',
  ],
};