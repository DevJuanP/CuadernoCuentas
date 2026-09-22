import { DIAS, type DiaOperativo } from './const';

/** Fila mínima que el motor necesita (desacoplada del ORM). */
export interface MovimientoBase {
  fecha: string;
  tipo: string;
  medio: string;
  monto: number | null;
}

/** Cierre mínimo que el motor necesita (desacoplado del ORM). */
export interface CierreBase {
  fecha: string;
  efectivoContado: number | null;
  cuentaContado: number | null;
}

export interface Neto {
  efectivo: number;
  cuenta: number;
}

export interface ResumenDia {
  fecha: DiaOperativo;
  neto: Neto;
  calculado: Neto;
  cierre: CierreBase | null;
  /** null si el día no tiene cierre registrado. */
  diferencia: Neto | null;
}

export interface Tablero {
  dias: ResumenDia[];
  totalFinal: number;
}

/** NULL/NaN → 0. Sin redondeo: el redondeo es solo al mostrar. */
function n(v: number | null | undefined): number {
  return typeof v === 'number' && Number.isFinite(v) ? v : 0;
}

/** Neto de un día y medio: ingresos − gastos. Día sin movimientos → 0. */
export function netoDia(movs: MovimientoBase[], fecha: string): Neto {
  let ingresosEf = 0;
  let gastosEf = 0;
  let ingresosCta = 0;
  let gastosCta = 0;
  for (const m of movs) {
    if (m.fecha !== fecha) continue;
    const monto = n(m.monto);
    if (m.medio === 'efectivo') {
      if (m.tipo === 'ingreso') ingresosEf += monto;
      else if (m.tipo === 'gasto') gastosEf += monto;
    } else if (m.medio === 'cuenta') {
      if (m.tipo === 'ingreso') ingresosCta += monto;
      else if (m.tipo === 'gasto') gastosCta += monto;
    }
  }
  return { efectivo: ingresosEf - gastosEf, cuenta: ingresosCta - gastosCta };
}

/**
 * Rendición completa: calculado[d] = inicial + Σ netos hasta d;
 * diferencia[d] = contado − calculado (solo con cierre); total = jueves ef + cta.
 */
export function calcularTablero(
  inicial: { efectivo: number | null; cuenta: number | null } | null,
  movs: MovimientoBase[],
  cierres: CierreBase[],
): Tablero {
  let accEf = n(inicial?.efectivo);
  let accCta = n(inicial?.cuenta);
  const porFecha = new Map(cierres.map((c) => [c.fecha, c]));

  const dias: ResumenDia[] = DIAS.map((fecha) => {
    const neto = netoDia(movs, fecha);
    accEf += neto.efectivo;
    accCta += neto.cuenta;
    const calculado: Neto = { efectivo: accEf, cuenta: accCta };
    const cierre = porFecha.get(fecha) ?? null;
    const diferencia =
      cierre === null
        ? null
        : {
            efectivo: n(cierre.efectivoContado) - calculado.efectivo,
            cuenta: n(cierre.cuentaContado) - calculado.cuenta,
          };
    return { fecha, neto, calculado, cierre, diferencia };
  });

  const jue = dias[dias.length - 1].calculado;
  return { dias, totalFinal: jue.efectivo + jue.cuenta };
}
