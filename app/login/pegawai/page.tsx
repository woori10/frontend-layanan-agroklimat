"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getUserFromToken, loginStaff, saveAuthSession, getRedirectPath } from "@/lib/auth";
import { User as UserIcon, Lock } from "lucide-react";
import Image from "next/image";

export default function LoginPegawaiPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  // Cegah flash konten sebelum auth check selesai → sumber utama CLS
  const [checked, setChecked] = useState(false);

  // Defer auth check ke task queue → tidak blocking initial paint, tidak menyebabkan forced reflow
  useEffect(() => {
    const id = setTimeout(() => {
      const token = localStorage.getItem("agro_token");
      if (token) {
        const user = getUserFromToken();
        if (user && user.role !== "publik") {
          router.replace(getRedirectPath(user.role));
          return;
        }
      }
      setChecked(true);
    }, 0);
    return () => clearTimeout(id);
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!username || !password) {
      setError("Username dan password wajib diisi!");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password minimal harus 6 karakter!");
      setLoading(false);
      return;
    }

    try {
      const data = await loginStaff({ username: username.trim().toLowerCase(), password });
      saveAuthSession(data.access_token, username.trim().toLowerCase(), "username");

      const user = getUserFromToken();
      const redirectPath = user ? getRedirectPath(user.role) : "/coming-soon";
      router.push(redirectPath);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Terjadi kesalahan koneksi.";
      setError(errorMessage);
      setLoading(false);
    }
  };

  // Tampilkan background gradient saja selama auth check — tidak ada konten yang shift
  if (!checked) {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-[linear-gradient(45deg,var(--green-color)_-30%,var(--slate-color)_50%,var(--yellow-color)_130%)]"
        aria-hidden="true"
      />
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(45deg,var(--green-color)_-30%,var(--slate-color)_50%,var(--yellow-color)_130%)] px-8 py-6 sm:py-10 md:py-12 sm:px-6 lg:px-8">

      <div className="w-full max-w-md space-y-5 sm:space-y-6 md:space-y-8">
        <div className="flex flex-col items-center text-center">
          {/* Logo */}
          <Link
            href="/"
            className="flex h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 items-center justify-center cursor-pointer transition hover:scale-105"
            aria-label="Kembali ke halaman utama"
          >
            <Image
              src="/images/logo_brmp.svg"
              alt="Logo BRMP Agroklimat"
              width={56}
              height={56}
              priority
              className="w-full h-full object-contain"
            />
          </Link>
          {/* h1: satu-satunya heading level-1 di halaman ini */}
          <h1 className="mt-3 sm:mt-4 md:mt-6 text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-[var(--green-color)] dark:text-zinc-50">
            BRMP Agroklimat
          </h1>
        </div>

        <div className="rounded-2xl border-t-4 border-t-[var(--green-color)] bg-white/90 p-6 sm:p-8 shadow-xl backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-900/90">
          <h2 className="text-base sm:text-lg md:text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Login Pegawai & Staff
          </h2>
          <p className="mt-1 text-xs md:text-sm text-zinc-500 dark:text-zinc-400">
            Silakan masuk menggunakan username dan password perwakilan unit/jabatan.
          </p>

          {/* form onSubmit saja — tidak ada onClick di button, menghindari double trigger */}
          <form
            className="mt-5 sm:mt-6 md:mt-8 space-y-4 sm:space-y-5 md:space-y-6"
            onSubmit={handleLogin}
            noValidate
          >
            {error && (
              <div
                role="alert"
                className="rounded-lg bg-red-50 p-2.5 sm:p-3 text-xs md:text-sm text-red-700 dark:bg-red-950/50 dark:text-red-400 border border-red-200 dark:border-red-900/50 flex items-center gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-4 w-4 sm:h-4.5 sm:w-4.5 flex-shrink-0"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-3.5 sm:space-y-4">
              <div>
                <label
                  htmlFor="username"
                  className="block text-xs md:text-sm font-semibold text-zinc-700 dark:text-zinc-300"
                >
                  Username
                </label>
                <div className="relative mt-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <UserIcon className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-zinc-400 dark:text-zinc-500" aria-hidden="true" />
                  </div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="block w-full rounded-lg border border-zinc-300 bg-white pl-9 sm:pl-10 pr-3 py-1.5 sm:py-2 text-xs md:text-sm text-zinc-900 placeholder-zinc-400 shadow-sm focus:border-green-color focus:outline-none focus:ring-green-color dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder-zinc-600 dark:focus:border-green-color"
                    placeholder="misal: admin_verifikasi atau super_admin"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-xs md:text-sm font-semibold text-zinc-700 dark:text-zinc-300"
                >
                  Password
                </label>
                <div className="relative mt-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Lock className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-zinc-400 dark:text-zinc-500" aria-hidden="true" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full rounded-lg border border-zinc-300 bg-white pl-9 sm:pl-10 pr-3 py-1.5 sm:py-2 text-xs md:text-sm text-zinc-900 placeholder-zinc-400 shadow-sm focus:border-green-color focus:outline-none focus:ring-green-color dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder-zinc-600 dark:focus:border-green-color"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center text-xs md:text-sm">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-3.5 w-3.5 sm:h-4 sm:w-4 rounded border-zinc-300 text-secondary-green-color focus:ring-secondary-green-color dark:border-zinc-700 dark:bg-zinc-950 dark:text-secondary-green-color cursor-pointer"
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-xs md:text-sm text-zinc-700 dark:text-zinc-300 cursor-pointer"
              >
                Ingat saya
              </label>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                aria-busy={loading}
                className="flex w-full justify-center items-center gap-2 rounded-lg bg-[var(--green-color)] px-4 py-2 sm:py-2.5 min-h-[44px] text-xs md:text-sm font-semibold text-white shadow-sm hover:bg-[var(--hover-green-color)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-green-color disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
              >
                {loading ? (
                  <>
                    <svg
                      className="h-4 w-4 sm:h-5 sm:w-5 animate-spin text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
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
                    <span>Memproses...</span>
                  </>
                ) : (
                  "Masuk"
                )}
              </button>
            </div>
          </form>

          <div className="mt-5 text-center text-xs md:text-sm">
            <span className="text-zinc-500 dark:text-zinc-400">Pengguna Layanan Publik? </span>
            <Link
              href="/login"
              className="font-semibold text-[var(--green-color)] hover:underline dark:text-secondary-green-color"
            >
              Login Pemohon di sini
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}