"use client";
import Link from "next/link";
import { NAV, SITE } from "@/data/site";
import { Button } from "@/components/ui/button";
import { FileText, Moon, Sun, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import Image from "next/image";

export function SiteHeader() {
  const [dark, setDark] = useState(true);
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <header className="sticky top-0 z-50 border-b bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="group inline-flex items-center gap-2 font-medium">
          <Image
            src="/logo.svg"
            alt="Weon Yuan Logo"
            width={40}
            height={25}
            className="transition-transform group-hover:scale-110 invert-0 dark:invert"
          />
          <span className="text-sm sm:text-base">{SITE.name}</span>
        </Link>
        <div className="hidden items-center gap-2 md:flex">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="rounded-xl px-3 py-2 text-sm font-medium hover:bg-muted">
              {n.label}
            </Link>
          ))}
          <Button asChild variant="secondary" className="ml-2">
            <a href={SITE.resumeUrl} target="_blank" rel="noreferrer">
              <FileText className="mr-2 h-4 w-4" /> Resume
            </a>
          </Button>
          <Button variant="ghost" onClick={() => setDark((d) => !d)} aria-label="Toggle theme" className="ml-1">
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
        <div className="flex items-center gap-1 md:hidden">
          <Button asChild variant="secondary" size="sm">
            <a href={SITE.resumeUrl} target="_blank" rel="noreferrer">
              <FileText className="mr-2 h-4 w-4" /> Resume
            </a>
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setDark((d) => !d)} aria-label="Toggle theme">
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
      </nav>
    </header>
  );
}