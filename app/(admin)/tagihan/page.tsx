"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/sidebar/Sidebar";
import AppBar from "@/components/appbar/AppBar";
import { getUserFromToken, getRedirectPath } from "@/lib/auth";
import { ChevronLeft, ChevronRight, UserCheck, Eye, Search } from "lucide-react";
import Link from "next/link";

export default function TagihanLayananPage() {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [tikets, setTikets] = useState<any[]>([]);
    const [filteredTikets, setFilteredTikets] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedStatus, setSelectedStatus] = useState<string>("semua");
    const [tempStatus, setTempStatus] = useState<string>("semua");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // Authenticate on client side
    useEffect(() => {
        setMounted(true);
        const token = localStorage.getItem("agro_token");
        if (!token) {
            router.push("/login/pegawai");
            return;
        }
        const user = getUserFromToken();
        if (user && user.role !== "admin") {
            router.push(getRedirectPath(user.role));
        }
    }, [router]);

    // Fetch tickets and filter those that have tagihan
    useEffect(() => {
        if (!mounted) return;
        const token = localStorage.getItem("agro_token");
        if (!token) return;

        setLoading(true);
        fetch("http://localhost:3000/tiket/admin", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then((res) => {
                if (!res.ok) throw new Error("Gagal mengambil data permohonan");
                return res.json();
            })
            .then((data) => {
                // Filter only tickets that have a tagihan record
                const dataWithTagihan = Array.isArray(data)
                    ? data.filter((tiket: any) => tiket.tagihan !== null)
                    : [];
                setTikets(dataWithTagihan);
            })
            .catch((err: any) => {
                setError(err.message || "Gagal mengambil data");
            })
            .finally(() => {
                setLoading(false);
            });
    }, [mounted]);

    const totalItems = filteredTikets.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    const currentTikets = filteredTikets.slice(startIndex, startIndex + itemsPerPage);

    // Filter tickets based on status tab/dropdown and search query
    useEffect(() => {
        let result = tikets;

        // Payment status filter: "lunas" or "belum"
        if (selectedStatus !== "semua") {
            if (selectedStatus === "lunas") {
                result = result.filter(t => t.tagihan?.status_bayar === "lunas");
            } else if (selectedStatus === "belum") {
                result = result.filter(t => t.tagihan?.status_bayar !== "lunas");
            }
        }

        // Search query filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(t =>
                (t.no_tiket || "").toLowerCase().includes(query) ||
                (t.layanan?.nama_layanan || "").toLowerCase().includes(query) ||
                (t.jawaban_form?.nama_lengkap || t.user?.nama || "").toLowerCase().includes(query)
            );
        }

        setFilteredTikets(result);
        setCurrentPage(1); // Reset to first page when filtering
    }, [tikets, selectedStatus, searchQuery]);

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

    return (
        <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 overflow-hidden font-sans">
            <Sidebar />
            <div className="flex flex-col flex-1 overflow-y-auto">
                <AppBar onMenuClick={() => setSidebarOpen(true)} />
                <main className="flex-1 p-8 space-y-6">
                    <div className="relative overflow-hidden space-y-2">
                        <h1 className="text-2xl font-semibold md:text-3xl text-[var(--foreground)]">
                            Daftar Tagihan <span className="capitalize text-[var(--green-color)]">Peminjaman Alat</span>
                        </h1>
                        <p className="text-[var(--foreground)]">Sistem pemantauan real-time untuk administrasi peminjaman alat</p>
                    </div>
                    {/* Filter Dropdown & Search Bar */}
                    <div className="px-4 pb-4">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-zinc-900">
                            <div className="relative w-full">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                                <input
                                    type="text"
                                    placeholder="Cari nomor tiket, pemohon..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 text-xs border border-zinc-200 rounded-lg focus:outline-hidden focus:border-emerald-500 bg-zinc-50 dark:bg-zinc-950 dark:border-zinc-800"
                                />
                            </div>
                            <div className="flex items-center gap-2 w-full md:w-auto">
                                <select
                                    value={tempStatus}
                                    onChange={(e) => setTempStatus(e.target.value)}
                                    className="w-full md:w-48 p-2 text-xs border border-zinc-200 rounded-lg focus:outline-hidden focus:border-emerald-500 bg-zinc-50 dark:bg-zinc-950 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 cursor-pointer"
                                >
                                    <option value="semua">Semua Status Bayar</option>
                                    <option value="lunas">Lunas</option>
                                    <option value="belum">Belum Lunas</option>
                                </select>
                                <button
                                    onClick={() => setSelectedStatus(tempStatus)}
                                    className="px-4 py-2 text-xs font-semibold text-white bg-[var(--green-color)] hover:bg-emerald-700 rounded-lg transition-all shadow-xs cursor-pointer flex-shrink-0"
                                >
                                    Terapkan
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="overflow-hidden rounded-xl border border-zinc-200/80 bg-white dark:border-zinc-800 dark:bg-zinc-900">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-zinc-200/80 dark:divide-zinc-800">
                                <thead className="bg-[#E5E7EB]/50 dark:bg-zinc-950">
                                    <tr>
                                        <th scope="col" className="px-6 py-4.5 text-left text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider">
                                            ID Permohonan
                                        </th>
                                        <th scope="col" className="px-6 py-4.5 text-left text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider">
                                            Nama Pemohon
                                        </th>
                                        <th scope="col" className="px-6 py-4.5 text-left text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider">
                                            Jenis Layanan
                                        </th>
                                        <th scope="col" className="px-6 py-4.5 text-center text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider">
                                            Biaya
                                        </th>
                                        <th scope="col" className="px-6 py-4.5 text-center text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th scope="col" className="px-6 py-4.5 text-center text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 bg-white dark:bg-zinc-900">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-10 text-center text-sm text-zinc-450 dark:text-zinc-550">
                                                Memuat riwayat permohonan...
                                            </td>
                                        </tr>
                                    ) : error ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-10 text-center text-sm text-red-500 font-medium">
                                                {error}
                                            </td>
                                        </tr>
                                    ) : tikets.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-10 text-center text-sm text-zinc-450 dark:text-zinc-550">
                                                Belum ada riwayat permohonan layanan.
                                            </td>
                                        </tr>
                                    ) : (
                                        currentTikets.map((tiket) => {
                                            return (
                                                <tr key={tiket.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 transition-colors">
                                                    <td className="px-6 py-5.5 whitespace-nowrap text-sm text-zinc-800 dark:text-zinc-100 font-base">
                                                        {tiket.no_tiket || "-"}
                                                    </td>
                                                    <td className="px-6 py-5.5 whitespace-nowrap text-sm text-zinc-800 dark:text-zinc-100 font-base">
                                                        {tiket.jawaban_form?.nama_lengkap || tiket.user?.nama || "-"}
                                                    </td>
                                                    <td className="px-6 py-5.5 whitespace-nowrap text-sm text-zinc-800 dark:text-zinc-100 font-base">
                                                        {tiket.jawaban_form?.jenisAlat || tiket.layanan.nama_layanan}
                                                    </td>
                                                    <td className="px-6 py-5.5 text-center whitespace-nowrap text-sm text-zinc-800 dark:text-zinc-100 font-base">
                                                        {tiket.tagihan?.jumlah ? `Rp ${tiket.tagihan.jumlah.toLocaleString("id-ID")}` : "-"}
                                                    </td>
                                                    <td className="px-6 py-5.5 text-center whitespace-nowrap text-sm">
                                                        {getPaymentStatusBadge(tiket.tagihan?.status_bayar)}
                                                    </td>
                                                    <td className="px-6 py-5.5 text-center whitespace-nowrap text-sm flex items-center justify-center gap-2">
                                                        <Link
                                                            href={tiket.tagihan?.status_bayar === "Lunas" ? "" : ""}
                                                            className="inline-flex items-center justify-center px-2 text-[var(--green-color)] text-base font-bold transition cursor-pointer"
                                                            title="Disposisi ke User Khusus"
                                                        >
                                                            <UserCheck className="h-4 w-4" />
                                                        </Link>
                                                        <Link
                                                            href={`/tagihan/${tiket.id}`}
                                                            className="inline-flex items-center justify-center px-2 text-[var(--green-color)] text-base font-bold transition cursor-pointer"
                                                            title="Detail"
                                                        >
                                                            <Eye className="h-4 w-4" />
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
                            <div className="flex items-center justify-between border-t border-zinc-200/80 dark:border-zinc-800 bg-[#E5E7EB]/50 px-6 py-4">
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
        </div>
    );
}
