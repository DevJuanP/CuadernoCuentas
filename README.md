# Cuaderno de Cuentas — Restaurante (Demo 1)

App local para la rendición de 3 días (mar 22 → jue 24/09/2026): saldo inicial del lunes, movimientos por día, arqueo diario, tablero y exports CSV + PDF. Un comando, un archivo de datos, sin internet.

## Requisitos

- Node.js ≥ 20 y npm ≥ 10 (`node --version`, `npm --version`).
- Chrome/Edge (probar + Guardar PDF) y Excel/LibreOffice (abrir el CSV).

## Puesta en marcha

```powershell
npm install
npm run db:generate
npm run db:migrate
npm run dev
```

Abre http://127.0.0.1:4321 — 4 rutas: `/` tablero, `/saldo-inicial`, `/registrar`, `/cierre`.

Otros comandos: `npm run build` + `npm run preview` (verificación), `npm test` (Vitest), `npm run seed:demo` (datos ficticios, ver abajo).

## Datos y respaldo

Todo vive en `./cuaderno.db` (SQLite, gitignored). Respaldar = copiar el archivo:

```powershell
Copy-Item .\cuaderno.db .\respaldo\cuaderno-2026-09-21.db
```

Restaurar = copiar de vuelta con la app detenida. **Nunca commitees `cuaderno.db`**.

Datos de prueba sin ensuciar tu base:

```powershell
cp cuaderno.db cuaderno-demo.db
DB_PATH=./cuaderno-demo.db node scripts/seed-demo.mjs   # siembra DEMO:
DB_PATH=./cuaderno-demo.db node scripts/seed-demo.mjs --clear-demo  # borra solo DEMO:
```

El seed se niega a sembrar si la base tiene filas reales (salvo `--force`).

## Qué NO hacer

- No borrar `drizzle/` (migraciones versionadas; sin ellas la base no se reproduce).
- No usar `seed-demo` contra tu `cuaderno.db` real sin copia previa.
- No introducir colores, radios ni sombras fuera de `docs/design.md`.
- No sumar montos en `.astro` ni usar `better-sqlite3` fuera de `src/db/` (ver Diseño).
- Alcance Demo 2 (fuera): auth, nube, Postgres, `.xlsx` nativo, PWA móvil.

## Diseño y arquitectura

- Referencia visual obligatoria: `docs/design.md` (shadcn monocromático: canvas `#f5f5f5`, card `#ffffff`, tinta `#0a0a0a`, rojo `#e7000b` solo destructivo; radios 18px interactivo / 24px contenedor).
- Capas: páginas `.astro` (orquestan) → `src/db/*` repository (único SQL) → `better-sqlite3`; `src/lib/calculos.ts` (única fuente de verdad, funciones puras); `src/lib/*` validaciones puras + `tests/` Vitest.
- Plan por fases y decisiones: `docs/IMPLEMENTATION_PLAN.md`. Specs: `openspec/specs/`.

## Estado de fases

F0 entorno ✅ · F1 andamiaje ✅ · F2 DB ✅ · F3 saldo ✅ · F4 movimientos ✅ · F5 tablero ✅ · F6 cierre ✅ · F7 exports ✅ · F8 pulido ✅ (este README + seed + respaldo).
