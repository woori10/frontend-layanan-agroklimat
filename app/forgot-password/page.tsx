"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { getApiUrl } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${getApiUrl()}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Terjadi kesalahan. Silakan coba lagi.");
      }

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan koneksi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(45deg,var(--green-color)_-30%,var(--slate-color)_50%,var(--yellow-color)_130%)] px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="flex flex-col items-center text-center">
          <Link href="/" className="flex h-16 w-16 items-center justify-center cursor-pointer transition hover:scale-105">
            <Image src="/images/logo_brmp.svg" alt="Logo BRMP" width={56} height={56} priority />
          </Link>
          <h2 className="mt-6 text-3xl font-semibold tracking-tight text-[var(--green-color)] dark:text-zinc-50">
            BRMP Agroklimat
          </h2>
        </div>

        <div className="rounded-2xl border-t-4 border-t-[var(--green-color)] bg-white/90 p-8 shadow-xl backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-900/90 sm:p-10">

          {submitted ? (
            /* === State: Email Terkirim === */
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/40">
                <CheckCircle className="h-9 w-9 text-emerald-500" />
              </div>
              <h3 className="mt-4 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                Cek Email Anda!
              </h3>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Jika email{" "}
                <span className="font-semibold text-zinc-700 dark:text-zinc-200">{email}</span>{" "}
                terdaftar, kami telah mengirimkan link reset password. Silakan periksa inbox atau folder spam Anda.
              </p>
              <div className="mt-6 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 p-3 text-xs text-amber-700 dark:text-amber-400">
                Link reset password berlaku selama <strong>1 jam</strong>.
              </div>
              <Link
                href="/login"
                className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-[var(--green-color)] hover:underline dark:text-emerald-400"
              >
                <ArrowLeft className="h-4 w-4" />
                Kembali ke halaman Login
              </Link>
            </div>
          ) : (
            /* === State: Form Input Email === */
            <>
              <div>
                <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                  Lupa Password?
                </h3>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  Masukkan email yang terdaftar. Kami akan mengirimkan link untuk mereset password Anda.
                </p>
              </div>

              <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                {error && (
                  <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-400 border border-red-200 dark:border-red-900/50 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 flex-shrink-0">
                      <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
                    </svg>
                    <span>{error}</span>
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    Email
                  </label>
                  <div className="relative mt-1">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Mail className="h-5 w-5 text-zinc-400 dark:text-zinc-500" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full rounded-lg border border-zinc-300 bg-white pl-10 pr-3 py-2 text-zinc-900 placeholder-zinc-400 shadow-sm focus:border-secondary-green-color focus:outline-none focus:ring-1 focus:ring-secondary-green-color dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder-zinc-600 dark:focus:border-secondary-green-color"
                      placeholder="anda@email.com"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full justify-center rounded-lg bg-[var(--green-color)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[var(--hover-green-color)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {loading ? (
                    <svg className="h-5 w-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : (
                    "Kirim Link Reset Password"
                  )}
                </button>

                <div className="text-center">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 hover:text-[var(--green-color)] dark:text-zinc-400 dark:hover:text-emerald-400 transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Kembali ke Login
                  </Link>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
