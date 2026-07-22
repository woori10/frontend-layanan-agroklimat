"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { User, LogOut, LayoutDashboard, ChevronDown } from "lucide-react";
import { getUserFromToken, logout, getRedirectPath } from "@/lib/auth";
import Hero from "@/components/landing-page/Hero";
import Layanan from "@/components/landing-page/Layanan";
import Tentang from "@/components/landing-page/Tentang";
import Faq from "@/components/landing-page/Faq";
import Kontak from "@/components/landing-page/Kontak";
import LogoutModal from "@/components/modal/LogoutModal";

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

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
      <header className="relative z-50 w-full border-b border-zinc-200/40 bg-white/40 backdrop-blur-md dark:bg-zinc-900/40 dark:border-zinc-800/40">
        <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
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
                  <div className="absolute right-0 mt-2 w-48 rounded-xl border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
                    <Link
                      href="/profil"
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-900"
                    >
                      <User className="h-4 w-4" />
                      <span>Profil Saya</span>
                    </Link>
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        setLogoutModalOpen(true);
                      }}
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
        </div>
      </header>

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
