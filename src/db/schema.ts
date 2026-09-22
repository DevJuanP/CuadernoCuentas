import { check, index, integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { CATEGORIAS, FECHA_ENTREGA, MEDIOS, TIPOS } from '../lib/const';

export const saldosIniciales = sqliteTable('saldos_iniciales', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  fechaEntrega: text('fecha_entrega').notNull().default(FECHA_ENTREGA),
  efectivoBilletes: real('efectivo_billetes').notNull().default(0),
  efectivoMonedas: real('efectivo_monedas').notNull().default(0),
  efectivoTotal: real('efectivo_total').generatedAlwaysAs(
    sql`"efectivo_billetes" + "efectivo_monedas"`,
    { mode: 'virtual' },
  ),
  cuenta: real('cuenta').notNull().default(0),
  notas: text('notas'),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(datetime('now','localtime'))`),
});

export const movimientos = sqliteTable(
  'movimientos',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    fecha: text('fecha').notNull(),
    tipo: text('tipo', { enum: [...TIPOS] }).notNull(),
    medio: text('medio', { enum: [...MEDIOS] }).notNull(),
    categoria: text('categoria', { enum: [...CATEGORIAS] }).notNull(),
    concepto: text('concepto').notNull(),
    monto: real('monto').notNull(),
    createdAt: text('created_at')
      .notNull()
      .default(sql`(datetime('now','localtime'))`),
  },
  (t) => [
    index('idx_mov_fecha').on(t.fecha),
    check('monto_positivo', sql`${t.monto} > 0`),
  ],
);

export const cierresDiarios = sqliteTable('cierres_diarios', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  fecha: text('fecha').notNull().unique(),
  efectivoContado: real('efectivo_contado').notNull().default(0),
  cuentaContado: real('cuenta_contado').notNull().default(0),
  observaciones: text('observaciones'),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(datetime('now','localtime'))`),
});
