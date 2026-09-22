# Proposal

## Why

Las fases F3–F7 (saldo inicial, movimientos, tablero, cierre, exports) leen y escriben las mismas 3 tablas; sin un esquema versionado y una única capa de acceso, cada fase inventaría su propio SQL y un error de tipos o de CHECK rompería toda la Demo 1. Esta fase crea el contrato de datos fundacional antes de cualquier página con persistencia.

## What Changes

- Nuevo esquema Drizzle tipado en `src/db/schema.ts`: `saldosIniciales`, `movimientos`, `cierresDiarios` (tablas, columnas y enums del §A.4 del plan).
- Nueva conexión singleton en `src/db/index.ts` vía `better-sqlite3` (sync) con ruta `DB_PATH ?? './cuaderno.db'`.
- Nueva configuración `drizzle.config.ts` (dialecto `sqlite`, salida `./drizzle`) + scripts `db:generate` / `db:migrate` (ya declarados en `package.json`).
- Primera migración generada y aplicada: `cuaderno.db` local con las 3 tablas + índice `idx_mov_fecha`.
- `.gitignore` ya cubre `cuaderno.db*` (verificado, sin cambios).
- Sin páginas ni endpoints nuevos; sin cambios de UI.

## Capabilities

### New Capabilities

- `cuaderno-db`: persistencia SQLite del cuaderno — esquema de las 3 tablas, restricciones CHECK/UNIQUE/índice, conexión singleton y migraciones versionadas con Drizzle.

### Modified Capabilities

(none — primer capability del proyecto)

## Impact

- Afecta: `src/db/*` (nuevo), `drizzle.config.ts` (nuevo), `./drizzle/` (migraciones generadas), `cuaderno.db` (archivo local, no commiteado).
- Dependencias ya instaladas: `drizzle-orm@0.45`, `drizzle-kit@0.31`, `better-sqlite3@13` (versiones reales instaladas en F1; el plan citaba `^0.36/^0.28/^11`).
- Desbloquea F3 (saldo), F4 (movimientos), F5/F6 (cálculos y cierre) y F7 (exports): todas consumen este contrato.
- Riesgo conocido: `better-sqlite3` en Windows depende de prebuilds; contingencia del plan (`node:sqlite`/SQL directo) si `npm run db:migrate` falla.
