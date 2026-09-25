import 'server-only';
import { cache } from 'react';
import { headers } from 'next/headers';
import { auth } from './auth';
import { HttpError, handle } from './http';

/** The signed-in user's session, or null. Deduplicated within one render. */
export const getSession = cache(async () => auth.api.getSession({ headers: await headers() }));

export async function requireUserId(): Promise<string> {
  const session = await getSession();
  if (!session) throw new HttpError(401, 'Tu sesión ha caducado. Vuelve a iniciar sesión.');
  return session.user.id;
}

/** `handle` for routes that need a signed-in user: 401 otherwise, and the user's id first. */
export function authed<A extends unknown[]>(fn: (userId: string, ...args: A) => Promise<unknown>) {
  return handle(async (...args: A) => fn(await requireUserId(), ...args));
}
