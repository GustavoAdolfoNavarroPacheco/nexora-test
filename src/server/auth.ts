import 'server-only';
import { createPrivateKey, sign } from 'node:crypto';
import { betterAuth, type BetterAuthOptions } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { nextCookies } from 'better-auth/next-js';
import { db, schema as S } from './db';
import { AUTH_COOKIE_PREFIX, availableProviders } from './auth-config';

const ID_PREFIX: Record<string, string> = {
  user: 'usr',
  session: 'ses',
  account: 'acc',
  verification: 'ver',
  rateLimit: 'rl',
};

/**
 * Apple wants the client secret as an ES256 JWT signed with the .p8 key and caps its life at
 * six months. Signing it at startup means nobody has to remember to renew it.
 */
function appleClientSecret(): string {
  const { APPLE_TEAM_ID, APPLE_KEY_ID, APPLE_CLIENT_ID, APPLE_PRIVATE_KEY = '' } = process.env;
  const key = createPrivateKey(APPLE_PRIVATE_KEY.replace(/\\n/g, '\n'));
  const now = Math.floor(Date.now() / 1000);
  const encode = (value: object) => Buffer.from(JSON.stringify(value)).toString('base64url');
  const input = `${encode({ alg: 'ES256', kid: APPLE_KEY_ID })}.${encode({
    iss: APPLE_TEAM_ID,
    iat: now,
    exp: now + 150 * 24 * 60 * 60,
    aud: 'https://appleid.apple.com',
    sub: APPLE_CLIENT_ID,
  })}`;
  const signature = sign('sha256', Buffer.from(input), { key, dsaEncoding: 'ieee-p1363' });
  return `${input}.${signature.toString('base64url')}`;
}

function socialProviders(): BetterAuthOptions['socialProviders'] {
  const providers: BetterAuthOptions['socialProviders'] = {};
  const available = availableProviders();
  if (available.google) {
    providers.google = {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      prompt: 'select_account',
    };
  }
  if (available.apple) {
    providers.apple = {
      clientId: process.env.APPLE_CLIENT_ID!,
      clientSecret: appleClientSecret(),
      appBundleIdentifier: process.env.APPLE_APP_BUNDLE_ID || undefined,
    };
  }
  return providers;
}

/** `AUTH_ALLOWED_EMAILS="ana@empresa.com, @empresa.com"`: exact addresses or whole domains. Empty = anyone. */
function isAllowed(email: string | undefined) {
  const rules = (process.env.AUTH_ALLOWED_EMAILS ?? '')
    .split(',')
    .map((r) => r.trim().toLowerCase())
    .filter(Boolean);
  if (rules.length === 0) return true;
  const address = (email ?? '').toLowerCase();
  return rules.some((rule) => (rule.startsWith('@') ? address.endsWith(rule) : address === rule));
}

export const auth = betterAuth({
  appName: 'NexoraWork',
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user: S.users,
      session: S.sessions,
      account: S.accounts,
      verification: S.verifications,
      rateLimit: S.rateLimits,
    },
  }),
  user: {
    fields: { image: 'avatar' },
    validateUserInfo: ({ user }) => {
      if (!isAllowed(user.email)) {
        return { error: 'not_allowed', errorDescription: 'Esta cuenta no tiene acceso a este espacio de trabajo.' };
      }
    },
  },
  socialProviders: socialProviders(),
  account: {
    // A leaked database backup must not hand out working Google or Apple tokens.
    encryptOAuthTokens: true,
    accountLinking: { enabled: true },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24,
    // Signed cookie that spares a database round trip on most requests; revocations apply within 5 minutes.
    cookieCache: { enabled: true, maxAge: 5 * 60 },
  },
  // Apple returns with a cross-site POST (form_post).
  trustedOrigins: ['https://appleid.apple.com'],
  rateLimit: {
    storage: 'database',
    window: 60,
    max: 60,
    customRules: { '/sign-in/*': { window: 60, max: 10 } },
  },
  advanced: {
    cookiePrefix: AUTH_COOKIE_PREFIX,
    database: {
      // Same `prefix-uuid` shape as the rest of the workspace ids.
      generateId: ({ model }) => `${ID_PREFIX[model] ?? model}-${crypto.randomUUID()}`,
    },
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          await db.insert(S.notifications).values({
            id: `ntf-${crypto.randomUUID()}`,
            userId: user.id,
            title: 'Te damos la bienvenida a NexoraWork',
            description: 'Explora los proyectos del equipo o crea el tuyo desde el botón +.',
            type: 'alert',
          });
        },
      },
    },
  },
  plugins: [nextCookies()],
});

export type AuthSession = typeof auth.$Infer.Session;
