"use client";

import React, { use } from "react";
import Navbar from "@/components/navbar/Navbar";
import {
  ChevronLeft,
  Check,
  Hourglass,
  User,
  Flag,
  FileText,
  MapPin,
  Calendar,
  Database,
  Download,
  ClipboardSignature
} from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function DetailLayananPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const id = decodeURIComponent(resolvedParams.id);

  const steps = [
    { label: "Verifikasi", status: "completed", date: "12 Agt", icon: Check },
    { label: "Tagihan", status: "completed", date: "14 Agt", icon: Check },
    { label: "Disetujui", status: "active", date: "Sedang Berjalan", icon: Hourglass },
    { label: "Diproses", status: "pending", date: "Menunggu", icon: User },
    { label: "Selesai", status: "pending", date: "Menunggu", icon: Flag },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200">
      <Navbar />

      <main className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1 mb-6">
          <Link
            href="/layanan-saya"
            className="flex items-center text-xs font-semibold text-zinc-500 hover:text-zinc-700 dark:text-zinc-600 dark:hover:text-zinc-200 transition"
          >
            <ChevronLeft className="h-4 w-4 mr-0.5" />
            Riwayat Layanan / Detail  {id}
          </Link>
        </div>

        {/* Title and Survey Button */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white tracking-tight">
              Detail Pengajuan: {id}
            </h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-600 font-medium">
              Pantau status dan lihat detail permohonan layanan data Anda.
            </p>
          </div>

          <button className="flex items-center justify-center gap-2 rounded-xl bg-[#2C5E3B] hover:bg-[#20492E] text-white px-5 py-3 text-sm font-semibold transition shadow-sm cursor-pointer self-end md:self-auto">
            <ClipboardSignature className="h-4.5 w-4.5" />
            <span>Isi Survei Kepuasan</span>
          </button>
        </div>

        {/* Status tracker timeline card */}
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 md:p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 mb-8">
          <h2 className="text-base font-semibold text-zinc-800 dark:text-zinc-200">
            Status Permohonan
          </h2>
          <p className="text-xs text-zinc-600 dark:text-zinc-500 mt-0.5 font-medium">
            Estimasi penyelesaian: 24 Agustus 2024
          </p>

          <div className="mt-8 relative flex items-center justify-between w-full max-w-4xl mx-auto">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isCompleted = step.status === "completed";
              const isActive = step.status === "active";

              // Line logic
              const showLine = idx < steps.length - 1;
              const isLineCompleted = isCompleted && (steps[idx + 1].status === "completed" || steps[idx + 1].status === "active");

              return (
                <div key={idx} className="flex flex-col items-center flex-1 relative">
                  {/* Line to next step */}
                  {showLine && (
                    <div
                      className={`absolute top-5 left-1/2 right-[-50%] h-[3px] -translate-y-1/2 z-0 transition-colors duration-300 ${isLineCompleted ? "bg-[#2C5E3B]" : "bg-zinc-200 dark:bg-zinc-800"
                        }`}
                    />
                  )}

                  {/* Icon Circle */}
                  <div
                    className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300 ${isCompleted
                      ? "bg-[#2C5E3B] border-[#2C5E3B] text-white"
                      : isActive
                        ? "bg-[#D4A325] border-[#D4A325] text-white"
                        : "bg-slate-50 border-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:border-zinc-700"
                      }`}
                  >
                    <Icon className="h-4.5 w-4.5" />
                  </div>

                  {/* Labels */}
                  <span className={`mt-3 text-sm font-semibold ${isActive ? "text-[#2C5E3B]" : "text-zinc-800 dark:text-zinc-200"}`}>
                    {step.label}
                  </span>
                  <span className={`text-xs mt-1 font-semibold ${isActive ? "text-[#2C5E3B]" : "text-zinc-600 dark:text-zinc-500"}`}>
                    {step.date}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Content Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Columns (Col Span 2) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Card 1: Informasi Pemohon */}
            <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 md:p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center gap-2 mb-6">
                <User className="h-5 w-5 text-[#2C5E3B]" />
                <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200">
                  Informasi Pemohon
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8 text-sm">
                <div>
                  <span className="block text-xs font-medium text-zinc-600 dark:text-zinc-500 uppercase tracking-wider mb-1">
                    Nama Lengkap
                  </span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                    Dr. Budi Santoso, S.P., M.Si.
                  </span>
                </div>

                <div>
                  <span className="block text-xs font-medium text-zinc-600 dark:text-zinc-500 uppercase tracking-wider mb-1">
                    NIP / No. KTP
                  </span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                    198005152005011002
                  </span>
                </div>

                <div>
                  <span className="block text-xs font-medium text-zinc-600 dark:text-zinc-500 uppercase tracking-wider mb-1">
                    Instansi
                  </span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                    Universitas Pertanian Nasional
                  </span>
                </div>

                <div>
                  <span className="block text-xs font-medium text-zinc-600 dark:text-zinc-500 uppercase tracking-wider mb-1">
                    No. Telepon
                  </span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                    +62 812-3456-7890
                  </span>
                </div>

                <div className="md:col-span-2">
                  <span className="block text-xs font-medium text-zinc-600 dark:text-zinc-500 uppercase tracking-wider mb-1">
                    Alamat
                  </span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200 leading-relaxed">
                    Jl. Raya Dramaga Kampus IPB, Bogor, Jawa Barat 16680
                  </span>
                </div>
              </div>
            </div>

            {/* Card 2: Detail Layanan Data */}
            <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 md:p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center gap-2 mb-6">
                <Database className="h-5 w-5 text-[#2C5E3B]" />
                <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200">
                  Detail Layanan Data
                </h3>
              </div>

              <div className="space-y-6 text-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <span className="block text-xs font-medium text-zinc-600 dark:text-zinc-500 uppercase tracking-wider mb-1">
                      Jenis Data
                    </span>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                      Data Iklim Harian (Suhu, Curah Hujan, Kelembaban)
                    </span>
                  </div>

                  <div>
                    <span className="block text-xs font-medium text-zinc-600 dark:text-zinc-500 uppercase tracking-wider mb-1">
                      Tanggal Pengajuan
                    </span>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                      12 Agustus 2024
                    </span>
                  </div>
                </div>

                <div>
                  <span className="block text-xs font-medium text-zinc-600 dark:text-zinc-500 uppercase tracking-wider mb-1.5">
                    Lokasi Pengamatan (Stasiun)
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1 rounded-lg bg-[#EBF5EE] text-[#2C5E3B] px-3 py-1.5 text-xs font-semibold dark:bg-emerald-950/30 dark:text-emerald-400">
                      <MapPin className="h-3.5 w-3.5" />
                      Stasiun Klimatologi Bogor
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-lg bg-[#EBF5EE] text-[#2C5E3B] px-3 py-1.5 text-xs font-semibold dark:bg-emerald-950/30 dark:text-emerald-400">
                      <MapPin className="h-3.5 w-3.5" />
                      Pos Hujan Citeko
                    </span>
                  </div>
                </div>

                <div>
                  <span className="block text-xs font-medium text-zinc-600 dark:text-zinc-500 uppercase tracking-wider mb-1">
                    Rentang Waktu Data
                  </span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                    1 Januari 2020 - 31 Desember 2023 (4 Tahun)
                  </span>
                </div>

                <div>
                  <span className="block text-xs font-medium text-zinc-600 dark:text-zinc-500 uppercase tracking-wider mb-1">
                    Tujuan Penggunaan
                  </span>
                  <span className="font-semibold text-zinc-855 dark:text-zinc-200 leading-relaxed">
                    Analisis dampak perubahan pola curah hujan terhadap produktivitas tanaman hortikultura di wilayah dataran tinggi Jawa Barat untuk penyusunan disertasi.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (Col Span 1) */}
          <div className="space-y-8">
            {/* Card 3: Dokumen Lampiran */}
            <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 md:p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center gap-2 mb-6">
                <FileText className="h-5 w-5 text-[#2C5E3B]" />
                <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200">
                  Dokumen Lampiran
                </h3>
              </div>

              <div className="space-y-4">
                {[
                  { name: "Surat_Pengantar.pdf", size: "2.4 MB", date: "Diunggah 12 Agt" },
                  { name: "Bukti_pembayaran.pdf", size: "5.1 MB", date: "Diunggah 12 Agt" }
                ].map((doc, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/20">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-650 dark:bg-red-950/30 dark:text-red-400">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate max-w-[140px] md:max-w-xs">
                          {doc.name}
                        </span>
                        <span className="text-[10px] text-zinc-600 dark:text-zinc-500 font-medium">
                          {doc.size} • {doc.date}
                        </span>
                      </div>
                    </div>
                    <button className="text-[#2C5E3B] hover:text-emerald-700 p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer">
                      <Download className="h-4.5 w-4.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Card 4: Laporan Hasil */}
            <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 md:p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center gap-2 mb-6">
                <FileText className="h-5 w-5 text-[#2C5E3B]" />
                <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200">
                  Laporan Hasil
                </h3>
              </div>

              <div className="space-y-4">
                {[
                  { name: "Surat_Pengantar.pdf", size: "2.4 MB", date: "Diunggah 12 Agt" },
                  { name: "Proposal_Penelitian.pdf", size: "5.1 MB", date: "Diunggah 12 Agt" }
                ].map((doc, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/20">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-650 dark:bg-red-950/30 dark:text-red-400">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate max-w-[140px] md:max-w-xs">
                          {doc.name}
                        </span>
                        <span className="text-[10px] text-zinc-600 dark:text-zinc-500 font-medium">
                          {doc.size} • {doc.date}
                        </span>
                      </div>
                    </div>
                    <button className="text-[#2C5E3B] hover:text-emerald-700 p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer">
                      <Download className="h-4.5 w-4.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
