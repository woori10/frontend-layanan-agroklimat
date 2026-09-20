"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { X, FileText, CheckCircle2, ChevronDown, Loader2, type LucideIcon } from "lucide-react";
import { getApiUrl } from "@/lib/api";

interface ServiceInfoModalProps {
    isOpen: boolean;
    onClose: () => void;
    feature: {
        title: string;
        detail: string;
        waktu: string;
        biaya: string;
        dokumen: string;
        icon: LucideIcon;
    } | null;
}

interface AlatItem {
    id: number;
    nama_alat: string;
    harga_peminjaman: number;
    stok?: number;
    dipinjam?: number;
    sisa_stok?: number;
    is_active?: boolean;
}

const DEFAULT_ALAT_LIST: AlatItem[] = [
    { id: 1, nama_alat: "Automatic Weather Station (AWS)", harga_peminjaman: 500000, stok: 5, sisa_stok: 5, is_active: true },
    { id: 2, nama_alat: "Sensor Kelembaban Tanah", harga_peminjaman: 50000, stok: 10, sisa_stok: 10, is_active: true },
    { id: 3, nama_alat: "Solarimeter", harga_peminjaman: 75000, stok: 3, sisa_stok: 3, is_active: true },
];

const getServiceLink = (title: string) => {
    switch (title) {
        case "Rekomendasi SNI":
        case "Rekomendasi Penilaian SNI":
            return "/layanan/rekomendasi-sni";
        case "Permintaan Data":
        case "Permohonan Data":
            return "/layanan/permohonan-data";
        case "Peminjaman Alat":
            return "/layanan/peminjaman-alat";
        case "Peminjaman Alat dan Data":
            return "/layanan/permohonan-data";
        case "Konsultasi Rekomendasi":
            return "/layanan/konsultasi-rekomendasi";
        case "Bimtek & Narasumber":
        case "Bimbingan Teknis dan Narasumber":
        case "Bimtek dan Narasumber":
            return "/layanan/bimtek-narasumber";
        case "Magang/PKL":
        case "Magang Teknis / PKL":
            return "/layanan/magang-pkl";
        case "Agroedukasi":
            return "/layanan/agroedukasi";
        case "Rekomendasi Siap Tanam":
        case "Konsultasi Siap Tanam":
            return "/layanan/konsultasi-siap-tanam";
        case "Layanan Mess":
            return "/layanan/mess";
        case "Layanan Perpustakaan":
            return "/layanan/layanan-perpustakaan";
        default:
            return "/login";
    }
};

export default function ServiceInfoModal({ isOpen, onClose, feature }: ServiceInfoModalProps) {
    const [alatList, setAlatList] = useState<AlatItem[]>([]);
    const [loadingAlat, setLoadingAlat] = useState(false);
    const [expandedAlatId, setExpandedAlatId] = useState<number | null>(null);

    const isPeminjamanAlat = feature?.title?.toLowerCase().includes("peminjaman alat") || false;

    useEffect(() => {
        if (isOpen && isPeminjamanAlat) {
            setLoadingAlat(true);
            const token = typeof window !== "undefined" ? localStorage.getItem("agro_token") : null;
            const headers: Record<string, string> = {};
            if (token) headers["Authorization"] = `Bearer ${token}`;

            fetch(`${getApiUrl()}/alat`, { headers })
                .then((res) => {
                    if (!res.ok) throw new Error("Gagal mengambil data alat");
                    return res.json();
                })
                .then((data) => {
                    if (Array.isArray(data) && data.length > 0) {
                        const activeOnly = data.filter((item: any) => item.is_active !== false);
                        setAlatList(activeOnly.length > 0 ? activeOnly : data);
                    } else {
                        setAlatList(DEFAULT_ALAT_LIST);
                    }
                })
                .catch((err) => {
                    console.error("Gagal memuat data alat di modal info:", err);
                    setAlatList(DEFAULT_ALAT_LIST);
                })
                .finally(() => {
                    setLoadingAlat(false);
                });
        } else {
            setExpandedAlatId(null);
        }
    }, [isOpen, isPeminjamanAlat]);

    if (!isOpen || !feature) return null;

    const Icon = feature.icon;
    const displayAlatList = alatList.length > 0 ? alatList : DEFAULT_ALAT_LIST;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm transition-opacity duration-300"
                onClick={onClose}
            />

            {/* Modal Box */}
            <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 transition-all transform scale-100 duration-300 text-left max-h-[90vh] flex flex-col overflow-hidden">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition cursor-pointer z-10"
                >
                    <X className="h-5 w-5" />
                </button>

                {/* Modal Header */}
                <div className="flex items-start gap-4 pr-10 pt-6 px-6 shrink-0">
                    <div className="rounded-xl bg-secondary-green-color p-3 text-green-color dark:bg-secondary-green-color/40 dark:text-secondary-green-color flex-shrink-0">
                        <Icon className="h-6 w-6" />
                    </div>
                    <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--green-color)] bg-secondary-green-color/50 px-2 py-0.5 rounded-md dark:bg-secondary-green-color/30 dark:text-secondary-green-color">
                            Detail Layanan
                        </span>
                        <h3 className="text-xl font-bold text-[var(--foreground)] dark:text-white mt-1">
                            {feature.title}
                        </h3>
                    </div>
                </div>

                {/* Modal Body */}
                <div className="space-y-5 text-xs md:text-sm leading-relaxed text-zinc-650 dark:text-zinc-300 overflow-y-auto flex-1">
                    <div className="px-6 pt-6">
                        <h4 className="text-xs font-medium uppercase tracking-wider text-[var(--foreground)] dark:text-zinc-550 mb-1">
                            Deskripsi Layanan
                        </h4>
                        <p className="font-semibold text-sm text-zinc-900 dark:text-zinc-200">
                            {feature.detail}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 bg-secondary-green-color p-6">
                        <div>
                            <h4 className="text-xs font-medium uppercase tracking-wider text-[var(--foreground)] dark:text-zinc-550 mb-1">
                                Estimasi Waktu
                            </h4>
                            <p className="font-semibold text-sm text-zinc-900 dark:text-white">
                                {feature.waktu}
                            </p>
                        </div>
                        <div>
                            <h4 className="text-xs font-medium uppercase tracking-wider text-[var(--foreground)] dark:text-zinc-550 mb-1">
                                Tarif / Biaya
                            </h4>
                            <p className="font-semibold text-sm text-zinc-900 dark:text-white">
                                {feature.biaya}
                            </p>
                        </div>
                    </div>

                    {/* Persyaratan Dokumen */}
                    <div className="px-6 mb-6">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-xs font-medium uppercase tracking-wider text-[var(--foreground)] dark:text-zinc-550 mb-1">
                                Persyaratan Dokumen</span>
                        </div>
                        <div className="space-y-3">
                            {[
                                "Fotokopi KTP / KTM",
                                "Surat Pengantar dari Instansi",
                                "Proposal Penelitian atau Rencana Observasi"
                            ].map((doc, idx) => (
                                <div key={idx} className="flex items-center gap-3 font-semibold text-sm text-zinc-900 dark:text-zinc-100 text-xs sm:text-sm">
                                    <CheckCircle2 className="h-5 w-5 text-zinc-800 dark:text-zinc-200 shrink-0 stroke-[2.2]" />
                                    <span>{doc}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Daftar Alat Tersedia (Khusus Peminjaman Alat) */}
                    {isPeminjamanAlat && (
                        <div className="px-6 pb-4">
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--foreground)] dark:text-zinc-400 mb-3">
                                Daftar Alat Tersedia
                            </h4>

                            {loadingAlat ? (
                                <div className="flex items-center justify-center py-6 gap-2 text-zinc-500 text-xs font-medium">
                                    <Loader2 className="h-4 w-4 animate-spin text-[#2C5E3B]" />
                                    <span>Memuat daftar alat...</span>
                                </div>
                            ) : displayAlatList.length === 0 ? (
                                <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 text-center text-xs text-zinc-500">
                                    Tidak ada alat yang tersedia saat ini
                                </div>
                            ) : (
                                <div className="space-y-2.5">
                                    {displayAlatList.map((alat) => {
                                        const isExpanded = expandedAlatId === alat.id;
                                        const idAlat = `ALT-${String(alat.id).padStart(3, "0")}`;
                                        const sisaStok = alat.sisa_stok !== undefined ? alat.sisa_stok : (alat.stok || 1);

                                        return (
                                            <div
                                                key={alat.id}
                                                className="rounded-2xl bg-secondary-green-color dark:bg-emerald-950/25 border border-emerald-100/60 dark:border-emerald-900/30 overflow-hidden"
                                            >
                                                <button
                                                    type="button"
                                                    onClick={() => setExpandedAlatId(isExpanded ? null : alat.id)}
                                                    className="w-full flex items-center justify-between p-4 text-left transition hover:cursor-pointer select-none"
                                                >
                                                    <span className="font-medium text-[var(--foreground)] dark:text-zinc-100 text-sm">
                                                        {alat.nama_alat}
                                                    </span>
                                                    <ChevronDown
                                                        className={`h-5 w-5 text-zinc-700 dark:text-zinc-300 transition-transform duration-200 shrink-0 ml-2 ${isExpanded ? "rotate-180" : ""
                                                            }`}
                                                    />
                                                </button>

                                                {/* Accordion Content */}
                                                {isExpanded && (
                                                    <div className="px-4 pb-4 pt-1 border-t border-emerald-100/70 dark:border-emerald-900/30 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 animate-in fade-in duration-150">
                                                        <div className="grid grid-cols-2 gap-3 pt-2">
                                                            <div className="bg-white/70 dark:bg-zinc-900/60 p-2.5 rounded-xl border border-emerald-100/50 dark:border-emerald-900/20">
                                                                <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block font-medium">
                                                                    Tarif Sewa
                                                                </span>
                                                                <span className="font-bold text-[#2C5E3B] dark:text-emerald-400 text-sm mt-0.5 block">
                                                                    Rp {Number(alat.harga_peminjaman).toLocaleString("id-ID")}
                                                                    <span className="text-[10px] font-normal text-zinc-500 ml-1">/ hari</span>
                                                                </span>
                                                            </div>

                                                            <div className="bg-white/70 dark:bg-zinc-900/60 p-2.5 rounded-xl border border-emerald-100/50 dark:border-emerald-900/20">
                                                                <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block font-medium">
                                                                    Stok Tersedia
                                                                </span>
                                                                <span className="font-bold text-zinc-800 dark:text-zinc-200 text-sm mt-0.5 block">
                                                                    {sisaStok > 0 ? (
                                                                        <span className="text-emerald-700 dark:text-emerald-400 font-bold">{sisaStok} Unit</span>
                                                                    ) : (
                                                                        <span className="text-red-500 font-semibold">Tidak Tersedia</span>
                                                                    )}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="mt-2 text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
                                                            Kode ID: {idAlat}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Modal Footer Actions */}
                <div className="flex gap-3 px-6 py-4 shrink-0 border-t border-zinc-100 dark:border-zinc-800/80 bg-white dark:bg-zinc-900">
                    <button
                        onClick={onClose}
                        className="flex-1 rounded-xl border border-zinc-200 bg-white py-2.5 text-xs md:text-sm font-bold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 transition cursor-pointer"
                    >
                        Tutup
                    </button>
                    {feature.title === "Layanan Mess" ? (
                        <a
                            href="https://wa.me/6289643337021?text=Halo%20Admin%20BRMP%20Agroklimat%2C%20saya%20ingin%20mengajukan%20permohonan%20Layanan%20Mess."
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1"
                        >
                            <button className="w-full rounded-xl bg-[var(--green-color)] py-2.5 text-xs md:text-sm font-bold text-white shadow-md hover:bg-[var(--hover-green-color)] transition cursor-pointer">
                                Ajukan Layanan
                            </button>
                        </a>
                    ) : (
                        <Link href={getServiceLink(feature.title)} className="flex-1">
                            <button className="w-full rounded-xl bg-[var(--green-color)] py-2.5 text-xs md:text-sm font-bold text-white shadow-md hover:bg-[var(--hover-green-color)] transition cursor-pointer">
                                Ajukan Layanan
                            </button>
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}
