import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { URL } from "node:url";
import { fetchGitHubProfile } from "./github.js";
import { buildComicCard } from "./comic-ai.js";
import { loadCards, saveCard } from "./store.js";

const PORT = Number(process.env.PORT || 8080);
const PUBLIC_DIR = path.resolve(process.cwd(), "public");
const CODELAB_DIR = path.resolve(process.cwd(), "codelab");
const MAX_BODY_BYTES = 16 * 1024;

const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "SAMEORIGIN",
  "Referrer-Policy": "strict-origin-when-cross-origin"
};

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml"
};

function sendJson(res, status, payload) {
  res.writeHead(status, {
    ...SECURITY_HEADERS,
    "Content-Type": "application/json; charset=utf-8"
  });
  res.end(JSON.stringify(payload, null, 2));
}

function serveStaticFile(res, filePath) {
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    sendJson(res, 404, { error: "Not found" });
    return;
  }
  const ext = path.extname(filePath).toLowerCase();
  res.writeHead(200, {
    ...SECURITY_HEADERS,
    "Content-Type": MIME_TYPES[ext] || "application/octet-stream"
  });
  fs.createReadStream(filePath).pipe(res);
}

function computeCardPower(card) {
  if (typeof card.overallRating === "number" && card.overallRating <= 99) {
    return card.overallRating;
  }
  const avgPwr =
    (card.superpowers || []).reduce((acc, p) => acc + Number(p.power || 85), 0) /
    Math.max(1, (card.superpowers || []).length);
  return Math.min(99, Math.round(avgPwr + Math.min(6, (card.publicRepos || 10) / 25)));
}

const server = http.createServer(async (req, res) => {
  const reqUrl = new URL(req.url || "/", `http://localhost:${PORT}`);

  if (reqUrl.pathname === "/healthz") {
    sendJson(res, 200, { status: "ok", service: "github-comic-cards" });
    return;
  }

  if (reqUrl.pathname === "/api/cards" && req.method === "GET") {
    sendJson(res, 200, loadCards());
    return;
  }

  if (reqUrl.pathname === "/api/battle" && req.method === "GET") {
    const cards = loadCards();
    const heroName = (reqUrl.searchParams.get("hero") || reqUrl.searchParams.get("hero1") || "ykro").toLowerCase();
    const enemyName = (reqUrl.searchParams.get("enemy") || reqUrl.searchParams.get("hero2") || "").toLowerCase();

    const hero = cards.find((c) => c.username.toLowerCase() === heroName) || cards[0];
    const enemy =
      cards.find((c) => c.username.toLowerCase() === enemyName) ||
      cards.find((c) => c.username.toLowerCase() !== hero?.username?.toLowerCase()) ||
      hero;

    if (!hero) {
      sendJson(res, 404, { error: "No cards available" });
      return;
    }

    const heroScore = computeCardPower(hero);
    const enemyScore = enemy ? computeCardPower(enemy) : 88;
    const winner = heroScore >= enemyScore ? hero : enemy;

    sendJson(res, 200, {
      hero: { username: hero.username, heroAlias: hero.heroAlias, score: heroScore },
      enemy: { username: enemy.username, heroAlias: enemy.heroAlias, score: enemyScore, archNemesis: hero.archNemesis },
      winner: winner.username,
      narrative: `${hero.heroAlias} (@${hero.username}, ${heroScore} PWR) se enfrenta a ${enemy.heroAlias} (@${enemy.username}, ${enemyScore} PWR) y derrota a ${hero.archNemesis || "DOCTOR BUG"}.`
    });
    return;
  }

  if (reqUrl.pathname === "/api/generate" && req.method === "POST") {
    let requestedUser = "ykro";
    try {
      let body = "";
      let bytes = 0;
      for await (const chunk of req) {
        bytes += chunk.length;
        if (bytes > MAX_BODY_BYTES) {
          sendJson(res, 413, { error: "Payload too large" });
          return;
        }
        body += chunk;
      }
      const { username } = JSON.parse(body || "{}");
      requestedUser = String(username || "ykro").trim().replace(/^@/, "");
      const profile = await fetchGitHubProfile(requestedUser);
      const card = await buildComicCard(profile);
      const saved = saveCard(card);
      sendJson(res, 200, saved);
    } catch (err) {
      // Fallback to cached card if GitHub API is rate-limited or offline during live demo
      const cached = loadCards().find(
        (c) => c.username.toLowerCase() === requestedUser.toLowerCase()
      );
      if (cached) {
        sendJson(res, 200, cached);
        return;
      }
      sendJson(res, 400, { error: err.message });
    }
    return;
  }

  if (reqUrl.pathname === "/codelab" || reqUrl.pathname === "/codelab/") {
    serveStaticFile(res, path.join(CODELAB_DIR, "index.html"));
    return;
  }

  if (reqUrl.pathname.startsWith("/generated/")) {
    const safeName = path.basename(reqUrl.pathname);
    serveStaticFile(res, path.join(PUBLIC_DIR, "generated", safeName));
    return;
  }

  if (reqUrl.pathname.startsWith("/badges/")) {
    const safeName = path.basename(reqUrl.pathname);
    serveStaticFile(res, path.join(PUBLIC_DIR, "badges", safeName));
    return;
  }

  if (reqUrl.pathname === "/" || reqUrl.pathname === "/index.html") {
    serveStaticFile(res, path.join(PUBLIC_DIR, "index.html"));
    return;
  }

  const candidate = path.join(PUBLIC_DIR, path.basename(reqUrl.pathname));
  serveStaticFile(res, candidate);
});

server.listen(PORT, () => {
  console.log(`GitHub Comic Heroes running on http://localhost:${PORT}`);
});
