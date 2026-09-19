import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { checkRateLimit, getClientIp, rateLimitHeaders, RL_AUTH_IP } from '@/lib/rate-limit';

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

export default clerkMiddleware(async (auth, request) => {
  // Rate-limit sign-in / sign-up pages by trusted IP only.
  // If no trusted IP (e.g. local dev without proxy), skip IP limiting — user-based limits still apply elsewhere.
  if (isAuthRoute(request)) {
    const ip = getClientIp(request);
    if (ip) {
      const rl = checkRateLimit({ key: `auth:${ip}`, limit: RL_AUTH_IP.limit, windowMs: RL_AUTH_IP.windowMs });
      if (!rl.success) {
        const headers = rateLimitHeaders(rl);
        const isJson = request.headers.get('accept')?.includes('application/json');
        if (isJson) return NextResponse.json({ error: 'Too Many Requests' }, { status: 429, headers });
        return new NextResponse('<h1>429 Too Many Requests</h1><p>Please wait a moment and retry.</p>', {
          status: 429,
          headers: { 'Content-Type': 'text/html; charset=utf-8', ...headers },
        });
      }
    }
  }

  // CORS preflight: let API OPTIONS pass through immediately so browsers
  // don't see a 404/redirect. Same-origin fetches don't need this, but it
  // prevents "CORS preflight failed" when preview deployments or external
  // tools call /api/* from another origin.
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
        // For API routes return JSON 401 so client fetch gets parsable
        // JSON instead of an HTML redirect (which causes "Unexpected token <"
        // and surfaces as "page could not load").
        if (isApiRoute(request)) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        await auth.protect();
      }
    }
  } catch (err: any) {
    // Stale session cookie (rotated keys, expired JWT, etc.) — clear it and
    // redirect to sign-in instead of crashing the entire site with a 500.
    const isKeyError =
      err?.reason === 'jwk-kid-mismatch' ||
      err?.message?.includes('signing key') ||
      err?.message?.includes('Handshake');

    // API routes must always return JSON, never an HTML redirect, so the
    // client can handle 401 gracefully.
    if (isApiRoute(request)) {
      const status = err?.status === 401 || err?.message?.includes('Unauth') ? 401 : 500;
      return NextResponse.json({ error: isKeyError ? 'Session expired' : 'Unauthorized' }, { status: isKeyError ? 401 : status });
    }

    if (isKeyError || isPublicRoute(request)) {
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
