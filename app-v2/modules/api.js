// ============================================
// API.JS - Cliente HTTP con protecciones empresariales
// ============================================
// Módulo: Cliente HTTP
// Responsabilidad: Manejar todas las requests a N8N con protecciones
// Complejidad: ⭐⭐ Media
// Dependencias: config.js, utils.js, diagnostics.js

import { CONFIG, buildEndpointUrl, getTimeoutForEndpoint } from '@modules/config.js';
import { retry, delay } from '@modules/utils.js';
import { info, warn, error, logRequest, logResponse } from '@modules/diagnostics.js';

// ============================================
// REQUEST QUEUE - Rate Limiting
// ============================================

/**
 * Cola de requests para limitar concurrencia
 */
class RequestQueue {
    constructor(maxConcurrent = 5) {
        this.queue = [];
        this.active = 0;
        this.maxConcurrent = maxConcurrent;
    }

    /**
     * Agrega una request a la cola y la ejecuta cuando hay espacio
     * @param {Function} requestFn - Función que retorna una Promise
     * @returns {Promise} Resultado de la request
     */
    async add(requestFn) {
        // Esperar hasta que haya espacio
        while (this.active >= this.maxConcurrent) {
            await delay(CONFIG.rateLimit.queueDelay);
        }

        this.active++;
        try {
            return await requestFn();
        } finally {
            this.active--;
        }
    }
}

// Instancia global de la cola
const requestQueue = new RequestQueue(CONFIG.rateLimit.maxConcurrent);

// ============================================
// CIRCUIT BREAKER
// ============================================

/**
 * Estados del Circuit Breaker
 */
const CircuitState = {
    CLOSED: 'CLOSED',   // Funcionando normally
    OPEN: 'OPEN',       // Fallando, rechaza requests
    HALF_OPEN: 'HALF_OPEN' // Probando si recuperó
};

/**
 * Circuit Breaker para prevenir fallos en cascada
 */
class CircuitBreaker {
    constructor(config) {
        this.state = CircuitState.CLOSED;
        this.failureCount = 0;
        this.successCount = 0;
        this.lastFailureTime = null;
        this.requestCount = 0; // Para calcular porcentaje
        this.config = config;
    }

    /**
     * Ejecuta una función a través del circuit breaker
     * @param {Function} fn - Función a ejecutar
     * @returns {Promise} Resultado de la función
     */
    async execute(fn) {
        this.requestCount++;

        // Si está OPEN, verificar si puede pasar a HALF_OPEN
        if (this.state === CircuitState.OPEN) {
            const timeSinceLastFailure = Date.now() - this.lastFailureTime;

            if (timeSinceLastFailure >= this.config.recoveryTimeout) {
                this.state = CircuitState.HALF_OPEN;
                info('🔄 Circuit Breaker: HALF_OPEN - Probando recuperación');
            } else {
                const error = new Error('Circuit Breaker is OPEN - rejecting requests');
                error.code = 'CIRCUIT_BREAKER_OPEN';
                throw error;
            }
        }

        try {
            const result = await fn();
            this.onSuccess();
            return result;
        } catch (err) {
            this.onFailure();
            throw err;
        }
    }

    /**
     * Maneja éxito de una request
     */
    onSuccess() {
        this.failureCount = 0;

        if (this.state === CircuitState.HALF_OPEN) {
            this.successCount++;
            info(`✅ Circuit Breaker: Request exitosa en HALF_OPEN (${this.successCount}/3)`);

            // Después de 3 éxitos consecutivos, cerrar el circuito
            if (this.successCount >= 3) {
                this.state = CircuitState.CLOSED;
                this.successCount = 0;
                info('🟢 Circuit Breaker: CLOSED - Recuperación completa');
            }
        }
    }

    /**
     * Maneja fallo de una request
     */
    onFailure() {
        this.failureCount++;
        this.lastFailureTime = Date.now();

        const failurePercentage = (this.failureCount / this.requestCount) * 100;

        // Verificar si debemos abrir el circuito
        if (this.failureCount >= this.config.failureThreshold ||
            failurePercentage >= this.config.failurePercentageThreshold) {

            if (this.state !== CircuitState.OPEN) {
                this.state = CircuitState.OPEN;
                error(`⚠️ Circuit Breaker: OPEN después de ${this.failureCount} fallos (${failurePercentage.toFixed(1)}%)`);
            }
        }
    }

    /**
     * Obtiene el estado actual
     * @returns {Object} Estado del circuit breaker
     */
    getState() {
        return {
            state: this.state,
            failureCount: this.failureCount,
            requestCount: this.requestCount,
            lastFailureTime: this.lastFailureTime
        };
    }

    /**
     * Reinicia el circuit breaker
     */
    reset() {
        this.state = CircuitState.CLOSED;
        this.failureCount = 0;
        this.successCount = 0;
        this.lastFailureTime = null;
        this.requestCount = 0;
        info('🔄 Circuit Breaker: Reset manual');
    }
}

// Instancia global del circuit breaker
const circuitBreaker = new CircuitBreaker(CONFIG.circuitBreaker);

// ============================================
// CACHE HTTP SIMPLE
// ============================================

/**
 * Cache simple en memoria para responses HTTP
 */
class HTTPCache {
    constructor() {
        this.cache = new Map();
        this.maxSize = CONFIG.cache.maxSize;
    }

    /**
     * Genera key para el cache
     * @param {string} endpoint - Endpoint
     * @param {Object} params - Parámetros
     * @returns {string} Key del cache
     */
    generateKey(endpoint, params) {
        const paramString = JSON.stringify(params);
        return `${endpoint}:${paramString}`;
    }

    /**
     * Obtiene del cache si no ha expirado
     * @param {string} endpoint - Endpoint
     * @param {Object} params - Parámetros
     * @param {number} ttl - TTL en ms
     * @returns {any|null} Data cacheada o null
     */
    get(endpoint, params, ttl) {
        const key = this.generateKey(endpoint, params);
        const cached = this.cache.get(key);

        if (!cached) return null;

        const age = Date.now() - cached.timestamp;

        if (age > ttl) {
            this.cache.delete(key);
            return null;
        }

        return cached.data;
    }

    /**
     * Guarda en cache
     * @param {string} endpoint - Endpoint
     * @param {Object} params - Parámetros
     * @param {any} data - Datos a cachear
     */
    set(endpoint, params, data) {
        // LRU: Si el cache está lleno, borrar el más antiguo
        if (this.cache.size >= this.maxSize) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }

        const key = this.generateKey(endpoint, params);
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
    }

    /**
     * Limpia todo el cache
     */
    clear() {
        this.cache.clear();
        info('🧹 HTTP Cache limpiado');
    }

    /**
     * Obtiene estadísticas del cache
     * @returns {Object} Estadísticas
     */
    getStats() {
        return {
            size: this.cache.size,
            maxSize: this.maxSize,
            keys: Array.from(this.cache.keys())
        };
    }
}

// Instancia global del cache HTTP
const httpCache = new HTTPCache();

// ============================================
// FUNCIÓN PRINCIPAL DE FETCH
// ============================================

/**
 * Realiza una request HTTP a N8N con todas las protecciones
 * @param {string} endpoint - Nombre del endpoint
 * @param {Object} options - Opciones de la request
 * @returns {Promise} Response de la API
 */
async function fetchData(endpoint, options = {}) {
    const {
        method = 'GET',
        params = {},
        body = null,
        useCache = CONFIG.cache.enabled,
        useRetry = CONFIG.retry.enabled,
        useCircuitBreaker = CONFIG.circuitBreaker.enabled,
        timeout = getTimeoutForEndpoint(endpoint)
    } = options;

    // Construir URL completa
    const url = buildEndpointUrl(endpoint, params);

    // Verificar cache primero (solo para GET)
    if (method === 'GET' && useCache) {
        const ttl = CONFIG.cache.endpointTTLs[endpoint] || CONFIG.cache.defaultTTL;
        const cached = httpCache.get(endpoint, params, ttl);

        if (cached) {
            info(`💾 Cache HIT: ${endpoint}`);
            return cached;
        } else {
            info(`❌ Cache MISS: ${endpoint}`);
        }
    }

    // Función que realiza la request HTTP
    const requestFn = async () => {
        logRequest(method, url, { timeout });

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    ...(body && { 'Content-Type': 'application/json' })
                },
                body: body ? JSON.stringify(body) : null,
                signal: controller.signal
            });

            clearTimeout(timeoutId);
            logResponse(method, url, response);

            // Verificar si la respuesta es exitosa
            if (!response.ok) {
                const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
                error.status = response.status;
                error.code = response.status;
                throw error;
            }

            // Parsear JSON con validación
            const text = await response.text();

            if (!text || text.trim() === '') {
                warn(`⚠️ Respuesta vacía: ${endpoint}`);
                return null;
            }

            try {
                const data = JSON.parse(text);

                // Guardar en cache (solo para GET exitoso)
                if (method === 'GET' && useCache && data) {
                    httpCache.set(endpoint, params, data);
                    info(`💾 Guardado en cache: ${endpoint}`);
                }

                return data;
            } catch (parseError) {
                error(new Error(`JSON parse error en ${endpoint}: ${parseError.message}`));
                return null;
            }

        } catch (fetchError) {
            clearTimeout(timeoutId);

            // Manejar timeout
            if (fetchError.name === 'AbortError') {
                const timeoutError = new Error(`Timeout after ${timeout}ms`);
                timeoutError.code = 'TIMEOUT';
                throw timeoutError;
            }

            throw fetchError;
        }
    };

    // Ejecutar con o sin circuit breaker
    if (useCircuitBreaker) {
        return circuitBreaker.execute(requestFn);
    } else {
        return requestFn();
    }
}

/**
 * Wrapper de fetchData con retry logic
 * @param {string} endpoint - Endpoint
 * @param {Object} options - Opciones
 * @returns {Promise} Response con reintentos
 */
async function fetchDataWithRetry(endpoint, options = {}) {
    if (!options.useRetry) {
        return fetchData(endpoint, options);
    }

    return retry(async () => {
        return await fetchData(endpoint, options);
    }, CONFIG.retry);
}

/**
 * Fetch genérico a cualquier URL (no solo N8N)
 * @param {string} url - URL completa
 * @param {Object} options - Opciones de fetch
 * @returns {Promise} Response
 */
async function fetchDataGeneric(url, options = {}) {
    const {
        method = 'GET',
        body = null,
        timeout = CONFIG.fetchTimeout
    } = options;

    logRequest(method, url, { timeout });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: body ? JSON.stringify(body) : null,
            signal: controller.signal
        });

        clearTimeout(timeoutId);
        logResponse(method, url, response);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const text = await response.text();

        if (!text || text.trim() === '') {
            return null;
        }

        return JSON.parse(text);

    } catch (fetchError) {
        clearTimeout(timeoutId);

        if (fetchError.name === 'AbortError') {
            throw new Error(`Timeout after ${timeout}ms`);
        }

        throw fetchError;
    }
}

// ============================================
// FUNCIONES UTILITARIAS
// ============================================

/**
 * Limpia el cache HTTP
 */
function clearCache() {
    httpCache.clear();
}

/**
 * Obtiene estadísticas del cache
 * @returns {Object} Estadísticas
 */
function getCacheStats() {
    return httpCache.getStats();
}

/**
 * Obtiene estado del circuit breaker
 * @returns {Object} Estado
 */
function getCircuitBreakerState() {
    return circuitBreaker.getState();
}

/**
 * Resetea el circuit breaker
 */
function resetCircuitBreaker() {
    circuitBreaker.reset();
}

/**
 * Obtiene estadísticas de la cola de requests
 * @returns {Object} Estadísticas
 */
function getQueueStats() {
    return {
        active: requestQueue.active,
        maxConcurrent: requestQueue.maxConcurrent,
        queued: requestQueue.queue.length
    };
}

// ============================================
// EXPORTAR
// ============================================

export {
    fetchData,
    fetchDataWithRetry,
    fetchDataGeneric,
    clearCache,
    getCacheStats,
    getCircuitBreakerState,
    resetCircuitBreaker,
    getQueueStats,
    CircuitState,
    requestQueue,
    circuitBreaker,
    httpCache
};
