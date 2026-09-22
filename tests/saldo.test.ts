import { describe, expect, it } from 'vitest';
import { validarSaldo } from '../src/lib/saldo';

function fd(datos: Record<string, string>): FormData {
  const f = new FormData();
  for (const [k, v] of Object.entries(datos)) f.set(k, v);
  return f;
}

const base = { billetes: '500', monedas: '120.50', cuenta: '800', notas: 'entrega lunes' };

describe('validarSaldo', () => {
  it('acepta el ejemplo del plan y recorta notas', () => {
    expect(validarSaldo(fd(base))).toEqual({
      billetes: 500,
      monedas: 120.5,
      cuenta: 800,
      notas: 'entrega lunes',
    });
  });

  it('acepta ceros y notas vacías', () => {
    expect(validarSaldo(fd({ billetes: '0', monedas: '0', cuenta: '0', notas: '' }))).toEqual({
      billetes: 0,
      monedas: 0,
      cuenta: 0,
      notas: '',
    });
  });

  it('rechaza negativos', () => {
    expect(validarSaldo(fd({ ...base, billetes: '-5' }))).toBeNull();
    expect(validarSaldo(fd({ ...base, monedas: '-0.01' }))).toBeNull();
    expect(validarSaldo(fd({ ...base, cuenta: '-1' }))).toBeNull();
  });

  it('rechaza vacíos y no numéricos', () => {
    expect(validarSaldo(fd({ ...base, billetes: '' }))).toBeNull();
    expect(validarSaldo(fd({ ...base, cuenta: 'abc' }))).toBeNull();
  });

  it('rechaza montos sobre el máximo', () => {
    expect(validarSaldo(fd({ ...base, cuenta: '1000000.01' }))).toBeNull();
  });

  it('recorta notas a 500 caracteres', () => {
    const r = validarSaldo(fd({ ...base, notas: '  x'.repeat(400) }));
    expect(r?.notas).toHaveLength(500);
  });
});
