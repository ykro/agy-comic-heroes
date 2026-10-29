const GITHUB_USER_REGEX = /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/;
const MAX_AVATAR_BYTES = 5 * 1024 * 1024;

export async function fetchGitHubProfile(username) {
  const cleanUser = String(username || "ykro").trim().replace(/^@/, "");
  if (!GITHUB_USER_REGEX.test(cleanUser)) {
    throw new Error(`Invalid GitHub username '${cleanUser}'`);
  }

  const headers = {
    "User-Agent": "Antigravity-Comic-Cards/2.0",
    "Accept": "application/vnd.github+json"
  };
  if (process.env.GITHUB_TOKEN) {
    headers["Authorization"] = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const [userRes, reposRes] = await Promise.all([
    fetch(`https://api.github.com/users/${encodeURIComponent(cleanUser)}`, {
      headers,
      signal: AbortSignal.timeout(10000)
    }),
    fetch(`https://api.github.com/users/${encodeURIComponent(cleanUser)}/repos?sort=updated&per_page=30`, {
      headers,
      signal: AbortSignal.timeout(10000)
    })
  ]);

  if (userRes.status === 403 || userRes.status === 429) {
    const err = new Error(`GitHub API rate limit exceeded for '${cleanUser}' (HTTP ${userRes.status}). Set GITHUB_TOKEN for higher limits.`);
    err.code = "RATE_LIMIT";
    throw err;
  }

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
      name: String(r.name || "repo").slice(0, 60),
      language: String(r.language || "Polyglot").slice(0, 30),
      stars: Number(r.stargazers_count || 0),
      description: String(r.description || "Open-source repository on GitHub").slice(0, 95)
    }));

  // Download avatar image bytes for Nano Banana 2.1 comic transformation
  let avatarBase64 = null;
  let avatarMimeType = "image/jpeg";
  if (user.avatar_url && /^https:\/\/avatars\.githubusercontent\.com\//.test(user.avatar_url)) {
    try {
      const avRes = await fetch(user.avatar_url, { signal: AbortSignal.timeout(10000) });
      if (avRes.ok) {
        const ab = await avRes.arrayBuffer();
        if (ab.byteLength <= MAX_AVATAR_BYTES) {
          avatarBase64 = Buffer.from(ab).toString("base64");
          avatarMimeType = avRes.headers.get("content-type") || "image/jpeg";
        }
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
    bio: user.bio || "Full-stack developer building software on GitHub.",
    publicRepos: user.public_repos || 0,
    followers: user.followers || 0,
    totalStars,
    topLanguages: topLanguages.length > 0 ? topLanguages : ["JavaScript", "Python"],
    topRepos
  };
}
