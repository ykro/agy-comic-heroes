---
name: comic-director
description: Enriquecedor editorial de cartas de GitHub Comic Heroes y generador de insignias coleccionables SVG para perfiles de GitHub. Úsalo cuando pidan mejorar la biografía/historia de origen de una carta, asignar su rango de poder (Omega/Alpha), crearle un archienemigo o exportar su insignia SVG para el README de GitHub.
---

# Comic Director Skill — Editorial & SVG Badge Exporter

Cuando el usuario pida mejorar o enriquecer una carta de **GitHub Comic Heroes**, redactar su historia de origen y archienemigo, o generar su insignia coleccionable para GitHub:

## 1. Reglas Editoriales del Universo Cómic
1. **Historia de Origen (`originStory`):** Redacta un párrafo corto (máximo 280 caracteres) con tono de portada clásica de cómic que conecte su biografía real y sus 3 repositorios principales como artefactos de poder.
2. **Archienemigo de Producción (`archNemesis`):** Asígnale un villano técnico acorde a su lenguaje principal (por ejemplo, para TypeScript/JS: *Doctor Race-Condition*; para Python: *The GIL Phantasm*; para Kotlin/Android: *Lord NullPointer*).
3. **Rango Oficial (`powerTier`):** Clasifica al héroe en `OMEGA CLASS`, `ALPHA CLASS` o `VANGUARD CLASS` según el impacto de sus repositorios y superpoderes.

## 2. Generación de la Insignia SVG Coleccionable
Ejecuta siempre el script del skill para calcular el rango, actualizar `data/cards.json` y generar el archivo SVG listo para compartir en `public/badges/<username>.svg`:

```bash
node .agents/skills/comic-director/scripts/hero_ranker.mjs <username>
```

## 3. Formato de Respuesta
Entrega al usuario:
- Una tabla resumen con: `Héroe`, `Rango Oficial`, `Archienemigo` e `Historia de Origen`.
- La ruta de la insignia generada (`public/badges/<username>.svg`) y el snippet en Markdown listo para pegar en su perfil de GitHub.
