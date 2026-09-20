"use client";

import React, { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/sidebar/Sidebar";
import AppBar from "@/components/appbar/AppBar";
import { getUserFromToken, getRedirectPath } from "@/lib/auth";
import { getTiketDetail } from "@/lib/tiket";
import { ChevronLeft, X, ExternalLink, Receipt, AlertCircle } from "lucide-react";

interface PageProps {
    params: Promise<{
        noTiket: string;
    }>;
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
    jawaban_form: Record<string, any> | null;
    layanan: {
        id: number;
        nama_layanan: string;
        slug: string;
    };
    tagihan?: Tagihan | null;
    user?: {
        id: number;
        nama: string;
        email: string;
        no_hp?: string;
    };
}

function formatDateIndo(dateStr?: string | null) {
    if (!dateStr) return "-";
    try {
        const d = new Date(dateStr);
        return d.toLocaleDateString("en-US", {
            day: "numeric",
            month: "long",
            year: "numeric"
        });
    } catch {
        return dateStr;
    }
}

export default function DetailTagihanSuperAdminPage({ params }: PageProps) {
    const resolvedParams = use(params);
    const router = useRouter();
    const noTiket = resolvedParams.noTiket;

    const [mounted, setMounted] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [tiket, setTiket] = useState<TiketDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [modalBuktiOpen, setModalBuktiOpen] = useState(false);

    useEffect(() => {
        setMounted(true);
        const token = localStorage.getItem("agro_token");
        if (!token) {
            router.push("/login");
            return;
        }
        const user = getUserFromToken();
        if (user && user.role !== "super_admin") {
            router.push(getRedirectPath(user.role));
            return;
        }

        if (!noTiket) {
            setError("Nomor tiket tidak valid");
            setLoading(false);
            return;
        }

        getTiketDetail(noTiket)
            .then((data) => {
                setTiket(data);
            })
            .catch((err: any) => {
                setError(err.message || "Gagal memuat detail tagihan");
            })
            .finally(() => {
                setLoading(false);
            });
    }, [noTiket, router]);

    if (!mounted) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-secondary-green-color border-t-transparent" />
            </div>
        );
    }

    const formAnswers = tiket?.jawaban_form || {};
    const selectedAlatList: Array<{ name: string; price: number; units: number; id?: string }> =
        formAnswers.selected_alat_list || [];

    // Hitung durasi hari peminjaman jika ada
    let durationDays = 1;
    if (formAnswers.periode_peminjaman) {
        try {
            const parts = formAnswers.periode_peminjaman.split(" s.d. ");
            if (parts.length === 2) {
                const d1 = new Date(parts[0]);
                const d2 = new Date(parts[1]);
                const diffTime = Math.abs(d2.getTime() - d1.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                if (!isNaN(diffDays) && diffDays > 0) durationDays = diffDays;
            }
        } catch { }
    }

    const namaPemohon =
        tiket?.tagihan?.nama_pengirim ||
        formAnswers.nama_lengkap ||
        tiket?.user?.nama ||
        "-";

    const namaBank = tiket?.tagihan?.bank_pengirim || formAnswers.nama_bank || "Bank Mandiri";
    const tanggalTagihan = formatDateIndo(tiket?.tagihan?.tanggal_transfer || tiket?.tanggal_submit);
    const totalTagihan = tiket?.tagihan?.jumlah || 0;
    const displayNoTiket = tiket?.no_tiket || (noTiket ? decodeURIComponent(noTiket) : "");

    return (
        <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 overflow-hidden font-sans">
            <Sidebar />

            <div className="flex flex-col flex-1 overflow-y-auto">
                <AppBar onMenuClick={() => setSidebarOpen(true)} />

                <main className="flex-1 p-6 sm:p-8 space-y-6">
                    {/* Breadcrumb */}
                    <div className="flex items-center gap-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        <Link
                            href="/kelola-tagihan"
                            className="flex items-center text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white transition"
                        >
                            <ChevronLeft className="h-4 w-4 mr-1 text-zinc-700 dark:text-zinc-300" />
                            Kelola Tagihan
                        </Link>
                        <span className="text-zinc-400">/</span>
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                            Detail Tagihan
                        </span>
                        <span className="text-zinc-700 dark:text-zinc-300">/</span>
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                            {displayNoTiket}
                        </span>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800">
                            <div className="h-8 w-8 animate-spin rounded-full border-3 border-[var(--green-color)] border-t-transparent mb-3" />
                            <p className="text-sm text-zinc-500 font-medium">Memuat detail tagihan...</p>
                        </div>
                    ) : error || !tiket ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-zinc-900 rounded-2xl border border-red-200 text-center p-6">
                            <AlertCircle className="h-10 w-10 text-red-500 mb-3" />
                            <h3 className="text-base font-semibold text-zinc-900 dark:text-white mb-1">Gagal Memuat Data</h3>
                            <p className="text-xs text-zinc-500 mb-4">{error || "Data tiket tidak ditemukan"}</p>
                            <Link
                                href="/kelola-tagihan"
                                className="px-4 py-2 bg-secondary-green-color text-green-color text-xs font-semibold rounded-lg hover:bg-secondary-green-color/80 transition"
                            >
                                Kembali ke Kelola Tagihan
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-6 sm:p-8 shadow-xs">
                                {/* Header Section */}
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                    <div>
                                        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Detail Tagihan</h1>
                                        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">Nama: {namaPemohon}</p>
                                    </div>
                                    <div className="sm:text-right space-y-1">
                                        <div className="flex sm:justify-end items-center gap-4 text-xs sm:text-sm">
                                            <span className="text-zinc-500">Tanggal tagihan:</span>
                                            <span className="font-bold text-zinc-900 dark:text-white">{tanggalTagihan}</span>
                                        </div>
                                        <div className="flex sm:justify-end items-center gap-4 text-xs sm:text-sm">
                                            <span className="text-zinc-500">Rekening Tujuan:</span>
                                            <span className="font-bold text-zinc-900 dark:text-white">Bank Mandiri</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Bank Details & Periode */}
                            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-6 sm:p-8 shadow-xs space-y-8">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 text-xs sm:text-sm">
                                    <div className="space-y-1.5">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-zinc-900 dark:text-white">Nama Bank Pengirim :</span>
                                            <span className="text-zinc-500">{namaBank}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-zinc-900 dark:text-white">Nama Pemilik Rekening :</span>
                                            <span className="text-zinc-500">{namaPemohon}</span>
                                        </div>
                                    </div>
                                    <div className="sm:text-right space-y-1">
                                        <span className="font-bold text-zinc-900 dark:text-white block">Periode Peminjaman Alat</span>
                                        <span className="text-zinc-500 block">
                                            {formAnswers.periode_peminjaman || "Sesuai Jadwal Permohonan"}
                                        </span>
                                    </div>
                                </div>

                                {/* Actions & Table of Items */}
                                <div className="space-y-6 md:space-y-4">
                                    <div className="flex justify-end">
                                        {tiket?.tagihan?.bukti_bayar ? (
                                            <button
                                                type="button"
                                                onClick={() => setModalBuktiOpen(true)}
                                                className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-[#264E36] hover:bg-[#1E3E2B] text-white rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer"
                                            >
                                                Lihat Bukti Transfer
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                disabled
                                                className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 rounded-xl text-xs font-semibold cursor-not-allowed"
                                                title="Bukti transfer belum diunggah oleh pemohon"
                                            >
                                                Bukti Transfer Belum Ada
                                            </button>
                                        )}
                                    </div>

                                    <div className="rounded-xl border border-zinc-200/80 dark:border-zinc-800 overflow-hidden">
                                        <table className="min-w-full divide-y divide-zinc-200/80 dark:divide-zinc-800 text-xs sm:text-sm">
                                            <thead className="bg-zinc-50/50 dark:bg-zinc-950/40">
                                                <tr>
                                                    <th scope="col" className="px-6 py-4 text-center font-semibold text-zinc-800 dark:text-zinc-200 w-16">No</th>
                                                    <th scope="col" className="px-6 py-4 text-left font-semibold text-zinc-800 dark:text-zinc-200">ID Alat</th>
                                                    <th scope="col" className="px-6 py-4 text-left font-semibold text-zinc-800 dark:text-zinc-200">Nama Alat</th>
                                                    <th scope="col" className="px-6 py-4 text-left font-semibold text-zinc-800 dark:text-zinc-200">Jumlah</th>
                                                    <th scope="col" className="px-6 py-4 text-left font-semibold text-zinc-800 dark:text-zinc-200">Harga</th>
                                                    <th scope="col" className="px-6 py-4 text-left font-semibold text-zinc-800 dark:text-zinc-200">Subtotal</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400">
                                                {selectedAlatList.length > 0 ? (
                                                    selectedAlatList.map((tool, idx) => {
                                                        const toolId = tool.id || `EL-${String(idx + 452).padStart(5, "0")}`;
                                                        const subtotal = tool.price * tool.units * durationDays;
                                                        return (
                                                            <tr key={idx} className="hover:bg-zinc-50/40 dark:hover:bg-zinc-800/40 transition">
                                                                <td className="px-6 py-4 text-center text-zinc-500">{idx + 1}</td>
                                                                <td className="px-6 py-4 font-mono text-zinc-500">{toolId}</td>
                                                                <td className="px-6 py-4 text-zinc-800 dark:text-zinc-200">{tool.name}</td>
                                                                <td className="px-6 py-4">{tool.units}</td>
                                                                <td className="px-6 py-4">Rp {tool.price.toLocaleString("id-ID")}</td>
                                                                <td className="px-6 py-4">Rp {subtotal.toLocaleString("id-ID")}</td>
                                                            </tr>
                                                        );
                                                    })
                                                ) : (
                                                    <tr>
                                                        <td colSpan={6} className="px-6 py-8 text-center text-zinc-500 dark:text-zinc-400 font-medium text-sm">
                                                            Tidak ada data alat yang dipinjam
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                            {selectedAlatList.length > 0 && (
                                                <tfoot className="border-t border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-850/40">
                                                    <tr>
                                                        <td colSpan={5} className="px-6 py-4 text-left font-bold text-zinc-800 dark:text-zinc-200 text-xs sm:text-sm">
                                                            Total {durationDays > 1 && (
                                                                <span className="text-xs text-zinc-500 dark:text-zinc-400 font-normal ml-1.5">
                                                                    (Durasi: {durationDays} Hari)
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 text-left font-bold text-zinc-900 dark:text-white text-xs sm:text-sm whitespace-nowrap">
                                                            Rp {totalTagihan.toLocaleString("id-ID")}
                                                        </td>
                                                    </tr>
                                                </tfoot>
                                            )}
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </main>
            </div>

            {/* Modal Bukti Transfer */}
            {modalBuktiOpen && tiket?.tagihan?.bukti_bayar && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
                    <div className="relative w-full max-w-2xl rounded-2xl bg-white dark:bg-zinc-900 p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 max-h-[90vh] flex flex-col">
                        <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800 mb-4">
                            <div className="flex items-center gap-2">
                                <Receipt className="h-5 w-5 text-[#264E36]" />
                                <h3 className="text-base font-bold text-zinc-900 dark:text-white">Bukti Transfer Pembayaran</h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setModalBuktiOpen(false)}
                                className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 transition cursor-pointer"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-auto rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-2 flex items-center justify-center min-h-[300px]">
                            {tiket.tagihan.bukti_bayar.match(/\.(jpeg|jpg|png|webp|gif)/i) ||
                                tiket.tagihan.bukti_bayar.includes("google.com/uc?") ? (
                                <img
                                    src={tiket.tagihan.bukti_bayar}
                                    alt="Bukti Transfer"
                                    className="max-h-[60vh] w-auto max-w-full object-contain rounded-lg shadow-xs"
                                />
                            ) : (
                                <div className="text-center p-8 space-y-3">
                                    <Receipt className="h-12 w-12 text-zinc-400 mx-auto" />
                                    <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                                        File bukti transfer tersimpan di penyimpanan eksternal.
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="mt-4 pt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                            <div className="text-xs text-zinc-500">
                                {tiket.tagihan.bank_pengirim && `Bank: ${tiket.tagihan.bank_pengirim}`}
                                {tiket.tagihan.nama_pengirim && ` • A/N: ${tiket.tagihan.nama_pengirim}`}
                            </div>
                            <div className="flex items-center gap-2">
                                <a
                                    href={tiket.tagihan.bukti_bayar}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-[#264E36] bg-green-50 dark:bg-green-950/40 rounded-lg hover:bg-green-100 transition cursor-pointer"
                                >
                                    <ExternalLink className="h-3.5 w-3.5" />
                                    Buka di Tab Baru
                                </a>
                                <button
                                    type="button"
                                    onClick={() => setModalBuktiOpen(false)}
                                    className="px-4 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition cursor-pointer"
                                >
                                    Tutup
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
