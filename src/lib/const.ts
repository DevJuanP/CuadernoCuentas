// Días operativos Demo 1 (lunes 21/09 es entrega, no operativo)
export const DIAS = ['2026-09-22', '2026-09-23', '2026-09-24'] as const;
export type DiaOperativo = (typeof DIAS)[number];

export const CATEGORIAS = [
  'ventas',
  'proveedores',
  'personal',
  'servicios',
  'insumos',
  'otros',
] as const;
export type Categoria = (typeof CATEGORIAS)[number];

export const TIPOS = ['ingreso', 'gasto'] as const;
export type TipoMovimiento = (typeof TIPOS)[number];

export const MEDIOS = ['efectivo', 'cuenta'] as const;
export type Medio = (typeof MEDIOS)[number];

export const FECHA_ENTREGA = '2026-09-21';
export const MONTO_MAX = 1_000_000;
