# Prompts del Taller en Vivo — GitHub Comic Heroes con Google Antigravity 2.0

**Codelab base:** [Getting Started with Google Antigravity](https://codelabs.developers.google.com/getting-started-google-antigravity?hl=en#0)  
**Proyecto:** GitHub Comic Heroes (Generador de Cartas estilo Cómic con foto de perfil real, datos de repositorios de GitHub y `gemini-nano-banana-2.1` en Vertex AI).

---

## Configuración Previa (Vertex AI + Cloud Run sin filtrar llaves)

El código (`src/comic-ai.js`) está diseñado para **no tener ningún API key ni Project ID quemado en el repositorio**:
1. **Con Vertex AI (Recomendado para tu demo en vivo):** Usa Application Default Credentials (ADC) y lee la variable de entorno `GOOGLE_CLOUD_PROJECT` (o el proyecto activo en `gcloud config`):
   ```bash
   export GOOGLE_CLOUD_PROJECT="YOUR_GCP_PROJECT_ID"
   ```
2. **Con API Key (Opcional para asistentes del taller):** Si alguien del público prefiere usar una llave de AI Studio sin configurar GCP, basta con exportar `GEMINI_API_KEY`:
   ```bash
   export GEMINI_API_KEY="tu-api-key"
   ```
3. **Modelo de imagen configurado:** `gemini-nano-banana-2.1` en la región `global` (recibe la foto real del avatar de GitHub en `inlineData` y la transforma en un superhéroe de cómic conservando los rasgos de la persona), con fallback automático a `gemini-3.1-flash-lite-image`.

---

## Paso 2 — Instalación y Verificación del Entorno
*(Sección 2 del Codelab: Installation & Setup)*

**Qué mostrar en Antigravity:**
- Muestra los dos íconos: **Antigravity 2.0** (centro de mando de agentes) y **Antigravity IDE**.
- Verifica con un primer prompt rápido que el agente tiene acceso al entorno y a las credenciales de Google Cloud.

### Prompt — Paso 2
```text
Check my local environment for this workshop: verify the installed Node.js and Python versions, confirm which Google Cloud project is currently configured in gcloud, and list the folders inside this workspace.
```

---

## Paso 3 — Interfaz de Antigravity 2.0, Proyectos y Conversaciones
*(Sección 3 del Codelab: Antigravity 2.0 Interface — Projects, Conversations & Project Settings)*

**Qué mostrar en Antigravity:**
1. **Projects (`Select Project` / `Project Settings`):** Abre el ícono de engranaje del proyecto y muestra cómo puedes agregar múltiples carpetas (`Add Folder`), ajustar el **Security Preset**, la política de revisión de **Artifacts** y qué **MCP Servers** están activos para este proyecto.
2. **Conversaciones múltiples:** Crea una primera conversación (`conv-github-data`) para explorar los datos reales de un perfil de GitHub, y luego una segunda conversación (`+ New Conversation in Project` -> `conv-comic-concept`) para demostrar cómo dos hilos trabajan sobre el mismo proyecto.

### Prompt 3A — Conversación 1 (`conv-github-data`)
```text
Fetch the public GitHub profile and top repositories for user "ykro" using the GitHub REST API. Summarize their display name, avatar URL, top 3 programming languages, and top 3 repositories in a clean table.
```

### Prompt 3B — Conversación 2 (`conv-comic-concept`)
```text
Based on a developer whose top languages are TypeScript, Python, and Kotlin and who builds autonomous AI agents, propose a Comic Book Superhero alias, 2 signature superpowers with power ratings (1-99), and a one-line comic battle cry.
```

---

## Paso 4 — Slash Commands (`/plan`, `/browser`, `/schedule`)
*(Sección 4 del Codelab: Slash Commands)*

**Qué mostrar en Antigravity:**
- Escribe `/` en el chat para desplegar todos los comandos (`/plan`, `/browser`, `/schedule`, `/boost`, `/teamwork`, `/grill-me`, `/learn`).
- Muestra `/browser` en acción: el subagente abre Google Chrome, entra a la app de **GitHub Comic Heroes**, escribe un usuario de GitHub, genera o inspecciona la carta estilo cómic y devuelve el resultado.

### Prompt — Paso 4 (`/browser`)
```text
/browser Make sure our server (`node src/server.js`) is running on port 8080. Open http://localhost:8080 in Chrome, verify that the GitHub Comic Heroes card is displayed with the comic book portrait, original GitHub avatar badge, speech bubble, and superpowers, and take a screenshot.
```

---

## Paso 5 — Scheduling Commands (Tareas Programadas)
*(Sección 5 del Codelab: Scheduling Commands)*

**Qué mostrar en Antigravity:**
- Abre la sección **Schedule** en la barra izquierda para mostrar cómo programar tareas recurrentes por interfaz gráfica o con `/schedule`.
- Ejecuta un timer corto de 60 segundos que corra `node src/cli.js --refresh-featured` en segundo plano para actualizar la carta destacada del "Hall of Heroes" y notificarte reactivamente en pantalla.

### Prompt — Paso 5 (`/schedule`)
```text
/schedule Set a one-time timer for 60 seconds from now to run `node src/cli.js --refresh-featured` in this project and notify me with the hero alias and issue number once the Featured Hero card has been refreshed.
```

---

## Paso 6 — Model Context Protocol (MCP) Servers y Despliegue a Cloud Run
*(Sección 6 del Codelab: Model Context Protocol (MCP) Servers)*

**Qué mostrar en Antigravity:**
1. Ve a **Settings -> Customizations -> Installed MCP Servers** y haz clic en **Open MCP Config** (`~/.gemini/config/mcp_config.json`).
2. Muestra el servidor MCP **`cloudrun`** (`@google-cloud/cloud-run-mcp`) y sus herramientas (`list_services`, `deploy_local_folder`, `get_service_log`).
3. Despliega la aplicación en vivo a **Google Cloud Run** usando el MCP de Cloud Run (o el shell).

### Prompt — Paso 6 (MCP `cloudrun`)
```text
Use the Cloud Run MCP server (`deploy_local_folder` or `list_services`) to deploy this project to Google Cloud Run in my Google Cloud project (region "us-central1", service name "github-comic-cards"), and return the live public Cloud Run URL.
```

---

## Paso 7 — Artifacts (`/plan`, Implementation Plan, Walkthrough y Diffs)
*(Sección 7 del Codelab: Artifacts)*

**Qué mostrar en Antigravity:**
- Muestra cómo `/plan` resuelve el *trust gap* generando primero el artifact **Implementation Plan** (con diagrama de arquitectura en Mermaid y botón **Proceed**) y al terminar entrega el artifact **Walkthrough** junto con los diffs de archivos en el **Auxiliary Pane**.
- Puedes usar el Prompt 7A para construir toda la app desde cero con `/plan`, o el Prompt 7B para agregar en vivo un exportador de cartas coleccionables en menos de 30 segundos.

### Prompt 7A — Construir la app completa con `/plan`
```text
/plan Design and build "GitHub Comic Heroes", a Node.js application (CLI in `src/cli.js` + Web UI in `src/server.js` and `public/index.html`) that takes any GitHub username, fetches their profile photo (`avatar_url`) and repositories from the GitHub API (`src/github.js`), and uses Vertex AI (`@google/genai` in `src/comic-ai.js`) to:
1. Transform their real GitHub profile photo into an American comic book superhero illustration using `gemini-nano-banana-2.1` (location `global`, aspect ratio `3:4`).
2. Generate their Comic Hero Alias, 2-3 Superpowers based on their top repositories/languages, and a speech bubble Battle Cry using `gemini-3.8-flash`.
3. Render the interactive Comic Book Trading Card and a "Hall of Heroes" gallery in a comic-styled web UI on port 8080.
Include a Mermaid architecture diagram in the Implementation Plan.
```

### Prompt 7B — Extensión rápida en vivo con `/plan` (si la app ya está creada)
```text
/plan Add a `/api/card/:username/badge.svg` endpoint to `src/server.js` and a "Copy Markdown Badge" button on the comic card in `public/index.html` so developers can embed their Comic Hero title, archetype, and power rating directly in their GitHub profile README. Include a Mermaid flow diagram in the Implementation Plan.
```

---

## Paso 8 — Antigravity IDE (`Open IDE`)
*(Sección 8 del Codelab: Antigravity IDE)*

**Qué mostrar en Antigravity:**
- Abre el **Auxiliary Panel** (esquina superior derecha) y haz clic en **Open IDE**.
- Muestra el proyecto abierto en **Antigravity IDE** (`src/comic-ai.js`, `src/github.js`, `public/index.html`, `demo_bad_code.py`), cómo inspeccionar los diffs y cómo conversar con el agente directamente en el panel lateral del IDE.

### Prompt — Paso 8 (Desde el Agent Panel en Antigravity IDE)
```text
Explain how `generateComicPortrait` in @src/comic-ai.js passes the GitHub avatar image as `inlineData` to `gemini-nano-banana-2.1` and how the automatic fallback works if the primary model quota is reached.
```

---

## Paso 9 — Skills (`.agents/skills/code-review/SKILL.md`)
*(Sección 9 del Codelab: Skills — Progressive Disclosure)*

**Qué mostrar en Antigravity:**
1. Explica **Progressive Disclosure**: Antigravity solo carga en contexto el nombre y descripción de los skills al inicio, y lee el contenido completo de `.agents/skills/code-review/SKILL.md` únicamente cuando pides revisar código.
2. Muestra `.agents/skills/code-review/SKILL.md` y el archivo `demo_bad_code.py` incluido en el repositorio (exactamente el mismo del Codelab oficial para que todos los asistentes obtengan el mismo resultado, más su script verificador en `.agents/skills/code-review/scripts/ast_audit.py`).

### Prompt 9A — Auditar `@demo_bad_code.py` activando el Skill
```text
review the @demo_bad_code.py file
```

### Prompt 9B — Aplicar las correcciones y verificar
```text
Fix the bugs and performance issues identified in @demo_bad_code.py (handle the None return when user ID 3 is missing, remove the blocking `time.sleep(0.1)` inside the loop, and avoid shadowing the built-in `id`), then run the script to verify it completes cleanly without errors.
```
