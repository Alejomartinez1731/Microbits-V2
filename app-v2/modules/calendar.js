// ============================================
// CALENDAR.JS - Calendario académico interactivo
// ============================================
// Módulo: Calendario
// Responsabilidad: Renderizar y manejar el calendario de la home
// Complejidad: ⭐⭐⭐ Media-Alta
// Dependencias: state.js, dom.js, utils.js, diagnostics.js, events.js

import {
    getEventos,
    setEventos
} from '@modules/state.js';
import { DOM } from '@modules/dom.js';
import { info, warn, error } from '@modules/diagnostics.js';
import { cargarEventos, renderizarEventosDelDia as renderEventos } from '@modules/events.js';

// ============================================
// ESTADO DEL CALENDARIO
// ============================================

/**
 * Estado interno del calendario
 */
const calendarState = {
    fechaActual: new Date(),
    mesActual: new Date().getMonth(),
    añoActual: new Date().getFullYear(),
    diaSeleccionado: null
};

// ============================================
// CONSTANTES
// ============================================

const MESES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const DIAS_SEMANA = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

// ============================================
// INICIALIZACIÓN
// ============================================

/**
 * Inicializa el calendario
 */
async function initCalendar() {
    try {
        info('📅 Inicializando calendario...');

        // Cargar eventos desde storage
        await cargarEventos();

        // Renderizar mes actual
        renderizarMes();

        // Configurar event listeners
        configurarEventListeners();

        // Marcar hoy
        marcarHoy();

        info('✅ Calendario inicializado');

    } catch (err) {
        error('❌ Error inicializando calendario:', err);
    }
}

/**
 * Configura los event listeners del calendario
 */
function configurarEventListeners() {
    // Botón mes anterior
    if (DOM.calPrevMonth) {
        DOM.calPrevMonth.addEventListener('click', () => {
            mesAnterior();
        });
    }

    // Botón mes siguiente
    if (DOM.calNextMonth) {
        DOM.calNextMonth.addEventListener('click', () => {
            mesSiguiente();
        });
    }

    // Botón hoy
    if (DOM.calToday) {
        DOM.calToday.addEventListener('click', () => {
            irAHoy();
        });
    }

    info('✅ Event listeners del calendario configurados');
}

// ============================================
// NAVEGACIÓN DEL CALENDARIO
// ============================================

/**
 * Navega al mes anterior
 */
function mesAnterior() {
    calendarState.mesActual--;

    if (calendarState.mesActual < 0) {
        calendarState.mesActual = 11;
        calendarState.añoActual--;
    }

    renderizarMes();
    info('📅 Mes anterior');
}

/**
 * Navega al mes siguiente
 */
function mesSiguiente() {
    calendarState.mesActual++;

    if (calendarState.mesActual > 11) {
        calendarState.mesActual = 0;
        calendarState.añoActual++;
    }

    renderizarMes();
    info('📅 Mes siguiente');
}

/**
 * Navega al mes actual
 */
function irAHoy() {
    const hoy = new Date();
    calendarState.mesActual = hoy.getMonth();
    calendarState.añoActual = hoy.getFullYear();
    calendarState.diaSeleccionado = hoy.getDate();

    renderizarMes();
    marcarHoy();

    info('📅 Navegado a hoy');
}

// ============================================
// RENDERIZADO
// ============================================

/**
 * Renderiza el mes actual del calendario
 */
function renderizarMes() {
    try {
        // Actualizar título del mes
        actualizarTituloMes();

        // Generar días del mes
        generarDiasMes();

        // Marcar día seleccionado si existe
        if (calendarState.diaSeleccionado !== null) {
            marcarDia(calendarState.diaSeleccionado);
        }

    } catch (err) {
        error('❌ Error renderizando mes:', err);
    }
}

/**
 * Actualiza el título del mes actual
 */
function actualizarTituloMes() {
    if (!DOM.calCurrentMonth) return;

    const nombreMes = MESES[calendarState.mesActual];
    DOM.calCurrentMonth.textContent = `${nombreMes} ${calendarState.añoActual}`;
}

/**
 * Genera los días del mes
 */
function generarDiasMes() {
    if (!DOM.calendarDays) return;

    const primerDiaMes = new Date(calendarState.añoActual, calendarState.mesActual, 1);
    const ultimoDiaMes = new Date(calendarState.añoActual, calendarState.mesActual + 1, 0);
    const diasEnMes = ultimoDiaMes.getDate();

    // Obtener día de la semana del primer día (0 = domingo, 1 = lunes, etc.)
    let diaSemana = primerDiaMes.getDay();
    // Ajustar para que lunes = 0, domingo = 6
    diaSemana = diaSemana === 0 ? 6 : diaSemana - 1;

    // Obtener eventos del mes actual
    const eventos = getEventos();
    const eventosDelMes = filtrarEventosDelMes(eventos);

    let html = '';

    // Días vacíos antes del primer día del mes
    for (let i = 0; i < diaSemana; i++) {
        html += '<div class="calendar-day empty"></div>';
    }

    // Días del mes
    for (let dia = 1; dia <= diasEnMes; dia++) {
        const fecha = new Date(calendarState.añoActual, calendarState.mesActual, dia);
        const fechaStr = formatearFechaStr(fecha);

        // Verificar si hay eventos en este día
        const eventosDelDia = eventosDelMes.filter(e => {
            const fechaEvento = new Date(e.fecha);
            return fechaEvento.getDate() === dia &&
                   fechaEvento.getMonth() === calendarState.mesActual &&
                   fechaEvento.getFullYear() === calendarState.añoActual;
        });

        const tieneEventos = eventosDelDia.length > 0;
        const esHoy = esDiaHoy(fecha);

        let clases = 'calendar-day';
        if (esHoy) clases += ' today';
        if (tieneEventos) clases += ' has-events';

        let eventosBadges = '';
        if (tieneEventos) {
            eventosBadges = '<div class="day-events-indicator">';
            eventosDelDia.forEach(e => {
                eventosBadges += `<span class="event-badge event-${e.tipo}"></span>`;
            });
            eventosBadges += '</div>';
        }

        html += `
            <div class="${clases}" data-fecha="${fechaStr}">
                <span class="day-number">${dia}</span>
                ${eventosBadges}
            </div>
        `;
    }

    DOM.calendarDays.innerHTML = html;

    // Agregar event listeners a los días
    const dias = DOM.calendarDays.querySelectorAll('.calendar-day:not(.empty)');
    dias.forEach(dia => {
        dia.addEventListener('click', () => {
            const fechaStr = dia.dataset.fecha;
            seleccionarDia(fechaStr);
        });
    });
}

/**
 * Marca el día actual
 */
function marcarHoy() {
    const hoy = new Date();
    if (hoy.getMonth() === calendarState.mesActual &&
        hoy.getFullYear() === calendarState.añoActual) {

        marcarDia(hoy.getDate());
        mostrarEventosDelDia(hoy);
    }
}

/**
 * Refresca el calendario (vuelve a renderizar el mes actual)
 */
function refrescarCalendario() {
    renderizarMes();

    // Si hay un día seleccionado, mostrar sus eventos
    if (calendarState.diaSeleccionado !== null) {
        const fecha = new Date(
            calendarState.añoActual,
            calendarState.mesActual,
            calendarState.diaSeleccionado
        );
        mostrarEventosDelDia(fecha);
    }

    info('🔄 Calendario refrescado');
}

/**
 * Marca un día específico
 * @param {number} dia - Día a marcar
 */
function marcarDia(dia) {
    if (!DOM.calendarDays) return;

    // Remover selección anterior
    const diaSeleccionado = DOM.calendarDays.querySelector('.calendar-day.selected');
    if (diaSeleccionado) {
        diaSeleccionado.classList.remove('selected');
    }

    // Marcar nuevo día
    const dias = DOM.calendarDays.querySelectorAll('.calendar-day');
    dias.forEach(d => {
        const numDia = d.querySelector('.day-number');
        if (numDia && parseInt(numDia.textContent) === dia) {
            d.classList.add('selected');
        }
    });
}

/**
 * Selecciona un día del calendario
 * @param {string} fechaStr - Fecha en formato YYYY-MM-DD
 */
function seleccionarDia(fechaStr) {
    const fecha = new Date(fechaStr + 'T00:00:00');
    calendarState.diaSeleccionado = fecha.getDate();

    // Marcar día visualmente
    marcarDia(fecha.getDate());

    // Mostrar eventos del día
    mostrarEventosDelDia(fecha);

    info(`📅 Día seleccionado: ${formatearFechaStr(fecha)}`);
}

// ============================================
// EVENTOS
// ============================================

/**
 * Filtra eventos del mes actual
 * @param {Array} eventos - Lista de todos los eventos
 * @returns {Array} Eventos del mes actual
 */
function filtrarEventosDelMes(eventos) {
    return eventos.filter(e => {
        const fechaEvento = new Date(e.fecha);
        return fechaEvento.getMonth() === calendarState.mesActual &&
               fechaEvento.getFullYear() === calendarState.añoActual;
    });
}

/**
 * Muestra los eventos del día seleccionado
 * @param {Date} fecha - Fecha seleccionada
 */
function mostrarEventosDelDia(fecha) {
    if (DOM.eventsList) {
        renderEventos(fecha, DOM.eventsList);
    }

    const eventos = getEventos();
    const eventosDelDia = eventos.filter(e => {
        const fechaEvento = new Date(e.fecha + 'T00:00:00');
        return fechaEvento.getDate() === fecha.getDate() &&
               fechaEvento.getMonth() === fecha.getMonth() &&
               fechaEvento.getFullYear() === fecha.getFullYear();
    });

    if (eventosDelDia.length > 0) {
        info(`📋 ${eventosDelDia.length} eventos para ${formatearFechaStr(fecha)}`);
    }
}

// ============================================
// UTILIDADES
// ============================================

/**
 * Formatea una fecha a string YYYY-MM-DD
 * @param {Date} fecha - Fecha a formatear
 * @returns {string} Fecha formateada
 */
function formatearFechaStr(fecha) {
    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    return `${año}-${mes}-${dia}`;
}

/**
 * Verifica si una fecha es hoy
 * @param {Date} fecha - Fecha a verificar
 * @returns {boolean} True si es hoy
 */
function esDiaHoy(fecha) {
    const hoy = new Date();
    return fecha.getDate() === hoy.getDate() &&
           fecha.getMonth() === hoy.getMonth() &&
           fecha.getFullYear() === hoy.getFullYear();
}

// ============================================
// EXPORTAR
// ============================================

export {
    // Inicialización
    initCalendar,

    // Navegación
    mesAnterior,
    mesSiguiente,
    irAHoy,

    // Renderizado
    renderizarMes,
    refrescarCalendario,

    // Selección
    seleccionarDia
};
