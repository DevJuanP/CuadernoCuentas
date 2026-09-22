# Tasks

## 1. Esquema y conexión

- [x] 1.1 Crear `src/db/schema.ts` con `saldosIniciales`, `movimientos` y `cierresDiarios` según `specs/cuaderno-db/spec.md` (enums importados de `src/lib/const.ts`) y verificar con `npx tsc --noEmit` sin errores
- [x] 1.2 Crear `src/db/index.ts` con singleton `better-sqlite3` (`DB_PATH ?? './cuaderno.db'`) y verificar que `npx tsc --noEmit` sigue en verde
- [x] 1.3 Crear `drizzle.config.ts` (dialecto `sqlite`, schema `./src/db/schema.ts`, salida `./drizzle`) y verificar que `npx drizzle-kit check` o `npm run db:generate -- --help` reconoce la configuración

## 2. Migración inicial

- [x] 2.1 Ejecutar `npm run db:generate` y verificar que `./drizzle/*.sql` contiene los 3 `CREATE TABLE` (saldos, movimientos, cierres) más el índice `idx_mov_fecha`
- [x] 2.2 Ejecutar `npm run db:migrate` y verificar que `cuaderno.db` existe con las 3 tablas (DB Browser o `npx drizzle-kit studio`, solo inspección)
- [x] 2.3 Verificar que `git status --short` no lista `cuaderno.db*` (cubierto por `.gitignore`)

## 3. Verificación de contrato

- [x] 3.1 Insertar un saldo, un movimiento por día operativo y un cierre de prueba vía script temporal `node --experimental-strip-types` o consola, y verificar lectura por fecha; luego borrar la base de prueba y regenerar con `npm run db:migrate`
- [x] 3.2 Ejecutar `npm run build` y verificar que compila sin errores con el nuevo `src/db/*`
- [x] 3.3 Ejecutar `openspec validate --change db-esquema` y verificar que el change está válido antes de pedir `/opsx-apply` o archivar
