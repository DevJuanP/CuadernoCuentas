# Tasks

## 1. Motor de cálculo + tests

- [x] 1.1 Crear `src/lib/calculos.ts` con funciones puras (neto por día/medio, calculado con acumulado, diferencias, total final; NULL→0, sin redondear dentro) y verificar con `npx tsc --noEmit` sin errores
- [x] 1.2 Crear `tests/calculos.test.ts` con la matriz del spec (ejemplo mar +230/+200, arrastre mar→jue 800.50/1100.00, diferencia 0 y +10, vacío→0, redondeo solo al mostrar) y verificar `npx vitest run` en verde

## 2. Tablero

- [x] 2.1 Crear `src/components/ResumenDia.astro` (props ya calculados; stat card ejemplo 1 de `design.md`: `.stat-label`/`.stat-valor`, `.badge` de estado, `.destructivo` solo en diferencia ≠0) y verificar que `npx tsc --noEmit` sigue limpio
- [x] 2.2 Reescribir `src/pages/index.astro` server-side (saldo + 3 `ResumenDia` + tabla + diferencias + total + enlaces exportar con `id="rendicion"`; bordes: banner sin saldo, ceros sin movs, "pendiente" sin cierres; sin SQL ni aritmética inline) y verificar `npm run build` OK
- [x] 2.3 Verificación viva con chrome-devtools MCP sobre preview con base aislada (`cp cuaderno.db cuaderno-test-f5.db` + `DB_PATH=./cuaderno-test-f5.db npm run preview -- --port 4322`; sembrar vía UI el ejemplo del plan: saldo 500+120.50+800 y movimientos mar/mié/jue): navegar a `/`, confirmar con snapshot que las 3 stat cards muestran netos/acumulados cuadrados a mano (mar +230/+200, arrastre a jue), diferencias y total final; comprobar visualmente con screenshot que no hay colores fuera de paleta (diferencia 0 en tinta, sin verde); recargar sin datos y confirmar banner/ceros/"pendiente" sin errores; verificar las 4 rutas en 200; al final detener el servidor y borrar `cuaderno-test-f5.db`

## 3. Cierre del change

- [x] 3.1 Ejecutar `openspec validate calculos-tablero` y verificar que el change está válido antes de `/opsx-apply` o archivar
