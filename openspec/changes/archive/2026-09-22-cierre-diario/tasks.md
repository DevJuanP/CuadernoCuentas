# Tasks

## 1. Validación + persistencia

- [x] 1.1 Crear `src/lib/cierre.ts` con `validarCierre(fd, calculado)` pura (fecha ∈ DIAS, contados finitos `0–1M`, observación obligatoria si descuadre) y verificar con `npx tsc --noEmit` sin errores
- [x] 1.2 Agregar `saveCierre` con `onConflictDoUpdate` sobre `fecha` en `src/db/cierres.ts` y verificar que `npx tsc --noEmit` sigue limpio
- [x] 1.3 Crear `tests/cierre.test.ts` (cuadrado sin observación, descuadre sin observación → null, contado negativo → null, fecha fuera de DIAS → null, observación con espacios → obligatoria) y verificar `npx vitest run` en verde

## 2. Pantalla de arqueo

- [x] 2.1 Crear `src/components/FormCierre.astro` (props: fecha, calculado lectura, cierre previo; diferencia viva JS en tinta/`.badge-suave` si 0 y `.destructivo` si ≠0, sin verde; submit `.btn-primario`) y verificar `npx tsc --noEmit` limpio
- [x] 2.2 Reescribir `src/pages/cierre.astro` (selector `?fecha=` con pills, GET con prefill + calculado vía `calcularTablero`, POST upsert + redirect 303, error `.destructivo` con valores; sin SQL ni aritmética inline) y verificar `npm run build` OK
- [x] 2.3 Verificación viva con chrome-devtools MCP sobre preview con base aislada (`cp cuaderno.db cuaderno-test-f6.db` + `DB_PATH=./cuaderno-test-f6.db npm run preview -- --port 4322`; sembrar saldo y movimientos vía UI). Protocolo MCP: `navigate_page` a `/cierre?fecha=...`, `take_snapshot` para localizar campos, `fill_form` + `click` en submit para cada caso, `evaluate_script` para leer la diferencia viva y el contenido tras cada POST, `take_screenshot` para validar paleta. Casos: contado igual al calculado → 0 en tinta con badge "cuadrado"; +10 → rojo con `.destructivo` + exige observación (POST sin observación devuelve 200 con error y no persiste); re-arqueo actualiza sin duplicar (1 fila por fecha en DB); día con cierre bloquea crear/borrar en `/registrar`; verificar las 4 rutas en 200; al final detener el servidor y borrar `cuaderno-test-f6.db`

## 3. Cierre del change

- [x] 3.1 Ejecutar `openspec validate cierre-diario` y verificar que el change está válido antes de `/opsx-apply` o archivar
