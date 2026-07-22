"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Sprout, Cloud, Gauge, ArrowRight, ShieldCheck, User, LogOut, LayoutDashboard, ChevronDown } from "lucide-react";
import { getUserFromToken, logout, getRedirectPath } from "@/lib/auth";

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("agro_token");
    if (token) {
      const decodedUser = getUserFromToken();
      if (decodedUser) {
        setUser(decodedUser);
      }
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
          <Image
            src="/images/logo_brmp.svg"
            alt="Logo BRMP"
            width={40}
            height={40}
            priority
          />
          <div>
            <span className="font-bold text-sm leading-tight tracking-tight text-[var(--green-color)] dark:text-white">
              BRMP Agroklimat
              <br />
              Hidrologi Pertanian
            </span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-semibold text-zinc-600 dark:text-zinc-300">
          <Link href="/" className="hover:text-[var(--green-color)] hover:underline hover:decoration-[var(--green-color)] hover:underline-offset-4 dark:hover:text-white transition">
            Beranda
          </Link>
          <Link href="#tentang" className="hover:text-[var(--green-color)] hover:underline hover:decoration-[var(--green-color)] hover:underline-offset-4 dark:hover:text-white transition">
            Tentang
          </Link>
          <Link href="#layanan" className="hover:text-[var(--green-color)] hover:underline hover:decoration-[var(--green-color)] hover:underline-offset-4 dark:hover:text-white transition">
            Layanan
          </Link>
          <Link href="#faq" className="hover:text-[var(--green-color)] hover:underline hover:decoration-[var(--green-color)] hover:underline-offset-4 dark:hover:text-white transition">
            FAQ
          </Link>
          <Link href="#kontak" className="hover:text-[var(--green-color)] hover:underline hover:decoration-[var(--green-color)] hover:underline-offset-4 dark:hover:text-white transition">
            Kontak
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 shadow-sm hover:bg-zinc-50 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800 transition cursor-pointer"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                  <User className="h-4 w-4" />
                </div>
                <span>{user.nama}</span>
                <ChevronDown className="h-4 w-4 text-zinc-400" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-800 dark:bg-zinc-950 z-50">
                  <Link
                    href={getRedirectPath(user.role)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-900"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                  <Link
                    href="/profil"
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-900"
                  >
                    <User className="h-4 w-4" />
                    <span>Profil Saya</span>
                  </Link>
                  <button
                    onClick={() => logout(router)}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20 cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/register"
                className="text-sm font-semibold text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white px-3 py-2 transition"
              >
                Register
              </Link>
              <Link
                href="/login"
                className="rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-md hover:bg-emerald-500 transition-all duration-200"
              >
                Login
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
          {user ? (
            <Link
              href={getRedirectPath(user.role)}
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
