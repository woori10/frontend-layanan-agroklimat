"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getUserFromToken, loginStaff, saveAuthSession, getRedirectPath } from "@/lib/auth";
import { IdCard, Lock } from "lucide-react";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [nip, setNIP] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect to dashboard if already logged in (ignore if current role is publik)
  useEffect(() => {
    const token = localStorage.getItem("agro_token");
    if (token) {
      const user = getUserFromToken();
      if (user && user.role !== "publik") {
        router.push(getRedirectPath(user.role));
      }
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!nip || !password) {
      setError("NIP dan password wajib diisi!");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password minimal harus 6 karakter!");
      setLoading(false);
      return;
    }

    try {
      const data = await loginStaff({ nip, password });

      saveAuthSession(data.access_token, nip, "nip");

      const user = getUserFromToken();
      const redirectPath = user ? getRedirectPath(user.role) : "/coming-soon";

      router.push(redirectPath);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Terjadi kesalahan koneksi.";
      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(45deg,var(--green-color)_-30%,var(--slate-color)_50%,var(--yellow-color)_130%)] px-4 py-12 sm:px-6 lg:px-8">

      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center text-center">
          {/* Logo / Icon */}
          <Link href="/" className="flex h-16 w-16 items-center justify-center cursor-pointer transition hover:scale-105">
            <Image
              src="/images/logo_brmp.svg"
              alt="Logo BRMP"
              width={56}
              height={56}
              priority
            />
          </Link>
          <h2 className="mt-6 text-3xl font-semibold tracking-tight text-[var(--green-color)] dark:text-zinc-50">
            BRMP Agroklimat
          </h2>
        </div>

        <div className="rounded-2xl border-t-4 border-t-[var(--green-color)] bg-white/90 p-8 shadow-xl backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-900/90 sm:p-10">
          <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Login Pegawai
          </h3>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Silahkan masuk menggunakan akun yang telah terdaftar.
          </p>

          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-400 border border-red-200 dark:border-red-900/50 flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-5 w-5 flex-shrink-0"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="nip"
                  className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300"
                >
                  NIP
                </label>
                <div className="relative mt-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <IdCard className="h-5 w-5 text-zinc-400 dark:text-zinc-500" />
                  </div>
                  <input
                    id="nip"
                    name="nip"
                    type="text"
                    autoComplete="nip"
                    required
                    value={nip}
                    onChange={(e) => setNIP(e.target.value)}
                    className="block w-full rounded-lg border border-zinc-300 bg-white pl-10 pr-3 py-2 text-zinc-900 placeholder-zinc-400 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder-zinc-600 dark:focus:border-emerald-500"
                    placeholder="19850101201001"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300"
                >
                  Password
                </label>
                <div className="relative mt-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Lock className="h-5 w-5 text-zinc-400 dark:text-zinc-500" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full rounded-lg border border-zinc-300 bg-white pl-10 pr-3 py-2 text-zinc-900 placeholder-zinc-400 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder-zinc-600 dark:focus:border-emerald-500"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-emerald-500"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-zinc-700 dark:text-zinc-300"
                >
                  Ingat saya
                </label>
              </div>
              <a
                href="#"
                className="font-medium text-[var(--green-color)] hover:text-emerald-500 dark:text-emerald-400"
              >
                Lupa password?
              </a>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full justify-center rounded-lg bg-[var(--green-color)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {loading ? (
                  <svg
                    className="h-5 w-5 animate-spin text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                ) : (
                  "Masuk"
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-zinc-500 dark:text-zinc-400">Belum punya akun? </span>
            <Link
              href="/register"
              className="font-semibold text-[var(--foreground)] hover:text-[var(--green-color)] dark:text-emerald-400"
            >
              Daftar Sekarang
            </Link>
          </div>
        </div>
      </div >
    </div >
  );
}