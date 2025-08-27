import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const SITE_URL = process.env.SITE_URL || "https://weonyuan.github.io";
const ROOT = process.cwd();
const NOTES_DIR = path.join(ROOT, "content", "notes");
const PUBLIC_DIR = path.join(ROOT, "public");
const OUT = path.join(PUBLIC_DIR, "sitemap.xml");

function readNotes() {
  if (!fs.existsSync(NOTES_DIR)) return [];
  const files = fs.readdirSync(NOTES_DIR).filter((f) => /\.(md|mdx)$/i.test(f));
  return files.map((file) => {
    const slug = file.replace(/\.(md|mdx)$/i, "");
    const raw = fs.readFileSync(path.join(NOTES_DIR, file), "utf8");
    const { data } = matter(raw);
    const date = typeof data?.date === "string" ? data.date : undefined;
    return { slug, date };
  });
}

function url(loc, lastmod) {
  const last = lastmod ? `\n    <lastmod>${new Date(lastmod).toISOString()}</lastmod>` : "";
  return `  <url>\n    <loc>${loc}</loc>${last}\n  </url>`;
}

function generate() {
  const pages = ["/", "/projects", "/experience", "/notes", "/contact"].map(
    (p) => SITE_URL + p
  );

  const notes = readNotes().map((n) => ({
    loc: `${SITE_URL}/notes/${n.slug}`,
    lastmod: n.date,
  }));

  const urls = [
    ...pages.map((p) => url(p)),
    ...notes.map((n) => url(n.loc, n.lastmod)),
  ].join("\n");

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    `${urls}\n` +
    `</urlset>\n`;

  if (!fs.existsSync(PUBLIC_DIR)) fs.mkdirSync(PUBLIC_DIR, { recursive: true });
  fs.writeFileSync(OUT, xml, "utf8");
  console.log(`[sitemap] Wrote ${OUT}`);
}

generate();