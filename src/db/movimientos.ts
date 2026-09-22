import { asc, eq } from 'drizzle-orm';
import { db } from './index';
import { cierresDiarios, movimientos } from './schema';
import type { MovimientoValido } from '../lib/movimiento';

export async function getMovimientosPorFecha(fecha: string) {
  return db
    .select()
    .from(movimientos)
    .where(eq(movimientos.fecha, fecha))
    .orderBy(asc(movimientos.id));
}

export async function getTodosMovimientos() {
  return db
    .select()
    .from(movimientos)
    .orderBy(asc(movimientos.fecha), asc(movimientos.id));
}

export async function getMovimientoPorId(id: number) {
  const rows = await db
    .select()
    .from(movimientos)
    .where(eq(movimientos.id, id))
    .limit(1);
  return rows[0] ?? null;
}

export async function crearMovimiento(m: MovimientoValido) {
  await db.insert(movimientos).values(m);
}

export async function eliminarMovimiento(id: number): Promise<boolean> {
  const res = await db.delete(movimientos).where(eq(movimientos.id, id));
  return res.changes > 0;
}

/** true si el día ya tiene cierre registrado (bloquea crear/borrar, anticipa F6). */
export async function diaCerrado(fecha: string): Promise<boolean> {
  const rows = await db
    .select({ id: cierresDiarios.id })
    .from(cierresDiarios)
    .where(eq(cierresDiarios.fecha, fecha))
    .limit(1);
  return rows.length > 0;
}
