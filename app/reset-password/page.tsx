"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Lock, Eye, EyeOff, CheckCircle, XCircle, ArrowLeft } from "lucide-react";
import { getApiUrl } from "@/lib/api";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Token reset password tidak ditemukan. Pastikan Anda membuka link dari email.");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Password dan konfirmasi password tidak cocok.");
    }
    if (password.length < 6) {
      setError("Password minimal 6 karakter.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${getApiUrl()}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, confirmPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        const msg = Array.isArray(data.message) ? data.message.join(", ") : data.message;
        throw new Error(msg || "Terjadi kesalahan. Silakan coba lagi.");
      }

      setSuccess(true);

      // Auto-redirect ke login setelah 3 detik
      setTimeout(() => router.push("/login"), 3000);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan koneksi.");
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = () => {
    if (password.length === 0) return null;
    if (password.length < 6) return { label: "Terlalu pendek", color: "bg-red-400", width: "w-1/4" };
    if (password.length < 8) return { label: "Lemah", color: "bg-orange-400", width: "w-2/4" };
    if (password.length < 12) return { label: "Cukup", color: "bg-yellow-400", width: "w-3/4" };
    return { label: "Kuat", color: "bg-emerald-500", width: "w-full" };
  };

  const strength = passwordStrength();

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

          {success ? (
            /* === State: Sukses === */
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/40">
                <CheckCircle className="h-9 w-9 text-emerald-500" />
              </div>
              <h3 className="mt-4 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                Password Berhasil Direset!
              </h3>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Password Anda telah berhasil diubah. Anda akan diarahkan ke halaman login dalam beberapa detik...
              </p>
              <Link
                href="/login"
                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[var(--green-color)] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[var(--hover-green-color)] transition-all duration-200"
              >
                Ke Halaman Login
              </Link>
            </div>
          ) : !token ? (
            /* === State: Token Tidak Ada === */
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/40">
                <XCircle className="h-9 w-9 text-red-500" />
              </div>
              <h3 className="mt-4 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                Link Tidak Valid
              </h3>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Link reset password tidak valid atau sudah kedaluwarsa. Silakan minta link baru.
              </p>
              <Link
                href="/forgot-password"
                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[var(--green-color)] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[var(--hover-green-color)] transition-all duration-200"
              >
                Minta Link Baru
              </Link>
            </div>
          ) : (
            /* === State: Form Reset Password === */
            <>
              <div>
                <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                  Buat Password Baru
                </h3>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  Masukkan password baru Anda di bawah ini.
                </p>
              </div>

              <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                {error && (
                  <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-400 border border-red-200 dark:border-red-900/50 flex items-start gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 flex-shrink-0 mt-0.5">
                      <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
                    </svg>
                    <span>{error}</span>
                  </div>
                )}

                {/* Password Baru */}
                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    Password Baru
                  </label>
                  <div className="relative mt-1">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Lock className="h-5 w-5 text-zinc-400 dark:text-zinc-500" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full rounded-lg border border-zinc-300 bg-white pl-10 pr-10 py-2 text-zinc-900 placeholder-zinc-400 shadow-sm focus:border-secondary-green-color focus:outline-none focus:ring-1 focus:ring-secondary-green-color dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder-zinc-600"
                      placeholder="Minimal 6 karakter"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {/* Indikator kekuatan password */}
                  {strength && (
                    <div className="mt-2">
                      <div className="h-1.5 w-full rounded-full bg-zinc-200 dark:bg-zinc-700">
                        <div className={`h-1.5 rounded-full transition-all duration-300 ${strength.color} ${strength.width}`} />
                      </div>
                      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Kekuatan: <span className="font-medium">{strength.label}</span></p>
                    </div>
                  )}
                </div>

                {/* Konfirmasi Password */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    Konfirmasi Password
                  </label>
                  <div className="relative mt-1">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Lock className="h-5 w-5 text-zinc-400 dark:text-zinc-500" />
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirm ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`block w-full rounded-lg border bg-white pl-10 pr-10 py-2 text-zinc-900 placeholder-zinc-400 shadow-sm focus:outline-none focus:ring-1 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder-zinc-600 ${
                        confirmPassword && confirmPassword !== password
                          ? "border-red-400 focus:border-red-400 focus:ring-red-400"
                          : "border-zinc-300 focus:border-secondary-green-color focus:ring-secondary-green-color dark:border-zinc-700"
                      }`}
                      placeholder="Ulangi password baru"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                    >
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {confirmPassword && confirmPassword !== password && (
                    <p className="mt-1 text-xs text-red-500">Password tidak cocok.</p>
                  )}
                  {confirmPassword && confirmPassword === password && (
                    <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle className="h-3.5 w-3.5" /> Password cocok.
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || !token}
                  className="flex w-full justify-center rounded-lg bg-[var(--green-color)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[var(--hover-green-color)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {loading ? (
                    <svg className="h-5 w-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : (
                    "Simpan Password Baru"
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-secondary-green-color border-t-transparent"></div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
