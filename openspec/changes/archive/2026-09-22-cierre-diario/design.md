# Design

## Context

`/cierre` es placeholder. Existen `src/db/cierres.ts` (`getTodosCierres`), `src/db/movimientos.ts` (`diaCerrado`, ya bloquea F4), `src/lib/calculos.ts` (`calcularTablero`, única fuente de verdad), enums en `src/lib/const.ts` y clases visuales en `global.css` (`.field`, `.badge*`, `.destructivo`, `.stat-valor`). Ver motivación en `proposal.md` y requisitos en `specs/cierre/spec.md`. Constraints del usuario: `docs/design.md` y skill `clean-code-principles` sin sobrediseñar.

## Goals / Non-Goals

**Goals:**

- Arqueo funcional por día con diferencia viva, validación server-side y upsert atómico.
- Diferencia calculada siempre con `calculos.ts` (cero aritmética en página/componente).
- Reutilizar el bloqueo `diaCerrado` existente sin duplicarlo.

**Non-Goals:**

- Editar/borrar cierres desde otra pantalla; historial de arqueos (YAGNI).
- Cambios en `/registrar` (ya respeta el bloqueo) o en el tablero (ya muestra diferencias).

## Decisions

1. **`saveCierre` con `onConflictDoUpdate` sobre `fecha`.**
   Rationale: un solo statement atómico; el UNIQUE existente lo respalda y el doble submit no duplica (`solid-srp`: persistencia en repository, páginas sin SQL).
   Alternativa descartada: select-then-insert/update — ventana de carrera entre ambos.

2. **`validarCierre(fd, calculado)` pura en `src/lib/cierre.ts`, espejo de `validarMovimiento`/`validarSaldo`.**
   Rationale: testeable sin DB (`func-no-side-effects`); la página solo orquesta. Recibe el calculado ya computado para exigir observación solo si `contado − calculado ≠ 0` en algún medio (`core-dry`: la resta vive en `calculos.ts`, aquí solo se compara contra 0).
   Alternativa descartada: zod — el proyecto valida con checks propios en F3/F4; coherencia (KISS).

3. **GET computa el calculado del día con `calcularTablero` y lo pasa como prop de lectura; el JS vivo solo resta contado − calculado.**
   Rationale: el número mostrado y el validado en servidor provienen del mismo origen; el JS es presentacional, no fuente de verdad.
   Presentación (de `design.md`): selector fecha con links `?fecha=` (`.btn-primario` activo / `.btn-fantasma` resto, como `/registrar`); calculado en `.stat-valor` de lectura; diferencia viva en tinta con `.badge-suave` "cuadrado" si 0, en `.destructivo` si ≠0 (sin verde: fuera de paleta); submit `.btn-primario`.

4. **POST inválido re-renderiza con valores ingresados + error `.destructivo`; POST válido hace upsert + redirect 303.**
   Rationale: mismo patrón probado de F3/F4 (coherencia UX, PRG).

## Risks / Trade-offs

- [Risk] Contado con más de 2 decimales acumula error de representación → Mitigación: no redondear al guardar (spec: redondeo solo al mostrar); comparar diferencia contra 0 con tolerancia exacta del motor (los valores son sumas de inputs de 2 decimales).
- [Risk] `cierre.astro` mezcla orquestación y markup → Mitigación: tope ~30 líneas de lógica; si crece, extraer a helper (KISS).
- [Trade-off] Sin confirm antes de re-arquear: aceptado (el upsert es reversible re-guardando; YAGNI).

## Migration Plan

No migraciones. Despliegue: implementar, `npm test`, `npm run build`, verificación viva (0 en tinta / +10 en rojo + observación obligatoria). Rollback: revert del commit.

## Open Questions

(none)
