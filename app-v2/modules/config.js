// ============================================
// CONFIG.JS - Configuración de la aplicación
// ============================================
// Módulo: Configuración
// Responsabilidad: Almacenar constantes y endpoints de N8N
// Complejidad: ⭐ Fácil
// Dependencias: Ninguna

// Detectar si estamos en localhost
const isLocalhost = window.location.hostname === 'localhost' ||
                    window.location.hostname === '127.0.0.1';

/**
 * Configuración principal de la aplicación
 * Incluye rate limiting, caching, retry logic y circuit breaker
 */
const CONFIG = {
    // ============================================
    // CONFIGURACIÓN DE API
    // ============================================

    // Base URL para endpoints de N8N
    // En localhost usa http://localhost:3000/webhook (proxy server)
    // En producción usa /api/n8n (Vercel serverless functions)
    baseUrl: isLocalhost ? 'http://localhost:3000/webhook' : '/api/n8n',

    // Endpoints de N8N para diferentes operaciones
    endpoints: {
        // Estudiantes
        estudiantes: '/dashboard-estudiantes',
        toggleEstudiante: '/toggle-estudiante',

        // Preguntas
        preguntas: '/dashboard-preguntas',

        // Temas
        temas: '/dashboard-temas',

        // Contador
        contador: '/dashboard-contador',

        // Cursos
        cursos: '/dashboard-cursos',

        // Eventos/Calendario
        eventosGuardar: '/Guardar-Evento',
        eventosListar: '/obtener-eventos',
        eventosEliminar: '/Eliminar-evento'
    },

    // ============================================
    // RATE LIMITING - Protección contra spam
    // ============================================

    rateLimit: {
        // Máximo de requests concurrentes
        maxConcurrent: 5,

        // Requests por minuto (para no saturar N8N)
        requestsPerMinute: 30,

        // Requests por segundo (burst limit)
        requestsPerSecond: 5,

        // Tiempo de espera entre requests en cola (ms)
        queueDelay: 100,

        // Enable/disable rate limiting
        enabled: true
    },

    // ============================================
    // RETRY LOGIC - Reintentos con backoff
    // ============================================

    retry: {
        // Número máximo de reintentos
        maxRetries: 3,

        // Tiempo inicial de backoff (ms)
        initialBackoff: 1000,

        // Factor de backoff (exponential)
        backoffFactor: 2,

        // Tiempo máximo de backoff (ms)
        maxBackoff: 10000,

        // Status codes que triggering retry
        retryableStatusCodes: [408, 429, 500, 502, 503, 504],

        // Enable/disable retry logic
        enabled: true
    },

    // ============================================
    // CIRCUIT BREAKER - Protección contra fallos en cascada
    // ============================================

    circuitBreaker: {
        // Número de fallos antes de abrir el circuito
        failureThreshold: 5,

        // Tiempo para esperar antes de intentar cerrar el circuito (ms)
        recoveryTimeout: 60000, // 1 minuto

        // Porcentaje de fallos para abrir el circuito
        failurePercentageThreshold: 50,

        // Ventana de tiempo para calcular porcentaje de fallos (ms)
        statsWindow: 30000, // 30 segundos

        // Enable/disable circuit breaker
        enabled: true
    },

    // ============================================
    // CACHE - Reducir requests innecesarias
    // ============================================

    cache: {
        // TTL por defecto para caché (ms)
        defaultTTL: 300000, // 5 minutos

        // TTL específicos por endpoint (ms)
        endpointTTLs: {
            cursos: 600000, // 10 minutos (cambian rara vez)
            estudiantes: 60000, // 1 minuto
            preguntas: 120000, // 2 minutos
            temas: 300000, // 5 minutos
            contador: 30000, // 30 segundos
            eventos: 60000 // 1 minuto
        },

        // Tamaño máximo del caché (número de entradas)
        maxSize: 100,

        // Enable/disable cache
        enabled: true
    },

    // ============================================
    // TIMEOUTS
    // ============================================

    // Tiempo de espera para requests (ms)
    fetchTimeout: 15000, // 15 segundos

    // Tiempo de espera para requests específicos (ms)
    timeouts: {
        default: 15000,
        cursos: 10000,
        estudiantes: 10000,
        preguntas: 15000,
        temas: 10000,
        contador: 8000,
        eventos: 12000
    },

    // ============================================
    // UI & PAGINACIÓN
    // ============================================

    // Items por página en tablas
    itemsPerPage: 10,

    // Debounce time para búsqueda (ms)
    searchDebounce: 300,

    // Throttle time para scroll events (ms)
    scrollThrottle: 100,

    // ============================================
    // GRÁFICOS CHART.JS
    // ============================================

    chartColors: {
        primary: '#00d4ff',
        secondary: '#ff6b9d',
        tertiary: '#ffd93d',
        quaternary: '#6bcb77',
        background: 'rgba(0, 212, 255, 0.1)',
        grid: 'rgba(255, 255, 255, 0.1)',
        text: '#ffffff'
    },

    // Configuración de animación de gráficos
    chartAnimation: {
        duration: 1000,
        easing: 'easeInOutQuart'
    },

    // ============================================
    // PERSISTENCIA - LocalStorage
    // ============================================

    storage: {
        // Claves para localStorage
        keys: {
            cursoActual: 'microbits_curso_actual',
            datosCache: 'microbits_datos_cache',
            cacheTimestamp: 'microbits_cache_timestamp',
            userPreferences: 'microbits_user_prefs'
        },

        // TTL para persistencia (ms)
        persistenceTTL: 86400000, // 24 horas

        // Enable/disable localStorage
        enabled: true
    },

    // ============================================
    // LOGGING & DIAGNÓSTICS
    // ============================================

    logging: {
        // Nivel de log (0=DEBUG, 1=INFO, 2=WARN, 3=ERROR, 4=NONE)
        level: isLocalhost ? 0 : 2, // Debug en local, Warning en prod

        // Enable/disable logging
        enabled: true,

        // Enable/disable remote logging (para producción)
        remoteLogging: false,

        // Endpoint para remote logging (futuro)
        remoteLogEndpoint: '/api/logs'
    },

    // ============================================
    // FEATURE FLAGS
    // ============================================

    features: {
        // Habilitar cache de datos
        dataCaching: true,

        // Habilitar persistencia en localStorage
        persistence: true,

        // Habilitar métricas interactivas
        interactiveMetrics: true,

        // Habilitar animaciones
        animations: true,

        // Modo desarrollo (muestra más info en consola)
        debugMode: isLocalhost
    },

    // ============================================
    // VALIDACIONES
    // ============================================

    validation: {
        // Tamaño mínimo de búsqueda
        minSearchLength: 2,

        // Máximo de retries en toggle de estudiante
        maxToggleRetries: 2,

        // Timeout para operaciones interactivas
        interactiveTimeout: 5000
    },

    // ============================================
    // CALIDAD DE SERVICIO (QoS)
    // ============================================

    qos: {
        // Prioridad de endpoints (mayor número = mayor prioridad)
        endpointPriority: {
            toggleEstudiante: 10, // Más prioritario
            cursos: 8,
            contador: 6,
            estudiantes: 5,
            preguntas: 4,
            temas: 3,
            eventos: 2
        },

        // Timeout máximo para cualquier operación
        maxOperationTime: 30000 // 30 segundos
    }
};

// ============================================
// HELPERS DE CONFIGURACIÓN
// ============================================

/**
 * Obtiene la URL completa para un endpoint
 * @param {string} endpoint - Nombre del endpoint
 * @param {Object} params - Parámetros de query
 * @returns {string} URL completa
 */
function buildEndpointUrl(endpoint, params = {}) {
    const basePath = CONFIG.baseUrl + CONFIG.endpoints[endpoint];
    const queryString = new URLSearchParams(params).toString();
    return queryString ? `${basePath}?${queryString}` : basePath;
}

/**
 * Obtiene el timeout para un endpoint específico
 * @param {string} endpoint - Nombre del endpoint
 * @returns {number} Timeout en ms
 */
function getTimeoutForEndpoint(endpoint) {
    return CONFIG.timeouts[endpoint] || CONFIG.timeouts.default;
}

/**
 * Obtiene el TTL de cache para un endpoint
 * @param {string} endpoint - Nombre del endpoint
 * @returns {number} TTL en ms
 */
function getCacheTTL(endpoint) {
    return CONFIG.cache.endpointTTLs[endpoint] || CONFIG.cache.defaultTTL;
}

/**
 * Verifica si un endpoint está habilitado
 * @param {string} endpoint - Nombre del endpoint
 * @returns {boolean} True si está habilitado
 */
function isEndpointEnabled(endpoint) {
    return !!CONFIG.endpoints[endpoint];
}

/**
 * Verifica si una feature está habilitada
 * @param {string} feature - Nombre de la feature
 * @returns {boolean} True si está habilitada
 */
function isFeatureEnabled(feature) {
    return CONFIG.features[feature] === true;
}

// Exportar configuración y helpers
export {
    isLocalhost,
    CONFIG,
    buildEndpointUrl,
    getTimeoutForEndpoint,
    getCacheTTL,
    isEndpointEnabled,
    isFeatureEnabled
};
