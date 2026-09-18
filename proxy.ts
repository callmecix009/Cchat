import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { checkRateLimit, getClientIp, rateLimitHeaders, RL_AUTH_IP } from '@/lib/rate-limit';

const locales = ['en', 'sw'] as const;

function getLocaleFromPath(pathname: string): { locale: string; pathnameWithoutLocale: string } {
  const segments = pathname.split('/').filter(Boolean);
  const firstSegment = segments[0];
  if (firstSegment && ['en', 'sw'].includes(firstSegment)) {
    return { locale: firstSegment, pathnameWithoutLocale: '/' + segments.slice(1).join('/') };
  }
  return { locale: 'en', pathnameWithoutLocale: pathname };
}

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/privacy(.*)',
  '/terms(.*)',
  '/acceptable-use(.*)',
  '/jinsi-ya-kufanya-biashara-mtandaoni-tanzania(.*)',
  '/sitemap(.*)',
  '/robots(.*)',
  '/icon(.*)',
  '/apple-icon(.*)',
  '/favicon.ico',
  '/api/webhooks(.*)',
  '/api/webhook(.*)',
  '/api/whatsapp/webhook(.*)',
]);

const isAuthRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)']);
const isApiRoute = createRouteMatcher(['/api(.*)']);

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
  // Extract locale from path
  const { locale, pathnameWithoutLocale } = getLocaleFromPath(request.nextUrl.pathname);

  // Handle root redirect
  if (request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/en', request.url));
  }

  // Add locale prefix if missing
  if (!request.nextUrl.pathname.startsWith('/en') && !request.nextUrl.pathname.startsWith('/sw')) {
    return NextResponse.redirect(new URL(`/${locale}${request.nextUrl.pathname}${request.nextUrl.search}`, request.url));
  }

  // Rate-limit sign-in / sign-up pages by trusted IP only.
  if (isAuthRoute(request)) {
    const ip = getClientIp(request);
    if (ip) {
      const rl = checkRateLimit({ key: `auth:${ip}`, limit: 10, windowMs: 60_000 });
      if (!rl.success) {
        const headers = { 'Retry-After': String(Math.ceil(rl.reset / 1000)) };
        const isJson = request.headers.get('accept')?.includes('application/json');
        if (isJson) return NextResponse.json({ error: 'Too Many Requests' }, { status: 429, headers: { 'Retry-After': String(Math.ceil(rl.reset / 1000)) } });
        return new NextResponse('<h1>429 Too Many Requests</h1><p>Please wait a moment and retry.</p>', {
          status: 429,
          headers: { 'Content-Type': 'text/html; charset=utf-8', 'Retry-After': String(Math.ceil(rl.reset / 1000)) },
        });
      }
    }
  }

  // CORS preflight
  if (request.method === 'OPTIONS' && request.nextUrl.pathname.startsWith('/api/')) {
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
    if (!isPublicRoute(request)) {
      if (isApiRoute(request)) {
        return NextResponse.json({ error: 'Service not configured' }, { status: 503 });
      }
      return NextResponse.redirect(new URL('/', request.url));
    }
    return;
  }

  try {
    const { userId } = await auth();

    if (isAuthRoute(request)) {
      if (userId) {
        const url = request.nextUrl.clone();
        url.pathname = '/dashboard';
        url.search = '';
        return NextResponse.redirect(url);
      }
      return;
    }

    if (!isPublicRoute(request)) {
      if (!userId) {
        if (isApiRoute(request)) {
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

    if (isApiRoute(request)) {
      const status = err?.status === 401 || err?.message?.includes('Unauth') ? 401 : 500;
      return NextResponse.json({ error: 'Unauthorized' }, { status });
    }

    if (isPublicRoute(request)) {
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