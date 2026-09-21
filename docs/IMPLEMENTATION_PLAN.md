# Plan de Implementación — Cuaderno de Cuentas Restaurante (Demo 1)

> Ubicación: `D:\MyProjects\Cuaderno de cuentas` · Fecha: 2026-09-21
> Estado: Plan único Demo 1 (diseño + ejecución por fases). Este es el único archivo de plan.
> Días: **lunes 21/09 entrega (saldo inicial, no operativo) → mar 22 + mié 23 + jue 24 operativos → rendición.**

---

## PARTE A — Diseño

### A.0 Contexto y decisiones cerradas

- Hoy lunes 21/09/2026: día de entrega, NO operativo. Se registra el saldo inicial.
- Días a cargo: martes 22, miércoles 23, jueves 24 de septiembre 2026.
- Entrega inicial del amigo: 1) efectivo desglosado (billetes + monedas) + 2) monto en cuenta. El usuario los cargará luego (formulario vacío en Demo 1).
- Decisiones del cuestionario:
  1. Saldo inicial → formulario vacío, no hardcodear montos.
  2. Movimientos → con **categorías + arqueo diario**.
  3. Uso → **solo laptop, local, sin internet, sin nube, sin móvil**.
  4. Rendición → **exportar PDF/Excel** (pantalla + exportación).
- Moneda asumida: `PEN (S/)` con 2 decimales. Si se piden enteros, cambiar `NUMERIC(12,2)` → `INTEGER` e inputs a `step="1"`.

### A.1 Objetivo y alcance Demo 1

Construir en **un solo proyecto** una app local que permita:

1. Registrar el **saldo inicial del lunes** (billetes, monedas, total auto, cuenta, notas).
2. Registrar **movimientos día por día** (mar/mié/jue): fecha, tipo, medio, categoría, concepto, monto.
3. Hacer el **cierre/arqueo diario**: contado físico vs calculado, diferencia y observación.
4. Ver el **tablero de rendición** (inicial + por día + final) y **exportar**: Imprimir/Guardar PDF + Descargar CSV (Excel).
5. Correr con **un comando** en la laptop, datos en **un archivo** fácil de respaldar.

- IN: 4 páginas (`/saldo-inicial`, `/registrar`, `/cierre`, `/` tablero), 3 tablas, validaciones básicas, CSV + print-PDF, respaldo copiando `cuaderno.db`.
- OUT (Demo 2): login/auth, multi-usuario, nube, Postgres, Spring Boot, fotos de tickets, multi-moneda, `.xlsx` nativo, PWA móvil.

### A.2 Stack final

| Capa | Elección | Versión objetivo | Por qué |
|---|---|---|---|
| Framework fullstack | **Astro SSR** + `@astrojs/node` (standalone) | Astro `^5`, adapter `^9`, Node `>=20` (verificado local: Node v24.16.0 / npm 11.13.0) | 1 proyecto = front + back. Sin CORS ni 2 servidores. |
| Lenguaje | **TypeScript strict** | TS `^5.6` | Tipado de montos/fechas. |
| DB | **SQLite** archivo `cuaderno.db` vía `better-sqlite3` | `better-sqlite3 ^11` | Cero instalación, 1 archivo. Contingencia: `node:sqlite`/`libsql` si falla la compilación en Windows. |
| ORM | **Drizzle ORM** + `drizzle-kit` | `^0.36` / `^0.28` | Esquema tipado + migraciones. Contingencia: SQL directo. |
| Estilos | **CSS propio + print CSS** (sin Tailwind en Demo 1) | — | Control de hoja impresa, menos deps. |
| Export Excel | **CSV UTF-8 con BOM, separador `;`** | — | Excel es-PE lo abre directo, cero librerías. Archivo: `rendicion-2026-09-22-24.csv`. |
| Export PDF | **`window.print()` + `@media print`** | — | Sin `puppeteer`/`pdfkit`, funciona offline. |
| Validación | Server-side + HTML `required`/`min` | `zod ^3` recomendado | Evita montos ≤0, vacíos, fechas fuera de rango. |
| Moneda | Helper `formatPEN(n)` con `Intl.NumberFormat('es-PE')` | — | Un solo formato `S/ 1,234.50`. |

Por qué NO Postgres / Spring / back separado: Postgres exige servicio/Docker; Spring exige JDK/build lento; back Node separado duplica proyecto y obliga a CORS. Todo sobredimensionado para 3 días, 1 usuario, local.

### A.3 Arquitectura

```
┌────────────────────────────────────────────┐
│  Laptop (localhost:4321)                   │
│  │ Astro SSR (Node standalone)             │
│  │  pages: / /registrar /cierre           │
│  │         /saldo-inicial /api/export.csv │
│  │  lib/calculos.ts (única fuente verdad) │
│  └──────────────┬─────────────────────────┘
│                 │ better-sqlite3 (sync)    │
│  │ cuaderno.db (SQLite, 3 tablas)         │
│  Export: CSV (GET) + print CSS             │
└────────────────────────────────────────────┘
```

- Puerto `4321`, comando único `npm run dev`. Datos: `./cuaderno.db` + `./drizzle/`. Respaldo = copiar el `.db`.

### A.4 Modelo de datos

```sql
CREATE TABLE saldos_iniciales (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  fecha_entrega TEXT NOT NULL DEFAULT '2026-09-21',
  efectivo_billetes NUMERIC(12,2) NOT NULL DEFAULT 0,
  efectivo_monedas  NUMERIC(12,2) NOT NULL DEFAULT 0,
  efectivo_total    NUMERIC(12,2) GENERATED ALWAYS AS (efectivo_billetes + efectivo_monedas) VIRTUAL,
  cuenta NUMERIC(12,2) NOT NULL DEFAULT 0,
  notas TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);

CREATE TABLE movimientos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  fecha TEXT NOT NULL,                        -- solo '2026-09-22'|'2026-09-23'|'2026-09-24'
  tipo  TEXT NOT NULL CHECK (tipo IN ('ingreso','gasto')),
  medio TEXT NOT NULL CHECK (medio IN ('efectivo','cuenta')),
  categoria TEXT NOT NULL CHECK (categoria IN ('ventas','proveedores','personal','servicios','insumos','otros')),
  concepto TEXT NOT NULL,
  monto NUMERIC(12,2) NOT NULL CHECK (monto > 0),
  created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);
CREATE INDEX idx_mov_fecha ON movimientos(fecha);

CREATE TABLE cierres_diarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  fecha TEXT NOT NULL UNIQUE,
  efectivo_contado NUMERIC(12,2) NOT NULL DEFAULT 0,
  cuenta_contado   NUMERIC(12,2) NOT NULL DEFAULT 0,
  observaciones TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);
```

Drizzle (`src/db/schema.ts`): `saldosIniciales, movimientos, cierresDiarios`; montos REAL + validación >0 en app; fechas TEXT YYYY-MM-DD.

Cálculos (`src/lib/calculos.ts`, única fuente de verdad):

```ts
// ingresos_ef[d] = SUM(monto WHERE fecha=d AND tipo='ingreso' AND medio='efectivo')
// gastos_ef[d]   = SUM(... 'gasto' ...); neto_ef[d] = ingresos_ef[d] - gastos_ef[d] (igual cuenta)
// efectivo_calculado[d] = inicial.efectivo_total + Σ_{k<=d} neto_ef[k]
// cuenta_calculada[d]   = inicial.cuenta        + Σ_{k<=d} neto_cta[k]
// diferencia_ef[d]  = cierre.efectivo_contado - efectivo_calculado[d] (igual cuenta)
// total_final = efectivo_calculado[jue] + cuenta_calculada[jue]
```

NULL → 0, redondeo a 2 decimales solo al mostrar. Constante `DIAS = ['2026-09-22','2026-09-23','2026-09-24']`.

### A.5 Páginas, API y componentes

| Ruta | Método | Entrada | Efecto |
|---|---|---|---|
| `/saldo-inicial` | GET/POST | `billetes, monedas, cuenta, notas` | Insert (o edita último). Redirect `/`. Total en vivo JS + recálculo server. |
| `/registrar` | GET/POST | `fecha, tipo, medio, categoria, concepto, monto` | Inserta. Si día con cierre → aviso “día cerrado”. Lista del día + borrar. |
| `/cierre` | GET/POST | `fecha, efectivo_contado, cuenta_contado, observaciones` | Upsert por fecha. Diferencia viva JS (0 verde, ≠0 rojo). |
| `/` | GET | — | Tablero: inicial + 3 tarjetas día + tabla + cierres/diferencias + saldo final + botones exportar. |
| `/api/export.csv` | GET | `?desde&hasta` | CSV con BOM, `;`, `\r\n`, 4 secciones. `Content-Disposition: attachment`. |
| (interno) | POST | `eliminar-movimiento?id=` | Borra si día no cerrado (con confirm). Redirect `/registrar?fecha=...`. |

Componentes: `Base.astro` (nav + slot + CSS/print), `ResumenDia.astro`, `TablaMovimientos.astro`, `FormMovimiento/FormCierre/FormSaldoInicial.astro`, `lib/format.ts` (`formatPEN`, `formatFecha`, `DIAS`, `CATEGORIAS`, `escapeCsv`).

Validaciones: fecha ∈ DIAS; tipo/medio/categoría ∈ enums; concepto trim ≠ ∅ (max 120); monto finito >0 y ≤1_000_000 (zod o checks). Cierre: observación obligatoria si diferencia ≠0.

### A.6 Exportaciones

- **CSV:** BOM `\uFEFF`, secciones SALDO INICIAL / MOVIMIENTOS / CIERRES / RESUMEN. Escape: duplicar `"` y entrecomillar si hay `;`/`"`/salto.
- **PDF:** botón `window.print()`; `@media print` oculta nav/forms/botones, muestra `#rendicion` B/N 11pt con firmas “Recibido por ___ / Entregado por ___”. Verificar en Chrome ≤2 páginas.

### A.7 Estructura y dependencias

```
D:\MyProjects\Cuaderno de cuentas\
  docs\
    IMPLEMENTATION_PLAN.md        # este archivo (único plan)
  package.json
  astro.config.mjs                # output:'server', adapter node standalone
  tsconfig.json
  drizzle.config.ts
  drizzle\                        # migraciones
  cuaderno.db                     # generado al correr (NO commitear datos reales)
  src\
    db\schema.ts, index.ts
    lib\calculos.ts, format.ts, const.ts
    layouts\Base.astro
    components\ResumenDia, TablaMovimientos, FormMovimiento, FormCierre, FormSaldoInicial
    pages\index.astro, registrar.astro, cierre.astro, saldo-inicial.astro, api\export.csv.ts
    styles\global.css
  scripts\seed-demo.mjs           # datos ficticios + --clear-demo
```

```json
{
  "name": "cuaderno-cuentas",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "seed:demo": "node scripts/seed-demo.mjs",
    "test": "vitest run"
  },
  "dependencies": {
    "@astrojs/node": "^9.0.0",
    "astro": "^5.0.0",
    "better-sqlite3": "^11.0.0",
    "drizzle-orm": "^0.36.0",
    "zod": "^3.23.0"
  },
  "devDependencies": {
    "drizzle-kit": "^0.28.0",
    "typescript": "^5.6.0",
    "vitest": "^2.0.0"
  }
}
```

---

## PARTE B — Ejecución por fases (no saltar verificaciones)

```
F0 (entorno) → F1 (andamiaje) → F2 (DB) → F3 (saldo) → F4 (movimientos)
→ F5 (tablero) → F6 (cierre) → F7 (exports) → F8 (pulido)
```
F3–F4 pueden alternarse; F5 exige ambas; F6 exige F5; F7 exige F5+F6. Total estimado: F0 20–30 min + F1–F8 ~3 h.

### Fase 0 — Prerrequisitos (QUE INSTALAR ANTES; 20–30 min, una sola vez)

**Objetivo:** laptop lista para que el scaffold corra sin trabas.

**Obligatorio:**

| # | Software | Versión | Para qué | Instalación Windows |
|---|---|---|---|---|
| 1 | Node.js | `>=20` (recomendado 20/22 LTS; verificado `v24.16.0` OK con prebuild) | Correr Astro, migrar DB | https://nodejs.org → LTS, marcar “Add to PATH”. Verificar `node --version` |
| 2 | npm | `>=10` (verificado `11.13.0`, viene con Node) | Dependencias | Verificar `npm --version` |
| 3 | VS Code | reciente | Editar `.astro/.ts/.css` | https://code.visualstudio.com |
| 4 | Chrome/Edge | actualizado | Probar app + Guardar PDF | Instalar Chrome si falta |
| 5 | Excel/LibreOffice | cualquiera | Abrir CSV con `;` | Verificar apertura `.csv` |

**Opcional recomendado:** DB Browser for SQLite (ver `cuaderno.db` sin comandos), Git (`git --version`), Windows Terminal/PowerShell 7 (rutas con espacios).

**Windows + `better-sqlite3`:** v11 trae prebuilds Node 20/22/24 x64, no debería compilar. Si `npm install` falla (`node-gyp/MSBuild/python`): instalar VS Build Tools (“Desktop development with C++”) + Python 3.11+ con PATH, reintentar `npm rebuild better-sqlite3`. Plan B: `node:sqlite`/`libsql`.

**NO instalar:** ❌ Postgres/Docker/servicios, ❌ JDK/Maven/Gradle/Spring, ❌ Tailwind/`puppeteer`/`pdfkit`/`exceljs` (Demo 2).

**Verificación F0 (PowerShell):**

```powershell
cd "D:\MyProjects\Cuaderno de cuentas"
node --version   # v20+
npm --version    # 10+
git --version    # opcional
code --version   # opcional
```

- [ ] `node`+`npm` responden; existe `docs/IMPLEMENTATION_PLAN.md`; internet solo para `npm install`; ~500 MB libres; usuario confirma S/ con céntimos, CSV `;` OK, nombre `cuaderno-cuentas`.
- **Salida:** checklist OK. Recién ahí a F1.

### Fase 1 — Andamiaje Astro SSR (15 min)

Objetivo: `http://localhost:4321` con 4 rutas vacías. Tareas: scaffold minimal TS strict (sin git si molesta el espacio en ruta); agregar adapter node standalone + `output:'server'`; crear `const.ts`, `format.ts`, `global.css` (+print base), `Base.astro` con nav, 4 placeholders.

```powershell
npm create astro@latest . -- --template minimal --typescript strict --install --no-git
npm i @astrojs/node better-sqlite3 drizzle-orm zod
npm i -D drizzle-kit typescript
npm run dev
```

Crea: `package.json`, `astro.config.mjs`, `tsconfig.json`, layouts/pages/lib/styles. Verificación: 4 rutas sin 500 + `npm run build` OK. Si falla por espacio en ruta, scaffold en `C:\Temp\` y copiar.

### Fase 2 — DB + esquema (20 min)

Objetivo: `cuaderno.db` con 3 tablas. Tareas: `src/db/schema.ts` + `index.ts` (`DB_PATH ?? './cuaderno.db'`); `drizzle.config.ts` (sqlite, out `./drizzle`); generar+migrar; `.gitignore` con `cuaderno.db*`.

```powershell
npm run db:generate
npm run db:migrate
```

Verificación: existe `.db` con 3 tablas (DB Browser o `drizzle-kit studio`).

### Fase 3 — Saldo inicial lunes (20 min)

GET muestra último o vacío (billetes, monedas, cuenta, notas; total vivo JS); POST valida ≥0, inserta/actualiza, redirect `/?ok=saldo`. Componente `FormSaldoInicial.astro`. Verificación: ej. 500 + 120.50 + 800 → `/` muestra efectivo 620.50 y persiste al recargar.

### Fase 4 — Movimientos mar/mié/jue (30 min)

`registrar.astro` + `FormMovimiento` + `TablaMovimientos`. POST valida (fecha ∈ DIAS, enums, concepto, monto >0 ≤1M), bloquea día cerrado, redirect con `?fecha=`. Eliminar POST con confirm. Verificación: mar22 ingreso ef 350 “Almuerzos” + gasto ef 120 “Pollo” + ingreso cuenta 200 → neto ef +230 / cuenta +200.

### Fase 5 — Cálculos + Tablero (30 min)

`calculos.ts` (fórmulas A.4); `index.astro` server-side con inicial + 3 `ResumenDia` + tabla + diferencias. Bordes: sin inicial (banner), sin movs (ceros), sin cierres (“pendiente”). Verificación: cuadra a mano; sin datos no rompe.

### Fase 6 — Cierre diario (25 min)

`cierre.astro` + `FormCierre`: selector fecha, calculado lectura, contado, diferencia viva (verde/rojo), POST upsert, observación obligatoria si ≠0. Verificación: contado=calculado → 0 verde; +10 → rojo + exige observación.

### Fase 7 — Exports CSV + PDF (25 min)

`api/export.csv.ts` (BOM, `;`, 4 secciones, attachment); botón print + CSS + firmas; enlace CSV en `/`. Verificación: Excel legible; preview ≤2 páginas.

### Fase 8 — Pulido + respaldo + calidad (15 + 15 min)

`seed-demo.mjs` (+`--clear-demo`, solo pruebas), `.gitignore`, `README.md` (correr, respaldar, qué no hacer). Checklist A.8 en vivo.

```powershell
npm run build; npm run preview
Copy-Item .\cuaderno.db .\respaldo\cuaderno-2026-09-21.db
```

Verificación: `preview` OK, respaldo restaura, README claro.

### Fase 8b — Auditoría Clean Code + tests mínimos (15 min)

Objetivo: que la Demo 1 cumpla la skill instalada `clean-code-principles` (`C:\Users\juan2\.agents\skills\clean-code-principles`, v1.0.2) sin sobrediseñar (YAGNI: es una app de 3 días).

1. **Auditoría:** revisar el código contra reglas CRÍTICAS (SOLID + Core) y anotar hallazgos con formato `archivo:línea - [regla] descripción`.
2. **Tests mínimos con Vitest** (solo lógica pura, no UI): `npm i -D vitest`, script `"test": "vitest run"`, archivo `tests/calculos.test.ts` con casos: neto ef/cta por día, acumulado mar→jue, diferencia 0 y ≠0, movimientos vacíos → 0, redondeo a 2 decimales.
3. Verificación: `npm test` en verde + 0 hallazgos CRÍTICOS abiertos (o listados como deuda aceptada).

## A.7b Calidad — SOLID + Clean Code + tests (skill instalada)

Skill: `clean-code-principles` v1.0.2 (1.6K installs, MIT) en `C:\Users\juan2\.agents\skills\clean-code-principles`.
Instalar verificado con `npx skills add asyrafhussin/agent-skills@clean-code-principles -g -y`.
Reglas aplicables a ESTE proyecto (solo las que aportan; resto = YAGNI):

| Regla | Aplicación concreta en el Cuaderno |
|---|---|
| `solid-srp` | `calculos.ts` solo calcula (no lee DB ni renderiza); `db/index.ts` solo conecta; cada `.astro` solo su página. Si `index.astro` empieza a sumar montos inline → extraer a `calculos.ts`. |
| `solid-dip` + `pattern-repository` | Las páginas NO usan `better-sqlite3` directo: pasan por funciones de `src/db/` (ej: `getMovimientos(fecha)`, `saveCierre(...)`). Así se podría cambiar SQLite→Postgres sin tocar páginas. |
| `solid-ocp` | `CATEGORIAS`/`DIAS` como constantes en `const.ts`: agregar una categoría no debe exigir editar validaciones en 3 archivos. |
| `core-dry` | Una sola `formatPEN`, un solo `escapeCsv`, una sola función de validación de movimiento compartida por `/registrar` y tests. Cero SQL copiado: agregados solo en `calculos.ts`. |
| `core-kiss` / `core-yagni` | Nada de auth, roles, paginación, `.xlsx` ni abstracciones “por si acaso”. Si una función supera ~30 líneas o un archivo mezcla DB+cálculo+HTML → dividir (KISS). |
| `name-meaningful` | Nombres de dominio: `efectivo_contado` vs `efectivo_calculado` (nunca `val1/val2`); `diferencia_ef` con signo contado−calculado documentado. |
| `func-small` / `func-no-side-effects` | Funciones de cálculo puras (mismo input → mismo output, sin escribir DB); los POST son los únicos con efectos. |

**Tests (mínimos, proporcionales a 3 días de uso):**

- `tests/calculos.test.ts` (Vitest): neto por medio/día, acumulado, diferencia, vacío→0, redondeo.
- E2E = checklist manual A.8 (no Playwright en Demo 1: YAGNI).
- Hallazgos de auditoría con formato de la skill: `src/lib/calculos.ts:12 - [core-dry] agregación duplicada`.

**Skills evaluadas y descartadas:** `uncle-bob-craft` (143 installs, solapa con la elegida), `vitest-testing` (1.1K, útil si los tests crecen en Demo 2).

---

## A.8 Comandos clave / aceptación / riesgos / pendientes

**Comandos (PowerShell):**

```powershell
cd "D:\MyProjects\Cuaderno de cuentas"
npm run dev
npm run db:generate
npm run db:migrate
npm run build; npm run preview
Copy-Item .\cuaderno.db .\respaldo\cuaderno-2026-09-21.db
```

**Aceptación Demo 1:**

- [ ] `dev` abre 4 rutas.
- [ ] Saldo inicial visible en `/`.
- [ ] Movimientos mar22 → neto ef +230 / cuenta +200.
- [ ] Cierre 0 verde / ≠0 rojo + observación.
- [ ] CSV abre en Excel con 4 secciones.
- [ ] Print limpio ≤2 páginas con firmas.
- [ ] Día cerrado bloquea movimientos.
- [ ] Copia del `.db` restaura datos.
- [ ] `npm test` en verde (`tests/calculos.test.ts`).
- [ ] Auditoría clean-code sin hallazgos CRÍTICOS (o deuda listada con regla citada).

**Riesgos:** `better-sqlite3` en Windows (prebuilds; fallback `node:sqlite`); `drizzle-kit` + path con espacios (comillas; fallback SQL directo); Astro 5 adapter (fijar versiones + probar build); fecha errónea (select cerrado); pérdida `.db` (respaldo diario).

**Pendientes (no bloquean):** S/ con céntimos, CSV `;` OK, nombre `cuaderno-cuentas`.

*Fin. Este documento es la única fuente de verdad; cambios de alcance (xlsx, auth, nube) van a Demo 2. Siguiente acción: confirmar F0 OK y autorizar F1.*
