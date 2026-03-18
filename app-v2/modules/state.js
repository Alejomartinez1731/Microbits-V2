// ============================================
// STATE.JS - Estado global de la aplicación
// ============================================
// Módulo: Estado global
// Responsabilidad: Almacenar y gestionar el estado de la aplicación
// Complejidad: ⭐ Fácil
// Dependencias: Ninguna (usa CONFIG para persistencia)

/**
 * Estado global de la aplicación
 * Contiene todos los datos que se comparten entre módulos
 *
 * NOTA: El estado es INMUTABLE desde el exterior.
 * Usa los getters/setters proporcionados para modificarlo.
 */
const appState = {
    // Curso seleccionado actualmente
    cursoActual: {
        id: null,
        nombre: null
    },

    // Lista de cursos disponibles
    cursos: [],

    // Datos del dashboard
    datos: {
        estudiantes: [],
        preguntas: [],
        temas: [],
        contador: {}
    },

    // Estado de UI
    ui: {
        tabActual: 'estudiantes', // 'estudiantes', 'preguntas', 'activos', 'temas'
        paginaActual: 1,
        terminoBusqueda: '',
        toastHistory: []
    },

    // Estado del calendario
    calendario: {
        fechaActual: new Date(),
        mesActual: new Date().getMonth(),
        añoActual: new Date().getFullYear(),
        diaSeleccionado: null,
        eventos: []
    },

    // Estado de loading
    loading: {
        isLoading: false,
        mensaje: ''
    },

    // Cache de datos (para reducir requests)
    cache: {
        cursos: null,
        timestamp: null
    },

    // Métricas de uso
    metrics: {
        requestCount: 0,
        lastRequestTime: null,
        errorCount: 0
    }
};

// ============================================
// PERSISTENCIA - LocalStorage
// ============================================

/**
 * Claves para localStorage
 */
const STORAGE_KEYS = {
    CURSO_ACTUAL: 'microbits_curso_actual',
    CACHE: 'microbits_datos_cache',
    TIMESTAMP: 'microbits_cache_timestamp',
    UI_STATE: 'microbits_ui_state',
    METRICS: 'microbits_metrics'
};

/**
 * Guarda el estado en localStorage
 * @param {string} key - Clave específica
 * @param {any} valor - Valor a guardar
 */
function saveToStorage(key, valor) {
    try {
        localStorage.setItem(key, JSON.stringify(valor));
    } catch (error) {
        console.warn('⚠️ No se pudo guardar en localStorage:', error.message);
    }
}

/**
 * Obtiene un valor de localStorage
 * @param {string} key - Clave específica
 * @param {any} defaultValue - Valor por defecto
 * @returns {any} Valor almacenado o defaultValue
 */
function getFromStorage(key, defaultValue = null) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.warn('⚠️ No se pudo leer de localStorage:', error.message);
        return defaultValue;
    }
}

/**
 * Limpia un valor de localStorage
 * @param {string} key - Clave específica
 */
function clearFromStorage(key) {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.warn('⚠️ No se pudo limpiar localStorage:', error.message);
    }
}

/**
 * Persiste el estado actual en localStorage
 */
function persistState() {
    saveToStorage(STORAGE_KEYS.CURSO_ACTUAL, appState.cursoActual);
    saveToStorage(STORAGE_KEYS.UI_STATE, {
        tabActual: appState.ui.tabActual,
        paginaActual: appState.ui.paginaActual
    });
}

/**
 * Restaura el estado desde localStorage
 */
function restoreState() {
    const cursoGuardado = getFromStorage(STORAGE_KEYS.CURSO_ACTUAL);
    if (cursoGuardado && cursoGuardado.id) {
        appState.cursoActual = cursoGuardado;
    }

    const uiGuardado = getFromStorage(STORAGE_KEYS.UI_STATE);
    if (uiGuardado) {
        appState.ui.tabActual = uiGuardado.tabActual || 'estudiantes';
        appState.ui.paginaActual = uiGuardado.paginaActual || 1;
    }
}

// ============================================
// VALIDACIÓN DE ESTADO
// ============================================

/**
 * Valida que un cambio de estado sea válido
 * @param {string} key - Clave del estado
 * @param {any} valor - Valor a validar
 * @returns {boolean} True si es válido
 */
function validateStateChange(key, valor) {
    // Validar cursoActual
    if (key === 'cursoActual') {
        if (valor === null || valor === undefined) return true;
        if (!valor.id || !valor.nombre) {
            console.warn('⚠️ Estado inválido: cursoActual debe tener id y nombre');
            return false;
        }
    }

    // Validar cursos
    if (key === 'cursos') {
        if (!Array.isArray(valor)) {
            console.warn('⚠️ Estado inválido: cursos debe ser un array');
            return false;
        }
    }

    // Validar tabActual
    if (key === 'tabActual') {
        const tabsValidas = ['estudiantes', 'preguntas', 'activos', 'temas'];
        if (!tabsValidas.includes(valor)) {
            console.warn('⚠️ Estado inválido: tab no válida:', valor);
            return false;
        }
    }

    // Validar paginaActual
    if (key === 'paginaActual') {
        if (typeof valor !== 'number' || valor < 1) {
            console.warn('⚠️ Estado inválido: paginaActual debe ser >= 1');
            return false;
        }
    }

    return true;
}

// ============================================
// GETTERS - Obtener estado (INMUTABLE)
// ============================================

/**
 * Obtiene todo el estado (congelado, inmutable)
 * @returns {Object} Estado completo de la aplicación (congelado)
 */
function getState() {
    return Object.freeze(deepClone(appState));
}

/**
 * Obtiene el curso actual
 * @returns {Object|null} Curso seleccionado
 */
function getCursoActual() {
    return deepClone(appState.cursoActual);
}

/**
 * Obtiene la lista de cursos
 * @returns {Array} Lista de cursos
 */
function getCursos() {
    return [...appState.cursos];
}

/**
 * Obtiene datos específicos del dashboard
 * @param {string} tipo - Tipo de dato ('estudiantes', 'preguntas', 'temas', 'contador')
 * @returns {Array|Object} Datos solicitados
 */
function getDatos(tipo) {
    return deepClone(appState.datos[tipo]);
}

/**
 * Obtiene todos los datos del dashboard
 * @returns {Object} Todos los datos
 */
function getTodosDatos() {
    return deepClone(appState.datos);
}

/**
 * Obtiene la tab actual
 * @returns {string} Tab actual
 */
function getTabActual() {
    return appState.ui.tabActual;
}

/**
 * Obtiene la página actual
 * @returns {number} Página actual
 */
function getPaginaActual() {
    return appState.ui.paginaActual;
}

/**
 * Obtiene el término de búsqueda
 * @returns {string} Término de búsqueda
 */
function getTerminoBusqueda() {
    return appState.ui.terminoBusqueda;
}

/**
 * Verifica si hay loading activo
 * @returns {boolean} True si está cargando
 */
function isLoading() {
    return appState.loading.isLoading;
}

/**
 * Obtiene el mensaje de loading
 * @returns {string} Mensaje de loading
 */
function getLoadingMessage() {
    return appState.loading.mensaje;
}

/**
 * Obtiene los eventos del calendario
 * @returns {Array} Lista de eventos
 */
function getEventos() {
    return [...appState.calendario.eventos];
}

/**
 * Obtiene el cache
 * @returns {Object} Cache actual
 */
function getCache() {
    return deepClone(appState.cache);
}

/**
 * Obtiene las métricas
 * @returns {Object} Métricas actuales
 */
function getMetrics() {
    return deepClone(appState.metrics);
}

// ============================================
// SETTERS - Modificar estado (CON VALIDACIÓN)
// ============================================

/**
 * Establece el curso actual
 * @param {string} id - ID del curso
 * @param {string} nombre - Nombre del curso
 */
function setCursoActual(id, nombre) {
    const nuevoCurso = { id, nombre };

    if (!validateStateChange('cursoActual', nuevoCurso)) {
        return;
    }

    appState.cursoActual = nuevoCurso;
    persistState();
    console.log(`📚 Curso cambiado: ${nombre} (ID: ${id})`);
}

/**
 * Establece la lista de cursos
 * @param {Array} cursos - Lista de cursos
 */
function setCursos(cursos) {
    if (!validateStateChange('cursos', cursos)) {
        return;
    }

    appState.cursos = cursos;
    console.log(`📚 Cursos cargados: ${cursos.length} cursos`);
}

/**
 * Establece datos del dashboard
 * @param {string} tipo - Tipo de dato
 * @param {Array|Object} datos - Datos a almacenar
 */
function setDatos(tipo, datos) {
    appState.datos[tipo] = datos;
    console.log(`💾 Datos cargados: ${tipo} (${Array.isArray(datos) ? datos.length : Object.keys(datos).length} items)`);
}

/**
 * Establece múltiples datos a la vez
 * @param {Object} datos - Objeto con todos los datos
 */
function setTodosDatos(datos) {
    Object.assign(appState.datos, datos);
    console.log('💾 Todos los datos actualizados');
}

/**
 * Limpia todos los datos del dashboard
 */
function limpiarDatos() {
    appState.datos = {
        estudiantes: [],
        preguntas: [],
        temas: [],
        contador: {}
    };
    console.log('🧹 Datos del dashboard limpiados');
}

/**
 * Establece la tab actual
 * @param {string} tab - Tab a seleccionar
 */
function setTabActual(tab) {
    if (!validateStateChange('tabActual', tab)) {
        return;
    }

    appState.ui.tabActual = tab;
    persistState();
    console.log(`🔄 Tab cambiada: ${tab}`);
}

/**
 * Establece la página actual
 * @param {number} pagina - Página a establecer
 */
function setPaginaActual(pagina) {
    if (!validateStateChange('paginaActual', pagina)) {
        return;
    }

    appState.ui.paginaActual = pagina;
    persistState();
}

/**
 * Establece el término de búsqueda
 * @param {string} termino - Término de búsqueda
 */
function setTerminoBusqueda(termino) {
    appState.ui.terminoBusqueda = termino;
}

/**
 * Muestra/oculta loading
 * @param {boolean} isLoading - Estado de loading
 * @param {string} mensaje - Mensaje a mostrar
 */
function setLoading(isLoading, mensaje = 'Cargando...') {
    appState.loading = { isLoading, mensaje };
}

/**
 * Establece los eventos del calendario
 * @param {Array} eventos - Lista de eventos
 */
function setEventos(eventos) {
    appState.calendario.eventos = eventos;
    console.log(`📅 Eventos cargados: ${eventos.length} eventos`);
}

/**
 * Agrega un evento al calendario
 * @param {Object} evento - Evento a agregar
 */
function agregarEvento(evento) {
    appState.calendario.eventos.push(evento);
    console.log(`➕ Evento agregado: ${evento.titulo}`);
}

/**
 * Actualiza un evento del calendario
 * @param {string} id - ID del evento
 * @param {Object} datosActualizados - Datos actualizados
 */
function actualizarEvento(id, datosActualizados) {
    const index = appState.calendario.eventos.findIndex(e => e.id === id);
    if (index !== -1) {
        appState.calendario.eventos[index] = {
            ...appState.calendario.eventos[index],
            ...datosActualizados
        };
        console.log(`✏️ Evento actualizado: ${id}`);
    }
}

/**
 * Elimina un evento del calendario
 * @param {string} id - ID del evento
 */
function eliminarEvento(id) {
    appState.calendario.eventos = appState.calendario.eventos.filter(e => e.id !== id);
    console.log(`🗑️ Evento eliminado: ${id}`);
}

/**
 * Actualiza el cache
 * @param {string} key - Clave del cache
 * @param {any} valor - Valor a cachear
 */
function setCache(key, valor) {
    appState.cache[key] = valor;
    appState.cache.timestamp = Date.now();

    // Persistir cache
    saveToStorage(STORAGE_KEYS.CACHE, appState.cache);
    saveToStorage(STORAGE_KEYS.TIMESTAMP, appState.cache.timestamp);
}

/**
 * Limpia el cache
 */
function clearCache() {
    appState.cache = {
        cursos: null,
        timestamp: null
    };
    clearFromStorage(STORAGE_KEYS.CACHE);
    clearFromStorage(STORAGE_KEYS.TIMESTAMP);
    console.log('🧹 Cache limpiado');
}

/**
 * Incrementa el contador de requests
 */
function incrementRequestCount() {
    appState.metrics.requestCount++;
    appState.metrics.lastRequestTime = new Date().toISOString();
}

/**
 * Incrementa el contador de errores
 */
function incrementErrorCount() {
    appState.metrics.errorCount++;
}

/**
 * Reinicia las métricas
 */
function resetMetrics() {
    appState.metrics = {
        requestCount: 0,
        lastRequestTime: null,
        errorCount: 0
    };
}

// ============================================
// UTILIDADES
// ============================================

/**
 * Hace un deep copy de un objeto
 * @param {Object} obj - Objeto a copiar
 * @returns {Object} Copia del objeto
 */
function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

/**
 * Reinicia todo el estado al estado inicial
 */
function resetState() {
    // Limpiar curso actual
    appState.cursoActual = { id: null, nombre: null };

    // Limpiar datos
    appState.datos = {
        estudiantes: [],
        preguntas: [],
        temas: [],
        contador: {}
    };

    // Reset UI
    appState.ui.tabActual = 'estudiantes';
    appState.ui.paginaActual = 1;
    appState.ui.terminoBusqueda = '';

    // Reset calendario
    appState.calendario.mesActual = new Date().getMonth();
    appState.calendario.añoActual = new Date().getFullYear();
    appState.calendario.diaSeleccionado = null;

    // Limpiar storage
    clearFromStorage(STORAGE_KEYS.CURSO_ACTUAL);
    clearFromStorage(STORAGE_KEYS.UI_STATE);

    console.log('🔄 Estado reiniciado');
}

/**
 * Exporta el estado completo como JSON
 * @returns {string} Estado en formato JSON
 */
function exportState() {
    return JSON.stringify(appState, null, 2);
}

/**
 * Importa estado desde JSON
 * @param {string} json - Estado en formato JSON
 * @returns {boolean} True si se importó correctamente
 */
function importState(json) {
    try {
        const state = JSON.parse(json);
        Object.assign(appState, state);
        persistState();
        console.log('📥 Estado importado correctamente');
        return true;
    } catch (error) {
        console.error('❌ Error importando estado:', error);
        return false;
    }
}

// ============================================
// INICIALIZACIÓN
// ============================================

/**
 * Inicializa el estado restaurando desde localStorage
 */
function initState() {
    restoreState();
    console.log('✅ Estado inicializado');
}

// Exportar estado y funciones
export {
    appState,
    getState,
    getCursoActual,
    getCursos,
    getDatos,
    getTodosDatos,
    getTabActual,
    getPaginaActual,
    getTerminoBusqueda,
    isLoading,
    getLoadingMessage,
    getEventos,
    getCache,
    getMetrics,
    setCursoActual,
    setCursos,
    setDatos,
    setTodosDatos,
    limpiarDatos,
    setTabActual,
    setPaginaActual,
    setTerminoBusqueda,
    setLoading,
    setEventos,
    agregarEvento,
    actualizarEvento,
    eliminarEvento,
    setCache,
    clearCache,
    incrementRequestCount,
    incrementErrorCount,
    resetMetrics,
    resetState,
    exportState,
    importState,
    initState,
    persistState,
    restoreState
};
