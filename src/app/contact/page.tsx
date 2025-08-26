export default function ContactPage() {
  const { SITE } = require("@/data/site");
  return (
    <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold">Contact</h1>
      <p className="mt-2 text-sm text-muted-foreground">I love shipping delightful, accessible web experiences. Whether you need a polished product or a rapid prototype, I can help.</p>
      <div className="mt-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const data = new FormData(e.currentTarget as HTMLFormElement);
            const params = new URLSearchParams(data as any).toString();
            window.open(`mailto:${SITE.email}?subject=Hello%20from%20your%20website&body=${encodeURIComponent(decodeURIComponent(params))}`);
          }}
          className="space-y-3"
        >
          <input name="name" placeholder="Your name" required className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none ring-primary/30 focus:ring" />
          <input name="contact" placeholder="Email or phone" className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none ring-primary/30 focus:ring" />
          <textarea name="message" placeholder="Message" rows={6} required className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none ring-primary/30 focus:ring" />
          <button type="submit" className="w-full rounded-2xl border px-4 py-2 text-sm">Send via email</button>
        </form>
      </div>
    </section>
  );
}