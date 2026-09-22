import { describe, expect, it } from 'vitest';
import { validarCierre } from '../src/lib/cierre';

function fd(datos: Record<string, string>): FormData {
  const f = new FormData();
  for (const [k, v] of Object.entries(datos)) f.set(k, v);
  return f;
}

const CALC = { efectivo: 850.5, cuenta: 1000 };
const base = {
  fecha: '2026-09-22',
  efectivo_contado: '850.50',
  cuenta_contado: '1000',
  observaciones: '',
};

describe('validarCierre', () => {
  it('acepta cierre cuadrado sin observación', () => {
    expect(validarCierre(fd(base), CALC)).toEqual({
      fecha: '2026-09-22',
      efectivoContado: 850.5,
      cuentaContado: 1000,
      observaciones: '',
    });
  });

  it('acepta descuadre con observación', () => {
    const r = validarCierre(
      fd({ ...base, efectivo_contado: '860.50', observaciones: 'faltan 10' }),
      CALC,
    );
    expect(r).toMatchObject({ efectivoContado: 860.5, observaciones: 'faltan 10' });
  });

  it('rechaza descuadre sin observación (vacía o espacios)', () => {
    expect(validarCierre(fd({ ...base, efectivo_contado: '860.50' }), CALC)).toBeNull();
    expect(
      validarCierre(fd({ ...base, cuenta_contado: '999', observaciones: '   ' }), CALC),
    ).toBeNull();
  });

  it('rechaza contados negativos, no numéricos y sobre-máximo', () => {
    expect(validarCierre(fd({ ...base, efectivo_contado: '-1' }), CALC)).toBeNull();
    expect(validarCierre(fd({ ...base, cuenta_contado: 'abc' }), CALC)).toBeNull();
    expect(validarCierre(fd({ ...base, efectivo_contado: '' }), CALC)).toBeNull();
    expect(validarCierre(fd({ ...base, cuenta_contado: '1000000.01', observaciones: 'x' }), CALC)).toBeNull();
  });

  it('rechaza fecha fuera de DIAS', () => {
    expect(validarCierre(fd({ ...base, fecha: '2026-09-25' }), CALC)).toBeNull();
  });
});
