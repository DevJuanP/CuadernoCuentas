# Design

## Context

F1 dejó el andamiaje Astro 7 SSR (`output: 'server'`, adapter node standalone) con `src/lib/const.ts` ya definiendo los enums de dominio (`DIAS`, `CATEGORIAS`, `TIPOS`, `MEDIOS`) y scripts `db:generate` / `db:migrate` declarados pero sin configuración que los respalde. Versiones reales instaladas: `drizzle-orm@0.45`, `drizzle-kit@0.31`, `better-sqlite3@13`, TypeScript strict. Ver propuesta (motivación) en `proposal.md` y requisitos en `specs/cuaderno-db/spec.md`.

## Goals / Non-Goals

**Goals:**

- Esquema Drizzle tipado que refleje 1:1 el SQL del §A.4 del plan (3 tablas, CHECKs, UNIQUE, índice).
- Una sola conexión sync reutilizable (`src/db/index.ts`) con ruta overridable por `DB_PATH`.
- Migración inicial generada por `drizzle-kit` y aplicable con `npm run db:migrate`.
- Enums de validación importados desde `src/lib/const.ts` (cero duplicación, `solid-ocp`/`core-dry`).

**Non-Goals:**

- Ninguna página, endpoint, query helper de dominio (`getMovimientos`, `saveCierre`) ni seed: pertenecen a F3–F8.
- Ningún cambio de UI o estilos.

## Decisions

1. **Drizzle ORM + `better-sqlite3` (sync), sin capa async.**
   Rationale: el plan lo exige; Astro SSR en Node standalone corre sync sin problema y simplifica páginas server-side.
   Alternativa descartada: `node:sqlite` nativo — contingencia solo si falla el prebuild en Windows.

2. **Montos como `REAL` + validación `> 0` en app, no `CHECK` numérico fino en Drizzle.**
   Rationale: SQLite/Drizzle no expresa `NUMERIC(12,2)`; la precisión se garantiza validando en app (rango `0 < monto ≤ 1_000_000`) y redondeando solo al mostrar (`to2`/`formatPEN` existen en `src/lib/format.ts`).
   Alternativa descartada: `INTEGER` de céntimos — el plan asume `S/` con decimales salvo decisión contraria pendiente.

3. **`efectivo_total` como columna generada en SQL cuando el dialecto la soporte; si Drizzle/kits la rechazan, calcularla en app.**
   Rationale: el §A.4 la define `GENERATED ALWAYS AS (billetes + monedas)`; si la herramienta no la emite, el cálculo vive en `calculos.ts` (F5, única fuente de verdad) y el contrato observable no cambia.

4. **Enums CHECK en SQL generados desde `const.ts`, no literales duplicados.**
   Rationale: agregar una categoría no debe tocar validaciones en N archivos (`solid-ocp`).

5. **`drizzle.config.ts` con `dialect: 'sqlite'`, `schema: './src/db/schema.ts'`, `out: './drizzle'`; `db:generate` sin credenciales.**
   Rationale: `drizzle-kit@0.31` genera migraciones SQLite solo desde el schema, sin conexión viva.

## Risks / Trade-offs

- [Risk] `better-sqlite3@13` sin prebuild para Node 24 x64 en Windows → Mitigación: `npm rebuild better-sqlite3` con Build Tools + Python; si persiste, contingencia del plan (`node:sqlite`) como change separado.
- [Risk] `drizzle-kit@0.31` (más nuevo que el `^0.28` del plan) cambia flags/salida → Mitigación: fijar en tasks la verificación del contenido de `./drizzle/` (3 `CREATE TABLE` + índice) antes de migrar.
- [Trade-off] Columna generada vs cálculo en app: se acepta leve divergencia SQL/app a cambio de no bloquear la migración; el invariante `total = billetes + monedas` queda cubierto por spec.

## Migration Plan

1. Crear `src/db/schema.ts`, `src/db/index.ts`, `drizzle.config.ts`.
2. `npm run db:generate` → revisar `./drizzle/*.sql`.
3. `npm run db:migrate` sobre `cuaderno.db` local (gitignored).
4. Verificar 3 tablas + índice (DB Browser o `sqlite3 .schema`).
5. Rollback: borrar `cuaderno.db` y `./drizzle/`, regenerar (no hay datos reales aún).

## Open Questions

(none — las decisiones abiertas de moneda entera vs decimal y de driver alternativo están registradas como pendientes/riesgos, no bloquean este diseño)
