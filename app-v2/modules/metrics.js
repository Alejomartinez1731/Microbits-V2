// ============================================
// METRICS.JS - KPIs Interactivos
// ============================================
// Módulo: Métricas y KPIs
// Responsabilidad: Calcular y renderizar métricas interactivas con paneles de detalle
// Complejidad: ⭐⭐⭐ Difícil
// Dependencias: state.js, dom.js, utils.js, diagnostics.js

import { getDatos } from '@modules/state.js';
import { DOM } from '@modules/dom.js';
import { capitalizeFirst } from '@modules/utils.js';
import { info, warn, error } from '@modules/diagnostics.js';

// ============================================
// CÁLCULO DE MÉTRICAS
// ============================================

/**
 * Calcula todas las métricas del dashboard
 * @returns {Object} Objeto con todas las métricas calculadas
 */
export function calcularMetricas() {
    try {
        const contador = getDatos('contador') || [];
        const temas = getDatos('temas') || [];
        const preguntas = getDatos('preguntas') || [];
        const estudiantes = getDatos('estudiantes') || [];

        // Estudiantes activos (aquellos con Contador > 0)
        const estudiantesActivos = contador.filter(e => e.Contador > 0).length;

        // Preguntas totales (suma de todos los contadores)
        const preguntasTotales = contador.reduce((sum, e) => sum + (e.Contador || 0), 0);

        // Promedio de preguntas por estudiante activo
        const promedioPreguntas = estudiantesActivos > 0
            ? (preguntasTotales / estudiantesActivos).toFixed(1)
            : '0.0';

        // Temas únicos consultados
        const temasUnicos = new Set(temas.map(t => t.Tema)).size;

        // Top estudiante
        const topEstudiante = contador
            .filter(e => e.Contador > 0)
            .sort((a, b) => b.Contador - a.Contador)[0];

        // Tema más consultado
        const temasAgrupados = {};
        temas.forEach(t => {
            if (t.Tema) {
                const temaKey = t.Tema.toString().trim().toLowerCase();
                temasAgrupados[temaKey] = (temasAgrupados[temaKey] || 0) + 1;
            }
        });

        const temaTop = Object.entries(temasAgrupados)
            .sort((a, b) => b[1] - a[1])[0];

        // Interpretación del promedio
        let interpretacionPromedio = '';
        const promedioNum = parseFloat(promedioPreguntas);
        if (promedioNum === 0) interpretacionPromedio = 'Sin datos';
        else if (promedioNum < 5) interpretacionPromedio = 'Baja participación';
        else if (promedioNum < 15) interpretacionPromedio = 'Participación media';
        else interpretacionPromedio = 'Alta participación';

        return {
            estudiantesActivos,
            preguntasTotales,
            promedioPreguntas,
            temasUnicos,
            topEstudiante,
            temaTop,
            interpretacionPromedio,
            totalEstudiantes: estudiantes.length,
            totalPreguntas: preguntas.length
        };

    } catch (err) {
        error('❌ Error calculando métricas:', err);
        return {
            estudiantesActivos: 0,
            preguntasTotales: 0,
            promedioPreguntas: '0.0',
            temasUnicos: 0,
            topEstudiante: null,
            temaTop: null,
            interpretacionPromedio: 'Sin datos',
            totalEstudiantes: 0,
            totalPreguntas: 0
        };
    }
}

// ============================================
// RENDERIZADO DE MÉTRICAS
// ============================================

/**
 * Actualiza todas las métricas en el DOM
 */
export function actualizarMetricas() {
    try {
        info('🔄 Actualizando métricas...');

        const metricas = calcularMetricas();

        // Estudiantes activos
        if (DOM.estudiantesActivos) {
            DOM.estudiantesActivos.textContent = metricas.estudiantesActivos;
        }

        // Preguntas totales
        if (DOM.preguntasTotales) {
            DOM.preguntasTotales.textContent = metricas.preguntasTotales;
        }

        // Promedio de preguntas
        if (DOM.promedioPreguntas) {
            DOM.promedioPreguntas.textContent = metricas.promedioPreguntas;
        }

        // Temas únicos
        if (DOM.temasConsultados) {
            DOM.temasConsultados.textContent = metricas.temasUnicos;
        }

        // Actualizar detalles
        actualizarDetalles(metricas);

        info('✅ Métricas actualizadas');

    } catch (err) {
        error('❌ Error actualizando métricas:', err);
    }
}

/**
 * Actualiza los textos de detalle de las métricas
 * @param {Object} metricas - Objeto con métricas calculadas
 */
function actualizarDetalles(metricas) {
    try {
        // Detalle de estudiantes activos
        const detalleEstudiantes = document.getElementById('estudiantes-detail');
        if (detalleEstudiantes) {
            if (metricas.topEstudiante?.Nombre) {
                const primerNombre = metricas.topEstudiante.Nombre.split(' ')[0];
                detalleEstudiantes.textContent =
                    `Top: ${primerNombre} (${metricas.topEstudiante.Contador} preguntas)`;
            } else {
                detalleEstudiantes.textContent = 'Sin actividad';
            }
        }

        // Detalle de preguntas totales
        const detallePreguntas = document.getElementById('preguntas-detail');
        if (detallePreguntas) {
            detallePreguntas.textContent =
                `${metricas.preguntasTotales} preguntas por ${metricas.estudiantesActivos} estudiantes`;
        }

        // Detalle de promedio
        const detallePromedio = document.getElementById('promedio-detail');
        if (detallePromedio) {
            detallePromedio.textContent = metricas.interpretacionPromedio;
        }

        // Detalle de temas
        const detalleTemas = document.getElementById('temas-detail');
        if (detalleTemas) {
            if (metricas.temaTop) {
                const [tema, count] = metricas.temaTop;
                detalleTemas.textContent =
                    `Top: "${capitalizeFirst(tema)}" (${count} consultas)`;
            } else {
                detalleTemas.textContent = 'Sin datos';
            }
        }

    } catch (err) {
        error('❌ Error actualizando detalles:', err);
    }
}

// ============================================
// INTERACTIVIDAD DE MÉTRICAS
// ============================================

/**
 * Inicializa los event listeners de las tarjetas de métricas
 */
export function inicializarMetricasInteractivas() {
    try {
        info('🔄 Inicializando métricas interactivas');

        // Event listeners para las tarjetas de métricas
        const metricasCards = document.querySelectorAll('.metrica-card');
        metricasCards.forEach(card => {
            card.onclick = () => {
                try {
                    const metrica = card.dataset.metrica;
                    if (metrica) {
                        toggleDetalleMetrica(metrica, card);
                    }
                } catch (err) {
                    error('❌ Error en click de tarjeta:', err);
                }
            };
        });

        // Botón cerrar panel de detalle
        const btnCloseDetail = document.getElementById('btn-close-detail');
        if (btnCloseDetail) {
            btnCloseDetail.onclick = cerrarPanelDetalle;
        }

        info('✅ Métricas interactivas inicializadas');

    } catch (err) {
        error('❌ Error inicializando métricas interactivas:', err);
    }
}

/**
 * Toggle del panel de detalle de una métrica
 * @param {string} tipo - Tipo de métrica (estudiantes, preguntas, promedio, temas)
 * @param {Element} card - Tarjeta de métrica clickeada
 */
function toggleDetalleMetrica(tipo, card) {
    try {
        const panel = document.getElementById('detail-panel');
        const panelTitle = document.getElementById('detail-panel-title');
        const panelContent = document.getElementById('detail-panel-content');

        if (!panel || !panelTitle || !panelContent) {
            warn('⚠️ Elementos de panel de detalle no encontrados');
            return;
        }

        // Si el panel ya está abierto y es la misma métrica, cerrarlo
        if (panel.classList.contains('visible') && panel.dataset.metrica === tipo) {
            cerrarPanelDetalle();
            return;
        }

        // Actualizar contenido según tipo
        const contenido = generarContenidoDetalle(tipo);

        panelTitle.textContent = contenido.titulo;
        panelContent.innerHTML = contenido.html;
        panel.dataset.metrica = tipo;

        // Mostrar panel
        panel.classList.add('visible');

        info(`✅ Panel de detalle abierto: ${tipo}`);

    } catch (err) {
        error('❌ Error abriendo panel de detalle:', err);
    }
}

/**
 * Genera el contenido del panel de detalle
 * @param {string} tipo - Tipo de métrica
 * @returns {Object} Objeto con {titulo, html}
 */
function generarContenidoDetalle(tipo) {
    const metricas = calcularMetricas();

    switch (tipo) {
        case 'estudiantes':
            return {
                titulo: '👥 Estudiantes Activos',
                html: generarDetalleEstudiantes(metricas)
            };

        case 'preguntas':
            return {
                titulo: '💬 Preguntas Totales',
                html: generarDetallePreguntas(metricas)
            };

        case 'promedio':
            return {
                titulo: '📊 Promedio de Preguntas',
                html: generarDetallePromedio(metricas)
            };

        case 'temas':
            return {
                titulo: '📚 Temas Consultados',
                html: generarDetalleTemas(metricas)
            };

        default:
            return {
                titulo: 'Detalle',
                html: '<p>Información no disponible</p>'
            };
    }
}

/**
 * Genera el HTML para el detalle de estudiantes
 */
function generarDetalleEstudiantes(metricas) {
    const contador = getDatos('contador') || [];
    const top5 = contador
        .filter(e => e.Contador > 0)
        .sort((a, b) => b.Contador - a.Contador)
        .slice(0, 5);

    if (top5.length === 0) {
        return '<p class="detail-empty">No hay estudiantes con actividad</p>';
    }

    const filas = top5.map((est, idx) => {
        const nombre = est.Nombre?.trim() || est.Chat_id || 'Sin nombre';
        const medalla = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '  ';
        return `
            <tr>
                <td>${medalla}</td>
                <td><strong>${nombre}</strong></td>
                <td><span class="contador-badge">${est.Contador}</span></td>
            </tr>
        `;
    }).join('');

    return `
        <div class="detail-stats">
            <div class="detail-stat">
                <span class="detail-stat-value">${metricas.estudiantesActivos}</span>
                <span class="detail-stat-label">Activos</span>
            </div>
            <div class="detail-stat">
                <span class="detail-stat-value">${metricas.totalEstudiantes}</span>
                <span class="detail-stat-label">Total</span>
            </div>
            <div class="detail-stat">
                <span class="detail-stat-value">${metricas.preguntasTotales}</span>
                <span class="detail-stat-label">Preguntas</span>
            </div>
        </div>
        <table class="detail-table">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Estudiante</th>
                    <th>Preguntas</th>
                </tr>
            </thead>
            <tbody>${filas}</tbody>
        </table>
    `;
}

/**
 * Genera el HTML para el detalle de preguntas
 */
function generarDetallePreguntas(metricas) {
    return `
        <div class="detail-stats">
            <div class="detail-stat">
                <span class="detail-stat-value">${metricas.preguntasTotales}</span>
                <span class="detail-stat-label">Total</span>
            </div>
            <div class="detail-stat">
                <span class="detail-stat-value">${metricas.estudiantesActivos}</span>
                <span class="detail-stat-label">Estudiantes</span>
            </div>
            <div class="detail-stat">
                <span class="detail-stat-value">${metricas.promedioPreguntas}</span>
                <span class="detail-stat-label">Promedio</span>
            </div>
        </div>
        <p class="detail-description">
            ${metricas.preguntasTotales} preguntas realizadas por ${metricas.estudiantesActivos} estudiantes.
            ${metricas.interpretacionPromedio}
        </p>
    `;
}

/**
 * Genera el HTML para el detalle de promedio
 */
function generarDetallePromedio(metricas) {
    const promedioNum = parseFloat(metricas.promedioPreguntas);
    let colorClase = '';
    if (promedioNum === 0) colorClase = 'gray';
    else if (promedioNum < 5) colorClase = 'red';
    else if (promedioNum < 15) colorClase = 'yellow';
    else colorClase = 'green';

    return `
        <div class="detail-center">
            <div class="promedio-circle ${colorClase}">
                <span class="promedio-value">${metricas.promedioPreguntas}</span>
                <span class="promedio-label">preguntas/estudiante</span>
            </div>
            <p class="detail-description">
                ${metricas.interpretacionPromedio}
            </p>
        </div>
    `;
}

/**
 * Genera el HTML para el detalle de temas
 */
function generarDetalleTemas(metricas) {
    const temas = getDatos('temas') || [];
    const temasAgrupados = {};

    temas.forEach(t => {
        if (t.Tema) {
            const tema = t.Tema.toString().trim().toLowerCase();
            if (tema && tema.length > 2 && !/^\d+$/.test(tema)) {
                temasAgrupados[tema] = (temasAgrupados[tema] || 0) + 1;
            }
        }
    });

    const topTemas = Object.entries(temasAgrupados)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    if (topTemas.length === 0) {
        return '<p class="detail-empty">No hay temas registrados</p>';
    }

    const filas = topTemas.map(([tema, count], idx) => {
        return `
            <tr>
                <td>${idx + 1}</td>
                <td><strong>${capitalizeFirst(tema)}</strong></td>
                <td><span class="contador-badge">${count}</span></td>
            </tr>
        `;
    }).join('');

    return `
        <div class="detail-stats">
            <div class="detail-stat">
                <span class="detail-stat-value">${metricas.temasUnicos}</span>
                <span class="detail-stat-label">Únicos</span>
            </div>
        </div>
        <table class="detail-table">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Tema</th>
                    <th>Consultas</th>
                </tr>
            </thead>
            <tbody>${filas}</tbody>
        </table>
    `;
}

/**
 * Cierra el panel de detalle
 */
function cerrarPanelDetalle() {
    const panel = document.getElementById('detail-panel');
    if (panel) {
        panel.classList.remove('visible');
        panel.dataset.metrica = '';
        info('✅ Panel de detalle cerrado');
    }
}

// ============================================
// EXPORTAR
// ============================================

export {
    // Cálculo
    calcularMetricas,

    // Renderizado
    actualizarMetricas,

    // Interactividad
    inicializarMetricasInteractivas,
    toggleDetalleMetrica,
    cerrarPanelDetalle
};
