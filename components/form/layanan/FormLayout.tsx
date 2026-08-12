import React from "react";
import Link from "next/link";
import Navbar from "@/components/navbar/Navbar";
import FormBanner from "@/components/banner/FormBanner";
import { ChevronLeft, AlertCircle, CheckCircle2 } from "lucide-react";

interface FormLayoutProps {
  serviceName: string;
  step?: number;
  error?: string | null;
  success?: boolean;
  createdTiketNo?: string;
  onAjukanLagi?: () => void;
  successTitle?: string;
  successDescription?: React.ReactNode;
  children: React.ReactNode;
}

export default function FormLayout({
  serviceName,
  step = 1,
  error,
  success,
  createdTiketNo,
  onAjukanLagi,
  successTitle,
  successDescription,
  children,
}: FormLayoutProps) {
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

      {/* Landing Page Navbar */}
      <Navbar />
      <FormBanner serviceName={serviceName} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-8 sm:px-6 lg:px-8 py-10 space-y-4 z-10">
        {/* Header Section / Breadcrumb */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-[var(--foreground)] dark:text-emerald-400 font-semibold mb-1">
              <Link href="/" className="flex items-center gap-1 hover:underline">
                <ChevronLeft className="w-4 h-4" /> {serviceName}
              </Link>
              {step > 0 && (
                <>
                  <span>/</span>
                  <span>Langkah 1</span>
                  {step >= 2 && (
                    <>
                      <span>/</span>
                      <span>Langkah 2</span>
                    </>
                  )}
                  {step === 3 && (
                    <>
                      <span>/</span>
                      <span>Langkah 3</span>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Messages & Success Modals */}
        {error && (
          <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/45 dark:text-red-400 border border-red-200 dark:border-red-900/40 flex items-start gap-3 shadow-sm transition duration-300">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Gagal Mengajukan:</span>
              <p className="mt-1 text-red-600 dark:text-red-400">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="rounded-xl bg-emerald-50 p-6 text-sm text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/40 dark:border-emerald-900/40 flex flex-col items-center text-center gap-3 shadow-lg transition duration-300">
            <CheckCircle2 className="h-12 w-12 text-emerald-600 dark:text-emerald-400 animate-bounce" />
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-emerald-900 dark:text-white">
                {successTitle || "Pengajuan Berhasil!"}
              </h3>
              {successDescription ? (
                successDescription
              ) : (
                <p className="text-emerald-700 dark:text-emerald-400">
                  Formulir {serviceName.toLowerCase()} telah diajukan dengan nomor tiket{" "}
                  <span className="font-extrabold text-emerald-900 dark:text-white">{createdTiketNo}</span>.
                </p>
              )}
            </div>
            <div className="mt-4 flex gap-4 w-full sm:w-auto">
              <button
                onClick={onAjukanLagi}
                className="flex-1 px-4 py-2 border border-emerald-300 hover:bg-emerald-100 text-emerald-800 dark:border-emerald-800 dark:hover:bg-emerald-950/30 rounded-xl font-semibold transition cursor-pointer"
              >
                Ajukan Lagi
              </button>
              <Link href="/" className="flex">
                <button className="w-full px-5 py-2 bg-[var(--green-color)] hover:bg-emerald-650 text-white rounded-xl font-bold shadow-md transition cursor-pointer">
                  Kembali ke Beranda
                </button>
              </Link>
            </div>
          </div>
        )}

        {/* Children (Form Container) */}
        {!success && children}
      </main>
    </div>
  );
}
