<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Hospital-Tesis

## Next.js 16 quirks
- `middleware.ts` → `proxy.ts`. File at root (`proxy.ts`), named export `proxy`, config `matcher`.
- `params` and `searchParams` in pages/layouts are `Promise<>` — must `await` them.
- `cookies()` from `next/headers` is async: `const cookieStore = await cookies()`.
- `proxy.ts` defaults to Node.js runtime (no `runtime` config allowed).

## Commands
```
npm run dev        # dev server on localhost:3000
npm run build      # builds + typechecks (no separate typecheck script)
npm run lint       # ESLint only
```
No test framework is configured.

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
- Custom theme provider (no next-themes): `localStorage` + `.dark` class toggle.
- Progressive login delay via Supabase RPC (`obtener_fallos_usuario`), IP rate limiting.
- Path alias `@/*` → `./src/*`.
- Route group `(panel)/` wraps dashboard pages.

## Tailwind CSS v4
- `@import "tailwindcss"` (not `@tailwind` directives).
- `@custom-variant dark (&:where(.dark, .dark *));` for dark mode.
- Custom `cn()` utility from `src/lib/utilidades.ts`.

## Conventions
- `.env*` in `.gitignore`. Dev requires `.env.local` with `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, optional SMTP vars.
- Component folder uses Spanish plural: `componentes/` not `components/`.
- Interface names prefixed with `Props` (e.g., `PropsBoton`), Spanish for component props.
- `"use client"` at component level, not in barrel files.
