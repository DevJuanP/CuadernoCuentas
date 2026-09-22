CREATE TABLE `cierres_diarios` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`fecha` text NOT NULL,
	`efectivo_contado` real DEFAULT 0 NOT NULL,
	`cuenta_contado` real DEFAULT 0 NOT NULL,
	`observaciones` text,
	`created_at` text DEFAULT (datetime('now','localtime')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `cierres_diarios_fecha_unique` ON `cierres_diarios` (`fecha`);--> statement-breakpoint
CREATE TABLE `movimientos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`fecha` text NOT NULL,
	`tipo` text NOT NULL,
	`medio` text NOT NULL,
	`categoria` text NOT NULL,
	`concepto` text NOT NULL,
	`monto` real NOT NULL,
	`created_at` text DEFAULT (datetime('now','localtime')) NOT NULL,
	CONSTRAINT "monto_positivo" CHECK("movimientos"."monto" > 0)
);
--> statement-breakpoint
CREATE INDEX `idx_mov_fecha` ON `movimientos` (`fecha`);--> statement-breakpoint
CREATE TABLE `saldos_iniciales` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`fecha_entrega` text DEFAULT '2026-09-21' NOT NULL,
	`efectivo_billetes` real DEFAULT 0 NOT NULL,
	`efectivo_monedas` real DEFAULT 0 NOT NULL,
	`efectivo_total` real GENERATED ALWAYS AS ("efectivo_billetes" + "efectivo_monedas") VIRTUAL,
	`cuenta` real DEFAULT 0 NOT NULL,
	`notas` text,
	`created_at` text DEFAULT (datetime('now','localtime')) NOT NULL
);
