import { CATEGORIAS, DIAS, MEDIOS, TIPOS } from './const';
import { MONTO_MAX } from './saldo';

export interface MovimientoValido {
  fecha: string;
  tipo: (typeof TIPOS)[number];
  medio: (typeof MEDIOS)[number];
  categoria: (typeof CATEGORIAS)[number];
  concepto: string;
  monto: number;
}

function enLista<T extends string>(v: unknown, lista: readonly T[]): v is T {
  return typeof v === 'string' && (lista as readonly string[]).includes(v);
}

export function parseMontoPositivo(v: FormDataEntryValue | null | undefined): number | null {
  if (typeof v !== 'string' || v.trim() === '') return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n <= 0 || n > MONTO_MAX) return null;
  return n;
}

/** Valida un POST de movimiento. Retorna datos limpios o null si inválido. */
export function validarMovimiento(fd: FormData): MovimientoValido | null {
  const fecha = fd.get('fecha');
  const tipo = fd.get('tipo');
  const medio = fd.get('medio');
  const categoria = fd.get('categoria');
  const concepto = (fd.get('concepto')?.toString() ?? '').trim().slice(0, 120);
  const monto = parseMontoPositivo(fd.get('monto'));

  if (!enLista(fecha, DIAS)) return null;
  if (!enLista(tipo, TIPOS)) return null;
  if (!enLista(medio, MEDIOS)) return null;
  if (!enLista(categoria, CATEGORIAS)) return null;
  if (concepto === '' || monto === null) return null;
  return { fecha, tipo, medio, categoria, concepto, monto };
}
