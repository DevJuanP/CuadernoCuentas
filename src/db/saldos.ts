import { desc } from 'drizzle-orm';
import { db } from './index';
import { saldosIniciales } from './schema';

export interface NuevoSaldo {
  billetes: number;
  monedas: number;
  cuenta: number;
  notas: string;
}

export async function getUltimoSaldo() {
  const rows = await db
    .select()
    .from(saldosIniciales)
    .orderBy(desc(saldosIniciales.id))
    .limit(1);
  return rows[0] ?? null;
}

export async function guardarSaldo(s: NuevoSaldo) {
  await db.insert(saldosIniciales).values({
    efectivoBilletes: s.billetes,
    efectivoMonedas: s.monedas,
    cuenta: s.cuenta,
    notas: s.notas === '' ? null : s.notas,
  });
}
