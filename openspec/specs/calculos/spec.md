# calculos Specification

## Purpose

Calcula la rendición del cuaderno (netos por día y medio, acumulados desde el saldo inicial, diferencias de arqueo y total final) y la presenta en el tablero con sus casos borde, como única fuente de verdad para el cierre y las exportaciones.

## Requirements

### Requirement: Neto por día y medio

The system SHALL compute, for each operating day (2026-09-22, 2026-09-23, 2026-09-24), the net per medium as income minus expenses, treating days without movements as zero.

#### Scenario: Neto del ejemplo del plan

- **WHEN** el 2026-09-22 tiene ingreso en efectivo 350, gasto en efectivo 120 e ingreso en cuenta 200
- **THEN** el neto en efectivo es +230 y el neto en cuenta es +200

#### Scenario: Día sin movimientos

- **WHEN** un día operativo no tiene movimientos registrados
- **THEN** sus netos en efectivo y en cuenta son 0

### Requirement: Acumulado desde el saldo inicial

The system SHALL compute calculated cash and account per day as the initial balance plus the sum of daily nets up to and including that day, rounding only for display to 2 decimals.

#### Scenario: Arrastre mar→jue

- **WHEN** el saldo inicial es efectivo 620.50 / cuenta 800 y los netos son mar (+230/+200), mié (0/0), jue (−50/+100)
- **THEN** el calculado del jueves es efectivo 800.50 y cuenta 1100.00

#### Scenario: Redondeo solo al mostrar

- **WHEN** un cálculo intermedio produce más de 2 decimales
- **THEN** el valor interno conserva precisión y el tablero muestra 2 decimales

### Requirement: Diferencia de arqueo

The system SHALL compute the difference per day and medium as counted minus calculated, only for days that have a recorded close.

#### Scenario: Cierre cuadrado

- **WHEN** el contado coincide con el calculado del día
- **THEN** la diferencia es 0 en ambos medios

#### Scenario: Cierre con diferencia

- **WHEN** el contado supera en 10 al calculado en efectivo
- **THEN** la diferencia en efectivo es +10 y la observación del cierre es obligatoria

### Requirement: Total final de rendición

The system SHALL present the final balance as calculated cash plus calculated account of Thursday 2026-09-24.

#### Scenario: Total final

- **WHEN** el calculado del jueves es efectivo 800.50 y cuenta 1100.00
- **THEN** el total final mostrado es 1900.50

### Requirement: Tablero con casos borde

The system SHALL render on `/` the initial balance, one summary card per operating day, the movements table, closes/differences, the final balance and export links, handling empty states without breaking: missing initial balance shows a banner, days without movements show zeros, days without close show "pendiente".

#### Scenario: Tablero sin datos

- **WHEN** no hay saldo inicial, movimientos ni cierres
- **THEN** el tablero muestra el banner de saldo pendiente, ceros y "pendiente" sin errores

#### Scenario: Tablero completo

- **WHEN** hay saldo inicial, movimientos los 3 días y cierres registrados
- **THEN** el tablero muestra 3 tarjetas día, tabla, diferencias y total final consistentes con los requisitos anteriores

### Requirement: Presentación según design.md

The system SHALL present the board following `docs/design.md`: monochrome palette, 18px radius on interactive elements, 24px on cards, stat cards per the guide's example 1, and no chromatic color outside the destructive red reserved for error states (a zero difference is NOT an error state).

#### Scenario: Diferencia cero sin color de error

- **WHEN** una diferencia de arqueo es 0
- **THEN** se muestra en tinta normal, nunca en rojo ni verde
