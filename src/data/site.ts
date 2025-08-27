export const SITE = {
  name: "Weon Yuan",
  role: "Senior Software Engineer — formerly with IBM",
  description:
    "Software engineer with 8+ years leading secure, on‑time delivery on IBM Z — building fast, accessible web apps and scalable developer tooling.",
  location: "Kirkland, WA, USA",
  email: "weon.yuan@gmail.com",
  phone: "+1 (808) 258-6386",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  resumeUrl: "/resume.pdf",
  social: [
    { label: "GitHub", href: "https://github.com/weonyuan" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/weonyuan/" },
  ],
} as const;

export type Project = {
  title: string;
  summary: string;
  tags: string[];
  links?: { label: string; href: string }[];
  image?: string;
};

export const PROJECTS: Project[] = [
  {
    title: "Breakdown",
    summary:
      "Responsive personal finance web app with real-time persistence and secure auth (TypeScript, React, Next.js, Firebase).",
    tags: ["TypeScript", "React", "Next.js", "Firebase", "Auth", "PWA"],
    links: [{ label: "Live", href: "https://breakdown-eight.vercel.app/" }],
  },
  {
    title: "IBM Z Deep Learning Compiler",
    summary:
      "Backend development (C++/Java) compiling ONNX models into optimized IBM Z libraries; built tooling to centralize runtime metrics and cut troubleshooting time by 23%.",
    tags: ["C++", "Java", "ONNX", "Compiler", "IBM Z", "Performance"],
    links: [{ label: "Repo", href: "https://github.com/IBM/zDLC" }],
  },
  {
    title: "IBM Cloud Provisioning for z/OS",
    summary:
      "Led product delivery and full-stack dev (Java/JavaScript) for a scalable enterprise app adopted by six Fortune 500s; automated legacy ops with Python + Jenkins CI/CD (week → 5 minutes).",
    tags: ["Java", "JavaScript", "z/OS", "CI/CD", "Jenkins", "Python"],
    links: [
      {
        label: "Docs",
        href: "https://www.ibm.com/docs/en/zos/2.4.0?topic=management-what-is-cloud-provisioning-zos",
      },
    ],
  },
];

export const NAV = [
  { href: "/projects", label: "Projects" },
  { href: "/experience", label: "Experience" },
] as const;