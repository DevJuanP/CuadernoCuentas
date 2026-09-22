# export-csv-pdf Specification

## Purpose

Entrega la rendición fuera de la pantalla: un CSV que Excel es-PE abre directo y un impreso B/N con firmas, ambos con los mismos números del tablero.

## Requirements

### Requirement: Descarga CSV compatible con Excel

The system SHALL serve on `GET /api/export.csv` a UTF-8 CSV starting with BOM (`\uFEFF`), using `;` as separator and `\r\n` line breaks, with 4 sections (SALDO INICIAL / MOVIMIENTOS / CIERRES / RESUMEN) whose numbers match the board, escaping fields by doubling `"` and quoting when they contain `;`, `"` or line breaks.

#### Scenario: Descarga con 4 secciones

- **WHEN** se pide `GET /api/export.csv` con saldo, movimientos y cierres registrados
- **THEN** la respuesta es `200` con `Content-Type: text/csv`, `Content-Disposition: attachment` con nombre `rendicion-2026-09-22-24.csv`, BOM inicial y las 4 secciones con los valores del tablero

#### Scenario: Apertura directa en Excel es-PE

- **WHEN** el CSV se abre en Excel con configuración regional es-PE
- **THEN** columnas y montos se separan correctamente sin importación manual

#### Scenario: Escape de concepto con separador

- **WHEN** un concepto contiene `;` o `"`
- **THEN** el campo sale entrecomillado con `"` duplicadas y el resto del archivo intacto

### Requirement: Impreso B/N con firmas

The system SHALL render the print version of `/` in black and white at 11pt showing `#rendicion` (saldo, días, diferencias, total final) plus signature lines "Recibido por ___ / Entregado por ___", hiding navigation, forms and buttons, fitting within 2 pages.

#### Scenario: Vista previa de impresión

- **WHEN** se abre la vista previa de impresión del tablero completo
- **THEN** se ven saldo, 3 tarjetas día, diferencias, total y firmas en B/N sin nav ni botones y en máximo 2 páginas

#### Scenario: Firmas presentes

- **WHEN** se revisa el impreso
- **THEN** aparecen las líneas "Recibido por ___" y "Entregado por ___"
