# 🏗️ ARQUITECTURA - Microbits V2

**Fecha**: 2026-03-18
**Versión**: 2.0
**Estado**: Fase 2 Completada (Módulos Core mejorados)

---

## 📋 ÍNDICE

1. [Principios Arquitectónicos](#principios-arquitectónicos)
2. [Protecciones Implementadas](#protecciones-implementadas)
3. [Rate Limiting & Circuit Breaker](#rate-limiting--circuit-breaker)
4. [Gestión de Estado](#gestión-de-estado)
5. [Caché y Persistencia](#caché-y-persistencia)
6. [Logging y Diagnostics](#logging-y-diagnostics)
7. [Mejoras de Performance](#mejoras-de-performance)

---

## 🎯 PRINCIPIOS ARQUITECTÓNICOS

### 1. **DEFENSIVE PROGRAMMING**
- Validación de TODAS las entradas
- Verificación de estado antes de cambios
- Manejo robusto de errores
- Fallbacks para casos extremos

### 2. **INMUTABILITY**
- El estado es inmutable desde el exterior
- Los getters devuelven copias (deep clone)
- Prevención de modificaciones accidentales
- Debugging más fácil (traceability)

### 3. **OBSERVABILITY**
- Logging estructurado en todos los módulos
- Métricas de uso (requests, errores)
- Trazabilidad de operaciones
- Debug mode en desarrollo

### 4. **PERFORMANCE FIRST**
- Debounce/throttle para operaciones costosas
- Cache inteligente con TTL
- Retry con exponential backoff
- Parallel execution con límite de concurrencia

### 5. **RESILIENCE**
- Rate limiting para no saturar N8N
- Circuit breaker para fallos en cascada
- Retry automático con backoff
- Graceful degradation

---

## 🛡️ PROTECCIONES IMPLEMENTADAS

### 1. RATE LIMITING

**Configuración en `config.js`:**
```javascript
rateLimit: {
    maxConcurrent: 5,        // Máximo de requests concurrentes
    requestsPerMinute: 30,   // Requests por minuto
    requestsPerSecond: 5,    // Requests por segundo (burst)
    queueDelay: 100,         // Delay entre requests en cola
    enabled: true
}
```

**Protege contra:**
- ❌ Saturación del servidor N8N
- ❌ Ban por rate limiting
- ❌ Spam de requests
- ❌ Agotamiento de recursos del navegador

### 2. RETRY LOGIC

**Configuración en `config.js`:**
```javascript
retry: {
    maxRetries: 3,              // Máximo de reintentos
    initialBackoff: 1000,       // 1 segundo inicial
    backoffFactor: 2,           // Exponential (2x, 4x, 8x)
    maxBackoff: 10000,          // Máximo 10 segundos
    retryableStatusCodes: [408, 429, 500, 502, 503, 504],
    enabled: true
}
```

**Función `retry()` en `utils.js`:**
```javascript
await retry(async () => {
    return await fetchData(endpoint);
}, CONFIG.retry);
```

**Protege contra:**
- ❌ Fallos de red temporales
- ❌ Timeout del servidor
- ❌ 429 Too Many Requests
- ❌ 500 Internal Server Error

### 3. CIRCUIT BREAKER

**Configuración en `config.js`:**
```javascript
circuitBreaker: {
    failureThreshold: 5,              // 5 fallos abre el circuito
    recoveryTimeout: 60000,           // 1 minuto antes de reintentar
    failurePercentageThreshold: 50,   // 50% de fallos
    statsWindow: 30000,               // 30 segundos de ventana
    enabled: true
}
```

**Protege contra:**
- ❌ Fallos en cascada
- ❌ Requests a un servidor caído
- ❌ Mal experiencia de usuario (loading eterno)
- ❌ Agotamiento de recursos

### 4. CACHE INTELIGENTE

**Configuración en `config.js`:**
```javascript
cache: {
    defaultTTL: 300000,              // 5 minutos
    endpointTTLs: {
        cursos: 600000,              // 10 minutos (cambian poco)
        estudiantes: 60000,          // 1 minuto
        preguntas: 120000,           // 2 minutos
        temas: 300000,               // 5 minutos
        contador: 30000,             // 30 segundos
        eventos: 60000               // 1 minuto
    },
    maxSize: 100,
    enabled: true
}
```

**Implementación en `state.js`:**
- `setCache(key, valor)` - Guarda en cache
- `getCache()` - Obtiene cache
- `clearCache()` - Limpia cache
- Persistencia automática en localStorage

**Beneficios:**
- ✅ Reduce carga en N8N
- ✅ Respuestas más rápidas
- ✅ Ahorro de ancho de banda
- ✅ Mejor UX

---

## 🚦 RATE LIMITING & CIRCUIT BREAKER

### IMPLEMENTACIÓN RECOMENDADA (Fase 3 - api.js)

Cuando se cree `api.js`, debe incluir:

```javascript
// Request Queue
class RequestQueue {
    constructor(maxConcurrent = 5) {
        this.queue = [];
        this.active = 0;
        this.maxConcurrent = maxConcurrent;
    }

    async add(requestFn) {
        while (this.active >= this.maxConcurrent) {
            await delay(100);
        }

        this.active++;
        try {
            return await requestFn();
        } finally {
            this.active--;
        }
    }
}

// Circuit Breaker
class CircuitBreaker {
    constructor(config) {
        this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
        this.failureCount = 0;
        this.lastFailureTime = null;
        this.config = config;
    }

    async execute(fn) {
        if (this.state === 'OPEN') {
            if (Date.now() - this.lastFailureTime > this.config.recoveryTimeout) {
                this.state = 'HALF_OPEN';
            } else {
                throw new Error('Circuit breaker is OPEN');
            }
        }

        try {
            const result = await fn();
            this.onSuccess();
            return result;
        } catch (error) {
            this.onFailure();
            throw error;
        }
    }

    onSuccess() {
        this.failureCount = 0;
        if (this.state === 'HALF_OPEN') {
            this.state = 'CLOSED';
        }
    }

    onFailure() {
        this.failureCount++;
        this.lastFailureTime = Date.now();

        if (this.failureCount >= this.config.failureThreshold) {
            this.state = 'OPEN';
            console.error('⚠️ Circuit breaker OPEN after', this.failureCount, 'failures');
        }
    }
}
```

---

## 💾 GESTIÓN DE ESTADO

### INMUTABILITY

**Problema resuelto:**
```javascript
// ❌ ANTES (mutable - peligroso)
state.datos.estudiantes.push(estudiante);
// Cualquiera puede modificar el estado directamente

// ✅ AHORA (inmutable - seguro)
const estudiantes = state.getDatos('estudiantes');
estudiantes.push(estudiante); // Esto NO afecta al estado real
state.setDatos('estudiantes', estudiantes); // Cambio explícito
```

**Implementación en `state.js`:**
```javascript
function getDatos(tipo) {
    return deepClone(appState.datos[tipo]); // Devuelve copia
}

function getState() {
    return Object.freeze(deepClone(appState)); // Congelado
}
```

### VALIDACIÓN DE ESTADO

**Protecciones en `state.js`:**
```javascript
function validateStateChange(key, valor) {
    if (key === 'cursoActual') {
        if (!valor.id || !valor.nombre) {
            console.warn('⚠️ Estado inválido');
            return false;
        }
    }

    if (key === 'tabActual') {
        const tabsValidas = ['estudiantes', 'preguntas', 'activos', 'temas'];
        if (!tabsValidas.includes(valor)) {
            console.warn('⚠️ Tab no válida');
            return false;
        }
    }

    return true;
}
```

### PERSISTENCIA

**LocalStorage en `state.js`:**
```javascript
// Guardado automático
function setCursoActual(id, nombre) {
    // ... validación ...
    appState.cursoActual = { id, nombre };
    persistState(); // Guarda en localStorage
}

// Restauración al iniciar
function initState() {
    restoreState(); // Recupera desde localStorage
}
```

---

## 🗄️ CACHÉ Y PERSISTENCIA

### CACHE DE DATOS

**En `state.js`:**
```javascript
// Cache con timestamp
cache: {
    cursos: null,
    timestamp: null
}

// Guardar cache
function setCache(key, valor) {
    appState.cache[key] = valor;
    appState.cache.timestamp = Date.now();
    saveToStorage('microbits_datos_cache', appState.cache);
}

// Usar cache (recomendado para api.js)
function getCacheWithTTL(key, ttl) {
    const cache = getCache();
    if (!cache.timestamp) return null;

    const age = Date.now() - cache.timestamp;
    if (age > ttl) {
        clearCache();
        return null;
    }

    return cache[key];
}
```

### LOCALSTORAGE HELPERS

**En `utils.js`:**
```javascript
// Guardar
saveToLocalStorage('microbits_curso_actual', curso);

// Obtener
const curso = getFromLocalStorage('microbits_curso_actual', null);

// Eliminar
removeFromLocalStorage('microbits_curso_actual');

// Limpiar todo
clearLocalStorage('microbits_');
```

---

## 📊 LOGGING Y DIAGNOSTICS

### NIVELES DE LOG

**En `diagnostics.js`:**
```javascript
const LogLevel = {
    DEBUG: 0,  // Desarrollo
    INFO: 1,   // Información general
    WARN: 2,   // Advertencias
    ERROR: 3,  // Errores
    NONE: 4    // Desactivado
};

// Configuración automática
logging: {
    level: isLocalhost ? 0 : 2, // Debug en local, Warning en prod
    enabled: true
}
```

### LOGGING ESTRUCTURADO

```javascript
// Trace de funciones
trace('nombreFuncion', params);
// → Entrando: nombreFuncion { ...params }

traceReturn('nombreFuncion', resultado);
// ← Saliendo: nombreFuncion { ...resultado }

// Logging de HTTP
logRequest('GET', '/webhook/endpoint', { timeout: 15000 });
logResponse('GET', '/webhook/endpoint', response);
```

### LOGGER PERSONALIZADO

```javascript
const logger = createLogger('MI-MODULO');
logger.info('Mensaje informativo');
logger.warn('Advertencia');
logger.error('Error', error);
```

---

## ⚡ MEJORAS DE PERFORMANCE

### DEBOUNCE & THROTTLE

**En `utils.js`:**
```javascript
// Debounce para búsqueda (evitar requests mientras escribe)
const debouncedSearch = debounce(searchFunction, 300);
input.addEventListener('input', debouncedSearch);

// Throttle para scroll (evitar demasiadas ejecuciones)
const throttledScroll = throttle(scrollHandler, 100);
window.addEventListener('scroll', throttledScroll);
```

### RETRY CON EXPONENTIAL BACKOFF

```javascript
// En utils.js
async function retry(func, options = {}) {
    const {
        maxRetries = 3,
        initialBackoff = 1000,
        backoffFactor = 2,
        maxBackoff = 10000
    } = options;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await func();
        } catch (error) {
            if (attempt === maxRetries) throw error;

            // Esperar: 1s, 2s, 4s, 8s (max 10s)
            await delay(backoff);
            backoff = Math.min(backoff * backoffFactor, maxBackoff);
        }
    }
}
```

### PARALLEL EXECUTION

```javascript
// En utils.js
async function parallel(funcs, concurrency = 5) {
    // Ejecuta funciones en paralelo con límite de concurrencia
    // Útil para cargar múltiples endpoints simultáneamente
}

// Ejemplo de uso:
const [estudiantes, preguntas, temas] = await parallel([
    () => fetchEstudiantes(),
    () => fetchPreguntas(),
    () => fetchTemas()
], 3); // Máximo 3 concurrentes
```

### PERFORMANCE MEASUREMENT

```javascript
// En utils.js
const { result, time } = await measureTime(async () => {
    return await cargarDatos();
});
console.log(`Operación tomó ${time}ms`);
```

---

## 📈 MÉTRICAS DE USO

**En `state.js`:**
```javascript
metrics: {
    requestCount: 0,          // Total de requests
    lastRequestTime: null,    // Último request (ISO)
    errorCount: 0             // Total de errores
}

// Tracking automático en api.js (fase 3)
function incrementRequestCount() {
    appState.metrics.requestCount++;
    appState.metrics.lastRequestTime = new Date().toISOString();
}

function incrementErrorCount() {
    appState.metrics.errorCount++;
}
```

---

## 🔒 SEGURIDAD

### VALIDACIÓN DE ENTRADA

```javascript
// En utils.js
isValidEmail(email);
isValidURL(url);
isValidDate(fecha);
isInRange(valor, min, max);
```

### ESCAPING DE HTML

```javascript
// En utils.js
escaparHTML(texto); // Previene XSS
```

---

## 🎨 PATRONES DE DISEÑO UTILIZADOS

1. **Singleton**: Estado global único
2. **Observer**: Logging de eventos
3. **Strategy**: Retry con diferentes backoff strategies
4. **Circuit Breaker**: Protección contra fallos
5. **Cache Manager**: Gestión de caché con TTL
6. **Repository**: Abstracción de datos (data-loader)
7. **Factory**: Creación de loggers personalizados

---

## 📦 MÓDULOS CORE MEJORADOS

### config.js (+272 líneas)
✅ Rate limiting configuration
✅ Retry logic con exponential backoff
✅ Circuit breaker configuration
✅ Cache configuration con TTL específicos
✅ Timeout configuration por endpoint
✅ Storage configuration (localStorage)
✅ Logging configuration
✅ Feature flags
✅ Validation rules
✅ Quality of Service (QoS)
✅ Helper functions: `buildEndpointUrl()`, `getTimeoutForEndpoint()`, `getCacheTTL()`

### state.js (+379 líneas)
✅ Inmutabilidad (getters devuelven copias)
✅ Persistencia en localStorage
✅ Validación de estado
✅ Cache integrado
✅ Métricas de uso (requestCount, errorCount)
✅ Export/Import de estado
✅ Funciones: `initState()`, `persistState()`, `restoreState()`, `resetState()`

### utils.js (+421 líneas)
✅ Debounce & Throttle
✅ Retry con exponential backoff
✅ Validadores (email, URL, fecha, rango)
✅ LocalStorage helpers
✅ Performance helpers (`measureTime()`, `delay()`, `parallel()`)
✅ Formateadores (número, moneda, bytes)
✅ Funciones de fecha relativa
✅ Chunk, unique, group by

### diagnostics.js (sin cambios - ya estaba completo)
✅ 5 niveles de log
✅ Logging estructurado
✅ Loggers personalizados
✅ Trace de funciones
✅ Performance measurement

### dom.js (sin cambios - ya estaba completo)
✅ Cache de selectores DOM
✅ Helper functions (show, hide, setText, etc.)
✅ Validación de DOM

---

## 📊 COMPARATIVO: ANTES vs DESPUÉS

| Aspecto | Antes | Después |
|---------|-------|---------|
| **Rate Limiting** | ❌ No existía | ✅ Configuración completa |
| **Retry Logic** | ❌ No existía | ✅ Con exponential backoff |
| **Circuit Breaker** | ❌ No existía | ✅ Configurado |
| **Cache** | ❌ No existía | ✅ Con TTL y persistencia |
| **Inmutabilidad** | ❌ Estado mutable | ✅ Estado inmutable |
| **Validación** | ❌ No existía | ✅ Validación de estado |
| **Persistencia** | ❌ No existía | ✅ LocalStorage |
| **Métricas** | ❌ No existía | ✅ Request/Errores tracking |
| **Logging** | ✅ Básico | ✅ Estructurado + trace |
| **Debounce/Throttle** | ❌ No existía | ✅ Implementados |
| **Validadores** | ❌ No existían | ✅ Email, URL, fecha |
| **Performance** | ⚠️ Sin optimizar | ✅ Parallel + measurement |

---

## 🚀 PRÓXIMOS PASOS (FASE 3)

### api.js - Cliente HTTP

Debe incluir:
1. ✅ Rate limiting (RequestQueue)
2. ✅ Retry con exponential backoff
3. ✅ Circuit Breaker
4. ✅ Cache integration
5. ✅ Timeout handling
6. ✅ Logging de requests/responses
7. ✅ Error handling robusto

### data-normalizer.js
- Validación de datos de N8N
- Normalización de formatos
- Sanitización de inputs

### data-loader.js
- Integración con api.js
- Cache logic
- Fallback a datos de ejemplo
- Error handling

---

## 📚 REFERENCIAS

- [Rate Limiting Best Practices](https://cloud.google.com/architecture/rate-limiting-strategies-techniques)
- [Circuit Breaker Pattern](https://martinfowler.com/bliki/CircuitBreaker.html)
- [Exponential Backoff](https://cloud.google.com/architecture/exponential-backoff)
- [Immutable State](https://en.wikipedia.org/wiki/Immutable_object)
- [Debouncing and Throttling](https://css-tricks.com/debouncing-throttling-explained-examples/)

---

## 👤 AUTOR

**Alejandro Martínez** - 2026

Licencia: MIT
