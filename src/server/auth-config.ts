import 'server-only';

/** Session cookies are `nexora.session_token` (and `__Secure-nexora…` over HTTPS). */
export const AUTH_COOKIE_PREFIX = 'nexora';

export interface AvailableProviders {
  google: boolean;
  apple: boolean;
}

/** Which sign-in buttons can actually work with the credentials in the environment. */
export function availableProviders(): AvailableProviders {
  const env = process.env;
  return {
    google: Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET),
    apple: Boolean(env.APPLE_CLIENT_ID && env.APPLE_TEAM_ID && env.APPLE_KEY_ID && env.APPLE_PRIVATE_KEY),
  };
}
