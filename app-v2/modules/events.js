// ============================================
// EVENTS.JS - Gestión de eventos del calendario
// ============================================
// Módulo: Eventos del calendario
// Responsabilidad: Gestionar los eventos del calendario académico
// Complejidad: ⭐⭐ Media
// Dependencias: state.js, dom.js, diagnostics.js

import {
    getEventos,
    setEventos,
    agregarEvento,
    actualizarEvento,
    eliminarEvento as eliminarEventoState
} from '@modules/state.js';
import { DOM } from '@modules/dom.js';
import { mostrarToast } from '@modules/dom.js';
import { info, warn, error } from '@modules/diagnostics.js';

// ============================================
// CONSTANTES
// ============================================

const STORAGE_KEY = 'microbits_calendario_eventos';

const TIPOS_EVENTO = {
    exam: { label: '📝 Examen/Parcial', color: 'exam' },
    practice: { label: '💻 Práctica', color: 'practice' },
    meeting: { label: '👥 Reunión', color: 'meeting' },
    holiday: { label: '🎉 Festividad', color: 'holiday' },
    other: { label: '📌 Otro', color: 'other' }
};

// ============================================
// CARGA Y PERSISTENCIA
// ============================================

/**
 * Carga los eventos desde localStorage
 * @returns {Promise<boolean>} True si se cargaron correctamente
 */
async function cargarEventos() {
    try {
        info('📂 Cargando eventos desde localStorage...');

        const eventosGuardados = localStorage.getItem(STORAGE_KEY);

        if (!eventosGuardados) {
            info('📂 No hay eventos guardados, usando eventos por defecto');
            // Crear eventos de ejemplo
            const eventosPorDefecto = crearEventosPorDefecto();
            setEventos(eventosPorDefecto);
            guardarEventosEnStorage(eventosPorDefecto);
            return true;
        }

        const eventos = JSON.parse(eventosGuardados);

        // Validar que sea un array
        if (!Array.isArray(eventos)) {
            throw new Error('Los eventos guardados no son un array');
        }

        setEventos(eventos);
        info(`✅ ${eventos.length} eventos cargados`);
        return true;

    } catch (err) {
        error('❌ Error cargando eventos:', err);
        // Usar eventos por defecto en caso de error
        const eventosPorDefecto = crearEventosPorDefecto();
        setEventos(eventosPorDefecto);
        return false;
    }
}

/**
 * Guarda los eventos en localStorage
 * @param {Array} eventos - Lista de eventos a guardar
 */
function guardarEventosEnStorage(eventos) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(eventos));
        info('💾 Eventos guardados en localStorage');
    } catch (err) {
        error('❌ Error guardando eventos:', err);
    }
}

/**
 * Crea eventos de ejemplo para el calendario
 * @returns {Array} Lista de eventos de ejemplo
 */
function crearEventosPorDefecto() {
    const hoy = new Date();
    const año = hoy.getFullYear();

    return [
        {
            id: generarEventoId(),
            titulo: 'Examen Parcial 1',
            fecha: `${año}-03-15`,
            tipo: 'exam',
            descripcion: 'Examen de primer parcial',
            curso: null
        },
        {
            id: generarEventoId(),
            titulo: 'Entrega Práctica 1',
            fecha: `${año}-03-20`,
            tipo: 'practice',
            descripcion: 'Entrega de primera práctica',
            curso: null
        },
        {
            id: generarEventoId(),
            titulo: 'Reunión de Tutoría',
            fecha: `${año}-03-25`,
            tipo: 'meeting',
            descripcion: 'Reunión con el tutor',
            curso: null
        }
    ];
}

// ============================================
// CRUD DE EVENTOS
// ============================================

/**
 * Crea un nuevo evento
 * @param {Object} datosEvento - Datos del evento
 * @returns {Object} Evento creado
 */
function crearEvento(datosEvento) {
    const evento = {
        id: generarEventoId(),
        titulo: datosEvento.titulo || '',
        fecha: datosEvento.fecha || '',
        tipo: datosEvento.tipo || 'other',
        descripcion: datosEvento.descripcion || '',
        curso: datosEvento.curso || null
    };

    return evento;
}

/**
 * Agrega un nuevo evento
 * @param {Object} datosEvento - Datos del evento
 * @returns {boolean} True si se agregó correctamente
 */
function agregarNuevoEvento(datosEvento) {
    try {
        const evento = crearEvento(datosEvento);

        // Validar datos requeridos
        if (!evento.titulo || !evento.fecha) {
            throw new Error('El título y la fecha son requeridos');
        }

        // Validar fecha
        const fecha = new Date(evento.fecha);
        if (isNaN(fecha.getTime())) {
            throw new Error('Fecha inválida');
        }

        // Agregar al estado
        agregarEvento(evento);

        // Guardar en localStorage
        const eventos = getEventos();
        guardarEventosEnStorage(eventos);

        mostrarToast('Evento agregado correctamente', 'success');
        info(`✅ Evento agregado: ${evento.titulo}`);

        return true;

    } catch (err) {
        error('❌ Error agregando evento:', err);
        mostrarToast('Error al agregar evento', 'error');
        return false;
    }
}

/**
 * Actualiza un evento existente
 * @param {string} eventoId - ID del evento a actualizar
 * @param {Object} datosActualizados - Datos actualizados
 * @returns {boolean} True si se actualizó correctamente
 */
function modificarEvento(eventoId, datosActualizados) {
    try {
        const eventos = getEventos();
        const index = eventos.findIndex(e => e.id === eventoId);

        if (index === -1) {
            throw new Error('Evento no encontrado');
        }

        // Actualizar evento
        eventos[index] = {
            ...eventos[index],
            ...datosActualizados,
            id: eventoId // Mantener el ID original
        };

        // Validar datos requeridos
        if (!eventos[index].titulo || !eventos[index].fecha) {
            throw new Error('El título y la fecha son requeridos');
        }

        // Actualizar en el estado
        actualizarEvento(eventoId, datosActualizados);

        // Guardar en localStorage
        guardarEventosEnStorage(eventos);

        mostrarToast('Evento actualizado correctamente', 'success');
        info(`✅ Evento actualizado: ${eventoId}`);

        return true;

    } catch (err) {
        error('❌ Error actualizando evento:', err);
        mostrarToast('Error al actualizar evento', 'error');
        return false;
    }
}

/**
 * Elimina un evento
 * @param {string} eventoId - ID del evento a eliminar
 * @returns {boolean} True si se eliminó correctamente
 */
function eliminarEvento(eventoId) {
    try {
        const eventos = getEventos();
        const index = eventos.findIndex(e => e.id === eventoId);

        if (index === -1) {
            throw new Error('Evento no encontrado');
        }

        // Eliminar del estado
        eliminarEventoState(eventoId);

        // Guardar en localStorage
        guardarEventosEnStorage(getEventos());

        mostrarToast('Evento eliminado correctamente', 'success');
        info(`✅ Evento eliminado: ${eventoId}`);

        return true;

    } catch (err) {
        error('❌ Error eliminando evento:', err);
        mostrarToast('Error al eliminar evento', 'error');
        return false;
    }
}

// ============================================
// RENDERIZADO DE EVENTOS
// ============================================

/**
 * Renderiza los eventos del día seleccionado
 * @param {Date} fecha - Fecha seleccionada
 * @param {HTMLElement} contenedor - Contenedor donde renderizar
 */
function renderizarEventosDelDia(fecha, contenedor) {
    if (!contenedor) {
        contenedor = DOM.eventsList;
    }

    if (!contenedor) return;

    const eventos = getEventos();

    // Filtrar eventos del día
    const eventosDelDia = eventos.filter(e => {
        const fechaEvento = new Date(e.fecha + 'T00:00:00');
        return fechaEvento.getDate() === fecha.getDate() &&
               fechaEvento.getMonth() === fecha.getMonth() &&
               fechaEvento.getFullYear() === fecha.getFullYear();
    });

    // Ordenar por tipo
    eventosDelDia.sort((a, b) => a.tipo.localeCompare(b.tipo));

    // Si no hay eventos
    if (eventosDelDia.length === 0) {
        contenedor.innerHTML = `
            <div class="events-empty">
                <i class="fas fa-calendar-xmark"></i>
                <p>No hay eventos para este día</p>
            </div>
        `;
        return;
    }

    // Renderizar eventos
    const html = eventosDelDia.map(evento => {
        const tipoInfo = TIPOS_EVENTO[evento.tipo] || TIPOS_EVENTO.other;
        const titulo = evento.titulo || 'Sin título';
        const descripcion = evento.descripcion || '';
        const curso = evento.curso || '';

        return `
            <div class="event-item event-${evento.tipo}" data-evento-id="${evento.id}">
                <div class="event-icon">
                    <i class="fas fa-calendar-check"></i>
                </div>
                <div class="event-content">
                    <div class="event-header">
                        <span class="event-title">${titulo}</span>
                        <span class="event-badge ${tipoInfo.color}">${tipoInfo.label}</span>
                    </div>
                    ${descripcion ? `<p class="event-description">${descripcion}</p>` : ''}
                    ${curso ? `<span class="event-course"><i class="fas fa-graduation-cap"></i> ${curso}</span>` : ''}
                </div>
                <div class="event-actions">
                    <button class="btn-event-edit" onclick="window.editarEvento && window.editarEvento('${evento.id}')" title="Editar">
                        <i class="fas fa-pencil"></i>
                    </button>
                    <button class="btn-event-delete" onclick="window.eliminarEventoClick && window.eliminarEventoClick('${evento.id}')" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');

    contenedor.innerHTML = html;
}

/**
 * Renderiza todos los eventos en una lista
 * @param {HTMLElement} contenedor - Contenedor donde renderizar
 */
function renderizarTodosEventos(contenedor) {
    const eventos = getEventos();

    if (eventos.length === 0) {
        contenedor.innerHTML = `
            <div class="events-empty">
                <i class="fas fa-calendar-xmark"></i>
                <p>No hay eventos registrados</p>
            </div>
        `;
        return;
    }

    // Ordenar por fecha
    eventos.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

    const html = eventos.map(evento => {
        const tipoInfo = TIPOS_EVENTO[evento.tipo] || TIPOS_EVENTO.other;
        const fecha = new Date(evento.fecha + 'T00:00:00');
        const fechaFormateada = formatearFechaLegible(fecha);

        return `
            <div class="event-item event-${evento.tipo}" data-evento-id="${evento.id}">
                <div class="event-icon">
                    <i class="fas fa-calendar-check"></i>
                </div>
                <div class="event-content">
                    <div class="event-header">
                        <span class="event-date">${fechaFormateada}</span>
                        <span class="event-badge ${tipoInfo.color}">${tipoInfo.label}</span>
                    </div>
                    <div class="event-title">${evento.titulo}</div>
                    ${evento.descripcion ? `<p class="event-description">${evento.descripcion}</p>` : ''}
                </div>
            </div>
        `;
    }).join('');

    contenedor.innerHTML = html;
}

// ============================================
// MODAL DE EVENTOS
// ============================================

/**
 * Abre el modal para crear/editar un evento
 * @param {string|null} eventoId - ID del evento a editar (null para crear)
 */
function abrirModalEvento(eventoId = null) {
    const modal = DOM.eventModal;
    if (!modal) return;

    const form = DOM.eventForm;
    if (!form) return;

    // Resetear formulario
    form.reset();

    if (eventoId) {
        // Modo edición
        const eventos = getEventos();
        const evento = eventos.find(e => e.id === eventoId);

        if (evento) {
            document.getElementById('modal-title').innerHTML = `
                <i class="fas fa-calendar-edit"></i>
                Editar Evento
            `;

            document.getElementById('event-title').value = evento.titulo || '';
            document.getElementById('event-date').value = evento.fecha || '';
            document.getElementById('event-type').value = evento.tipo || 'other';
            document.getElementById('event-description').value = evento.descripcion || '';
            document.getElementById('event-course').value = evento.curso || '';

            // Guardar ID en dataset
            form.dataset.editingId = eventoId;
        }
    } else {
        // Modo creación
        document.getElementById('modal-title').innerHTML = `
            <i class="fas fa-calendar-plus"></i>
            Nuevo Evento
        `;

        // Establecer fecha de hoy por defecto
        const hoy = new Date();
        const fechaStr = hoy.toISOString().split('T')[0];
        document.getElementById('event-date').value = fechaStr;

        // Limpiar dataset
        delete form.dataset.editingId;
    }

    // Mostrar modal
    modal.classList.remove('hidden');
}

/**
 * Cierra el modal de eventos
 */
function cerrarModalEvento() {
    const modal = DOM.eventModal;
    if (!modal) return;

    modal.classList.add('hidden');
}

/**
 * Guarda el evento desde el modal
 */
function guardarEventoDesdeModal() {
    const form = DOM.eventForm;
    if (!form) return;

    const eventoId = form.dataset.editingId;
    const datos = {
        titulo: document.getElementById('event-title').value.trim(),
        fecha: document.getElementById('event-date').value,
        tipo: document.getElementById('event-type').value,
        descripcion: document.getElementById('event-description').value.trim(),
        curso: document.getElementById('event-course').value || null
    };

    if (eventoId) {
        // Actualizar
        modificarEvento(eventoId, datos);
    } else {
        // Crear
        agregarNuevoEvento(datos);
    }

    // Cerrar modal
    cerrarModalEvento();

    // Refrescar calendario
    // Esto se hará desde calendar.js
}

// ============================================
// UTILIDADES
// ============================================

/**
 * Genera un ID único para un evento
 * @returns {string} ID único
 */
function generarEventoId() {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Formatea una fecha de forma legible
 * @param {Date} fecha - Fecha a formatear
 * @returns {string} Fecha formateada
 */
function formatearFechaLegible(fecha) {
    const opciones = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return fecha.toLocaleDateString('es-ES', opciones);
}

// ============================================
// INICIALIZACIÓN
// ============================================

/**
 * Inicializa los event listeners del modal de eventos
 */
function initEventListeners() {
    // Botón agregar evento (si existe en el futuro)
    // Por ahora, el modal se abre desde calendar.js

    // Botón cerrar modal
    if (DOM.modalClose) {
        DOM.modalClose.addEventListener('click', cerrarModalEvento);
    }

    // Botón cancelar
    if (DOM.modalCancel) {
        DOM.modalCancel.addEventListener('click', cerrarModalEvento);
    }

    // Submit del formulario
    if (DOM.eventForm) {
        DOM.eventForm.addEventListener('submit', (e) => {
            e.preventDefault();
            guardarEventoDesdeModal();
        });
    }

    // Exponer funciones globalmente
    window.editarEvento = abrirModalEvento;
    window.eliminarEventoClick = (eventoId) => {
        if (confirm('¿Estás seguro de eliminar este evento?')) {
            eliminarEvento(eventoId);
            // Refrescar calendario
            if (window.refrescarCalendario) {
                window.refrescarCalendario();
            }
        }
    };

    info('✅ Event listeners de eventos inicializados');
}

// ============================================
// EXPORTAR
// ============================================

export {
    // Constantes
    TIPOS_EVENTO,

    // Carga y persistencia
    cargarEventos,
    guardarEventosEnStorage,

    // CRUD
    crearEvento,
    agregarNuevoEvento,
    modificarEvento,
    eliminarEvento,

    // Renderizado
    renderizarEventosDelDia,
    renderizarTodosEventos,

    // Modal
    abrirModalEvento,
    cerrarModalEvento,
    guardarEventoDesdeModal,

    // Inicialización
    initEventListeners
};
