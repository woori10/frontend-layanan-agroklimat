"use client";

import Link from "next/link";
import { X, type LucideIcon } from "lucide-react";

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
    if (!isOpen || !feature) return null;

    const Icon = feature.icon;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm transition-opacity duration-300"
                onClick={onClose}
            />

            {/* Modal Box */}
            <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 transition-all transform scale-100 duration-300 text-left">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition cursor-pointer"
                >
                    <X className="h-5 w-5" />
                </button>

                {/* Modal Header */}
                <div className="flex items-start gap-4 pr-6 mb-6">
                    <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 flex-shrink-0">
                        <Icon className="h-6 w-6" />
                    </div>
                    <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--green-color)] bg-emerald-50/50 px-2 py-0.5 rounded-md dark:bg-emerald-950/30 dark:text-emerald-400">
                            Detail Layanan
                        </span>
                        <h3 className="text-xl font-extrabold text-zinc-900 dark:text-white mt-1">
                            {feature.title}
                        </h3>
                    </div>
                </div>

                {/* Modal Body */}
                <div className="space-y-5 text-sm leading-relaxed text-zinc-650 dark:text-zinc-300">
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-550 mb-1">
                            Deskripsi Layanan
                        </h4>
                        <p className="font-semibold text-zinc-800 dark:text-zinc-200">
                            {feature.detail}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 border-t border-zinc-100 dark:border-zinc-800 pt-4">
                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-550 mb-1">
                                Estimasi Waktu
                            </h4>
                            <p className="font-bold text-zinc-900 dark:text-white">
                                {feature.waktu}
                            </p>
                        </div>
                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-550 mb-1">
                                Tarif / Biaya
                            </h4>
                            <p className="font-bold text-zinc-900 dark:text-white">
                                {feature.biaya}
                            </p>
                        </div>
                    </div>

                    <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-550 mb-1">
                            Persyaratan Dokumen
                        </h4>
                        <p className="font-semibold text-zinc-600 dark:text-zinc-400">
                            {feature.dokumen}
                        </p>
                    </div>
                </div>

                {/* Modal Footer Actions */}
                <div className="mt-8 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 rounded-xl border border-zinc-200 bg-white py-2.5 text-sm font-bold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 transition cursor-pointer"
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
                            <button className="w-full rounded-xl bg-[var(--green-color)] py-2.5 text-sm font-bold text-white shadow-md hover:bg-emerald-600 transition cursor-pointer">
                                Ajukan Layanan
                            </button>
                        </a>
                    ) : (
                        <Link href={getServiceLink(feature.title)} className="flex-1">
                            <button className="w-full rounded-xl bg-[var(--green-color)] py-2.5 text-sm font-bold text-white shadow-md hover:bg-emerald-600 transition cursor-pointer">
                                Ajukan Layanan
                            </button>
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}
