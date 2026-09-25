import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { LoginScreen } from '@/components/auth/login-screen';
import { safeNext } from '@/lib/auth-shared';
import { availableProviders } from '@/server/auth-config';
import { getSession } from '@/server/session';

export const metadata: Metadata = {
  title: 'Iniciar sesión — Nexora',
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function LoginPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const next = safeNext(params.next);

  if (await getSession()) redirect(next);

  return (
    <LoginScreen
      providers={availableProviders()}
      next={next}
      error={typeof params.error === 'string' ? params.error.slice(0, 64) : undefined}
      expired={params.expired === '1'}
    />
  );
}
