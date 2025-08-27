import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";

const notesDir = path.join(process.cwd(), "content", "notes");

export type Note = {
  slug: string;
  title: string;
  date?: string;
  summary?: string;
  contentHtml?: string;
};

// Narrow and validate frontmatter without using `any`
type Frontmatter = Partial<Pick<Note, "title" | "date" | "summary">>;
function toFrontmatter(data: unknown): Frontmatter {
  const out: Frontmatter = {};
  if (data && typeof data === "object") {
    const d = data as Record<string, unknown>;
    if (typeof d.title === "string") out.title = d.title;
    if (typeof d.date === "string") out.date = d.date;
    if (typeof d.summary === "string") out.summary = d.summary;
  }
  return out;
}

export function getNoteSlugs(): string[] {
  if (!fs.existsSync(notesDir)) return [];
  return fs
    .readdirSync(notesDir)
    .filter((f) => f.endsWith(".md") || f.endsWith(".mdx"));
}

export function getAllNotes(): Note[] {
  return getNoteSlugs()
    .map((file) => {
      const slug = file.replace(/\.(md|mdx)$/i, "");
      const fullPath = path.join(notesDir, file);
      const fileContents = fs.readFileSync(fullPath, "utf8");
      const { data, content } = matter(fileContents);
      const fm = toFrontmatter(data);
      const note: Note = {
        slug,
        title: fm.title ?? slug,
        date: fm.date,
        summary: fm.summary ?? content.slice(0, 160),
      };
      return note;
    })
    .sort((a, b) => {
      const ta = a.date ? new Date(a.date).getTime() : 0;
      const tb = b.date ? new Date(b.date).getTime() : 0;
      return tb - ta; // newest first
    });
}

export function getNoteBySlug(slug: string): Note | null {
  const candidates = [
    path.join(notesDir, `${slug}.md`),
    path.join(notesDir, `${slug}.mdx`),
  ];
  const file = candidates.find((p) => fs.existsSync(p));
  if (!file) return null;

  const fileContents = fs.readFileSync(file, "utf8");
  const { data, content } = matter(fileContents);
  const fm = toFrontmatter(data);
  const html = marked.parse(content);

  return {
    slug,
    title: fm.title ?? slug,
    date: fm.date,
    summary: fm.summary,
    contentHtml: String(html),
  };
}