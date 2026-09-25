'use client';

import { DatabaseZap } from 'lucide-react';

/** Shown instead of the app when the workspace cannot be read from the database. */
export function DatabaseUnavailable() {
  return (
    <main className="flex min-h-dvh items-center justify-center p-6">
      <div className="surface flex max-w-sm flex-col items-center px-8 py-12 text-center">
        <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-soft text-red-ink">
          <DatabaseZap className="h-6 w-6" />
        </span>
        <h1 className="text-title-2 text-ink">No podemos conectar con la base de datos</h1>
        <p className="text-footnote mt-2 text-ink-2">
          Comprueba tu conexión a internet. Si el problema sigue, revisa que DATABASE_URL en .env.local sea correcta.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 h-10 rounded-full bg-accent px-5 text-sm font-medium text-white transition-colors hover:bg-accent-hover active:scale-95"
        >
          Reintentar
        </button>
      </div>
    </main>
  );
}
