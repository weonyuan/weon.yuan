export default function ExperiencePage() {
  const roles = [
    {
      company: "Independent",
      role: "Creator — Breakdown (Personal Finance App)",
      period: "Nov 2024 — Present",
      bullets: [
        "Designed and developed a responsive PWA (TypeScript, React, Next.js, Firebase) with real‑time sync and secure authentication.",
        "Built dashboards for expense logging and monthly trend insights across mobile and desktop.",
      ],
    },
    {
      company: "IBM",
      role: "Advisory Software Engineer",
      period: "Jun 2016 — Oct 2024",
      bullets: [
        "Led a team of 12 engineers through sprint planning and execution, achieving 98% on‑time delivery over 3 years.",
        "Spearheaded a STRIDE‑based baseline threat model for ~1,100‑person Systems Z org; partnered with 20+ teams to standardize protocols and reduce modeling time from 8 weeks to ~1 week.",
        "Co‑designed an agile deployment roadmap with PMs/SMEs for two quarterly releases; used Jira to drive visibility and delivery.",
        "Led backend (C++/Java) for IBM Z Deep Learning Compiler, compiling ONNX models into optimized libraries; created runtime metrics tooling reducing troubleshooting time by 23%.",
        "Delivered Cloud Provisioning for z/OS across backend (Java), frontend (JavaScript), and security; adopted by six Fortune 500 companies.",
        "Automated legacy manual processes with Python scripts and Jenkins CI/CD, shrinking cycle time from ~1 week to 5 minutes.",
      ],
    },
  ];

  return (
    <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold">Experience</h1>
      <div className="mt-6 space-y-6">
        {roles.map((e) => (
          <article key={e.company + e.role} className="rounded-2xl border p-6">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h2 className="text-lg font-semibold">{e.company}</h2>
                <p className="text-sm text-muted-foreground">{e.role}</p>
              </div>
              <div className="text-xs text-muted-foreground">{e.period}</div>
            </div>
            <ul className="mt-4 list-disc space-y-2 pl-6 text-sm text-muted-foreground">
              {e.bullets.map((b, i) => (<li key={i}>{b}</li>))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}