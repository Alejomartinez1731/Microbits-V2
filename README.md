# 🚀 Microbits V2 - Dashboard Docentes Modular

**Versión**: 2.0 (Refactorizado)
**Estado**: En desarrollo - Fase 4: Módulos de UI (Completada)
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
│       ├── ✅ dom.js              (465 líneas) - Cache de selectores DOM
│       ├── ✅ api.js              (543 líneas) - Cliente HTTP
│       ├── ✅ data-normalizer.js  (468 líneas) - Normalización de datos
│       ├── ✅ data-loader.js      (385 líneas) - Carga de datos
│       ├── ✅ navigation.js       (183 líneas) - Navegación
│       ├── ✅ table-renderer.js   (506 líneas) - Renderizado de tablas
│       ├── ✅ charts.js           (310 líneas) - Gráficos Chart.js
│       ├── ✅ metrics.js          (527 líneas) - KPIs interactivos
│       ├── 📝 calendar.js         (Pendiente) - Calendario y eventos
│       └── 📝 events.js           (Pendiente) - CRUD de eventos
└── REFACTOR_PLAN.md      (Plan detallado de refactorización)
```

---

## 📦 Módulos (15 módulos planificados)

### ✅ Fase 2 COMPLETADA - Módulos Core (5/5)

| Módulo | Responsabilidad | Líneas | Complejidad | Estado |
|--------|-----------------|--------|-------------|--------|
| ✅ config.js | Configuración N8N y constantes | 350 | ⭐ Fácil | **COMPLETADO** |
| ✅ state.js | Estado global con getters/setters | 641 | ⭐ Fácil | **COMPLETADO** |
| ✅ utils.js | Funciones helper puras (sin side effects) | 713 | ⭐ Fácil | **COMPLETADO** |
| ✅ diagnostics.js | Sistema de logging estructurado | 311 | ⭐ Fácil | **COMPLETADO** |
| ✅ dom.js | Cache de selectores DOM + helpers | 448 | ⭐ Fácil | **COMPLETADO** |

**Total líneas de código**: 2,463 líneas (módulos core)

---

### ✅ Fase 3 COMPLETADA - Módulos de Datos (3/3)

| Módulo | Responsabilidad | Líneas | Complejidad | Estado |
|--------|-----------------|--------|-------------|--------|
| ✅ api.js | Cliente HTTP con protecciones | 543 | ⭐⭐ Media | **COMPLETADO** |
| ✅ data-normalizer.js | Normalización de datos N8N | 468 | ⭐⭐ Media | **COMPLETADO** |
| ✅ data-loader.js | Carga de datos con cache | 313 | ⭐⭐ Media | **COMPLETADO** |

**Total líneas de código**: 1,324 líneas (módulos de datos)

---

### ✅ Fase 4 COMPLETADA - Módulos de UI (4/4)

| Módulo | Responsabilidad | Líneas | Complejidad | Estado |
|--------|-----------------|--------|-------------|--------|
| ✅ navigation.js | Navegación home ↔ dashboard | 183 | ⭐ Fácil | **COMPLETADO** |
| ✅ table-renderer.js | Renderizado de 4 tipos de tablas | 506 | ⭐⭐ Media | **COMPLETADO** |
| ✅ charts.js | Inicialización de gráficos Chart.js | 310 | ⭐⭐ Media | **COMPLETADO** |
| ✅ metrics.js | KPIs interactivos con detalles | 527 | ⭐⭐⭐ Difícil | **COMPLETADO** |

**Total líneas de código**: 1,526 líneas (módulos de UI)

---

### 📝 Fase 5 PENDIENTE - Módulos de Datos (0/3)

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

### ✅ Fase 3: Módulos de Datos (COMPLETADA)
- [x] api.js - Cliente HTTP con protecciones
- [x] data-normalizer.js - Normalización de datos N8N
- [x] data-loader.js - Carga de datos con cache
- [x] Integración: Cursos cargan desde N8N al inicio
- [x] Integración: Click en curso → entra al dashboard

### ✅ Fase 4: Módulos de UI (COMPLETADA)
- [x] navigation.js - Navegación home ↔ dashboard
- [x] table-renderer.js - Tablas (estudiantes, preguntas, activos, temas)
- [x] charts.js - Gráficos Chart.js (temas, activos)
- [x] metrics.js - KPIs interactivos con paneles de detalle
- [x] Integración: Dashboard funcional con datos reales

### 📝 Fase 5: Módulos Complejos (PENDIENTE - 12-15h)
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
- **Módulos completados**: 12 de 15 (80%)
- **Líneas de código**: ~5,313 líneas
- **Funciones exportadas**: ~150+ funciones
- **Tiempo invertido**: ~8-10 horas

### Proyecto original:
- **Módulos**: 1 archivo monolítico
- **Líneas de código**: ~3,200 líneas
- **Funciones**: 63 funciones

**Progreso actual**: 80% del código total refactorizado (12 de 15 módulos)

---

## 🎯 Próximos Pasos Inmediatos

### Fase 4: Módulos de UI (8-10 horas)

1. **navigation.js** (1.5 horas)
   - `irAInicio()` - Volver a la home
   - `irADashboard(cursoId, cursoNombre)` - Entrar a un curso
   - Manejo de navegación home ↔ dashboard
   - Integración con state.js

2. **table-renderer.js** (2.5 horas)
   - `renderTablaGeneric()` - Renderizado genérico de tablas
   - `renderizarEstudiantes()` - Tabla de estudiantes
   - `renderizarPreguntas()` - Tabla de preguntas
   - `renderizarActivos()` - Tabla de estudiantes activos
   - `renderizarTemas()` - Tabla de temas
   - Paginación integrada

3. **charts.js** (2 horas)
   - `inicializarGraficoTemas()` - Gráfico de temas consultados
   - `inicializarGraficoActivos()` - Gráfico de estudiantes activos
   - Integración con Chart.js 4.4.1
   - Actualización dinámica de gráficos

4. **metrics.js** (3 horas)
   - `inicializarMetricasInteractivas()` - Setup de KPIs interactivos
   - `toggleDetalleMetrica()` - Panel de detalles
   - Cálculo y display de métricas
   - Integración con tablas y gráficos

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
