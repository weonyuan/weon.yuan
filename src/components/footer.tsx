import { SITE } from "@/data/site";

export function Footer() {
  return (
    <footer className="border-t py-8 text-center text-xs text-muted-foreground">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {SITE.name}. Built with Next.js, TypeScript, Tailwind, shadcn/ui, and Framer Motion.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {SITE.social.map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-full px-2 py-1 hover:bg-muted">
                <span className="text-xs">{s.label}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}