// ============================================
// NAVIGATION.JS - Navegación entre Home y Dashboard
// ============================================
// Módulo: Navegación
// Responsabilidad: Manejar transiciones entre home y dashboard
// Complejidad: ⭐ Fácil
// Dependencias: state.js, dom.js, data-loader.js

import { setCursoActual, getCursoActual, limpiarDatos } from '@modules/state.js';
import { DOM } from '@modules/dom.js';
import { mostrarLoading, ocultarLoading } from '@modules/dom.js';
import { cargarTodosDatos } from '@modules/data-loader.js';
import { info, warn, error } from '@modules/diagnostics.js';

// ============================================
// NAVEGACIÓN HOME → DASHBOARD
// ============================================

/**
 * Navega al dashboard de un curso específico
 * @param {string} cursoId - ID del curso
 * @param {string} cursoNombre - Nombre del curso
 */
async function irADashboard(cursoId, cursoNombre) {
    try {
        info(`🎯 Navegando a dashboard: ${cursoNombre} (${cursoId})`);

        // Validar parámetros
        if (!cursoId || !cursoNombre) {
            throw new Error('Se requiere cursoId y cursoNombre');
        }

        // Mostrar loading
        mostrarLoading(true, `Cargando ${cursoNombre}...`);

        // Establecer curso actual en el estado
        setCursoActual(cursoId, cursoNombre);

        // Ocultar home y mostrar dashboard
        if (DOM.homeContainer) {
            DOM.homeContainer.classList.add('hidden');
        }
        if (DOM.dashboardContainer) {
            DOM.dashboardContainer.classList.remove('hidden');
        }

        // Actualizar título del curso en el dashboard
        if (DOM.cursoTitulo) {
            DOM.cursoTitulo.textContent = cursoNombre;
        }

        // Actualizar selector de cursos si existe
        if (DOM.cursoSelect) {
            DOM.cursoSelect.value = cursoId;
        }

        // Cargar datos del dashboard
        const datosCargados = await cargarTodosDatos();

        if (!datosCargados) {
            warn('⚠️ No se pudieron cargar todos los datos del dashboard');
        }

        info(`✅ Dashboard cargado: ${cursoNombre}`);

    } catch (err) {
        error('❌ Error navegando al dashboard:', err);
        mostrarToast('Error al cargar el dashboard', 'error');
    } finally {
        ocultarLoading();
    }
}

// ============================================
// NAVEGACIÓN DASHBOARD → HOME
// ============================================

/**
 * Navega de vuelta a la página de inicio
 */
async function irAInicio() {
    try {
        info('🏠 Navegando a inicio...');

        // Limpiar curso actual y datos
        setCursoActual(null, null);
        limpiarDatos();

        // Mostrar home y ocultar dashboard
        if (DOM.homeContainer) {
            DOM.homeContainer.classList.remove('hidden');
        }
        if (DOM.dashboardContainer) {
            DOM.dashboardContainer.classList.add('hidden');
        }

        // Limpiar título del curso
        if (DOM.cursoTitulo) {
            DOM.cursoTitulo.textContent = '';
        }

        // Resetear selector de cursos
        if (DOM.cursoSelect) {
            DOM.cursoSelect.value = '';
        }

        info('✅ De vuelta al inicio');

    } catch (err) {
        error('❌ Error navegando a inicio:', err);
    }
}

// ============================================
// CAMBIO DE CURSO EN DASHBOARD
// ============================================

/**
 * Cambia al curso seleccionado en el selector
 */
async function cambiarCurso() {
    try {
        if (!DOM.cursoSelect) return;

        const cursoId = DOM.cursoSelect.value;
        const cursoNombre = DOM.cursoSelect.options[DOM.cursoSelect.selectedIndex]?.text;

        if (!cursoId || cursoId === '') {
            // Si no hay selección, ir a inicio
            irAInicio();
            return;
        }

        info(`🔄 Cambiando a curso: ${cursoNombre}`);

        // Cargar dashboard del nuevo curso
        await irADashboard(cursoId, cursoNombre);

    } catch (err) {
        error('❌ Error cambiando de curso:', err);
    }
}

// ============================================
// INICIALIZACIÓN DE EVENTOS DE NAVEGACIÓN
// ============================================

/**
 * Inicializa los event listeners de navegación
 */
function inicializarNavegacion() {
    // Event listener para el selector de cursos
    if (DOM.cursoSelect) {
        DOM.cursoSelect.addEventListener('change', cambiarCurso);
        info('✅ Selector de cursos configurado');
    }

    // Event listener para el botón "Volver a inicio" (FAB o botón en header)
    if (DOM.fabHome) {
        DOM.fabHome.addEventListener('click', irAInicio);
        info('✅ Botón volver a inicio configurado');
    }

    // Botón de logo para volver a inicio
    if (DOM.headerLogo) {
        DOM.headerLogo.addEventListener('click', () => {
            const cursoActual = getCursoActual();
            if (cursoActual.id) {
                irAInicio();
            }
        });
        info('✅ Logo configurado para volver a inicio');
    }

    // Exponer funciones globalmente para usar desde HTML
    window.irADashboard = irADashboard;
    window.irAInicio = irAInicio;
    info('✅ Funciones de navegación expuestas globalmente');
}

// ============================================
// ESTADO DE NAVEGACIÓN
// ============================================

/**
 * Verifica si estamos en el dashboard
 * @returns {boolean} True si estamos en el dashboard
 */
function enDashboard() {
    return DOM.dashboardContainer && !DOM.dashboardContainer.classList.contains('hidden');
}

/**
 * Verifica si estamos en el home
 * @returns {boolean} True si estamos en el home
 */
function enHome() {
    return DOM.homeContainer && !DOM.homeContainer.classList.contains('hidden');
}

// ============================================
// EXPORTAR
// ============================================

export {
    // Navegación principal
    irADashboard,
    irAInicio,
    cambiarCurso,

    // Inicialización
    inicializarNavegacion,

    // Estado
    enDashboard,
    enHome
};
