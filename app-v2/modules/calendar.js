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
// FESTIVOS - España, Cataluña y Reus
// ============================================

/**
 * Lista de festivos nacionales, autonómicos y locales
 * Formato: { mes: 0-11, dia: 1-31, nombre: string, tipo: string }
 */
const FESTIVOS = [
    // ===== FESTIVOS NACIONALES DE ESPAÑA =====
    { mes: 0, dia: 1, nombre: 'Año Nuevo', tipo: 'nacional' },
    { mes: 0, dia: 6, nombre: 'Epifanía del Señor', tipo: 'nacional' },
    { mes: 2, dia: 28, nombre: 'Día de la Castilla-La Mancha', tipo: 'regional' }, // Solo CLM
    { mes: 4, dia: 1, nombre: 'Fiesta del Trabajo', tipo: 'nacional' },
    { mes: 7, dia: 15, nombre: 'Asunción de la Virgen', tipo: 'nacional' },
    { mes: 9, dia: 12, nombre: 'Fiesta Nacional de España', tipo: 'nacional' },
    { mes: 10, dia: 1, nombre: 'Todos los Santos', tipo: 'nacional' },
    { mes: 10, dia: 6, nombre: 'Día de la Constitución', tipo: 'nacional' },
    { mes: 11, dia: 8, nombre: 'Inmaculada Concepción', tipo: 'nacional' },
    { mes: 11, dia: 25, nombre: 'Natividad del Señor', tipo: 'nacional' },

    // ===== FESTIVOS DE CATALUÑA =====
    { mes: 1, dia: 12, nombre: 'Santa Eulàlia', tipo: 'cataluna' }, // Barcelona
    { mes: 5, dia: 24, nombre: 'Sant Joan', tipo: 'cataluna' },
    { mes: 8, dia: 11, nombre: 'Diada de Catalunya', tipo: 'cataluna' },
    { mes: 8, dia: 24, nombre: 'La Mercè', tipo: 'cataluna' }, // Barcelona
    { mes: 11, dia: 26, nombre: 'Sant Esteve', tipo: 'cataluna' },

    // ===== FESTIVOS DE REUS =====
    { mes: 6, dia: 25, nombre: 'Sant Jaume', tipo: 'reus' }, // Patrón de Reus
    { mes: 8, dia: 28, nombre: 'Festa Major de Reus', tipo: 'reus' }, // Fiesta Mayor de Reus
    { mes: 8, dia: 29, nombre: 'Festa Major de Reus', tipo: 'reus' }, // Fiesta Mayor de Reus (2 días)
];

/**
 * Calcula la fecha de Semana Santa y otros festivos variables
 * @param {number} año - Año para calcular
 * @returns {Array} Array de festivos variables { mes, dia, nombre, tipo }
 */
function calcularFestivosVariables(año) {
    const festivos = [];

    // Semana Santa (cálculo basado en el equinoccio de primavera)
    // Domingo de Resurrección = Primer domingo después de la luna llena
    // siguiente al equinoccio de primavera (20/21 de marzo)

    // Aproximación simplificada para Semana Santa
    const getEasterDate = (year) => {
        const a = year % 19;
        const b = Math.floor(year / 100);
        const c = year % 100;
        const d = Math.floor(b / 4);
        const e = b % 4;
        const f = Math.floor((b + 8) / 25);
        const g = Math.floor((b - f + 1) / 3);
        const h = (19 * a + b - d - g + 15) % 30;
        const i = Math.floor(c / 4);
        const k = c % 4;
        const l = (32 + 2 * e + 2 * i - h - k) % 7;
        const m = Math.floor((a + 11 * h + 22 * l) / 451);

        const month = Math.floor((h + l - 7 * m + 114) / 31);
        const day = ((h + l - 7 * m + 114) % 31) + 1;

        return new Date(year, month - 1, day);
    };

    const domingoPascua = getEasterDate(año);

    // Jueves Santo (3 días antes del Domingo de Pascua)
    const juevesSanto = new Date(domingoPascua);
    juevesSanto.setDate(domingoPascua.getDate() - 3);
    festivos.push({
        mes: juevesSanto.getMonth(),
        dia: juevesSanto.getDate(),
        nombre: 'Jueves Santo',
        tipo: 'nacional'
    });

    // Viernes Santo (2 días antes del Domingo de Pascua)
    const viernesSanto = new Date(domingoPascua);
    viernesSanto.setDate(domingoPascua.getDate() - 2);
    festivos.push({
        mes: viernesSanto.getMonth(),
        dia: viernesSanto.getDate(),
        nombre: 'Viernes Santo',
        tipo: 'nacional'
    });

    // Lunes de Pascua (1 día después del Domingo de Pascua)
    const lunesPascua = new Date(domingoPascua);
    lunesPascua.setDate(domingoPascua.getDate() + 1);
    festivos.push({
        mes: lunesPascua.getMonth(),
        dia: lunesPascua.getDate(),
        nombre: 'Lunes de Pascua',
        tipo: 'cataluna'
    });

    return festivos;
}

/**
 * Verifica si una fecha es festivo
 * @param {Date} fecha - Fecha a verificar
 * @returns {Object|null} Objeto del festivo o null si no es festivo
 */
function esFestivo(fecha) {
    const mes = fecha.getMonth();
    const dia = fecha.getDate();
    const año = fecha.getFullYear();

    // Buscar en festivos fijos
    const festivoFijo = FESTIVOS.find(f => f.mes === mes && f.dia === dia);
    if (festivoFijo) return festivoFijo;

    // Buscar en festivos variables
    const festivosVariables = calcularFestivosVariables(año);
    const festivoVariable = festivosVariables.find(f => f.mes === mes && f.dia === dia);
    if (festivoVariable) return festivoVariable;

    return null;
}

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

        // Configurar event listeners del calendario
        configurarEventListeners();

        // Configurar event listeners del modal
        inicializarModalEventos();

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

    // Botón agregar evento
    if (DOM.btnAddEvent) {
        DOM.btnAddEvent.addEventListener('click', () => {
            abrirModalEvento();
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
        const festivo = esFestivo(fecha);

        let clases = 'calendar-day';
        if (esHoy) clases += ' today';
        if (tieneEventos) clases += ' has-events';
        if (festivo) clases += ' holiday';

        let eventosBadges = '';
        if (tieneEventos) {
            eventosBadges = '<div class="day-events-indicator">';
            eventosDelDia.forEach(e => {
                eventosBadges += `<span class="event-badge event-${e.tipo}"></span>`;
            });
            eventosBadges += '</div>';
        }

        // Indicador de festivo
        let festivoBadge = '';
        if (festivo && !tieneEventos) {
            festivoBadge = `<div class="festivo-indicator" title="${festivo.nombre}"></div>`;
        }

        html += `
            <div class="${clases}" data-fecha="${fechaStr}" ${festivo ? `title="${festivo.nombre} - ${festivo.tipo}"` : ''}>
                <span class="day-number">${dia}</span>
                ${eventosBadges}
                ${festivoBadge}
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
    if (!DOM.eventsList) return;

    // Verificar si es festivo
    const festivo = esFestivo(fecha);

    let html = '';

    // Mostrar información del festivo si existe
    if (festivo) {
        html += `
            <div class="festivo-info">
                <i class="fas fa-certificate"></i>
                <div class="festivo-info-content">
                    <div class="festivo-info-title">${festivo.nombre}</div>
                    <div class="festivo-info-type">🎉 Festivo ${festivo.tipo === 'nacional' ? 'Nacional' : festivo.tipo === 'cataluna' ? 'Cataluña' : 'Reus'}</div>
                </div>
            </div>
        `;
    }

    // Obtener eventos del día
    const eventos = getEventos();
    const eventosDelDia = eventos.filter(e => {
        const fechaEvento = new Date(e.fecha + 'T00:00:00');
        return fechaEvento.getDate() === fecha.getDate() &&
               fechaEvento.getMonth() === fecha.getMonth() &&
               fechaEvento.getFullYear() === fecha.getFullYear();
    });

    // Mostrar eventos o mensaje de vacío
    if (eventosDelDia.length > 0) {
        html += '<div class="events-items">';
        eventosDelDia.forEach(e => {
            html += `
                <div class="event-item" data-event-id="${e.id}">
                    <div class="event-item-header">
                        <span class="event-item-title">${e.titulo}</span>
                        <span class="event-badge event-${e.tipo}">${getTipoLabel(e.tipo)}</span>
                    </div>
                    ${e.descripcion ? `<p class="event-item-description">${e.descripcion}</p>` : ''}
                </div>
            `;
        });
        html += '</div>';
        info(`📋 ${eventosDelDia.length} eventos para ${formatearFechaStr(fecha)}`);
    } else {
        html += `
            <div class="events-empty">
                <i class="fas fa-calendar-xmark"></i>
                <p>${festivo ? 'No hay eventos adicionales' : 'No hay eventos para este día'}</p>
            </div>
        `;
    }

    DOM.eventsList.innerHTML = html;
}

/**
 * Obtiene el label para un tipo de evento
 * @param {string} tipo - Tipo de evento
 * @returns {string} Label del tipo
 */
function getTipoLabel(tipo) {
    const labels = {
        exam: '📝 Examen',
        practice: '💻 Práctica',
        meeting: '👥 Reunión',
        holiday: '🎉 Festividad',
        other: '📌 Otro'
    };
    return labels[tipo] || '📌 Otro';
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
// MODAL DE EVENTOS
// ============================================

/**
 * Abre el modal para crear un nuevo evento
 */
function abrirModalEvento() {
    if (!DOM.eventModal || !DOM.eventForm) return;

    // Limpiar formulario
    DOM.eventForm.reset();

    // Establecer fecha del día seleccionado o hoy
    const fecha = calendarState.diaSeleccionado !== null
        ? new Date(calendarState.añoActual, calendarState.mesActual, calendarState.diaSeleccionado)
        : new Date();

    DOM.eventDate.value = formatearFechaStr(fecha);

    // Mostrar modal
    DOM.eventModal.classList.add('active');

    info('📝 Modal de evento abierto');
}

/**
 * Cierra el modal de eventos
 */
function cerrarModalEvento() {
    if (!DOM.eventModal) return;

    DOM.eventModal.classList.remove('active');
    info('❌ Modal de evento cerrado');
}

/**
 * Inicializa los event listeners del modal de eventos
 */
function inicializarModalEventos() {
    if (!DOM.eventModal) return;

    // Botón cerrar (X)
    if (DOM.modalClose) {
        DOM.modalClose.addEventListener('click', cerrarModalEvento);
    }

    // Botón cancelar
    if (DOM.modalCancel) {
        DOM.modalCancel.addEventListener('click', cerrarModalEvento);
    }

    // Cerrar al hacer click fuera del modal
    DOM.eventModal.addEventListener('click', (e) => {
        if (e.target === DOM.eventModal) {
            cerrarModalEvento();
        }
    });

    // Submit del formulario
    if (DOM.eventForm) {
        DOM.eventForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await guardarEvento();
        });
    }

    info('✅ Event listeners del modal de eventos configurados');
}

/**
 * Guarda un nuevo evento
 */
async function guardarEvento() {
    if (!DOM.eventTitle || !DOM.eventDate || !DOM.eventType) {
        error('❌ Faltan elementos del formulario');
        return;
    }

    const nuevoEvento = {
        id: Date.now().toString(),
        titulo: DOM.eventTitle.value,
        fecha: DOM.eventDate.value,
        tipo: DOM.eventType.value,
        descripcion: DOM.eventDescription?.value || ''
    };

    try {
        info('💾 Guardando evento:', nuevoEvento.titulo);

        // Aquí iría la llamada a N8N para guardar en Google Sheets
        // Por ahora, guardamos solo en localStorage
        const { agregarEvento } = await import('@modules/events.js');
        agregarEvento(nuevoEvento);

        // Cerrar modal
        cerrarModalEvento();

        // Refrescar calendario
        refrescarCalendario();

        // Mostrar toast
        const { mostrarToast } = await import('@modules/dom.js');
        mostrarToast('Evento guardado correctamente', 'success');

    } catch (err) {
        error('❌ Error guardando evento:', err);
    }
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
    seleccionarDia,

    // Modal
    abrirModalEvento,
    cerrarModalEvento
};
