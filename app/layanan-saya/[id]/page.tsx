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
  RefreshCw
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getUserTiketDetail } from "@/lib/tiket";
import StatusLayananBadge from "@/components/badge/status-layanan/StatusLayananBadge";

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

function getSteps(status: string, hasTagihan: boolean, tagihanLunas: boolean, layananId: number) {
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

  const isVerifikasiDone = ["menunggu_pembayaran", "diproses", "menunggu_konfirmasi", "selesai"].includes(status);
  const isVerifikasiActive = ["menunggu_verifikasi", "diajukan", "perlu_revisi"].includes(status);

  const isTagihanDone = isVerifikasiDone && (!hasTagihan || tagihanLunas);
  const isTagihanActive = status === "menunggu_pembayaran";

  const isDisetujuiDone = ["diproses", "selesai"].includes(status);
  const isDisetujuiActive = status === "menunggu_konfirmasi";

  const isDiprosesDone = status === "selesai";
  const isDiprosesActive = status === "diproses";

  const isSelesaiDone = status === "selesai";

  return [
    {
      label: "Verifikasi",
      status: isVerifikasiDone ? "completed" : (isVerifikasiActive ? "active" : "pending"),
      date: isVerifikasiDone ? "Selesai" : (isVerifikasiActive ? "Proses" : "Menunggu"),
      icon: Check
    },
    ...(layananId === 19 ? [
      {
        label: "Tagihan",
        status: isTagihanDone ? "completed" : (isTagihanActive ? "active" : "pending"),
        date: isTagihanDone ? "Selesai" : (isTagihanActive ? "Menunggu Bayar" : "Menunggu"),
        icon: Check
      }
    ] : []),
    {
      label: "Disetujui",
      status: isDisetujuiDone ? "completed" : (isDisetujuiActive ? "active" : "pending"),
      date: isDisetujuiDone ? "Selesai" : (isDisetujuiActive ? "Menunggu Konfirmasi" : "Menunggu"),
      icon: Hourglass
    },
    {
      label: "Diproses",
      status: isDiprosesDone ? "completed" : (isDiprosesActive ? "active" : "pending"),
      date: isDiprosesDone ? "Selesai" : (isDiprosesActive ? "Sedang Diproses" : "Menunggu"),
      icon: User
    },
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
      const res = await fetch(`http://localhost:3000/tiket/${tiket.id}/dokumen`, {
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
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
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

  const hasTagihan = !!tiket.tagihan;
  const tagihanLunas = tiket.tagihan?.status_bayar === "lunas";
  const steps = getSteps(tiket.status, hasTagihan, tagihanLunas, tiket.layanan.id);

  // Separate common fields from form answers
  const commonFields = ["nama_lengkap", "nip_ktp", "alamat_instansi", "no_telp"];
  const formAnswers = tiket.jawaban_form || {};

  // Lampiran vs Laporan Hasil
  const lampiranDocs = tiket.dokumen.filter(doc => doc.tipe !== "Laporan Hasil");
  const laporanDocs = tiket.dokumen.filter(doc => doc.tipe === "Laporan Hasil");

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1 mb-6">
          <Link
            href="/layanan-saya"
            className="flex items-center text-xs font-semibold text-zinc-500 hover:text-zinc-700 dark:text-zinc-650 dark:hover:text-zinc-200 transition"
          >
            <ChevronLeft className="h-4 w-4 mr-0.5" />
            Kembali ke Riwayat Layanan
          </Link>
        </div>

        {/* Giant Card Wrapper */}
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 md:p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          {/* Title and Action Button */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800 mb-8">
            <div>
              <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white tracking-tight">
                Detail Pengajuan: {tiket.no_tiket}
              </h1>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-650 font-medium">
                Pantau status dan lihat detail permohonan layanan Anda.
              </p>
            </div>

            <button className="flex items-center justify-center gap-2 rounded-xl bg-[#2C5E3B] hover:bg-[#20492E] text-white px-5 py-3 text-sm font-semibold transition shadow-sm cursor-pointer self-end md:self-auto">
              <ClipboardSignature className="h-4.5 w-4.5" />
              <span>Isi Survei Kepuasan</span>
            </button>
          </div>

          {/* Status tracker timeline card */}
          {tiket.status !== "ditolak" && (
            <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 md:p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 mb-8">
              <h2 className="flex text-base font-semibold text-zinc-800 dark:text-zinc-200 mb-4">
                Status Permohonan <span className="ml-4"><StatusLayananBadge status={tiket.status} /></span>
              </h2>
              {tiket.tanggal_sla && (
                <p className="text-xs text-zinc-655 dark:text-zinc-555 mt-0.5 font-medium">
                  Estimasi penyelesaian (SLA): {formatDate(tiket.tanggal_sla)}
                </p>
              )}

              <div className="mt-8 relative flex items-center justify-between w-full max-w-4xl mx-auto overflow-x-auto pb-4">
                {steps.map((step, idx) => {
                  const Icon = step.icon;
                  const isCompleted = step.status === "completed";
                  const isActive = step.status === "active";

                  // Line logic
                  const showLine = idx < steps.length - 1;
                  const isLineCompleted = isCompleted && (steps[idx + 1]?.status === "completed" || steps[idx + 1]?.status === "active");

                  return (
                    <div key={idx} className="flex flex-col items-center flex-1 min-w-[120px] relative">
                      {/* Line to next step */}
                      {showLine && (
                        <div
                          className={`absolute top-5 left-1/2 right-[-50%] h-[3px] -translate-y-1/2 z-0 transition-colors duration-300 ${steps[idx + 1]?.label === "Ditolak"
                            ? "bg-red-600"
                            : isLineCompleted
                              ? "bg-[#2C5E3B]"
                              : "bg-zinc-200 dark:bg-zinc-800"
                            }`}
                        />
                      )}

                      {/* Icon Circle */}
                      <div
                        className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300 ${step.label === "Ditolak"
                          ? "bg-red-600 border-red-600 text-white"
                          : isCompleted
                            ? "bg-[#2C5E3B] border-[#2C5E3B] text-white"
                            : isActive
                              ? "bg-[#FFDF9A] border-[#FFDF9A] text-[#2C5E3B]"
                              : "bg-slate-50 border-zinc-200 text-zinc-655 dark:bg-zinc-800 dark:border-zinc-700"
                          }`}
                      >
                        <Icon className="h-5 w-5" strokeWidth={2.5} />
                      </div>

                      {/* Labels */}
                      <span className={`mt-3 text-sm font-semibold ${step.label === "Ditolak"
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Columns (Col Span 2) */}
            <div className="lg:col-span-2 space-y-8">
              {/* Card 1: Informasi Pemohon */}
              <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 md:p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex border-b border-zinc-300 dark:border-zinc-800/80 items-center gap-2 pb-4 mb-6">
                  <User className="h-5 w-5 text-[#2C5E3B]" />
                  <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200">
                    Informasi Pemohon
                  </h3>
                </div>

                <div className="grid gap-y-5 gap-x-6 sm:grid-cols-2 text-sm">
                  <div>
                    <span className="block text-xs font-medium text-[var(--foreground)] dark:text-zinc-500 uppercase tracking-wider">
                      Nama Lengkap
                    </span>
                    <span className="block text-sm font-semibold text-zinc-800 dark:text-zinc-200 mt-1">
                      {formAnswers.nama_lengkap || "-"}
                    </span>
                  </div>

                  <div>
                    <span className="block text-xs font-medium text-[var(--foreground)] dark:text-zinc-500 uppercase tracking-wider">
                      NIP / No. KTP
                    </span>
                    <span className="block text-sm font-semibold text-zinc-800 dark:text-zinc-200 mt-1">
                      {formAnswers.nip_ktp || "-"}
                    </span>
                  </div>

                  <div>
                    <span className="block text-xs font-medium text-[var(--foreground)] dark:text-zinc-500 uppercase tracking-wider">
                      Alamat Instansi / Asal
                    </span>
                    <span className="block text-sm font-semibold text-zinc-800 dark:text-zinc-200 mt-1">
                      {formAnswers.alamat_instansi || "-"}
                    </span>
                  </div>

                  <div>
                    <span className="block text-xs font-medium text-[var(--foreground)] dark:text-zinc-500 uppercase tracking-wider">
                      No. Telepon
                    </span>
                    <span className="block text-sm font-semibold text-zinc-800 dark:text-zinc-200 mt-1">
                      {formAnswers.no_telp || "-"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 2: Detail Layanan */}
              <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 md:p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex border-b border-zinc-300 dark:border-zinc-800/80 items-center gap-2 pb-4 mb-6">
                  <Database className="h-5 w-5 text-[#2C5E3B]" />
                  <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200">
                    Detail Pengajuan Layanan
                  </h3>
                </div>

                <div className="space-y-6 text-sm">
                  <div className="grid gap-y-5 gap-x-6 sm:grid-cols-2">
                    <div>
                      <span className="block text-xs font-medium text-[var(--foreground)] dark:text-zinc-500 uppercase tracking-wider">
                        Nama Layanan
                      </span>
                      <span className="block text-sm font-semibold text-zinc-800 dark:text-zinc-200 mt-1">
                        {tiket.layanan.nama_layanan}
                      </span>
                    </div>

                    <div>
                      <span className="block text-xs font-medium text-[var(--foreground)] dark:text-zinc-500 uppercase tracking-wider">
                        Tanggal Pengajuan
                      </span>
                      <span className="block text-sm font-semibold text-zinc-800 dark:text-zinc-200 mt-1">
                        {formatDate(tiket.tanggal_submit)}
                      </span>
                    </div>
                  </div>

                  {/* Render custom fields from jawaban_form dynamically */}
                  <div className="grid gap-y-5 gap-x-6 sm:grid-cols-2 pt-4">
                    {Object.entries(formAnswers)
                      .filter(([key]) => !commonFields.includes(key))
                      .map(([key, value]) => {
                        const formattedKey = key
                          .split("_")
                          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                          .join(" ");

                        const isAlatList = key === "selected_alat_list" && Array.isArray(value);

                        return (
                          <div key={key} className={isAlatList ? "col-span-2" : ""}>
                            <span className="block text-xs font-medium text-[var(--foreground)] dark:text-zinc-500 uppercase tracking-wider">
                              {formattedKey}
                            </span>
                            <div className="block text-sm font-semibold text-zinc-800 dark:text-zinc-200 mt-1 leading-relaxed whitespace-pre-line">
                              {key === "total_estimasi" ? (
                                `Rp ${Number(value).toLocaleString("id-ID")}`
                              ) : isAlatList ? (
                                <div className="mt-1.5 border border-zinc-200/80 dark:border-zinc-800 rounded-xl p-3.5 bg-zinc-50/50 dark:bg-zinc-950/20 divide-y divide-zinc-100 dark:divide-zinc-800/60 font-semibold text-sm">
                                  {value.map((tool: any, idx: number) => (
                                    <div key={idx} className="flex justify-between items-center py-2 first:pt-0 last:pb-0 text-xs font-semibold">
                                      <span className="font-semibold text-[#2C5E3B] dark:text-emerald-450">{tool.name}</span>
                                      <span className="text-zinc-500 dark:text-zinc-400 font-medium">
                                        {tool.units} Unit × Rp {tool.price.toLocaleString("id-ID")}
                                      </span>
                                    </div>
                                  ))}
                                </div>
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

              {/* Card 3: Hasil belum sesuai? / Ajukan Kembali */}
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 dark:bg-zinc-900/30 p-6 md:p-8 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div>
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Hasil belum sesuai?</h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1.5 max-w-xl font-medium leading-relaxed">
                      Jika dokumen hasil yang diterima belum sesuai dengan permintaan Anda, silakan ajukan permohonan kembali untuk penyesuaian.
                    </p>
                  </div>
                  <Link href={`/layanan-saya/${tiket.id}/ajukan-kembali`}>
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

            {/* Right Column (Col Span 1) */}
            <div className="space-y-8">
              {/* Card 4: Informasi Tagihan */}
              <div className="rounded-2xl border border-zinc-200/80 bg-[#EFF4FF] p-6 md:p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex border-b border-zinc-300 dark:border-zinc-800/80 items-center gap-2 pb-4 mb-4">
                  <Receipt className="h-5 w-5 text-[#2C5E3B]" />
                  <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200">
                    Informasi Tagihan
                  </h3>
                </div>

                {tiket.tagihan ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-zinc-555 dark:text-zinc-400 font-medium">Nominal</span>
                      <span className="font-bold text-[var(--green-color)] dark:text-zinc-100 text-base">
                        Rp {tiket.tagihan.jumlah.toLocaleString("id-ID")}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-zinc-555 dark:text-zinc-400 font-medium">Status</span>
                      {tiket.tagihan.status_bayar === "lunas" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-250 dark:bg-emerald-950/20 dark:text-emerald-450">
                          Lunas
                        </span>
                      ) : tiket.tagihan.status_bayar === "batal" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-250 dark:bg-red-950/20 dark:text-red-450">
                          Batal
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-50 text-yellow-700 border border-yellow-250 dark:bg-yellow-950/20 dark:text-yellow-450">
                          Menunggu Pembayaran
                        </span>
                      )}
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

              {/* Card 5: Dokumen Lampiran */}
              <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 md:p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex border-b border-zinc-300 dark:border-zinc-800/80 items-center gap-2 pb-4 mb-6">
                  <FileText className="h-5 w-5 text-[#2C5E3B]" />
                  <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200">
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
                            <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate" title={doc.nama_file}>
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
                          className="text-[#2C5E3B] hover:text-emerald-700 p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
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

              {/* Card 6: Laporan Hasil */}
              <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 md:p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex border-b border-zinc-300 dark:border-zinc-800/80 items-center gap-2 pb-4 mb-6">
                  <FileText className="h-5 w-5 text-[#2C5E3B]" />
                  <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200">
                    Laporan Hasil
                  </h3>
                </div>

                <div className="space-y-4">
                  {laporanDocs.length > 0 ? (
                    laporanDocs.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/20 gap-3 min-w-0">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-650 dark:bg-emerald-950/30 dark:text-emerald-450">
                            <FileText className="h-5 w-5" />
                          </div>
                          <div className="flex flex-col text-left min-w-0">
                            <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate" title={doc.nama_file}>
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
                          className="text-[#2C5E3B] hover:text-emerald-700 p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                        >
                          <Download className="h-4.5 w-4.5" />
                        </a>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-zinc-550 dark:text-zinc-450 text-center py-4">Laporan hasil belum diunggah.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div> {/* End of Giant Card Wrapper */}
      </main>
    </div>
  );
}
