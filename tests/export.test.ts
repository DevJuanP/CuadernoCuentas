import { describe, expect, it } from 'vitest';
import { buildRendicionCsv } from '../src/lib/rendicionCsv';

const SALDO = {
  billetes: 500,
  monedas: 120.5,
  total: 620.5,
  cuenta: 800,
  notas: 'entrega lunes',
  fecha: '2026-09-21',
};

const MOVS = [
  { fecha: '2026-09-22', tipo: 'ingreso', medio: 'efectivo', categoria: 'ventas', concepto: 'Almuerzos', monto: 350 },
  { fecha: '2026-09-22', tipo: 'gasto', medio: 'efectivo', categoria: 'proveedores', concepto: 'Pollo; "especial"\nsegunda línea', monto: 120 },
  { fecha: '2026-09-22', tipo: 'ingreso', medio: 'cuenta', categoria: 'ventas', concepto: 'Delivery', monto: 200 },
];

const CIERRES = [{ fecha: '2026-09-22', efectivo: 850.5, cuenta: 1000, observaciones: 'cuadrado' }];

const RESUMEN = [
  { fecha: '2026-09-22', netoEf: 230, netoCta: 200, calcEf: 850.5, calcCta: 1000, difEf: 0, difCta: 0 },
  { fecha: '2026-09-23', netoEf: 0, netoCta: 0, calcEf: 850.5, calcCta: 1000, difEf: null, difCta: null },
  { fecha: '2026-09-24', netoEf: -50, netoCta: 100, calcEf: 800.5, calcCta: 1100, difEf: 10, difCta: 0 },
];

describe('buildRendicionCsv', () => {
  const csv = buildRendicionCsv(SALDO, MOVS, CIERRES, RESUMEN, 1900.5);

  it('usa separador ; y saltos CRLF en todo el archivo', () => {
    expect(csv).toContain(';');
    expect(csv).not.toContain('\t');
    const saltos = csv.match(/\r\n/g) ?? [];
    expect(saltos.length).toBeGreaterThan(10);
    // Sin \n sueltos fuera de campos entrecomillados (un salto dentro de "" es escape válido)
    const sinEntrecomillados = csv.replace(/"(?:[^"]|"")*"/g, '""');
    expect(sinEntrecomillados).not.toMatch(/[^\r]\n/);
  });

  it('incluye las 4 secciones con los números del tablero', () => {
    for (const s of ['SALDO INICIAL', 'MOVIMIENTOS', 'CIERRES', 'RESUMEN']) {
      expect(csv).toContain(s);
    }
    expect(csv).toContain('500.00;120.50;620.50;800.00;entrega lunes;2026-09-21');
    expect(csv).toContain('2026-09-22;ingreso;efectivo;ventas;Almuerzos;350.00');
    expect(csv).toContain('2026-09-22;850.50;1000.00;cuadrado');
    expect(csv).toContain('TOTAL_FINAL;;;;;;1900.50');
  });

  it('escapa ;/" /saltos duplicando comillas', () => {
    expect(csv).toContain('"Pollo; ""especial""\nsegunda línea";120.00');
  });

  it('días sin cierre dejan dif vacía', () => {
    expect(csv).toContain('2026-09-23;0.00;0.00;850.50;1000.00;;');
  });

  it('base vacía produce secciones con ceros sin romper', () => {
    const vacio = buildRendicionCsv(null, [], [], RESUMEN.map((r) => ({ ...r, difEf: null, difCta: null })), 0);
    expect(vacio).toContain('0.00;0.00;0.00;0.00;;');
    expect(vacio).toContain('TOTAL_FINAL;;;;;;0.00');
  });

  it('el endpoint debe anteponer BOM (contrato separado del builder)', () => {
    expect('\uFEFF' + csv).toMatch(/^\uFEFFSALDO INICIAL\r\n/);
  });
});
