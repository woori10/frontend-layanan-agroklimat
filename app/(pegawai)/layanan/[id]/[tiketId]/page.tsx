"use client";

import React, { use, useEffect, useState } from "react";
import Sidebar from "@/components/sidebar/Sidebar";
import AppBar from "@/components/appbar/AppBar";
import BillingModal from "@/components/modal/BillingModal";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getTiketDetail, mulaiProsesTiket, selesaiProsesTiket, uploadLaporanHasil } from "@/lib/tiket";
import StatusLayananBadge from "@/components/badge/status-layanan/StatusLayananBadge";
import {
    ChevronLeft,
    CheckCircle,
    CheckCircle2,
    User,
    FileText,
    Download,
    CreditCard,
    Database,
    Clock,
    Play,
    Calendar,
    UploadCloud,
    AlertCircle,
    Info,
    File
} from "lucide-react";

interface PageProps {
    params: Promise<{
        id: string;
        tiketId: string;
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
        biaya?: any;
    };
    dokumen: Dokumen[];
    tagihan?: Tagihan | null;
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

const servicesMap: Record<string, string> = {
    "14": "Rekomendasi & Penilaian Kesesuaian SNI",
    "15": "Konsultasi Rekomendasi & Penilaian Kesesuaian SNI",
    "16": "Rekomendasi Siap Tanam",
    "17": "Bimbingan Teknis & Narasumber",
    "18": "Permohonan Data",
    "19": "Peminjaman Alat",
    "20": "Magang Teknis / PKL",
    "21": "Agroedukasi / Kunjungan Edukasi",
    "22": "Layanan Perpustakaan",
    "23": "Layanan Mess",
};

export default function DetailLayananPegawaiPage({ params }: PageProps) {
    const resolvedParams = use(params);
    const router = useRouter();
    const idStr = resolvedParams.tiketId;
    const tiketId = parseInt(idStr, 10);
    const serviceName = servicesMap[resolvedParams.id] || "Layanan";

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [tiket, setTiket] = useState<TiketDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [mounted, setMounted] = useState(false);

    const [billingModalOpen, setBillingModalOpen] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    const [reportFile, setReportFile] = useState<File | null>(null);
    const [uploadLoading, setUploadLoading] = useState(false);

    useEffect(() => {
        setMounted(true);
        const token = localStorage.getItem("agro_token");
        if (!token) {
            router.push("/login");
            return;
        }

        if (isNaN(tiketId)) {
            setError("ID Tiket tidak valid");
            setLoading(false);
            return;
        }

        getTiketDetail(tiketId)
            .then(setTiket)
            .catch((err: any) => setError(err.message))
            .finally(() => setLoading(false));
    }, [tiketId, router]);

    const handleSelesai = async () => {
        if (!tiket) return;
        if (confirm(`Apakah Anda yakin pekerjaan untuk tiket ${tiket.no_tiket} telah selesai?`)) {
            setActionLoading(true);
            try {
                await selesaiProsesTiket(tiket.id);
                alert("Status tiket berhasil diupdate menjadi selesai!");
                // Re-fetch detail
                const updated = await getTiketDetail(tiket.id);
                setTiket(updated);
            } catch (err: any) {
                alert(err.message || "Gagal memperbarui status");
            } finally {
                setActionLoading(false);
            }
        }
    };

    const submitBilling = async (jumlahSatuan: number) => {
        if (!tiket) return;
        setActionLoading(true);
        try {
            await mulaiProsesTiket(tiket.id, jumlahSatuan);
            alert("Tagihan berhasil dibuat!");
            setBillingModalOpen(false);
            // Re-fetch detail
            const updated = await getTiketDetail(tiket.id);
            setTiket(updated);
        } catch (err: any) {
            alert(err.message || "Gagal memproses tagihan");
        } finally {
            setActionLoading(false);
        }
    };

    const handleUploadReport = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reportFile || !tiket) return;
        setUploadLoading(true);
        try {
            await uploadLaporanHasil(tiket.id, reportFile);
            alert("Berita acara / laporan hasil berhasil diunggah!");
            setReportFile(null);
            // Re-fetch detail
            const updated = await getTiketDetail(tiket.id);
            setTiket(updated);
        } catch (err: any) {
            alert(err.message || "Gagal mengunggah berita acara");
        } finally {
            setUploadLoading(false);
        }
    };

    if (!mounted) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
                <span className="ml-3 text-xs text-zinc-500 dark:text-zinc-400">Memuat detail permohonan...</span>
            </div>
        );
    }

    if (error || !tiket) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
                <span className="text-sm font-semibold text-red-500">{error || "Permohonan tidak ditemukan"}</span>
            </div>
        );
    }

    const commonFields = ["nama_lengkap", "nip_ktp", "alamat_instansi", "no_telp"];
    const formAnswers = tiket.jawaban_form || {};
    const lampiranDocs = tiket.dokumen.filter(doc => doc.tipe !== "Laporan Hasil");
    const laporanDocs = tiket.dokumen.filter(doc => doc.tipe === "Laporan Hasil");

    const isGratis = tiket.layanan.biaya?.tipe === "gratis";

    return (
        <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 overflow-hidden font-sans">
            <Sidebar />

            <div className="flex flex-col flex-1 overflow-y-auto">
                <AppBar onMenuClick={() => setSidebarOpen(true)} />
                <main className="flex-1 p-4 md:p-8 space-y-8">
                    {/* Header / Breadcrumb */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div className="flex items-center flex-wrap gap-2.5">
                            <Link
                                href={`/layanan/${resolvedParams.id}`}
                                className="group flex items-center text-sm font-semibold text-zinc-650 dark:text-zinc-400 hover:text-[var(--green-color)] dark:hover:text-emerald-400 transition-colors duration-200"
                            >
                                <ChevronLeft className="h-4.5 w-4.5 mr-1 group-hover:-translate-x-1 transition-transform duration-200" />
                                <span>Daftar Tiket</span>
                            </Link>
                            <span className="text-zinc-300 dark:text-zinc-800">/</span>
                            <span className="text-sm font-medium text-zinc-500 dark:text-zinc-500 truncate max-w-[180px] md:max-w-xs" title={serviceName}>
                                {serviceName}
                            </span>
                            <span className="text-zinc-300 dark:text-zinc-800">/</span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-xs font-semibold text-emerald-800 dark:text-emerald-400 font-mono border border-emerald-100 dark:border-emerald-900/30">
                                {tiket.no_tiket}
                            </span>
                        </div>

                        {/* Action buttons based on status */}
                        <div className="flex items-center gap-3">
                            {tiket.status === "diproses" ? (
                                <button
                                    onClick={handleSelesai}
                                    disabled={actionLoading}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-500 hover:to-green-600 text-white font-bold shadow-md shadow-emerald-500/10 hover:shadow-lg hover:shadow-emerald-500/20 active:scale-98 transition-all duration-200 cursor-pointer text-xs disabled:opacity-50 disabled:pointer-events-none"
                                >
                                    <CheckCircle className="h-4 w-4" />
                                    <span>Selesaikan Pekerjaan</span>
                                </button>
                            ) : (
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-900/40 rounded-xl text-xs font-bold shadow-sm shadow-emerald-500/5">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                    <span>Pekerjaan Selesai</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Premium Header Banner Card */}
                    <div className="relative overflow-hidden rounded-2xl border border-zinc-200/80 bg-white p-6 md:p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/90 backdrop-blur-sm transition-all duration-300">
                        {/* Glowing top line gradient */}
                        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-emerald-600 via-green-600 to-teal-500" />

                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="space-y-2">
                                <span className="text-[11px] font-bold text-[var(--green-color)] dark:text-emerald-400 tracking-widest uppercase">
                                    Detail Pengajuan Layanan
                                </span>
                                <h1 className="text-xl md:text-2xl font-black text-zinc-900 dark:text-zinc-50 leading-tight">
                                    {serviceName}
                                </h1>
                                <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                                    <span className="flex items-center gap-1">
                                        <Clock className="h-3.5 w-3.5 text-zinc-400" />
                                        Diajukan pada: <strong className="text-zinc-750 dark:text-zinc-300">{formatDate(tiket.tanggal_submit)}</strong>
                                    </span>
                                    {tiket.tanggal_sla && (
                                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-400 border border-amber-100 dark:border-amber-900/20">
                                            <Calendar className="h-3 w-3" />
                                            SLA: <strong>{formatDate(tiket.tanggal_sla)}</strong>
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
                                <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                                    Status Permohonan
                                </span>
                                <StatusLayananBadge status={tiket.status} className="scale-105 shadow-sm" />
                            </div>
                        </div>
                    </div>

                    {/* Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                        {/* Sebelah Kiri: Informasi Pemohon & Detail Pengajuan */}
                        <div className="space-y-8">
                            {/* Card 1: Informasi Pemohon */}
                            <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/90 transition-all duration-300 hover:shadow-md">
                                <div className="flex items-center gap-3 border-b border-zinc-150 dark:border-zinc-800/60 pb-4 mb-6">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-[var(--green-color)] dark:text-emerald-400">
                                        <User className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-150">
                                            Informasi Pemohon
                                        </h3>
                                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Data diri lengkap pemohon layanan</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="p-4 rounded-xl bg-zinc-50/50 dark:bg-zinc-950/20 border border-zinc-100 dark:border-zinc-800/40 space-y-1 hover:border-zinc-200 dark:hover:border-zinc-800 transition-colors">
                                        <span className="block text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                                            Nama Lengkap
                                        </span>
                                        <span className="block font-semibold text-zinc-855 dark:text-zinc-250 text-sm">
                                            {formAnswers.nama_lengkap || "-"}
                                        </span>
                                    </div>

                                    <div className="p-4 rounded-xl bg-zinc-50/50 dark:bg-zinc-950/20 border border-zinc-100 dark:border-zinc-800/40 space-y-1 hover:border-zinc-200 dark:hover:border-zinc-800 transition-colors">
                                        <span className="block text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                                            NIP / No. KTP
                                        </span>
                                        <span className="block font-semibold text-zinc-855 dark:text-zinc-250 text-sm font-mono">
                                            {formAnswers.nip_ktp || "-"}
                                        </span>
                                    </div>

                                    <div className="p-4 rounded-xl bg-zinc-50/50 dark:bg-zinc-950/20 border border-zinc-100 dark:border-zinc-800/40 space-y-1 hover:border-zinc-200 dark:hover:border-zinc-800 transition-colors sm:col-span-2">
                                        <span className="block text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                                            Alamat Instansi / Asal
                                        </span>
                                        <span className="block font-semibold text-zinc-855 dark:text-zinc-250 text-sm leading-relaxed">
                                            {formAnswers.alamat_instansi || "-"}
                                        </span>
                                    </div>

                                    <div className="p-4 rounded-xl bg-zinc-50/50 dark:bg-zinc-950/20 border border-zinc-100 dark:border-zinc-800/40 space-y-1 hover:border-zinc-200 dark:hover:border-zinc-800 transition-colors sm:col-span-2">
                                        <span className="block text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                                            No. Telepon
                                        </span>
                                        <span className="block font-semibold text-zinc-855 dark:text-zinc-250 text-sm">
                                            {formAnswers.no_telp || "-"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Card 2: Detail Layanan */}
                            <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/90 transition-all duration-300 hover:shadow-md">
                                <div className="flex items-center gap-3 border-b border-zinc-150 dark:border-zinc-800/60 pb-4 mb-6">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-[var(--green-color)] dark:text-emerald-400">
                                        <Database className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-150">
                                            Detail Pengajuan Layanan
                                        </h3>
                                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Spesifikasi dan formulir pengajuan layanan</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {/* Nama Layanan & Tanggal Pengajuan row */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="p-4 rounded-xl bg-zinc-50/50 dark:bg-zinc-950/20 border border-zinc-100 dark:border-zinc-800/40 space-y-1 hover:border-zinc-200 dark:hover:border-zinc-800 transition-colors">
                                            <span className="block text-[10px] font-bold text-[var(--foreground)] dark:text-zinc-500 uppercase tracking-widest">
                                                Nama Layanan
                                            </span>
                                            <span className="block font-bold text-zinc-900 dark:text-white text-[15px] mt-1">
                                                {tiket.layanan.nama_layanan}
                                            </span>
                                        </div>

                                        <div className="p-4 rounded-xl bg-zinc-50/50 dark:bg-zinc-950/20 border border-zinc-100 dark:border-zinc-800/40 space-y-1 hover:border-zinc-200 dark:hover:border-zinc-800 transition-colors">
                                            <span className="block text-[10px] font-bold text-[var(--foreground)] dark:text-zinc-500 uppercase tracking-widest">
                                                Tanggal Pengajuan
                                            </span>
                                            <span className="block font-bold text-zinc-900 dark:text-white text-[15px] mt-1">
                                                {formatDate(tiket.tanggal_submit)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Render custom fields from jawaban_form dynamically */}
                                    {Object.keys(formAnswers).filter(k => !commonFields.includes(k)).length > 0 && (
                                        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/40">
                                            <span className="block text-[10px] font-bold text-[var(--foreground)] dark:text-zinc-500 uppercase tracking-widest mb-3">
                                                Isian Formulir Tambahan
                                            </span>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {Object.entries(formAnswers)
                                                    .filter(([key]) => !commonFields.includes(key))
                                                    .map(([key, value]) => {
                                                        const formattedKey = key
                                                            .split("_")
                                                            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                                            .join(" ");

                                                        const isAlatList = key === "selected_alat_list" && Array.isArray(value);

                                                        return (
                                                            <div key={key} className="p-4 rounded-xl bg-zinc-50/50 dark:bg-zinc-950/20 border border-zinc-100 dark:border-zinc-800/40 space-y-1 hover:border-zinc-200 dark:hover:border-zinc-800 transition-colors sm:col-span-2 last:sm:col-span-2">
                                                                <span className="block text-[10px] font-bold text-[var(--foreground)] dark:text-zinc-500 uppercase tracking-widest">
                                                                    {formattedKey}
                                                                </span>
                                                                <div className="block font-bold text-zinc-900 dark:text-white text-[15px] mt-1 leading-relaxed whitespace-pre-line font-sans">
                                                                    {key === "total_estimasi" ? (
                                                                        `Rp ${Number(value).toLocaleString("id-ID")}`
                                                                    ) : isAlatList ? (
                                                                        <div className="mt-1.5 border border-zinc-200/80 dark:border-zinc-800 rounded-xl p-3.5 bg-white dark:bg-zinc-900 divide-y divide-zinc-100 dark:divide-zinc-800/60 font-semibold text-sm">
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
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Sebelah Kanan: Dokumen Lampiran, Informasi Tagihan, & Berita Acara */}
                        <div className="space-y-8">
                            {/* Card 3: Dokumen Lampiran */}
                            <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/90 transition-all duration-300 hover:shadow-md">
                                <div className="flex items-center gap-3 border-b border-zinc-150 dark:border-zinc-800/60 pb-4 mb-6">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-[var(--green-color)] dark:text-emerald-400">
                                        <FileText className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-150">
                                            Dokumen Lampiran
                                        </h3>
                                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Berkas pendukung yang diunggah oleh pemohon</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {lampiranDocs.length > 0 ? (
                                        <div className="grid grid-cols-1 gap-3">
                                            {lampiranDocs.map((doc) => (
                                                <div key={doc.id} className="group flex items-center justify-between p-3.5 rounded-xl border border-zinc-150 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/30 hover:bg-white dark:hover:bg-zinc-900/60 hover:border-emerald-500/30 dark:hover:border-emerald-500/20 shadow-xs hover:shadow-md transition-all duration-200 gap-3 min-w-0">
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-660 dark:bg-red-950/20 dark:text-red-400 group-hover:scale-105 transition-transform duration-250">
                                                            <FileText className="h-5 w-5" />
                                                        </div>
                                                        <div className="flex flex-col text-left min-w-0">
                                                            <span className="text-xs font-bold text-zinc-800 dark:text-zinc-250 truncate group-hover:text-[var(--green-color)] dark:group-hover:text-emerald-400 transition-colors" title={doc.nama_file}>
                                                                {doc.nama_file}
                                                            </span>
                                                            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-semibold uppercase tracking-wider">
                                                                {doc.tipe}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <a
                                                        href={doc.url_storage}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white dark:bg-zinc-800 text-zinc-650 dark:text-zinc-350 hover:text-white dark:hover:text-white hover:bg-[var(--green-color)] dark:hover:bg-emerald-600 border border-zinc-200 dark:border-zinc-700 cursor-pointer shadow-xs transition-all duration-200"
                                                        title="Unduh File"
                                                    >
                                                        <Download className="h-4 w-4" />
                                                    </a>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center p-8 rounded-xl border border-dashed border-zinc-250 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/10">
                                            <File className="h-8 w-8 text-zinc-350 dark:text-zinc-650 mb-2" />
                                            <p className="text-xs text-zinc-500 dark:text-zinc-500 text-center font-medium">Tidak ada dokumen lampiran.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Card 4: Informasi Tagihan (if exists) */}
                            {tiket.tagihan ? (
                                <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/90 transition-all duration-300 hover:shadow-md">
                                    <div className="flex items-center gap-3 border-b border-zinc-150 dark:border-zinc-800/60 pb-4 mb-6">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-[var(--green-color)] dark:text-emerald-400">
                                            <CreditCard className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-150">
                                                Informasi Tagihan
                                            </h3>
                                            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Rincian status dan nominal tagihan permohonan</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-50/50 dark:bg-zinc-950/20 border border-zinc-100 dark:border-zinc-800/40">
                                            <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Nominal Tagihan</span>
                                            <span className="font-black text-zinc-900 dark:text-zinc-50 text-xl tracking-tight">
                                                Rp {tiket.tagihan.jumlah.toLocaleString("id-ID")}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-50/50 dark:bg-zinc-950/20 border border-zinc-100 dark:border-zinc-800/40">
                                            <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Status Pembayaran</span>
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${tiket.tagihan.status_bayar === "lunas"
                                                ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-900/30"
                                                : "bg-amber-50 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400 border-amber-200/50 dark:border-amber-900/30"
                                                }`}>
                                                <span className={`h-1.5 w-1.5 rounded-full ${tiket.tagihan.status_bayar === "lunas" ? "bg-emerald-600 dark:bg-emerald-400" : "bg-amber-500"}`} />
                                                {tiket.tagihan.status_bayar === "lunas" ? "Lunas" : "Belum Lunas"}
                                            </span>
                                        </div>

                                        {tiket.tagihan.tanggal_lunas && (
                                            <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-50/50 dark:bg-zinc-950/20 border border-zinc-100 dark:border-zinc-800/40">
                                                <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Tanggal Lunas</span>
                                                <span className="font-semibold text-zinc-855 dark:text-zinc-200 text-sm">
                                                    {formatDate(tiket.tagihan.tanggal_lunas)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : null}

                            {/* Card 5: Berita Acara / Laporan Hasil Card */}
                            <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/90 transition-all duration-300 hover:shadow-md">
                                <div className="flex items-center gap-3 border-b border-zinc-150 dark:border-zinc-800/60 pb-4 mb-6">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-[var(--green-color)] dark:text-emerald-400">
                                        <FileText className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-150">
                                            Berita Acara / Surat Balasan
                                        </h3>
                                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Hasil laporan atau surat balasan resmi</p>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    {/* List of Laporan Hasil documents */}
                                    {laporanDocs.length > 0 ? (
                                        <div className="grid grid-cols-1 gap-3">
                                            {laporanDocs.map((doc) => (
                                                <div key={doc.id} className="group flex items-center justify-between p-3.5 rounded-xl border border-zinc-150 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/30 hover:bg-white dark:hover:bg-zinc-900/60 hover:border-emerald-500/30 dark:hover:border-emerald-500/20 shadow-xs hover:shadow-md transition-all duration-200 gap-3 min-w-0">
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 group-hover:scale-105 transition-transform duration-250">
                                                            <FileText className="h-5 w-5" />
                                                        </div>
                                                        <div className="flex flex-col text-left min-w-0">
                                                            <span className="text-xs font-bold text-zinc-800 dark:text-zinc-255 truncate group-hover:text-[var(--green-color)] dark:group-hover:text-emerald-400 transition-colors" title={doc.nama_file}>
                                                                {doc.nama_file}
                                                            </span>
                                                            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-semibold">
                                                                Diunggah: {formatDate(doc.tanggal_upload)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <a
                                                        href={doc.url_storage}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white dark:bg-zinc-800 text-zinc-650 dark:text-zinc-355 hover:text-white dark:hover:text-white hover:bg-[var(--green-color)] dark:hover:bg-emerald-600 border border-zinc-200 dark:border-zinc-700 cursor-pointer shadow-xs transition-all duration-200"
                                                        title="Unduh File"
                                                    >
                                                        <Download className="h-4 w-4" />
                                                    </a>
                                                </div>
                                            ))}
                                        </div>
                                    ) : !reportFile ? (
                                        <div className="flex flex-col items-center justify-center p-6 rounded-xl border border-dashed border-zinc-250 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/10">
                                            <Info className="h-6 w-6 text-zinc-455 dark:text-zinc-500 mb-2" />
                                            <p className="text-xs text-zinc-500 dark:text-zinc-500 text-center font-medium">Belum ada laporan hasil / berita acara.</p>
                                        </div>
                                    ) : null}

                                    {/* Upload Form */}
                                    <div className="pt-4 border-t border-zinc-150 dark:border-zinc-850/80">
                                        <h4 className="text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-widest mb-3">Unggah Berita Acara Baru</h4>
                                        <form onSubmit={handleUploadReport} className="space-y-4">
                                            <div className="group flex flex-col items-center justify-center border-2 border-dashed border-zinc-250 hover:border-emerald-500 dark:border-zinc-850 dark:hover:border-emerald-500/80 rounded-xl p-6 bg-zinc-50/50 dark:bg-zinc-950/10 hover:bg-emerald-50/5 dark:hover:bg-emerald-950/5 transition-all duration-300 relative">
                                                <input
                                                    type="file"
                                                    accept="application/pdf"
                                                    onChange={(e) => {
                                                        if (e.target.files && e.target.files.length > 0) {
                                                            const file = e.target.files[0];
                                                            if (file.type !== "application/pdf") {
                                                                alert("Mohon unggah file dengan format PDF.");
                                                                return;
                                                            }
                                                            setReportFile(file);
                                                        }
                                                    }}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                    disabled={uploadLoading}
                                                />
                                                <div className="text-center space-y-2">
                                                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 group-hover:scale-110 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950/40 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-all duration-300">
                                                        <UploadCloud className="h-5 w-5" />
                                                    </div>
                                                    <div className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                                                        {reportFile ? (
                                                            <span className="text-[var(--green-color)] dark:text-emerald-400 font-black">{reportFile.name}</span>
                                                        ) : (
                                                            <span>Klik atau seret file PDF untuk memilih</span>
                                                        )}
                                                    </div>
                                                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium">Hanya PDF, maks 5MB</p>
                                                </div>
                                            </div>

                                            {reportFile && (
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => setReportFile(null)}
                                                        className="px-4 py-2 text-xs font-bold border border-zinc-250 dark:border-zinc-750 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                                                        disabled={uploadLoading}
                                                    >
                                                        Batal
                                                    </button>
                                                    <button
                                                        type="submit"
                                                        className="px-4 py-2 text-xs font-bold bg-[var(--green-color)] hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white rounded-xl transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                                                        disabled={uploadLoading}
                                                    >
                                                        {uploadLoading ? (
                                                            <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                                        ) : null}
                                                        <span>Unggah File</span>
                                                    </button>
                                                </div>
                                            )}
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* Billing Modal */}
            <BillingModal
                isOpen={billingModalOpen}
                onClose={() => setBillingModalOpen(false)}
                onConfirm={submitBilling}
                ticket={tiket ? {
                    layanan: {
                        nama: tiket.layanan.nama_layanan,
                        biaya: tiket.layanan.biaya
                    }
                } : null}
                actionLoading={actionLoading}
            />
        </div>
    );
}
