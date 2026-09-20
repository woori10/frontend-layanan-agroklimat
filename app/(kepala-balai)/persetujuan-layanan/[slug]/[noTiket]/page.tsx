"use client";

import React, { use, useEffect, useState } from "react";
import ApproveModal from "@/components/modal/ApproveModal";
import SuccessModal from "@/components/modal/SuccessModal";
import ErrorModal from "@/components/modal/ErrorModal";
import {
    ChevronLeft,
    Check,
    User,
    FileText,
    Download,
    Database,
    File,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getTiketDetail, setujuiOlehKepalaBalai } from "@/lib/tiket";
import { getApiUrl } from "@/lib/api";
import StatusLayananBadge from "@/components/badge/status-layanan/StatusLayananBadge";
import Sidebar from "@/components/sidebar/Sidebar";
import AppBar from "@/components/appbar/AppBar";

interface PageProps {
    params: Promise<{
        slug: string;
        noTiket: string;
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
        slug?: string;
    };
    user?: {
        id: number;
        nama: string;
        email?: string | null;
        nip?: string | null;
        no_hp?: string | null;
        instansi?: string | null;
        alamat?: string | null;
    } | null;
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
    const { slug, noTiket } = resolvedParams;

    const [tiket, setTiket] = useState<TiketDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [mounted, setMounted] = useState(false);

    const [approveModalOpen, setApproveModalOpen] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    const [successModalOpen, setSuccessModalOpen] = useState(false);
    const [errorModalOpen, setErrorModalOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [alatMaster, setAlatMaster] = useState<any[]>([]);

    const handleSetujui = async () => {
        if (!tiket) return;
        setActionLoading(true);
        try {
            await setujuiOlehKepalaBalai(tiket.id);
            setApproveModalOpen(false);
            setSuccessModalOpen(true);
        } catch (err: any) {
            setApproveModalOpen(false);
            setErrorMessage(err.message || "Gagal menyetujui tiket");
            setErrorModalOpen(true);
        } finally {
            setActionLoading(false);
        }
    };

    useEffect(() => {
        setMounted(true);
        const token = localStorage.getItem("agro_token");
        if (!token) {
            router.push("/login/pegawai");
            return;
        }

        getTiketDetail(noTiket)
            .then(setTiket)
            .catch((err: any) => setError(err.message))
            .finally(() => setLoading(false));

        fetch(`${getApiUrl()}/alat`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data)) setAlatMaster(data);
            })
            .catch(() => { });
    }, [noTiket, router]);

    if (!mounted) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-secondary-green-color border-t-transparent"></div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 overflow-hidden font-sans">
                <Sidebar />
                <div className="flex flex-col flex-1">
                    <AppBar />
                    <div className="flex flex-1 items-center justify-center">
                        <div className="h-10 w-10 animate-spin rounded-full border-4 border-secondary-green-color border-t-transparent"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !tiket) {
        return (
            <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 overflow-hidden font-sans">
                <Sidebar />
                <div className="flex flex-col flex-1">
                    <AppBar />
                    <div className="flex flex-1 items-center justify-center text-red-500 text-sm">
                        {error || "Permohonan tidak ditemukan"}
                    </div>
                </div>
            </div>
        );
    }

    const isPeminjamanAlat = slug === "peminjaman-alat" || tiket.layanan?.slug === "peminjaman-alat";
    const commonFields = [
        "nama_lengkap",
        "nama",
        "nip_ktp",
        "alamat_instansi",
        "asal_instansi",
        "instansi",
        "no_telp",
        "no_telepon",
        "telepon",
        "email",
        "tanggal_pengajuan",
    ];
    const formAnswers = tiket.jawaban_form || {};
    const isPegawaiDoc = (tipe: string) => {
        const t = (tipe || "").toLowerCase();
        return t.includes("laporan") || t.includes("berita acara") || t.includes("sertifikat") || t.includes("penerimaan");
    };
    const lampiranDocs = tiket.dokumen.filter(doc => !isPegawaiDoc(doc.tipe));

    let durationDays = 1;
    const periode = formAnswers.periode_peminjaman || "";
    if (periode.includes(" s.d. ")) {
        try {
            const [startStr, endStr] = periode.split(" s.d. ");
            const start = new Date(startStr);
            const end = new Date(endStr);
            const diffTime = Math.abs(end.getTime() - start.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            durationDays = isNaN(diffDays) ? 1 : Math.max(1, diffDays);
        } catch {
            durationDays = 1;
        }
    }

    const rawAlatList: any[] = Array.isArray(formAnswers.selected_alat_list)
        ? formAnswers.selected_alat_list
        : (typeof formAnswers.selected_alat_list === "string"
            ? (() => { try { return JSON.parse(formAnswers.selected_alat_list); } catch { return []; } })()
            : []);

    // Sinkronisasi data alat yang dipinjam secara dinamis dari database (alatMaster)
    const selectedAlatList: any[] = rawAlatList.map((tool: any, idx: number) => {
        const matched = alatMaster.find(
            (a: any) =>
                (tool.alatId && String(a.id) === String(tool.alatId)) ||
                (tool.id && String(a.id) === String(tool.id)) ||
                (tool.name && a.nama_alat?.trim().toLowerCase() === tool.name?.trim().toLowerCase()) ||
                (tool.nama_alat && a.nama_alat?.trim().toLowerCase() === tool.nama_alat?.trim().toLowerCase())
        );

        const idAlat = matched
            ? `ALT-${String(matched.id).padStart(3, "0")}`
            : (tool.alatId ? (String(tool.alatId).startsWith("ALT-") ? tool.alatId : `ALT-${String(tool.alatId).padStart(3, "0")}`) : `ALT-${String(idx + 1).padStart(3, "0")}`);
        const name = matched?.nama_alat || tool.name || tool.nama_alat || "Alat";
        const units = Number(tool.units || tool.jumlah || tool.qty || 1);
        const price = Number(matched ? matched.harga_peminjaman : (tool.price || tool.harga || tool.harga_peminjaman || 0));
        const subtotal = price * units * durationDays;

        return {
            ...tool,
            idAlat,
            name,
            units,
            price,
            subtotal,
        };
    });

    if (selectedAlatList.length === 0 && typeof formAnswers.jenis_alat === "string" && formAnswers.jenis_alat.trim()) {
        const text = formAnswers.jenis_alat;
        alatMaster.forEach((a: any) => {
            if (text.toLowerCase().includes(a.nama_alat.trim().toLowerCase())) {
                const regex = new RegExp(
                    a.nama_alat.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + '.*?(\\d+)\\s*(?:unit|Unit)?',
                    'i'
                );
                const match = text.match(regex);
                const units = match && match[1] ? parseInt(match[1], 10) : 1;
                selectedAlatList.push({
                    idAlat: `ALT-${String(a.id).padStart(3, "0")}`,
                    name: a.nama_alat,
                    units: isNaN(units) ? 1 : units,
                    price: a.harga_peminjaman,
                    subtotal: a.harga_peminjaman * (isNaN(units) ? 1 : units) * durationDays,
                });
            }
        });
    }

    let totalEstimasi = 0;
    selectedAlatList.forEach((tool: any) => {
        totalEstimasi += Number(tool.subtotal || 0);
    });

    return (
        <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 overflow-hidden font-sans">
            <Sidebar />

            <div className="flex flex-col flex-1 overflow-y-auto">
                <AppBar />
                <main className="flex-1 p-8 space-y-8">
                    {/* Breadcrumb */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div className="flex items-center gap-2">
                            <Link
                                href={`/persetujuan-layanan/${slug}`}
                                className="flex items-center text-sm font-medium text-[var(--foreground)] hover:cursor-pointer transition"
                            >
                                <ChevronLeft className="h-4 w-4 mr-0.5" />
                                Persetujuan Layanan
                            </Link>
                            <span className="text-sm text-[var(--foreground)] dark:text-zinc-600">/</span>
                            <span className="text-sm font-medium text-[var(--foreground)] dark:text-zinc-450">
                                {tiket.layanan.nama_layanan}
                            </span>
                            <span className="text-sm text-[var(--foreground)] dark:text-zinc-600">/</span>
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
                                <span>Disposisi</span>
                            </button>
                        )}
                    </div>

                    {/* Status tracker timeline card */}
                    <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 mb-8">
                        <h2 className="flex justify-between text-base font-bold text-[var(--green-color)] dark:text-zinc-200 mb-2">
                            Detail Pengajuan Layanan {tiket.layanan.nama_layanan} <span className="ml-4"><StatusLayananBadge status={tiket.status} layananSlug={slug} namaLayanan={tiket.layanan.nama_layanan} /></span>
                        </h2>
                        <p className="text-sm text-zinc-650 dark:text-zinc-555 mt-0.5 font-medium">
                            No. Tiket: <span className="font-bold text-[var(--foreground)]">{tiket.no_tiket}</span>
                        </p>
                    </div>

                    {/* Content Details Section */}
                    <div className="space-y-8">
                        {/* Row 1: Informasi Pemohon & Detail Pengajuan Layanan (Side-by-side) */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Card 1: Informasi Pemohon */}
                            <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                                <div className="flex border-b border-zinc-300 dark:border-zinc-800/80 pb-4 mb-6 items-center gap-2">
                                    <h3 className="text-base font-bold text-[var(--green-color)] dark:text-zinc-200">
                                        Informasi Pemohon
                                    </h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
                                    <div>
                                        <span className="text-zinc-500 block text-xs">
                                            Nama Lengkap
                                        </span>
                                        <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                                            {formAnswers.nama_lengkap || formAnswers.nama || tiket.user?.nama || "-"}
                                        </span>
                                    </div>

                                    <div>
                                        <span className="text-zinc-500 block text-xs">
                                            Email
                                        </span>
                                        <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                                            {tiket.user?.email || formAnswers.email || "-"}
                                        </span>
                                    </div>

                                    <div>
                                        <span className="text-zinc-500 block text-xs">
                                            NIP / No. KTP
                                        </span>
                                        <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                                            {formAnswers.nip_ktp || tiket.user?.nip || "-"}
                                        </span>
                                    </div>

                                    <div>
                                        <span className="text-zinc-500 block text-xs">
                                            No. Telepon / WhatsApp
                                        </span>
                                        <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                                            {formAnswers.no_telp || formAnswers.no_telepon || formAnswers.telepon || tiket.user?.no_hp || "-"}
                                        </span>
                                    </div>

                                    <div className="md:col-span-2">
                                        <span className="text-zinc-500 block text-xs">
                                            Alamat Instansi / Asal
                                        </span>
                                        <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                                            {formAnswers.alamat_instansi || formAnswers.asal_instansi || formAnswers.instansi || tiket.user?.instansi || tiket.user?.alamat || "-"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Card 2: Detail Layanan */}
                            <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                                <div className="flex border-b border-zinc-300 dark:border-zinc-800/80 items-center gap-2 pb-4 mb-6">
                                    <h3 className="text-base font-bold text-[var(--green-color)] dark:text-zinc-200">
                                        Detail Pengajuan Layanan
                                    </h3>
                                </div>

                                <div className="space-y-6 text-sm">
                                    <div className="grid gap-y-5 gap-x-6 sm:grid-cols-2">
                                        <div>
                                            <span className="text-zinc-500 block text-xs">
                                                Nama Layanan
                                            </span>
                                            <span className="block text-sm font-semibold text-zinc-800 dark:text-zinc-200 mt-1">
                                                {tiket.layanan.nama_layanan}
                                            </span>
                                        </div>

                                        <div>
                                            <span className="text-zinc-500 block text-xs">
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
                                            .filter(([key]) => {
                                                if (commonFields.includes(key)) return false;
                                                if (isPeminjamanAlat && (key === "jenis_alat" || key === "selected_alat_list" || key === "total_estimasi")) {
                                                    return false;
                                                }
                                                return true;
                                            })
                                            .map(([key, value]) => {
                                                const formattedKey = key
                                                    .split("_")
                                                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                                    .join(" ");

                                                return (
                                                    <div key={key}>
                                                        <span className="text-zinc-500 block text-xs">
                                                            {formattedKey}
                                                        </span>
                                                        <div className="block text-sm font-semibold text-zinc-800 dark:text-zinc-200 mt-1 leading-relaxed whitespace-pre-line">
                                                            {typeof value === "object" && value !== null
                                                                ? JSON.stringify(value, null, 2)
                                                                : (value ? String(value) : "-")}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                    </div>

                                </div>
                            </div>
                        </div>

                        {/* Card: Daftar Alat Yang Dipinjam (Khusus Peminjaman Alat) */}
                        {isPeminjamanAlat && (
                            <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                                <div className="flex border-b border-zinc-300 dark:border-zinc-800/80 items-center gap-2 pb-4 mb-6">
                                    <h3 className="text-base font-bold text-[var(--green-color)] dark:text-zinc-200">
                                        Daftar Alat Yang Dipinjam
                                    </h3>
                                </div>

                                <div className="overflow-x-auto rounded-2xl border border-zinc-200/80 dark:border-zinc-800">
                                    <table className="min-w-full divide-y divide-zinc-200/80 dark:divide-zinc-800">
                                        <thead>
                                            <tr className="bg-zinc-50/50 dark:bg-zinc-800/40">
                                                <th scope="col" className="px-5 py-3.5 text-center text-xs font-bold text-zinc-800 dark:text-zinc-200 w-16">
                                                    No
                                                </th>
                                                <th scope="col" className="px-5 py-3.5 text-left text-xs font-bold text-zinc-800 dark:text-zinc-200">
                                                    ID Alat
                                                </th>
                                                <th scope="col" className="px-5 py-3.5 text-left text-xs font-bold text-zinc-800 dark:text-zinc-200">
                                                    Nama Alat
                                                </th>
                                                <th scope="col" className="px-5 py-3.5 text-center text-xs font-bold text-zinc-800 dark:text-zinc-200">
                                                    Jumlah
                                                </th>
                                                <th scope="col" className="px-5 py-3.5 text-center text-xs font-bold text-zinc-800 dark:text-zinc-200">
                                                    Durasi
                                                </th>
                                                <th scope="col" className="px-5 py-3.5 text-center text-xs font-bold text-zinc-800 dark:text-zinc-200">
                                                    Harga
                                                </th>
                                                <th scope="col" className="px-5 py-3.5 text-center text-xs font-bold text-zinc-800 dark:text-zinc-200">
                                                    Subtotal
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 bg-white dark:bg-zinc-900 text-xs">
                                            {selectedAlatList.length > 0 ? (
                                                selectedAlatList.map((tool: any, idx: number) => (
                                                    <tr key={idx} className="transition-colors hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50">
                                                        <td className="px-5 py-3 text-center text-zinc-500 dark:text-zinc-400 font-medium whitespace-nowrap">
                                                            {idx + 1}
                                                        </td>
                                                        <td className="px-5 py-3 text-left text-zinc-500 dark:text-zinc-400 font-medium font-mono whitespace-nowrap">
                                                            {tool.idAlat}
                                                        </td>
                                                        <td className="px-5 py-3 text-left text-zinc-800 dark:text-zinc-200 font-medium">
                                                            {tool.name}
                                                        </td>
                                                        <td className="px-5 py-3 text-center text-zinc-600 dark:text-zinc-400 font-medium whitespace-nowrap">
                                                            {tool.units}
                                                        </td>
                                                        <td className="px-5 py-3 text-center text-zinc-600 dark:text-zinc-400 font-medium whitespace-nowrap">
                                                            {durationDays} Hari
                                                        </td>
                                                        <td className="px-5 py-3 text-center text-zinc-600 dark:text-zinc-400 font-medium whitespace-nowrap">
                                                            Rp {Number(tool.price).toLocaleString("id-ID")}
                                                        </td>
                                                        <td className="px-5 py-3 text-center text-zinc-800 dark:text-zinc-200 font-medium whitespace-nowrap">
                                                            Rp {Number(tool.subtotal).toLocaleString("id-ID")}
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={7} className="px-5 py-8 text-center text-zinc-500 dark:text-zinc-400 font-medium text-xs">
                                                        Tidak ada data alat yang dipinjam
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                        {selectedAlatList.length > 0 && (
                                            <tfoot className="border-t border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-850/40">
                                                <tr>
                                                    <td colSpan={6} className="px-5 py-3 text-left font-bold text-zinc-800 dark:text-zinc-200 text-xs">
                                                        Total Tagihan
                                                    </td>
                                                    <td className="px-5 py-3 text-center font-extrabold text-[#2C5E3B] dark:text-secondary-green-color text-xs whitespace-nowrap">
                                                        Rp {Number(tiket.tagihan?.jumlah || totalEstimasi || 0).toLocaleString("id-ID")}
                                                    </td>
                                                </tr>
                                            </tfoot>
                                        )}
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Row 2: Dokumen Lampiran (Full width) */}
                        <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                            <div className="flex border-b border-zinc-300 dark:border-zinc-800/80 items-center gap-2 pb-4 mb-6">
                                <h3 className="text-base font-bold text-[var(--green-color)] dark:text-zinc-200">
                                    Lampiran Pemohon
                                    <span className="text-xs font-normal text-zinc-500 ml-1.5">
                                        ({lampiranDocs.length} berkas)
                                    </span>
                                </h3>
                            </div>

                            <div className="space-y-4">
                                {lampiranDocs.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {lampiranDocs.map((doc) => (
                                            <div key={doc.id} className="flex items-center justify-between p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/20 gap-3 min-w-0">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary-green-color text-green-color dark:bg-red-950/30 dark:text-red-400">
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
                                                    className="text-[#2C5E3B]  p-1.5 rounded-lg  cursor-pointer"
                                                >
                                                    <Download className="h-4.5 w-4.5" />
                                                </a>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-6 px-4 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/20 text-center space-y-1">
                                        <File className="h-7 w-7 text-zinc-400 dark:text-zinc-600 mb-1" />
                                        <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Tidak ada dokumen lampiran</p>
                                        <p className="text-[11px] text-zinc-400 dark:text-zinc-500">Pemohon tidak mengunggah berkas tambahan.</p>
                                    </div>
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
                title="Konfirmasi Disposisi"
                confirmButtonText="Disposisi"
                message={
                    isPeminjamanAlat ? (
                        <p>
                            Apakah Anda yakin ingin mendisposisikan tiket ini? Tagihan pembayaran akan otomatis diterbitkan kepada pemohon sebelum penugasan ke pegawai unit teknis.
                        </p>
                    ) : (
                        <p>
                            Apakah Anda yakin ingin menyetujui tiket ini? Permohonan akan segera didisposisikan ke <strong className="text-[#2C5E3B] dark:text-secondary-green-color font-bold">{tiket?.unit_teknis?.nama || "Unit Teknis Terkait"}</strong>.
                        </p>
                    )
                }
            />

            {/* Success Modal */}
            <SuccessModal
                isOpen={successModalOpen}
                onClose={() => {
                    setSuccessModalOpen(false);
                    router.push(`/dashboard-kepala-balai`);
                }}
                title="Tiket Berhasil Didisposisikan!"
                message={
                    isPeminjamanAlat
                        ? "Tiket telah berhasil didisposisikan dan tagihan telah diterbitkan kepada pemohon."
                        : "Tiket telah berhasil disetujui dan didisposisikan ke unit teknis terkait."
                }
                confirmText="Kembali ke Dashboard"
                onConfirm={() => {
                    setSuccessModalOpen(false);
                    router.push(`/dashboard-kepala-balai`);
                }}
            />

            {/* Error Modal */}
            <ErrorModal
                isOpen={errorModalOpen}
                onClose={() => setErrorModalOpen(false)}
                title="Gagal Disposisi"
                message={errorMessage}
            />
        </div>
    );
}
