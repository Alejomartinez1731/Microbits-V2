# Testing Calendario - Checklist

**URL**: http://localhost:3000
**Versión**: v=44
**Fecha**: 2026-03-20
**Estado**: ✅ FASE 6 COMPLETADA

---

## 1. Navegación del Calendario

- [ ] **Botón "Mes Anterior" (<)**
  - Click en el botón de flecha izquierda
  - Verificar que el mes cambia correctamente
  - Verificar que el título del mes se actualiza

- [ ] **Botón "Mes Siguiente" (>)**
  - Click en el botón de flecha derecha
  - Verificar que el mes cambia correctamente
  - Verificar que el título del mes se actualiza

- [ ] **Botón "Hoy"**
  - Navegar a un mes diferente
  - Click en "Hoy"
  - Verificar que vuelve al mes actual
  - Verificar que el día actual está marcado

---

## 2. Renderizado de Días

- [ ] **Días del mes**
  - Verificar que se muestran todos los días del mes
  - Verificar que el primer día de la semana es Lunes
  - Verificar que los días vacíos antes del primer día están en blanco

- [ ] **Día actual (Hoy)**
  - Verificar que el día actual tiene un estilo diferente (resaltado)
  - La fecha actual es 2026-03-20, verificar que el 20 está marcado

- [ ] **Indicadores de eventos**
  - Si hay eventos, verificar que los días tienen pequeños círculos de colores
  - Verificar que los colores corresponden al tipo de evento

- [ ] **Festivos**
  - Verificar que los festivos tienen un estilo especial
  - Verificar el tooltip al pasar el mouse sobre un festivo

---

## 3. Selección de Días

- [ ] **Click en un día**
  - Click en cualquier día del mes
  - Verificar que el día se marca visualmente (borde o fondo diferente)
  - Verificar que el panel lateral muestra los eventos de ese día

- [ ] **Panel de eventos del día**
  - Si hay eventos: verificar que se muestran con título, tipo y descripción
  - Si no hay eventos: verificar que muestra el mensaje "No hay eventos para este día"
  - Si es festivo: verificar que muestra información del festivo

---

## 4. CRUD de Eventos

- [ ] **Crear evento**
  - Click en el botón "+" (Agregar evento)
  - Verificar que se abre el modal
  - Llenar el formulario:
    - Título: "Examen de prueba"
    - Fecha: seleccionar una fecha
    - Tipo: seleccionar "Examen/Parcial"
    - Descripción: "Descripción de prueba"
  - Click en "Guardar"
  - Verificar que el modal se cierra
  - Verificar que aparece un mensaje toast de éxito
  - Verificar que el día ahora tiene un indicador de evento
  - Click en el día y verificar que el evento aparece en el panel

- [ ] **Editar evento**
  - Click en un día que tenga eventos
  - En el panel, click en el botón de lápiz (editar)
  - Verificar que el modal se abre con los datos del evento
  - Modificar el título
  - Click en "Guardar"
  - Verificar que el evento se actualiza en el panel

- [ ] **Eliminar evento**
  - Click en un día que tenga eventos
  - En el panel, click en el botón de basura (eliminar)
  - Verificar que aparece confirmación
  - Confirmar la eliminación
  - Verificar que el evento desaparece del panel
  - Verificar que el indicador del día desaparece

- [ ] **Validaciones del formulario**
  - Intentar guardar sin título (debe mostrar error)
  - Intentar guardar sin fecha (debe mostrar error)

---

## 5. Modal de Eventos

- [ ] **Abrir modal**
  - Click en botón "+"
  - Verificar que el modal se muestra
  - Verificar que tiene título "Nuevo Evento"

- [ ] **Cerrar modal**
  - Click en la X (esquina superior derecha)
  - Verificar que el modal se cierra
  - Abrir modal y click en "Cancelar"
  - Verificar que el modal se cierra
  - Abrir modal y click fuera del modal (overlay)
  - Verificar que el modal se cierra

- [ ] **Campos del formulario**
  - Verificar que todos los campos están presentes
  - Verificar que el selector de tipos tiene las 5 opciones

---

## 6. Persistencia de Eventos

- [ ] **Recargar página**
  - Crear un evento nuevo
  - Recargar la página (F5 o Ctrl+R)
  - Verificar que el evento todavía existe
  - Verificar que el indicador del día todavía está visible

---

## 7. Carga desde N8N/Google Sheets

- [ ] **Eventos desde servidor**
  - Abrir la consola del navegador (F12)
  - Recargar la página
  - Verificar en los logs si se cargaron eventos desde N8N
  - Si hay eventos, verificar que aparecen en el calendario

---

## 8. Estilos y Responsividad

- [ ] **Estilos generales**
  - Verificar que el calendario se ve bien visualmente
  - Verificar que los colores de los tipos de evento son distintos
  - Verificar que los iconos se muestran correctamente

- [ ] **Responsividad** (si es posible)
  - Redimensionar la ventana
  - Verificar que el calendario se adapta

---

## 9. Errores Conocidos a Verificar

- [ ] **Console logs**
  - Abrir la consola (F12)
  - Buscar errores en rojo
  - Reportar cualquier error encontrado

---

## Notas

**Eventos de ejemplo precargados** (según events.js):
- Examen Parcial 1: 15 de Marzo
- Entrega Práctica 1: 20 de Marzo (HOY)
- Reunión de Tutoría: 25 de Marzo

**Festivos de marzo**:
- No hay festivos nacionales en marzo 2026

---

## Issues Encontrados During Testing

| # | Descripción | Estado |
|---|-------------|--------|
| 1 | ID del botón cancelar no coincidía | ✅ FIXEADO |
| 2 | Campo event-course no existe en HTML | ⚠️ OPCIONAL |

---

## Resultado Final

**Tester**: _____________
**Fecha**: _____________
**Estado General**: ⬜ APROBADO | ⬜ CON OBSERVACIONES | ⬜ REPROBADO

**Comentarios**:
_______________________________________________________________
_______________________________________________________________
_______________________________________________________________
