// ============================================
// TABLE-RENDERER.JS - Renderizado de tablas
// ============================================
// Módulo: Renderizado de tablas
// Responsabilidad: Renderizar las 4 tablas del dashboard (estudiantes, preguntas, activos, temas)
// Complejidad: ⭐⭐ Media
// Dependencias: state.js, dom.js, utils.js, diagnostics.js

import { getDatos, getTabActual, getBusqueda, getPagina } from '@modules/state.js';
import { DOM } from '@modules/dom.js';
import { formatearFecha, calcularPorcentaje, paginar } from '@modules/utils.js';
import { info, warn, error } from '@modules/diagnostics.js';

// ============================================
// TABLA DE ESTUDIANTES
// ============================================

/**
 * Renderiza la tabla de estudiantes
 */
function renderizarEstudiantes() {
    try {
        const estudiantes = getDatos('estudiantes') || [];
        const busqueda = getBusqueda();

        // Filtrar por búsqueda
        const filtrados = estudiantes.filter(est => {
            if (!est.Nombre) return false;
            return est.Nombre.toLowerCase().includes(busqueda.toLowerCase());
        });

        if (filtrados.length === 0) {
            mostrarEmptyState('estudiantes');
            return;
        }

        ocultarEmptyState('estudiantes');

        // Renderizar filas
        const filas = filtrados.map(est => {
            const nombreMostrar = est.Nombre?.trim()
                ? est.Nombre
                : `<span class="sin-nombre">${est.Chat_id || 'Sin ID'}</span>`;

            const habilitado = est.habilitado !== false && est.habilitado !== 'false';

            return `
                <tr class="fade-in">
                    <td><strong>${nombreMostrar}</strong></td>
                    <td>${est.Chat_id || ''}</td>
                    <td>
                        <span class="badge ${habilitado ? 'badge-active' : 'badge-inactive'}">
                            ${habilitado ? 'Habilitado' : 'Deshabilitado'}
                        </span>
                    </td>
                    <td>
                        <div class="toggle-container">
                            <div class="toggle ${habilitado ? 'active' : ''}"
                                 data-chatid="${est.Chat_id}"
                                 onclick="window.toggleEstudiante && window.toggleEstudiante('${est.Chat_id}', ${habilitado})">
                            </div>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

        DOM.tbodyEstudiantes.innerHTML = filas;
        info(`✅ Estudiantes renderizados: ${filtrados.length}`);

    } catch (err) {
        error('❌ Error renderizando estudiantes:', err);
    }
}

// ============================================
// TABLA DE PREGUNTAS
// ============================================

/**
 * Renderiza la tabla de preguntas frecuentes
 */
function renderizarPreguntas() {
    try {
        const preguntas = getDatos('preguntas') || [];
        const busqueda = getBusqueda();

        // Filtrar por búsqueda
        let filtrados = preguntas.filter(p => {
            const nombre = (p.Nombre || '').toLowerCase();
            const texto = (p['Preguntas Frecuentes'] || '').toLowerCase();
            const busquedaLower = busqueda.toLowerCase();

            if (!busqueda) return true;
            return nombre.includes(busquedaLower) || texto.includes(busquedaLower);
        });

        // Ordenar por fecha (más reciente primero)
        filtrados.sort((a, b) => {
            const fechaA = extraerTimestamp(a);
            const fechaB = extraerTimestamp(b);
            return fechaB - fechaA;
        });

        if (filtrados.length === 0) {
            mostrarEmptyState('preguntas');
            return;
        }

        ocultarEmptyState('preguntas');

        // Renderizar filas
        const filas = filtrados.map(preg => {
            const fecha = preg['Fecha de Pregunta'] || preg.fecha || '';
            const texto = preg['Preguntas Frecuentes'] || '';
            const nombre = preg.Nombre || '';

            const nombreMostrar = nombre.trim()
                ? nombre
                : `<span class="sin-nombre">${preg.Chat_id || 'Sin ID'}</span>`;

            return `
                <tr class="fade-in">
                    <td><strong>${nombreMostrar}</strong></td>
                    <td>${preg.Chat_id || ''}</td>
                    <td class="pregunta-text" title="${texto}">${texto}</td>
                    <td class="fecha-tabla">${formatearFecha(fecha)}</td>
                </tr>
            `;
        }).join('');

        DOM.tbodyPreguntas.innerHTML = filas;
        info(`✅ Preguntas renderizadas: ${filtrados.length}`);

    } catch (err) {
        error('❌ Error renderizando preguntas:', err);
    }
}

/**
 * Extrae timestamp de un objeto de pregunta
 * @param {Object} preg - Objeto de pregunta
 * @returns {number} Timestamp en milisegundos
 */
function extraerTimestamp(preg) {
    const campos = [
        preg['Fecha de Pregunta'],
        preg.fecha,
        preg.Fecha,
        preg.created_at,
        preg.timestamp
    ].filter(f => f);

    if (campos.length === 0) return 0;

    const fechaStr = campos[0].toString();
    const match = fechaStr.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/);

    if (match) {
        const [, año, mes, dia, hora, min, sec] = match;
        return new Date(año, mes - 1, dia, hora, min, sec).getTime();
    }

    return 0;
}

// ============================================
// TABLA DE ESTUDIANTES ACTIVOS (TOP)
// ============================================

/**
 * Renderiza la tabla de estudiantes más activos
 */
function renderizarActivos() {
    try {
        const contador = getDatos('contador') || [];
        const busqueda = getBusqueda();

        // Filtrar y ordenar
        let filtrados = contador
            .filter(est => {
                const nombre = est.Nombre || '';
                return nombre.toLowerCase().includes(busqueda.toLowerCase());
            })
            .sort((a, b) => b.Contador - a.Contador);

        if (filtrados.length === 0) {
            mostrarEmptyState('activos');
            if (DOM.chartActivosContainer) {
                DOM.chartActivosContainer.classList.add('hidden');
            }
            return;
        }

        ocultarEmptyState('activos');
        if (DOM.chartActivosContainer) {
            DOM.chartActivosContainer.classList.remove('hidden');
        }

        // Paginar
        const pagina = getPagina();
        const itemsPerPage = 10;
        const inicio = (pagina - 1) * itemsPerPage;
        const fin = inicio + itemsPerPage;
        const paginados = filtrados.slice(inicio, fin);

        // Renderizar filas
        const filas = paginados.map((est, idx) => {
            const posicion = inicio + idx + 1;
            let posicionClass = '';
            if (posicion === 1) posicionClass = 'gold';
            else if (posicion === 2) posicionClass = 'silver';
            else if (posicion === 3) posicionClass = 'bronze';

            const nombreMostrar = est.Nombre?.trim()
                ? est.Nombre
                : `<span class="sin-nombre">${est.Chat_id || 'Sin ID'}</span>`;

            return `
                <tr class="fade-in">
                    <td><span class="badge-position ${posicionClass}">${posicion}</span></td>
                    <td><strong>${nombreMostrar}</strong></td>
                    <td>${est.Chat_id || ''}</td>
                    <td><span class="contador-badge">${est.Contador}</span></td>
                </tr>
            `;
        }).join('');

        DOM.tbodyActivos.innerHTML = filas;

        // Actualizar paginación
        actualizarPaginacion(filtrados.length, pagina, itemsPerPage);

        info(`✅ Activos renderizados: ${filtrados.length} estudiantes`);

    } catch (err) {
        error('❌ Error renderizando activos:', err);
    }
}

// ============================================
// TABLA DE TEMAS CONSULTADOS
// ============================================

/**
 * Renderiza la tabla de temas más consultados
 */
function renderizarTemas() {
    try {
        const temas = getDatos('temas') || [];
        const busqueda = getBusqueda();

        // Agrupar temas únicos por estudiante
        const temasAgrupados = {};
        const consultasUnicas = new Set();

        temas.forEach(t => {
            if (!t.Tema) return;

            const tema = t.Tema.toString().trim().toLowerCase();
            const chatId = t.Chat_id || '';
            const claveUnica = `${chatId}_${tema}`;

            // Filtrar temas inválidos
            if (!tema || tema === '' || /^\d+$/.test(tema) || tema.length < 3) {
                return;
            }

            // Eliminar duplicados por estudiante+tema
            if (!consultasUnicas.has(claveUnica)) {
                consultasUnicas.add(claveUnica);
                temasAgrupados[tema] = (temasAgrupados[tema] || 0) + 1;
            }
        });

        // Convertir a array y ordenar
        let temasArray = Object.entries(temasAgrupados)
            .map(([tema, count]) => ({ tema: capitalizeFirst(tema), count }))
            .sort((a, b) => b.count - a.count);

        // Filtrar por búsqueda
        if (busqueda) {
            const busquedaLower = busqueda.toLowerCase();
            temasArray = temasArray.filter(t =>
                t.tema.toLowerCase().includes(busquedaLower)
            );
        }

        if (temasArray.length === 0) {
            mostrarEmptyState('temas');
            if (DOM.chartTemasContainer) {
                DOM.chartTemasContainer.classList.add('hidden');
            }
            return;
        }

        ocultarEmptyState('temas');
        if (DOM.chartTemasContainer) {
            DOM.chartTemasContainer.classList.remove('hidden');
        }

        // Paginar
        const pagina = getPagina();
        const itemsPerPage = 10;
        const inicio = (pagina - 1) * itemsPerPage;
        const fin = inicio + itemsPerPage;
        const paginados = temasArray.slice(inicio, fin);

        // Calcular porcentajes
        const totalConsultas = temasArray.reduce((sum, t) => sum + t.count, 0);

        // Renderizar filas
        const filas = paginados.map(t => {
            const porcentaje = calcularPorcentaje(t.count, totalConsultas);

            return `
                <tr class="fade-in">
                    <td><strong>${t.tema}</strong></td>
                    <td><span class="contador-badge">${t.count}</span></td>
                    <td>
                        <div class="progress-bar-mini">
                            <div class="progress-bar-fill" style="width: ${porcentaje}"></div>
                        </div>
                    </td>
                    <td>${porcentaje}</td>
                </tr>
            `;
        }).join('');

        DOM.tbodyTemas.innerHTML = filas;

        // Actualizar paginación
        actualizarPaginacion(temasArray.length, pagina, itemsPerPage);

        info(`✅ Temas renderizados: ${temasArray.length} temas únicos`);

    } catch (err) {
        error('❌ Error renderizando temas:', err);
    }
}

// ============================================
// RENDERIZADO GENÉRICO
// ============================================

/**
 * Renderiza la tabla según el tab actual
 */
function renderizarTablaActual() {
    try {
        const tabActual = getTabActual();

        switch (tabActual) {
            case 'estudiantes':
                renderizarEstudiantes();
                break;
            case 'preguntas':
                renderizarPreguntas();
                break;
            case 'activos':
                renderizarActivos();
                break;
            case 'temas':
                renderizarTemas();
                break;
            default:
                warn(`⚠️ Tab desconocido: ${tabActual}`);
        }
    } catch (err) {
        error('❌ Error renderizando tabla actual:', err);
    }
}

// ============================================
// HELPERS
// ============================================

/**
 * Muestra el empty state de una tabla
 * @param {string} tipo - Tipo de tabla (estudiantes, preguntas, activos, temas)
 */
function mostrarEmptyState(tipo) {
    const emptyKey = `empty${capitalizeFirst(tipo)}`;
    const tbodyKey = `tbody${capitalizeFirst(tipo)}`;

    if (DOM[emptyKey]) {
        DOM[emptyKey].classList.add('visible');
    }
    if (DOM[tbodyKey]) {
        DOM[tbodyKey].innerHTML = '';
    }
}

/**
 * Oculta el empty state de una tabla
 * @param {string} tipo - Tipo de tabla
 */
function ocultarEmptyState(tipo) {
    const emptyKey = `empty${capitalizeFirst(tipo)}`;

    if (DOM[emptyKey]) {
        DOM[emptyKey].classList.remove('visible');
    }
}

/**
 * Capitaliza la primera letra de un string
 * @param {string} str - String a capitalizar
 * @returns {string} String capitalizado
 */
function capitalizeFirst(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Actualiza los controles de paginación
 * @param {number} total - Total de items
 * @param {number} pagina - Página actual
 * @param {number} itemsPerPage - Items por página
 */
function actualizarPaginacion(total, pagina = 1, itemsPerPage = 10) {
    if (!DOM.pagInfo) return;

    const totalPages = Math.ceil(total / itemsPerPage);
    const inicio = total === 0 ? 0 : (pagina - 1) * itemsPerPage + 1;
    const fin = Math.min(pagina * itemsPerPage, total);

    DOM.pagInfo.textContent = `Mostrando ${inicio}-${fin} de ${total}`;

    // Actualizar estado de botones
    if (DOM.btnAnterior) {
        DOM.btnAnterior.disabled = pagina === 1;
    }
    if (DOM.btnSiguiente) {
        DOM.btnSiguiente.disabled = pagina >= totalPages;
    }
}

// ============================================
// EXPORTAR
// ============================================

export {
    // Renderizado de tablas
    renderizarEstudiantes,
    renderizarPreguntas,
    renderizarActivos,
    renderizarTemas,
    renderizarTablaActual
};
