# cuaderno-db Specification

## Purpose

Persiste los datos del cuaderno (saldo inicial, movimientos y cierres diarios) en un archivo SQLite local versionado por migraciones, para que las fases F3–F7 lean y escriban contra un único contrato de datos.

## Requirements

### Requirement: Saldo inicial de entrega

The system SHALL store exactly the delivery balance of Monday 2026-09-21 as disaggregated cash (bills, coins), account amount, and free-text notes, where cash total is always bills plus coins.

#### Scenario: Registrar saldo de entrega

- **WHEN** se guarda el saldo inicial con billetes 500, monedas 120.50, cuenta 800 y una nota
- **THEN** el sistema persiste los tres montos y la nota, y el efectivo total observable es 620.50

#### Scenario: Montos nunca negativos

- **WHEN** se intenta guardar un saldo con billetes, monedas o cuenta negativos
- **THEN** el sistema rechaza la escritura

### Requirement: Movimientos de días operativos

The system SHALL store movements restricted to the operating days 2026-09-22, 2026-09-23 and 2026-09-24, each with type (`ingreso`/`gasto`), medium (`efectivo`/`cuenta`), category (`ventas`, `proveedores`, `personal`, `servicios`, `insumos`, `otros`), non-empty concept (max 120 chars) and amount greater than 0 and at most 1,000,000.

#### Scenario: Registrar movimiento válido

- **WHEN** se guarda un ingreso en efectivo de 350 por "Almuerzos" el 2026-09-22
- **THEN** el movimiento queda persistido y es recuperable filtrado por esa fecha

#### Scenario: Rechazar fecha fuera de rango

- **WHEN** se intenta guardar un movimiento con fecha 2026-09-25
- **THEN** el sistema rechaza la escritura

#### Scenario: Rechazar monto inválido

- **WHEN** se intenta guardar un movimiento con monto 0 o negativo
- **THEN** el sistema rechaza la escritura

#### Scenario: Rechazar enum inválido

- **WHEN** se intenta guardar un movimiento con tipo, medio o categoría fuera de los valores permitidos
- **THEN** el sistema rechaza la escritura

### Requirement: Cierre diario único por fecha

The system SHALL store at most one daily close per operating day, with counted cash, counted account and observations, where observations are REQUIRED whenever the counted amounts differ from the calculated ones.

#### Scenario: Guardar cierre del día

- **WHEN** se guarda el cierre del 2026-09-22 con efectivo contado, cuenta contada y observación
- **THEN** el cierre queda persistido y es recuperable por esa fecha

#### Scenario: Un solo cierre por fecha

- **WHEN** se guarda un segundo cierre para una fecha que ya tiene cierre
- **THEN** el sistema actualiza el cierre existente en lugar de crear un duplicado

### Requirement: Base reproducible desde migraciones

The system SHALL recreate the full schema (3 tables, constraints and movement-date index) from versioned migrations on an empty database file, and SHALL keep runtime data in a single file excluded from version control.

#### Scenario: Migrar base vacía

- **WHEN** se aplican las migraciones sobre un archivo de base de datos inexistente o vacío
- **THEN** el resultado contiene las tablas de saldos, movimientos y cierres con sus restricciones y el índice por fecha

#### Scenario: Datos fuera del repo

- **WHEN** se lista el contenido versionado del repositorio
- **THEN** ningún archivo de base de datos con datos (`cuaderno.db*`) está incluido
