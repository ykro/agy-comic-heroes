import fs from "node:fs";
import path from "node:path";

const DATA_DIR = path.resolve(process.cwd(), "data");
const GENERATED_DIR = path.resolve(process.cwd(), "public", "generated");
const CARDS_FILE = path.join(DATA_DIR, "cards.json");

function ensureDirs() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(GENERATED_DIR)) fs.mkdirSync(GENERATED_DIR, { recursive: true });
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

  if (storedCard.comicImageUrl && storedCard.comicImageUrl.startsWith("data:")) {
    const match = storedCard.comicImageUrl.match(/^data:([^;]+);base64,(.+)$/);
    if (match) {
      const ext = match[1].includes("png") ? "png" : "jpg";
      const fileName = `${storedCard.username.toLowerCase()}.${ext}`;
      const filePath = path.join(GENERATED_DIR, fileName);
      fs.writeFileSync(filePath, Buffer.from(match[2], "base64"));
      storedCard.comicImageUrl = `/generated/${fileName}?t=${Date.now()}`;
    }
  }

  const cards = loadCards().filter(
    (c) => c.username.toLowerCase() !== storedCard.username.toLowerCase()
  );
  cards.unshift(storedCard);
  const trimmed = cards.slice(0, 12);
  fs.writeFileSync(CARDS_FILE, JSON.stringify(trimmed, null, 2));
  return storedCard;
}
