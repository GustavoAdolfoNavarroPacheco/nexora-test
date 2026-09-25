import 'server-only';
import { z } from 'zod';

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
  }
}

export const notFound = (what: string) => new HttpError(404, `${what} no existe.`);

export async function readJson<T extends z.ZodType>(request: Request, schema: T): Promise<z.output<T>> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw new HttpError(400, 'El cuerpo de la petición no es JSON válido.');
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const where = issue?.path.length ? `${issue.path.join('.')}: ` : '';
    throw new HttpError(422, `${where}${issue?.message ?? 'Datos no válidos.'}`);
  }
  return parsed.data;
}

// Postgres error codes that map to client mistakes rather than server faults.
const PG_CLIENT_ERRORS: Record<string, [number, string]> = {
  '23505': [409, 'Ya existe un registro con ese identificador.'],
  '23503': [422, 'Hace referencia a un proyecto, tarea o persona que no existe.'],
  '22P02': [422, 'Algún valor tiene un formato no válido.'],
};

function pgCode(err: unknown): string | undefined {
  let current: unknown = err;
  for (let depth = 0; current && depth < 4; depth++) {
    const code = (current as { code?: unknown }).code;
    if (typeof code === 'string') return code;
    current = (current as { cause?: unknown }).cause;
  }
  return undefined;
}

/** Wraps a route handler: JSON responses, typed errors, no stack traces leaked to the client. */
export function handle<A extends unknown[]>(fn: (...args: A) => Promise<unknown>) {
  return async (...args: A): Promise<Response> => {
    try {
      const result = await fn(...args);
      return Response.json(result ?? { ok: true });
    } catch (err) {
      if (err instanceof HttpError) return Response.json({ error: err.message }, { status: err.status });
      const mapped = PG_CLIENT_ERRORS[pgCode(err) ?? ''];
      if (mapped) return Response.json({ error: mapped[1] }, { status: mapped[0] });
      console.error('[api]', err);
      return Response.json({ error: 'No se pudo completar la operación. Inténtalo de nuevo.' }, { status: 500 });
    }
  };
}
