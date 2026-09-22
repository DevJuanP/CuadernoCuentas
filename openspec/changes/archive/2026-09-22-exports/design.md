# Design

## Context

`/` ya tiene `#rendicion`, botón print y enlace a `/api/export.csv` (endpoint inexistente). Existen `src/lib/calculos.ts` (números), `src/lib/format.ts` (`formatPEN`, `formatFecha`, `escapeCsv`), `src/db/*` (lecturas) y `@media print` base en `global.css`. Ver motivación en `proposal.md` y requisitos en `specs/export-csv-pdf/spec.md`. Constraints del usuario: `docs/design.md` y skill `clean-code-principles` sin sobrediseñar.

## Goals / Non-Goals

**Goals:**

- CSV byte-exacto (BOM, `;`, `\r\n`, 4 secciones) generado por builder puro testeable.
- Impreso B/N 11pt ≤2 páginas con firmas, sin CSS nuevo fuera de tokens.
- Cero dependencias nuevas.

**Non-Goals:**

- `.xlsx` nativo, PDF generado en servidor, filtros `?desde&hasta` funcionales (Demo 2; el endpoint ignora query salvo registrarlos como no soportados).
- Cambios en cálculos, validaciones o esquema.

## Decisions

1. **`src/lib/rendicionCsv.ts` builder puro `(saldo, movs, cierres, tablero) → string` (sin BOM; el endpoint lo antepone).**
   Rationale: testeable sin HTTP ni DB (`func-no-side-effects`); el endpoint solo orquesta lecturas + headers (`solid-srp`). Reutiliza `escapeCsv` existente (`core-dry`).
   Alternativa descartada: construir el CSV inline en el endpoint — no testeable con Vitest.

2. **Montos en CSV con 2 decimales punto (`toFixed(2)`), no `formatPEN`.**
   Rationale: Excel es-PE parsea `1234.50` como número; `S/ 1,234.50` entraría como texto. Presentación con símbolo solo en pantalla/impreso.

3. **Firmas como bloque HTML en `#rendicion` con clase `.firmas` (visible en impreso; en pantalla `.muted`).**
   Rationale: el impreso hereda el B/N del print CSS existente; sin reglas de color nuevas. Botones ya tienen `.no-print`; solo falta ocultar el enlace "Editar saldo inicial" (ya lo tiene) y verificar que la tabla no rompa página (CSS `print` existente + revisión manual ≤2 págs).

4. **Endpoint responde `200` con `Content-Type: text/csv; charset=utf-8` y `Content-Disposition: attachment; filename="rendicion-2026-09-22-24.csv"`; ante DB vacía devuelve secciones con ceros/banner equivalente (mismo contrato que el tablero).**
   Rationale: coherencia con el tablero en vacío (spec `calculos`); nunca 500 por falta de datos.

## Risks / Trade-offs

- [Risk] Excel con otro locale interpreta `;`/`.` distinto → Mitigación: fuera de alcance Demo 1 (pendiente del plan: CSV `;` OK para es-PE); el formato queda documentado en el README (F8).
- [Risk] Impreso supera 2 páginas con muchos movimientos → Mitigación: verificación manual en Chrome en la tarea viva; si excede, compactar tabla solo en print (sin tocar pantalla).
- [Trade-off] Query `?desde&hasta` del plan original no se implementa: el endpoint exporta el rango fijo mar→jue (YAGNI; el plan lo listaba como entrada opcional).

## Migration Plan

No migraciones. Despliegue: implementar, `npm test`, `npm run build`, verificación viva (descarga + apertura en Excel + preview ≤2 págs). Rollback: revert del commit.

## Open Questions

(none)
