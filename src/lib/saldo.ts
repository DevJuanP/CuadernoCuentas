export const MONTO_MAX = 1_000_000;

export interface SaldoValido {
  billetes: number;
  monedas: number;
  cuenta: number;
  notas: string;
}

export function parseMonto(v: FormDataEntryValue | null | undefined): number | null {
  if (typeof v !== 'string' || v.trim() === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function enRango(n: number | null): n is number {
  return n !== null && n >= 0 && n <= MONTO_MAX;
}

/** Valida un POST de saldo inicial. Retorna datos limpios o null si inválido. */
export function validarSaldo(fd: FormData): SaldoValido | null {
  const b = parseMonto(fd.get('billetes'));
  const m = parseMonto(fd.get('monedas'));
  const c = parseMonto(fd.get('cuenta'));
  if (!enRango(b) || !enRango(m) || !enRango(c)) return null;
  const notas = (fd.get('notas')?.toString() ?? '').trim().slice(0, 500);
  return { billetes: b, monedas: m, cuenta: c, notas };
}
