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
    <div className="relative flex min-h-screen flex-col bg-gradient-to-b from-secondary-green-color/50 via-white to-teal-50/30 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 text-zinc-900 dark:text-zinc-50 overflow-x-hidden font-sans">
      {/* Background patterns */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <svg
          className="absolute left-[max(50%,25rem)] top-0 h-[64rem] w-[128rem] -translate-x-1/2 stroke-secondary-green-color/30 [mask-image:radial-gradient(64rem_64rem_at_top,white,transparent)] dark:stroke-secondary-green-color/10"
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
            <div className="flex items-center gap-2 text-xs md:text-sm text-[var(--foreground)] dark:text-secondary-green-color font-semibold mb-1">
              <Link href="/" className="flex items-center gap-1 hover:underline">
                <ChevronLeft className="w-4 h-4" /> {serviceName}
              </Link>
              {step === 3 ? (
                <>
                  <span>/</span>
                  <span>Tinjau dan Konfirmasi</span>
                </>
              ) : (
                step > 0 && (
                  <>
                    <span>/</span>
                    <span>Langkah 1</span>
                    {step >= 2 && (
                      <>
                        <span>/</span>
                        <span>Langkah 2</span>
                      </>
                    )}
                  </>
                )
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
          <div className="rounded-xl bg-secondary-green-color p-6 text-sm text-secondary-green-color dark:bg-secondary-green-color/40 dark:text-secondary-green-color border border-secondary-green-color/40 dark:border-secondary-green-color/40 flex flex-col items-center text-center gap-3 shadow-lg transition duration-300">
            <CheckCircle2 className="h-12 w-12 text-green-color dark:text-secondary-green-color" />
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-green-color dark:text-white">
                {successTitle || "Pengajuan Berhasil!"}
              </h3>
              {successDescription ? (
                successDescription
              ) : (
                <div className="flex flex-col items-center justify-center gap-2">
                  <p className="text-green-color dark:text-secondary-green-color max-w-sm md:max-w-xl">
                    Formulir {serviceName.toLowerCase()} telah diajukan dengan nomor tiket
                  </p>
                  <span className="font-extrabold text-green-color dark:text-white">{createdTiketNo}</span>
                </div>
              )}
            </div>
            <div className="mt-4 flex justify-center items-center gap-4 w-full">
              <button
                onClick={onAjukanLagi}
                className="px-4 py-2 border border-[var(--green-color)] bg-white text-[var(--green-color)] dark:border-secondary-green-color dark:hover:bg-secondary-green-color/30 rounded-xl font-semibold transition cursor-pointer"
              >
                Ajukan Lagi
              </button>
              <Link
                href={createdTiketNo ? `/layanan-saya/${createdTiketNo}` : "/layanan-saya"}
                className="flex"
              >
                <button
                  type="button"
                  className="px-5 py-2 bg-[var(--green-color)] hover:bg-[var(--hover-green-color)] text-white rounded-xl font-bold shadow-md transition cursor-pointer"
                >
                  Lihat Status Tiket
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
