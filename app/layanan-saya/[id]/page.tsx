"use client";

import React, { use, useEffect, useState } from "react";
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
  ClipboardSignature,
  Droplet,
  Briefcase,
  GraduationCap,
  BookOpen,
  Bed,
  ClipboardList,
  CreditCard,
  Clock,
  ExternalLink,
  AlertCircle,
  X,
  CircleDollarSign,
  Receipt,
  RefreshCw,
  Award,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getUserTiketDetail } from "@/lib/tiket";
import StatusLayananBadge from "@/components/badge/status-layanan/StatusLayananBadge";
import StatusPembayaranBadge from "@/components/badge/status-pembayaran/StatusPembayaranBadge";
import { getApiUrl } from "@/lib/api";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

interface Dokumen {
  id: number;
  nama_file: string;
  tipe: string;
  url_storage: string;
  tanggal_upload: string;
}

interface Tagihan {
  id: number;
  jumlah: number;
  status_bayar: "menunggu" | "lunas" | "batal";
  bukti_bayar?: string;
  tanggal_lunas?: string;
}

interface AuditLog {
  id: number;
  aksi: string;
  detail_perubahan: string | null;
  timestamp: string;
}

interface TiketDetail {
  id: number;
  no_tiket: string;
  status: string;
  tanggal_submit: string;
  tanggal_sla?: string;
  jawaban_form: Record<string, any> | null;
  layanan: {
    id: number;
    nama_layanan: string;
    slug?: string;
  };
  dokumen: Dokumen[];
  tagihan?: Tagihan | null;
  auditLog?: AuditLog[];
}

function formatDate(dateString: string) {
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
}

function getFormLayananLink(layanan?: { nama_layanan?: string; slug?: string }) {
  if (!layanan) return "/#layanan";

  const slug = (layanan.slug || "").toLowerCase().trim();
  const nama = (layanan.nama_layanan || "").toLowerCase().trim();

  // 1. Peminjaman Alat
  if (slug === "peminjaman-alat" || nama.includes("peminjaman alat")) {
    return "/layanan/peminjaman-alat";
  }

  // 2. Permohonan Data
  if (slug === "permohonan-data" || nama.includes("permohonan data") || nama.includes("permintaan data")) {
    return "/layanan/permohonan-data";
  }

  // 3. Rekomendasi SNI
  if (slug === "rekomendasi-sni" || nama.includes("sni")) {
    return "/layanan/rekomendasi-sni";
  }

  // 4. Konsultasi Rekomendasi
  if (slug === "konsultasi-rekomendasi" || nama.includes("konsultasi rekomendasi")) {
    return "/layanan/konsultasi-rekomendasi";
  }

  // 5. Konsultasi Siap Tanam / Rekomendasi Kalender Tanam
  if (
    slug === "konsultasi-siap-tanam" ||
    slug === "rekomendasi-siap-tanam" ||
    nama.includes("siap tanam") ||
    nama.includes("kalender tanam")
  ) {
    return "/layanan/konsultasi-siap-tanam";
  }

  // 6. Bimtek & Narasumber
  if (
    slug === "bimtek-narasumber" ||
    slug === "bimbingan-teknis" ||
    nama.includes("bimtek") ||
    nama.includes("bimbingan teknis")
  ) {
    return "/layanan/bimtek-narasumber";
  }

  // 7. Magang / PKL
  if (slug === "magang-pkl" || nama.includes("magang") || nama.includes("pkl")) {
    return "/layanan/magang-pkl";
  }

  // 8. Agroedukasi
  if (slug === "agroedukasi" || nama.includes("agroedukasi") || nama.includes("kunjungan edukasi")) {
    return "/layanan/agroedukasi";
  }

  // 9. Layanan Perpustakaan
  if (slug === "layanan-perpustakaan" || nama.includes("perpustakaan")) {
    return "/layanan/layanan-perpustakaan";
  }

  if (slug) {
    return `/layanan/${slug}`;
  }

  return "/#layanan";
}

function getSteps(status: string, hasTagihan: boolean, tagihanLunas: boolean, isPeminjamanAlat: boolean, isMagang: boolean = false) {
  if (status === "ditolak") {
    return [
      {
        label: "Verifikasi",
        status: "completed",
        date: "Selesai",
        icon: Check
      },
      {
        label: "Ditolak",
        status: "active",
        date: "Ditolak",
        icon: X
      }
    ];
  }

  if (isPeminjamanAlat) {
    const isVerifDone = ["diproses", "dipinjam", "selesai"].includes(status);
    const isVerifActive = ["menunggu_verifikasi", "diajukan", "perlu_revisi"].includes(status);

    const isDiprosesDone = ["dipinjam", "selesai"].includes(status);
    const isDiprosesActive = status === "diproses";

    const isDipinjamDone = status === "selesai";
    const isDipinjamActive = status === "dipinjam";

    const isSelesaiDone = status === "selesai";

    return [
      {
        label: "Verifikasi",
        status: isVerifDone ? "completed" : (isVerifActive ? "active" : "pending"),
        date: isVerifDone ? "Selesai" : (isVerifActive ? "Proses" : "Menunggu"),
        icon: ClipboardList
      },
      {
        label: "Diproses",
        status: isDiprosesDone ? "completed" : (isDiprosesActive ? "active" : "pending"),
        date: isDiprosesDone ? "Selesai" : (isDiprosesActive ? "Sedang Diproses" : "Menunggu"),
        icon: RefreshCw
      },
      {
        label: "Dipinjam",
        status: isDipinjamDone ? "completed" : (isDipinjamActive ? "active" : "pending"),
        date: isDipinjamDone ? "Selesai" : (isDipinjamActive ? "Sedang Dipinjam" : "Menunggu"),
        icon: Wrench
      },
      {
        label: "Selesai",
        status: isSelesaiDone ? "completed" : "pending",
        date: isSelesaiDone ? "Selesai" : "Menunggu",
        icon: Flag
      },
    ];
  }

  const isVerifikasiDone = ["menunggu_persetujuan_kepala_balai", "menunggu_pembayaran", "diproses", "diterima", "menunggu_konfirmasi", "selesai"].includes(status);
  const isVerifikasiActive = ["menunggu_verifikasi", "diajukan", "perlu_revisi"].includes(status);

  const isDisposisiDone = ["menunggu_pembayaran", "diproses", "diterima", "menunggu_konfirmasi", "selesai"].includes(status);
  const isDisposisiActive = status === "menunggu_persetujuan_kepala_balai";

  const isTagihanDone = isDisposisiDone && (["diproses", "diterima", "menunggu_konfirmasi", "selesai"].includes(status) || (!hasTagihan || tagihanLunas));
  const isTagihanActive = status === "menunggu_pembayaran";

  const isDiprosesDone = isMagang ? ["diterima", "selesai"].includes(status) : status === "selesai";
  const isDiprosesActive = status === "diproses";

  const isDiterimaDone = status === "selesai";
  const isDiterimaActive = status === "diterima";

  const isSelesaiDone = status === "selesai";

  return [
    {
      label: "Verifikasi",
      status: isVerifikasiDone ? "completed" : (isVerifikasiActive ? "active" : "pending"),
      date: isVerifikasiDone ? "Selesai" : (isVerifikasiActive ? "Proses" : "Menunggu"),
      icon: ClipboardList
    },
    {
      label: "Disposisi",
      status: isDisposisiDone ? "completed" : (isDisposisiActive ? "active" : "pending"),
      date: isDisposisiDone ? "Selesai" : (isDisposisiActive ? "Menunggu Disposisi" : "Menunggu"),
      icon: ClipboardSignature
    },
    {
      label: "Diproses",
      status: isDiprosesDone ? "completed" : (isDiprosesActive ? "active" : "pending"),
      date: isDiprosesDone ? "Selesai" : (isDiprosesActive ? "Sedang Diproses" : "Menunggu"),
      icon: RefreshCw
    },
    ...(isMagang ? [
      {
        label: "Diterima",
        status: isDiterimaDone ? "completed" : (isDiterimaActive ? "active" : "pending"),
        date: isDiterimaDone ? "Selesai" : (isDiterimaActive ? "Diterima" : "Menunggu"),
        icon: GraduationCap
      }
    ] : []),
    {
      label: "Selesai",
      status: isSelesaiDone ? "completed" : "pending",
      date: isSelesaiDone ? "Selesai" : "Menunggu",
      icon: Flag
    },
  ];
}

export default function DetailLayananPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const idStr = resolvedParams.id;

  const [tiket, setTiket] = useState<TiketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);

  const handleUploadBukti = async () => {
    if (!selectedFile || !tiket) return;
    setUploadLoading(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append("file", selectedFile);
      uploadFormData.append("tipe", "Bukti Pembayaran");

      const token = localStorage.getItem("agro_token");
      const res = await fetch(`${getApiUrl()}/tiket/${tiket.id}/dokumen`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: uploadFormData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Gagal mengunggah bukti pembayaran");
      }

      alert("Bukti pembayaran berhasil diunggah! Menunggu konfirmasi admin.");
      setSelectedFile(null);
      // Re-fetch ticket details
      const updatedTiket = await getUserTiketDetail(idStr);
      setTiket(updatedTiket);
    } catch (err: any) {
      alert(err.message || "Gagal mengunggah file");
    } finally {
      setUploadLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem("agro_token");
    if (!token) {
      router.push("/login");
      return;
    }

    if (!idStr) {
      setError("ID Tiket tidak valid");
      setLoading(false);
      return;
    }

    getUserTiketDetail(idStr)
      .then(setTiket)
      .catch((err: any) => setError(err.message))
      .finally(() => setLoading(false));
  }, [idStr, router]);

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-secondary-green-color border-t-transparent"></div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-zinc-500">
          Memuat detail permohonan...
        </main>
      </div>
    );
  }

  if (error || !tiket) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-red-500">
          {error || "Permohonan tidak ditemukan"}
        </main>
      </div>
    );
  }

  const isPeminjamanAlat =
    tiket.layanan.id === 19 ||
    tiket.layanan.slug === "peminjaman-alat" ||
    tiket.layanan.nama_layanan?.toLowerCase().includes("peminjaman alat");

  const isMagang =
    tiket.layanan.slug === "magang-pkl" ||
    tiket.layanan.nama_layanan?.toLowerCase().includes("magang") ||
    tiket.layanan.nama_layanan?.toLowerCase().includes("pkl");

  const hasTagihan = !!tiket.tagihan;
  const tagihanLunas = tiket.tagihan?.status_bayar === "lunas";
  const steps = getSteps(tiket.status, hasTagihan, tagihanLunas, isPeminjamanAlat, isMagang);

  // Separate common fields from form answers
  const commonFields = ["nama_lengkap", "nip_ktp", "alamat_instansi", "no_telp", "tanggal_pengajuan"];
  const formAnswers = tiket.jawaban_form || {};

  // Surat Penerimaan vs Sertifikat vs Laporan Hasil vs Lampiran vs Berita Acara
  const beritaAcaraDocs = tiket.dokumen.filter(
    doc => doc.tipe === "Berita Acara" || doc.tipe?.toLowerCase().includes("berita_acara") || doc.tipe?.toLowerCase().includes("berita acara")
  );
  const suratPenerimaanDocs = tiket.dokumen.filter(
    doc => doc.tipe === "Surat Penerimaan" || doc.tipe?.toLowerCase().includes("surat_penerimaan") || doc.tipe?.toLowerCase().includes("penerimaan")
  );
  const sertifikatDocs = tiket.dokumen.filter(
    doc => doc.tipe === "Sertifikat" || doc.tipe?.toLowerCase().includes("sertifikat")
  );
  const laporanDocs = tiket.dokumen.filter(
    doc => (doc.tipe === "Laporan Hasil" || doc.tipe?.toLowerCase().includes("laporan")) && !doc.tipe?.toLowerCase().includes("sertifikat") && !doc.tipe?.toLowerCase().includes("penerimaan") && !doc.tipe?.toLowerCase().includes("berita")
  );
  const lampiranDocs = tiket.dokumen.filter(
    doc => doc.tipe !== "Laporan Hasil" && !doc.tipe?.toLowerCase().includes("laporan") && !doc.tipe?.toLowerCase().includes("sertifikat") && !doc.tipe?.toLowerCase().includes("penerimaan") && !doc.tipe?.toLowerCase().includes("berita")
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1 mb-6">
          <Link
            href="/layanan-saya"
            className="flex items-center text-xs font-semibold text-[var(--foreground)] hover:text-zinc-700 dark:text-zinc-650 dark:hover:text-zinc-200 transition"
          >
            <ChevronLeft className="h-4 w-4 mr-0.5" />
            Kembali ke Riwayat Layanan
          </Link>
        </div>

        {/* Giant Card Wrapper */}
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-4 sm:p-6 md:p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          {/* Title and Action Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800 mb-6 sm:mb-8">
            <div>
              <h1 className="text-base sm:text-lg md:text-2xl font-semibold text-zinc-900 dark:text-white tracking-tight">
                Detail Pengajuan: {tiket.no_tiket}
              </h1>
              <p className="mt-1 text-xs md:text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                Pantau status dan lihat detail permohonan layanan.
              </p>
            </div>

            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLSetXcoDMbrwTEh6JvJWwOz5NO_-V4R24amGGqi_GkJyUMPXag/viewform"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center shrink-0 whitespace-nowrap rounded-xl bg-[var(--green-color)] hover:bg-[var(--hover-green-color)] text-white px-4 py-2.5 sm:px-5 sm:py-3 text-xs md:text-sm font-semibold transition shadow-sm cursor-pointer"
            >
              <span>Isi Survei Kepuasan</span>
            </a>
          </div>

          {/* Status tracker timeline card */}
          {tiket.status !== "ditolak" && (
            <div className="rounded-2xl border border-zinc-200/80 bg-white p-4 sm:p-6 md:p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 mb-6 md:mb-8">
              <h2 className="flex flex-wrap items-center justify-between gap-2 sm:gap-4 text-sm sm:text-base font-semibold text-zinc-800 dark:text-zinc-200 mb-3 sm:mb-4">
                <span>Status Permohonan</span>
                <StatusLayananBadge status={tiket.status} isMagang={isMagang} layananSlug={tiket.layanan.slug} />
              </h2>
              {tiket.tanggal_sla && (
                <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 font-medium">
                  Estimasi penyelesaian (SLA): {formatDate(tiket.tanggal_sla)}
                </p>
              )}

              <div className="mt-5 sm:mt-8 relative flex items-center mx-auto w-full">
                {steps.map((step, idx) => {
                  const isCompleted = step.status === "completed";
                  const isActive = step.status === "active";
                  const Icon = isCompleted && step.label !== "Ditolak" ? Check : step.icon;

                  // Line logic
                  const showLine = idx < steps.length - 1;
                  const isLineCompleted = isCompleted && (steps[idx + 1]?.status === "completed" || steps[idx + 1]?.status === "active");

                  return (
                    <div key={idx} className="flex flex-col items-center flex-1 min-w-0 relative">
                      {/* Line to next step */}
                      {showLine && (
                        <div
                          className={`absolute top-3.5 sm:top-4 md:top-5 left-1/2 right-[-50%] h-[2px] md:h-[3px] -translate-y-1/2 z-0 transition-colors duration-300 ${steps[idx + 1]?.label === "Ditolak"
                            ? "bg-red-600"
                            : isLineCompleted
                              ? "bg-[#2C5E3B]"
                              : "bg-zinc-200 dark:bg-zinc-800"
                            }`}
                        />
                      )}

                      {/* Icon Circle */}
                      <div
                        className={`relative z-10 flex h-7 w-7 sm:h-8 sm:w-8 md:h-10 md:w-10 items-center justify-center rounded-full border sm:border-2 transition-all duration-300 ${step.label === "Ditolak"
                          ? "bg-red-600 border-red-600 text-white"
                          : isCompleted
                            ? "bg-[#2C5E3B] border-[#2C5E3B] text-white"
                            : isActive
                              ? "bg-[#FFDF9A] border-[#FFDF9A] text-[#2C5E3B]"
                              : "bg-slate-50 border-zinc-200 text-zinc-500 dark:bg-zinc-800 dark:border-zinc-700"
                          }`}
                      >
                        <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5" strokeWidth={2.5} />
                      </div>

                      {/* Labels */}
                      <span className={`mt-2 sm:mt-2.5 md:mt-3 text-[10px] sm:text-xs md:text-sm font-semibold text-center leading-tight break-words px-0.5 max-w-full ${step.label === "Ditolak"
                        ? "text-red-600"
                        : isActive
                          ? "text-[#2C5E3B]"
                          : "text-zinc-400 dark:text-zinc-200"
                        }`}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Banner status Dipinjam khusus peminjaman alat */}
              {isPeminjamanAlat && tiket.status === "dipinjam" && (
                <div className="mt-6 flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50/70 p-4 text-xs sm:text-sm text-blue-900 dark:border-blue-900/50 dark:bg-blue-950/20 dark:text-blue-300">
                  <Wrench className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Alat Sedang Anda Pinjam:</span> Harap menjaga alat dengan baik dan mengembalikannya ke pihak laboratorium tepat waktu sesuai periode peminjaman.
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Rejection Message Alert Box */}
          {tiket.status === "ditolak" && (
            <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 md:p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 mb-8 flex items-start gap-4">
              {/* <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400">
                <AlertCircle className="h-5.5 w-5.5" />
              </div> */}
              <div className="flex-1">
                <h3 className="text-base font-semibold text-zinc-900 dark:text-white">
                  Permohonan Ditolak
                </h3>
                <div className="mt-3 text-sm text-red-600 dark:text-red-400 leading-relaxed font-semibold whitespace-pre-wrap bg-red-50/30 dark:bg-red-950/10 border border-red-100 dark:border-red-900/20 rounded-xl p-4 shadow-sm">
                  Alasan Penolakan: {tiket.auditLog?.filter(log => log.aksi === "ditolak").pop()?.detail_perubahan || "Maaf, permohonan Anda ditolak oleh Admin."}
                </div>
              </div>
            </div>
          )}

          {/* Revision Message Alert Box */}
          {tiket.status === "perlu_revisi" && (
            <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 md:p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 mb-8 flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-yellow-50 dark:bg-yellow-950/30 text-yellow-600 dark:text-yellow-400">
                <AlertCircle className="h-5.5 w-5.5" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-zinc-900 dark:text-white">
                  Permohonan Perlu Revisi
                </h3>
                <p className="mt-1 text-sm text-zinc-550 dark:text-zinc-400">
                  Catatan Revisi dari Admin:
                </p>
                <div className="mt-3 text-sm text-yellow-750 dark:text-yellow-450 leading-relaxed font-semibold whitespace-pre-wrap bg-yellow-50/30 dark:bg-yellow-950/10 border border-yellow-100 dark:border-yellow-900/20 rounded-xl p-4 shadow-sm">
                  {tiket.auditLog?.filter(log => log.aksi === "perlu_revisi").pop()?.detail_perubahan || "Silakan periksa kembali berkas/data permohonan Anda sesuai arahan Admin."}
                </div>
              </div>
            </div>
          )}

          {/* Content Details Grid */}
          <div className="grid grid-rows-1 gap-8 flex-1">
            {/* Left Columns (Col Span 2) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
              {/* Card 1: Informasi Pemohon */}
              <div className="h-full rounded-2xl border border-zinc-200/80 bg-white p-6 md:p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 flex flex-col">
                <div className="flex border-b border-zinc-300 dark:border-zinc-800/80 items-center gap-2 pb-4 mb-6">
                  <h3 className="text-base font-bold text-green-color dark:text-zinc-200">
                    Informasi Pemohon
                  </h3>
                </div>

                <div className="grid gap-y-5 gap-x-6 grid-cols-1 md:grid-cols-2">
                  <div className="min-w-0">
                    <span className="text-zinc-500 block text-sm">
                      Nama Lengkap
                    </span>
                    <span className="font-medium text-zinc-900 dark:text-white text-sm break-words">
                      {formAnswers.nama_lengkap || "-"}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <span className="text-zinc-500 block text-sm">
                      NIP / NO. KTP
                    </span>
                    <span className="font-medium text-zinc-900 dark:text-white text-sm break-words">
                      {formAnswers.nip_ktp || "-"}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <span className="text-zinc-500 block text-sm">
                      Alamat Instansi / Asal
                    </span>
                    <span className="font-medium text-zinc-900 dark:text-white text-sm break-words">
                      {formAnswers.alamat_instansi || "-"}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <span className="text-zinc-500 block text-sm">
                      No. Telepon
                    </span>
                    <span className="font-medium text-zinc-900 dark:text-white text-sm break-words">
                      {formAnswers.no_telp || "-"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 2: Detail Layanan */}
              <div className="h-full rounded-2xl border border-zinc-200/80 bg-white p-6 md:p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 flex flex-col">
                <div className="flex border-b border-zinc-300 dark:border-zinc-800/80 items-center gap-2 pb-4 mb-6">
                  <h3 className="text-base font-bold text-green-color dark:text-zinc-200">
                    Detail Pengajuan Layanan
                  </h3>
                </div>

                <div className="space-y-6 text-sm flex-1">
                  <div className="grid gap-y-5 gap-x-6 grid-cols-1 md:grid-cols-2">
                    <div className="min-w-0">
                      <span className="text-zinc-500 block text-sm">
                        Nama Layanan
                      </span>
                      <span className="font-medium text-zinc-900 dark:text-white text-sm break-words">
                        {tiket.layanan.nama_layanan}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <span className="text-zinc-500 block text-sm">
                        Tanggal Pengajuan
                      </span>
                      <span className="font-medium text-zinc-900 dark:text-white text-sm break-words">
                        {formatDate(tiket.tanggal_submit)}
                      </span>
                    </div>
                  </div>

                  {/* Render custom fields from jawaban_form dynamically */}
                  <div className="grid gap-y-5 gap-x-6 grid-cols-1 md:grid-cols-2 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                    {Object.entries(formAnswers)
                      .filter(([key]) => !commonFields.includes(key))
                      .map(([key, value]) => {
                        const formattedKey = key
                          .split("_")
                          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                          .join(" ");

                        const isAlatList = key === "selected_alat_list" && Array.isArray(value);

                        return (
                          <div key={key} className={isAlatList ? "col-span-1 md:col-span-2 min-w-0" : "min-w-0"}>
                            <span className="text-zinc-500 block text-sm">
                              {formattedKey}
                            </span>
                            <div className="font-medium text-zinc-900 dark:text-white text-sm break-words">
                              {key === "total_estimasi" ? (
                                `Rp ${Number(value).toLocaleString("id-ID")}`
                              ) : isAlatList ? (
                                value.length > 0 ? (
                                  <div className="mt-1.5 border border-zinc-200/80 dark:border-zinc-800 rounded-xl p-3.5 bg-zinc-50/50 dark:bg-zinc-950/20 divide-y divide-zinc-100 dark:divide-zinc-800/60 font-semibold text-sm">
                                    {value.map((tool: any, idx: number) => (
                                      <div key={idx} className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 first:pt-0 last:pb-0 text-xs font-semibold gap-1 sm:gap-2">
                                        <span className="font-semibold text-[#2C5E3B] dark:text-secondary-green-color break-words">{tool.name}</span>
                                        <span className="text-zinc-500 dark:text-zinc-400 font-medium whitespace-nowrap">
                                          {tool.units} Unit × Rp {tool.price.toLocaleString("id-ID")}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-zinc-500 dark:text-zinc-400 text-xs mt-1 block font-normal">Tidak ada data alat yang dipinjam</span>
                                )
                              ) : (
                                value ? String(value) : "-"
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column (Col Span 1) */}
            <div className="space-y-8">
              {/* Card 4: Informasi Tagihan (Hanya untuk Layanan Peminjaman Alat) */}
              {isPeminjamanAlat && (
                <div className="rounded-2xl border border-zinc-200/80 bg-[#EFF4FF]/50 p-6 md:p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                  <div className="flex border-b border-zinc-300 dark:border-zinc-800/80 items-center gap-2 pb-4 mb-4">
                    <h3 className="text-base font-bold text-green-color dark:text-zinc-200">
                      Informasi Tagihan
                    </h3>
                  </div>

                  {tiket.tagihan ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-zinc-555 dark:text-zinc-400 font-medium">Nominal</span>
                        <span className="font-semibold text-[var(--green-color)] dark:text-zinc-100 text-base">
                          Rp {tiket.tagihan.jumlah.toLocaleString("id-ID")}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-zinc-555 dark:text-zinc-400 font-medium">Status</span>
                        <StatusPembayaranBadge status={tiket.tagihan.status_bayar} />
                      </div>

                      {tiket.tagihan.tanggal_lunas && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-zinc-555 dark:text-zinc-400 font-medium">Tanggal Lunas</span>
                          <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                            {formatDate(tiket.tagihan.tanggal_lunas)}
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-6">
                      <p className="text-xs text-zinc-400 dark:text-zinc-550 font-semibold tracking-wider uppercase">
                        Tidak ada tagihan
                      </p>
                    </div>
                  )}
                  <div className="pt-2 w-full">
                    <button
                      disabled={!tiket.tagihan}
                      onClick={() => router.push(`/layanan-saya/${idStr}/bayar`)}
                      className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${tiket.tagihan
                        ? "mt-3 bg-[var(--green-color)] text-white hover:opacity-90 active:scale-[0.99] cursor-pointer shadow-sm"
                        : "mt-2 bg-zinc-300 text-white dark:bg-zinc-800 dark:text-zinc-555 cursor-not-allowed"
                        }`}
                    >
                      Bayar
                    </button>
                  </div>
                </div>
              )}

              {/* Card 5: Dokumen Lampiran */}
              <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 md:p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex border-b border-zinc-300 dark:border-zinc-800/80 items-center gap-2 pb-4 mb-6">
                  <h3 className="text-base font-bold text-green-color dark:text-zinc-200">
                    Dokumen Lampiran
                  </h3>
                </div>

                <div className="space-y-4">
                  {lampiranDocs.length > 0 ? (
                    lampiranDocs.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/20 gap-3 min-w-0">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-650 dark:bg-red-950/30 dark:text-red-400">
                            <FileText className="h-5 w-5" />
                          </div>
                          <div className="flex flex-col text-left min-w-0">
                            <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 break-all" title={doc.nama_file}>
                              {doc.nama_file}
                            </span>
                            <span className="text-[10px] text-zinc-650 dark:text-zinc-500 font-medium">
                              {doc.tipe}
                            </span>
                          </div>
                        </div>
                        <a
                          href={doc.url_storage}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[var(--green-color)] p-1.5 rounded-lg cursor-pointer"
                        >
                          <Download className="h-4.5 w-4.5" />
                        </a>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-zinc-550 dark:text-zinc-450 text-center py-4">Tidak ada dokumen lampiran.</p>
                  )}
                </div>
              </div>

              {/* Card: Surat Penerimaan (Khusus Magang / PKL) */}
              {isMagang && (
                <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 md:p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                  <div className="flex border-b border-zinc-300 dark:border-zinc-800/80 items-center justify-between pb-4 mb-6">
                    <h3 className="text-base font-bold text-green-color dark:text-zinc-200">
                      Surat Penerimaan
                    </h3>
                    {["diterima", "selesai"].includes(tiket.status) && suratPenerimaanDocs.length > 0 && (
                      <span className="text-xs whitespace-nowrap font-semibold px-2.5 py-0.5 rounded-full bg-secondary-green-color text-green-color dark:bg-secondary-green-color/20 dark:text-secondary-green-color">
                        {suratPenerimaanDocs.length} Berkas
                      </span>
                    )}
                  </div>

                  <div className="space-y-4">
                    {["diterima", "selesai"].includes(tiket.status) && suratPenerimaanDocs.length > 0 ? (
                      suratPenerimaanDocs.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-3 rounded-xl border border-emerald-200/80 dark:border-emerald-900/50 bg-emerald-50/40 dark:bg-emerald-950/20 gap-3 min-w-0">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                              <FileText className="h-5 w-5" />
                            </div>
                            <div className="flex flex-col text-left min-w-0">
                              <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 break-words" title={doc.nama_file}>
                                {doc.nama_file}
                              </span>
                              <span className="text-[10px] text-zinc-650 dark:text-zinc-500 font-medium">
                                Diunggah {formatDate(doc.tanggal_upload)}
                              </span>
                            </div>
                          </div>
                          <a
                            href={doc.url_storage}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--green-color)] hover:bg-[var(--hover-green-color)] text-white text-xs font-semibold rounded-lg shadow-sm transition shrink-0 cursor-pointer"
                          >
                            <Download className="h-3.5 w-3.5" />
                            <span>Unduh</span>
                          </a>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-950/30">
                        <FileText className="h-8 w-8 text-zinc-350 dark:text-zinc-600 mx-auto mb-2" />
                        <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                          {["diterima", "selesai"].includes(tiket.status)
                            ? "Surat penerimaan belum diunggah."
                            : "Surat penerimaan sedang diproses dan akan tersedia setelah permohonan magang diterima."}
                        </p>
                        <p className="text-[11px] text-zinc-400 mt-1">
                          {["diterima", "selesai"].includes(tiket.status)
                            ? "Silakan hubungi petugas balai jika surat belum tersedia."
                            : "Petugas akan mengunggah surat penerimaan resmi saat pengajuan disetujui."}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Card 6: Laporan Hasil / Berita Acara */}
              <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 md:p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex border-b border-zinc-300 dark:border-zinc-800/80 items-center gap-2 pb-4 mb-6">
                  <h3 className="text-base font-bold text-green-color dark:text-zinc-200">
                    {isPeminjamanAlat ? "Berita Acara Serah Terima Alat" : "Laporan Hasil"}
                  </h3>
                </div>

                <div className="space-y-4">
                  {isPeminjamanAlat ? (
                    ["dipinjam", "selesai"].includes(tiket.status) && beritaAcaraDocs.length > 0 ? (
                      beritaAcaraDocs.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/20 gap-3 min-w-0">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary-green-color text-green-color dark:bg-secondary-green-color/30 dark:text-secondary-green-color">
                              <FileText className="h-5 w-5" />
                            </div>
                            <div className="flex flex-col text-left min-w-0">
                              <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 break-words" title={doc.nama_file}>
                                {doc.nama_file}
                              </span>
                              <span className="text-[10px] text-zinc-650 dark:text-zinc-550 font-medium">
                                {formatDate(doc.tanggal_upload)}
                              </span>
                            </div>
                          </div>
                          <a
                            href={doc.url_storage}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[#2C5E3B] hover:text-secondary-green-color p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                          >
                            <Download className="h-4.5 w-4.5" />
                          </a>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-zinc-550 dark:text-zinc-400 text-center py-4">
                        {["dipinjam", "selesai"].includes(tiket.status)
                          ? "Berita Acara belum diunggah oleh petugas."
                          : "Berita Acara serah terima alat akan tersedia setelah alat diserahkan oleh petugas laboratorium."}
                      </p>
                    )
                  ) : (
                    tiket.status === "selesai" && laporanDocs.length > 0 ? (
                      laporanDocs.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/20 gap-3 min-w-0">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary-green-color text-green-color dark:bg-secondary-green-color/30 dark:text-secondary-green-color">
                              <FileText className="h-5 w-5" />
                            </div>
                            <div className="flex flex-col text-left min-w-0">
                              <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 break-words" title={doc.nama_file}>
                                {doc.nama_file}
                              </span>
                              <span className="text-[10px] text-zinc-650 dark:text-zinc-550 font-medium">
                                {formatDate(doc.tanggal_upload)}
                              </span>
                            </div>
                          </div>
                          <a
                            href={doc.url_storage}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[#2C5E3B] hover:text-secondary-green-color p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                          >
                            <Download className="h-4.5 w-4.5" />
                          </a>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-zinc-550 dark:text-zinc-400 text-center py-4">
                        {tiket.status === "selesai"
                          ? "Laporan hasil belum diunggah."
                          : "Laporan hasil sedang dalam pengerjaan dan akan tersedia setelah layanan selesai."}
                      </p>
                    )
                  )}
                </div>
              </div>

              {/* Card 7: Sertifikat Magang / PKL */}
              {isMagang && (
                <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 md:p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                  <div className="flex border-b border-zinc-300 dark:border-zinc-800/80 items-center gap-2 pb-4 mb-6">
                    <h3 className="text-base font-bold text-green-color dark:text-zinc-200">
                      Sertifikat Magang / PKL
                    </h3>
                  </div>

                  <div className="space-y-4">
                    {tiket.status === "selesai" && sertifikatDocs.length > 0 ? (
                      sertifikatDocs.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-3 rounded-xl border border-emerald-200/80 dark:border-emerald-900/50 bg-emerald-50/40 dark:bg-emerald-950/20 gap-3 min-w-0">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                              <Award className="h-5 w-5" />
                            </div>
                            <div className="flex flex-col text-left min-w-0">
                              <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 break-words" title={doc.nama_file}>
                                {doc.nama_file}
                              </span>
                              <span className="text-[10px] text-zinc-650 dark:text-zinc-500 font-medium">
                                Diunggah {formatDate(doc.tanggal_upload)}
                              </span>
                            </div>
                          </div>
                          <a
                            href={doc.url_storage}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--green-color)] hover:bg-[var(--hover-green-color)] text-white text-xs font-semibold rounded-lg shadow-sm transition shrink-0 cursor-pointer"
                          >
                            <Download className="h-3.5 w-3.5" />
                            <span>Unduh</span>
                          </a>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-950/30">
                        <Award className="h-8 w-8 text-zinc-350 dark:text-zinc-600 mx-auto mb-2" />
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                          {tiket.status === "selesai"
                            ? "Sertifikat magang belum diterbitkan / diunggah."
                            : "Sertifikat magang belum diterbitkan."}
                        </p>
                        <p className="text-[11px] text-zinc-400 dark:text-zinc-550 mt-0.5">
                          {tiket.status === "selesai"
                            ? "Hubungi pihak balai jika terdapat kendala penerbitan sertifikat."
                            : "Sertifikat akan tersedia setelah proses magang selesai dievaluasi oleh Unit Teknis."}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {/* Card 3: Hasil belum sesuai? / Ajukan Kembali */}
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 dark:bg-zinc-900/30 p-6 md:p-8 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div>
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Hasil belum sesuai?</h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1.5 max-w-xl font-medium leading-relaxed">
                      Jika dokumen hasil yang diterima belum sesuai dengan permintaan Anda, silakan ajukan permohonan kembali untuk penyesuaian.
                    </p>
                  </div>
                  <Link href={getFormLayananLink(tiket.layanan)}>
                    <button
                      disabled={tiket.status !== "selesai"}
                      className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-bold transition whitespace-nowrap ${tiket.status === "selesai"
                        ? "bg-[var(--green-color)] hover:opacity-90 text-white hover:scale-[1.02] active:scale-[0.98] cursor-pointer shadow-sm"
                        : "bg-zinc-300 text-white dark:bg-zinc-850 dark:text-zinc-500 cursor-not-allowed"
                        }`}
                    >
                      <RefreshCw className="h-4.5 w-4.5" />
                      <span>Ajukan Kembali</span>
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div> {/* End of Giant Card Wrapper */}
      </main>
    </div>
  );
}
