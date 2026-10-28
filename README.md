# GitHub Comic Heroes — Taller Práctico de Google Antigravity 2.0

Proyecto de demostración construido para recorrer en vivo los pasos **2 al 9** del Codelab oficial [**Getting Started with Google Antigravity**](https://codelabs.developers.google.com/getting-started-google-antigravity?hl=en#0).

Ingresa cualquier usuario de GitHub para obtener su foto de perfil real y sus repositorios principales desde la API de GitHub, transformar su rostro en una ilustración de superhéroe de cómic americano con **`gemini-nano-banana-2.1`** en Vertex AI y generar una carta coleccionable con sus superpoderes y su grito de batalla.

---

## Enlaces en Vivo

- **Aplicación en Vivo (Google Cloud Run):** [https://github-comic-cards-z63pqhhmxq-uc.a.run.app](https://github-comic-cards-z63pqhhmxq-uc.a.run.app)
- **Guía Interactiva Tipo Codelab (Firebase Hosting):** [https://agy-comic-heroes.web.app](https://agy-comic-heroes.web.app)
- **Guía de Prompts Paso a Paso (Pasos 2 al 9):** [`PROMPTS.md`](./PROMPTS.md)
- **Skill de Revisión de Código (`.agents/skills/code-review`):** [`.agents/skills/code-review/SKILL.md`](./.agents/skills/code-review/SKILL.md)

---

## Arquitectura del Sistema

![Arquitectura de GitHub Comic Heroes](./public/arquitectura.svg)

---

## Recorrido del Taller en Antigravity 2.0 (Pasos 2 al 9)

![Recorrido del Taller en Antigravity 2.0](./public/flujo-taller.svg)

Todos los prompts listos para copiar y pegar durante el taller están en [**`PROMPTS.md`**](./PROMPTS.md) y en la guía web interactiva en [**https://agy-comic-heroes.web.app**](https://agy-comic-heroes.web.app):

1. **Paso 2 — Instalación y Verificación del Entorno:** Comprobación de Antigravity 2.0, Antigravity IDE y credenciales de Google Cloud.
2. **Paso 3 — Interfaz de Antigravity 2.0:** Proyectos multi-carpeta, configuración de permisos (*Project Settings*) y conversaciones en paralelo.
3. **Paso 4 — Slash Commands (`/browser`):** Uso del subagente de Chrome para inspeccionar perfiles y probar visualmente la interfaz de cartas cómic.
4. **Paso 5 — Scheduling Commands (`/schedule`):** Automatización de tareas en segundo plano con notificaciones reactivas.
5. **Paso 6 — Servidores MCP (`cloudrun`):** Configuración de `~/.gemini/config/mcp_config.json` y despliegue directo a Google Cloud Run.
6. **Paso 7 — Artifacts (`/plan`):** Generación del *Implementation Plan* y del *Walkthrough* al construir o extender la aplicación.
7. **Paso 8 — Antigravity IDE:** Apertura del proyecto en el IDE desde el panel auxiliar y consultas sobre archivos con `@`.
8. **Paso 9 — Skills (`.agents/skills/code-review`):** Carga progresiva (*Progressive Disclosure*) para auditar y reparar `demo_bad_code.py`.

---

## Ejecución Local Rápida

### 1. Clonar e Instalar

```bash
git clone https://github.com/ykro/agy-comic-heroes.git
cd agy-comic-heroes
npm install
```

### 2. Configurar Credenciales (Sin llaves en el código)

Puedes ejecutar el proyecto con **Google Cloud Vertex AI** (usando Application Default Credentials) o con un **API Key de Gemini**:

```bash
# Opción A: Vertex AI con Application Default Credentials (Recomendado)
export GOOGLE_CLOUD_PROJECT="tu-proyecto-de-gcp"
gcloud auth application-default login

# Opción B: Gemini API Key
export GEMINI_API_KEY="tu-api-key"
```

### 3. Iniciar la Web o el CLI

```bash
# Iniciar el generador web en http://localhost:8080
npm start

# Generar una carta estilo cómic desde la terminal
node src/cli.js ykro

# Actualizar la carta destacada (usado en el Paso 5 con /schedule)
node src/cli.js --refresh-featured
```
