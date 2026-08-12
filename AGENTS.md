<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Hospital-Tesis

## Next.js 16 quirks
- `middleware.ts` → `proxy.ts`. File at `src/proxy.ts` (same level as `app/`), named export `proxy`, config `matcher`.
- `params` and `searchParams` in pages/layouts are `Promise<>` — must `await` them.
- `cookies()` from `next/headers` is async: `const cookieStore = await cookies()`.
- `proxy.ts` defaults to Node.js runtime (no `runtime` config allowed).

## Commands
```
pnpm install              # install dependencies (use --frozen-lockfile in CI)
pnpm dev                  # dev server on localhost:3000
pnpm build                # builds + typechecks (no separate typecheck script)
pnpm lint                 # ESLint only
pnpm dev | pnpm exec pino-pretty   # dev server with pretty JSON logs
node scripts/verificar-observabilidad.mjs --contrasena '<pw>'   # verificación E2E de logs pino (proxies, correlación request_id, redacción, niveles)
```
Tests: vitest (`pnpm test`).

## Supabase auth — three client factories
| File | Import | Context |
|------|--------|---------|
| `src/lib/supabase/cliente.ts` | `createBrowserClient` | Browser (client components) |
| `src/lib/supabase/servidor.ts` | `createServerClient` + `await cookies()` | Server components / server actions |
| `src/lib/supabase/cliente-proxy.ts` | `createServerClient` + `request.cookies` | Proxy (`proxy.ts`) |

DB migration: `supabase/migracion.sql` — must be run manually in Supabase SQL Editor.

## Architecture
- Spanish-language hospital auth system (labels, routes, component names in ES).
- Server Actions in `src/app/acciones/auth.ts` (`"use server"`).
- Zod v4 schemas in `src/lib/esquemas/auth.ts`.
- Progressive login delay via Supabase RPC (`obtener_contexto_login`), IP rate limiting.
- Path alias `@/*` → `./src/*`.
- Route group `(panel)/` wraps dashboard pages.

## Tailwind CSS v4
- `@import "tailwindcss"` (not `@tailwind` directives).
- Custom `cn()` utility from `src/lib/utilidades.ts`.

## Observability
- Structured JSON logging with pino via `src/lib/registro.ts` (`crearLogger`, singleton `logger`, `obtenerLogger()` for request scope). **Never use `console.*`** — use the logger.
- Correlation: `proxy.ts` generates/forwards `x-request-id` (AsyncLocalStorage via `runConRequestId` + response header). `obtenerLogger()` falls back to reading the header with `headers()`.
- Sensitive fields are redacted to `[REDACTADO]`: password, contrasena, token, invitacion_token_hash, authorization, cookie, correo, email.
- Level via `LOG_LEVEL` env (default `info`). Base fields: `env`, `servicio: "hospital-tesis"`.
- Log message keys in Spanish (e.g., `accion`, `motivo`, `ip`, `duracion_ms`). Server actions log with `obtenerLogger()` for `request_id`.
- Dev prettify: `pnpm dev | pnpm exec pino-pretty`. `pino-pretty` is a devDependency used only from the shell (never imported).

## Conventions
- `.env*` in `.gitignore`. Dev requires `.env.local` with `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, optional SMTP vars.
- Component folder uses Spanish plural: `componentes/` not `components/`.
- Interface names prefixed with `Props` (e.g., `PropsBoton`), Spanish for component props.
- `"use client"` at component level, not in barrel files.
