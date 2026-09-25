export type Provider = 'google' | 'apple';

/** Marks a sign-in in progress so the app can greet the user once the provider sends them back. */
export const WELCOME_COOKIE = 'nexora_welcome';

/** Only same-origin paths, so `?next=` can't bounce the user to another site after signing in. */
export function safeNext(value: unknown): string {
  if (typeof value !== 'string' || !value.startsWith('/') || /^\/[/\\]/.test(value)) return '/';
  if (value.startsWith('/login') || value.startsWith('/api/')) return '/';
  return value;
}
