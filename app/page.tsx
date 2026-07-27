"use client";

import Navbar from "@/components/landing-page/Navbar";
import Hero from "@/components/landing-page/Hero";
import Layanan from "@/components/landing-page/Layanan";
import Tentang from "@/components/landing-page/Tentang";
import Faq from "@/components/landing-page/Faq";
import Kontak from "@/components/landing-page/Kontak";

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col bg-gradient-to-b from-emerald-50/50 via-white to-teal-50/30 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 text-zinc-900 dark:text-zinc-50 overflow-x-hidden font-sans">
      {/* Background patterns */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <svg
          className="absolute left-[max(50%,25rem)] top-0 h-[64rem] w-[128rem] -translate-x-1/2 stroke-emerald-200/30 [mask-image:radial-gradient(64rem_64rem_at_top,white,transparent)] dark:stroke-emerald-950/10"
          aria-hidden="true"
        >
          <defs>
            <pattern
              id="grid-pattern"
              width={200}
              height={200}
              x="50%"
              y={-1}
              patternUnits="userSpaceOnUse"
            >
              <path d="M100 200V.5M.5 .5H200" fill="none" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" strokeWidth={0} fill="url(#grid-pattern)" />
        </svg>
      </div>

      {/* Header */}
      <Navbar />

      {/* Hero & Layanan sections */}
      <main className="flex-1">
        <Hero />
        <div className="max-w-[85rem] mx-auto px-8 sm:px-6 lg:px-8 py-8 space-y-16">
          <Tentang />
          <Layanan />
          <Faq />
        </div>

        <Kontak />
      </main>
    </div>
  );
}
