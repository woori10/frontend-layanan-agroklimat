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
    Play
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
                alert("Status tiket berhasil diupdate menjadi selesai diproses!");
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
                <main className="flex-1 p-8 space-y-8">
                    {/* Header / Breadcrumb */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div className="flex items-center gap-2">
                            <Link
                                href={`/layanan/${resolvedParams.id}`}
                                className="flex items-center text-sm font-semibold text-[var(--foreground)] transition hover:text-zinc-650 dark:hover:text-zinc-300"
                            >
                                <ChevronLeft className="h-4 w-4 mr-0.5" />
                                Daftar Tiket
                            </Link>
                            <span className="text-sm text-zinc-450 dark:text-zinc-600">/</span>
                            <span className="text-sm font-medium text-[var(--foreground)] dark:text-zinc-450 truncate max-w-[150px] md:max-w-xs" title={serviceName}>
                                {serviceName}
                            </span>
                            <span className="text-sm text-zinc-450 dark:text-zinc-600">/</span>
                            <span className="text-sm font-semibold text-[var(--green-color)]">
                                {tiket.no_tiket}
                            </span>
                        </div>

                        {/* Action buttons based on status */}
                        <div className="flex items-center gap-3">
                            {tiket.status === "diproses" ? (
                                <button
                                    onClick={handleSelesai}
                                    disabled={actionLoading}
                                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm hover:shadow-md transition cursor-pointer text-xs disabled:opacity-50"
                                >
                                    <CheckCircle className="h-4 w-4" />
                                    <span>Selesaikan Pekerjaan</span>
                                </button>
                            ) : (
                                <div className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-200/50 rounded-xl text-xs font-semibold">
                                    <CheckCircle2 className="h-4 w-4" />
                                    <span>Pekerjaan Selesai</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Timeline & Ticket Info Card */}
                    <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 mb-8">
                        <h2 className="flex justify-between text-base font-semibold text-zinc-800 dark:text-zinc-200 mb-2">
                            Detail Pengajuan Layanan - {serviceName} <span className="ml-4"><StatusLayananBadge status={tiket.status} /></span>
                        </h2>
                        <p className="text-sm text-zinc-650 dark:text-zinc-550 mt-0.5 font-medium">
                            No. Tiket: <span className="font-bold text-[var(--green-color)]">{tiket.no_tiket}</span>
                        </p>
                    </div>

                    {/* Content Grid */}
                    <div className="space-y-8">
                        {/* Pemohon & Detail Layanan dynamic fields */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Card 1: Informasi Pemohon */}
                            <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                                <div className="flex border-b border-zinc-300 dark:border-zinc-800/80 pb-4 mb-6 items-center gap-2">
                                    <User className="h-5 w-5 text-[#2C5E3B]" />
                                    <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200">
                                        Informasi Pemohon
                                    </h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
                                    <div>
                                        <span className="block text-xs font-medium text-zinc-600 dark:text-zinc-555 uppercase tracking-wider mb-1">
                                            Nama Lengkap
                                        </span>
                                        <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                                            {formAnswers.nama_lengkap || "-"}
                                        </span>
                                    </div>

                                    <div>
                                        <span className="block text-xs font-medium text-zinc-600 dark:text-zinc-555 uppercase tracking-wider mb-1">
                                            NIP / No. KTP
                                        </span>
                                        <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                                            {formAnswers.nip_ktp || "-"}
                                        </span>
                                    </div>

                                    <div>
                                        <span className="block text-xs font-medium text-zinc-600 dark:text-zinc-555 uppercase tracking-wider mb-1">
                                            Alamat Instansi / Asal
                                        </span>
                                        <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                                            {formAnswers.alamat_instansi || "-"}
                                        </span>
                                    </div>

                                    <div>
                                        <span className="block text-xs font-medium text-zinc-600 dark:text-zinc-555 uppercase tracking-wider mb-1">
                                            No. Telepon
                                        </span>
                                        <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                                            {formAnswers.no_telp || "-"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Card 2: Detail Layanan */}
                            <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                                <div className="flex border-b border-zinc-300 dark:border-zinc-800/80 items-center gap-2 pb-4 mb-6">
                                    <Database className="h-5 w-5 text-[#2C5E3B]" />
                                    <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200">
                                        Detail Pengajuan Layanan
                                    </h3>
                                </div>

                                <div className="space-y-6 text-sm">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <span className="block text-xs font-medium text-zinc-600 dark:text-zinc-555 uppercase tracking-wider mb-1">
                                                Nama Layanan
                                            </span>
                                            <span className="rounded-lg font-semibold text-zinc-800 dark:text-zinc-200">
                                                {tiket.layanan.nama_layanan}
                                            </span>
                                        </div>

                                        <div>
                                            <span className="block text-xs font-medium text-zinc-600 dark:text-zinc-555 uppercase tracking-wider mb-1">
                                                Tanggal Pengajuan
                                            </span>
                                            <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                                                {formatDate(tiket.tanggal_submit)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Render custom fields from jawaban_form dynamically */}
                                    <div className="grid grid-cols-2 gap-6 pt-4">
                                        {Object.entries(formAnswers)
                                            .filter(([key]) => !commonFields.includes(key))
                                            .map(([key, value]) => {
                                                const formattedKey = key
                                                    .split("_")
                                                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                                    .join(" ");

                                                return (
                                                    <div key={key}>
                                                        <span className="block text-xs font-medium text-zinc-600 dark:text-zinc-555 uppercase tracking-wider mb-1">
                                                            {formattedKey}
                                                        </span>
                                                        <span className="font-semibold text-zinc-800 dark:text-zinc-200 leading-relaxed block whitespace-pre-line">
                                                            {value ? String(value) : "-"}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Lampiran & Berita Acara Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Card 3: Dokumen Lampiran */}
                            <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                                <div className="flex border-b border-zinc-300 dark:border-zinc-800/80 items-center gap-2 pb-4 mb-6">
                                    <FileText className="h-5 w-5 text-[#2C5E3B]" />
                                    <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200">
                                        Dokumen Lampiran
                                    </h3>
                                </div>

                                <div className="space-y-4">
                                    {lampiranDocs.length > 0 ? (
                                        <div className="space-y-3">
                                            {lampiranDocs.map((doc) => (
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
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-zinc-550 dark:text-zinc-450 text-center py-4">Tidak ada dokumen lampiran.</p>
                                    )}
                                </div>
                            </div>

                            {/* Card 5: Berita Acara / Laporan Hasil Card */}
                            <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                                <div className="flex border-b border-zinc-300 dark:border-zinc-800/80 items-center gap-2 pb-4 mb-6">
                                    <FileText className="h-5 w-5 text-[#2C5E3B]" />
                                    <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200">
                                        Berita Acara / Surat Balasan
                                    </h3>
                                </div>

                                <div className="space-y-6">
                                    {/* List of Laporan Hasil documents */}
                                    {laporanDocs.length > 0 && (
                                        <>
                                            <div className="space-y-3">
                                                {laporanDocs.map((doc) => (
                                                    <div key={doc.id} className="flex items-center justify-between p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/20 gap-3 min-w-0">
                                                        <div className="flex items-center gap-3 min-w-0">
                                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-650 dark:bg-emerald-950/30 dark:text-emerald-450">
                                                                <FileText className="h-5 w-5" />
                                                            </div>
                                                            <div className="flex flex-col text-left min-w-0">
                                                                <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate" title={doc.nama_file}>
                                                                    {doc.nama_file}
                                                                </span>
                                                                <span className="text-[10px] text-zinc-650 dark:text-zinc-500 font-medium font-sans">
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
                                                ))}
                                            </div>

                                            {/* Divider */}
                                            <div className="border-t border-zinc-200 dark:border-zinc-800/80 my-4"></div>
                                        </>
                                    )}

                                    {/* Upload Form */}
                                    <div>
                                        <h4 className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-3">Unggah Berita Acara Baru</h4>
                                        <form onSubmit={handleUploadReport} className="space-y-4">
                                            <div className="flex flex-col items-center justify-center border-2 border-dashed border-zinc-300 dark:border-zinc-750 rounded-xl p-4 bg-slate-50/50 dark:bg-zinc-950/10 hover:bg-slate-50 dark:hover:bg-zinc-950/20 transition relative">
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
                                                <div className="text-center space-y-1.5">
                                                    <FileText className="mx-auto h-6 w-6 text-zinc-400 dark:text-zinc-500" />
                                                    <div className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                                                        {reportFile ? (
                                                            <span className="text-[var(--green-color)] font-bold">{reportFile.name}</span>
                                                        ) : (
                                                            <span>Klik atau seret file PDF untuk memilih</span>
                                                        )}
                                                    </div>
                                                    <p className="text-[9px] text-zinc-455 dark:text-zinc-550">Hanya PDF, maks 5MB</p>
                                                </div>
                                            </div>

                                            {reportFile && (
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => setReportFile(null)}
                                                        className="px-3 py-1.5 text-xs font-semibold border border-zinc-300 dark:border-zinc-700 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                                                        disabled={uploadLoading}
                                                    >
                                                        Batal
                                                    </button>
                                                    <button
                                                        type="submit"
                                                        className="px-3 py-1.5 text-xs font-semibold bg-[var(--green-color)] hover:bg-emerald-700 text-white rounded-lg transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                                                        disabled={uploadLoading}
                                                    >
                                                        {uploadLoading ? (
                                                            <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
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

                        {/* Card 4: Informasi Tagihan (if exists) */}
                        {tiket.tagihan ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                                    <div className="flex border-b border-zinc-300 dark:border-zinc-800/80 items-center gap-2 pb-4 mb-6">
                                        <CreditCard className="h-5 w-5 text-[#2C5E3B]" />
                                        <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200">
                                            Informasi Tagihan
                                        </h3>
                                    </div>

                                    <div className="space-y-6 text-sm">
                                        <div className="flex items-center justify-between">
                                            <span className="text-zinc-550 font-medium">Nominal Tagihan</span>
                                            <span className="font-bold text-zinc-850 dark:text-zinc-150 text-lg">
                                                Rp {tiket.tagihan.jumlah.toLocaleString("id-ID")}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <span className="text-zinc-555 font-medium">Status Pembayaran</span>
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${tiket.tagihan.status_bayar === "lunas"
                                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-450 border-emerald-200/50"
                                                : "bg-amber-100 text-amber-800 dark:bg-amber-950/20 dark:text-amber-400 border-amber-200/50"
                                                }`}>
                                                {tiket.tagihan.status_bayar === "lunas" ? "Lunas" : "Belum Lunas"}
                                            </span>
                                        </div>

                                        {tiket.tagihan.tanggal_lunas && (
                                            <div className="flex items-center justify-between">
                                                <span className="text-zinc-555 font-medium">Tanggal Lunas</span>
                                                <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                                                    {formatDate(tiket.tagihan.tanggal_lunas)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : null}
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
