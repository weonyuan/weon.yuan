import { PROJECTS } from "@/data/site";

export default function ProjectsPage() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold">Projects</h1>
      <p className="mt-1 text-sm text-muted-foreground">Selected projects and case studies.</p>
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {PROJECTS.map((p) => (
            <a
            key={p.title}
            href={p.links && p.links[0]?.href}
            target="_blank"
            rel="noreferrer"
            className="group block h-full"
            >
            <div className="h-full overflow-hidden rounded-2xl border p-5 transition duration-300 ease-in-out hover:shadow-xl hover:scale-105 hover:border-primary hover:bg-muted/30">
                <div className="mb-2 flex flex-wrap gap-1">
                {p.tags.slice(0, 2).map((t) => (
                    <span
                    key={t}
                    className="rounded-full bg-muted px-2 py-0.5 text-[10px]"
                    >
                    {t}
                    </span>
                ))}
                </div>
                <h3 className="text-lg font-semibold group-hover:underline">
                {p.title}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">{p.summary}</p>
                <div className="mt-3 flex flex-wrap gap-1">
                {p.tags.slice(2).map((t) => (
                    <span
                    key={t}
                    className="rounded-full border px-2 py-0.5 text-[10px]"
                    >
                    {t}
                    </span>
                ))}
                </div>
            </div>
            </a>
        ))}
      </div>
    </section>
  );
}