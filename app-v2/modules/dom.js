// ============================================
// DOM.JS - Cache de selectores DOM
// ============================================
// Módulo: DOM Cache
// Responsabilidad: Almacenar y gestionar referencias a elementos DOM
// Complejidad: ⭐ Fácil
// Dependencias: Ninguna (pero se integra con state.js)

/**
 * Cache centralizado de elementos DOM
 * Evita búsquedas repetidas en el DOM mejorando el rendimiento
 */
const DOM = {};

/**
 * Inicializa el cache de DOM
 * Debe llamarse después de que el DOM esté completamente cargado
 */
function initDOM() {
    // === CONTENEDORES PRINCIPALES ===
    DOM.homeContainer = document.getElementById('home-container');
    DOM.dashboardContainer = document.getElementById('dashboard-container');

    // === HEADER ===
    DOM.headerLogo = document.querySelector('.logo');
    DOM.cursoTitulo = document.getElementById('curso-titulo');
    DOM.fechaActual = document.getElementById('fecha-actual');
    DOM.searchInput = document.getElementById('search-input');
    DOM.cursoSelect = document.getElementById('curso-select');

    // === MÉTRICAS ===
    DOM.estudiantesActivos = document.getElementById('estudiantes-activos');
    DOM.preguntasTotales = document.getElementById('preguntas-totales');
    DOM.promedioPreguntas = document.getElementById('promedio-preguntas');
    DOM.temasConsultados = document.getElementById('temas-consultados');

    // === TABS ===
    DOM.tabs = document.querySelectorAll('.tab');

    // === TABLAS ===
    DOM.tablaEstudiantes = document.getElementById('tabla-estudiantes');
    DOM.tablaPreguntas = document.getElementById('tabla-preguntas');
    DOM.tablaActivos = document.getElementById('tabla-activos');
    DOM.tablaTemas = document.getElementById('tabla-temas');

    // === TBODIES (para datos dinámicos) ===
    DOM.tbodyEstudiantes = document.getElementById('tbody-estudiantes');
    DOM.tbodyPreguntas = document.getElementById('tbody-preguntas');
    DOM.tbodyActivos = document.getElementById('tbody-activos');
    DOM.tbodyTemas = document.getElementById('tbody-temas');

    // === ESTADOS VACÍOS (empty states) ===
    DOM.emptyEstudiantes = document.getElementById('empty-estudiantes');
    DOM.emptyPreguntas = document.getElementById('empty-preguntas');
    DOM.emptyActivos = document.getElementById('empty-activos');
    DOM.emptyTemas = document.getElementById('empty-temas');

    // === PAGINACIÓN ===
    DOM.paginacion = document.getElementById('paginacion');
    DOM.btnAnterior = document.getElementById('btn-anterior');
    DOM.btnSiguiente = document.getElementById('btn-siguiente');
    DOM.pagInfo = document.getElementById('pag-info');

    // === GRÁFICOS ===
    DOM.chartActivosContainer = document.getElementById('chart-activos-container');
    DOM.chartActivos = document.getElementById('chart-activos');
    DOM.chartTemasContainer = document.getElementById('chart-temas-container');
    DOM.chartTemas = document.getElementById('chart-temas');

    // === HOME: CURSOS ===
    DOM.coursesList = document.getElementById('courses-list');

    // === HOME: CALENDARIO ===
    DOM.calendarDays = document.getElementById('calendar-days');
    DOM.calCurrentMonth = document.getElementById('cal-current-month');
    DOM.calPrevMonth = document.getElementById('cal-prev-month');
    DOM.calNextMonth = document.getElementById('cal-next-month');
    DOM.calToday = document.getElementById('cal-today');
    DOM.eventsList = document.getElementById('events-list');
    DOM.btnAddEvent = document.getElementById('btn-add-event');

    // === MODALES ===
    DOM.eventModal = document.getElementById('event-modal');
    DOM.modalTitle = document.getElementById('modal-title');
    DOM.modalClose = document.getElementById('modal-close');
    DOM.eventForm = document.getElementById('event-form');
    DOM.eventTitle = document.getElementById('event-title');
    DOM.eventDate = document.getElementById('event-date');
    DOM.eventTime = document.getElementById('event-time');
    DOM.eventType = document.getElementById('event-type');
    DOM.eventDescription = document.getElementById('event-description');
    DOM.eventCourse = document.getElementById('event-course');
    DOM.modalCancel = document.getElementById('btn-cancel');

    // === LOADING Y TOASTS ===
    DOM.loadingOverlay = document.getElementById('loading');
    DOM.toastContainer = document.getElementById('toast-container');

    // === FAB (Floating Action Button) ===
    DOM.fabHome = document.getElementById('fab-home');

    // === MÉTRICAS CARDS (para interactividad) ===
    DOM.metricaCards = document.querySelectorAll('.metrica-card');

    console.log('✅ Cache DOM inicializado');
}

/**
 * Verifica si un elemento DOM existe
 * @param {string} key - Clave del elemento en el cache DOM
 * @returns {boolean} True si el elemento existe
 */
function exists(key) {
    return DOM[key] !== null && DOM[key] !== undefined;
}

/**
 * Obtiene un elemento del cache DOM
 * @param {string} key - Clave del elemento
 * @returns {Element|null} Elemento DOM o null si no existe
 */
function get(key) {
    return DOM[key] || null;
}

/**
 * Establece un elemento en el cache DOM
 * @param {string} key - Clave del elemento
 * @param {Element} element - Elemento DOM
 */
function set(key, element) {
    DOM[key] = element;
}

/**
 * Busca un elemento si no está en cache
 * @param {string} key - Clave del elemento
 * @param {string} selector - Selector CSS
 * @returns {Element|null} Elemento DOM
 */
function getOrCache(key, selector) {
    if (!exists(key)) {
        DOM[key] = document.querySelector(selector);
    }
    return get(key);
}

/**
 * Busca múltiples elementos si no están en cache
 * @param {string} key - Clave de los elementos
 * @param {string} selector - Selector CSS
 * @returns {NodeList} Elementos DOM
 */
function getAllOrCache(key, selector) {
    if (!exists(key)) {
        DOM[key] = document.querySelectorAll(selector);
    }
    return get(key);
}

/**
 * Muestra un elemento
 * @param {Element|string} element - Elemento DOM o clave del cache
 */
function show(element) {
    const el = typeof element === 'string' ? DOM[element] : element;
    if (el) {
        el.classList.remove('hidden');
    }
}

/**
 * Oculta un elemento
 * @param {Element|string} element - Elemento DOM o clave del cache
 */
function hide(element) {
    const el = typeof element === 'string' ? DOM[element] : element;
    if (el) {
        el.classList.add('hidden');
    }
}

/**
 * Alterna la visibilidad de un elemento
 * @param {Element|string} element - Elemento DOM o clave del cache
 */
function toggle(element) {
    const el = typeof element === 'string' ? DOM[element] : element;
    if (el) {
        el.classList.toggle('hidden');
    }
}

/**
 * Verifica si un elemento está oculto
 * @param {Element|string} element - Elemento DOM o clave del cache
 * @returns {boolean} True si está oculto
 */
function isHidden(element) {
    const el = typeof element === 'string' ? DOM[element] : element;
    return el ? el.classList.contains('hidden') : true;
}

/**
 * Agrega una clase a un elemento
 * @param {Element|string} element - Elemento DOM o clave del cache
 * @param {string} className - Nombre de la clase
 */
function addClass(element, className) {
    const el = typeof element === 'string' ? DOM[element] : element;
    if (el) {
        el.classList.add(className);
    }
}

/**
 * Remueve una clase de un elemento
 * @param {Element|string} element - Elemento DOM o clave del cache
 * @param {string} className - Nombre de la clase
 */
function removeClass(element, className) {
    const el = typeof element === 'string' ? DOM[element] : element;
    if (el) {
        el.classList.remove(className);
    }
}

/**
 * Toggle de una clase en un elemento
 * @param {Element|string} element - Elemento DOM o clave del cache
 * @param {string} className - Nombre de la clase
 */
function toggleClass(element, className) {
    const el = typeof element === 'string' ? DOM[element] : element;
    if (el) {
        el.classList.toggle(className);
    }
}

/**
 * Establece el texto de un elemento
 * @param {Element|string} element - Elemento DOM o clave del cache
 * @param {string} text - Texto a establecer
 */
function setText(element, text) {
    const el = typeof element === 'string' ? DOM[element] : element;
    if (el) {
        el.textContent = text;
    }
}

/**
 * Establece el HTML de un elemento
 * @param {Element|string} element - Elemento DOM o clave del cache
 * @param {string} html - HTML a establecer
 */
function setHTML(element, html) {
    const el = typeof element === 'string' ? DOM[element] : element;
    if (el) {
        el.innerHTML = html;
    }
}

/**
 * Limpia el contenido de un elemento
 * @param {Element|string} element - Elemento DOM o clave del cache
 */
function clear(element) {
    const el = typeof element === 'string' ? DOM[element] : element;
    if (el) {
        el.innerHTML = '';
    }
}

/**
 * Agrega un event listener a un elemento
 * @param {Element|string} element - Elemento DOM o clave del cache
 * @param {string} event - Tipo de evento
 * @param {Function} handler - Manejador del evento
 * @param {Object} options - Opciones del event listener
 */
function on(element, event, handler, options = {}) {
    const el = typeof element === 'string' ? DOM[element] : element;
    if (el) {
        el.addEventListener(event, handler, options);
    }
}

/**
 * Remueve un event listener de un elemento
 * @param {Element|string} element - Elemento DOM o clave del cache
 * @param {string} event - Tipo de evento
 * @param {Function} handler - Manejador del evento
 */
function off(element, event, handler) {
    const el = typeof element === 'string' ? DOM[element] : element;
    if (el) {
        el.removeEventListener(event, handler);
    }
}

/**
 * Deshabilita un botón
 * @param {Element|string} element - Elemento DOM o clave del cache
 */
function disable(element) {
    const el = typeof element === 'string' ? DOM[element] : element;
    if (el) {
        el.disabled = true;
        el.classList.add('disabled');
    }
}

/**
 * Habilita un botón
 * @param {Element|string} element - Elemento DOM o clave del cache
 */
function enable(element) {
    const el = typeof element === 'string' ? DOM[element] : element;
    if (el) {
        el.disabled = false;
        el.classList.remove('disabled');
    }
}

/**
 * Valida que todos los elementos críticos existan
 * @returns {Object} Resultado de validación
 */
function validarDOM() {
    const criticos = [
        'homeContainer',
        'dashboardContainer',
        'cursoSelect',
        'tbodyEstudiantes',
        'tbodyPreguntas',
        'tbodyActivos',
        'tbodyTemas'
    ];

    const faltantes = criticos.filter(key => !exists(key));

    return {
        valido: faltantes.length === 0,
        faltantes,
        total: criticos.length,
        encontrados: criticos.length - faltantes.length
    };
}

/**
 * Inicializa el módulo DOM
 * @returns {Object} Estado de inicialización
 */
function init() {
    initDOM();

    const validacion = validarDOM();

    if (!validacion.valido) {
        console.warn('⚠️ Elementos DOM faltantes:', validacion.faltantes);
    }

    return validacion;
}

// ============================================
// FUNCIONES DE UI (Loading, Toasts)
// ============================================

/**
 * Muestra el overlay de loading
 * @param {boolean} show - True para mostrar, false para ocultar
 * @param {string} mensaje - Mensaje a mostrar
 */
function mostrarLoading(show = true, mensaje = 'Cargando...') {
    if (!DOM.loadingOverlay) return;

    if (show) {
        DOM.loadingOverlay.classList.remove('hidden');

        // Actualizar mensaje si se proporciona
        const loadingText = DOM.loadingOverlay.querySelector('p');
        if (loadingText && mensaje) {
            loadingText.textContent = mensaje;
        }
    } else {
        DOM.loadingOverlay.classList.add('hidden');
    }
}

/**
 * Oculta el overlay de loading
 */
function ocultarLoading() {
    mostrarLoading(false);
}

/**
 * Muestra una notificación toast
 * @param {string} mensaje - Mensaje a mostrar
 * @param {string} tipo - Tipo de toast ('success', 'error', 'info', 'warning')
 */
function mostrarToast(mensaje, tipo = 'info') {
    if (!DOM.toastContainer) return;

    // Evitar toasts duplicados con el mismo mensaje (dentro de 1 segundo)
    const now = Date.now();
    const lastToasts = window._lastToasts || [];
    const duplicateKey = `${tipo}:${mensaje}`;
    const isDuplicate = lastToasts.some(t => t.key === duplicateKey && now - t.time < 1000);
    if (isDuplicate) {
        console.log('⚠️ Toast duplicado prevenido:', mensaje);
        return;
    }

    // Actualizar historial de toasts
    window._lastToasts = lastToasts.filter(t => now - t.time < 2000);
    window._lastToasts.push({ key: duplicateKey, time: now });

    // Crear elemento del toast
    const toast = document.createElement('div');
    toast.className = `toast toast-${tipo}`;

    // Icono según tipo
    const iconos = {
        success: '<i class="fas fa-check-circle"></i>',
        error: '<i class="fas fa-exclamation-circle"></i>',
        warning: '<i class="fas fa-exclamation-triangle"></i>',
        info: '<i class="fas fa-info-circle"></i>'
    };

    toast.innerHTML = `
        ${iconos[tipo] || ''}
        <span>${mensaje}</span>
        <button class="toast-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;

    // Agregar al container
    DOM.toastContainer.appendChild(toast);

    // Auto-eliminar después de 3 segundos
    setTimeout(() => {
        if (toast.parentElement) {
            toast.classList.add('toast-hiding');
            setTimeout(() => toast.remove(), 300);
        }
    }, 3000);

    console.log(`🔔 Toast ${tipo}: ${mensaje}`);
}

// Exportar el cache DOM y funciones helper
export {
    DOM,
    init,
    exists,
    get,
    set,
    getOrCache,
    getAllOrCache,
    show,
    hide,
    toggle,
    isHidden,
    addClass,
    removeClass,
    toggleClass,
    setText,
    setHTML,
    clear,
    on,
    off,
    disable,
    enable,
    validarDOM,
    mostrarLoading,
    ocultarLoading,
    mostrarToast
};
