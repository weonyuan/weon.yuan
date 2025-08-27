"use client";
import { motion } from "framer-motion";
import { SITE, PROJECTS } from "@/data/site";
import { Button } from "@/components/ui/button";
import { ArrowRight, ExternalLink, FileText, Mail, MapPin, Phone } from "lucide-react";
import Image from "next/image";

const fadeIn = { initial: { opacity: 0, y: 8 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: "-50px" }, transition: { duration: 0.5 } };

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section id="top" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid items-center gap-8 md:grid-cols-3">
          <motion.div {...fadeIn} className="order-2 md:order-1 md:col-span-2">
            <div className="inline-flex items-center gap-2 rounded-full border bg-muted px-3 py-1 text-xs text-muted-foreground">
              <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
              Available for opportunities
            </div>
            <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">{SITE.name}</h1>
            <p className="mt-3 text-lg text-muted-foreground">{SITE.role}</p>
            <p className="mt-4 max-w-2xl text-base text-muted-foreground">{SITE.description}</p>
            <div className="mt-6 flex flex-wrap items-center gap-2">
              {SITE.social.map((s) => (
                <Button key={s.label} asChild variant="outline" size="sm" className="rounded-full">
                  <a href={s.href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2">
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>{s.label}</span>
                  </a>
                </Button>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" /> {SITE.location}</span>
              <a href={`mailto:${SITE.email}`} className="inline-flex items-center gap-1 hover:underline"><Mail className="h-4 w-4" /> {SITE.email}</a>
              <a href={`tel:${SITE.phone}`} className="inline-flex items-center gap-1 hover:underline"><Phone className="h-4 w-4" /> {SITE.phone}</a>
            </div>
            <div className="mt-6 flex gap-3">
              <Button asChild size="lg" className="rounded-2xl"><a href={`mailto:${SITE.email}`}><Mail className="mr-2 h-5 w-5" /> Email me</a></Button>
              <Button asChild variant="outline" size="lg" className="rounded-2xl"><a href={SITE.resumeUrl} target="_blank" rel="noreferrer"><FileText className="mr-2 h-5 w-5" /> View resume</a></Button>
            </div>
          </motion.div>
          <motion.div {...fadeIn} transition={{ duration: 0.6, delay: 0.1 }} className="order-1 md:order-2">
            <div className="aspect-square w-full rounded-2xl bg-muted/40" aria-label="Profile visual placeholder">
              <Image
                src="/og.jpg"
                alt="Weon Yuan"
                width={800}
                height={800}
                className="h-full w-full rounded-2xl object-cover"
                priority
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold sm:text-3xl">Projects</h2>
            <p className="mt-1 text-sm text-muted-foreground">High-impact work that goes beyond a resume.</p>
          </div>
          <Button asChild variant="ghost"><a href="/projects" className="inline-flex items-center">See all <ArrowRight className="ml-2 h-4 w-4" /></a></Button>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
    </div>
  );
}