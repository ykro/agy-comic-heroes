export async function fetchGitHubProfile(username) {
  const cleanUser = String(username || "ykro").trim().replace(/^@/, "");
  const headers = {
    "User-Agent": "Antigravity-Comic-Cards/2.0",
    "Accept": "application/vnd.github+json"
  };
  if (process.env.GITHUB_TOKEN) {
    headers["Authorization"] = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const [userRes, reposRes] = await Promise.all([
    fetch(`https://api.github.com/users/${encodeURIComponent(cleanUser)}`, { headers }),
    fetch(`https://api.github.com/users/${encodeURIComponent(cleanUser)}/repos?sort=updated&per_page=30`, { headers })
  ]);

  if (!userRes.ok) {
    throw new Error(`GitHub user '${cleanUser}' not found (HTTP ${userRes.status})`);
  }

  const user = await userRes.json();
  const repos = reposRes.ok ? await reposRes.json() : [];

  const langCounts = {};
  let totalStars = 0;

  for (const r of Array.isArray(repos) ? repos : []) {
    totalStars += Number(r.stargazers_count || 0);
    if (r.language) {
      langCounts[r.language] = (langCounts[r.language] || 0) + 1;
    }
  }

  const topLanguages = Object.entries(langCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([lang]) => lang);

  const topRepos = (Array.isArray(repos) ? repos : [])
    .filter((r) => !r.fork)
    .sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0) || new Date(b.updated_at) - new Date(a.updated_at))
    .slice(0, 3)
    .map((r) => ({
      name: r.name,
      language: r.language || "Polyglot",
      stars: r.stargazers_count || 0,
      description: (r.description || "Classified open-source experiment").slice(0, 90)
    }));

  // Download avatar image bytes for Nano Banana 2.1 comic transformation
  let avatarBase64 = null;
  let avatarMimeType = "image/jpeg";
  if (user.avatar_url) {
    try {
      const avRes = await fetch(user.avatar_url);
      if (avRes.ok) {
        const buf = Buffer.from(await avRes.arrayBuffer());
        avatarBase64 = buf.toString("base64");
        avatarMimeType = avRes.headers.get("content-type") || "image/jpeg";
      }
    } catch {
      avatarBase64 = null;
    }
  }

  return {
    username: user.login,
    displayName: user.name || user.login,
    avatarUrl: user.avatar_url,
    avatarBase64,
    avatarMimeType,
    bio: user.bio || "Full-stack code vigilante operating in the shadows of production.",
    publicRepos: user.public_repos || 0,
    followers: user.followers || 0,
    totalStars,
    topLanguages: topLanguages.length > 0 ? topLanguages : ["JavaScript", "Python"],
    topRepos
  };
}
