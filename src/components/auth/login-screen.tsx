'use client';

import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion, MotionConfig, useAnimationControls, type Variants } from 'motion/react';
import { AlertCircle, Clock, Lock } from 'lucide-react';
import { NexoraMark } from '@/components/ui/nexora-mark';
import { authClient, markWelcome } from '@/lib/auth-client';
import type { Provider } from '@/lib/auth-shared';
import { easeApple, spring } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { AppleLogo, GoogleLogo } from './brand-icons';
import { Showcase } from './showcase';

const PROVIDER_NAME: Record<Provider, string> = { apple: 'Apple', google: 'Google' };

/** Better Auth and provider error codes → something a person can act on. */
function describeError(code: string, provider?: Provider): string {
  const c = code.toLowerCase();
  if (c === 'provider_unavailable')
    return `El acceso con ${provider ? PROVIDER_NAME[provider] : 'este proveedor'} todavía no está configurado en este servidor.`;
  if (c === 'not_allowed') return 'Esta cuenta no tiene acceso a Nexora. Pide acceso a quien administra el espacio de trabajo.';
  if (c === 'access_denied' || c.includes('cancel')) return 'Cancelaste el inicio de sesión. Puedes intentarlo cuando quieras.';
  if (c === 'rate_limited') return 'Demasiados intentos seguidos. Espera un minuto y vuelve a probar.';
  if (c.includes('state') || c.includes('restart')) return 'El inicio de sesión tardó demasiado. Vuelve a intentarlo.';
  if (c.includes('email')) return 'Tu cuenta no compartió un correo verificado. Prueba con otra cuenta.';
  if (c.includes('link')) return 'Ya existe una cuenta con ese correo. Entra con el método que usaste la primera vez.';
  if (c === 'network') return 'No hay conexión. Revisa tu red e inténtalo otra vez.';
  return 'No pudimos iniciar sesión. Inténtalo de nuevo.';
}

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.15 } },
};

const rise: Variants = {
  hidden: { opacity: 0, y: 18, filter: 'blur(8px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.7, ease: easeApple } },
};

function AppIcon() {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, scale: 0.5, rotate: -12 },
        show: { opacity: 1, scale: 1, rotate: 0, transition: { type: 'spring', stiffness: 260, damping: 16 } },
      }}
      whileHover={{ scale: 1.06, rotate: -4 }}
      whileTap={{ scale: 0.94 }}
      className="relative h-16 w-16 lg:h-[72px] lg:w-[72px]"
    >
      {/* Gentle idle float, like a widget on the home screen. */}
      <motion.div
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
        className="relative h-full w-full overflow-hidden rounded-[18px] shadow-[0_18px_36px_-12px_color-mix(in_srgb,var(--accent)_70%,transparent)]"
      >
        <NexoraMark className="h-full w-full" />
        <span className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-transparent" />
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/45 to-transparent"
          initial={{ x: '-160%' }}
          animate={{ x: '260%' }}
          transition={{ duration: 1.3, ease: easeApple, repeat: Infinity, repeatDelay: 4.5, delay: 1.2 }}
        />
      </motion.div>
    </motion.div>
  );
}

function ProviderButton({
  provider,
  loading,
  dimmed,
  onClick,
}: {
  provider: Provider;
  loading: boolean;
  dimmed: boolean;
  onClick: () => void;
}) {
  const name = PROVIDER_NAME[provider];
  const busy = loading || dimmed;
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={busy}
      aria-busy={loading}
      whileHover={busy ? undefined : { y: -2 }}
      whileTap={busy ? undefined : { scale: 0.97 }}
      animate={{ opacity: dimmed ? 0.4 : 1 }}
      transition={spring}
      className={cn(
        'group relative flex h-[54px] w-full items-center justify-center gap-3 overflow-hidden rounded-full text-[16px] font-medium tracking-[-0.015em]',
        'transition-shadow duration-300 ease-apple focus-visible:outline-offset-4',
        provider === 'apple'
          ? 'bg-ink text-canvas shadow-[0_1px_2px_rgba(0,0,0,0.2)] hover:shadow-[0_16px_32px_-14px_rgba(0,0,0,0.6)] dark:hover:shadow-[0_16px_36px_-14px_rgba(255,255,255,0.35)]'
          : 'bg-card text-ink shadow-[inset_0_0_0_1px_var(--line-strong)] hover:shadow-[inset_0_0_0_1px_var(--line-strong),0_16px_32px_-16px_rgba(0,0,0,0.28)]'
      )}
    >
      {/* Light sweep on hover. */}
      <span
        aria-hidden
        className={cn(
          'pointer-events-none absolute inset-y-0 left-0 w-1/3 -translate-x-full -skew-x-12 bg-gradient-to-r from-transparent to-transparent',
          'transition-transform duration-[900ms] ease-apple group-hover:translate-x-[360%]',
          provider === 'apple' ? 'via-white/25 dark:via-black/10' : 'via-black/[0.05] dark:via-white/10'
        )}
      />
      <span className="relative flex h-5 w-5 items-center justify-center">
        <AnimatePresence mode="popLayout" initial={false}>
          {loading ? (
            <motion.span
              key="spinner"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="h-[18px] w-[18px] animate-spin rounded-full border-2 border-current border-r-transparent"
            />
          ) : (
            <motion.span
              key="logo"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="transition-transform duration-300 ease-apple group-hover:scale-110"
            >
              {provider === 'apple' ? <AppleLogo className="-mt-0.5 h-5 w-5" /> : <GoogleLogo className="h-5 w-5" />}
            </motion.span>
          )}
        </AnimatePresence>
      </span>
      <span className="relative">{loading ? `Conectando con ${name}…` : `Continuar con ${name}`}</span>
    </motion.button>
  );
}

export interface LoginScreenProps {
  providers: Record<Provider, boolean>;
  next: string;
  error?: string;
  expired?: boolean;
}

export function LoginScreen({ providers, next, error: initialError, expired }: LoginScreenProps) {
  const [pending, setPending] = useState<Provider | null>(null);
  const [error, setError] = useState<{ code: string; provider?: Provider } | null>(
    initialError ? { code: initialError } : null
  );
  const [errorKey, setErrorKey] = useState(0);
  const shake = useAnimationControls();

  // iOS "wrong passcode" shake whenever a new error shows up.
  useEffect(() => {
    if (!error) return;
    void shake.start({ x: [0, -11, 10, -7, 5, -2, 0], transition: { duration: 0.5, delay: errorKey === 0 ? 0.7 : 0 } });
  }, [error, errorKey, shake]);

  // Coming back with the browser's Back button from Google or Apple restores this page from the
  // back/forward cache with the spinner still going.
  useEffect(() => {
    const onShow = (e: PageTransitionEvent) => {
      if (e.persisted) setPending(null);
    };
    window.addEventListener('pageshow', onShow);
    return () => window.removeEventListener('pageshow', onShow);
  }, []);

  const fail = (code: string, provider?: Provider) => {
    setPending(null);
    setError({ code, provider });
    setErrorKey((k) => k + 1);
  };

  const signIn = async (provider: Provider) => {
    if (pending) return;
    if (!providers[provider]) return fail('provider_unavailable', provider);
    setError(null);
    setPending(provider);
    markWelcome(provider);
    try {
      const { error: apiError } = await authClient.signIn.social({
        provider,
        callbackURL: next,
        errorCallbackURL: next === '/' ? '/login' : `/login?next=${encodeURIComponent(next)}`,
      });
      // On success the client is already navigating to the provider; keep the spinner until it does.
      if (apiError) fail(apiError.status === 429 ? 'rate_limited' : (apiError.code ?? 'unknown'), provider);
    } catch {
      fail('network', provider);
    }
  };

  return (
    <MotionConfig reducedMotion="user">
      <main className="flex min-h-dvh flex-col bg-tile lg:flex-row lg:gap-3 lg:bg-canvas lg:p-3">
        <Showcase className="px-6 pt-[max(24px,env(safe-area-inset-top))] pb-12 sm:min-h-[44dvh] lg:min-h-0 lg:flex-[1.15] lg:rounded-[30px] lg:p-10" />

        <motion.section
          initial={{ y: 48, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 26, delay: 0.05 }}
          className="relative z-10 -mt-7 flex flex-1 flex-col rounded-t-[32px] bg-canvas px-6 pt-9 pb-[max(28px,env(safe-area-inset-bottom))] shadow-[0_-20px_40px_-20px_rgba(0,0,0,0.5)] lg:mt-0 lg:items-center lg:justify-center lg:rounded-none lg:px-10 lg:shadow-none"
        >
          <motion.div animate={shake} className="mx-auto flex w-full max-w-[380px] flex-1 flex-col lg:flex-none">
            <motion.div variants={stagger} initial="hidden" animate="show" className="flex flex-1 flex-col">
              <AppIcon />

              <motion.h1 variants={rise} className="mt-5 text-[28px] leading-[1.08] sm:text-[30px] font-semibold tracking-[-0.035em] text-ink lg:text-[36px]">
                Inicia sesión
                <br />
                en Nexora
              </motion.h1>
              <motion.p variants={rise} className="mt-3 text-[15px] leading-relaxed text-ink-2">
                Entra con tu cuenta de Apple o Google. Si es tu primera vez, la creamos al instante.
              </motion.p>

              <AnimatePresence initial={false}>
                {expired && !error && (
                  <motion.p
                    key="expired"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <span className="mt-5 flex items-start gap-2.5 rounded-[16px] bg-accent-soft px-4 py-3 text-[13px] leading-snug text-accent-ink">
                      <Clock className="mt-px h-4 w-4 shrink-0" />
                      Tu sesión caducó. Vuelve a entrar y te llevamos a donde estabas.
                    </span>
                  </motion.p>
                )}
                {error && (
                  <motion.div
                    key={`error-${errorKey}`}
                    role="alert"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.35, ease: easeApple }}
                    className="overflow-hidden"
                  >
                    <div className="mt-5 flex items-start gap-2.5 rounded-[16px] bg-red-soft px-4 py-3 text-[13px] leading-snug text-red-ink">
                      <AlertCircle className="mt-px h-4 w-4 shrink-0" />
                      {describeError(error.code, error.provider)}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-auto space-y-3 pt-8 lg:mt-0">
                {(['apple', 'google'] as const).map((p) => (
                  <motion.div key={p} variants={rise}>
                    <ProviderButton
                      provider={p}
                      loading={pending === p}
                      dimmed={pending !== null && pending !== p}
                      onClick={() => void signIn(p)}
                    />
                  </motion.div>
                ))}
              </div>

              <motion.p variants={rise} className="mt-6 flex items-start justify-center gap-2 text-center text-[12px] leading-snug text-ink-3">
                <Lock className="mt-px h-3.5 w-3.5 shrink-0" />
                <span>Nexora nunca ve tu contraseña: Apple o Google confirman que eres tú.</span>
              </motion.p>
            </motion.div>
          </motion.div>
        </motion.section>
      </main>
    </MotionConfig>
  );
}
