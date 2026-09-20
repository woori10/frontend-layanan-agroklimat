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
    Inbox,
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
        slug?: string;
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
                iconBg: "bg-secondary-green-color text-secondary-green-color dark:bg-secondary-green-color/40 dark:text-secondary-green-color"
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
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-secondary-green-color border-t-transparent"></div>
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

                    <div className="w-fit text-xs md:text-sm font-semibold text-[var(--foreground)] dark:text-zinc-400 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-xl px-4 py-2.5 shadow-sm">
                        Total Permohonan: <span className=" dark:text-secondary-green-color">{tikets.length}</span>
                    </div>
                </div>

                {/* Table Section */}
                <div className="rounded-2xl md:m-0 m-2 p-4 border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
                    <div className="overflow-x-auto">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 space-y-4">
                                <div className="h-8 w-8 animate-spin rounded-full border-4 border-secondary-green-color border-t-transparent"></div>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Memuat riwayat permohonan...</p>
                            </div>
                        ) : error ? (
                            <div className="flex flex-col items-center justify-center py-20 text-red-500">
                                <p className="text-sm font-semibold">{error}</p>
                            </div>
                        ) : tikets.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-zinc-400 dark:text-zinc-500">
                                <Inbox className="h-12 w-12 stroke-1 mb-2" />
                                <p className="text-sm font-semibold">Tidak Ada Permohonan</p>
                                <p className="text-xs">Belum ada riwayat permohonan layanan.</p>
                            </div>
                        ) : (
                            <table className="min-w-full divide-y divide-zinc-200/80 dark:divide-zinc-800">
                                <thead className="bg-[var(--secondary-green-color)]">
                                    <tr>
                                        <th scope="col" className="px-6 py-4.5 text-center text-xs font-semibold text-[var(--foreground)] tracking-wider w-16">
                                            No
                                        </th>
                                        <th scope="col" className="px-6 py-4.5 text-left text-xs font-semibold text-[var(--foreground)] tracking-wider">
                                            ID Permohonan
                                        </th>
                                        <th scope="col" className="px-6 py-4.5 text-left text-xs font-semibold text-[var(--foreground)] tracking-wider">
                                            Jenis Layanan
                                        </th>
                                        <th scope="col" className="px-6 py-4.5 text-center text-xs font-semibold text-[var(--foreground)] tracking-wider">
                                            Tanggal Pengajuan
                                        </th>
                                        <th scope="col" className="px-6 py-4.5 text-center text-xs font-semibold text-[var(--foreground)] tracking-wider">
                                            Status
                                        </th>
                                        <th scope="col" className="px-6 py-4.5 text-center text-xs font-semibold text-[var(--foreground)] tracking-wider">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 bg-white dark:bg-zinc-900">
                                    {currentTikets.map((tiket, index) => {
                                        return (
                                            <tr key={tiket.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 transition-colors">
                                                <td className="px-6 py-5.5 whitespace-nowrap text-xs text-center text-zinc-500 dark:text-zinc-400 font-medium">
                                                    {startIndex + index + 1}
                                                </td>
                                                <td className="px-6 py-5.5 whitespace-nowrap text-xs font-bold text-[#2C5E3B] dark:text-secondary-green-color text-left">
                                                    {tiket.no_tiket || "-"}
                                                </td>
                                                <td className="px-6 py-5.5 whitespace-nowrap text-xs text-[var(--foreground)] dark:text-zinc-100 font-base text-left">
                                                    {tiket.layanan?.nama_layanan || "-"}
                                                </td>
                                                <td className="px-6 py-5.5 whitespace-nowrap text-center text-xs text-[var(--foreground)] dark:text-zinc-400 font-base">
                                                    {formatDate(tiket.createdAt)}
                                                </td>
                                                <td className="px-6 py-5.5 whitespace-nowrap text-xs text-center">
                                                    <div className="flex justify-center">
                                                        <StatusLayananBadge
                                                            status={tiket.status}
                                                            layananSlug={tiket.layanan?.slug}
                                                            namaLayanan={tiket.layanan?.nama_layanan}
                                                        />
                                                    </div>
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-5 text-center">
                                                    <div className="flex items-center justify-center">
                                                        <Link
                                                            href={`/layanan-saya/${tiket.no_tiket}`}
                                                            className="cursor-pointer text-xs font-semibold text-[#0076FF] transition hover:text-[#005ecb]"
                                                            title="Lihat Detail Permohonan"
                                                        >
                                                            Lihat Detail
                                                        </Link>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}

                        {/* Pagination Footer */}
                        {!loading && tikets.length > 0 && (
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-zinc-200 px-2 pt-5 dark:border-zinc-800">
                                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 text-center sm:text-left">
                                    Menampilkan{" "}
                                    <span className="font-medium text-zinc-900 dark:text-zinc-100">
                                        {totalItems === 0 ? 0 : startIndex + 1}
                                    </span>
                                    {" – "}
                                    <span className="font-medium text-zinc-900 dark:text-zinc-100">
                                        {endIndex}
                                    </span>{" "}
                                    dari{" "}
                                    <span className="font-medium text-zinc-900 dark:text-zinc-100">
                                        {totalItems}
                                    </span>{" "}
                                    permohonan
                                </p>

                                <div className="flex items-center justify-center gap-1 flex-wrap">
                                    <button
                                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        aria-label="Halaman sebelumnya"
                                        className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-zinc-800 cursor-pointer"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </button>

                                    {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-sm font-medium transition cursor-pointer ${currentPage === page
                                                ? "bg-[var(--green-color)] text-white font-bold"
                                                : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    ))}

                                    <button
                                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        aria-label="Halaman selanjutnya"
                                        className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-zinc-800 cursor-pointer"
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
