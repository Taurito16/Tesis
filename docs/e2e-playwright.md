# E2E con Playwright (fase 2b — documentación)

> Documento: **planificado, no implementado.** Deja por escrito la estrategia para que la
> fase 2b se ejecute sin romper nada. Todavía no se agregan dependencias, navegadores ni
> scripts.

## Propósito

Los tests unitarios (Vitest) cubren piezas aisladas (esquemas, utilidades, hook,
componentes). El E2E abre un navegador real y cubre los flujos de integración donde viven
los bugs más delicados de esta app: campos que se ven vacíos al errar, errores "fantasma",
doble submit, y la combinación formulario + Server Action + cookies/redirect.

## Flujos críticos a cubrir

1. **Iniciar sesión con "recordarme"**
   - Escribir credenciales, marcar "recordarme", entrar al panel.
   - Recargar y verificar que la sesión persiste (cookies).
2. **Crear usuario desde el drawer** (ruta `/usuarios`)
   - Abrir el drawer → elegir rol (radios) → enviar con un campo vacío → verificar que
     solo ese campo marca error, que los campos llenados no se borran y que el rol no se
     deselecciona → rellenar → enviar → ver "Invitación enviada" y cierre del drawer.
3. **Completar registro vía enlace de invitación**
   - Navegar a `/auth/completar-registro?token=...`, definir contraseña, validar el manejo
     de mismatch/requisitos, redirigir a `/iniciar-sesion` y poder entrar con la cuenta.

## Herramientas y setup propuesto

- `@playwright/test` como devDependency (`pnpm add -D @playwright/test`).
- Proyecto Supabase de **staging** (nunca producción): los E2E crean datos y no deben
  tocar datos reales.
- Variables propias en `.env.e2e` (ignorado por `.gitignore` vía `.env*`).
- Script: `"test:e2e": "playwright test"`.
- `playwright.config.ts` con `webServer` que levanta el **build** (`pnpm build` +
  `pnpm start`), **no** `next dev` — este proyecto solo debe medirse contra build.

## Reglas a respetar

- **Nunca medir con `next dev`.** Usar `pnpm build` + `pnpm start`.
- **Staging, no producción.**
- **Datos idempotentes:** usuarios con usuario/correo únicos por corrida para poder repetir
  las pruebas sin estado residual.
- En Windows, `pnpm dev` y `pnpm build/start` a la vez bloquean `.next` (ver AGENTS.md);
  los E2E se corren solos contra `start`.

## Integración opcional al CI

Job `e2e` en `.github/workflows/ci.yml` (agregar solo al implementar la fase 2b):

```yaml
e2e:
  runs-on: ubuntu-latest
  needs: build
  if: secrets.E2E_BASE_URL != ''
  steps:
    - uses: actions/checkout@v4
    - uses: pnpm/action-setup@v4
      with: { version: 11.18.0 }
    - uses: actions/setup-node@v4
      with: { node-version: 22, cache: pnpm }
    - run: pnpm install --frozen-lockfile
    - run: pnpm build
    - run: pnpm exec playwright install --with-deps chromium
    - run: pnpm test:e2e
```

Con secretos `E2E_*` (staging) definidos en el repositorio. Mientras no se implemente,
el `ci.yml` actual corre `quality` y `build` sin e2e.

## Checklist de implementación (cuando se ejecute la fase 2b)

- [ ] `pnpm add -D @playwright/test`
- [ ] `pnpm exec playwright install chromium`
- [ ] Crear `playwright.config.ts` (webServer con `pnpm build` + `pnpm start`).
- [ ] Crear `.env.staging`.
- [ ] Crear specs: `e2e/login.spec.ts`, `e2e/crear-usuario.spec.ts`,
      `e2e/completar-registro.spec.ts`.
- [ ] Añadir script `test:e2e`.
- [ ] (Opcional) Job `e2e` en CI + secretos `E2E_*`.