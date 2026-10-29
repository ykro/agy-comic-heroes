# GitHub Comic Heroes — Taller Práctico de Google Antigravity 2.0

Proyecto de demostración construido para recorrer en vivo los pasos **2 al 9** del Codelab oficial [**Getting Started with Google Antigravity**](https://codelabs.developers.google.com/getting-started-google-antigravity?hl=en#0).

Ingresa cualquier usuario de GitHub para obtener su foto de perfil real y sus repositorios principales desde la API de GitHub, transformar su rostro en una ilustración de superhéroe de cómic americano con **`gemini-nano-banana-2.1`** en Vertex AI y generar una carta coleccionable con sus superpoderes, su grito de batalla y su insignia SVG.

---

## Enlaces en Vivo

- **Aplicación en Vivo (Google Cloud Run):** [https://github-comic-cards-z63pqhhmxq-uc.a.run.app](https://github-comic-cards-z63pqhhmxq-uc.a.run.app)
- **Guía Interactiva Tipo Codelab (Firebase Hosting):** [https://agy-comic-heroes.web.app](https://agy-comic-heroes.web.app)
- **Guía de Prompts Paso a Paso (Pasos 2 al 9, Opción A y Opción B):** [`PROMPTS.md`](./PROMPTS.md)
- **Skill Editorial y Exportador SVG (`.agents/skills/comic-director`):** [`.agents/skills/comic-director/SKILL.md`](./.agents/skills/comic-director/SKILL.md)

---

## Arquitectura del Sistema

![Arquitectura de GitHub Comic Heroes](./public/arquitectura.svg)

---

## Recorrido del Taller en Antigravity 2.0 (Pasos 2 al 9)

![Recorrido del Taller en Antigravity 2.0](./public/flujo-taller.svg)

Tanto en [**`PROMPTS.md`**](./PROMPTS.md) como en [**https://agy-comic-heroes.web.app**](https://agy-comic-heroes.web.app), cada paso incluye **Opción A (para iniciar desde una carpeta vacía)** y **Opción B (para ejecutar sobre este proyecto ya creado)**:

1. **Paso 2 — Instalación y Verificación del Entorno:** Comprobación de Antigravity 2.0, Antigravity IDE y credenciales de Google Cloud.
2. **Paso 3 — Interfaz de Antigravity 2.0:** Proyectos multi-carpeta, configuración de permisos (*Project Settings*) y conversaciones en paralelo.
3. **Paso 4 — Slash Commands (`/browser`):** Uso del subagente de Chrome para inspeccionar perfiles y probar visualmente la interfaz de cartas cómic.
4. **Paso 5 — Scheduling Commands (`/schedule`):** Reclutador autónomo en segundo plano (`node src/cli.js --next-challenger`) que forja la carta del siguiente retador y notifica al terminar.
5. **Paso 6 — Servidores MCP (`cloudrun`):** Configuración de `~/.gemini/config/mcp_config.json` y despliegue directo a Google Cloud Run.
6. **Paso 7 — Artifacts (`/plan`):** Generación del *Implementation Plan* y del *Walkthrough* al construir la app desde cero (Opción A) o agregar el Modo Duelo VS (Opción B).
7. **Paso 8 — Antigravity IDE:** Apertura del proyecto en el IDE desde el panel auxiliar y consultas sobre archivos con `@`.
8. **Paso 9 — Skills (`.agents/skills/comic-director`):** Carga progresiva (*Progressive Disclosure*) para enriquecer el dossier del superhéroe (Rango `OMEGA CLASS`, Archienemigo e Historia de Origen) y exportar su insignia coleccionable en `public/badges/<username>.svg`.

---

## Ejecución Local Rápida

### 1. Clonar e Instalar

```bash
git clone https://github.com/ykro/agy-comic-heroes.git
cd agy-comic-heroes
npm install
```

### 2. Configurar Credenciales (Sin API keys en el código)

Puedes ejecutar el proyecto con **Google Cloud Vertex AI** (usando Application Default Credentials) o con un **API key de Gemini**:

```bash
# Opción 1: Vertex AI con Application Default Credentials (Recomendado)
export GOOGLE_CLOUD_PROJECT="tu-proyecto-de-gcp"
gcloud auth application-default login

# Opción 2: Gemini API key
export GEMINI_API_KEY="tu-api-key"
```

### 3. Iniciar la Web o el CLI

```bash
# Iniciar el generador web en http://localhost:8080
npm start

# Generar una carta estilo cómic desde la terminal
node src/cli.js ykro

# Reclutar y forjar automáticamente al siguiente retador (Paso 5: /schedule)
node src/cli.js --next-challenger

# Enriquecer carta y exportar insignia SVG con el Skill (Paso 9: Skills)
node .agents/skills/comic-director/scripts/hero_ranker.mjs ykro
```
