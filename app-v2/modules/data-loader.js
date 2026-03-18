// ============================================
// DATA-LOADER.JS - Carga de datos con cache y fallback
// ============================================
// Módulo: Carga de datos
// Responsabilidad: Orquestar la carga de datos desde N8N con cache
// Complejidad: ⭐⭐ Media
// Dependencias: api.js, data-normalizer.js, state.js, dom.js, utils.js, diagnostics.js

import { CONFIG } from '@modules/config.js';
import { fetchDataWithRetry, clearCache, getCacheStats } from '@modules/api.js';
import { normalizeDatos, normalizeCursos, calcularContadorDesdePreguntas, filterValidEstudiantes } from '@modules/data-normalizer.js';
import { setCursos, setCursoActual, setDatos, setTodosDatos, getCursoActual, limpiarDatos, getCache } from '@modules/state.js';
import { DOM } from '@modules/dom.js';
import { mostrarLoading, ocultarLoading, mostrarToast } from '@modules/dom.js';
import { formatearFecha } from '@modules/utils.js';
import { info, warn, error, success } from '@modules/diagnostics.js';

// ============================================
// DATOS DE EJEMPLO (FALLBACK)
// ============================================

/**
 * Datos de ejemplo para cuando N8N falla
 */
const DATOS_EJEMPLO = {
    cursos: [
        {
            id: 'ejemplo-1',
            nombre: 'DAM - Desarrollo de Aplicaciones Multiplataforma',
            nivel: 'Activo',
            estudiantesHabilitados: 15
        },
        {
            id: 'ejemplo-2',
            nombre: 'DWS - Desarrollo Web Servidor',
            nivel: 'Activo',
            estudiantesHabilitados: 12
        }
    ],
    estudiantes: [
        {
            Nombre: 'Estudiante Ejemplo',
            Chat_id: '123456789',
            habilitado: true
        }
    ],
    preguntas: [
        {
            Nombre: 'Estudiante Ejemplo',
            Chat_id: '123456789',
            'Preguntas Frecuentes': '¿Cómo se usa esto?',
            'Fecha de Pregunta': new Date().toISOString()
        }
    ],
    temas: [
        {
            Nombre: 'Estudiante Ejemplo',
            Chat_id: '123456789',
            Tema: 'Uso de plataforma'
        }
    ],
    contador: [
        {
            Nombre: 'Estudiante Ejemplo',
            Chat_id: '123456789',
            Contador: 3
        }
    ]
};

// ============================================
// CARGA DE CURSOS
// ============================================

/**
 * Carga la lista de cursos desde N8N
 * @returns {Promise<boolean>} True si se cargaron correctamente
 */
async function cargarCursos() {
    if (!DOM.coursesList) {
        error('❌ DOM.coursesList no encontrado');
        return false;
    }

    try {
        info('📚 Cargando cursos desde N8N...');

        // Mostrar loading
        DOM.coursesList.innerHTML = `
            <div class="courses-loading">
                <div class="spinner"></div>
                <p>Cargando cursos...</p>
            </div>
        `;

        // Fetch cursos con retry y cache
        const cursosCrudos = await fetchDataWithRetry('cursos', {
            useCache: true,
            useRetry: true
        });

        if (!cursosCrudos || !Array.isArray(cursosCrudos)) {
            throw new Error('Respuesta de cursos inválida');
        }

        // Normalizar cursos
        const cursosNormalizados = normalizeCursos(cursosCrudos);

        if (cursosNormalizados.length === 0) {
            throw new Error('No se recibieron cursos');
        }

        // Guardar en estado
        setCursos(cursosNormalizados);

        // Renderizar cursos
        await renderizarCursos(cursosNormalizados);

        success(`✅ Cursos cargados: ${cursosNormalizados.length} cursos`);
        return true;

    } catch (err) {
        error('Error cargando cursos:', err);

        // Fallback a datos de ejemplo
        warn('🔄 Usando cursos de ejemplo...');
        setCursos(DATOS_EJEMPLO.cursos);
        await renderizarCursos(DATOS_EJEMPLO.cursos);

        mostrarToast('Modo ejemplo: No se pudieron cargar los cursos', 'error');
        return false;
    }
}

/**
 * Renderiza la lista de cursos en la home
 * @param {Array} cursos - Lista de cursos normalizados
 */
async function renderizarCursos(cursos) {
    if (!Array.isArray(cursos) || cursos.length === 0) {
        DOM.coursesList.innerHTML = `
            <div class="courses-empty">
                <i class="fas fa-inbox"></i>
                <p>No hay cursos disponibles</p>
            </div>
        `;
        return;
    }

    // Actualizar subtitle
    const subtitle = DOM.coursesList.parentElement?.querySelector('.section-subtitle');
    if (subtitle) {
        subtitle.textContent = `${cursos.length} cursos disponibles`;
    }

    // Generar HTML
    const html = cursos.map(curso => {
        const { id, nombre, nivel, estudiantesHabilitados } = curso;

        // Sanitizar valores para prevenir XSS
        const safeId = encodeURIComponent(String(id).replace(/'/g, '%27');
        const safeNombre = String(nombre).replace(/"/g, '\\"');

        return `
            <div class="course-item" data-curso-id="${safeId}" data-curso-nombre="${safeNombre}">
                <div class="course-item-info">
                    <div class="course-item-icon">
                        <i class="fas fa-laptop-code"></i>
                    </div>
                    <div>
                        <div class="course-item-name">${safeNombre}</div>
                        <div class="course-item-badges">
                            <span class="course-badge">${nivel}</span>
                            <span class="course-badge">${estudiantesHabilitados} estudiantes</span>
                        </div>
                    </div>
                </div>
                <i class="fas fa-chevron-right course-arrow"></i>
            </div>
        `;
    }).join('');

    DOM.coursesList.innerHTML = html;

    // Agregar event listeners
    const courseItems = DOM.coursesList.querySelectorAll('.course-item');
    courseItems.forEach(item => {
        item.addEventListener('click', () => {
            const cursoId = decodeURIComponent(item.dataset.cursoId);
            const cursoNombre = decodeURIComponent(item.dataset.cursoNombre);
            irADashboard(cursoId, cursoNombre);
        });
    });

    info('✅ Cursos renderizados');
}

// ============================================
// CARGA DE DATOS DEL DASHBOARD
// ============================================

/**
 * Carga todos los datos del dashboard para un curso
 * @returns {Promise<boolean>} True si se cargaron correctamente
 */
async function cargarTodosDatos() {
    const cursoActual = getCursoActual();

    if (!cursoActual.id) {
        warn('⚠️ No hay curso seleccionado');
        return false;
    }

    mostrarLoading(true, `Cargando datos de ${cursoActual.nombre}...`);

    try {
        info(`🔄 Cargando datos para curso: ${cursoActual.nombre} (${cursoActual.id})`);

        // Cargar datos en paralelo con Promise.allSettled
        // Si uno falla, los otros continúan
        const resultados = await Promise.allSettled([
            fetchDataWithRetry('estudiantes', { params: { curso: cursoActual.id }, useCache: true }),
            fetchDataWithRetry('preguntas', { params: { curso: cursoActual.id }, useCache: true }),
            fetchDataWithRetry('temas', { params: { curso: cursoActual.id }, useCache: true }),
            fetchDataWithRetry('contador', { params: { curso: cursoActual.id }, useCache: true })
        ]);

        // Extraer datos (usando valor o fallback a array vacío)
        const datosCrudos = {
            estudiantes: resultados[0].status === 'fulfilled' ? resultados[0].value : [],
            preguntas: resultados[1].status === 'fulfilled' ? resultados[1].value : [],
            temas: resultados[2].status === 'fulfilled' ? resultados[2].value : [],
            contador: resultados[3].status === 'fulfilled' ? resultados[3].value : []
        };

        // Log de errores individuales
        resultados.forEach((result, index) => {
            if (result.status === 'rejected') {
                const endpoints = ['estudiantes', 'preguntas', 'temas', 'contador'];
                warn(`⚠️ Error cargando ${endpoints[index]}:`, result.reason);
            }
        });

        // Normalizar datos
        const datosNormalizados = normalizeDatos(datosCrudos);

        // Calcular contador desde preguntas si no hay
        if (datosNormalizados.contador.length === 0 && datosNormalizados.preguntas.length > 0) {
            info('🔧 Calculando contador desde preguntas...');
            datosNormalizados.contador = calcularContadorDesdePreguntas(datosNormalizados.preguntas);
        }

        // Guardar en estado
        setTodosDatos(datosNormalizados);

        // Verificar si tenemos datos
        const tieneDatos =
            datosNormalizados.estudiantes.length > 0 ||
            datosNormalizados.preguntas.length > 0 ||
            datosNormalizados.temas.length > 0 ||
            datosNormalizados.contador.length > 0;

        if (tieneDatos) {
            success(`✅ Datos cargados correctamente`, {
                estudiantes: datosNormalizados.estudiantes.length,
                preguntas: datosNormalizados.preguntas.length,
                temas: datosNormalizados.temas.length,
                contador: datosNormalizados.contador.length
            });

            mostrarToast('Datos actualizados correctamente', 'success');
            return true;
        } else {
            throw new Error('No se recibieron datos de ningún endpoint');
        }

    } catch (err) {
        error('❌ Error cargando datos:', err);

        // Fallback a datos de ejemplo
        warn('🔄 Usando datos de ejemplo...');
        setTodosDatos(DATOS_EJEMPLO);

        mostrarToast('Modo ejemplo: No se pudieron cargar los datos', 'error');
        return false;
    } finally {
        ocultarLoading();
    }
}

/**
 * Carga datos de ejemplo (fallback)
 */
async function cargarDatosEjemplo() {
    info('📝 Cargando datos de ejemplo...');

    setTodosDatos(DATOS_EJEMPLO);

    mostrarToast('Datos de ejemplo cargados', 'info');
}

// ============================================
// ACTUALIZACIÓN DE UI
// ============================================

/**
 * Actualiza la fecha actual en el header
 */
function actualizarFecha() {
    if (!DOM.fechaActual) return;

    const hoy = new Date();
    const opciones = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    DOM.fechaActual.textContent = hoy.toLocaleDateString('es-ES', opciones);
}

/**
 * Actualiza el selector de cursos en el dashboard
 */
function actualizarSelectorCursos() {
    const cursos = getCache();

    if (!DOM.cursoSelect || !cursos) return;

    // Guardar selección actual
    const seleccionActual = DOM.cursoSelect.value;

    // Limpiar y llenar
    DOM.cursoSelect.innerHTML = '<option value="">-- Seleccionar curso --</option>';

    cursos.forEach(curso => {
        const option = document.createElement('option');
        option.value = curso.id;
        option.textContent = curso.nombre;
        DOM.cursoSelect.appendChild(option);
    });

    // Restaurar selección si es posible
    if (seleccionActual && cursos.some(c => c.id === seleccionActual)) {
        DOM.cursoSelect.value = seleccionActual;
    }
}

// ============================================
// ESTADÍSTICAS Y DEBUGGING
// ============================================

/**
 * Obtiene estadísticas del cache
 * @returns {Object} Estadísticas
 */
function obtenerEstadisticasCache() {
    return getCacheStats();
}

/**
 * Limpia todo el cache
 */
function limpiarCache() {
    clearCache();
    mostrarToast('Cache limpiado', 'info');
}

// ============================================
// EXPORTAR
// ============================================

export {
    // Carga de datos
    cargarCursos,
    cargarTodosDatos,
    cargarDatosEjemplo,

    // Renderizado
    renderizarCursos,

    // UI
    actualizarFecha,
    actualizarSelectorCursos,

    // Estadísticas
    obtenerEstadisticasCache,
    limpiarCache
};
