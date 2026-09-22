# Tasks

## 1. Builder CSV + tests

- [x] 1.1 Crear `src/lib/rendicionCsv.ts` con builder puro (4 secciones, `;`, `\r\n`, `toFixed(2)`, reutiliza `escapeCsv`; sin BOM, sin I/O) y verificar con `npx tsc --noEmit` sin errores
- [x] 1.2 Crear `tests/export.test.ts` (BOM antepuesto por el endpoint —testear builder + prefijo por separado—, separador `;`, `\r\n`, 4 secciones con números del ejemplo del plan, escape de `;`/`"`/salto, DB vacía → ceros) y verificar `npx vitest run` en verde

## 2. Endpoint + impreso

- [x] 2.1 Crear `src/pages/api/export.csv.ts` (lecturas vía repository + `calcularTablero` + builder; headers `text/csv; charset=utf-8` y `attachment` con nombre fijo; ignora query) y verificar `npm run build` OK
- [x] 2.2 Agregar bloque `.firmas` ("Recibido por ___ / Entregado por ___") en `#rendicion` de `/` (visible impreso B/N, discreto en pantalla; botones ya `.no-print`) y verificar `npm run build` OK
- [x] 2.3 Verificación viva con chrome-devtools MCP sobre preview con base aislada (`cp cuaderno.db cuaderno-test-f7.db` + `DB_PATH` + puerto 4322; sembrar vía UI): descargar `/api/export.csv` y verificar BOM + `;` + 4 secciones + valores del tablero (abrir en Excel si disponible); emular impresión o revisar print CSS y confirmar B/N + firmas + ≤2 páginas + sin nav/botones; verificar las 4 rutas + endpoint en 200; al final detener el servidor y borrar `cuaderno-test-f7.db`

## 3. Cierre del change

- [x] 3.1 Ejecutar `openspec validate exports` y verificar que el change está válido antes de `/opsx-apply` o archivar
