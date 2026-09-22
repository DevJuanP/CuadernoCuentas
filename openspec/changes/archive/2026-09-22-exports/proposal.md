# Proposal

## Why

La rendición hoy solo existe en pantalla: el enlace "Descargar CSV" apunta a un endpoint inexistente y el impreso no tiene las firmas de entrega, así que el amigo no puede recibir el archivo Excel ni la hoja firmada. Esta fase materializa ambas exportaciones con el formato exacto que Excel es-PE espera.

## What Changes

- Nuevo `src/pages/api/export.csv.ts` (GET): CSV UTF-8 con BOM, separador `;`, saltos `\r\n`, 4 secciones (SALDO INICIAL / MOVIMIENTOS / CIERRES / RESUMEN) con números de `calculos.ts` y escape con `escapeCsv` existente; `Content-Disposition: attachment; filename="rendicion-2026-09-22-24.csv"`.
- Bloque de firmas en `#rendicion` de `/` ("Recibido por ___ / Entregado por ___"), visible en impreso B/N 11pt y oculto o discreto en pantalla; botones de exportar con `.no-print` (el print ya oculta nav vía CSS).
- constraints transversales (ver `design.md` del change): `docs/design.md` como única referencia visual (B/N en impreso, sin colores) y skill `clean-code-principles` sin sobrediseñar (cero librerías: sin `exceljs`/`pdfkit`, YAGNI Demo 1).
- Sin cambios de esquema ni migraciones; sin tocar validaciones ni cálculos.

## Capabilities

### New Capabilities

- `export-csv-pdf`: exportación de la rendición — descarga CSV compatible con Excel es-PE e impreso limpio con firmas vía print CSS.

### Modified Capabilities

(none — `calculos`, `cierre` y `cuaderno-db` se consumen tal cual; ningún requisito suyo cambia)

## Impact

- Afecta: `src/pages/api/export.csv.ts` (nuevo), `src/pages/index.astro` (bloque firmas + ajustes print), `tests/export.test.ts` (nuevo, Vitest sobre el builder CSV puro).
- No afecta: esquema, validaciones, cálculos, resto de páginas.
- Completa el flujo Demo 1 (F7); F8 solo pule y respalda.
- Riesgo conocido: Excel es-PE exige BOM + `;` + `\r\n`; cualquier desvío rompe la apertura directa. Se mitiga con test del byte inicial y del separador (ver `design.md`).
