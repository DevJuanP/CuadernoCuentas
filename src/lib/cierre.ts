import { DIAS, type DiaOperativo } from './const';
import { MONTO_MAX } from './saldo';

export interface CalculadoDia {
  efectivo: number;
  cuenta: number;
}

export interface CierreValido {
  fecha: DiaOperativo;
  efectivoContado: number;
  cuentaContado: number;
  observaciones: string;
}

function contado(v: FormDataEntryValue | null | undefined): number | null {
  if (typeof v !== 'string' || v.trim() === '') return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0 || n > MONTO_MAX) return null;
  return n;
}

/**
 * Valida un POST de arqueo contra el calculado del día (de `calculos.ts`).
 * Retorna datos limpios o null si inválido (incluye observación obligatoria ante descuadre).
 */
export function validarCierre(fd: FormData, calculado: CalculadoDia): CierreValido | null {
  const fecha = fd.get('fecha');
  if (typeof fecha !== 'string' || !(DIAS as readonly string[]).includes(fecha)) return null;
  const ef = contado(fd.get('efectivo_contado'));
  const cta = contado(fd.get('cuenta_contado'));
  if (ef === null || cta === null) return null;
  const observaciones = (fd.get('observaciones')?.toString() ?? '').trim().slice(0, 500);
  const descuadre = ef - calculado.efectivo !== 0 || cta - calculado.cuenta !== 0;
  if (descuadre && observaciones === '') return null;
  return { fecha: fecha as DiaOperativo, efectivoContado: ef, cuentaContado: cta, observaciones };
}
