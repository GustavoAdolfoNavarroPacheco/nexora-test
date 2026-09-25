import { NextResponse, type NextRequest } from 'next/server';
import { getSessionCookie } from 'better-auth/cookies';

/**
 * Optimistic gate: only checks that a session cookie is present, without a database hit.
 * The real check happens in the (app) layout and in every API route (`authed`).
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hasSession = Boolean(getSessionCookie(request, { cookiePrefix: 'nexora' }));

  if (pathname.startsWith('/api/')) {
    // Writes only from our own pages (SameSite cookies already block most of this; belt and braces).
    if (request.method !== 'GET' && request.method !== 'HEAD' && isCrossSite(request)) {
      return Response.json({ error: 'Origen no permitido.' }, { status: 403 });
    }
    return hasSession ? NextResponse.next() : Response.json({ error: 'Inicia sesión para continuar.' }, { status: 401 });
  }
  if (pathname === '/login' || hasSession) return NextResponse.next();

  const login = new URL('/login', request.url);
  if (pathname !== '/') login.searchParams.set('next', pathname + search);
  return NextResponse.redirect(login);
}

function isCrossSite(request: NextRequest) {
  const fetchSite = request.headers.get('sec-fetch-site');
  if (fetchSite) return fetchSite !== 'same-origin' && fetchSite !== 'none';
  const origin = request.headers.get('origin');
  if (!origin) return false;
  try {
    return new URL(origin).host !== request.headers.get('host');
  } catch {
    return true;
  }
}

export const config = {
  // Everything except Better Auth's own endpoints, Next internals (assets, images, dev HMR) and files with an extension.
  matcher: ['/((?!api/auth|_next/|apple-icon|.*\\..*).*)'],
};
