import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SITE } from "@/data/site";
import { SiteHeader } from "@/components/site-header";
import { Footer } from "@/components/footer";
import BackgroundFlock from "@/components/background-flock";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — ${SITE.role}`,
    template: `%s — ${SITE.name}`,
  },
  description: SITE.description,
  alternates: { canonical: SITE.url },
  openGraph: {
    type: "website",
    url: SITE.url,
    title: `${SITE.name} — ${SITE.role}`,
    description: SITE.description,
    siteName: SITE.name,
    locale: "en_US",
    images: [
      { url: "/og.jpg", width: 1200, height: 630, alt: `${SITE.name} – Open Graph` },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} — ${SITE.role}`,
    description: SITE.description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [{ media: "(prefers-color-scheme: light)", color: "#ffffff" }, { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" }],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: SITE.name,
    jobTitle: SITE.role,
    url: SITE.url,
    sameAs: SITE.social.map((s) => s.href),
    email: SITE.email,
    telephone: SITE.phone,
    address: { "@type": "PostalAddress", addressLocality: "Kirkland", addressRegion: "WA", addressCountry: "USA" },
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary">
        <BackgroundFlock
          count={250}
          side={16}
          baseGap={28}
          gapStep={14}
          lateralSpread={12}
          funnelCurve={2.12}   // higher = wider tail
          slotFollow={0.7}     // stronger pull into the funnel slots
          warmupFrames={300}   // slower formation
          neighborRadius={110}
          separationRadius={22}
          separateWeight={1.4}
          maxSpeed={1.3}
          minSpeed={0.3}
          leaderWeight={0.9}
          leaderSpeed={0.7}
          leaderAmplitude={0.32}
          leaderWaves={1.4}
        />
        <SiteHeader />
        <main>{children}</main>
        <Footer />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </body>
    </html>
  );
}