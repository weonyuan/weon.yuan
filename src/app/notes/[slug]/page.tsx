import { notFound } from "next/navigation";
import { getNoteBySlug } from "@/lib/notes";

export const dynamic = "force-static";
export const dynamicParams = false;

export async function generateStaticParams() {
  const { getAllNotes } = await import("@/lib/notes");
  return getAllNotes().map((n) => ({ slug: n.slug }));
}

export default function NotePage({ params }: { params: { slug: string } }) {
  const note = getNoteBySlug(params.slug);
  if (!note) return notFound();
  return (
    <article className="prose prose-neutral dark:prose-invert mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="mb-2">{note.title}</h1>
      {note.date && <p className="-mt-2 text-sm text-muted-foreground">{new Date(note.date).toLocaleDateString()}</p>}
      <div className="mt-6" dangerouslySetInnerHTML={{ __html: note.contentHtml || "" }} />
    </article>
  );
}