# Design

## Context

`/` hoy muestra el saldo inicial (F3) más un placeholder de tablero. Existen `src/db/movimientos.ts` (`getMovimientosPorFecha`), `src/db/saldos.ts` (`getUltimoSaldo`), `src/db/cierresDiarios` (vía `diaCerrado`), `src/lib/format.ts` (`formatPEN`, `to2`) y `src/lib/const.ts` (`DIAS`). Ver motivación en `proposal.md` y requisitos en `specs/calculos/spec.md`. Constraints del usuario: `docs/design.md` como referencia visual y skill `clean-code-principles` sin sobrediseñar.

## Goals / Non-Goals

**Goals:**

- `calculos.ts` puro y total (única fuente de verdad), testeado con la matriz del §A.4.
- Tablero server-side que compone saldo + 3 `ResumenDia` + tabla + diferencias + total + enlaces exportar.
- Cero SQL en componentes/páginas; cero aritmética de negocio en `.astro`.

**Non-Goals:**

- Endpoint CSV y botón print funcional (F7; aquí solo enlaces/placeholder con `id="rendicion"`).
- Upsert de cierres y observación obligatoria (F6; aquí solo lectura de diferencias).
- Helpers de formato nuevos (`formatPEN`/`to2` ya existen).

## Decisions

1. **Funciones puras sobre filas planas, no queries agregadas en SQL.**
   Rationale: 3 días × pocos movimientos; sumar en TS es testeable sin DB (`func-no-side-effects`) y evita SQL duplicado (`core-dry`). La página hace 1 select de movimientos + 1 de cierres y delega todo a `calculos.ts` (`solid-srp`).
   Alternativa descartada: `SUM/GROUP BY` en SQLite — más rápido a escala, pero empuja lógica a strings SQL no testeados por Vitest.

2. **Tipos de entrada mínimos (`{ fecha, tipo, medio, monto }`, `{ efectivoContado, cuentaContado }`) en vez de filas Drizzle.**
   Rationale: `calculos.ts` no depende del ORM (`solid-dip` invertido: la capa de cálculo no conoce persistencia) y los tests no necesitan DB.
   Alternativa descartada: aceptar filas `movimientos`/`cierresDiarios` — acoplaría tests a Drizzle.

3. **`NULL → 0` y redondeo solo al mostrar.**
   Rationale: coincide con §A.4; `to2`/`formatPEN` ya existen y se reutilizan.

4. **`ResumenDia.astro` recibe datos ya calculados (props), no consulta.**
   Rationale: componente tonto y reutilizable; la página orquesta (`solid-srp`).
   Presentación (de `design.md`, ejemplo 1): card `#ffffff` radio 24px + hairline + sombra sutil + padding 20px; `.stat-label` / `.stat-valor`; estado del día con `.badge` (`.badge-borde` "pendiente", `.badge-suave` "cuadrado"/cierre); diferencia ≠0 con `.destructivo` (único rojo permitido); diferencia 0 en tinta.

5. **Enlaces exportar como `.btn-primario` (imprimir, `onclick=window.print()`) y `.btn-fantasma` (CSV → `/api/export.csv`, roto hasta F7).**
   Rationale: deja el anclaje visual de F7 sin implementar el endpoint.

## Risks / Trade-offs

- [Risk] Generada `efectivo_total` leída como `null` en algún driver → Mitigación: `?? 0` en la página antes de pasar a cálculos (spec exige NULL→0).
- [Risk] `index.astro` crece mezclando orquestación y markup → Mitigación: si supera ~30 líneas de lógica, extraer composición a `src/lib/tablero.ts` (KISS); el markup queda en el `.astro`.
- [Trade-off] Sin paginación ni memoización: aceptado (3 días, 1 usuario, YAGNI).

## Migration Plan

No migraciones. Despliegue: implementar, `npm test`, `npm run build`, verificar tablero con y sin datos. Rollback: revert del commit (sin estado persistente afectado).

## Open Questions

(none)
