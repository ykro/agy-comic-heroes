#!/usr/bin/env node
import { fetchGitHubProfile } from "./github.js";
import { buildComicCard } from "./comic-ai.js";
import { loadCards, saveCard } from "./store.js";

const ENEMIES_QUEUE = ["torvalds", "sindresorhus", "gaearon", "addyosmani", "tj"];

async function main() {
  const args = process.argv.slice(2);
  const isNextEnemy =
    args.includes("--next-enemy") ||
    args.includes("--next-challenger") ||
    args.includes("--refresh-featured");

  let targetUser = args.find((a) => !a.startsWith("--")) || "ykro";
  if (isNextEnemy) {
    const existingUsers = new Set(loadCards().map((c) => c.username.toLowerCase()));
    targetUser = ENEMIES_QUEUE.find((u) => !existingUsers.has(u)) || ENEMIES_QUEUE[0];
    console.log(`[SCHEDULE] Generando carta de enemigo para @${targetUser}...`);
  } else {
    console.log(`[CLI] Consultando perfil y repositorios de GitHub para @${targetUser}...`);
  }

  const profile = await fetchGitHubProfile(targetUser);
  const card = await buildComicCard(profile);
  const saved = saveCard(card);

  console.log("========================================================================");
  console.log(`COMIC CARD GENERATED | ${saved.heroAlias} (${saved.issueNumber})`);
  console.log("========================================================================");
  console.log(`Developer  : ${saved.displayName} (@${saved.username})`);
  console.log(`Archetype  : ${saved.archetype}`);
  console.log(`Languages  : ${saved.topLanguages.join(", ")} | Repos: ${saved.publicRepos} | Stars: ${saved.totalStars}`);
  console.log(`Image Model: ${saved.imageModelUsed} -> ${saved.comicImageUrl}`);
  console.log("------------------------------------------------------------------------");
  for (const p of saved.superpowers) {
    console.log(`  * [${p.power} PWR] ${p.name}: ${p.description}`);
  }
  console.log("------------------------------------------------------------------------");
  console.log(`Battle Cry : ${saved.battleCry}`);
  console.log("========================================================================");
}

main().catch((err) => {
  console.error("[ERROR]", err.message);
  process.exit(1);
});
