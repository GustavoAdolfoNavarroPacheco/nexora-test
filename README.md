# Nexora

Gestión de proyectos y equipos con Next.js 16, Postgres en [Neon](https://neon.tech) y Drizzle ORM.

## Puesta en marcha

1. Instala dependencias:

   ```bash
   npm install
   ```

2. Copia `.env.example` a `.env.local` y pon tu cadena de conexión de Neon en `DATABASE_URL`.
   `APP_TIMEZONE` define qué día es «hoy» para vencimientos y etiquetas como «Ayer».

3. Crea las tablas y carga los datos de ejemplo:

   ```bash
   npm run db:setup
   ```

4. Arranca el servidor de desarrollo y abre [http://localhost:3000](http://localhost:3000):

   ```bash
   npm run dev
   ```

## Base de datos

| Script | Qué hace |
| --- | --- |
| `npm run db:generate` | Genera una migración SQL en `drizzle/` a partir de `src/server/db/schema.ts` |
| `npm run db:migrate` | Aplica las migraciones pendientes en Neon |
| `npm run db:seed` | Borra y vuelve a cargar el espacio de ejemplo (fechas desplazadas a hoy) |
| `npm run db:setup` | `db:migrate` + `db:seed` |
| `npm run db:studio` | Abre Drizzle Studio para explorar los datos |

Para cambiar el modelo: edita `schema.ts`, ejecuta `db:generate`, revisa el SQL generado y aplica con `db:migrate`.

## Arquitectura

- `src/server/db/` — esquema Drizzle y cliente Neon (HTTP, sin pool de conexiones).
- `src/server/workspace.ts` — lee todo el espacio de trabajo en una sola petición a Neon.
- `src/server/mutations.ts` — escrituras; el avance de cada proyecto y el registro de actividad se calculan aquí, en la misma transacción.
- `src/server/validation.ts` — validación de entrada con Zod.
- `src/app/api/` — API REST (`/api/workspace`, `/api/projects`, `/api/tasks`, …).
- `src/lib/store.tsx` — estado del cliente. Aplica los cambios al instante (optimista) y, si el servidor los rechaza, muestra un aviso y recarga el estado real.

Aún no hay inicio de sesión: todas las peticiones actúan como el usuario definido en `src/server/config.ts`.
