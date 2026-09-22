import { asc } from 'drizzle-orm';
import { db } from './index';
import { cierresDiarios } from './schema';

export async function getTodosCierres() {
  return db
    .select()
    .from(cierresDiarios)
    .orderBy(asc(cierresDiarios.fecha));
}

export interface NuevoCierre {
  fecha: string;
  efectivoContado: number;
  cuentaContado: number;
  observaciones: string;
}

/** Upsert atómico por fecha: re-arquear actualiza sin duplicar. */
export async function saveCierre(c: NuevoCierre) {
  await db
    .insert(cierresDiarios)
    .values({
      fecha: c.fecha,
      efectivoContado: c.efectivoContado,
      cuentaContado: c.cuentaContado,
      observaciones: c.observaciones === '' ? null : c.observaciones,
    })
    .onConflictDoUpdate({
      target: cierresDiarios.fecha,
      set: {
        efectivoContado: c.efectivoContado,
        cuentaContado: c.cuentaContado,
        observaciones: c.observaciones === '' ? null : c.observaciones,
      },
    });
}
