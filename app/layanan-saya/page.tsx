"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar/Navbar";
import StatusLayananBadge from "@/components/badge/status-layanan/StatusLayananBadge";
import {
    Droplet,
    Thermometer,
    Beaker,
    FileText,
    Filter,
    ChevronLeft,
    ChevronRight,
    ArrowRight,
    Briefcase,
    GraduationCap,
    BookOpen,
    Bed,
    ClipboardList,
} from "lucide-react";
import Link from "next/link";
import { getUserTikets } from "@/lib/tiket";
import RiwayatLayananBanner from "@/components/banner/RiwayatLayananBanner";

interface UserTiket {
    id: number;
    no_tiket: string;
    status: string;
    createdAt: string;
    layanan: {
        id: number;
        nama_layanan: string;
    };
}

function getServiceMeta(layananId: number) {
    switch (layananId) {
        case 16: // Rekomendasi Siap Tanam
            return {
                icon: Droplet,
                iconBg: "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400"
            };
        case 14: // Rekomendasi & Penilaian SNI
            return {
                icon: Beaker,
                iconBg: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
            };
        case 15: // Konsultasi Rekomendasi & Penilaian Kesesuaian
            return {
                icon: FileText,
                iconBg: "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400"
            };
        case 17: // Bimbingan Teknis & Narasumber
            return {
                icon: Briefcase,
                iconBg: "bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400"
            };
        case 18: // Permohonan Data
            return {
                icon: FileText,
                iconBg: "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400"
            };
        case 19: // Peminjaman Alat
            return {
                icon: Beaker,
                iconBg: "bg-pink-50 text-pink-600 dark:bg-pink-950/40 dark:text-pink-400"
            };
        case 20: // Magang Teknis / PKL
            return {
                icon: GraduationCap,
                iconBg: "bg-teal-50 text-teal-600 dark:bg-teal-950/40 dark:text-teal-400"
            };
        case 21: // Agroedukasi / Kunjungan Edukasi
            return {
                icon: GraduationCap,
                iconBg: "bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400"
            };
        case 22: // Layanan Perpustakaan
            return {
                icon: BookOpen,
                iconBg: "bg-cyan-50 text-cyan-600 dark:bg-cyan-950/40 dark:text-cyan-400"
            };
        case 23: // Layanan Mess
            return {
                icon: Bed,
                iconBg: "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400"
            };
        default:
            return {
                icon: ClipboardList,
                iconBg: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
            };
    }
}

function formatDate(dateString: string) {
    try {
        const d = new Date(dateString);
        return d.toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    } catch {
        return dateString;
    }
}

export default function LayananSayaPage() {
    const router = useRouter();
    const [tikets, setTikets] = useState<UserTiket[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [mounted, setMounted] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 4;

    const totalItems = tikets.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    const currentTikets = tikets.slice(startIndex, startIndex + itemsPerPage);

    useEffect(() => {
        setMounted(true);
        const token = localStorage.getItem("agro_token");
        if (!token) {
            router.push("/login");
            return;
        }

        getUserTikets()
            .then(setTikets)
            .catch((err: any) => setError(err.message))
            .finally(() => setLoading(false));
    }, [router]);

    if (!mounted) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200">
            <Navbar />
            <RiwayatLayananBanner />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex justify-between items-center gap-4 mb-8">
                    <div className="flex items-center gap-1">
                        <Link
                            href="/"
                            className="flex items-center text-xs font-semibold text-[var(--foreground)] hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition"
                        >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Kembali ke Beranda
                        </Link>
                    </div>

                    <div className="w-fit text-sm font-semibold text-[var(--foreground)] dark:text-zinc-400 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-xl px-4 py-2.5 shadow-sm">
                        Total Permohonan: <span className=" dark:text-emerald-450">{tikets.length}</span>
                    </div>
                </div>

                {/* Table Section */}
                <div className="overflow-hidden rounded-lg border border-zinc-200/80 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-zinc-200/80 dark:divide-zinc-800">
                            <thead className="bg-[#E5E7EB]/50 dark:bg-zinc-950">
                                <tr>
                                    <th scope="col" className="px-6 py-4.5 text-left text-xs font-bold text-[var(--foreground)] dark:text-zinc-400 uppercase tracking-wider">
                                        ID Permohonan
                                    </th>
                                    <th scope="col" className="px-6 py-4.5 text-left text-xs font-bold text-[var(--foreground)] dark:text-zinc-400 uppercase tracking-wider">
                                        Jenis Layanan
                                    </th>
                                    <th scope="col" className="px-6 py-4.5 text-left text-xs font-bold text-[var(--foreground)] dark:text-zinc-400 uppercase tracking-wider">
                                        Tanggal Pengajuan
                                    </th>
                                    <th scope="col" className="px-6 py-4.5 text-left text-xs font-bold text-[var(--foreground)] dark:text-zinc-400 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th scope="col" className="px-6 py-4.5 text-left text-xs font-bold text-[var(--foreground)] dark:text-zinc-400 uppercase tracking-wider">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 bg-white dark:bg-zinc-900">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-10 text-center text-sm text-zinc-450 dark:text-zinc-550">
                                            Memuat riwayat permohonan...
                                        </td>
                                    </tr>
                                ) : error ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-10 text-center text-sm text-red-500 font-medium">
                                            {error}
                                        </td>
                                    </tr>
                                ) : tikets.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-10 text-center text-sm text-zinc-450 dark:text-zinc-550">
                                            Belum ada riwayat permohonan layanan.
                                        </td>
                                    </tr>
                                ) : (
                                    currentTikets.map((tiket) => {
                                        const { icon: IconComponent, iconBg } = getServiceMeta(tiket.layanan.id);
                                        return (
                                            <tr key={tiket.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 transition-colors">
                                                <td className="px-6 py-5.5 whitespace-nowrap text-sm font-bold text-[#2C5E3B] dark:text-emerald-450">
                                                    {tiket.no_tiket}
                                                </td>
                                                <td className="px-6 py-5.5 whitespace-nowrap text-sm text-zinc-800 dark:text-zinc-100 font-semibold">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`flex h-8 w-8 items-center justify-center rounded-full ${iconBg}`}>
                                                            <IconComponent className="h-4 w-4" />
                                                        </div>
                                                        <span>{tiket.layanan.nama_layanan}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5.5 whitespace-nowrap text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                                                    {formatDate(tiket.createdAt)}
                                                </td>
                                                <td className="px-6 py-5.5 whitespace-nowrap text-sm">
                                                    <StatusLayananBadge status={tiket.status} />
                                                </td>
                                                <td className="px-6 py-5.5 whitespace-nowrap text-sm font-semibold text-[#2C5E3B] dark:text-emerald-450">
                                                    <Link
                                                        href={`/layanan-saya/${tiket.no_tiket}`}
                                                        className="inline-flex items-center gap-1 hover:underline transition"
                                                    >
                                                        <span>Detail</span>
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Footer */}
                    {tikets.length > 0 && (
                        <div className="flex items-center justify-between border-t border-zinc-200/80 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 px-6 py-4">
                            <div className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                                Menampilkan {totalItems === 0 ? 0 : startIndex + 1}-{endIndex} dari {totalItems} permohonan
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="flex h-8 w-8 items-center justify-center rounded-md font-medium text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200/50 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:hover:bg-transparent transition cursor-pointer"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </button>
                                {Array.from({ length: totalPages }, (_, index) => {
                                    const pageNumber = index + 1;
                                    return (
                                        <button
                                            key={pageNumber}
                                            onClick={() => setCurrentPage(pageNumber)}
                                            className={`flex h-8 w-8 items-center justify-center rounded-md text-sm font-semibold transition cursor-pointer ${currentPage === pageNumber
                                                ? "bg-[#2C5E3B] text-white dark:bg-emerald-600"
                                                : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/50 dark:hover:bg-zinc-800"
                                                }`}
                                        >
                                            {pageNumber}
                                        </button>
                                    );
                                })}
                                <button
                                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="flex h-8 w-8 items-center justify-center rounded-md font-medium text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200/50 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:hover:bg-transparent transition cursor-pointer"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
