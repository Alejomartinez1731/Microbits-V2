// ============================================
// DATA-NORMALIZER.JS - Normalización de datos de N8N
// ============================================
// Módulo: Normalización de datos
// Responsabilidad: Normalizar y sanitizar datos recibidos de N8N
// Complejidad: ⭐⭐ Media
// Dependencias: diagnostics.js

import { debug, warn } from '@modules/diagnostics.js';

// ============================================
// NORMALIZACIÓN DE CAMPOS
// ============================================

/**
 * Normaliza un campo que puede venir en diferentes formatos
 * @param {Object} obj - Objeto con el campo
 * @param {Array<string>} keys - Posibles nombres del campo (en orden de prioridad)
 * @param {any} defaultValue - Valor por defecto
 * @returns {any} Valor normalizado
 */
function normalizeField(obj, keys, defaultValue = '') {
    if (!obj || typeof obj !== 'object') {
        return defaultValue;
    }

    for (const key of keys) {
        if (obj[key] !== undefined && obj[key] !== null && obj[key] !== '') {
            return obj[key];
        }
    }

    return defaultValue;
}

/**
 * Normaliza un campo de texto
 * @param {Object} obj - Objeto con el campo
 * @param {Array<string>} keys - Posibles nombres del campo
 * @param {string} defaultValue - Valor por defecto
 * @returns {string} Valor normalizado como string
 */
function normalizeString(obj, keys, defaultValue = '') {
    const value = normalizeField(obj, keys, defaultValue);
    return String(value).trim();
}

/**
 * Normaliza un campo booleano
 * @param {Object} obj - Objeto con el campo
 * @param {Array<string>} keys - Posibles nombres del campo
 * @param {boolean} defaultValue - Valor por defecto
 * @returns {boolean} Valor normalizado como boolean
 */
function normalizeBoolean(obj, keys, defaultValue = true) {
    const value = normalizeField(obj, keys, defaultValue);

    // Manejar diferentes representaciones de boolean
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value !== 0;
    if (typeof value === 'string') {
        const lower = value.toLowerCase();
        if (lower === 'true' || lower === 'yes' || lower === '1') return true;
        if (lower === 'false' || lower === 'no' || lower === '0') return false;
    }

    return defaultValue;
}

/**
 * Normaliza un campo numérico
 * @param {Object} obj - Objeto con el campo
 * @param {Array<string>} keys - Posibles nombres del campo
 * @param {number} defaultValue - Valor por defecto
 * @returns {number} Valor normalizado como number
 */
function normalizeNumber(obj, keys, defaultValue = 0) {
    const value = normalizeField(obj, keys, defaultValue);
    const num = Number(value);
    return isNaN(num) ? defaultValue : num;
}

// ============================================
// NORMALIZACIÓN DE ENTIDADES
// ============================================

/**
 * Normaliza un estudiante
 * @param {Object} est - Estudiante crudo
 * @returns {Object} Estudiante normalizado
 */
function normalizeEstudiante(est) {
    if (!est || typeof est !== 'object') {
        return {
            Nombre: '',
            Chat_id: '',
            habilitado: false
        };
    }

    return {
        Nombre: normalizeString(est, ['Nombre', 'nombre', 'name'], ''),
        Chat_id: normalizeString(est, ['Chat_id', 'chat_id', 'chatID'], ''),
        habilitado: normalizeBoolean(est, ['habilitado', 'enabled', 'activo'], true)
    };
}

/**
 * Normaliza un contador
 * @param {Object} cont - Contador crudo
 * @returns {Object} Contador normalizado
 */
function normalizeContador(cont) {
    if (!cont || typeof cont !== 'object') {
        return {
            Nombre: '',
            Chat_id: '',
            Contador: 0
        };
    }

    return {
        Nombre: normalizeString(cont, ['Nombre', 'nombre', 'name'], ''),
        Chat_id: normalizeString(cont, ['Chat_id', 'chat_id', 'chatID'], ''),
        Contador: normalizeNumber(cont, ['Contador', 'contador', 'count'], 0)
    };
}

/**
 * Normaliza una pregunta
 * @param {Object} preg - Pregunta cruda
 * @returns {Object} Pregunta normalizada
 */
function normalizePregunta(preg) {
    if (!preg || typeof preg !== 'object') {
        return {
            Nombre: '',
            Chat_id: '',
            'Preguntas Frecuentes': '',
            'Fecha de Pregunta': ''
        };
    }

    return {
        Nombre: normalizeString(preg, ['Nombre', 'nombre', 'name'], ''),
        Chat_id: normalizeString(preg, ['Chat_id', 'chat_id', 'chatID'], ''),
        'Preguntas Frecuentes': normalizeString(
            preg,
            ['Preguntas Frecuentes', 'Pregunta', 'pregunta', 'question'],
            ''
        ),
        'Fecha de Pregunta': normalizeString(
            preg,
            ['Fecha de Pregunta', 'fecha', 'Fecha', 'date', 'timestamp'],
            ''
        )
    };
}

/**
 * Normaliza un tema
 * @param {Object} tema - Tema crudo
 * @returns {Object} Tema normalizado
 */
function normalizeTema(tema) {
    if (!tema || typeof tema !== 'object') {
        return {
            Nombre: '',
            Chat_id: '',
            Tema: ''
        };
    }

    return {
        Nombre: normalizeString(tema, ['Nombre', 'nombre', 'name'], ''),
        Chat_id: normalizeString(tema, ['Chat_id', 'chat_id', 'chatID'], ''),
        Tema: String(normalizeField(tema, ['Tema', 'tema', 'topic'], ''))
    };
}

/**
 * Normaliza un curso
 * @param {Object} curso - Curso crudo
 * @returns {Object} Curso normalizado
 */
function normalizeCurso(curso) {
    if (!curso || typeof curso !== 'object') {
        return {
            id: '',
            nombre: 'Curso sin nombre',
            nivel: 'Activo',
            estudiantesHabilitados: 0
        };
    }

    return {
        id: normalizeString(curso, ['id', 'nombre', 'nombre_curso'], 'unknown'),
        nombre: normalizeString(curso, ['nombre', 'nombre_curso', 'curso'], 'Curso sin nombre'),
        nivel: normalizeString(curso, ['nivel', 'Nivel'], 'Activo'),
        estudiantesHabilitados: normalizeNumber(
            curso,
            ['estudiantesHabilitados', 'totalEstudiantes', 'alumnos', 'Alumnos'],
            0
        )
    };
}

// ============================================
// NORMALIZACIÓN DE COLECCIONES
// ============================================

/**
 * Normaliza un array de estudiantes
 * @param {Array} estudiantes - Array de estudiantes crudos
 * @returns {Array} Array de estudiantes normalizados
 */
function normalizeEstudiantes(estudiantes) {
    if (!Array.isArray(estudiantes)) {
        warn('⚠️ normalizeEstudiantes: input no es array');
        return [];
    }

    return estudiantes.map(normalizeEstudiante);
}

/**
 * Normaliza un array de contadores
 * @param {Array} contadores - Array de contadores crudos
 * @returns {Array} Array de contadores normalizados
 */
function normalizeContadores(contadores) {
    if (!Array.isArray(contadores)) {
        warn('⚠️ normalizeContadores: input no es array');
        return [];
    }

    return contadores.map(normalizeContador);
}

/**
 * Normaliza un array de preguntas
 * @param {Array} preguntas - Array de preguntas crudas
 * @returns {Array} Array de preguntas normalizadas
 */
function normalizePreguntas(preguntas) {
    if (!Array.isArray(preguntas)) {
        warn('⚠️ normalizePreguntas: input no es array');
        return [];
    }

    return preguntas.map(normalizePregunta);
}

/**
 * Normaliza un array de temas
 * @param {Array} temas - Array de temas crudos
 * @returns {Array} Array de temas normalizados
 */
function normalizeTemas(temas) {
    if (!Array.isArray(temas)) {
        warn('⚠️ normalizeTemas: input no es array');
        return [];
    }

    return temas.map(normalizeTema);
}

/**
 * Normaliza un array de cursos
 * @param {Array} cursos - Array de cursos crudos
 * @returns {Array} Array de cursos normalizados
 */
function normalizeCursos(cursos) {
    if (!Array.isArray(cursos)) {
        warn('⚠️ normalizeCursos: input no es array');
        return [];
    }

    return cursos.map(normalizeCurso);
}

/**
 * Normaliza todos los datos del dashboard
 * @param {Object} datosCrudos - Datos crudos de N8N
 * @returns {Object} Datos normalizados
 */
function normalizeDatos(datosCrudos) {
    if (!datosCrudos || typeof datosCrudos !== 'object') {
        warn('⚠️ normalizeDatos: input no es objeto');
        return {
            estudiantes: [],
            preguntas: [],
            temas: [],
            contador: []
        };
    }

    debug('🔧 Normalizando datos...');

    const normalizados = {
        estudiantes: normalizeEstudiantes(datosCrudos.estudiantes || []),
        preguntas: normalizePreguntas(datosCrudos.preguntas || []),
        temas: normalizeTemas(datosCrudos.temas || []),
        contador: normalizeContadores(datosCrudos.contador || [])
    };

    debug(`✅ Datos normalizados:`, {
        estudiantes: normalizados.estudiantes.length,
        preguntas: normalizados.preguntas.length,
        temas: normalizados.temas.length,
        contador: normalizados.contador.length
    });

    return normalizados;
}

// ============================================
// CÁLCULO DERIVADO
// ============================================

/**
 * Calcula el contador de preguntas por estudiante desde la lista de preguntas
 * @param {Array} preguntas - Array de preguntas con estructura {Nombre, Chat_id, ...}
 * @returns {Array} - Array de contador con estructura {Nombre, Chat_id, Contador}
 */
function calcularContadorDesdePreguntas(preguntas) {
    if (!Array.isArray(preguntas)) {
        warn('⚠️ calcularContadorDesdePreguntas: input no es array');
        return [];
    }

    debug('🔧 Calculando contador desde preguntas...');

    // Crear mapa para contar preguntas por estudiante
    const contadorMap = new Map();

    preguntas.forEach((pregunta, index) => {
        const chatId = pregunta.Chat_id;
        const nombre = pregunta.Nombre;

        if (!chatId) {
            warn(`⚠️ Pregunta ${index} sin Chat_id`);
            return;
        }

        if (!contadorMap.has(chatId)) {
            // Usar Chat_id como fallback si no hay nombre
            const nombreFinal = nombre && nombre.trim() !== '' ? nombre : null;

            contadorMap.set(chatId, {
                Nombre: nombreFinal,
                Chat_id: chatId,
                Contador: 0
            });

            // Log si no hay nombre
            if (!nombreFinal) {
                warn(`⚠️ Pregunta sin nombre para Chat_id ${chatId}`);
            }
        }

        contadorMap.get(chatId).Contador++;
    });

    // Convertir mapa a array y ordenar por contador descendente
    const contador = Array.from(contadorMap.values());
    contador.sort((a, b) => b.Contador - a.Contador);

    debug(`✅ Contador calculado: ${contador.length} estudiantes`);

    return contador;
}

// ============================================
// VALIDACIÓN DE DATOS
// ============================================

/**
 * Valida que un estudiante tenga los campos requeridos
 * @param {Object} est - Estudiante a validar
 * @returns {boolean} True si es válido
 */
function validateEstudiante(est) {
    if (!est || typeof est !== 'object') return false;
    if (!est.Chat_id || est.Chat_id.trim() === '') return false;
    return true;
}

/**
 * Valida que una pregunta tenga los campos requeridos
 * @param {Object} preg - Pregunta a validar
 * @returns {boolean} True si es válida
 */
function validatePregunta(preg) {
    if (!preg || typeof preg !== 'object') return false;
    if (!preg.Chat_id || preg.Chat_id.trim() === '') return false;
    return true;
}

/**
 * Valida un array de estudiantes
 * @param {Array} estudiantes - Array a validar
 * @returns {Object} { validos: Array, invalidos: Array, total: number }
 */
function validateEstudiantes(estudiantes) {
    if (!Array.isArray(estudiantes)) {
        return { validos: [], invalidos: [], total: 0 };
    }

    const validos = [];
    const invalidos = [];

    estudiantes.forEach(est => {
        if (validateEstudiante(est)) {
            validos.push(est);
        } else {
            invalidos.push(est);
        }
    });

    return {
        validos,
        invalidos,
        total: estudiantes.length,
        validosCount: validos.length,
        invalidosCount: invalidos.length
    };
}

/**
 * Filtra estudiantes inválidos
 * @param {Array} estudiantes - Array a filtrar
 * @returns {Array} Array filtrado con solo estudiantes válidos
 */
function filterValidEstudiantes(estudiantes) {
    const validation = validateEstudiantes(estudiantes);

    if (validation.invalidosCount > 0) {
        warn(`⚠️ Filtrados ${validation.invalidosCount} estudiantes inválidos`);
    }

    return validation.validos;
}

// ============================================
// SANITIZACIÓN
// ============================================

/**
 * Sanitiza un string para prevenir XSS
 * @param {string} str - String a sanitizar
 * @returns {string} String sanitizado
 */
function sanitizeString(str) {
    if (typeof str !== 'string') return '';

    // Remover caracteres peligrosos
    return str
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
}

/**
 * Sanitiza un objeto completo
 * @param {Object} obj - Objeto a sanitizar
 * @returns {Object} Objeto sanitizado
 */
function sanitizeObject(obj) {
    if (!obj || typeof obj !== 'object') return obj;

    const sanitized = {};

    for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string') {
            sanitized[key] = sanitizeString(value);
        } else if (Array.isArray(value)) {
            sanitized[key] = value.map(v =>
                typeof v === 'string' ? sanitizeString(v) : v
            );
        } else if (typeof value === 'object' && value !== null) {
            sanitized[key] = sanitizeObject(value);
        } else {
            sanitized[key] = value;
        }
    }

    return sanitized;
}

// ============================================
// EXPORTAR
// ============================================

export {
    // Normalización de campos
    normalizeField,
    normalizeString,
    normalizeBoolean,
    normalizeNumber,

    // Normalización de entidades
    normalizeEstudiante,
    normalizeContador,
    normalizePregunta,
    normalizeTema,
    normalizeCurso,

    // Normalización de colecciones
    normalizeEstudiantes,
    normalizeContadores,
    normalizePreguntas,
    normalizeTemas,
    normalizeCursos,
    normalizeDatos,

    // Cálculo derivado
    calcularContadorDesdePreguntas,

    // Validación
    validateEstudiante,
    validatePregunta,
    validateEstudiantes,
    filterValidEstudiantes,

    // Sanitización
    sanitizeString,
    sanitizeObject
};
