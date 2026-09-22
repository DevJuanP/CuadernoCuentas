# Proposal

## Why

El arqueo diario aún no existe como pantalla: hoy un cierre solo puede insertarse a mano en la DB, así que no hay forma de contrastar el contado físico contra el calculado ni de exigir la observación cuando hay diferencia. Esta fase cierra el ciclo operativo mar→jue y alimenta el bloqueo de día cerrado que F4 ya respeta.

## What Changes

- Nuevo `src/db/cierres.ts::saveCierre` (upsert por fecha) más `validarCierre` pura en `src/lib/cierre.ts`: fecha ∈ DIAS, contados finitos `≥ 0` y `≤ 1_000_000`, observación obligatoria si la diferencia ≠ 0 (diferencia calculada con `calculos.ts`, única fuente de verdad).
- Nuevo `src/components/FormCierre.astro`: selector de fecha, calculado en lectura, contado, diferencia viva en JS (0 en tinta con `.badge-suave` "cuadrado"; ≠0 en rojo con `.destructivo`), submit `.btn-primario`.
- `src/pages/cierre.astro` con GET (prefill del cierre existente o vacío + calculado del día) y POST (upsert + redirect `303` a `/cierre?fecha=...`).
- constraints transversales (ver `design.md` del change): `docs/design.md` como única referencia visual (sin verde: la paleta no lo tiene) y skill `clean-code-principles` sin sobrediseñar (YAGNI Demo 1).
- Sin cambios de esquema ni migraciones; sin tocar `/registrar`, `/saldo-inicial` ni `/`.

## Capabilities

### New Capabilities

- `cierre`: arqueo diario interactivo — formulario con diferencia viva, validación con observación obligatoria ante descuadre y upsert por fecha.

### Modified Capabilities

(none — `cuaderno-db` ya exige cierre único por fecha y `calculos` ya define la diferencia; este change los consume sin cambiar sus requisitos)

## Impact

- Afecta: `src/db/cierres.ts` (nuevo `saveCierre`), `src/lib/cierre.ts` (nuevo), `src/components/FormCierre.astro` (nuevo), `src/pages/cierre.astro` (arqueo real), `tests/cierre.test.ts` (nuevo, Vitest).
- No afecta: esquema Drizzle, migraciones, resto de páginas, `calculos.ts`.
- Habilita: el bloqueo de día cerrado de F4 pasa a ser operable desde UI; F7 lee cierres para la sección CIERRES del CSV.
- Riesgo conocido: doble submit crea duplicado si el upsert no es atómico; se mitiga con UNIQUE en `fecha` + `onConflictDoUpdate` (ver `design.md`).
