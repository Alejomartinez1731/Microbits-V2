// ============================================
// MAIN ENTRY POINT - Inicialización de la aplicación
// ============================================
// Este archivo es el punto de entrada que importa y orquesta todos los módulos

console.log('🚀 Iniciando Microbits V2 - Versión Modular');
console.log('📦 Arquitectura: ES6 Modules con Import Map');
console.log('🛡️ Protecciones: Rate Limiting, Circuit Breaker, Cache, Retry Logic');

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // ============================================
        // IMPORTAR MÓDULOS CORE
        // ============================================
        console.log('📦 Cargando módulos core...');

        const results = await Promise.all([
            import('@modules/config.js'),
            import('@modules/state.js'),
            import('@modules/dom.js'),
            import('@modules/diagnostics.js'),
            import('@modules/data-loader.js'),
            import('@modules/navigation.js'),
            import('@modules/table-renderer.js'),
            import('@modules/charts.js'),
            import('@modules/metrics.js')
        ]);

        const [
            { CONFIG, isLocalhost },
            { initState },
            { dom, init: initDOM },
            { setNivelLog, info: logInfo, success: logSuccess, error: logError },
            { cargarCursos },
            { inicializarNavegacion },
            { renderizarTablaActual },
            { inicializarConfiguracionGlobal },
            { inicializarMetricasInteractivas, actualizarMetricas }
        ] = results;

        console.log('✅ Módulos core cargados');

        // ============================================
        // CONFIGURAR LOGGING SEGÚN ENTORNO
        // ============================================
        setNivelLog(isLocalhost ? 'debug' : 'warn');
        logInfo('Entorno:', isLocalhost ? 'LOCAL (Desarrollo)' : 'PRODUCCIÓN');
        logInfo('Logging level:', isLocalhost ? 'DEBUG' : 'WARN');

        // ============================================
        // INICIALIZAR ESTADO
        // ============================================
        console.log('🔧 Inicializando estado...');
        initState(); // Restaura estado desde localStorage si existe

        // ============================================
        // INICIALIZAR DOM CACHE
        // ============================================
        console.log('🎨 Inicializando DOM cache...');
        const domValidation = initDOM();

        if (!domValidation.valido) {
            logError('Faltan elementos DOM críticos:', domValidation.faltantes);
        } else {
            logSuccess(`✅ DOM cache inicializado: ${domValidation.encontrados}/${domValidation.total} elementos`);
        }

        // ============================================
        // INICIALIZAR NAVEGACIÓN
        // ============================================
        console.log('🧭 Inicializando navegación...');
        inicializarNavegacion();

        // ============================================
        // INICIALIZAR GRÁFICOS
        // ============================================
        console.log('📈 Inicializando gráficos...');
        inicializarConfiguracionGlobal();

        // ============================================
        // INICIALIZAR MÉTRICAS
        // ============================================
        console.log('📊 Inicializando métricas...');
        inicializarMetricasInteractivas();

        // ============================================
        // CARGAR DATOS INICIALES
        // ============================================
        console.log('📚 Cargando datos iniciales...');
        await cargarCursos();

        // ============================================
        // INICIALIZAR CALENDARIO
        // ============================================
        console.log('📅 Inicializando calendario...');
        // NOTA: Este módulo aún no existe, se creará en Fase 5
        // const { calendar } = await import('@modules/calendar.js');
        // await calendar.cargarEventosCalendario();
        // calendar.inicializarCalendario();

        // ============================================
        // SETUP DE EVENTOS GLOBALES
        // ============================================
        console.log('⚡ Configurando eventos globales...');

        // Event delegation para eventos de calendario
        document.addEventListener('click', (e) => {
            const editBtn = e.target.closest('.event-action-btn.edit');
            const deleteBtn = e.target.closest('.event-action-btn.delete');

            if (editBtn) {
                const eventId = editBtn.dataset.eventId;
                if (eventId) {
                    // events.editarEvento(eventId);
                    console.log('✏️ Editar evento:', eventId);
                }
                e.preventDefault();
                e.stopPropagation();
            }

            if (deleteBtn) {
                const eventId = deleteBtn.dataset.eventId;
                if (eventId) {
                    // events.eliminarEvento(eventId);
                    console.log('🗑️ Eliminar evento:', eventId);
                }
                e.preventDefault();
                e.stopPropagation();
            }
        });

        // ============================================
        // INICIALIZACIÓN COMPLETADA
        // ============================================
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        logSuccess('✅ Microbits V2 inicializado correctamente');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('');
        console.log('📊 Módulos cargados: 12/15 (Fase 4 completada)');
        console.log('📦 Próximos módulos: Fase 5 (Calendar + Events)');
        console.log('');
        console.log('🔧 Configuración:');
        console.log(`   - Rate Limiting: ${CONFIG.rateLimit.enabled ? '✅' : '❌'}`);
        console.log(`   - Circuit Breaker: ${CONFIG.circuitBreaker.enabled ? '✅' : '❌'}`);
        console.log(`   - Retry Logic: ${CONFIG.retry.enabled ? '✅' : '❌'}`);
        console.log(`   - Cache: ${CONFIG.cache.enabled ? '✅' : '❌'}`);
        console.log(`   - Persistencia: ${CONFIG.storage.enabled ? '✅' : '❌'}`);
        console.log('');
        console.log('📖 Para continuar con el desarrollo:');
        console.log('   Fase 5: Crear calendar.js, events.js');
        console.log('   Fase 6: Integración final y testing');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    } catch (error) {
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.error('❌ Error crítico inicializando Microbits V2');
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.error('Mensaje:', error.message);
        console.error('Stack:', error.stack);

        // Mostrar error en pantalla con diseño
        const body = document.body;

        // Crear overlay de error
        const errorOverlay = document.createElement('div');
        errorOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            font-family: 'Courier New', monospace;
            background: linear-gradient(135deg, #0a1420 0%, #1a2838 100%);
            color: #ff6b6b;
            text-align: center;
            padding: 40px;
            box-sizing: border-box;
            z-index: 9999;
        `;

        errorOverlay.innerHTML = `
            <div style="
                background: rgba(255, 107, 107, 0.1);
                border: 2px solid #ff6b6b;
                border-radius: 16px;
                padding: 40px;
                max-width: 800px;
                box-shadow: 0 20px 60px rgba(255, 107, 107, 0.3);
            ">
                <h1 style="
                    font-size: 72px;
                    margin: 0 0 20px 0;
                    color: #ff6b6b;
                ">❌</h1>

                <h2 style="
                    font-size: 32px;
                    margin: 0 0 30px 0;
                    color: #ffd93d;
                ">Error al Inicializar</h2>

                <p style="
                    font-size: 18px;
                    color: #ff6b6b;
                    margin: 0 0 20px 0;
                    font-weight: bold;
                ">${error.message}</p>

                <details style="
                    background: rgba(0, 0, 0, 0.5);
                    border-radius: 8px;
                    padding: 20px;
                    margin: 20px 0;
                    text-align: left;
                ">
                    <summary style="
                        cursor: pointer;
                        color: #ffd93d;
                        font-weight: bold;
                        margin-bottom: 10px;
                    ">🔍 Ver detalles técnicos</summary>
                    <pre style="
                        margin: 10px 0 0 0;
                        padding: 15px;
                        background: rgba(0, 0, 0, 0.3);
                        border-radius: 4px;
                        overflow-x: auto;
                        font-size: 12px;
                        color: #ff6b6b;
                        white-space: pre-wrap;
                        word-wrap: break-word;
                    ">${error.stack}</pre>
                </details>

                <div style="margin-top: 30px;">
                    <button onclick="location.reload()" style="
                        background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%);
                        color: #000;
                        border: none;
                        padding: 15px 40px;
                        border-radius: 8px;
                        cursor: pointer;
                        font-weight: bold;
                        font-size: 16px;
                        transition: transform 0.2s, box-shadow 0.2s;
                        box-shadow: 0 4px 15px rgba(0, 212, 255, 0.4);
                    " onmouseover="this.style.transform='scale(1.05)'; this.style.boxShadow='0 6px 20px rgba(0, 212, 255, 0.6)'"
                       onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 15px rgba(0, 212, 255, 0.4)'">
                        🔄 Reintentar
                    </button>
                </div>

                <p style="
                    margin-top: 30px;
                    font-size: 14px;
                    color: #6bcb77;
                ">
                    💡 Si el problema persiste, abre la consola (F12) para más información
                </p>
            </div>
        `;

        body.appendChild(errorOverlay);
    }
});

// ============================================
// NAVEGACIÓN SIMPLE (temporal hasta navigation.js)
// ============================================

/**
 * Navega al dashboard de un curso
 * @param {string} cursoId - ID del curso
 * @param {string} cursoNombre - Nombre del curso
 */
window.irADashboard = async function(cursoId, cursoNombre) {
    try {
        console.log(`🎯 Navegando a dashboard: ${cursoNombre} (${cursoId})`);

        // Importar módulos necesarios
        const { setCursoActual } = await import('@modules/state.js');
        const { getCursoActual } = await import('@modules/state.js');
        const { DOM } = await import('@modules/dom.js');
        const { dom } = await import('@modules/dom.js');

        // Establecer curso actual
        setCursoActual(cursoId, cursoNombre);

        // Ocultar home y mostrar dashboard
        if (DOM.homeContainer && DOM.dashboardContainer) {
            DOM.homeContainer.classList.add('hidden');
            DOM.dashboardContainer.classList.remove('hidden');
        }

        // Actualizar título
        if (DOM.cursoTitulo) {
            DOM.cursoTitulo.textContent = cursoNombre;
        }

        // Actualizar selector de cursos
        if (DOM.cursoSelect) {
            DOM.cursoSelect.value = cursoId;
        }

        // Cargar datos del dashboard
        const { cargarTodosDatos } = await import('@modules/data-loader.js');
        await cargarTodosDatos();

        console.log(`✅ Dashboard cargado: ${cursoNombre}`);

    } catch (error) {
        console.error('❌ Error navegando al dashboard:', error);
    }
};

/**
 * Navega a la página de inicio
 */
window.irAInicio = async function() {
    try {
        console.log('🏠 Navegando a inicio...');

        const { limpiarDatos } = await import('@modules/state.js');
        const { setCursoActual } = await import('@modules/state.js');
        const { DOM } = await import('@modules/dom.js');

        // Limpiar curso actual
        setCursoActual(null, null);
        limpiarDatos();

        // Mostrar home y ocultar dashboard
        if (DOM.homeContainer && DOM.dashboardContainer) {
            DOM.homeContainer.classList.remove('hidden');
            DOM.dashboardContainer.classList.add('hidden');
        }

        console.log('✅ De vuelta al inicio');

    } catch (error) {
        console.error('❌ Error navegando a inicio:', error);
    }
};
