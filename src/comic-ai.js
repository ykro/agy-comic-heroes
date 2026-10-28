import { execSync } from "node:child_process";
import { GoogleGenAI } from "@google/genai";

const IMAGE_MODEL = process.env.GEMINI_IMAGE_MODEL || "gemini-nano-banana-2.1";
const IMAGE_FALLBACK_MODEL = process.env.GEMINI_IMAGE_FALLBACK_MODEL || "gemini-3.1-flash-lite-image";
const TEXT_MODEL = process.env.GEMINI_TEXT_MODEL || "gemini-3.8-flash";
const LOCATION = process.env.GOOGLE_CLOUD_LOCATION || "global";

let cachedClient = null;

function resolveGcpProject() {
  if (process.env.GOOGLE_CLOUD_PROJECT) return process.env.GOOGLE_CLOUD_PROJECT;
  if (process.env.GCLOUD_PROJECT) return process.env.GCLOUD_PROJECT;
  if (process.env.VERTEX_PROJECT) return process.env.VERTEX_PROJECT;
  try {
    const out = execSync("gcloud config get-value project 2>/dev/null", { encoding: "utf-8" }).trim();
    if (out && out !== "(unset)") return out;
  } catch {
    // ignore
  }
  return null;
}

function getGenAIClient() {
  if (cachedClient) return cachedClient;
  if (process.env.GEMINI_API_KEY) {
    cachedClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    return cachedClient;
  }
  const project = resolveGcpProject();
  if (!project) {
    throw new Error(
      "Missing GCP Project or GEMINI_API_KEY. Set GOOGLE_CLOUD_PROJECT=<your-project-id> (for Vertex AI ADC) or GEMINI_API_KEY=<your-key>."
    );
  }
  cachedClient = new GoogleGenAI({
    vertexai: true,
    project,
    location: LOCATION
  });
  return cachedClient;
}

function buildFallbackLore(profile) {
  const mainLang = profile.topLanguages[0] || "Code";
  const topRepo = profile.topRepos[0]?.name || "the Mainframe";
  const powerScore = Math.min(99, 72 + Math.min(27, profile.publicRepos));
  return {
    heroAlias: `CAPTAIN ${mainLang.toUpperCase()}`,
    issueNumber: `#${Math.max(1, profile.publicRepos)}`,
    archetype: `${profile.topLanguages.join(" / ")} Vanguard`,
    superpowers: [
      {
        name: `${mainLang} Overdrive`,
        power: powerScore,
        description: `Forged across ${profile.publicRepos} public repositories.`
      },
      {
        name: `Starlight Shield (${topRepo})`,
        power: Math.min(99, 68 + (profile.totalStars % 31)),
        description: `Channels energy from ${profile.topRepos.map((r) => r.name).join(", ") || "open source"}.`
      }
    ],
    battleCry: `"Stand back! I'm deploying ${topRepo} straight to production!"`
  };
}

async function generateComicLore(profile) {
  try {
    const ai = getGenAIClient();
    const repoSummary = profile.topRepos
      .map((r) => `${r.name} (${r.language}, ${r.stars} stars): ${r.description}`)
      .join(" | ");

    const prompt = `Create a comic book superhero trading card profile for this GitHub developer based on their real data:
- Username: @${profile.username} (${profile.displayName})
- Bio: ${profile.bio}
- Top Languages: ${profile.topLanguages.join(", ")}
- Public Repos: ${profile.publicRepos}, Followers: ${profile.followers}, Stars: ${profile.totalStars}
- Highlighted Repositories: ${repoSummary}

Return ONLY valid JSON with this exact structure:
{
  "heroAlias": "ALL-CAPS COMIC HERO NAME (max 24 chars)",
  "issueNumber": "#<number>",
  "archetype": "Short 2-4 word comic class (e.g. 'Agentic Systems Sorcerer')",
  "superpowers": [
    { "name": "Power 1 name referencing their top language or repo", "power": 94, "description": "Short 1-line comic effect (max 70 chars)" },
    { "name": "Power 2 name referencing another repo or skill", "power": 89, "description": "Short 1-line comic effect (max 70 chars)" }
  ],
  "battleCry": "A short, punchy 1-sentence comic speech bubble quote referencing one of their real repo names"
}`;

    const res = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.9
      }
    });

    const parsed = JSON.parse(res.text || "{}");
    if (!parsed.heroAlias || !Array.isArray(parsed.superpowers)) {
      return buildFallbackLore(profile);
    }
    return {
      heroAlias: String(parsed.heroAlias).toUpperCase().slice(0, 28),
      issueNumber: parsed.issueNumber || `#${Math.max(1, profile.publicRepos)}`,
      archetype: parsed.archetype || `${profile.topLanguages[0]} Vigilante`,
      superpowers: parsed.superpowers.slice(0, 3),
      battleCry: parsed.battleCry || `"Deploying ${profile.topRepos[0]?.name || "code"} at light speed!"`
    };
  } catch {
    return buildFallbackLore(profile);
  }
}

async function generateComicPortrait(profile) {
  const ai = getGenAIClient();
  const mainLang = profile.topLanguages.join(" and ");
  const promptText = `Transform the person in this reference photo into a vibrant American comic book superhero illustration. Preserve their facial features, glasses, hair, or beard if present so they are recognizable. Style: bold black ink outlines, vintage Ben-Day halftone dots, dramatic comic lighting, heroic pose surrounded by glowing energy emblems inspired by ${mainLang} and software engineering. No text or speech bubbles inside the illustration.`;

  const parts = [];
  if (profile.avatarBase64) {
    parts.push({
      inlineData: {
        data: profile.avatarBase64,
        mimeType: profile.avatarMimeType
      }
    });
  }
  parts.push({ text: promptText });

  for (const model of [IMAGE_MODEL, IMAGE_FALLBACK_MODEL]) {
    try {
      const res = await ai.models.generateContent({
        model,
        contents: [{ role: "user", parts }],
        config: {
          responseModalities: ["IMAGE"],
          imageConfig: { aspectRatio: "3:4" }
        }
      });
      const imgPart = res.candidates?.[0]?.content?.parts?.find((p) => p.inlineData?.data)?.inlineData;
      if (imgPart?.data) {
        const mime = imgPart.mimeType || "image/png";
        return {
          imageDataUrl: `data:${mime};base64,${imgPart.data}`,
          modelUsed: model
        };
      }
    } catch (err) {
      console.warn(`[comic-ai] Image model ${model} failed: ${err.message?.slice(0, 120)}`);
    }
  }

  return {
    imageDataUrl: profile.avatarUrl,
    modelUsed: "github-avatar-fallback"
  };
}

export async function buildComicCard(profile) {
  const [lore, portrait] = await Promise.all([
    generateComicLore(profile),
    generateComicPortrait(profile)
  ]);

  return {
    username: profile.username,
    displayName: profile.displayName,
    avatarUrl: profile.avatarUrl,
    topLanguages: profile.topLanguages,
    publicRepos: profile.publicRepos,
    followers: profile.followers,
    totalStars: profile.totalStars,
    topRepos: profile.topRepos,
    heroAlias: lore.heroAlias,
    issueNumber: lore.issueNumber,
    archetype: lore.archetype,
    superpowers: lore.superpowers,
    battleCry: lore.battleCry,
    comicImageUrl: portrait.imageDataUrl,
    imageModelUsed: portrait.modelUsed,
    generatedAt: new Date().toISOString()
  };
}
