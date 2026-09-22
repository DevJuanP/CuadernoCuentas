import { getUltimoSaldo } from '../../db/saldos';
import { getTodosMovimientos } from '../../db/movimientos';
import { getTodosCierres } from '../../db/cierres';
import { calcularTablero } from '../../lib/calculos';
import { buildRendicionCsv } from '../../lib/rendicionCsv';

const NOMBRE = 'rendicion-2026-09-22-24.csv';

export async function GET() {
  const saldo = await getUltimoSaldo();
  const movs = await getTodosMovimientos();
  const cierres = await getTodosCierres();

  const tablero = calcularTablero(
    saldo ? { efectivo: saldo.efectivoTotal, cuenta: saldo.cuenta } : null,
    movs.map((m) => ({ fecha: m.fecha, tipo: m.tipo, medio: m.medio, monto: m.monto })),
    cierres.map((c) => ({ fecha: c.fecha, efectivoContado: c.efectivoContado, cuentaContado: c.cuentaContado })),
  );

  const cuerpo = buildRendicionCsv(
    saldo
      ? {
          billetes: saldo.efectivoBilletes,
          monedas: saldo.efectivoMonedas,
          total: saldo.efectivoTotal,
          cuenta: saldo.cuenta,
          notas: saldo.notas,
          fecha: saldo.fechaEntrega ?? '2026-09-21',
        }
      : null,
    movs.map((m) => ({
      fecha: m.fecha,
      tipo: m.tipo,
      medio: m.medio,
      categoria: m.categoria,
      concepto: m.concepto,
      monto: m.monto,
    })),
    cierres.map((c) => ({
      fecha: c.fecha,
      efectivo: c.efectivoContado,
      cuenta: c.cuentaContado,
      observaciones: c.observaciones,
    })),
    tablero.dias.map((d) => ({
      fecha: d.fecha,
      netoEf: d.neto.efectivo,
      netoCta: d.neto.cuenta,
      calcEf: d.calculado.efectivo,
      calcCta: d.calculado.cuenta,
      difEf: d.diferencia?.efectivo ?? null,
      difCta: d.diferencia?.cuenta ?? null,
    })),
    tablero.totalFinal,
  );

  return new Response('\uFEFF' + cuerpo, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${NOMBRE}"`,
    },
  });
}
