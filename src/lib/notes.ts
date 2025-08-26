import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";

const notesDir = path.join(process.cwd(), "content", "notes");

export type Note = { slug: string; title: string; date?: string; summary?: string; contentHtml?: string };

export function getNoteSlugs(): string[] {
  if (!fs.existsSync(notesDir)) return [];
  return fs.readdirSync(notesDir).filter((f) => f.endsWith(".md") || f.endsWith(".mdx"));
}

export function getAllNotes(): Note[] {
  return getNoteSlugs()
    .map((file) => {
      const slug = file.replace(/\.(md|mdx)$/i, "");
      const fullPath = path.join(notesDir, file);
      const fileContents = fs.readFileSync(fullPath, "utf8");
      const { data, content } = matter(fileContents);
      return {
        slug,
        title: data.title || slug,
        date: data.date || undefined,
        summary: data.summary || content.slice(0, 160),
      } satisfies Note;
    })
    .sort((a, b) => (a.date && b.date ? +new Date(b.date) - +new Date(a.date) : 0));
}

export function getNoteBySlug(slug: string): Note | null {
  const candidates = [path.join(notesDir, `${slug}.md`), path.join(notesDir, `${slug}.mdx`)];
  const file = candidates.find((p) => fs.existsSync(p));
  if (!file) return null;
  const fileContents = fs.readFileSync(file, "utf8");
  const { data, content } = matter(fileContents);
  const html = marked.parse(content);
  return {
    slug,
    title: (data as any).title || slug,
    date: (data as any).date || undefined,
    summary: (data as any).summary || undefined,
    contentHtml: String(html),
  };
}