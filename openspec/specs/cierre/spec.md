# cierre Specification

## Purpose

Registra el arqueo diario contrastando el contado físico contra el calculado, exige la observación ante cualquier descuadre y persiste un solo cierre por fecha, cerrando el ciclo operativo de cada día.

## Requirements

### Requirement: Formulario de arqueo con calculado en lectura

The system SHALL render on `/cierre` a per-day form showing the calculated cash and account as read-only values, the counted inputs prefilled with the existing close when one is recorded, and the date selectable only among the operating days.

#### Scenario: Día sin cierre previo

- **WHEN** se abre `/cierre?fecha=2026-09-23` sin cierre registrado y con calculado 850.50/1000.00
- **THEN** el formulario muestra el calculado en lectura y los contados vacíos

#### Scenario: Día con cierre previo

- **WHEN** se abre un día que ya tiene cierre con contado 860.50/1000.00
- **THEN** el formulario prellena esos contados y su observación

### Requirement: Diferencia viva sin verde

The system SHALL update the live difference (counted minus calculated, per medium) as the user types, displaying zero in normal ink and any non-zero difference in the destructive red, never in green.

#### Scenario: Contado igual al calculado

- **WHEN** el contado coincide con el calculado
- **THEN** la diferencia viva muestra 0 en tinta normal

#### Scenario: Contado distinto al calculado

- **WHEN** el contado supera en 10 al calculado en efectivo
- **THEN** la diferencia viva muestra +10 en rojo

### Requirement: Validación con observación obligatoria

The system SHALL accept a close only for an operating day with finite counted amounts between 0 and 1,000,000, and SHALL require a non-empty observation whenever either difference is non-zero; otherwise it re-renders the form with the error and the entered values.

#### Scenario: Cierre cuadrado sin observación

- **WHEN** se guarda contado igual al calculado sin observación
- **THEN** el cierre queda persistido y redirige a `/cierre?fecha=...`

#### Scenario: Descuadre sin observación

- **WHEN** se guarda un contado con diferencia +10 y observación vacía
- **THEN** el sistema rechaza con error visible y no persiste

#### Scenario: Contado negativo

- **WHEN** se intenta guardar un contado negativo
- **THEN** el sistema rechaza con error visible y no persiste

### Requirement: Un solo cierre por fecha

The system SHALL persist at most one close per day: saving a date that already has a close updates it instead of duplicating, and the day's movements become blocked for create and delete once the close exists.

#### Scenario: Re-arqueo del día

- **WHEN** se guarda un segundo cierre para una fecha con cierre previo
- **THEN** el cierre existente se actualiza y sigue habiendo uno solo

#### Scenario: Cierre bloquea movimientos

- **WHEN** existe cierre del 2026-09-22
- **THEN** `/registrar?fecha=2026-09-22` no acepta crear ni borrar movimientos de ese día
