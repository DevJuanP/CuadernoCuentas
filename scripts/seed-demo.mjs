// Seed de demostración — SOLO pruebas (Demo 1, YAGNI: sin faker ni CLI framework).
// Uso:  DB_PATH=./cuaderno-demo.db node scripts/seed-demo.mjs
//       node scripts/seed-demo.mjs --clear-demo   (borra SOLO filas DEMO:)
// Las páginas NUNCA usan better-sqlite3 directo (solid-dip); este script es
// tooling y documenta la excepción: escribe SQL solo para generar fixtures.
import Database from 'better-sqlite3';

const MARCA = 'DEMO:';
const dbPath = process.env.DB_PATH ?? './cuaderno.db';
const db = new Database(dbPath);

function cuentaNoDemo(tabla, columna) {
  return db.prepare(`SELECT COUNT(*) AS c FROM ${tabla} WHERE ${columna} IS NULL OR ${columna} NOT LIKE '${MARCA}%'`).get().c;
}

function sembrar() {
  const reales =
    cuentaNoDemo('saldos_iniciales', 'notas') +
    cuentaNoDemo('movimientos', 'concepto') +
    cuentaNoDemo('cierres_diarios', 'observaciones');
  if (reales > 0 && !process.argv.includes('--force')) {
    console.error(
      `La base ${dbPath} ya tiene ${reales} fila(s) reales. Usa DB_PATH=./otra.db o agrega --force.`,
    );
    process.exit(1);
  }
  const insSaldo = db.prepare(
    'INSERT INTO saldos_iniciales (efectivo_billetes, efectivo_monedas, cuenta, notas) VALUES (?,?,?,?)',
  );
  insSaldo.run(500, 120.5, 800, `${MARCA} entrega lunes`);

  const insMov = db.prepare(
    'INSERT INTO movimientos (fecha, tipo, medio, categoria, concepto, monto) VALUES (?,?,?,?,?,?)',
  );
  const movs = [
    ['2026-09-22', 'ingreso', 'efectivo', 'ventas', `${MARCA} Almuerzos`, 350],
    ['2026-09-22', 'gasto', 'efectivo', 'proveedores', `${MARCA} Pollo`, 120],
    ['2026-09-22', 'ingreso', 'cuenta', 'ventas', `${MARCA} Delivery`, 200],
    ['2026-09-23', 'gasto', 'cuenta', 'servicios', `${MARCA} Luz`, 60],
    ['2026-09-24', 'ingreso', 'efectivo', 'ventas', `${MARCA} Cena`, 400],
    ['2026-09-24', 'gasto', 'efectivo', 'insumos', `${MARCA} Verdura`, 50],
  ];
  for (const m of movs) insMov.run(...m);

  const insCierre = db.prepare(
    'INSERT INTO cierres_diarios (fecha, efectivo_contado, cuenta_contado, observaciones) VALUES (?,?,?,?) ON CONFLICT(fecha) DO UPDATE SET efectivo_contado=excluded.efectivo_contado, cuenta_contado=excluded.cuenta_contado, observaciones=excluded.observaciones',
  );
  insCierre.run('2026-09-22', 850.5, 1000, `${MARCA} cuadrado`);
  insCierre.run('2026-09-23', 850.5, 940, `${MARCA} cuadrado`);
  insCierre.run('2026-09-24', 1250.5, 1040, `${MARCA} revisar 50 de más en ef`);
  console.log(`Sembrado OK en ${dbPath} (1 saldo, 6 movimientos, 3 cierres).`);
}

function limpiar() {
  const a = db.prepare(`DELETE FROM movimientos WHERE concepto LIKE '${MARCA}%'`).run().changes;
  const b = db.prepare(`DELETE FROM cierres_diarios WHERE observaciones LIKE '${MARCA}%'`).run().changes;
  const c = db.prepare(`DELETE FROM saldos_iniciales WHERE notas LIKE '${MARCA}%'`).run().changes;
  console.log(`Limpieza OK: ${a} movimientos, ${b} cierres, ${c} saldos DEMO borrados.`);
}

if (process.argv.includes('--clear-demo')) limpiar();
else sembrar();
