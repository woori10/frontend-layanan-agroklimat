"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/sidebar/Sidebar";
import AppBar from "@/components/appbar/AppBar";
import { getUserFromToken, getRedirectPath } from "@/lib/auth";
import { getApiUrl } from "@/lib/api";
import {
    Wrench,
    Plus,
    Pencil,
    Trash2,
    Database,
    ShieldAlert,
    Check,
    Search,
    ArrowUpDown
} from "lucide-react";

interface AlatItem {
    id: number;
    nama_alat: string;
    harga_peminjaman: number;
    stok?: number;
    dipinjam?: number;
    sisa_stok?: number;
    is_active: boolean;
    createdAt: string;
    updatedAt: string;
}

type StatusFilter = "all" | "tersedia" | "tidak_tersedia" | "stok_habis";
const ITEMS_PER_PAGE = 10;

export default function DaftarAlatPage() {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [alatList, setAlatList] = useState<AlatItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    // Search, Filter & Sorting
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
    const [sortNewest, setSortNewest] = useState(false);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);

    // Delete modal state
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [alatToDelete, setAlatToDelete] = useState<AlatItem | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const token = typeof window !== "undefined" ? localStorage.getItem("agro_token") : null;

    const fetchAlat = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${getApiUrl()}/alat`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!res.ok) {
                throw new Error("Gagal mengambil daftar alat");
            }
            const data = await res.json();
            setAlatList(data);
        } catch (err: any) {
            setError(err.message || "Terjadi kesalahan saat memuat daftar alat.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setMounted(true);
        if (!token) {
            router.push("/login");
            return;
        }
        const user = getUserFromToken();
        if (!user) {
            router.push("/login");
            return;
        }

        // Hanya pegawai Koordinator Laboratorium (unit_teknis_id: 2) atau super_admin yang boleh akses
        const isKoordLab = user.role === "pegawai" && Number(user.unit_teknis_id) === 2;
        const isSuperAdmin = user.role === "super_admin";

        if (!isKoordLab && !isSuperAdmin) {
            router.push(getRedirectPath(user.role));
            return;
        }

        fetchAlat();
    }, [router]);

    // Filter, Search, & Sorting Logic
    const filteredAlat = useMemo(() => {
        let result = [...alatList];

        if (search.trim()) {
            const keyword = search.toLowerCase();
            result = result.filter((item) =>
                item.nama_alat.toLowerCase().includes(keyword)
            );
        }

        if (statusFilter === "tersedia") {
            result = result.filter((item) => {
                const total = item.stok ?? 1;
                const dipinjam = item.dipinjam ?? 0;
                const sisa = item.sisa_stok !== undefined ? item.sisa_stok : Math.max(0, total - dipinjam);
                return item.is_active === true && sisa > 0;
            });
        } else if (statusFilter === "tidak_tersedia") {
            result = result.filter((item) => item.is_active === false);
        } else if (statusFilter === "stok_habis") {
            result = result.filter((item) => {
                const total = item.stok ?? 1;
                const dipinjam = item.dipinjam ?? 0;
                const sisa = item.sisa_stok !== undefined ? item.sisa_stok : Math.max(0, total - dipinjam);
                return item.is_active === true && sisa <= 0;
            });
        }

        result.sort((a, b) => {
            if (sortNewest) {
                const dateA = new Date(a.createdAt || 0).getTime();
                const dateB = new Date(b.createdAt || 0).getTime();
                return dateB - dateA;
            }
            return a.id - b.id;
        });

        return result;
    }, [alatList, search, statusFilter, sortNewest]);

    // Counts
    const totalCount = alatList.length;
    const tersediaCount = alatList.filter((item) => {
        const total = item.stok ?? 1;
        const dipinjam = item.dipinjam ?? 0;
        const sisa = item.sisa_stok !== undefined ? item.sisa_stok : Math.max(0, total - dipinjam);
        return item.is_active === true && sisa > 0;
    }).length;
    const tidakTersediaCount = alatList.filter((item) => item.is_active === false).length;
    const stokHabisCount = alatList.filter((item) => {
        const total = item.stok ?? 1;
        const dipinjam = item.dipinjam ?? 0;
        const sisa = item.sisa_stok !== undefined ? item.sisa_stok : Math.max(0, total - dipinjam);
        return item.is_active === true && sisa <= 0;
    }).length;

    // Pagination
    const totalPages = Math.ceil(filteredAlat.length / ITEMS_PER_PAGE);
    const paginatedAlat = filteredAlat.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    useEffect(() => {
        setCurrentPage(1);
    }, [search, statusFilter, sortNewest]);



    const handleToggleStatus = async (alat: AlatItem) => {
        try {
            const res = await fetch(`${getApiUrl()}/alat/${alat.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    is_active: !alat.is_active,
                }),
            });

            if (!res.ok) {
                throw new Error("Gagal mengubah status alat");
            }

            setAlatList((prev) =>
                prev.map((item) =>
                    item.id === alat.id ? { ...item, is_active: !item.is_active } : item
                )
            );
        } catch (err: any) {
            alert(err.message || "Gagal mengubah status alat");
        }
    };

    const handleDelete = async () => {
        if (!alatToDelete) return;
        setDeleteLoading(true);
        try {
            const res = await fetch(`${getApiUrl()}/alat/${alatToDelete.id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                throw new Error("Gagal menghapus alat");
            }

            setSuccessMessage("Alat berhasil dihapus!");
            setTimeout(() => setSuccessMessage(""), 3500);
            setDeleteModalOpen(false);
            setAlatToDelete(null);
            fetchAlat();
        } catch (err: any) {
            alert(err.message || "Gagal menghapus alat");
        } finally {
            setDeleteLoading(false);
        }
    };

    const formatRupiah = (number: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(number);
    };

    if (!mounted) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-secondary-green-color border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="flex h-screen overflow-hidden bg-zinc-50 font-sans text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <div className="flex flex-1 flex-col overflow-y-auto">
                <AppBar onMenuClick={() => { }} />

                <main className="flex-1 space-y-6 p-8">
                    {/* Header Section */}
                    <div className="flex justify-between items-center w-full relative overflow-hidden space-y-3">
                        <div className="space-y-3">
                            <h1 className="text-2xl font-semibold md:text-3xl text-[var(--foreground)] dark:text-zinc-50">
                                Daftar <span className="text-green-color">Alat Laboratorium</span>
                            </h1>
                            <p className="max-w-4xl text-sm font-medium text-[var(--foreground)] dark:text-zinc-400">
                                Kelola daftar alat dan tarif peminjaman yang muncul pada formulir Layanan Peminjaman Alat
                            </p>
                        </div>

                        <div className="flex justify-end items-center">
                            <button
                                onClick={() => router.push("/daftar-alat/tambah")}
                                className="inline-flex items-center gap-2 rounded-xl bg-[var(--green-color)] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#22482E] transition shadow-sm cursor-pointer"
                            >
                                <Plus className="h-4 w-4" />
                                Tambah Alat
                            </button>
                        </div>
                    </div>

                    {/* Table Card Wrapper */}
                    <div className="rounded-2xl p-4 sm:p-6 md:p-8 border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
                        {/* Alerts */}
                        {error && (
                            <div className="mb-6 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">
                                <ShieldAlert className="h-5 w-5 flex-shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        {successMessage && (
                            <div className="mb-6 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-400">
                                <Check className="h-5 w-5 flex-shrink-0" />
                                <span>{successMessage}</span>
                            </div>
                        )}

                        {/* Toolbar: Status Filter Tabs + Search + Sorting */}
                        <div className="mb-6 flex flex-col gap-4">
                            <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4">
                                {/* Status Filter Tabs */}
                                <div className="w-full lg:w-auto overflow-x-auto pb-1 -mb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                                    <div className="inline-flex min-w-full sm:min-w-0 items-center rounded-xl bg-secondary-green-color p-1.5 dark:border-zinc-800 dark:bg-zinc-950 gap-1">
                                        <button
                                            type="button"
                                            onClick={() => setStatusFilter("all")}
                                            className={`whitespace-nowrap shrink-0 rounded-lg px-3 py-2 text-xs font-medium transition cursor-pointer ${statusFilter === "all"
                                                ? "bg-white text-[var(--green-color)] shadow-sm dark:bg-zinc-900 font-semibold"
                                                : "text-zinc-600 hover:text-zinc-800 dark:text-zinc-400"
                                                }`}
                                        >
                                            Semua
                                            <span className="ml-1.5">({totalCount})</span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setStatusFilter("tersedia")}
                                            className={`whitespace-nowrap shrink-0 rounded-lg px-3 py-2 text-xs font-medium transition cursor-pointer ${statusFilter === "tersedia"
                                                ? "bg-white text-[var(--green-color)] shadow-sm dark:bg-zinc-900 font-semibold"
                                                : "text-zinc-600 hover:text-zinc-800 dark:text-zinc-400"
                                                }`}
                                        >
                                            Tersedia
                                            <span className="ml-1.5">({tersediaCount})</span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setStatusFilter("tidak_tersedia")}
                                            className={`whitespace-nowrap shrink-0 rounded-lg px-3 py-2 text-xs font-medium transition cursor-pointer ${statusFilter === "tidak_tersedia"
                                                ? "bg-white text-[var(--green-color)] shadow-sm dark:bg-zinc-900 font-semibold"
                                                : "text-zinc-600 hover:text-zinc-800 dark:text-zinc-400"
                                                }`}
                                        >
                                            Tidak Tersedia
                                            <span className="ml-1.5">({tidakTersediaCount})</span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setStatusFilter("stok_habis")}
                                            className={`whitespace-nowrap shrink-0 rounded-lg px-3 py-2 text-xs font-medium transition cursor-pointer ${statusFilter === "stok_habis"
                                                ? "bg-white text-[var(--green-color)] shadow-sm dark:bg-zinc-900 font-semibold"
                                                : "text-zinc-600 hover:text-zinc-800 dark:text-zinc-400"
                                                }`}
                                        >
                                            Stok Habis
                                            <span className="ml-1.5">({stokHabisCount})</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Right Side: Search + Sorting */}
                                <div className="flex w-full lg:w-auto items-center gap-2 sm:gap-3">
                                    {/* Search Input */}
                                    <div className="flex h-10 flex-1 sm:w-64 items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 dark:border-zinc-800 dark:bg-zinc-950">
                                        <Search className="h-4 w-4 text-zinc-400 shrink-0" />
                                        <input
                                            type="text"
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            placeholder="Cari nama alat..."
                                            className="w-full bg-transparent text-xs text-zinc-800 outline-none placeholder:text-zinc-400 dark:text-zinc-100"
                                        />
                                    </div>

                                    {/* Sorting Button */}
                                    <button
                                        type="button"
                                        onClick={() => setSortNewest((prev) => !prev)}
                                        title={sortNewest ? "Urutan: Terbaru Dibuat" : "Urutan: Default (ID)"}
                                        className="flex h-10 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-white px-3 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-800 cursor-pointer"
                                    >
                                        <ArrowUpDown className="h-4 w-4 mr-1.5" />
                                        <span className="hidden sm:inline">{sortNewest ? "Terbaru" : "Default"}</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center space-y-4 py-20">
                                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-secondary-green-color border-t-transparent" />
                                    <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                                        Memuat data alat...
                                    </p>
                                </div>
                            ) : filteredAlat.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-zinc-400 dark:text-zinc-500">
                                    <Wrench className="mb-2 h-12 w-12 stroke-1" />
                                    <p className="text-sm font-semibold">Tidak Ada Data Alat</p>
                                    <p className="text-xs">Tidak ada alat yang sesuai dengan pencarian atau filter.</p>
                                </div>
                            ) : (
                                <table className="min-w-full divide-y divide-zinc-200/80 dark:divide-zinc-800">
                                    <thead className="bg-secondary-green-color dark:bg-zinc-950">
                                        <tr>
                                            <th scope="col" className="px-6 py-4.5 text-center text-xs font-semibold text-[var(--foreground)] tracking-wider w-16">
                                                No
                                            </th>
                                            <th scope="col" className="px-6 py-4.5 text-left text-xs font-semibold text-[var(--foreground)] tracking-wider w-28">
                                                ID Alat
                                            </th>
                                            <th scope="col" className="px-6 py-4.5 text-left text-xs font-semibold text-[var(--foreground)] tracking-wider">
                                                Nama Alat
                                            </th>
                                            <th scope="col" className="px-6 py-4.5 text-left text-xs font-semibold text-[var(--foreground)] tracking-wider">
                                                Tarif / Harga Peminjaman
                                            </th>
                                            <th scope="col" className="px-6 py-4.5 text-center text-xs font-semibold text-[var(--foreground)] tracking-wider w-28">
                                                Stok
                                            </th>
                                            <th scope="col" className="px-6 py-4.5 text-center text-xs font-semibold text-[var(--foreground)] tracking-wider w-36">
                                                Status
                                            </th>
                                            <th scope="col" className="px-6 py-4.5 text-center text-xs font-semibold text-[var(--foreground)] tracking-wider w-32">
                                                Aksi
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-zinc-100 bg-white dark:divide-zinc-800 dark:bg-zinc-900">
                                        {paginatedAlat.map((alat, idx) => {
                                            const isAvailable = alat.is_active;

                                            return (
                                                <tr key={alat.id} className="transition-colors hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50">
                                                    {/* No */}
                                                    <td className="whitespace-nowrap px-6 py-5 text-center text-xs font-bold text-[#2C5E3B] dark:text-secondary-green-color">
                                                        {(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}
                                                    </td>

                                                    {/* ID Alat */}
                                                    <td className="whitespace-nowrap px-6 py-5 text-left text-xs font-semibold text-zinc-600 dark:text-zinc-400 font-mono">
                                                        ALT-{String(alat.id).padStart(3, "0")}
                                                    </td>

                                                    {/* Nama Alat */}
                                                    <td className="px-6 py-5 text-left text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                                                        {alat.nama_alat}
                                                    </td>

                                                    {/* Tarif */}
                                                    <td className="px-6 py-5 text-left text-xs text-zinc-700 dark:text-zinc-300 font-semibold">
                                                        {formatRupiah(alat.harga_peminjaman)}
                                                        <span className="text-[10px] text-zinc-500 font-normal ml-1">/ unit</span>
                                                    </td>

                                                    {/* Stok */}
                                                    <td className="whitespace-nowrap px-6 py-5 text-center text-xs">
                                                        {(() => {
                                                            const total = alat.stok ?? 1;
                                                            const dipinjam = alat.dipinjam ?? 0;
                                                            const sisa = alat.sisa_stok !== undefined ? alat.sisa_stok : Math.max(0, total - dipinjam);
                                                            const isDepleted = sisa <= 0;

                                                            return (
                                                                <div className="flex flex-col items-center justify-center gap-1">
                                                                    <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-semibold ${isDepleted
                                                                        ? "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50"
                                                                        : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700"
                                                                        }`}>
                                                                        {isDepleted ? `0/${total} unit` : `${sisa}/${total} unit`}
                                                                    </span>
                                                                    {dipinjam > 0 && (
                                                                        <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                                                                            ({dipinjam} dipinjam)
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            );
                                                        })()}
                                                    </td>

                                                    {/* Status Badge */}
                                                    <td className="px-6 py-5 text-center whitespace-nowrap">
                                                        {(() => {
                                                            const total = alat.stok ?? 1;
                                                            const dipinjam = alat.dipinjam ?? 0;
                                                            const sisa = alat.sisa_stok !== undefined ? alat.sisa_stok : Math.max(0, total - dipinjam);
                                                            const isOutOfStock = alat.is_active && sisa <= 0;

                                                            if (!alat.is_active) {
                                                                return (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleToggleStatus(alat)}
                                                                        title="Klik untuk mengubah status menjadi Tersedia"
                                                                        className="cursor-pointer"
                                                                    >
                                                                        <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-600 hover:bg-zinc-200 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-400 transition">
                                                                            <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
                                                                            Tidak Tersedia
                                                                        </span>
                                                                    </button>
                                                                );
                                                            }

                                                            if (isOutOfStock) {
                                                                return (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleToggleStatus(alat)}
                                                                        title="Stok saat ini habis dipinjam. Klik untuk mengubah status menjadi Tidak Tersedia"
                                                                        className="cursor-pointer"
                                                                    >
                                                                        <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-400 transition">
                                                                            <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
                                                                            Stok Habis
                                                                        </span>
                                                                    </button>
                                                                );
                                                            }

                                                            return (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleToggleStatus(alat)}
                                                                    title="Klik untuk mengubah status menjadi Tidak Tersedia"
                                                                    className="cursor-pointer"
                                                                >
                                                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 transition">
                                                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                                                        Tersedia
                                                                    </span>
                                                                </button>
                                                            );
                                                        })()}
                                                    </td>

                                                    {/* Aksi: Edit & Hapus */}
                                                    <td className="whitespace-nowrap px-6 py-5 text-center">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => router.push(`/daftar-alat/edit/${alat.id}`)}
                                                                className="p-1.5 text-zinc-500 hover:text-[#2C5E3B] hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition cursor-pointer"
                                                                title="Edit Alat"
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setAlatToDelete(alat);
                                                                    setDeleteModalOpen(true);
                                                                }}
                                                                className="p-1.5 text-zinc-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-zinc-800 rounded-md transition cursor-pointer"
                                                                title="Hapus Alat"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        {/* Pagination */}
                        {!loading && filteredAlat.length > 0 && totalPages > 0 && (
                            <div className="flex items-center justify-between border-t border-zinc-200 px-2 pt-5 dark:border-zinc-800">
                                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
                                    Menampilkan{" "}
                                    <span className="font-medium text-zinc-900 dark:text-zinc-100">
                                        {(currentPage - 1) * ITEMS_PER_PAGE + 1}
                                    </span>
                                    –
                                    <span className="font-medium text-zinc-900 dark:text-zinc-100">
                                        {Math.min(currentPage * ITEMS_PER_PAGE, filteredAlat.length)}
                                    </span>{" "}
                                    dari{" "}
                                    <span className="font-medium text-zinc-900 dark:text-zinc-100">
                                        {filteredAlat.length}
                                    </span>{" "}
                                    alat
                                </p>

                                <div className="flex items-center gap-1">
                                    <button
                                        type="button"
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                        className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-zinc-800 cursor-pointer"
                                    >
                                        ‹
                                    </button>

                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                        <button
                                            key={page}
                                            type="button"
                                            onClick={() => setCurrentPage(page)}
                                            className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold transition cursor-pointer ${currentPage === page
                                                ? "bg-[var(--green-color)] text-white shadow-sm"
                                                : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    ))}

                                    <button
                                        type="button"
                                        disabled={currentPage === totalPages}
                                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                        className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-zinc-800 cursor-pointer"
                                    >
                                        ›
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>



            {/* Delete Confirmation Modal */}
            {deleteModalOpen && alatToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                        <div className="text-center space-y-3">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400">
                                <Trash2 className="h-6 w-6" />
                            </div>
                            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                                Hapus Alat Laboratorium?
                            </h3>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                Apakah Anda yakin ingin menghapus alat: <br />
                                <span className="font-semibold text-zinc-800 dark:text-zinc-200">&quot;{alatToDelete.nama_alat}&quot;</span>?
                                Tindakan ini akan menghapus alat dari daftar peminjaman.
                            </p>
                        </div>

                        <div className="flex items-center justify-center gap-3 mt-6">
                            <button
                                onClick={() => setDeleteModalOpen(false)}
                                className="px-4 py-2.5 rounded-xl border border-zinc-300 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 font-semibold cursor-pointer text-xs"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleteLoading}
                                className="px-5 py-2.5 rounded-xl bg-red-600 text-white hover:bg-red-700 font-semibold cursor-pointer disabled:opacity-50 text-xs"
                            >
                                {deleteLoading ? "Menghapus..." : "Ya, Hapus"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
