"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import Image from "next/image";
import { getApiUrl } from "@/lib/api";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Token verifikasi tidak ditemukan di tautan Anda.");
      return;
    }

    const verify = async () => {
      try {
        const response = await fetch(`${getApiUrl()}/auth/verify-email?token=${token}`, {
          method: "GET",
        });
        const data = await response.json();

        if (response.ok) {
          setStatus("success");
          setMessage(data.message || "Email Anda berhasil diverifikasi!");
        } else {
          setStatus("error");
          setMessage(data.message || "Verifikasi email gagal atau token kedaluwarsa.");
        }
      } catch (error) {
        setStatus("error");
        setMessage("Terjadi kesalahan koneksi ke server.");
      }
    };

    verify();
  }, [token]);

  return (
    <div className="rounded-2xl border-t-4 border-t-[var(--green-color)] bg-white/90 p-8 shadow-xl backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-900/90 sm:p-10 text-center space-y-6">
      {status === "loading" && (
        <div className="space-y-4 py-6">
          <Loader2 className="mx-auto h-16 w-16 animate-spin text-[var(--green-color)]" />
          <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Memverifikasi Email...
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Mohon tunggu sebentar, kami sedang memvalidasi tautan Anda.
          </p>
        </div>
      )}

      {status === "success" && (
        <div className="space-y-4 py-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50">
            <CheckCircle className="h-10 w-10" />
          </div>
          <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Verifikasi Sukses!
          </h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {message}
          </p>
          <div className="pt-4">
            <Link
              href="/login"
              className="flex w-full justify-center rounded-lg bg-[var(--green-color)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[var(--hover-green-color)] transition-all duration-200"
            >
              Masuk ke Akun
            </Link>
          </div>
        </div>
      )}

      {status === "error" && (
        <div className="space-y-4 py-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50">
            <XCircle className="h-10 w-10" />
          </div>
          <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Verifikasi Gagal
          </h3>
          <p className="text-sm text-red-600 dark:text-red-400">
            {message}
          </p>
          <div className="pt-4 space-y-3">
            <Link
              href="/register"
              className="flex w-full justify-center rounded-lg bg-[var(--green-color)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[var(--hover-green-color)] transition-all duration-200"
            >
              Daftar Kembali
            </Link>
            <Link
              href="/login"
              className="block text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:text-[var(--green-color)] transition-colors"
            >
              Kembali ke Login
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-[linear-gradient(45deg,var(--green-color)_-30%,var(--slate-color)_50%,var(--yellow-color)_130%)]">
      <div className="w-full max-w-md space-y-6">
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
            BRMP Agroklimat
          </h2>
        </div>

        <Suspense fallback={
          <div className="rounded-2xl border-t-4 border-t-[var(--green-color)] bg-white/90 p-8 shadow-xl backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-900/90 sm:p-10 text-center space-y-6">
            <div className="space-y-4 py-6">
              <Loader2 className="mx-auto h-16 w-16 animate-spin text-[var(--green-color)]" />
              <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                Memuat Halaman...
              </h3>
            </div>
          </div>
        }>
          <VerifyEmailContent />
        </Suspense>
      </div>
    </div>
  );
}
