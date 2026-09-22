import { escapeCsv } from './format';

const SEP = ';';
const NL = '\r\n';

/** Montos con punto decimal para que Excel los parsee como número. NULL → 0.00. */
function num(v: number | null | undefined): string {
  const n = typeof v === 'number' && Number.isFinite(v) ? v : 0;
  return n.toFixed(2);
}

export interface SaldoCsv {
  billetes: number | null;
  monedas: number | null;
  total: number | null;
  cuenta: number | null;
  notas: string | null;
  fecha: string;
}

export interface MovCsv {
  fecha: string;
  tipo: string;
  medio: string;
  categoria: string;
  concepto: string;
  monto: number | null;
}

export interface CierreCsv {
  fecha: string;
  efectivo: number | null;
  cuenta: number | null;
  observaciones: string | null;
}

export interface ResumenCsv {
  fecha: string;
  netoEf: number;
  netoCta: number;
  calcEf: number;
  calcCta: number;
  /** null si el día no tiene cierre. */
  difEf: number | null;
  difCta: number | null;
}

function fila(...celdas: (string | number)[]): string {
  return celdas.map((c) => escapeCsv(c)).join(SEP);
}

/**
 * Builder puro del CSV de rendición (sin BOM ni I/O; el endpoint antepone `\uFEFF`).
 * 4 secciones: SALDO INICIAL / MOVIMIENTOS / CIERRES / RESUMEN.
 */
export function buildRendicionCsv(
  saldo: SaldoCsv | null,
  movs: MovCsv[],
  cierres: CierreCsv[],
  resumen: ResumenCsv[],
  totalFinal: number,
): string {
  const L: string[] = [];

  L.push('SALDO INICIAL');
  L.push(fila('billetes', 'monedas', 'efectivo_total', 'cuenta', 'notas', 'fecha_entrega'));
  L.push(
    saldo
      ? fila(num(saldo.billetes), num(saldo.monedas), num(saldo.total), num(saldo.cuenta), saldo.notas ?? '', saldo.fecha)
      : fila('0.00', '0.00', '0.00', '0.00', '', ''),
  );
  L.push('');
  L.push('MOVIMIENTOS');
  L.push(fila('fecha', 'tipo', 'medio', 'categoria', 'concepto', 'monto'));
  for (const m of movs) {
    L.push(fila(m.fecha, m.tipo, m.medio, m.categoria, m.concepto, num(m.monto)));
  }
  L.push('');
  L.push('CIERRES');
  L.push(fila('fecha', 'efectivo_contado', 'cuenta_contado', 'observaciones'));
  for (const c of cierres) {
    L.push(fila(c.fecha, num(c.efectivo), num(c.cuenta), c.observaciones ?? ''));
  }
  L.push('');
  L.push('RESUMEN');
  L.push(fila('fecha', 'neto_efectivo', 'neto_cuenta', 'calc_efectivo', 'calc_cuenta', 'dif_efectivo', 'dif_cuenta'));
  for (const r of resumen) {
    L.push(
      fila(
        r.fecha,
        num(r.netoEf),
        num(r.netoCta),
        num(r.calcEf),
        num(r.calcCta),
        r.difEf === null ? '' : num(r.difEf),
        r.difCta === null ? '' : num(r.difCta),
      ),
    );
  }
  L.push(fila('TOTAL_FINAL', '', '', '', '', '', num(totalFinal)));

  return L.join(NL) + NL;
}
