import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhook(.*)',
  '/api/whatsapp/webhook(.*)',
]);

const isAuthRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)']);

export default clerkMiddleware(async (auth, request) => {
  if (!process.env.CLERK_SECRET_KEY) {
    if (!isPublicRoute(request)) {
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
      await auth.protect();
    }
  } catch (err: any) {
    // Stale session cookie (rotated keys, expired JWT, etc.) — clear it and
    // redirect to sign-in instead of crashing the entire site with a 500.
    const isKeyError =
      err?.reason === 'jwk-kid-mismatch' ||
      err?.message?.includes('signing key') ||
      err?.message?.includes('Handshake');

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
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
    '/__clerk/:path*',
  ],
};
