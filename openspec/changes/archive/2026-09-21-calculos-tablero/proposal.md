# Proposal

## Why

El tablero de rendición (`/`) aún es un placeholder: hoy nadie calcula netos por día, acumulados ni diferencias de arqueo, así que la rendición mar→jue no existe como comportamiento verificable. Esta fase crea la única fuente de verdad de esos números antes de F6 (cierre) y F7 (exports), que dependen de ellos.

## What Changes

- Nuevo `src/lib/calculos.ts` con funciones puras: neto por día y medio, efectivo/cuenta calculados con acumulado desde el saldo inicial, diferencias contra cierres, total final del jueves.
- Nuevo `src/components/ResumenDia.astro`: stat card por día operativo según el ejemplo 1 de `docs/design.md`.
- `src/pages/index.astro` server-side: saldo inicial + 3 `ResumenDia` + tabla de movimientos + cierres/diferencias + saldo final + enlaces a exportar (el endpoint CSV llega en F7; aquí solo el enlace).
- Casos borde visibles: sin saldo inicial (banner), sin movimientos (ceros), sin cierres ("pendiente").
- constraints transversales (ver `design.md` del change): `docs/design.md` como única referencia visual (monocromo, radios 18/24, rojo solo destructivo/error) y skill `clean-code-principles` sin sobrediseñar (YAGNI Demo 1).
- Sin cambios de esquema ni migraciones; sin endpoints nuevos.

## Capabilities

### New Capabilities

- `calculos`: motor de rendición — netos por día/medio, acumulados desde el saldo inicial, diferencias de arqueo y total final, más su presentación en el tablero con casos borde.

### Modified Capabilities

(none — `cuaderno-db` se consume tal cual; ningún requisito suyo cambia)

## Impact

- Afecta: `src/lib/calculos.ts` (nuevo), `src/components/ResumenDia.astro` (nuevo), `src/pages/index.astro` (tablero real), `tests/calculos.test.ts` (nuevo, Vitest).
- No afecta: esquema Drizzle, migraciones, `/registrar`, `/saldo-inicial`, `/cierre`.
- Desbloquea F6 (diferencias para el arqueo) y F7 (secciones RESUMEN del CSV + `#rendicion` imprimible).
- Riesgo conocido: fórmulas mal acumuladas romperían F6/F7; se mitiga con tests de la matriz del §A.4 antes de tocar el tablero.
