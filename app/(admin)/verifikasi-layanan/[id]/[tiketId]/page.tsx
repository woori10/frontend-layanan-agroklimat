"use client";

import React, { use, useEffect, useState } from "react";
import Navbar from "@/components/navbar/Navbar";
import ApproveModal from "@/components/modal/ApproveModal";
import RejectModal from "@/components/modal/RejectModal";
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
    X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getTiketDetail, verifikasiTiket } from "@/lib/tiket";
import StatusLayananBadge from "@/components/badge/status-layanan/StatusLayananBadge";
import Sidebar from "@/components/sidebar/Sidebar";
import AppBar from "@/components/appbar/AppBar";

const serviceToUnitTeknisMap: Record<number, number> = {
    14: 1, // Rekomendasi & Penilaian Kesesuaian Agroklimat/Hidrologi (SNI) -> Unit 1
    15: 1, // Konsultasi Rekomendasi & Penilaian Kesesuaian -> Unit 1
    18: 1, // Permohonan Data -> Unit 1
    19: 2, // Peminjaman Alat -> Unit 2
    17: 3, // Bimbingan Teknis & Narasumber -> Unit 3
    20: 3, // Magang Teknis / PKL -> Unit 3
    21: 3, // Agroedukasi / Kunjungan Edukasi -> Unit 3
    22: 3, // Layanan Perpustakaan -> Unit 3
    16: 4, // Rekomendasi Siap Tanam -> Unit 4
    23: 5, // Layanan Mess -> Unit 5
};

const unitTeknisNames: Record<number, string> = {
    1: "Tim Teknis Agroklimat / Hidrologi",
    2: "Koordinator Laboratorium",
    3: "Tim Kerja Layanan dan Pendayagunaan Hasil",
    4: "Tim Kerja Sarana & Prasarana",
    5: "Layanan Mess / Pengelola Mess"
};

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
    const idStr = resolvedParams.tiketId;
    const tiketId = parseInt(idStr, 10);

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [tiket, setTiket] = useState<TiketDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [mounted, setMounted] = useState(false);

    const [approveModalOpen, setApproveModalOpen] = useState(false);
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    const handleSetujui = async () => {
        if (!tiket) return;
        const unitTeknisId = serviceToUnitTeknisMap[tiket.layanan.id];
        if (!unitTeknisId) {
            alert("Gagal menentukan unit teknis terkait untuk layanan ini.");
            return;
        }

        setActionLoading(true);
        try {
            await verifikasiTiket(tiket.id, {
                aksi: "disetujui",
                unit_teknis_id: unitTeknisId,
            });
            alert("Tiket berhasil disetujui dan didisposisikan!");
            if (tiket.layanan.id === 19) {
                router.push("/tagihan");
            } else {
                router.push(`/verifikasi-layanan/${resolvedParams.id}`);
            }
        } catch (err: any) {
            alert(err.message || "Gagal menyetujui tiket");
        } finally {
            setActionLoading(false);
            setApproveModalOpen(false);
        }
    };

    const handleTolak = async (alasan: string) => {
        if (!tiket) return;
        if (!alasan.trim()) {
            alert("Harap masukkan alasan penolakan.");
            return;
        }

        setActionLoading(true);
        try {
            await verifikasiTiket(tiket.id, {
                aksi: "ditolak",
                catatan: alasan,
            });
            alert("Tiket berhasil ditolak.");
            router.push(`/verifikasi-layanan/${resolvedParams.id}`);
        } catch (err: any) {
            alert(err.message || "Gagal menolak tiket");
        } finally {
            setActionLoading(false);
            setRejectModalOpen(false);
        }
    };

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
        <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 overflow-hidden font-sans">
            <Sidebar />

            <div className="flex flex-col flex-1 overflow-y-auto">
                <AppBar onMenuClick={() => setSidebarOpen(true)} />
                <main className="flex-1 p-8 space-y-8">
                    {/* Breadcrumb */}


                    {/* Title and Action Button */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div className="flex items-center gap-2">
                            <Link
                                href={`/verifikasi-layanan/${resolvedParams.id}`}
                                className="flex items-center text-sm font-semibold text-[var(--foreground)] transition hover:text-zinc-600 dark:hover:text-zinc-300"
                            >
                                <ChevronLeft className="h-4 w-4 mr-0.5" />
                                Verifikasi Layanan
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

                        {["diajukan", "menunggu_verifikasi"].includes(tiket.status) && (
                            <div className="flex flex-row gap-2">
                                <button
                                    onClick={() => setRejectModalOpen(true)}
                                    disabled={actionLoading}
                                    className="flex items-center justify-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-xs font-semibold transition shadow-sm cursor-pointer self-end md:self-auto disabled:opacity-50"
                                >
                                    <X className="h-4.5 w-4.5" />
                                    <span>Tolak</span>
                                </button>
                                <button
                                    onClick={() => setApproveModalOpen(true)}
                                    disabled={actionLoading}
                                    className="flex items-center justify-center gap-2 rounded-xl bg-[#2C5E3B] hover:bg-[#20492E] text-white px-4 py-2 text-xs font-semibold transition shadow-sm cursor-pointer self-end md:self-auto disabled:opacity-50"
                                >
                                    <Check className="h-4.5 w-4.5" />
                                    <span>Setujui</span>
                                </button>
                            </div>
                        )}


                    </div>

                    {/* Status tracker timeline card */}
                    <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 mb-8">
                        <h2 className="flex justify-between text-base font-semibold text-zinc-800 dark:text-zinc-200 mb-2">
                            Detail Pengajuan Layanan {tiket.layanan.nama_layanan} <span className="ml-4"><StatusLayananBadge status={tiket.status} /></span>
                        </h2>
                        <p className="text-sm text-zinc-650 dark:text-zinc-550 mt-0.5 font-medium">
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
                            <div className="rounded-2xl border border-zinc-200/80 bg-white p-6  shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                                <div className="flex border-b border-zinc-300 dark:border-zinc-800/80 items-center gap-2 pb-4 mb-6">
                                    <Database className="h-5 w-5 text-[#2C5E3B]" />
                                    <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200">
                                        Detail Pengajuan Layanan
                                    </h3>
                                </div>

                                <div className="space-y-6 text-sm">
                                    <div className="grid gap-y-5 gap-x-6 sm:grid-cols-2">
                                        <div>
                                            <span className="block text-xs font-medium text-[var(--foreground)] dark:text-zinc-500 uppercase tracking-wider mb-1">
                                                Nama Layanan
                                            </span>
                                            <span className="block text-sm font-semibold text-zinc-800 dark:text-zinc-200 mt-1">
                                                {tiket.layanan.nama_layanan}
                                            </span>
                                        </div>

                                        <div>
                                            <span className="block text-xs font-medium text-[var(--foreground)] dark:text-zinc-500 uppercase tracking-wider mb-1">
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
                                                        <span className="block text-xs font-medium text-[var(--foreground)] dark:text-zinc-500 uppercase tracking-wider mb-1">
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
                        </div>

                        {/* Row 2: Dokumen Lampiran (Full width) */}
                        {/* Card 3: Dokumen Lampiran */}
                        <div className="rounded-2xl border border-zinc-200/80 bg-white p-6  shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
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
                                    <p className="text-sm text-zinc-550 dark:text-zinc-450 text-center py-4">Tidak ada dokumen lampiran.</p>
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
                unitTeknisName={
                    tiket
                        ? [17, 20, 21].includes(tiket.layanan.id)
                            ? "Kepala Balai"
                            : (unitTeknisNames[serviceToUnitTeknisMap[tiket.layanan.id]] || "Unit Teknis Terkait")
                        : ""
                }
                actionLoading={actionLoading}
            />

            {/* Reject Modal */}
            <RejectModal
                isOpen={rejectModalOpen}
                onClose={() => setRejectModalOpen(false)}
                onConfirm={handleTolak}
                actionLoading={actionLoading}
                tiket={tiket}
            />
        </div>
    );
}
