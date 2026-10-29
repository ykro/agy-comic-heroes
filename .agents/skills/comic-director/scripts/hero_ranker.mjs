#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const CARDS_PATH = path.resolve(process.cwd(), "data", "cards.json");
const BADGES_DIR = path.resolve(process.cwd(), "public", "badges");

const VILLAINS_BY_LANG = {
  TypeScript: "DOCTOR RACE-CONDITION & THE ANY-TYPE SWARM",
  JavaScript: "BARON UNDEFINED & THE CALLBACK ABYSS",
  Python: "THE GIL PHANTASM & BARON INDENTATION",
  Kotlin: "LORD NULL-POINTER & THE ANR TITAN",
  Rust: "THE BORROW-CHECKER INQUISITOR",
  Go: "GENERAL NIL-PANIC"
};

function computeTier(card) {
  const avgPower =
    (card.superpowers || []).reduce((acc, p) => acc + Number(p.power || 85), 0) /
    Math.max(1, (card.superpowers || []).length);
  const score = Math.min(99, Math.round(avgPower + Math.min(10, (card.publicRepos || 10) / 15)));
  if (score >= 92) return { tier: "OMEGA CLASS", score, color: "#FF3B30" };
  if (score >= 82) return { tier: "ALPHA CLASS", score, color: "#0066FF" };
  return { tier: "VANGUARD CLASS", score, color: "#0F766E" };
}

function buildOriginStory(card) {
  const repos = (card.topRepos || []).map((r) => r.name).slice(0, 3).join(", ");
  const langs = (card.topLanguages || ["Code"]).join(" & ");
  return `Forged across ${card.publicRepos} repositories of ${langs}, @${card.username} wields the artifacts of ${repos || "open source"} to defend production from catastrophic outages.`;
}

function renderBadgeSvg(card) {
  const safeAlias = String(card.heroAlias || "COMIC HERO").replace(/[<>&"]/g, "");
  const safeArch = String(card.archetype || "Vigilante").replace(/[<>&"]/g, "");
  const safeUser = String(card.username || "dev").replace(/[<>&"]/g, "");
  const safeTier = String(card.powerTier || "OMEGA CLASS").replace(/[<>&"]/g, "");
  const safeVillain = String(card.archNemesis || "DOCTOR BUG").replace(/[<>&"]/g, "");
  const langs = (card.topLanguages || []).join(" · ");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 680 190" width="680" height="190">
  <rect x="4" y="4" width="672" height="182" rx="14" fill="#FFFDF7" stroke="#0E1117" stroke-width="5"/>
  <rect x="4" y="4" width="672" height="46" rx="10" fill="#0E1117"/>
  <text x="22" y="34" font-family="'Bangers', 'Impact', sans-serif" font-size="25" fill="#FFD60A" letter-spacing="1.5">${safeAlias} — @${safeUser}</text>
  <rect x="520" y="13" width="140" height="28" rx="6" fill="#FF3B30"/>
  <text x="590" y="32" text-anchor="middle" font-family="monospace" font-size="13" font-weight="bold" fill="#FFFFFF">${safeTier}</text>

  <text x="24" y="82" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="16" font-weight="800" fill="#0E1117">ARCHETYPE: ${safeArch} (${langs})</text>
  <text x="24" y="112" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="14" font-weight="600" fill="#334155">NEMESIS: ${safeVillain}</text>
  <rect x="24" y="128" width="632" height="40" rx="8" fill="#FFD60A" stroke="#0E1117" stroke-width="2.5"/>
  <text x="38" y="153" font-family="monospace" font-size="13" font-weight="bold" fill="#0E1117">${String(card.battleCry || "").replace(/[<>&"]/g, "").slice(0, 78)}</text>
</svg>`;
}

function main() {
  const targetUser = (process.argv[2] || "ykro").replace(/^@/, "").toLowerCase();
  if (!fs.existsSync(CARDS_PATH)) {
    console.error("No cards.json found. Generate a card first with: node src/cli.js " + targetUser);
    process.exit(1);
  }

  const cards = JSON.parse(fs.readFileSync(CARDS_PATH, "utf-8"));
  const card = cards.find((c) => c.username.toLowerCase() === targetUser) || cards[0];
  if (!card) {
    console.error("No card available in data/cards.json");
    process.exit(1);
  }

  const { tier, score } = computeTier(card);
  const mainLang = (card.topLanguages && card.topLanguages[0]) || "TypeScript";
  card.powerTier = tier;
  card.overallRating = score;
  card.archNemesis = VILLAINS_BY_LANG[mainLang] || "LORD DOWNTIME & THE MEMORY LEAKS";
  card.originStory = card.originStory || buildOriginStory(card);

  fs.writeFileSync(CARDS_PATH, JSON.stringify(cards, null, 2));

  if (!fs.existsSync(BADGES_DIR)) fs.mkdirSync(BADGES_DIR, { recursive: true });
  const badgePath = path.join(BADGES_DIR, `${card.username.toLowerCase()}.svg`);
  fs.writeFileSync(badgePath, renderBadgeSvg(card));

  console.log("========================================================================");
  console.log(`COMIC DIRECTOR SKILL | ENRICHED HERO DOSSIER`);
  console.log("========================================================================");
  console.log(`Hero         : ${card.heroAlias} (@${card.username})`);
  console.log(`Power Tier   : ${card.powerTier} (Rating: ${card.overallRating}/99)`);
  console.log(`Arch-Nemesis : ${card.archNemesis}`);
  console.log(`Origin Story : ${card.originStory}`);
  console.log(`SVG Badge    : public/badges/${card.username.toLowerCase()}.svg`);
  console.log("========================================================================");
}

main();
