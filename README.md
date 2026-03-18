# 🚀 Microbits V2 - Dashboard Docentes Modular

**Versión**: 2.0 (Refactorizado)
**Estado**: En desarrollo - Fase 2: Módulos Core (Completada)
**Fecha de inicio**: 2026-03-18
**Última actualización**: 2026-03-18

---

## 📋 ¿Qué es este proyecto?

Esta es la **versión refactorizada** de Interfaz Microbits, construida desde cero con una arquitectura modular moderna.

### 🎯 Objetivo

Transformar el código monolítico original (un solo archivo de 3,200 líneas) en una arquitectura modular escalable y mantenible.

### 🔄 Código Original

La versión original está en: [interfaz-microbits](https://github.com/Alejomartinez1731/interfaz-microbits)

---

## 🏗️ Arquitectura Modular

```
Microbits-V2/
├── README.md              (Este archivo)
├── .gitignore            (Ignorados: node_modules, dist, .env)
├── app-v2/               (Aplicación modular)
│   ├── index.html        (HTML con importmap - PUNTO DE ENTRADA)
│   ├── main.js           (Entry point - inicialización)
│   ├── test-modules.html (Tests automatizados de módulos)
│   ├── styles.css        (Estilos - copiado del original)
│   └── modules/          (Módulos ES6)
│       ├── ✅ config.js           (78 líneas) - Configuración N8N
│       ├── ✅ state.js            (264 líneas) - Estado global
│       ├── ✅ utils.js            (292 líneas) - Funciones helper puras
│       ├── ✅ diagnostics.js      (311 líneas) - Sistema de logging
│       ├── ✅ dom.js              (403 líneas) - Cache de selectores DOM
│       ├── 📝 api.js              (Pendiente) - Cliente HTTP
│       ├── 📝 data-normalizer.js  (Pendiente) - Normalización de datos
│       ├── 📝 data-loader.js      (Pendiente) - Carga de datos
│       ├── 📝 navigation.js       (Pendiente) - Navegación
│       ├── 📝 charts.js           (Pendiente) - Gráficos Chart.js
│       ├── 📝 metrics.js          (Pendiente) - KPIs interactivos
│       ├── 📝 table-renderer.js   (Pendiente) - Renderizado de tablas
│       ├── 📝 calendar.js         (Pendiente) - Calendario y eventos
│       └── 📝 events.js           (Pendiente) - CRUD de eventos
└── REFACTOR_PLAN.md      (Plan detallado de refactorización)
```

---

## 📦 Módulos (15 módulos planificados)

### ✅ Fase 2 COMPLETADA - Módulos Core (5/5)

| Módulo | Responsabilidad | Líneas | Complejidad | Estado |
|--------|-----------------|--------|-------------|--------|
| ✅ config.js | Configuración N8N y constantes | 78 | ⭐ Fácil | **COMPLETADO** |
| ✅ state.js | Estado global con getters/setters | 264 | ⭐ Fácil | **COMPLETADO** |
| ✅ utils.js | Funciones helper puras (sin side effects) | 292 | ⭐ Fácil | **COMPLETADO** |
| ✅ diagnostics.js | Sistema de logging estructurado | 311 | ⭐ Fácil | **COMPLETADO** |
| ✅ dom.js | Cache de selectores DOM + helpers | 403 | ⭐ Fácil | **COMPLETADO** |

**Total líneas de código**: 1,348 líneas (módulos core)

---

### 📝 Fase 3 PENDIENTE - Módulos de Datos (0/3)

| Módulo | Responsabilidad | Estimado | Complejidad | Estado |
|--------|-----------------|----------|-------------|--------|
| api.js | Cliente HTTP con timeout y errores | ~250 | ⭐⭐ Media | 📝 Pendiente |
| data-normalizer.js | Normalización de datos N8N | ~150 | ⭐⭐ Media | 📝 Pendiente |
| data-loader.js | Carga de datos de cursos/dashboard | ~400 | ⭐⭐ Media | 📝 Pendiente |

**Tiempo estimado**: 6-8 horas

---

### 📝 Fase 4 PENDIENTE - Módulos de UI (0/4)

| Módulo | Responsabilidad | Estimado | Complejidad | Estado |
|--------|-----------------|----------|-------------|--------|
| navigation.js | Navegación home ↔ dashboard | ~100 | ⭐ Fácil | 📝 Pendiente |
| table-renderer.js | Renderizado de 4 tipos de tablas | ~300 | ⭐⭐ Media | 📝 Pendiente |
| charts.js | Inicialización de gráficos Chart.js | ~200 | ⭐⭐ Media | 📝 Pendiente |
| metrics.js | KPIs interactivos con detalles | ~450 | ⭐⭐⭐ Difícil | 📝 Pendiente |

**Tiempo estimado**: 8-10 horas

---

### 📝 Fase 5 PENDIENTE - Módulos Complejos (0/2)

| Módulo | Responsabilidad | Estimado | Complejidad | Estado |
|--------|-----------------|----------|-------------|--------|
| calendar.js | Calendario mensual con festivos | ~700 | ⭐⭐⭐⭐ Muy difícil | 📝 Pendiente |
| events.js | CRUD completo de eventos | ~550 | ⭐⭐⭐⭐ Muy difícil | 📝 Pendiente |

**Tiempo estimado**: 12-15 horas

---

## 🚀 Progreso de Desarrollo

### ✅ Fase 1: Setup Inicial (COMPLETADA)
- [x] Crear repositorio en GitHub
- [x] Clonar repositorio localmente
- [x] Crear estructura de carpetas (app-v2/modules/)
- [x] Crear .gitignore
- [x] Crear README.md
- [x] Copiar styles.css del original
- [x] Crear index.html con importmap
- [x] Crear main.js (entry point)
- [x] Test de estructura básica

### ✅ Fase 2: Módulos Core (COMPLETADA)
- [x] config.js - Configuración N8N
- [x] state.js - Estado global
- [x] utils.js - Funciones helper
- [x] diagnostics.js - Logging estructurado
- [x] dom.js - Cache de selectores DOM
- [x] Test de todos los módulos core (test-modules.html)

### 📝 Fase 3: Módulos de Datos (PENDIENTE - 6-8h)
- [ ] api.js - Cliente HTTP
- [ ] data-normalizer.js - Normalización
- [ ] data-loader.js - Carga de datos

### 📝 Fase 4: Módulos de UI (PENDIENTE - 8-10h)
- [ ] navigation.js - Navegación
- [ ] table-renderer.js - Tablas
- [ ] charts.js - Gráficos
- [ ] metrics.js - KPIs

### 📝 Fase 5: Módulos Complejos (PENDIENTE - 12-15h)
- [ ] calendar.js - Calendario
- [ ] events.js - Eventos

### 📝 Fase 6: Integración Final (PENDIENTE - 5-8h)
- [ ] Conectar todos los módulos
- [ ] Testing exhaustivo
- [ ] Bug fixes y optimización
- [ ] Documentación final

---

## 🛠️ Tecnologías

- **Frontend**: Vanilla JavaScript (ES6+)
- **Modules**: ES6 Modules con importmap (sin bundler)
- **Gráficos**: Chart.js 4.4.1
- **Backend**: N8N Workflows
- **Deploy**: Vercel (serverless functions)
- **Development**: http-server (Node.js)

---

## 🧪 Testing

### Tests Automatizados

El archivo `test-modules.html` contiene tests automatizados que verifican:

1. **config.js**: Carga de configuración, endpoints, valores correctos
2. **state.js**: Getters/setters, manipulación de estado
3. **utils.js**: Funciones helper (capitalizeFirst, formatearFecha, etc.)
4. **diagnostics.js**: Logging, creación de loggers personalizados
5. **dom.js**: Cache DOM, funciones helper (show/hide/setText/etc.)

### Cómo ejecutar los tests:

```bash
# Iniciar servidor de desarrollo
cd app-v2
npx http-server -p 8080

# Abrir en navegador
http://localhost:8080/test-modules.html
```

**Resultado esperado**: 5/5 tests pasados ✅

---

## 📖 Documentación

- [Plan de Refactorización Completo](REFACTOR_PLAN.md) - Plan detallado de 6 fases
- [Repo Original](https://github.com/Alejomartinez1731/interfaz-microbits) - Código monolítico original

---

## 📊 Métricas de Progreso

### Código creado hasta ahora:
- **Módulos completados**: 5 de 15 (33%)
- **Líneas de código**: ~1,348 líneas
- **Funciones exportadas**: ~70 funciones
- **Tiempo invertido**: ~3-4 horas

### Proyecto original:
- **Módulos**: 1 archivo monolítico
- **Líneas de código**: ~3,200 líneas
- **Funciones**: 63 funciones

**Progreso actual**: 42% del código total refactorizado (5 de 15 módulos)

---

## 🎯 Próximos Pasos Inmediatos

### Fase 3: Módulos de Datos

1. **api.js** (2 horas estimadas)
   - `fetchData(endpoint, params)` - Request genérico a N8N
   - `fetchDataGeneric(url)` - Request a URL genérica
   - Manejo de timeouts (15s)
   - Parse robusto de JSON (maneja respuestas vacías)
   - Logging de requests/responses

2. **data-normalizer.js** (1.5 horas estimadas)
   - `normalizarDatos(rawData)` - Normaliza respuestas de N8N
   - `calcularContadorDesdePreguntas(preguntas)` - Calcula contador
   - Validación de datos

3. **data-loader.js** (3 horas estimadas)
   - `cargarCursos()` - Carga lista de cursos
   - `cargarTodosDatos(cursoId)` - Carga todos los datos del dashboard
   - `cargarDatosEjemplo()` - Fallback a datos de ejemplo
   - Manejo de errores y fallbacks

---

## 📝 Notas Técnicas

### Import Maps

Usamos **importmap** para resolver módulos ES6 sin necesidad de bundlers:

```html
<script type="importmap">
{
    "imports": {
        "@modules/config.js": "./modules/config.js",
        "@modules/state.js": "./modules/state.js",
        ...
    }
}
</script>
```

Esto permite usar imports limpios:

```javascript
import { CONFIG } from '@modules/config.js';
import { getState } from '@modules/state.js';
```

### Ventajas de esta arquitectura:

1. ✅ **Sin build step** - Desarrollo más rápido
2. ✅ **Módulos ES6 nativos** - Soporte estándar del navegador
3. ✅ **Separación de responsabilidades** - Código más mantenible
4. ✅ **Testing por módulo** - Tests más fáciles de escribir
5. ✅ **Escalabilidad** - Fácil agregar nuevos módulos

---

## 👤 Autor

**Alejandro Martínez** - 2026

Licencia: MIT
