"use client";

import React, { use, useEffect, useState } from "react";
import Navbar from "@/components/navbar/Navbar";
import ConfirmPaymentModal from "@/components/modal/ConfirmPaymentModal";
import {
    ChevronLeft,
    Check,
    User,
    FileText,
    Database,
    Download,
    CreditCard,
    ExternalLink,
    Clock,
    X
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getTiketDetail, konfirmasiPembayaranTiket } from "@/lib/tiket";
import Sidebar from "@/components/sidebar/Sidebar";
import AppBar from "@/components/appbar/AppBar";

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
    bank_pengirim?: string | null;
    nama_pengirim?: string | null;
    tanggal_transfer?: string | null;
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

export default function TagihanDetailPage({ params }: PageProps) {
    const resolvedParams = use(params);
    const router = useRouter();
    const idStr = resolvedParams.id;
    const tiketId = parseInt(idStr, 10);

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [tiket, setTiket] = useState<TiketDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [mounted, setMounted] = useState(false);

    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    const handleConfirmPayment = async () => {
        if (!tiket) return;
        setActionLoading(true);
        try {
            await konfirmasiPembayaranTiket(tiket.id);
            alert("Pembayaran berhasil dikonfirmasi lunas!");
            router.push("/tagihan");
        } catch (err: any) {
            alert(err.message || "Gagal mengonfirmasi pembayaran");
        } finally {
            setActionLoading(false);
            setConfirmModalOpen(false);
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

    const getPaymentStatusBadge = (status?: string) => {
        switch (status) {
            case "lunas":
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-450">
                        Lunas
                    </span>
                );
            case "batal":
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/20 dark:text-red-450">
                        Batal
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-50 text-yellow-700 border border-yellow-200 dark:bg-yellow-950/20 dark:text-yellow-450">
                        Menunggu Pembayaran
                    </span>
                );
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
            <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 overflow-hidden font-sans">
                <div className="flex h-screen items-center justify-center">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
                </div>
            </div>
        );
    }

    if (error || !tiket) {
        return (
            <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 overflow-hidden font-sans">
                <Sidebar />
                <div className="flex flex-col flex-1 overflow-y-auto">
                    <AppBar onMenuClick={() => setSidebarOpen(true)} />
                    <main className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-red-500 font-semibold">
                        {error || "Permohonan tidak ditemukan"}
                    </main>
                </div>
            </div>
        );
    }

    // Separate common fields from form answers
    const commonFields = ["nama_lengkap", "nip_ktp", "alamat_instansi", "no_telp"];
    const formAnswers = tiket.jawaban_form || {};
    const lampiranDocs = tiket.dokumen.filter(doc => doc.tipe !== "Laporan Hasil");

    // Calculate Peminjaman Alat details dynamically
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
    const selectedAlatList: Array<{ name: string; price: number; units: number }> = formAnswers.selected_alat_list || [];
    let totalEstimasi = 0;
    selectedAlatList.forEach(tool => {
        totalEstimasi += tool.price * tool.units * durationDays;
    });

    return (
        <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 overflow-hidden font-sans">
            <Sidebar />

            <div className="flex flex-col flex-1 overflow-y-auto">
                <AppBar onMenuClick={() => setSidebarOpen(true)} />
                <main className="flex-1 p-8 space-y-8">
                    {/* Header Breadcrumb */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                        <div className="flex items-center gap-2">
                            <Link
                                href="/tagihan"
                                className="flex items-center text-xs lg:text-sm font-medium text-[var(--foreground)] transition hover:text-zinc-600 dark:hover:text-zinc-300"
                            >
                                <ChevronLeft className="h-4 w-4 mr-0.5" />
                                Daftar Tagihan
                            </Link>
                            <span className="text-xs lg:text-sm text-zinc-450 dark:text-zinc-600">/</span>
                            <span className="text-xs lg:text-sm font-medium text-[var(--foreground)] dark:text-zinc-450">
                                Detail Tagihan
                            </span>
                            <span className="text-xs lg:text-sm text-zinc-450 dark:text-zinc-600">/</span>
                            <span className="text-xs lg:text-sm font-semibold text-[var(--green-color)]">
                                {tiket.no_tiket}
                            </span>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Section (2 Cols): Details */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Card 1: Informasi Pemohon */}
                            <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                                <div className="flex border-b border-zinc-300 dark:border-zinc-800/80 pb-4 mb-6 items-center gap-2">
                                    <User className="h-5 w-5 text-[var(--green-color)]" />
                                    <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200">
                                        Informasi Pemohon
                                    </h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
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
                            <div className="rounded-2xl border border-zinc-200/80 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
                                <div className="flex items-center justify-start border-b border-zinc-300 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-800/40 p-4 md:px-8">
                                    <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-200">
                                        Rincian Biaya Alat
                                    </h3>
                                </div>
                                <div className="p-6 md:p-8">
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full">
                                            <thead>
                                                <tr className="text-[var(--foreground)] dark:text-zinc-400 text-sm font-light tracking-wider border-b border-zinc-200 dark:border-zinc-800">
                                                    <th scope="col" className="pb-3 text-left">
                                                        Deskripsi Alat
                                                    </th>
                                                    <th scope="col" className="pb-3 text-center w-24">
                                                        Jumlah
                                                    </th>
                                                    <th scope="col" className="pb-3 text-right w-36">
                                                        Harga Satuan
                                                    </th>
                                                    <th scope="col" className="pb-3 text-right w-36">
                                                        Subtotal
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="text-sm">
                                                {selectedAlatList.length > 0 ? (
                                                    selectedAlatList.map((tool, idx) => {
                                                        const subtotal = tool.price * tool.units * durationDays;
                                                        return (
                                                            <tr key={idx} className="align-top border-b border-zinc-100 dark:border-zinc-800 last:border-0">
                                                                <td className="py-4 text-left font-semibold text-zinc-850 dark:text-zinc-200">
                                                                    <div className="space-y-0.5">
                                                                        <span className="block font-semibold">{tool.name}</span>
                                                                        <span className="block text-xs text-zinc-400 dark:text-zinc-500 font-medium">
                                                                            Durasi: {durationDays} Hari
                                                                        </span>
                                                                    </div>
                                                                </td>
                                                                <td className="py-4 text-center text-zinc-700 dark:text-zinc-300 font-semibold">
                                                                    {tool.units} Unit
                                                                </td>
                                                                <td className="py-4 text-right text-zinc-700 dark:text-zinc-300 font-semibold">
                                                                    Rp {tool.price.toLocaleString("id-ID")}
                                                                </td>
                                                                <td className="py-4 text-right text-zinc-800 dark:text-zinc-100 font-bold">
                                                                    Rp {subtotal.toLocaleString("id-ID")}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })
                                                ) : (
                                                    <tr className="align-top">
                                                        <td className="pt-5 pb-2 text-left font-semibold text-zinc-850 dark:text-zinc-200 block">
                                                            {formAnswers.jenis_alat || tiket.layanan.nama_layanan}
                                                        </td>
                                                        <td className="pt-5 pb-2 text-center text-zinc-700 dark:text-zinc-300 font-semibold">
                                                            1 Paket
                                                        </td>
                                                        <td className="pt-5 pb-2 text-right text-zinc-700 dark:text-zinc-300 font-semibold">
                                                            Rp {(tiket.tagihan?.jumlah || 150000).toLocaleString("id-ID")}
                                                        </td>
                                                        <td className="pt-5 pb-2 text-right text-zinc-800 dark:text-zinc-100 font-bold">
                                                            Rp {(tiket.tagihan?.jumlah || 150000).toLocaleString("id-ID")}
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Total Keseluruhan Row */}
                                    <div className="mt-4 flex justify-end">
                                        <div className="w-full sm:w-[50%] bg-[#F5F8FC] dark:bg-zinc-850/40 rounded-xl px-6 py-3.5 flex items-center justify-between">
                                            <span className="font-bold text-zinc-800 dark:text-zinc-200 text-sm">
                                                Total Tagihan
                                            </span>
                                            <span className="font-extrabold text-[#2C5E3B] dark:text-emerald-450 text-base">
                                                Rp {(tiket.tagihan?.jumlah || totalEstimasi || 150000).toLocaleString("id-ID")}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Section (1 Col): Billing Info & Proof of Payment */}
                        <div className="space-y-8">
                            {/* Card 3: Billing Info */}
                            <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-6">
                                <div className="flex border-b border-zinc-300 dark:border-zinc-00 pb-3 items-center gap-2">
                                    <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200">
                                        Informasi Tagihan
                                    </h3>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-zinc-500 font-medium">Nominal Tagihan</span>
                                        <span className="font-bold text-zinc-850 dark:text-zinc-100 text-lg">
                                            {tiket.tagihan?.jumlah ? `Rp ${tiket.tagihan.jumlah.toLocaleString("id-ID")}` : "-"}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-zinc-500 font-medium">Status Pembayaran</span>
                                        {getPaymentStatusBadge(tiket.tagihan?.status_bayar)}
                                    </div>

                                    {tiket.tagihan?.bank_pengirim && (
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-zinc-500 font-medium">Bank Pengirim</span>
                                            <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                                                {tiket.tagihan.bank_pengirim}
                                            </span>
                                        </div>
                                    )}

                                    {tiket.tagihan?.nama_pengirim && (
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-zinc-500 font-medium">Nama Pengirim</span>
                                            <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                                                {tiket.tagihan.nama_pengirim}
                                            </span>
                                        </div>
                                    )}

                                    {tiket.tagihan?.tanggal_transfer && (
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-zinc-500 font-medium">Tanggal Transfer</span>
                                            <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                                                {formatDate(tiket.tagihan.tanggal_transfer)}
                                            </span>
                                        </div>
                                    )}

                                    {tiket.tagihan?.tanggal_lunas && (
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-zinc-500 font-medium">Tanggal Lunas</span>
                                            <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                                                {formatDate(tiket.tagihan.tanggal_lunas)}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Proof of Payment */}
                                <div className="border-t border-zinc-100 dark:border-zinc-800/85 pt-4 space-y-3">
                                    <span className="block text-xs font-bold text-zinc-500 uppercase tracking-wider">
                                        Bukti Pembayaran
                                    </span>
                                    {tiket.tagihan?.bukti_bayar ? (
                                        <div className="border border-zinc-150 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/20 p-3 rounded-xl space-y-3 text-center">

                                            <div className="space-y-3">

                                                <div className="flex justify-center px-1">
                                                    <a
                                                        href={tiket.tagihan?.bukti_bayar}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="inline-flex items-center gap-1 text-xs text-[#2C5E3B] hover:text-emerald-700 font-bold hover:underline"
                                                    >
                                                        <ExternalLink className="h-3.5 w-3.5" />
                                                        Buka di Tab Baru
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center p-6 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-xl bg-zinc-50/30 dark:bg-zinc-950/10">
                                            <Clock className="h-6 w-6 text-zinc-400 mb-2 animate-pulse" />
                                            <p className="text-xs text-zinc-500 text-center font-medium">
                                                Bukti pembayaran belum diunggah oleh pemohon
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Verify Button */}
                                {tiket.tagihan?.status_bayar === "menunggu" && (
                                    <button
                                        onClick={() => setConfirmModalOpen(true)}
                                        disabled={actionLoading}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#2C5E3B] hover:bg-[#1E4329] text-white rounded-xl text-xs font-semibold shadow-md transition disabled:opacity-50 cursor-pointer"
                                    >
                                        <Check className="h-4 w-4" />
                                        <span>Konfirmasi Pembayaran Lunas</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* Confirm Payment Modal */}
            <ConfirmPaymentModal
                isOpen={confirmModalOpen}
                onClose={() => setConfirmModalOpen(false)}
                onConfirm={handleConfirmPayment}
                jumlah={tiket?.tagihan?.jumlah}
                actionLoading={actionLoading}
            />
        </div>
    );
}
