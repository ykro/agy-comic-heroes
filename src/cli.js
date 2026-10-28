#!/usr/bin/env node
import { fetchGitHubProfile } from "./github.js";
import { buildComicCard } from "./comic-ai.js";
import { loadCards, saveCard } from "./store.js";

async function main() {
  const args = process.argv.slice(2);
  const isRefresh = args.includes("--refresh-featured");

  let targetUser = args.find((a) => !a.startsWith("--")) || "ykro";
  if (isRefresh) {
    const existing = loadCards();
    targetUser = existing[0]?.username || "ykro";
    console.log(`[SCHEDULED TASK] Refreshing Featured Hero card for @${targetUser}...`);
  } else {
    console.log(`[COMIC FORGE] Fetching GitHub profile and repositories for @${targetUser}...`);
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
