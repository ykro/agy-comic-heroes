# Guía de Prompts en Vivo (Pasos 2 al 9) — GitHub Comic Heroes con Google Antigravity 2.0

**Codelab oficial:** [Getting Started with Google Antigravity](https://codelabs.developers.google.com/getting-started-google-antigravity?hl=en#0)  
**Codelab interactivo del proyecto:** [https://agy-comic-heroes.web.app](https://agy-comic-heroes.web.app)

![Recorrido del Taller](./public/flujo-taller.svg)

---

## Cómo funciona en una carpeta nueva vacía

Tu computadora ya quedó configurada con:
1. **`gcloud` apuntando a tu proyecto de Vertex AI** y credenciales Application Default Credentials (ADC) activas.
2. **El servidor MCP `cloudrun` y `context7` habilitados** en `~/.gemini/config/mcp_config.json`.
3. **El skill global `~/.gemini/config/skills/github-comic-heroes/SKILL.md` instalado**, de modo que si creas cualquier carpeta vacía durante la charla y ejecutas estos prompts, Antigravity construirá exactamente la misma aplicación, con la misma interfaz estilo cómic y la misma llamada a `gemini-nano-banana-2.1`.

*(Para los asistentes del público que clonen el repositorio desde cero, pueden usar `export GOOGLE_CLOUD_PROJECT="su-proyecto"` con Vertex AI o `export GEMINI_API_KEY="su-llave"`).*

---

## Paso 2 — Instalación y Verificación del Entorno
*(Sección 2 del Codelab: Installation)*

**Qué mostrar en pantalla:**
- Muestra los dos íconos en el Dock: **Antigravity 2.0** (centro de mando de agentes) y **Antigravity IDE**.
- Ejecuta este primer prompt para comprobar que el agente detecta las herramientas locales y la configuración de Google Cloud.

### Prompt — Paso 2
```text
Verifica mi entorno local para este taller: revisa las versiones instaladas de Node.js y Python, confirma qué proyecto de Google Cloud está activo en gcloud y lista el contenido actual de esta carpeta.
```

---

## Paso 3 — Interfaz de Antigravity 2.0, Proyectos y Conversaciones
*(Sección 3 del Codelab: Antigravity 2.0 Interface — Projects, Conversations & Project Settings)*

**Qué mostrar en pantalla:**
1. **Proyectos y Configuración (`Project Settings`):** Haz clic en el ícono de engranaje junto al nombre del proyecto para mostrar que un proyecto puede abarcar múltiples carpetas (`Add Folder`) y tiene permisos independientes (*Security Preset*, política de revisión de *Artifacts* y activación de *MCP Servers* por proyecto).
2. **Múltiples hilos de conversación:** Crea una primera conversación (`conv-datos-github`) para consultar datos reales de GitHub y luego abre una segunda conversación en paralelo (`+ New Conversation in Project` -> `conv-idea-comic`).

### Prompt 3A — Conversación 1 (`conv-datos-github`)
```text
Consulta el perfil público de GitHub y los repositorios principales del usuario "ykro" usando la API pública de GitHub. Resume en una tabla su nombre, URL de su foto de perfil (avatar_url), sus 3 lenguajes principales y sus 3 repositorios más destacados.
```

### Prompt 3B — Conversación 2 (`conv-idea-comic`)
```text
A partir de un desarrollador cuyos lenguajes principales son TypeScript, Python y Kotlin y que construye agentes autónomos de IA, propón un alias de Superhéroe de Cómic, 2 superpoderes con nivel de poder (1 a 99) basados en sus repositorios y un grito de batalla de una línea para un globo de diálogo.
```

---

## Paso 4 — Slash Commands (`/plan`, `/browser`, `/schedule`)
*(Sección 4 del Codelab: Slash Commands)*

**Qué mostrar en pantalla:**
- Escribe `/` en la barra de chat para mostrar los comandos integrados (`/plan`, `/browser`, `/schedule`, `/boost`, `/teamwork`, `/grill-me`, `/learn`).
- Usa `/browser` para lanzar el subagente de Google Chrome en vivo.
  - **Si estás en una carpeta nueva antes de construir la app:** usa el **Prompt 4A** para que `/browser` abra `https://github.com/ykro` e inspeccione el perfil en vivo.
  - **Si ya tienes la app corriendo en el puerto 8080:** usa el **Prompt 4B** para que `/browser` abra `http://localhost:8080`, genere o verifique la carta estilo cómic y tome una captura.

### Prompt 4A — `/browser` sobre GitHub en vivo (funciona en carpeta vacía)
```text
/browser Abre https://github.com/ykro en Chrome, identifica la foto de perfil, la biografía y los repositorios fijados o recientes visibles en la página, y devuélveme un resumen junto con una captura de pantalla.
```

### Prompt 4B — `/browser` sobre nuestra app local de Cartas Cómic
```text
/browser Asegúrate de que el servidor (`node src/server.js`) esté corriendo en el puerto 8080. Abre http://localhost:8080 en Chrome, verifica que se muestre la carta de GitHub Comic Heroes con su retrato estilo cómic, la insignia del avatar original, el globo de diálogo y los superpoderes, y toma una captura de pantalla.
```

---

## Paso 5 — Scheduling Commands (Tareas Programadas)
*(Sección 5 del Codelab: Scheduling Commands)*

**Qué mostrar en pantalla:**
- Abre la pestaña **Schedule** en la barra lateral izquierda para mostrar cómo crear tareas recurrentes desde la interfaz gráfica o usando `/schedule`.
- Programa un temporizador de 60 segundos para que el público vea cómo la tarea corre en segundo plano y te despierta con una notificación automática al terminar.

### Prompt — Paso 5 (`/schedule`)
```text
/schedule Programa un temporizador único dentro de 60 segundos que consulte la API de GitHub para el usuario "ykro" (o ejecute `node src/cli.js --refresh-featured` si ya existe el CLI) y me envíe una notificación confirmando el total de repositorios públicos y estrellas actuales.
```

---

## Paso 6 — Model Context Protocol (MCP) Servers y Despliegue a Cloud Run
*(Sección 6 del Codelab: Model Context Protocol (MCP) Servers)*

**Qué mostrar en pantalla:**
1. Entra a **Settings -> Customizations -> Installed MCP Servers** y haz clic en **Open MCP Config** (`~/.gemini/config/mcp_config.json`).
2. Muestra el servidor MCP **`cloudrun`** (`@google-cloud/cloud-run-mcp`) y **`context7`**, explicando cómo puedes activar o desactivar herramientas específicas con un clic.

### Prompt 6A — Inspeccionar servicios con el MCP de Cloud Run
```text
Usa el servidor MCP de Cloud Run (`list_services`) para listar los servicios actuales en mi proyecto de Google Cloud y verificar el estado del servicio `github-comic-cards`.
```

### Prompt 6B — Publicar la app en Cloud Run con el MCP
```text
Usa la herramienta `deploy_local_folder` del servidor MCP de Cloud Run para desplegar este proyecto en Google Cloud Run (región `us-central1`, servicio `github-comic-cards`) y devuélveme la URL pública.
```

---

## Paso 7 — Artifacts (`/plan`, Implementation Plan, Walkthrough y Diffs)
*(Sección 7 del Codelab: Artifacts)*

**Qué mostrar en pantalla:**
- Explica cómo los **Artifacts** resuelven la brecha de confianza (*trust gap*): al usar `/plan`, el agente genera primero el **Implementation Plan** en el **Auxiliary Pane** (arriba a la derecha).
- Haz clic en **Proceed** y al terminar muestra el artifact **Walkthrough** y los diffs de los archivos creados (`src/github.js`, `src/comic-ai.js`, `src/server.js`, `public/index.html`).

### Prompt 7A — Construir la aplicación completa desde cero en una carpeta nueva con `/plan`
```text
/plan Diseña y construye la aplicación "GitHub Comic Heroes" en Node.js (usando el skill global `github-comic-heroes` si está disponible):
1. `src/github.js`: consulta la API pública de GitHub (`https://api.github.com/users/<username>` y `/repos`), obtiene los lenguajes principales, top 3 repositorios y descarga la foto de perfil (`avatar_url`) en base64.
2. `src/comic-ai.js`: usa `@google/genai` con Vertex AI (`vertexai: true`, `location: "global"`) para transformar en paralelo la foto de perfil real en una ilustración de superhéroe de cómic americano con el modelo `gemini-nano-banana-2.1` (`responseModalities: ["IMAGE"]`, `aspectRatio: "3:4"`) y generar con `gemini-3.8-flash` el alias de héroe, 2 superpoderes con puntaje PWR basados en sus repositorios y un grito de batalla.
3. `src/cli.js`, `src/server.js` y `public/index.html`: interfaz web estilo cómic en el puerto 8080 con trama halftone, insignia circular de la foto original junto al retrato ilustrado y galería Hall of Heroes.
4. Genera también el archivo `demo_bad_code.py` y el skill `.agents/skills/code-review/SKILL.md` para la etapa de auditoría. No uses diagramas Mermaid en el plan.
```

### Prompt 7B — Agregar una funcionalidad rápida en vivo con `/plan` (si la app ya está creada)
```text
/plan Agrega un endpoint `/api/card/:username/badge.svg` en `src/server.js` y un botón "Copiar Insignia para README" en `public/index.html` para que cualquier desarrollador pueda incrustar una tarjeta SVG con su alias de superhéroe, arquetipo y nivel de poder en su perfil de GitHub. No uses diagramas Mermaid.
```

---

## Paso 8 — Antigravity IDE (`Open IDE`)
*(Sección 8 del Codelab: Antigravity IDE)*

**Qué mostrar en pantalla:**
- Abre el **Auxiliary Panel** (esquina superior derecha) y haz clic en **Open IDE**.
- Muestra cómo se abre **Antigravity IDE** con todos los archivos del proyecto, el visor de cambios y el **Agent Panel** lateral donde puedes usar menciones `@` sobre cualquier archivo.

### Prompt — Paso 8 (En el Agent Panel de Antigravity IDE)
```text
Explica cómo la función `generateComicPortrait` en @src/comic-ai.js envía los bytes de la foto de perfil de GitHub como `inlineData` al modelo `gemini-nano-banana-2.1` en Vertex AI y cómo maneja el fallback automático.
```

---

## Paso 9 — Skills (`.agents/skills/code-review/SKILL.md`)
*(Sección 9 del Codelab: Skills — Progressive Disclosure)*

**Qué mostrar en pantalla:**
1. Explica **Progressive Disclosure**: Antigravity solo lee el encabezado YAML (`name` y `description`) de los skills al arrancar y carga las instrucciones completas de `.agents/skills/code-review/SKILL.md` únicamente cuando pides auditar código.
2. Muestra `.agents/skills/code-review/SKILL.md`, su script validador `.agents/skills/code-review/scripts/ast_audit.py` y el archivo `demo_bad_code.py`.

### Prompt 9A — Activar el Skill de revisión de código
```text
Revisa el archivo @demo_bad_code.py
```

### Prompt 9B — Corregir los defectos y verificar
```text
Corrige todos los problemas detectados en @demo_bad_code.py (maneja el caso en que `get_user_data` devuelve `None` para el usuario 3, elimina el `time.sleep(0.1)` bloqueante dentro del ciclo y evita sombrear el nombre reservado `id`), y ejecuta el validador `python3 .agents/skills/code-review/scripts/ast_audit.py demo_bad_code.py` para comprobar que pasa con 0 violaciones.
```
