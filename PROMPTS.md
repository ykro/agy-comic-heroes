# Prompts para el taller — GitHub Comic Heroes con Google Antigravity 2.0

Todo el código está disponible en este [repo](https://github.com/ykro/agy-comic-heroes), aquí está el [codelab interactivo](https://agy-comic-heroes.web.app) hospedado en [Firebase Hosting](https://firebase.google.com/docs/hosting), la [app en vivo](https://github-comic-cards-z63pqhhmxq-uc.a.run.app) corriendo en [Cloud Run](https://cloud.google.com/run/docs) y el [codelab oficial](https://codelabs.developers.google.com/getting-started-google-antigravity?hl=en#0) de Google Antigravity.

![Recorrido del Taller](./public/flujo-taller.svg)

## Qué se construye y cómo usar las opciones A y B

La aplicación toma un usuario de GitHub, descarga su foto de perfil y sus repositorios principales desde el API de GitHub y genera una carta estilo cómic americano usando [Vertex AI](https://cloud.google.com/vertex-ai/docs) con `gemini-nano-banana-2.1` y `gemini-3.8-flash`.

En cada paso hay dos opciones listas para copiar durante la sesión en vivo.

- **Opción A (Carpeta vacía)** sirve cuando abres una carpeta nueva al iniciar el taller y sigues el orden del codelab oficial, donde la aplicación completa se construye en el **Paso 7** con `/plan`.
- **Opción B (Proyecto ya creado)** sirve cuando trabajas directamente sobre este repositorio para probar el código, el servidor local y las cartas desde el primer paso.

Antes de arrancar la demostración conviene verificar cinco puntos en tu máquina.
1. Tener Google Chrome abierto como navegador predeterminado para que `/browser` conecte de inmediato.
2. Tener Antigravity 2.0 y Antigravity IDE instalados.
3. Tener las credenciales de Google Cloud activas con `gcloud auth application-default login` y `export GOOGLE_CLOUD_PROJECT="ai-experiments-487722"`, o bien definir `export GEMINI_API_KEY="tu-api-key"`.
4. Confirmar que `~/.gemini/config/mcp_config.json` tenga configurado `@google-cloud/cloud-run-mcp`.
5. Tener instalado el skill global `~/.gemini/config/skills/github-comic-heroes/`.

---

## Paso 2 — Instalación y verificación del entorno

Se muestran las dos aplicaciones instaladas en el sistema, Antigravity 2.0 y Antigravity IDE, y se comprueba que el entorno tenga Node.js y acceso a Google Cloud sin uso de key en el código fuente.

### Opción A (Carpeta vacía)
```text
Verifica mi entorno local para empezar el taller desde cero, revisa las versiones instaladas de Node.js y Python, confirma qué proyecto de Google Cloud está activo en gcloud y verifica que esta carpeta esté vacía.
```

### Opción B (Proyecto ya creado)
```text
Verifica mi entorno local, revisa la versión de Node.js, confirma qué proyecto de Google Cloud está configurado en gcloud y resume los módulos de este repositorio (`src/`, `public/` y `.agents/skills/`).
```

---

## Paso 3 — Proyectos y conversaciones en paralelo

Un proyecto en Antigravity 2.0 agrupa una o más carpetas y define sus permisos de seguridad, la revisión de *artifacts* y los servidores MCP activos desde *Project Settings*. Dentro del mismo proyecto se pueden abrir varias conversaciones en paralelo para trabajar en distintas tareas sin mezclar el contexto.

### Opción A (Carpeta vacía)
**Conversación 1 (`conv-datos-github`):**
```text
Consulta el perfil público y los repositorios del usuario "ykro" usando el API de GitHub. Arma una tabla con su nombre, la URL de su foto de perfil (`avatar_url`), sus 3 lenguajes principales y sus 3 repositorios con más actividad.
```
**Conversación 2 (`conv-idea-comic`):**
```text
Para un desarrollador que programa en TypeScript, Python y Kotlin y trabaja con agentes de IA, propón un alias de superhéroe de cómic, 2 superpoderes con puntaje PWR de 1 a 99, un enemigo principal y una frase para su globo de diálogo.
```

### Opción B (Proyecto ya creado)
**Conversación 1 (`conv-datos-github`):**
```text
Revisa @src/github.js y consulta el API de GitHub para el usuario "ykro". Muéstrame en una tabla los datos que extrae (`avatarUrl`, `topLanguages`, `topRepos`) para armar la carta.
```
**Conversación 2 (`conv-idea-comic`):**
```text
Lee @data/cards.json y lista las cartas guardadas en la galería con su alias, arquetipo, modelo de imagen y superpoderes.
```

---

## Paso 4 — Slash Commands y pruebas con `/browser`

Al escribir `/` en el chat aparece el menú de comandos (`/plan`, `/browser`, `/schedule`, `/boost`, `/teamwork`, `/grill-me`, `/learn`). El comando `/browser` abre un subagente en Google Chrome que navega la página y adjunta capturas de pantalla como evidencia.

### Opción A (Carpeta vacía)
```text
/browser Abre https://github.com/ykro en Chrome, identifica la foto de perfil, la biografía y los repositorios principales visibles en la página y devuélveme un resumen con una captura de pantalla.
```

### Opción B (Proyecto ya creado)
```text
/browser Asegúrate de que el servidor (`node src/server.js`) esté corriendo en el puerto 8080. Abre http://localhost:8080 en Chrome, verifica que se muestre la carta con el retrato generado por Nano Banana 2.1, el avatar original de GitHub y los superpoderes, y toma una captura de pantalla.
```

---

## Paso 5 — Time-based loops con `/schedule`

El comando `/schedule` permite configurar *time-based loops* y temporizadores en segundo plano. Esta parte asíncrona es clave porque el trabajo puede ocurrir afuera del proyecto mientras uno sigue en otra tarea, por ejemplo revisar un PR abierto en GitHub, ver si ya entraron comentarios de un *reviewer*, vigilar un pipeline de CI que falla para arreglarlo en cuanto truene o consultar un API externo cada cierto tiempo.

### Opción A (Carpeta vacía — revisar PRs, comentarios de reviewer o estado del CI)
```text
/schedule Configura un temporizador dentro de 60 segundos que consulte en GitHub la actividad reciente, PRs abiertos o estado de CI del repositorio `ykro/agy-comic-heroes` (o los repositorios públicos de `ykro`) y me avise si hay comentarios pendientes de un reviewer o algún cambio que atender.
```

### Opción B (Proyecto ya creado — vigilar el repo y generar un enemigo en la galería)
```text
/schedule Programa una tarea dentro de 60 segundos que revise si hay PRs o ejecuciones de CI fallidas en el repositorio de GitHub y además ejecute `node src/cli.js --next-enemy` para generar la carta del siguiente enemigo en `data/cards.json`. Cuando termine, avísame qué encontró y qué enemigo se agregó.
```

---

## Paso 6 — Servidores MCP y Cloud Run

En la versión actual de Antigravity 2.0, la pestaña **Customizations** en la barra lateral izquierda muestra el catálogo de plugins y skills, mientras que los servidores MCP globales se definen en `~/.gemini/config/mcp_config.json` (también visibles en Antigravity IDE desde **... -> MCP Servers** o con `@` en el chat). Con `@google-cloud/cloud-run-mcp` activo, el agente puede consultar servicios y logs en Cloud Run directamente desde la conversación.

### Opción A (Carpeta vacía)
```text
Muéstrame la configuración actual de `~/.gemini/config/mcp_config.json` y luego usa el servidor MCP de Cloud Run (`list_services` y `get_service`) para revisar los servicios activos en mi proyecto de Google Cloud (`ai-experiments-487722`) en `us-central1` y darme la URL pública de `github-comic-cards`.
```

### Opción B (Proyecto ya creado)
```text
Muéstrame el contenido de `~/.gemini/config/mcp_config.json` y usa el servidor MCP de Cloud Run (`get_service` y `get_service_log`) para verificar el estado del servicio `github-comic-cards` del proyecto `ai-experiments-487722` en `us-central1`, revisar sus últimos logs y devolverme la URL pública activa.
```

---

## Paso 7 — Artifacts con `/plan`

Al correr `/plan`, Antigravity genera un *Implementation Plan* en el panel auxiliar derecho esperando confirmación con *Proceed* antes de modificar archivos, y al finalizar entrega un *Walkthrough* con el resumen y los diffs.

### Opción A (Carpeta vacía — construir la aplicación completa)
```text
/plan Diseña y construye la aplicación "GitHub Comic Heroes" en Node.js siguiendo el skill global `github-comic-heroes`:
1. `src/github.js` consulta el API público de GitHub (`https://api.github.com/users/<username>` y `/repos`), obtiene los lenguajes principales, los 3 repositorios más relevantes y descarga el avatar en base64.
2. `src/comic-ai.js` usa `@google/genai` con Vertex AI (`vertexai: true`, `location: "global"`) sin uso de key en el código para transformar en paralelo la foto de perfil en una ilustración estilo cómic con `gemini-nano-banana-2.1` (`responseModalities: ["IMAGE"]`, `aspectRatio: "3:4"`) y generar con `gemini-3.8-flash` el alias, 2 superpoderes con puntaje PWR y una frase de batalla.
3. `src/cli.js` (con soporte para `<username>` y `--next-enemy`), `src/server.js` y `public/index.html` con la galería web en el puerto 8080.
4. Incluye el skill `.agents/skills/comic-director/SKILL.md` y su script `.agents/skills/comic-director/scripts/hero_ranker.mjs`.
```

### Opción B (Proyecto ya creado — agregar modo versus contra enemigos)
```text
/plan Agrega un endpoint `GET /api/battle?hero=ykro&enemy=torvalds` en `src/server.js` y un botón en `public/index.html` para enfrentar a un héroe contra un enemigo de la galería comparando sus puntos PWR, repositorios y estrellas.
```

---

## Paso 8 — Antigravity IDE (`Open IDE`)

Desde el botón **Open IDE** en la esquina superior derecha se abre el proyecto en Antigravity IDE para revisar el árbol de archivos, inspeccionar diffs y hacer consultas con `@` en el panel lateral.

### Opción A (Carpeta recién construida)
```text
En @src/comic-ai.js, explícame cómo corren en paralelo `generateComicLore` (`gemini-3.8-flash`) y `generateComicPortrait` (`gemini-nano-banana-2.1`) con `Promise.all` para reducir la latencia al crear una carta.
```

### Opción B (Proyecto ya creado)
```text
Revisa @src/comic-ai.js y @src/store.js, y explícame cómo se envía el avatar de GitHub en `inlineData` hacia `gemini-nano-banana-2.1` y cómo se persiste la imagen en `public/generated/`.
```

---

## Paso 9 — Skills del proyecto (`.agents/skills/comic-director/SKILL.md`)

Los skills en `.agents/skills/` funcionan con *Progressive Disclosure*, el agente lee primero el nombre y la descripción en el encabezado YAML y solo carga las instrucciones completas y el script `.agents/skills/comic-director/scripts/hero_ranker.mjs` cuando la tarea lo requiere. El skill `comic-director` calcula el rango del personaje, le asigna su enemigo principal según su lenguaje dominante, redacta su historia de origen y exporta una insignia SVG para el perfil de GitHub.

### Opción A (Crear y ejecutar el skill)
```text
Crea un skill en `.agents/skills/comic-director/SKILL.md` (con su script en `scripts/hero_ranker.mjs`) que tome una carta de `data/cards.json`, calcule su rango (`OMEGA CLASS` o `ALPHA CLASS`), le asigne un enemigo según su lenguaje principal, redacte su historia de origen y exporte una insignia SVG en `public/badges/<username>.svg`. Luego ejecútalo para `ykro`.
```

### Opción B (Proyecto ya creado)
```text
Usa el skill `comic-director` para actualizar la carta de `ykro` en @data/cards.json con su rango, su enemigo principal y su historia de origen a partir de sus repositorios, y genera su insignia SVG en `public/badges/ykro.svg`.
```

---

## Conclusiones

Con este recorrido cubrimos de punta a punta la experiencia de trabajo en Antigravity 2.0, desde la organización por proyectos y conversaciones hasta el uso de `/browser`, *time-based loops* con `/schedule`, servidores MCP para Cloud Run, *artifacts* con `/plan` y *skills* propios del repositorio. **Nos vemos en el código.**
