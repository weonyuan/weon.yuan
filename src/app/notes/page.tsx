import Link from "next/link";
import { getAllNotes } from "@/lib/notes";

export const dynamic = "force-static"; // build-time listing

export default function NotesIndex() {
  const notes = getAllNotes();
  return (
    <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold">Notes</h1>
      <p className="mt-1 text-sm text-muted-foreground">Short posts, studies, and write-ups.</p>
      <div className="mt-6 space-y-4">
        {notes.length === 0 && <p className="text-sm text-muted-foreground">No notes yet. Add Markdown files to <code>content/notes</code>.</p>}
        {notes.map((n) => (
          <article key={n.slug} className="rounded-2xl border p-5">
            <h2 className="text-lg font-semibold"><Link href={`/notes/${n.slug}`} className="hover:underline">{n.title}</Link></h2>
            <p className="mt-1 text-sm text-muted-foreground">{n.summary}</p>
            {n.date && <p className="mt-2 text-xs text-muted-foreground">{new Date(n.date).toLocaleDateString()}</p>}
          </article>
        ))}
      </div>
    </section>
  );
}