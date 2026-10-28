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

function serveStaticFile(res, filePath) {
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Not found" }));
    return;
  }
  const ext = path.extname(filePath).toLowerCase();
  res.writeHead(200, { "Content-Type": MIME_TYPES[ext] || "application/octet-stream" });
  fs.createReadStream(filePath).pipe(res);
}

const server = http.createServer(async (req, res) => {
  const reqUrl = new URL(req.url || "/", `http://localhost:${PORT}`);

  if (reqUrl.pathname === "/healthz") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok", service: "github-comic-cards" }));
    return;
  }

  if (reqUrl.pathname === "/api/cards" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify(loadCards(), null, 2));
    return;
  }

  if (reqUrl.pathname === "/api/generate" && req.method === "POST") {
    try {
      let body = "";
      for await (const chunk of req) body += chunk;
      const { username } = JSON.parse(body || "{}");
      const profile = await fetchGitHubProfile(username || "ykro");
      const card = await buildComicCard(profile);
      const saved = saveCard(card);
      res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify(saved, null, 2));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify({ error: err.message }));
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
