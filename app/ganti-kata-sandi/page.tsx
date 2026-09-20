"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Lock, Eye, EyeOff, CheckCircle, ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { getApiUrl } from "@/lib/api";
import { getUserFromToken } from "@/lib/auth";

export default function GantiKataSandiPage() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [profileUrl, setProfileUrl] = useState("/profile-publik");

  useEffect(() => {
    const token = localStorage.getItem("agro_token");
    if (!token) {
      router.push("/login");
      return;
    }

    const user = getUserFromToken();
    const isStaff = user && ["super_admin", "admin", "kepala_balai", "pegawai"].includes(user.role);
    const targetProfile = isStaff ? "/profile" : "/profile-publik";
    setProfileUrl(targetProfile);

    // Cek apakah user telah melewati modal verifikasi kata sandi saat ini
    const verified = sessionStorage.getItem("agro_pwd_verified");
    if (!verified) {
      router.push(targetProfile);
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!newPassword || !confirmPassword) {
      setError("Semua bidang kata sandi wajib diisi!");
      return;
    }

    if (newPassword.length < 6) {
      setError("Kata sandi baru minimal harus 6 karakter!");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Konfirmasi kata sandi baru tidak cocok.");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("agro_token");
      const res = await fetch(`${getApiUrl()}/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          newPassword,
          confirmPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const msg = Array.isArray(data.message) ? data.message.join(", ") : data.message;
        throw new Error(msg || "Gagal mengubah kata sandi.");
      }

      setSuccess(true);
      sessionStorage.removeItem("agro_pwd_verified");

      setTimeout(() => {
        router.push(profileUrl);
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan koneksi.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(45deg,var(--green-color)_-30%,var(--slate-color)_50%,var(--yellow-color)_130%)] px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Logo / Header */}
        <div className="flex flex-col items-center text-center">
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
            Portal Layanan Agroklimat
          </h2>
        </div>

        {/* Card Utama */}
        <div className="rounded-2xl border-t-4 border-t-[var(--green-color)] bg-white/90 p-8 shadow-xl backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-900/90 sm:p-10">
          {success ? (
            /* State Sukses */
            <div className="text-center py-4 space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/40">
                <CheckCircle className="h-9 w-9 text-emerald-500" />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                Kata Sandi Berhasil Diubah!
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Kata sandi baru akun Anda telah aktif. Anda akan dialihkan kembali ke halaman profil dalam beberapa detik...
              </p>
              <div className="pt-2">
                <Link
                  href={profileUrl}
                  className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--green-color)] hover:underline"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Kembali ke Profil Sekarang
                </Link>
              </div>
            </div>
          ) : (
            /* Form Ganti Kata Sandi */
            <>
              <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                Ganti Kata Sandi
              </h3>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Masukkan kata sandi baru dan konfirmasi kata sandi baru untuk akun Anda.
              </p>

              {error && (
                <div className="mt-4 rounded-xl bg-red-50 p-3.5 text-xs text-red-700 dark:bg-red-950/50 dark:text-red-300 border border-red-200 dark:border-red-900/50 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
                {/* Kata Sandi Baru */}
                <div>
                  <label
                    htmlFor="newPassword"
                    className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1"
                  >
                    Kata Sandi Baru
                  </label>
                  <div className="relative mt-1">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Lock className="h-5 w-5 text-zinc-400 dark:text-zinc-500" />
                    </div>
                    <input
                      id="newPassword"
                      name="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimal 6 karakter"
                      className="block w-full rounded-xl border border-zinc-300 bg-white pl-10 pr-10 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 shadow-xs focus:border-[var(--green-color)] focus:outline-none focus:ring-1 focus:ring-[var(--green-color)] dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder-zinc-600"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Konfirmasi Kata Sandi Baru */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1"
                  >
                    Konfirmasi Kata Sandi Baru
                  </label>
                  <div className="relative mt-1">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Lock className="h-5 w-5 text-zinc-400 dark:text-zinc-500" />
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Ulangi kata sandi baru"
                      className="block w-full rounded-xl border border-zinc-300 bg-white pl-10 pr-10 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 shadow-xs focus:border-[var(--green-color)] focus:outline-none focus:ring-1 focus:ring-[var(--green-color)] dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder-zinc-600"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Tombol Simpan */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--green-color)] py-3 text-xs font-bold text-white shadow-md hover:bg-[var(--green-color)]/90 hover:shadow-lg focus:outline-none transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                    <span>{loading ? "Menyimpan Kata Sandi..." : "Simpan Kata Sandi Baru"}</span>
                  </button>
                </div>

                {/* Tombol Batal / Kembali */}
                <div className="text-center pt-2">
                  <Link
                    href={profileUrl}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 transition"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>Batal dan Kembali ke Profil</span>
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
