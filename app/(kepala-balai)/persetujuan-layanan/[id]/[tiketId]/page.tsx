"use client";

import React, { use, useEffect, useState } from "react";
import Navbar from "@/components/navbar/Navbar";
import ApproveModal from "@/components/modal/ApproveModal";
import {
    ChevronLeft,
    Check,
    Hourglass,
    User,
    Flag,
    FileText,
    Download,
    Database,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getTiketDetail, setujuiOlehKepalaBalai } from "@/lib/tiket";
import StatusLayananBadge from "@/components/badge/status-layanan/StatusLayananBadge";
import Sidebar from "@/components/sidebar/Sidebar";
import AppBar from "@/components/appbar/AppBar";

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
    };
    unit_teknis?: {
        id: number;
        nama: string;
    } | null;
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

export default function DetailPersetujuanLayananPage({ params }: PageProps) {
    const resolvedParams = use(params);
    const router = useRouter();
    const idStr = resolvedParams.tiketId;
    const tiketId = parseInt(idStr, 10);

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [tiket, setTiket] = useState<TiketDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [mounted, setMounted] = useState(false);

    const [approveModalOpen, setApproveModalOpen] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    const handleSetujui = async () => {
        if (!tiket) return;
        setActionLoading(true);
        try {
            await setujuiOlehKepalaBalai(tiket.id);
            alert("Tiket berhasil disetujui dan didisposisikan!");
            router.push(`/persetujuan-layanan/${resolvedParams.id}`);
        } catch (err: any) {
            alert(err.message || "Gagal menyetujui tiket");
        } finally {
            setActionLoading(false);
            setApproveModalOpen(false);
        }
    };

    useEffect(() => {
        setMounted(true);
        const token = localStorage.getItem("agro_token");
        if (!token) {
            router.push("/login/pegawai");
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
                <main className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-zinc-500">
                    Memuat detail permohonan...
                </main>
            </div>
        );
    }

    if (error || !tiket) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200">
                <Navbar />
                <main className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-red-500">
                    {error || "Permohonan tidak ditemukan"}
                </main>
            </div>
        );
    }

    // Separate common fields from form answers
    const commonFields = ["nama_lengkap", "nip_ktp", "alamat_instansi", "no_telp"];
    const formAnswers = tiket.jawaban_form || {};
    const lampiranDocs = tiket.dokumen.filter(doc => doc.tipe !== "Laporan Hasil");

    return (
        <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 overflow-hidden font-sans">
            <Sidebar />

            <div className="flex flex-col flex-1 overflow-y-auto">
                <AppBar onMenuClick={() => setSidebarOpen(true)} />
                <main className="flex-1 p-8 space-y-8">
                    {/* Breadcrumb */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div className="flex items-center gap-2">
                            <Link
                                href={`/persetujuan-layanan/${resolvedParams.id}`}
                                className="flex items-center text-sm font-semibold text-[var(--foreground)] transition hover:text-zinc-600 dark:hover:text-zinc-300"
                            >
                                <ChevronLeft className="h-4 w-4 mr-0.5" />
                                Persetujuan Layanan
                            </Link>
                            <span className="text-sm text-zinc-450 dark:text-zinc-600">/</span>
                            <span className="text-sm font-medium text-[var(--foreground)] dark:text-zinc-450">
                                {tiket.layanan.nama_layanan}
                            </span>
                            <span className="text-sm text-zinc-450 dark:text-zinc-600">/</span>
                            <span className="text-sm font-semibold text-[var(--green-color)]">
                                {tiket.no_tiket}
                            </span>
                        </div>

                        {tiket.status === "menunggu_persetujuan_kepala_balai" && (
                            <button
                                onClick={() => setApproveModalOpen(true)}
                                disabled={actionLoading}
                                className="flex items-center justify-center gap-2 rounded-xl bg-[#2C5E3B] hover:bg-[#20492E] text-white px-5 py-2.5 text-xs font-semibold transition shadow-sm cursor-pointer disabled:opacity-50"
                            >
                                <Check className="h-4.5 w-4.5" />
                                <span>Setujui</span>
                            </button>
                        )}
                    </div>

                    {/* Status tracker timeline card */}
                    <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 mb-8">
                        <h2 className="flex justify-between text-base font-semibold text-zinc-800 dark:text-zinc-200 mb-2">
                            Detail Pengajuan Layanan {tiket.layanan.nama_layanan} <span className="ml-4"><StatusLayananBadge status={tiket.status} /></span>
                        </h2>
                        <p className="text-sm text-zinc-650 dark:text-zinc-555 mt-0.5 font-medium">
                            No. Tiket: <span className="font-bold text-[var(--green-color)]">{tiket.no_tiket}</span>
                        </p>
                    </div>

                    {/* Content Details Section */}
                    <div className="space-y-8">
                        {/* Row 1: Informasi Pemohon & Detail Pengajuan Layanan (Side-by-side) */}
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

                        {/* Row 2: Dokumen Lampiran (Full width) */}
                        <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                            <div className="flex border-b border-zinc-300 dark:border-zinc-800/80 items-center gap-2 pb-4 mb-6">
                                <FileText className="h-5 w-5 text-[#2C5E3B]" />
                                <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200">
                                    Dokumen Lampiran
                                </h3>
                            </div>

                            <div className="space-y-4">
                                {lampiranDocs.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                    <p className="text-sm text-zinc-555 dark:text-zinc-450 text-center py-4">Tidak ada dokumen lampiran.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* Approve Confirmation Modal */}
            <ApproveModal
                isOpen={approveModalOpen}
                onClose={() => setApproveModalOpen(false)}
                onConfirm={handleSetujui}
                unitTeknisName={tiket?.unit_teknis?.nama || "Unit Teknis Terkait"}
                actionLoading={actionLoading}
            />
        </div>
    );
}
