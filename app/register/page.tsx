"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getUserFromToken, getRedirectPath } from "@/lib/auth";
import { getApiUrl } from "@/lib/api";
import { User, Mail, Phone, Lock } from "lucide-react";
import Image from "next/image";
import logo from "../../public/images/logo_brmp.svg";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem("agro_token");
    if (token) {
      const user = getUserFromToken();
      if (user) {
        router.push(getRedirectPath(user.role));
      }
    }
  }, [router]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!name || !email || !phone || !password) {
      setError("Semua field wajib diisi!");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password minimal harus 6 karakter!");
      setLoading(false);
      return;
    }

    if (phone.length < 11) {
      setError("Nomor telepon minimal harus 11 karakter!");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${getApiUrl()}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          nama: name,
          no_hp: phone,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        let errorMessage = "Registrasi gagal!";
        if (data.message) {
          if (Array.isArray(data.message)) {
            errorMessage = data.message.join(", ");
          } else {
            errorMessage = data.message;
          }
        }
        throw new Error(errorMessage);
      }

      setSuccess(true);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan koneksi.");
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen sm:h-screen items-center justify-center px-6 py-3 sm:px-6 lg:px-8 overflow-y-auto sm:overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/images/bg_kantor.webp"
          alt="Background Kantor"
          fill
          className="object-cover object-center"
          priority
        />
        {/* Frosted glass overlay to ensure readability */}
        <div className="absolute inset-0" />
      </div>

      <div className="w-full max-w-md space-y-4 sm:space-y-5 my-auto">
        <div className="flex flex-col items-center text-center">
          {/* Logo / Icon */}
          <Link href="/" className="flex h-11 w-11 sm:h-13 sm:w-13 md:h-14 md:w-14 items-center justify-center transition hover:scale-105">
            <Image
              src="/images/logo_brmp.svg"
              alt="Logo BRMP"
              width={48}
              height={48}
              priority
              className="w-full h-full object-contain"
            />
          </Link>
          <h2 className="mt-2 text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-green-color dark:text-zinc-50">
            Buat Akun Baru
          </h2>
          <p className="mt-1 text-xs md:text-sm text-zinc-600 dark:text-zinc-400">
            Silahkan lengkapi data untuk mendaftar ke Layanan Portal Agroklimat
          </p>
        </div>

        <div className="rounded-2xl border-t-4 border-t-[var(--green-color)] bg-white/90 p-6 sm:p-8 md:p-8 shadow-xl backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-900/90">
          {!success ? (
            <form className="space-y-3.5 sm:space-y-4" onSubmit={handleRegister}>
              {error && (
                <div className="rounded-lg bg-red-50 p-2.5 sm:p-3 text-xs md:text-sm text-red-700 dark:bg-red-950/50 dark:text-red-400 border border-red-200 dark:border-red-900/50 flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="h-4 w-4 sm:h-4.5 sm:w-4.5 flex-shrink-0"
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

              <div className="space-y-3 sm:space-y-3.5">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-xs md:text-sm font-semibold text-zinc-700 dark:text-zinc-300"
                  >
                    Nama Lengkap
                  </label>
                  <div className="relative mt-1">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <User className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-zinc-400 dark:text-zinc-500" />
                    </div>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="block w-full rounded-lg border border-zinc-300 bg-white pl-9 sm:pl-10 pr-3 py-1.5 sm:py-2 text-xs md:text-sm text-zinc-900 placeholder-zinc-400 shadow-sm focus:border-green-color focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder-zinc-600 dark:focus:border-green-color"
                      placeholder="Nama Lengkap Anda"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-xs md:text-sm font-semibold text-zinc-700 dark:text-zinc-300"
                  >
                    Email
                  </label>
                  <div className="relative mt-1">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Mail className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-zinc-400 dark:text-zinc-500" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full rounded-lg border border-zinc-300 bg-white pl-9 sm:pl-10 pr-3 py-1.5 sm:py-2 text-xs md:text-sm text-zinc-900 placeholder-zinc-400 shadow-sm focus:border-green-color focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder-zinc-600 dark:focus:border-green-color"
                      placeholder="anda@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="block text-xs md:text-sm font-semibold text-zinc-700 dark:text-zinc-300"
                  >
                    Nomor Telepon
                  </label>
                  <div className="relative mt-1">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Phone className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-zinc-400 dark:text-zinc-500" />
                    </div>
                    <input
                      id="phone"
                      name="phone"
                      type="text"
                      autoComplete="phone"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="block w-full rounded-lg border border-zinc-300 bg-white pl-9 sm:pl-10 pr-3 py-1.5 sm:py-2 text-xs md:text-sm text-zinc-900 placeholder-zinc-400 shadow-sm focus:border-green-color focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder-zinc-600 dark:focus:border-green-color"
                      placeholder="08123456789"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-xs md:text-sm font-semibold text-zinc-700 dark:text-zinc-300"
                  >
                    Kata Sandi
                  </label>
                  <div className="relative mt-1">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Lock className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-zinc-400 dark:text-zinc-500" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full rounded-lg border border-zinc-300 bg-white pl-9 sm:pl-10 pr-3 py-1.5 sm:py-2 text-xs md:text-sm text-zinc-900 placeholder-zinc-400 shadow-sm focus:border-green-color focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder-zinc-600 dark:focus:border-green-color"
                      placeholder="•••••••• (Min. 6 karakter)"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 sm:pt-2.5">
                <button
                  type="submit"
                  disabled={loading || success}
                  className="flex w-full justify-center rounded-lg bg-[var(--green-color)] px-4 py-2 sm:py-2.5 text-xs md:text-sm font-semibold text-white shadow-sm hover:bg-[var(--hover-green-color)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-green-color disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
                >
                  {loading ? (
                    <svg
                      className="h-4 w-4 sm:h-5 sm:w-5 animate-spin text-white"
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
                    "Daftar Sekarang"
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center py-4 space-y-4">
              <div className="mx-auto flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50 animate-bounce">
                <Mail className="h-6 w-6 sm:h-7 sm:w-7" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base sm:text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  Verifikasi Email Anda
                </h3>
                <p className="text-xs md:text-sm text-zinc-600 dark:text-zinc-400">
                  Registrasi berhasil! Kami telah mengirimkan link verifikasi ke email <strong>{email}</strong>.
                </p>
                <p className="text-[11px] md:text-xs text-zinc-500 dark:text-zinc-500">
                  Silakan periksa kotak masuk atau spam email Anda untuk mengaktifkan akun Anda.
                </p>
              </div>
              <div className="pt-2">
                <Link
                  href="/login"
                  className="flex w-full justify-center rounded-lg bg-[var(--green-color)] px-4 py-2 sm:py-2.5 text-xs md:text-sm font-semibold text-white shadow-sm hover:bg-[var(--hover-green-color)] transition-all duration-200 cursor-pointer"
                >
                  Ke Halaman Masuk
                </Link>
              </div>
            </div>
          )}

          <div className="mt-5 sm:mt-6 text-center text-xs md:text-sm">
            <span className="text-zinc-500 dark:text-zinc-400">Sudah memiliki akun? </span>
            <Link
              href="/login"
              className="font-semibold text-[var(--foreground)] hover:text-[var(--green-color)] dark:text-secondary-green-color"
            >
              Masuk
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
