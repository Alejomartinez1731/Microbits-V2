// ============================================
// DIAGNOSTICS.JS - Sistema de logging estructurado
// ============================================
// Módulo: Diagnósticos y logging
// Responsabilidad: Proporcionar logging estructurado para debugging
// Complejidad: ⭐ Fácil
// Dependencias: Ninguna

/**
 * Niveles de log
 */
const LogLevel = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
    NONE: 4
};

/**
 * Configuración de logging
 */
const logConfig = {
    nivelActual: LogLevel.INFO, // Por defecto INFO
    habilitado: true,
    mostrarTimestamp: true,
    prefijo: '🔍 Microbits V2'
};

/**
 * Colores para consola
 */
const colores = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

/**
 * Formatea el timestamp actual
 * @returns {string} Timestamp formateado
 */
function getTimestamp() {
    const now = new Date();
    return now.toISOString().replace('T', ' ').substring(0, 19);
}

/**
 * Formatea el mensaje de log
 * @param {string} nivel - Nivel de log
 * @param {string} mensaje - Mensaje
 * @param {Array} args - Argumentos adicionales
 * @returns {string} Mensaje formateado
 */
function formatearMensaje(nivel, mensaje, args) {
    let parts = [];

    if (logConfig.mostrarTimestamp) {
        parts.push(`${colores.dim}[${getTimestamp()}]${colores.reset}`);
    }

    parts.push(`${colores.bright}${nivel}${colores.reset}`);
    parts.push(mensaje);

    const mensajeFormateado = parts.join(' ');

    if (args.length > 0) {
        return [mensajeFormateado, ...args];
    }

    return mensajeFormateado;
}

/**
 * Log de nivel DEBUG
 * @param {string} mensaje - Mensaje a loggear
 * @param {...any} args - Argumentos adicionales
 */
function debug(mensaje, ...args) {
    if (!logConfig.habilitado || logConfig.nivelActual > LogLevel.DEBUG) return;
    console.log(...formatearMensaje(`${colores.cyan}[DEBUG]${colores.reset}`, mensaje, args));
}

/**
 * Log de nivel INFO
 * @param {string} mensaje - Mensaje a loggear
 * @param {...any} args - Argumentos adicionales
 */
function info(mensaje, ...args) {
    if (!logConfig.habilitado || logConfig.nivelActual > LogLevel.INFO) return;
    console.info(...formatearMensaje(`${colores.blue}[INFO]${colores.reset}`, mensaje, args));
}

/**
 * Log de nivel WARN
 * @param {string} mensaje - Mensaje a loggear
 * @param {...any} args - Argumentos adicionales
 */
function warn(mensaje, ...args) {
    if (!logConfig.habilitado || logConfig.nivelActual > LogLevel.WARN) return;
    console.warn(...formatearMensaje(`${colores.yellow}[WARN]${colores.reset}`, mensaje, args));
}

/**
 * Log de nivel ERROR
 * @param {string} mensaje - Mensaje a loggear
 * @param {Error|any} error - Error o dato adicional
 * @param {...any} args - Argumentos adicionales
 */
function error(mensaje, error, ...args) {
    if (!logConfig.habilitado || logConfig.nivelActual > LogLevel.ERROR) return;

    console.error(...formatearMensaje(`${colores.red}[ERROR]${colores.reset}`, mensaje, []));

    if (error instanceof Error) {
        console.error(`${colores.red}  Mensaje: ${colores.reset}${error.message}`);
        console.error(`${colores.red}  Stack: ${colores.reset}`, error.stack);
    } else if (error) {
        console.error(`${colores.red}  Detalles: ${colores.reset}`, error);
    }

    if (args.length > 0) {
        console.error(`${colores.red}  Contexto: ${colores.reset}`, ...args);
    }
}

/**
 * Log de éxito
 * @param {string} mensaje - Mensaje a loggear
 * @param {...any} args - Argumentos adicionales
 */
function success(mensaje, ...args) {
    if (!logConfig.habilitado || logConfig.nivelActual > LogLevel.INFO) return;
    console.log(...formatearMensaje(`${colores.green}[✅]${colores.reset}`, mensaje, args));
}

/**
 * Inicia un grupo de logs
 * @param {string} titulo - Título del grupo
 */
function group(titulo) {
    if (!logConfig.habilitado) return;
    console.group(`${logConfig.prefijo} - ${titulo}`);
}

/**
 * Inicia un grupo de logs colapsado
 * @param {string} titulo - Título del grupo
 */
function groupCollapsed(titulo) {
    if (!logConfig.habilitado) return;
    console.groupCollapsed(`${logConfig.prefijo} - ${titulo}`);
}

/**
 * Cierra el grupo de logs actual
 */
function groupEnd() {
    if (!logConfig.habilitado) return;
    console.groupEnd();
}

/**
 * Log de una tabla
 * @param {Array|Object} data - Datos a mostrar como tabla
 */
function table(data) {
    if (!logConfig.habilitado) return;
    console.table(data);
}

/**
 * Mide el tiempo de ejecución
 * @param {string} label - Etiqueta del timer
 */
function time(label) {
    if (!logConfig.habilitado) return;
    console.time(`${logConfig.prefijo} - ${label}`);
}

/**
 * Finaliza y muestra el tiempo de ejecución
 * @param {string} label - Etiqueta del timer
 */
function timeEnd(label) {
    if (!logConfig.habilitado) return;
    console.timeEnd(`${logConfig.prefijo} - ${label}`);
}

/**
 * Establece el nivel de log
 * @param {string} nivel - Nivel de log ('debug', 'info', 'warn', 'error', 'none')
 */
function setNivelLog(nivel) {
    const niveles = {
        'debug': LogLevel.DEBUG,
        'info': LogLevel.INFO,
        'warn': LogLevel.WARN,
        'error': LogLevel.ERROR,
        'none': LogLevel.NONE
    };

    const nuevoNivel = niveles[nivel.toLowerCase()];
    if (nuevoNivel !== undefined) {
        logConfig.nivelActual = nuevoNivel;
        info(`Nivel de log cambiado a: ${nivel.toUpperCase()}`);
    }
}

/**
 * Habilita o deshabilita el logging
 * @param {boolean} habilitado - True para habilitar
 */
function setHabilitado(habilitado) {
    logConfig.habilitado = habilitado;
}

/**
 * Log de traza de función (para debugging de flujo)
 * @param {string} nombreFuncion - Nombre de la función
 * @param {Object} params - Parámetros de la función
 */
function trace(nombreFuncion, params = {}) {
    if (!logConfig.habilitado || logConfig.nivelActual > LogLevel.DEBUG) return;
    debug(`→ Entrando: ${nombreFuncion}`, params);
}

/**
 * Log de retorno de función
 * @param {string} nombreFuncion - Nombre de la función
 * @param {any} resultado - Resultado de la función
 */
function traceReturn(nombreFuncion, resultado) {
    if (!logConfig.habilitado || logConfig.nivelActual > LogLevel.DEBUG) return;
    debug(`← Saliendo: ${nombreFuncion}`, resultado);
}

/**
 * Log de un request HTTP
 * @param {string} metodo - Método HTTP
 * @param {string} url - URL del request
 * @param {Object} options - Opciones del request
 */
function logRequest(metodo, url, options = {}) {
    if (!logConfig.habilitado || logConfig.nivelActual > LogLevel.DEBUG) return;
    debug(`HTTP ${metodo}`, { url, ...options });
}

/**
 * Log de una respuesta HTTP
 * @param {string} metodo - Método HTTP
 * @param {string} url - URL del request
 * @param {Response} response - Respuesta HTTP
 */
function logResponse(metodo, url, response) {
    if (!logConfig.habilitado || logConfig.nivelActual > LogLevel.DEBUG) return;
    const status = response.ok ? '✅' : '❌';
    debug(`HTTP ${metodo} ${status}`, { url, status: response.status, statusText: response.statusText });
}

/**
 * Crea un logger con un prefijo específico
 * @param {string} prefijo - Prefijo para el logger
 * @returns {Object} Logger con prefijo
 */
function createLogger(prefijo) {
    return {
        debug: (mensaje, ...args) => debug(`[${prefijo}] ${mensaje}`, ...args),
        info: (mensaje, ...args) => info(`[${prefijo}] ${mensaje}`, ...args),
        warn: (mensaje, ...args) => warn(`[${prefijo}] ${mensaje}`, ...args),
        error: (mensaje, error, ...args) => error(`[${prefijo}] ${mensaje}`, error, ...args),
        success: (mensaje, ...args) => success(`[${prefijo}] ${mensaje}`, ...args)
    };
}

// Exportar funciones y configuración
export {
    LogLevel,
    logConfig,
    debug,
    info,
    warn,
    error,
    success,
    group,
    groupCollapsed,
    groupEnd,
    table,
    time,
    timeEnd,
    setNivelLog,
    setHabilitado,
    trace,
    traceReturn,
    logRequest,
    logResponse,
    createLogger
};
