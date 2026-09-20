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
import StatusPembayaranBadge from "@/components/badge/status-pembayaran/StatusPembayaranBadge";
import SuccessModal from "@/components/modal/SuccessModal";
import ErrorModal from "@/components/modal/ErrorModal";
import { getApiUrl } from "@/lib/api";

interface PageProps {
    params: Promise<{
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
    const noTiketStr = resolvedParams.noTiket;

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [tiket, setTiket] = useState<TiketDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [mounted, setMounted] = useState(false);
    const [alatMaster, setAlatMaster] = useState<any[]>([]);

    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    const [successModalOpen, setSuccessModalOpen] = useState(false);
    const [errorModalOpen, setErrorModalOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");



    const handleConfirmPayment = async () => {
        if (!tiket || !tiket.tagihan?.bukti_bayar) return;

        setActionLoading(true);

        try {
            await konfirmasiPembayaranTiket(tiket.id);

            setConfirmModalOpen(false);
            setSuccessModalOpen(true);
        } catch (err: any) {
            setConfirmModalOpen(false);
            setErrorMessage(err.message || "Gagal mengonfirmasi pembayaran");
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

        if (!noTiketStr) {
            setError("Nomor Tiket tidak valid");
            setLoading(false);
            return;
        }

        getTiketDetail(noTiketStr)
            .then(setTiket)
            .catch((err: any) => setError(err.message))
            .finally(() => setLoading(false));

        fetch(`${getApiUrl()}/alat`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data)) setAlatMaster(data);
            })
            .catch(() => { });
    }, [noTiketStr, router]);

    if (!mounted) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-secondary-green-color border-t-transparent"></div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 overflow-hidden font-sans">
                <div className="flex h-screen items-center justify-center">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-secondary-green-color border-t-transparent"></div>
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
    const selectedAlatList: Array<{ alatId?: string | number; name: string; price: number; units: number }> = formAnswers.selected_alat_list || [];
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
                                className="flex items-center text-sm font-medium text-[var(--foreground)] hover:cursor-pointer transition"
                            >
                                <ChevronLeft className="h-4 w-4 mr-0.5" />
                                Daftar Tagihan
                            </Link>
                            <span className="text-sm text-[var(--foreground)] dark:text-zinc-600">/</span>
                            <span className="text-sm font-medium text-[var(--foreground)] dark:text-zinc-450">
                                Detail Tagihan
                            </span>
                            <span className="text-sm text-[var(--foreground)] dark:text-zinc-600">/</span>
                            <span className="text-sm font-semibold text-[var(--green-color)]">
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
                                    <h3 className="text-base font-bold text-[var(--green-color)] dark:text-zinc-200">
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

                            {/* Card 2: Rincian Biaya Alat */}
                            <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                                <div className="flex border-b border-zinc-300 dark:border-zinc-800/80 pb-4 mb-6 items-center gap-2">
                                    <h3 className="text-base font-bold text-[var(--green-color)] dark:text-zinc-200">
                                        Rincian Biaya Alat
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
                                                <th scope="col" className="px-5 py-3.5 text-left text-xs font-bold text-zinc-800 dark:text-zinc-200">
                                                    Jumlah
                                                </th>
                                                <th scope="col" className="px-5 py-3.5 text-left text-xs font-bold text-zinc-800 dark:text-zinc-200">
                                                    Harga
                                                </th>
                                                <th scope="col" className="px-5 py-3.5 text-left text-xs font-bold text-zinc-800 dark:text-zinc-200">
                                                    Subtotal
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 bg-white dark:bg-zinc-900 text-xs">
                                            {selectedAlatList.length > 0 ? (
                                                selectedAlatList.map((tool, idx) => {
                                                    const subtotal = tool.price * tool.units * durationDays;
                                                    const matched = alatMaster.find(
                                                        (a) => (tool.alatId && String(a.id) === String(tool.alatId)) ||
                                                            (tool.name && a.nama_alat.trim().toLowerCase() === tool.name.trim().toLowerCase())
                                                    );
                                                    const idAlat = matched
                                                        ? `ALT-${String(matched.id).padStart(3, "0")}`
                                                        : (tool.alatId ? `ALT-${String(tool.alatId).padStart(3, "0")}` : `ALT-${String(idx + 1).padStart(3, "0")}`);

                                                    return (
                                                        <tr key={idx} className="transition-colors hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50">
                                                            <td className="px-5 py-3 text-center text-zinc-500 dark:text-zinc-400 font-medium whitespace-nowrap">
                                                                {idx + 1}
                                                            </td>
                                                            <td className="px-6 py-4 text-left text-zinc-500 dark:text-zinc-400 font-medium font-mono whitespace-nowrap">
                                                                {idAlat}
                                                            </td>
                                                            <td className="px-6 py-4 text-left text-zinc-800 dark:text-zinc-200 font-medium">
                                                                {tool.name}
                                                            </td>
                                                            <td className="px-6 py-4 text-left text-zinc-600 dark:text-zinc-400 font-medium whitespace-nowrap">
                                                                {tool.units}
                                                            </td>
                                                            <td className="px-6 py-4 text-left text-zinc-600 dark:text-zinc-400 font-medium whitespace-nowrap">
                                                                Rp {tool.price.toLocaleString("id-ID")}
                                                            </td>
                                                            <td className="px-6 py-4 text-left text-zinc-800 dark:text-zinc-200 font-medium whitespace-nowrap">
                                                                Rp {subtotal.toLocaleString("id-ID")}
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            ) : (
                                                <tr>
                                                    <td colSpan={6} className="px-5 py-8 text-center text-zinc-500 dark:text-zinc-400 font-medium text-xs">
                                                        Tidak ada data alat yang dipinjam
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                        {/* Total Tagihan row inside table */}
                                        {selectedAlatList.length > 0 && (
                                            <tfoot className="border-t border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-850/40">
                                                <tr>
                                                    <td colSpan={5} className="px-5 py-3 text-left font-bold text-zinc-800 dark:text-zinc-200 text-xs">
                                                        Total Tagihan {durationDays > 1 && (
                                                            <span className="text-xs text-zinc-500 dark:text-zinc-400 font-normal ml-1.5">
                                                                (Durasi: {durationDays} Hari)
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-5 py-3 text-center font-extrabold text-[#2C5E3B] dark:text-secondary-green-color text-xs whitespace-nowrap">
                                                        Rp {(tiket.tagihan?.jumlah || totalEstimasi || 0).toLocaleString("id-ID")}
                                                    </td>
                                                </tr>
                                            </tfoot>
                                        )}
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Right Section (1 Col): Billing Info & Proof of Payment */}
                        <div className="space-y-8">
                            {/* Card 3: Billing Info */}
                            <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-6">
                                <div className="flex border-b border-zinc-300 dark:border-zinc-00 pb-3 items-center gap-2">
                                    <h3 className="text-base font-bold text-[var(--green-color)] dark:text-zinc-200">
                                        Informasi Tagihan
                                    </h3>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-zinc-500 font-medium">Nominal Tagihan</span>
                                        <span className="font-bold text-zinc-850 dark:text-zinc-100">
                                            {tiket.tagihan?.jumlah ? `Rp ${tiket.tagihan.jumlah.toLocaleString("id-ID")}` : "-"}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-zinc-500 font-medium">Status Pembayaran</span>
                                        <StatusPembayaranBadge status={tiket.tagihan?.status_bayar} />
                                    </div>

                                    {tiket.tagihan?.bank_pengirim && (
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-zinc-500 font-medium">Bank Pengirim</span>
                                            <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                                                {tiket.tagihan.bank_pengirim}
                                            </span>
                                        </div>
                                    )}

                                    {tiket.tagihan?.nama_pengirim && (
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-zinc-500 font-medium">Nama Pengirim</span>
                                            <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                                                {tiket.tagihan.nama_pengirim}
                                            </span>
                                        </div>
                                    )}

                                    {tiket.tagihan?.tanggal_transfer && (
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-zinc-500 font-medium">Tanggal Transfer</span>
                                            <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                                                {formatDate(tiket.tagihan.tanggal_transfer)}
                                            </span>
                                        </div>
                                    )}

                                    {tiket.tagihan?.tanggal_lunas && (
                                        <div className="flex items-center justify-between text-xs">
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
                                        <div className="flex items-center justify-between p-2.5 bg-secondary-green-color/30 dark:bg-secondary-green-color/10 border border-green-color/30 dark:border-secondary-green-color/20 rounded-xl">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <div className="p-1.5 bg-secondary-green-color dark:bg-secondary-green-color text-[var(--green-color)] dark:text-[var(--green-color)] rounded-lg shrink-0">
                                                    <FileText className="w-4 h-4" />
                                                </div>
                                                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-300 truncate">
                                                    Bukti Transfer
                                                </span>
                                            </div>
                                            <a
                                                href={tiket.tagihan?.bukti_bayar}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-1 text-xs text-[#2C5E3B] hover:text-secondary-green-color font-bold hover:underline"
                                            >
                                                <ExternalLink className="h-3.5 w-3.5" /> Lihat
                                            </a>
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
                                        disabled={actionLoading || !tiket.tagihan?.bukti_bayar}
                                        title={!tiket.tagihan?.bukti_bayar ? "Bukti pembayaran belum diunggah oleh pemohon" : undefined}
                                        className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition ${
                                            tiket.tagihan?.bukti_bayar && !actionLoading
                                                ? "bg-[#2C5E3B] hover:bg-[#1E4329] text-white shadow-md cursor-pointer"
                                                : "bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 cursor-not-allowed opacity-75 shadow-none"
                                        }`}
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

            {/* Success Modal */}
            <SuccessModal
                isOpen={successModalOpen}
                onClose={() => {
                    setSuccessModalOpen(false);
                    router.push("/tagihan");
                }}
                title="Pembayaran Berhasil Dikonfirmasi!"
                message="Pembayaran telah berhasil dikonfirmasi lunas."
                confirmText="Kembali ke Daftar Tagihan"
                onConfirm={() => {
                    setSuccessModalOpen(false);
                    router.push("/tagihan");
                }}
            />

            {/* Error Modal */}
            <ErrorModal
                isOpen={errorModalOpen}
                onClose={() => setErrorModalOpen(false)}
                title="Gagal Mengonfirmasi Pembayaran"
                message={errorMessage}
            />
        </div>
    );
}
