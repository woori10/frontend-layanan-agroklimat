"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sprout, Cloud, Gauge, ArrowRight, ShieldCheck } from "lucide-react";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("agro_token");
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-emerald-50/50 via-white to-teal-50/30 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 text-zinc-900 dark:text-zinc-50 overflow-hidden font-sans">
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
      <header className="px-6 lg:px-12 h-20 flex items-center justify-between border-b border-zinc-200/40 bg-white/40 backdrop-blur-md dark:bg-zinc-900/40 dark:border-zinc-800/40">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20">
            <Sprout className="h-5 w-5" />
          </div>
          <div>
            <span className="font-bold text-lg leading-tight tracking-tight text-zinc-900 dark:text-white">
              AgroKlimat
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-md hover:bg-emerald-500 transition-all duration-200"
            >
              <span>Buka Dashboard</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-semibold text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white px-3 py-2 transition"
              >
                Masuk
              </Link>
              <Link
                href="/register"
                className="rounded-xl bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-md hover:bg-emerald-500 transition-all duration-200"
              >
                Daftar Akun
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20 max-w-5xl mx-auto space-y-12">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200/80 px-4 py-1.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-900/40 dark:text-emerald-400">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Platform Agroklimatologi Modern Terpadu</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-zinc-900 dark:text-white leading-[1.15]">
            Optimalkan Hasil Tani dengan <br />
            <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
              Monitoring Presisi Real-time
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-sm sm:text-base lg:text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Dapatkan informasi ramalan cuaca spesifik lahan, grafik fluktuasi iklim, sensor parameter kelembaban tanah, serta rekomendasi aktivitas pertanian bertenaga AI.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center sm:w-auto">
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-8 py-3.5 text-base font-bold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-500 transition-all duration-200"
            >
              <span>Kembali ke Dashboard</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-8 py-3.5 text-base font-bold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-500 transition-all duration-200"
              >
                <span>Masuk ke Dashboard</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/register"
                className="flex items-center justify-center rounded-xl bg-white border border-zinc-200 px-8 py-3.5 text-base font-bold text-zinc-700 shadow-sm hover:bg-zinc-50 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-all duration-200"
              >
                Daftar Akun Baru
              </Link>
            </>
          )}
        </div>

        {/* Feature Cards Grid */}
        <div className="grid gap-6 sm:grid-cols-3 w-full pt-10">
          {[
            {
              title: "Cuaca Pertanian",
              desc: "Ramalan iklim mikro harian spesifik koordinat lahan pertanian Anda.",
              icon: Cloud,
            },
            {
              title: "Sensor IoT Tanah",
              desc: "Monitor kelembaban, suhu udara, curah hujan secara presisi.",
              icon: Gauge,
            },
            {
              title: "Rekomendasi AI",
              desc: "Saran penjadwalan pemupukan dan irigasi otomatis berbasis data real-time.",
              icon: Sprout,
            },
          ].map((feat, idx) => {
            const FeatIcon = feat.icon;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-zinc-200/60 bg-white/70 p-6 text-left shadow-sm dark:bg-zinc-900/50 dark:border-zinc-800/80 backdrop-blur-sm"
              >
                <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 w-max">
                  <FeatIcon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-base font-bold text-zinc-900 dark:text-white">
                  {feat.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                  {feat.desc}
                </p>
              </div>
            );
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-xs text-zinc-500 border-t border-zinc-200/30 dark:border-zinc-800/30 dark:text-zinc-600 mt-10">
        <p>© 2026 AgroKlimat System. Hak Cipta Dilindungi.</p>
      </footer>
    </div>
  );
}
