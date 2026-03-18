// ============================================
// CHARTS.JS - Gráficos Chart.js
// ============================================
// Módulo: Gráficos
// Responsabilidad: Inicializar y actualizar gráficos de Chart.js
// Complejidad: ⭐⭐ Media
// Dependencias: dom.js, utils.js, diagnostics.js

import { DOM } from '@modules/dom.js';
import { capitalizeFirst } from '@modules/utils.js';
import { info, warn, error } from '@modules/diagnostics.js';

// ============================================
// ESTADO DE GRÁFICOS
// ============================================

let chartTemas = null;
let chartActivos = null;

// ============================================
// COLORES DEL TEMA
// ============================================

const chartColors = {
    blue: 'rgba(0, 212, 255, 0.8)',
    cyan: 'rgba(0, 255, 255, 0.8)',
    electric: 'rgba(0, 153, 255, 0.8)',
    gradient: [
        'rgba(0, 212, 255, 0.8)',
        'rgba(0, 255, 255, 0.8)',
        'rgba(0, 153, 255, 0.8)',
        'rgba(102, 204, 255, 0.8)',
        'rgba(51, 181, 255, 0.8)'
    ],
    border: 'rgba(0, 212, 255, 1)',
    grid: 'rgba(0, 212, 255, 0.1)',
    text: 'rgba(160, 196, 255, 0.9)'
};

// ============================================
// CONFIGURACIÓN GLOBAL DE CHART.JS
// ============================================

/**
 * Inicializa la configuración global de Chart.js
 */
export function inicializarConfiguracionGlobal() {
    if (typeof Chart === 'undefined') {
        warn('⚠️ Chart.js no está cargado');
        return;
    }

    Chart.defaults.color = chartColors.text;
    Chart.defaults.borderColor = chartColors.grid;
    Chart.defaults.font.family = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";

    info('✅ Configuración global de Chart.js inicializada');
}

// ============================================
// GRÁFICO DE TEMAS
// ============================================

/**
 * Inicializa el gráfico de temas más consultados
 * @param {Array} temas - Array de temas con propiedad {tema, count}
 */
export function inicializarGraficoTemas(temas) {
    try {
        const ctx = document.getElementById('chart-temas');
        if (!ctx) {
            warn('⚠️ Elemento chart-temas no encontrado');
            return;
        }

        // Destruir gráfico anterior si existe
        if (chartTemas) {
            chartTemas.destroy();
            chartTemas = null;
        }

        // Ordenar y limitar a top 10
        const topTemas = [...temas]
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

        const labels = topTemas.map(t => capitalizeFirst(t.tema));
        const valores = topTemas.map(t => t.count);

        // Crear gráfico
        chartTemas = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Consultas',
                    data: valores,
                    backgroundColor: chartColors.gradient,
                    borderColor: chartColors.border,
                    borderWidth: 2,
                    borderRadius: 8,
                    borderSkipped: false,
                    hoverBackgroundColor: 'rgba(0, 255, 255, 1)',
                    hoverBorderColor: 'rgba(255, 255, 255, 0.8)',
                    hoverBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: '📊 Distribución de Temas Más Consultados',
                        color: 'rgba(255, 255, 255, 0.9)',
                        font: {
                            size: 18,
                            weight: 'bold'
                        },
                        padding: {
                            bottom: 20
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(10, 20, 35, 0.95)',
                        titleColor: 'rgba(0, 212, 255, 1)',
                        bodyColor: 'rgba(255, 255, 255, 0.9)',
                        borderColor: 'rgba(0, 212, 255, 0.5)',
                        borderWidth: 1,
                        padding: 12,
                        displayColors: false,
                        callbacks: {
                            label: function(context) {
                                return `Consultas: ${context.parsed.y}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: chartColors.grid,
                            drawBorder: false
                        },
                        ticks: {
                            color: chartColors.text,
                            precision: 0
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: chartColors.text,
                            maxRotation: 45,
                            minRotation: 45
                        }
                    }
                },
                animation: {
                    duration: 800,
                    easing: 'easeOutQuart'
                }
            }
        });

        info(`✅ Gráfico de temas inicializado: ${topTemas.length} temas`);

    } catch (err) {
        error('❌ Error inicializando gráfico de temas:', err);
    }
}

// ============================================
// GRÁFICO DE ESTUDIANTES ACTIVOS
// ============================================

/**
 * Inicializa el gráfico de estudiantes más activos
 * @param {Array} estudiantes - Array de estudiantes con propiedad {Nombre, Contador}
 */
export function inicializarGraficoActivos(estudiantes) {
    try {
        const ctx = document.getElementById('chart-activos');
        if (!ctx) {
            warn('⚠️ Elemento chart-activos no encontrado');
            return;
        }

        // Destruir gráfico anterior si existe
        if (chartActivos) {
            chartActivos.destroy();
            chartActivos = null;
        }

        // Limitar a top 10
        const topEstudiantes = estudiantes.slice(0, 10);

        const labels = topEstudiantes.map(est =>
            est.Nombre?.trim() || est.Chat_id || 'Sin nombre'
        );
        const valores = topEstudiantes.map(est => est.Contador);

        // Crear gradiente para el gráfico
        const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, 'rgba(0, 212, 255, 0.8)');
        gradient.addColorStop(1, 'rgba(0, 153, 255, 0.2)');

        // Crear gráfico
        chartActivos = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Preguntas',
                    data: valores,
                    backgroundColor: gradient,
                    borderColor: chartColors.border,
                    borderWidth: 3,
                    pointBackgroundColor: 'rgba(0, 255, 255, 1)',
                    pointBorderColor: 'rgba(255, 255, 255, 0.8)',
                    pointBorderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: '📈 Top Estudiantes Activos',
                        color: 'rgba(255, 255, 255, 0.9)',
                        font: {
                            size: 18,
                            weight: 'bold'
                        },
                        padding: {
                            bottom: 20
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(10, 20, 35, 0.95)',
                        titleColor: 'rgba(0, 212, 255, 1)',
                        bodyColor: 'rgba(255, 255, 255, 0.9)',
                        borderColor: 'rgba(0, 212, 255, 0.5)',
                        borderWidth: 1,
                        padding: 12,
                        displayColors: false,
                        callbacks: {
                            label: function(context) {
                                return `Preguntas: ${context.parsed.y}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: chartColors.grid,
                            drawBorder: false
                        },
                        ticks: {
                            color: chartColors.text,
                            precision: 0
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: chartColors.text,
                            maxRotation: 45,
                            minRotation: 45
                        }
                    }
                },
                animation: {
                    duration: 800,
                    easing: 'easeOutQuart'
                }
            }
        });

        info(`✅ Gráfico de activos inicializado: ${topEstudiantes.length} estudiantes`);

    } catch (err) {
        error('❌ Error inicializando gráfico de activos:', err);
    }
}

// ============================================
// ACTUALIZACIÓN DE GRÁFICOS
// ============================================

/**
 * Actualiza todos los gráficos con nuevos datos
 * @param {Object} datos - Objeto con {temas, contador}
 */
export function actualizarGraficos(datos) {
    try {
        const temas = datos.temas || [];
        const contador = datos.contador || [];

        // Actualizar gráfico de temas si hay datos
        if (temas.length > 0 && DOM.chartTemas) {
            inicializarGraficoTemas(temas);
        }

        // Actualizar gráfico de activos si hay datos
        if (contador.length > 0 && DOM.chartActivos) {
            inicializarGraficoActivos(contador);
        }

        info('✅ Gráficos actualizados');

    } catch (err) {
        error('❌ Error actualizando gráficos:', err);
    }
}

/**
 * Destruye todos los gráficos
 */
export function destruirGraficos() {
    try {
        if (chartTemas) {
            chartTemas.destroy();
            chartTemas = null;
        }

        if (chartActivos) {
            chartActivos.destroy();
            chartActivos = null;
        }

        info('✅ Gráficos destruidos');

    } catch (err) {
        error('❌ Error destruyendo gráficos:', err);
    }
}

// ============================================
// EXPORTAR
// ============================================

export {
    // Inicialización
    inicializarConfiguracionGlobal,

    // Gráficos individuales
    inicializarGraficoTemas,
    inicializarGraficoActivos,

    // Actualización
    actualizarGraficos,
    destruirGraficos
};
