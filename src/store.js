import fs from "node:fs";
import path from "node:path";

const DATA_DIR = path.resolve(process.cwd(), "data");
const GENERATED_DIR = path.resolve(process.cwd(), "public", "generated");
const BADGES_DIR = path.resolve(process.cwd(), "public", "badges");
const CARDS_FILE = path.join(DATA_DIR, "cards.json");

function ensureDirs() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(GENERATED_DIR)) fs.mkdirSync(GENERATED_DIR, { recursive: true });
  if (!fs.existsSync(BADGES_DIR)) fs.mkdirSync(BADGES_DIR, { recursive: true });
}

function renderCardBadgeSvg(card) {
  const safeAlias = String(card.heroAlias || "COMIC HERO").replace(/[<>&"]/g, "");
  const safeArch = String(card.archetype || "Vigilante").replace(/[<>&"]/g, "");
  const safeUser = String(card.username || "dev").replace(/[<>&"]/g, "");
  const safeTier = String(card.powerTier || "OMEGA CLASS").replace(/[<>&"]/g, "");
  const safeVillain = String(card.archNemesis || "DOCTOR BUG").replace(/[<>&"]/g, "");
  const langs = (card.topLanguages || []).join(" · ").replace(/[<>&"]/g, "");
  const tierColor = safeTier.includes("OMEGA") ? "#FF3B30" : safeTier.includes("ALPHA") ? "#0066FF" : "#0F766E";

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 680 190" width="680" height="190">
  <rect x="4" y="4" width="672" height="182" rx="14" fill="#FFFDF7" stroke="#0E1117" stroke-width="5"/>
  <rect x="4" y="4" width="672" height="46" rx="10" fill="#0E1117"/>
  <text x="22" y="34" font-family="'Bangers', 'Impact', sans-serif" font-size="25" fill="#FFD60A" letter-spacing="1.5">${safeAlias} — @${safeUser}</text>
  <rect x="520" y="13" width="140" height="28" rx="6" fill="${tierColor}"/>
  <text x="590" y="32" text-anchor="middle" font-family="monospace" font-size="13" font-weight="bold" fill="#FFFFFF">${safeTier}</text>

  <text x="24" y="82" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="16" font-weight="800" fill="#0E1117">ARCHETYPE: ${safeArch} (${langs})</text>
  <text x="24" y="112" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="14" font-weight="700" fill="#D92D20">ENEMIGO PRINCIPAL: ${safeVillain}</text>
  <rect x="24" y="128" width="632" height="40" rx="8" fill="#FFD60A" stroke="#0E1117" stroke-width="2.5"/>
  <text x="38" y="153" font-family="monospace" font-size="13" font-weight="bold" fill="#0E1117">${String(card.battleCry || "").replace(/[<>&"]/g, "").slice(0, 78)}</text>
</svg>`;
}

export function loadCards() {
  ensureDirs();
  if (!fs.existsSync(CARDS_FILE)) {
    return [];
  }
  try {
    return JSON.parse(fs.readFileSync(CARDS_FILE, "utf-8"));
  } catch {
    return [];
  }
}

export function saveCard(card) {
  ensureDirs();
  const storedCard = { ...card };
  const safeUser = String(storedCard.username || "hero")
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, "");

  if (storedCard.comicImageUrl && storedCard.comicImageUrl.startsWith("data:")) {
    const match = storedCard.comicImageUrl.match(/^data:([^;]+);base64,(.+)$/);
    if (match) {
      const ext = match[1].includes("png") ? "png" : "jpg";
      const fileName = `${safeUser}.${ext}`;
      const filePath = path.join(GENERATED_DIR, fileName);
      fs.writeFileSync(filePath, Buffer.from(match[2], "base64"));
      storedCard.comicImageUrl = `/generated/${fileName}?t=${Date.now()}`;
    }
  }

  // Always write collectible SVG badge so /badges/<username>.svg never 404s
  const badgePath = path.join(BADGES_DIR, `${safeUser}.svg`);
  fs.writeFileSync(badgePath, renderCardBadgeSvg(storedCard));

  const cards = loadCards().filter(
    (c) => String(c.username || "").toLowerCase() !== safeUser
  );
  cards.unshift(storedCard);
  const trimmed = cards.slice(0, 12);

  // Atomic file write using temp file + renameSync
  const tmpFile = `${CARDS_FILE}.tmp.${process.pid}.${Date.now()}`;
  fs.writeFileSync(tmpFile, JSON.stringify(trimmed, null, 2));
  fs.renameSync(tmpFile, CARDS_FILE);
  return storedCard;
}
