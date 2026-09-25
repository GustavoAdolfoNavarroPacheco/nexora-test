import { createAuthClient } from 'better-auth/react';
import { WELCOME_COOKIE, type Provider } from './auth-shared';

export const authClient = createAuthClient();

export function markWelcome(provider: Provider) {
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${WELCOME_COOKIE}=${provider}; Max-Age=600; Path=/; SameSite=Lax${secure}`;
}

export function clearWelcome() {
  document.cookie = `${WELCOME_COOKIE}=; Max-Age=0; Path=/; SameSite=Lax`;
}
