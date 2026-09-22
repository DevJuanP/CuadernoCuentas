import { describe, expect, it } from 'vitest';
import { calcularTablero, netoDia, type CierreBase, type MovimientoBase } from '../src/lib/calculos';

const MAR: MovimientoBase[] = [
  { fecha: '2026-09-22', tipo: 'ingreso', medio: 'efectivo', monto: 350 },
  { fecha: '2026-09-22', tipo: 'gasto', medio: 'efectivo', monto: 120 },
  { fecha: '2026-09-22', tipo: 'ingreso', medio: 'cuenta', monto: 200 },
];

describe('netoDia', () => {
  it('ejemplo del plan: mar +230 ef / +200 cuenta', () => {
    expect(netoDia(MAR, '2026-09-22')).toEqual({ efectivo: 230, cuenta: 200 });
  });

  it('día sin movimientos → 0', () => {
    expect(netoDia(MAR, '2026-09-23')).toEqual({ efectivo: 0, cuenta: 0 });
    expect(netoDia([], '2026-09-22')).toEqual({ efectivo: 0, cuenta: 0 });
  });

  it('ignora montos nulos como 0', () => {
    expect(
      netoDia([{ fecha: '2026-09-22', tipo: 'ingreso', medio: 'efectivo', monto: null }], '2026-09-22'),
    ).toEqual({ efectivo: 0, cuenta: 0 });
  });
});

describe('calcularTablero', () => {
  it('arrastre mar→jue: jueves 800.50 ef / 1100.00 cuenta', () => {
    const movs: MovimientoBase[] = [
      ...MAR,
      { fecha: '2026-09-24', tipo: 'gasto', medio: 'efectivo', monto: 50 },
      { fecha: '2026-09-24', tipo: 'ingreso', medio: 'cuenta', monto: 100 },
    ];
    const t = calcularTablero({ efectivo: 620.5, cuenta: 800 }, movs, []);
    expect(t.dias[0].calculado).toEqual({ efectivo: 850.5, cuenta: 1000 });
    expect(t.dias[1].calculado).toEqual({ efectivo: 850.5, cuenta: 1000 });
    expect(t.dias[2].calculado).toEqual({ efectivo: 800.5, cuenta: 1100 });
  });

  it('total final = jueves ef + cuenta', () => {
    const t = calcularTablero({ efectivo: 620.5, cuenta: 800 }, MAR, []);
    expect(t.totalFinal).toBeCloseTo(850.5 + 1000, 2);
  });

  it('diferencia 0 con cierre cuadrado', () => {
    const cierres: CierreBase[] = [{ fecha: '2026-09-22', efectivoContado: 850.5, cuentaContado: 1000 }];
    const t = calcularTablero({ efectivo: 620.5, cuenta: 800 }, MAR, cierres);
    expect(t.dias[0].diferencia).toEqual({ efectivo: 0, cuenta: 0 });
  });

  it('diferencia +10 con contado mayor', () => {
    const cierres: CierreBase[] = [{ fecha: '2026-09-22', efectivoContado: 860.5, cuentaContado: 1000 }];
    const t = calcularTablero({ efectivo: 620.5, cuenta: 800 }, MAR, cierres);
    expect(t.dias[0].diferencia).toEqual({ efectivo: 10, cuenta: 0 });
  });

  it('sin cierre → diferencia null', () => {
    const t = calcularTablero({ efectivo: 620.5, cuenta: 800 }, MAR, []);
    expect(t.dias[0].diferencia).toBeNull();
  });

  it('sin saldo inicial arranca de 0', () => {
    const t = calcularTablero(null, MAR, []);
    expect(t.dias[0].calculado).toEqual({ efectivo: 230, cuenta: 200 });
  });

  it('conserva precisión interna (redondeo solo al mostrar)', () => {
    const t = calcularTablero(
      { efectivo: 0, cuenta: 0 },
      [{ fecha: '2026-09-22', tipo: 'ingreso', medio: 'efectivo', monto: 0.1 + 0.2 }],
      [],
    );
    expect(t.dias[0].calculado.efectivo).toBe(0.1 + 0.2);
    expect(t.dias[0].calculado.efectivo).not.toBe(0.3);
  });
});
