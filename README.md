# Nexora

Gestión de proyectos y equipos con Next.js 16, Postgres en [Neon](https://neon.tech) y Drizzle ORM.

## Puesta en marcha

1. Instala dependencias:

   ```bash
   npm install
   ```

2. Copia `.env.example` a `.env.local` y pon tu cadena de conexión de Neon en `DATABASE_URL`.
   `APP_TIMEZONE` define qué día es «hoy» para vencimientos y etiquetas como «Ayer».
   Genera `BETTER_AUTH_SECRET` con `npx @better-auth/cli secret` y configura al menos un proveedor
   de inicio de sesión (ver [Inicio de sesión](#inicio-de-sesión)).

3. Crea las tablas:

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
| `npm run db:setup` | Igual que `db:migrate` (primera instalación) |
| `npm run db:studio` | Abre Drizzle Studio para explorar los datos |

Para cambiar el modelo: edita `schema.ts`, ejecuta `db:generate`, revisa el SQL generado y aplica con `db:migrate`.

## Inicio de sesión

Nexora solo admite Apple y Google (no hay contraseñas propias). Al entrar por primera vez se crea
la cuenta y la persona pasa a ser miembro del equipo. Todo lo demás exige sesión: `src/proxy.ts`
redirige a `/login`, y cada ruta de la API y el layout de la app comprueban la sesión contra la base de datos.

**Google** — [Google Cloud Console](https://console.cloud.google.com/apis/credentials) → Crear
credenciales → ID de cliente de OAuth → *Aplicación web*.

- Orígenes autorizados: `http://localhost:3000` (y tu dominio en producción).
- URI de redireccionamiento: `http://localhost:3000/api/auth/callback/google` (y `https://tu-dominio/api/auth/callback/google`).
- Copia el ID y el secreto en `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET`.

**Apple** — requiere una cuenta del Apple Developer Program y un dominio público con HTTPS
(Apple no acepta `localhost`; para probar en local usa un túnel como ngrok o Cloudflare Tunnel).

1. *Identifiers* → App ID con la capacidad **Sign in with Apple**.
2. *Identifiers* → **Services ID** (será `APPLE_CLIENT_ID`); activa Sign in with Apple, añade tu
   dominio y la Return URL `https://tu-dominio/api/auth/callback/apple`.
3. *Keys* → nueva clave con Sign in with Apple → descarga el `.p8` (solo se puede una vez).
4. Rellena `APPLE_TEAM_ID`, `APPLE_KEY_ID` y `APPLE_PRIVATE_KEY` (contenido del `.p8` con los saltos
   de línea escritos como `\n`). El secreto que pide Apple se firma solo al arrancar; no hay que renovarlo.

`BETTER_AUTH_URL` debe ser la URL pública exacta de la app. `AUTH_ALLOWED_EMAILS` limita quién puede
entrar (`ana@empresa.com, @empresa.com`); vacío permite cualquier cuenta.

Seguridad incluida: cookies `HttpOnly` y `SameSite=Lax` (`Secure` en HTTPS), PKCE y `state` en OAuth,
tokens de Google/Apple cifrados en la base de datos (AES-256-GCM), límite de intentos por IP guardado en
Postgres, bloqueo de escrituras desde otros sitios y redirecciones `?next=` limitadas a rutas propias.
En Configuración → Seguridad se ven los dispositivos con sesión abierta y se pueden cerrar.

## Arquitectura

- `src/server/db/` — esquema Drizzle y cliente Neon (HTTP, sin pool de conexiones).
- `src/server/auth.ts` — configuración de Better Auth (proveedores, sesiones, límites); `/api/auth/*` lo atiende.
- `src/server/session.ts` — `getSession()` y `authed()`, que envuelve cada ruta de la API y le pasa el id del usuario.
- `src/app/login/` y `src/components/auth/` — pantalla de inicio de sesión y animación de bienvenida.
- `src/server/workspace.ts` — lee todo el espacio de trabajo en una sola petición a Neon.
- `src/server/mutations.ts` — escrituras; el avance de cada proyecto y el registro de actividad se calculan aquí, en la misma transacción.
- `src/server/validation.ts` — validación de entrada con Zod.
- `src/app/api/` — API REST (`/api/workspace`, `/api/projects`, `/api/tasks`, …).
- `src/lib/store.tsx` — estado del cliente. Aplica los cambios al instante (optimista) y, si el servidor los rechaza, muestra un aviso y recarga el estado real.

Cada cuenta tiene un espacio privado: los proyectos pertenecen a quien los crea (`projects.owner_id`) y
todo lo demás cuelga de ellos. `getWorkspace` solo lee lo del usuario de la sesión y cada escritura en
`mutations.ts` se filtra por propietario, así que un id ajeno responde 404. Los gráficos de avance se
calculan con las fechas reales de creación y cierre de cada tarea (`tasks.completed_at`).
