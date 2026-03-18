// ============================================
// UTILS.JS - Funciones helper (utilities)
// ============================================
// Módulo: Utilidades
// Responsabilidad: Funciones helper puras (sin side effects)
// Complejidad: ⭐ Fácil
// Dependencias: Ninguna

// ============================================
// FUNCIONES DE TEXTO
// ============================================

/**
 * Capitaliza la primera letra de un texto
 * @param {string} texto - Texto a capitalizar
 * @returns {string} Texto con primera letra mayúscula
 */
function capitalizeFirst(texto) {
    if (!texto) return '';
    return texto.charAt(0).toUpperCase() + texto.slice(1);
}

/**
 * Capitaliza todas las palabras de un texto
 * @param {string} texto - Texto a capitalizar
 * @returns {string} Texto con todas las palabras capitalizadas
 */
function capitalizeWords(texto) {
    if (!texto) return '';
    return texto.split(' ').map(word => capitalizeFirst(word)).join(' ');
}

/**
 * Trunca un texto a una longitud máxima
 * @param {string} texto - Texto a truncar
 * @param {number} longitud - Longitud máxima
 * @returns {string} Texto truncado con "..." si excede
 */
function truncarTexto(texto, longitud) {
    if (!texto) return '';
    return texto.length > longitud ? texto.substring(0, longitud) + '...' : texto;
}

/**
 * Escapa caracteres especiales HTML
 * @param {string} texto - Texto a escapar
 * @returns {string} Texto escapado
 */
function escaparHTML(texto) {
    if (!texto) return '';
    const div = document.createElement('div');
    div.textContent = texto;
    return div.innerHTML;
}

/**
 * Genera un slug a partir de un texto
 * @param {string} texto - Texto a convertir
 * @returns {string} Slug generado
 */
function generateSlug(texto) {
    if (!texto) return '';
    return texto
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remover acentos
        .replace(/[^a-z0-9\s-]/g, '') // Remover caracteres especiales
        .trim()
        .replace(/\s+/g, '-') // Espacios a guiones
        .replace(/-+/g, '-'); // Múltiples guiones a uno
}

/**
 * Genera un ID único
 * @returns {string} ID único
 */
function generarId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// ============================================
// FUNCIONES DE FECHA
// ============================================

/**
 * Formatea una fecha a formato legible
 * @param {Date|string} fecha - Fecha a formatear
 * @returns {string} Fecha formateada: "DD/MM/YYYY HH:MM"
 */
function formatearFecha(fecha) {
    if (!fecha) return '-';

    const date = fecha instanceof Date ? fecha : new Date(fecha);

    if (isNaN(date.getTime())) return '-';

    const dia = String(date.getDate()).padStart(2, '0');
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    const año = date.getFullYear();
    const horas = String(date.getHours()).padStart(2, '0');
    const minutos = String(date.getMinutes()).padStart(2, '0');

    return `${dia}/${mes}/${año} ${horas}:${minutos}`;
}

/**
 * Formatea una fecha a formato corto (solo fecha)
 * @param {Date|string} fecha - Fecha a formatear
 * @returns {string} Fecha formateada: "DD/MM/YYYY"
 */
function formatearFechaCorta(fecha) {
    if (!fecha) return '-';

    const date = fecha instanceof Date ? fecha : new Date(fecha);

    if (isNaN(date.getTime())) return '-';

    const dia = String(date.getDate()).padStart(2, '0');
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    const año = date.getFullYear();

    return `${dia}/${mes}/${año}`;
}

/**
 * Formatea una fecha a formato ISO (YYYY-MM-DD)
 * @param {Date|string} fecha - Fecha a formatear
 * @returns {string} Fecha en formato ISO
 */
function formatearFechaISO(fecha) {
    if (!fecha) return '';

    const date = fecha instanceof Date ? fecha : new Date(fecha);

    if (isNaN(date.getTime())) return '';

    const año = date.getFullYear();
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    const dia = String(date.getDate()).padStart(2, '0');

    return `${año}-${mes}-${dia}`;
}

/**
 * Obtiene el nombre del mes
 * @param {number} mes - Mes (0-11)
 * @returns {string} Nombre del mes en español
 */
function obtenerNombreMes(mes) {
    const meses = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return meses[mes] || '';
}

/**
 * Obtiene el nombre del día de la semana
 * @param {number} dia - Día (0-6, 0=Domingo)
 * @returns {string} Nombre del día en español
 */
function obtenerNombreDia(dia) {
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return dias[dia] || '';
}

/**
 * Calcula la diferencia relativa entre dos fechas
 * @param {Date} fecha - Fecha a comparar
 * @returns {string} Diferencia relativa (ej: "hace 5 minutos")
 */
function fechaRelativa(fecha) {
    if (!fecha) return '-';

    const now = new Date();
    const date = fecha instanceof Date ? fecha : new Date(fecha);
    const diff = now - date;

    const segundos = Math.floor(diff / 1000);
    const minutos = Math.floor(segundos / 60);
    const horas = Math.floor(minutos / 60);
    const dias = Math.floor(horas / 24);

    if (segundos < 60) return 'ahora mismo';
    if (minutos < 60) return `hace ${minutos} minuto${minutos !== 1 ? 's' : ''}`;
    if (horas < 24) return `hace ${horas} hora${horas !== 1 ? 's' : ''}`;
    if (dias < 7) return `hace ${dias} día${dias !== 1 ? 's' : ''}`;
    return formatearFechaCorta(date);
}

// ============================================
// FUNCIONES MATEMÁTICAS
// ============================================

/**
 * Calcula el porcentaje
 * @param {number} valor - Valor
 * @param {number} total - Total
 * @param {number} decimales - Decimales a mostrar (default: 1)
 * @returns {string} Porcentaje formateado
 */
function calcularPorcentaje(valor, total, decimales = 1) {
    if (!total || total === 0) return '0.0%';
    return ((valor / total) * 100).toFixed(decimales) + '%';
}

/**
 * Calcula el porcentaje como número
 * @param {number} valor - Valor
 * @param {number} total - Total
 * @returns {number} Porcentaje como número (0-100)
 */
function calcularPorcentajeNum(valor, total) {
    if (!total || total === 0) return 0;
    return (valor / total) * 100;
}

/**
 * Clampa un número entre un mínimo y máximo
 * @param {number} valor - Valor a clamp
 * @param {number} min - Mínimo
 * @param {number} max - Máximo
 * @returns {number} Valor clamped
 */
function clamp(valor, min, max) {
    return Math.min(Math.max(valor, min), max);
}

/**
 * Genera un número aleatorio entre min y max
 * @param {number} min - Mínimo
 * @param {number} max - Máximo
 * @returns {number} Número aleatorio
 */
function random(min, max) {
    return Math.random() * (max - min) + min;
}

/**
 * Genera un número entero aleatorio entre min y max
 * @param {number} min - Mínimo
 * @param {number} max - Máximo
 * @returns {number} Entero aleatorio
 */
function randomInt(min, max) {
    return Math.floor(random(min, max + 1));
}

// ============================================
// FUNCIONES DE ARRAY/OBJETO
// ============================================

/**
 * Verifica si un objeto está vacío
 * @param {Object} obj - Objeto a verificar
 * @returns {boolean} True si está vacío
 */
function isEmpty(obj) {
    if (!obj) return true;
    if (Array.isArray(obj)) return obj.length === 0;
    if (typeof obj === 'object') return Object.keys(obj).length === 0;
    return !obj;
}

/**
 * Hace un deep copy de un objeto
 * @param {Object} obj - Objeto a copiar
 * @returns {Object} Copia del objeto
 */
function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

/**
 * Agrupa un array por una propiedad
 * @param {Array} array - Array a agrupar
 * @param {string} propiedad - Propiedad por la cual agrupar
 * @returns {Object} Objeto agrupado
 */
function agruparPor(array, propiedad) {
    return array.reduce((acc, item) => {
        const key = item[propiedad];
        if (!acc[key]) acc[key] = [];
        acc[key].push(item);
        return acc;
    }, {});
}

/**
 * Ordena un array de objetos por una propiedad
 * @param {Array} array - Array a ordenar
 * @param {string} propiedad - Propiedad por la cual ordenar
 * @param {string} orden - 'asc' o 'desc'
 * @returns {Array} Array ordenado
 */
function ordenarPor(array, propiedad, orden = 'asc') {
    return [...array].sort((a, b) => {
        const valA = a[propiedad];
        const valB = b[propiedad];

        if (valA < valB) return orden === 'asc' ? -1 : 1;
        if (valA > valB) return orden === 'asc' ? 1 : -1;
        return 0;
    });
}

/**
 * Filtra un array por un término de búsqueda
 * @param {Array} array - Array a filtrar
 * @param {string} termino - Término de búsqueda
 * @param {Array} propiedades - Propiedades a buscar
 * @returns {Array} Array filtrado
 */
function filtrarPor(array, termino, propiedades = []) {
    if (!termino) return array;

    const terminoLower = termino.toLowerCase();

    return array.filter(item => {
        if (propiedades.length === 0) {
            // Buscar en todas las propiedades
            return Object.values(item).some(val =>
                String(val).toLowerCase().includes(terminoLower)
            );
        } else {
            // Buscar solo en las propiedades especificadas
            return propiedades.some(prop =>
                String(item[prop]).toLowerCase().includes(terminoLower)
            );
        }
    });
}

/**
 * Chunk de un array en arrays más pequeños
 * @param {Array} array - Array a dividir
 * @param {number} tamaño - Tamaño de cada chunk
 * @returns {Array} Array de arrays
 */
function chunk(array, tamaño) {
    const chunks = [];
    for (let i = 0; i < array.length; i += tamaño) {
        chunks.push(array.slice(i, i + tamaño));
    }
    return chunks;
}

/**
 * Obtiene valores únicos de un array
 * @param {Array} array - Array a procesar
 * @param {string} propiedad - Propiedad para obtener únicos (opcional)
 * @returns {Array} Array con valores únicos
 */
function unique(array, propiedad = null) {
    if (propiedad) {
        return [...new Set(array.map(item => item[propiedad]))];
    }
    return [...new Set(array)];
}

// ============================================
// FUNCIONES DE DEBOUNCE/THROTTLE
// ============================================

/**
 * Debounce - Ejecuta una función solo después de dejar de llamarla
 * @param {Function} func - Función a debouncear
 * @param {number} wait - Tiempo de espera (ms)
 * @returns {Function} Función debounceda
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle - Ejecuta una función como máximo una vez por intervalo
 * @param {Function} func - Función a throttlear
 * @param {number} wait - Intervalo de tiempo (ms)
 * @returns {Function} Función throttled
 */
function throttle(func, wait) {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, wait);
        }
    };
}

/**
 * Retry logic - Reintenta una función con backoff exponencial
 * @param {Function} func - Función a reintentar
 * @param {Object} options - Opciones de retry
 * @returns {Promise} Promise con el resultado
 */
async function retry(func, options = {}) {
    const {
        maxRetries = 3,
        initialBackoff = 1000,
        backoffFactor = 2,
        maxBackoff = 10000
    } = options;

    let lastError;
    let backoff = initialBackoff;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await func();
        } catch (error) {
            lastError = error;

            if (attempt === maxRetries) {
                throw lastError;
            }

            // Esperar con backoff exponencial
            await new Promise(resolve => setTimeout(resolve, backoff));
            backoff = Math.min(backoff * backoffFactor, maxBackoff);
        }
    }

    throw lastError;
}

// ============================================
// FUNCIONES DE VALIDACIÓN
// ============================================

/**
 * Valida un email
 * @param {string} email - Email a validar
 * @returns {boolean} True si es válido
 */
function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

/**
 * Valida una URL
 * @param {string} url - URL a validar
 * @returns {boolean} True si es válida
 */
function isValidURL(url) {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

/**
 * Valida una fecha
 * @param {Date|string} fecha - Fecha a validar
 * @returns {boolean} True si es válida
 */
function isValidDate(fecha) {
    const date = fecha instanceof Date ? fecha : new Date(fecha);
    return !isNaN(date.getTime());
}

/**
 * Valida que un número esté en un rango
 * @param {number} valor - Valor a validar
 * @param {number} min - Mínimo
 * @param {number} max - Máximo
 * @returns {boolean} True si está en rango
 */
function isInRange(valor, min, max) {
    return valor >= min && valor <= max;
}

// ============================================
// FUNCIONES DE FORMATO
// ============================================

/**
 * Formatea bytes a formato legible
 * @param {number} bytes - Bytes a formatear
 * @returns {string} Bytes formateados
 */
function formatearBytes(bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const tamaños = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + tamaños[i];
}

/**
 * Formatea un número con separadores de miles
 * @param {number} numero - Número a formatear
 * @returns {string} Número formateado
 */
function formatearNumero(numero) {
    return new Intl.NumberFormat('es-ES').format(numero);
}

/**
 * Formatea una moneda
 * @param {number} cantidad - Cantidad a formatear
 * @param {string} moneda - Moneda (default: EUR)
 * @returns {string} Cantidad formateada
 */
function formatearMoneda(cantidad, moneda = 'EUR') {
    return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: moneda
    }).format(cantidad);
}

// ============================================
// ALMACENAMIENTO LOCAL (LOCALSTORAGE HELPERS)
// ============================================

/**
 * Guarda un valor en localStorage
 * @param {string} key - Clave
 * @param {any} valor - Valor a guardar
 * @returns {boolean} True si se guardó correctamente
 */
function saveToLocalStorage(key, valor) {
    try {
        localStorage.setItem(key, JSON.stringify(valor));
        return true;
    } catch (error) {
        console.error('Error guardando en localStorage:', error);
        return false;
    }
}

/**
 * Obtiene un valor de localStorage
 * @param {string} key - Clave
 * @param {any} defaultValue - Valor por defecto si no existe
 * @returns {any} Valor almacenado o defaultValue
 */
function getFromLocalStorage(key, defaultValue = null) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error('Error leyendo de localStorage:', error);
        return defaultValue;
    }
}

/**
 * Elimina un valor de localStorage
 * @param {string} key - Clave
 * @returns {boolean} True si se eliminó correctamente
 */
function removeFromLocalStorage(key) {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (error) {
        console.error('Error eliminando de localStorage:', error);
        return false;
    }
}

/**
 * Limpia todos los valores de localStorage de la app
 * @param {string} prefix - Prefijo de las claves a limpiar
 * @returns {boolean} True si se limpió correctamente
 */
function clearLocalStorage(prefix = 'microbits_') {
    try {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith(prefix)) {
                localStorage.removeItem(key);
            }
        });
        return true;
    } catch (error) {
        console.error('Error limpiando localStorage:', error);
        return false;
    }
}

// ============================================
// FUNCIONES DE PERFORMANCE
// ============================================

/**
 * Mide el tiempo de ejecución de una función
 * @param {Function} func - Función a medir
 * @returns {Promise} Promise con {result, time}
 */
async function measureTime(func) {
    const start = performance.now();
    const result = await func();
    const end = performance.now();
    return {
        result,
        time: end - start
    };
}

/**
 * Delay/Sleep
 * @param {number} ms - Milisegundos a esperar
 * @returns {Promise} Promise que se resuelve después del delay
 */
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Ejecuta funciones en paralelo con límite de concurrencia
 * @param {Array<Function>} funcs - Array de funciones a ejecutar
 * @param {number} concurrency - Límite de concurrencia
 * @returns {Promise<Array>>} Promise con resultados
 */
async function parallel(funcs, concurrency = 5) {
    const results = [];
    const executing = [];

    for (const func of funcs) {
        const promise = func().then(result => {
            executing.splice(executing.indexOf(promise), 1);
            return result;
        });

        results.push(promise);
        executing.push(promise);

        if (executing.length >= concurrency) {
            await Promise.race(executing);
        }
    }

    return Promise.all(results);
}

// Exportar todas las funciones
export {
    // Texto
    capitalizeFirst,
    capitalizeWords,
    truncarTexto,
    escaparHTML,
    generateSlug,
    generarId,

    // Fecha
    formatearFecha,
    formatearFechaCorta,
    formatearFechaISO,
    obtenerNombreMes,
    obtenerNombreDia,
    fechaRelativa,

    // Matemáticas
    calcularPorcentaje,
    calcularPorcentajeNum,
    clamp,
    random,
    randomInt,

    // Array/Objeto
    isEmpty,
    deepClone,
    agruparPor,
    ordenarPor,
    filtrarPor,
    chunk,
    unique,

    // Debounce/Throttle
    debounce,
    throttle,
    retry,

    // Validación
    isValidEmail,
    isValidURL,
    isValidDate,
    isInRange,

    // Formato
    formatearBytes,
    formatearNumero,
    formatearMoneda,

    // LocalStorage
    saveToLocalStorage,
    getFromLocalStorage,
    removeFromLocalStorage,
    clearLocalStorage,

    // Performance
    measureTime,
    delay,
    parallel
};
