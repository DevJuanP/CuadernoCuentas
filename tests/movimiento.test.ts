import { describe, expect, it } from 'vitest';
import { validarMovimiento } from '../src/lib/movimiento';

function fd(datos: Record<string, string>): FormData {
  const f = new FormData();
  for (const [k, v] of Object.entries(datos)) f.set(k, v);
  return f;
}

const base = {
  fecha: '2026-09-22',
  tipo: 'ingreso',
  medio: 'efectivo',
  categoria: 'ventas',
  concepto: 'Almuerzos',
  monto: '350',
};

describe('validarMovimiento', () => {
  it('acepta el ejemplo del plan', () => {
    expect(validarMovimiento(fd(base))).toEqual({
      fecha: '2026-09-22',
      tipo: 'ingreso',
      medio: 'efectivo',
      categoria: 'ventas',
      concepto: 'Almuerzos',
      monto: 350,
    });
  });

  it('acepta gasto con decimales y recorta concepto', () => {
    const r = validarMovimiento(fd({ ...base, tipo: 'gasto', categoria: 'proveedores', concepto: '  Pollo  ', monto: '120.50' }));
    expect(r).toMatchObject({ tipo: 'gasto', categoria: 'proveedores', concepto: 'Pollo', monto: 120.5 });
  });

  it('rechaza fecha fuera de DIAS', () => {
    expect(validarMovimiento(fd({ ...base, fecha: '2026-09-25' }))).toBeNull();
    expect(validarMovimiento(fd({ ...base, fecha: '' }))).toBeNull();
  });

  it('rechaza monto 0, negativo, no numérico y sobre-máximo', () => {
    for (const monto of ['0', '-10', 'abc', '', '1000000.01']) {
      expect(validarMovimiento(fd({ ...base, monto }))).toBeNull();
    }
  });

  it('rechaza enums inválidos', () => {
    expect(validarMovimiento(fd({ ...base, tipo: 'otro' }))).toBeNull();
    expect(validarMovimiento(fd({ ...base, medio: 'tarjeta' }))).toBeNull();
    expect(validarMovimiento(fd({ ...base, categoria: 'viajes' }))).toBeNull();
  });

  it('rechaza concepto vacío o mayor a 120', () => {
    expect(validarMovimiento(fd({ ...base, concepto: '   ' }))).toBeNull();
    expect(validarMovimiento(fd({ ...base, concepto: 'x'.repeat(121) }))).not.toBeNull();
    expect(validarMovimiento(fd({ ...base, concepto: 'x'.repeat(121) }))?.concepto).toHaveLength(120);
  });
});
