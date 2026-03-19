# Instrucciones para Indexar Estado del Proyecto

## 📌 Archivo a Indexar

**Archivo**: `PROYECTO_ESTADO.md`
**Ubicación**: `C:\Users\Alejandro Martínez\Microbits-V2\PROYECTO_ESTADO.md`

## 🔧 Cómo Indexar (cuando context-mode esté disponible)

### Opción 1: Usar ctx_index (recomendado)
```bash
ctx_index "C:\Users\Alejandro Martínez\Microbits-V2\PROYECTO_ESTADO.md" --source "Estado Proyecto Microbits-V2"
```

### Opción 2: Usar directamente desde la herramienta
En la conversación con Claude, pedir:
> "Por favor, usa ctx_index para indexar el archivo PROYECTO_ESTADO.md en la carpeta Microbits-V2"

## 💡 Para Qué Sirve

Una vez indexado, puedes consultar el estado del proyecto en cualquier momento:

```
ctx_search([
    "módulos completados",
    "versión actual",
    "próximos pasos",
    "calendario",
    "issues conocidas"
], source: "Estado Proyecto Microbits-V2")
```

## ⚠️ IMPORTANTE

**ESTE ARCHIVO Y EL INDEX DEBEN ELIMINARSE CUANDO:**
1. ✅ Todos los cambios estén implementados
2. ✅ El testing esté completo
3. ✅ El deploy esté hecho
4. ✅ El proyecto esté en producción

**Por qué**: Es un archivo temporal para mantener contexto entre sesiones de desarrollo. No debe ir a producción.

---

**Creado**: 2026-03-19
**Para eliminar**: Sí, al finalizar Fase 6
