"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/sidebar/Sidebar";
import AppBar from "@/components/appbar/AppBar";
import CardDashboard from "@/components/card/card-dashboard/CardDashboard";
import { getUserFromToken, getRedirectPath } from "@/lib/auth";
import { getApiUrl } from "@/lib/api";
import {
    Pencil,
    MoreVertical,
    Search,
    ArrowUpDown,
    Check,
    ShieldAlert,
    Database,
    ChevronLeft,
    ChevronRight,
    SlidersHorizontal,
    Layers,
    CheckCircle2,
    AlertCircle,
    FileText,
    Activity,
} from "lucide-react";

interface UnitTeknis {
    id: number;
    nama: string;
}

interface Layanan {
    id: number;
    nama_layanan: string;
    slug: string;
    biaya: any;
    sla_hari: number | null;
    is_active: boolean;
    unit_teknis_id: number | null;
    unit_teknis: UnitTeknis | null;
    createdAt?: string;
}

interface TiketData {
    id: number;
    no_tiket: string;
    status: string;
    createdAt: string;
}

const ITEMS_PER_PAGE = 5;

const ALL_CATEGORIES = [
    "Perekayasaan dan Perakitan",
    "Rekomendasi",
    "Pendayagunaan Hasil",
    "Pendukung",
];

const getKategoriLayanan = (slug: string, nama: string = ""): string => {
    const s = (slug || "").toLowerCase().trim();
    const n = (nama || "").toLowerCase().trim();

    if (s.includes("siap-tanam") || n.includes("siap tanam") || n.includes("kalender tanam")) {
        return "Perekayasaan dan Perakitan";
    }
    if (s.includes("sni") || n.includes("sni")) {
        return "Rekomendasi";
    }
    if (s.includes("agroedukasi") || s.includes("mess") || n.includes("agroedukasi") || n.includes("mess")) {
        return "Pendukung";
    }
    return "Pendayagunaan Hasil";
};

const getKategoriBadge = (kategori: string) => {
    switch (kategori) {
        case "Perekayasaan dan Perakitan":
            return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800";
        case "Rekomendasi":
            return "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800";
        case "Pendayagunaan Hasil":
            return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800";
        case "Pendukung":
            return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800";
        default:
            return "bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700";
    }
};

export default function KelolaLayananPage() {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [layananList, setLayananList] = useState<Layanan[]>([]);
    const [tikets, setTikets] = useState<TiketData[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingTikets, setLoadingTikets] = useState(true);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    // Filters and pagination states
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
    const [kategoriFilter, setKategoriFilter] = useState<string>("all");
    const [sortOrder, setSortOrder] = useState<"terbaru" | "terlama">("terbaru");
    const [currentPage, setCurrentPage] = useState(1);
    const [togglingId, setTogglingId] = useState<number | null>(null);

    // Authentication and initial fetch
    useEffect(() => {
        setMounted(true);
        const token = localStorage.getItem("agro_token");

        if (!token) {
            router.push("/login");
            return;
        }

        const user = getUserFromToken();
        if (user) {
            if (user.role !== "super_admin") {
                router.push(getRedirectPath(user.role));
                return;
            }
        }

        fetchLayanan(token);
        fetchTikets(token);
    }, [router]);

    const fetchTikets = async (token: string) => {
        setLoadingTikets(true);
        try {
            const res = await fetch(`${getApiUrl()}/tiket/admin`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (res.ok) {
                const data = await res.json();
                setTikets(Array.isArray(data) ? data : []);
            }
        } catch (err) {
            console.error("Gagal mengambil data tiket:", err);
        } finally {
            setLoadingTikets(false);
        }
    };

    const totalLayanan = layananList.length;
    const aktifLayanan = layananList.filter((l) => l.is_active).length;
    const nonaktifLayanan = layananList.filter((l) => !l.is_active).length;
    const totalPermohonan = tikets.length;

    const diprosesCount = useMemo(() => {
        return tikets.filter((t) => t.status === "diproses").length;
    }, [tikets]);

    const selesaiCount = useMemo(() => {
        return tikets.filter((t) => ["selesai", "menunggu_konfirmasi"].includes(t.status)).length;
    }, [tikets]);

    const ditolakCount = useMemo(() => {
        return tikets.filter((t) => ["ditolak", "dibatalkan"].includes(t.status)).length;
    }, [tikets]);

    const permohonanMap = useMemo(() => {
        const map: Record<number, number> = {};
        tikets.forEach((t: any) => {
            const lid = t.layanan_id || t.layanan?.id;
            if (lid) {
                map[lid] = (map[lid] || 0) + 1;
            }
        });
        return map;
    }, [tikets]);

    const fetchLayanan = async (token: string) => {
        setLoading(true);
        setError("");
        try {
            // Coba ambil dari /layanan/admin, fallback ke /layanan jika diperlukan
            let res = await fetch(`${getApiUrl()}/layanan/admin`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                res = await fetch(`${getApiUrl()}/layanan`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
            }

            if (!res.ok) {
                throw new Error("Gagal mengambil data layanan dari server");
            }

            const data = await res.json();
            const formatted: Layanan[] = (Array.isArray(data) ? data : []).map((item: any) => ({
                ...item,
                is_active: item.is_active !== undefined ? item.is_active : true,
            }));
            setLayananList(formatted);
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Terjadi kesalahan saat memuat data layanan.");
        } finally {
            setLoading(false);
        }
    };

    const formatBiaya = (biaya: any) => {
        if (!biaya) return "-";
        if (biaya.tipe === "gratis") return "Gratis";
        if (biaya.tipe === "tetap") {
            return biaya.nominal ? `Rp ${biaya.nominal.toLocaleString("id-ID")}` : (biaya.catatan || "Tarif PNBP");
        }
        if (biaya.tipe === "per_satuan") {
            return `Rp ${biaya.nominal?.toLocaleString("id-ID")} / ${biaya.satuan}`;
        }
        return typeof biaya === "string" ? biaya : JSON.stringify(biaya);
    };

    const handleToggleStatus = async (layanan: Layanan) => {
        const token = localStorage.getItem("agro_token");
        if (!token) return;

        const newStatus = !layanan.is_active;
        setTogglingId(layanan.id);

        // Optimistic UI update
        setLayananList((prev) =>
            prev.map((item) => (item.id === layanan.id ? { ...item, is_active: newStatus } : item))
        );

        try {
            const res = await fetch(`${getApiUrl()}/layanan/${layanan.id}/status`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ is_active: newStatus }),
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => null);
                throw new Error(errData?.message || "Gagal memperbarui status layanan");
            }

            setSuccessMessage(
                `Layanan "${layanan.nama_layanan}" berhasil di-${newStatus ? "aktifkan" : "nonaktifkan"}.`
            );
            setTimeout(() => setSuccessMessage(""), 3500);
        } catch (err: any) {
            // Revert state on failure
            setLayananList((prev) =>
                prev.map((item) => (item.id === layanan.id ? { ...item, is_active: !newStatus } : item))
            );
            setError(err.message || "Gagal mengubah status layanan");
            setTimeout(() => setError(""), 3500);
        } finally {
            setTogglingId(null);
        }
    };

    const handleEdit = (layanan: Layanan) => {
        alert(`Edit layanan: ${layanan.nama_layanan}`);
    };

    // Filter, Search, and Sort
    const filteredLayanan = useMemo(() => {
        let result = [...layananList];

        // Search Filter
        if (search.trim()) {
            const query = search.toLowerCase().trim();
            result = result.filter((item) => {
                const cat = getKategoriLayanan(item.slug, item.nama_layanan).toLowerCase();
                return (
                    item.nama_layanan.toLowerCase().includes(query) ||
                    item.slug.toLowerCase().includes(query) ||
                    cat.includes(query) ||
                    (item.unit_teknis?.nama && item.unit_teknis.nama.toLowerCase().includes(query))
                );
            });
        }

        // Category Filter
        if (kategoriFilter !== "all") {
            result = result.filter(
                (item) => getKategoriLayanan(item.slug, item.nama_layanan) === kategoriFilter
            );
        }

        // Status Filter
        if (statusFilter === "active") {
            result = result.filter((item) => item.is_active === true);
        } else if (statusFilter === "inactive") {
            result = result.filter((item) => item.is_active === false);
        }

        // Sort Order
        result.sort((a, b) => {
            if (sortOrder === "terbaru") {
                return b.id - a.id;
            }
            return a.id - b.id;
        });

        return result;
    }, [layananList, search, kategoriFilter, statusFilter, sortOrder]);

    // Counts for tabs
    const totalCount = layananList.length;
    const aktifCount = layananList.filter((item) => item.is_active === true).length;
    const nonaktifCount = layananList.filter((item) => item.is_active === false).length;

    // Pagination
    const totalPages = Math.max(1, Math.ceil(filteredLayanan.length / ITEMS_PER_PAGE));
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filteredLayanan.length);
    const paginatedLayanan = filteredLayanan.slice(startIndex, endIndex);

    useEffect(() => {
        setCurrentPage(1);
    }, [search, kategoriFilter, statusFilter, sortOrder]);

    if (!mounted) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--secondary-green-color)] border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 overflow-hidden font-sans">
            <Sidebar />

            <div className="flex flex-col flex-1 overflow-y-auto">
                <AppBar onMenuClick={() => { }} />

                <main className="flex-1 space-y-6 p-8">
                    {/* Header Section */}
                    <div className="space-y-2">
                        <h1 className="text-2xl font-semibold md:text-3xl text-[var(--foreground)] dark:text-zinc-50">
                            Kelola <span className="text-green-color">Master Layanan</span>
                        </h1>
                        <p className="max-w-2xl text-sm font-medium text-zinc-500 dark:text-zinc-400">
                            Manajemen master data layanan agroklimat, skema tarif PNBP, SLA, dan status keaktifan di portal landing page.
                        </p>
                    </div>

                    {/* Stat Cards Row */}
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <CardDashboard
                            title="Total Permohonan"
                            icon={FileText}
                            iconBgClass="bg-[#385A3F]"
                            iconColorClass="text-white"
                            value={loadingTikets ? "..." : totalPermohonan}
                            desc="permohonan"
                        />
                        <CardDashboard
                            title="Permohonan Diproses"
                            icon={Activity}
                            iconBgClass="bg-blue-500/10 dark:bg-blue-950/40 border border-blue-500/20"
                            iconColorClass="text-blue-600 dark:text-blue-400"
                            value={loadingTikets ? "..." : diprosesCount}
                            desc="permohonan"
                        />
                        <CardDashboard
                            title="Permohonan Selesai"
                            icon={CheckCircle2}
                            iconBgClass="bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-500/20"
                            iconColorClass="text-emerald-600 dark:text-emerald-400"
                            value={loadingTikets ? "..." : selesaiCount}
                            desc="permohonan"
                        />
                        <CardDashboard
                            title="Permohonan Ditolak"
                            icon={AlertCircle}
                            iconBgClass="bg-red-500/10 dark:bg-red-950/40 border border-red-500/20"
                            iconColorClass="text-red-500 dark:text-red-400"
                            value={loadingTikets ? "..." : ditolakCount}
                            desc="permohonan"
                        />
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
                                {/* Status Filter Tabs (Semua, Aktif, Nonaktif) */}
                                <div className="w-full lg:w-auto overflow-x-auto pb-1 -mb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                                    <div className="inline-flex min-w-full sm:min-w-0 items-center rounded-xl bg-secondary-green-color p-1.5 dark:border-zinc-800 dark:bg-zinc-950 gap-1">
                                        <button
                                            type="button"
                                            onClick={() => setStatusFilter("all")}
                                            className={`whitespace-nowrap shrink-0 rounded-lg px-3 py-2 text-xs font-medium transition cursor-pointer ${statusFilter === "all"
                                                ? "bg-white text-[var(--green-color)] shadow-sm dark:bg-zinc-900 font-bold"
                                                : "text-zinc-600 hover:text-zinc-800 dark:text-zinc-400"
                                                }`}
                                        >
                                            Semua
                                            <span className="ml-1.5 text-[10px]">({totalCount})</span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setStatusFilter("active")}
                                            className={`whitespace-nowrap shrink-0 rounded-lg px-3 py-2 text-xs font-medium transition cursor-pointer ${statusFilter === "active"
                                                ? "bg-white text-[var(--green-color)] shadow-sm dark:bg-zinc-900 font-bold"
                                                : "text-zinc-600 hover:text-zinc-800 dark:text-zinc-400"
                                                }`}
                                        >
                                            Aktif
                                            <span className="ml-1.5 text-[10px]">({aktifCount})</span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setStatusFilter("inactive")}
                                            className={`whitespace-nowrap shrink-0 rounded-lg px-3 py-2 text-xs font-medium transition cursor-pointer ${statusFilter === "inactive"
                                                ? "bg-white text-[var(--green-color)] shadow-sm dark:bg-zinc-900 font-bold"
                                                : "text-zinc-600 hover:text-zinc-800 dark:text-zinc-400"
                                                }`}
                                        >
                                            Nonaktif
                                            <span className="ml-1.5 text-[10px]">({nonaktifCount})</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Right Side: Search & Filter Kategori */}
                                <div className="flex flex-col sm:flex-row w-full lg:w-auto items-stretch sm:items-center gap-3">
                                    {/* Search */}
                                    <div className="flex h-10 flex-1 sm:w-64 items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 dark:border-zinc-800 dark:bg-zinc-950">
                                        <Search className="h-4 w-4 text-zinc-400 shrink-0" />
                                        <input
                                            type="text"
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            placeholder="Cari nama layanan, kategori, unit..."
                                            className="w-full bg-transparent text-xs text-zinc-800 outline-none placeholder:text-zinc-400 dark:text-zinc-100"
                                        />
                                    </div>
                                    {/* Filter Kategori */}
                                    <div className="flex h-10 shrink-0 items-center rounded-xl border border-zinc-200 bg-white px-3 dark:border-zinc-800 dark:bg-zinc-950">
                                        <select
                                            value={kategoriFilter}
                                            onChange={(e) => setKategoriFilter(e.target.value)}
                                            className="w-full bg-transparent text-xs font-medium text-zinc-700 outline-none dark:text-zinc-300 cursor-pointer"
                                        >
                                            <option value="all" className="dark:bg-zinc-900">Semua Kategori</option>
                                            {ALL_CATEGORIES.map((cat) => (
                                                <option key={cat} value={cat} className="dark:bg-zinc-900">
                                                    {cat}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-secondary-green-color border-t-transparent"></div>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Memuat data layanan...</p>
                                </div>
                            ) : paginatedLayanan.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-zinc-400 dark:text-zinc-500">
                                    <Database className="h-12 w-12 stroke-1 mb-2" />
                                    <p className="text-sm font-semibold">Tidak Ada Data</p>
                                    <p className="text-xs">Tidak ada layanan yang sesuai kriteria pencarian atau filter.</p>
                                </div>
                            ) : (
                                <table className="min-w-full divide-y divide-zinc-200/80 dark:divide-zinc-800">
                                    <thead className="bg-[var(--secondary-green-color)]">
                                        <tr>
                                            <th scope="col" className="px-6 py-4.5 text-left text-xs font-semibold text-[var(--foreground)] tracking-wider w-16">
                                                No
                                            </th>
                                            <th scope="col" className="px-6 py-4.5 text-left text-xs font-semibold text-[var(--foreground)] tracking-wider">
                                                Nama Layanan
                                            </th>
                                            <th scope="col" className="px-6 py-4.5 text-left text-xs font-semibold text-[var(--foreground)] tracking-wider">
                                                Kategori
                                            </th>
                                            <th scope="col" className="px-6 py-4.5 max-w-md text-left text-xs font-semibold text-[var(--foreground)] tracking-wider">
                                                Unit Teknis
                                            </th>
                                            <th scope="col" className="px-6 py-4.5 text-center text-xs font-semibold text-[var(--foreground)] tracking-wider w-36">
                                                Estimasi (SLA)
                                            </th>
                                            <th scope="col" className="px-6 py-4.5 text-center text-xs font-semibold text-[var(--foreground)] tracking-wider w-40">
                                                Permohonan Masuk
                                            </th>
                                            <th scope="col" className="px-6 py-4.5 text-center text-xs font-semibold text-[var(--foreground)] tracking-wider w-36">
                                                Status
                                            </th>
                                            <th scope="col" className="px-6 py-4.5 text-center text-xs font-semibold text-[var(--foreground)] tracking-wider w-36">
                                                Aksi
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 bg-white dark:bg-zinc-900">
                                        {paginatedLayanan.map((layanan, idx) => {
                                            const isToggling = togglingId === layanan.id;
                                            const kategori = getKategoriLayanan(layanan.slug, layanan.nama_layanan);
                                            return (
                                                <tr key={layanan.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 transition-colors">
                                                    <td className="px-6 py-5.5 whitespace-nowrap text-xs font-medium text-zinc-500 dark:text-zinc-400 text-left">
                                                        {startIndex + idx + 1}
                                                    </td>
                                                    <td className="px-6 py-5.5  text-xs text-[var(--foreground)] dark:text-zinc-100 font-semibold text-left">
                                                        <div>
                                                            <p className="font-semibold text-zinc-800 dark:text-zinc-200">
                                                                {layanan.nama_layanan}
                                                            </p>
                                                            <span className="text-[10px] font-normal text-zinc-400 dark:text-zinc-500">
                                                                /{layanan.slug}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5.5 whitespace-nowrap text-xs text-left">
                                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getKategoriBadge(kategori)}`}>
                                                            {kategori}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-5.5 max-w-md text-xs text-zinc-600 dark:text-zinc-400 text-left">
                                                        {layanan.unit_teknis?.nama || "-"}
                                                    </td>
                                                    <td className="px-6 py-5.5 whitespace-nowrap text-xs text-zinc-500 dark:text-zinc-400 text-center">
                                                        {layanan.sla_hari ? `${layanan.sla_hari} Hari Kerja` : "-"}
                                                    </td>
                                                    <td className="px-6 py-5.5 text-xs text-center">
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">

                                                            {loadingTikets ? "..." : (permohonanMap[layanan.id] || 0)}
                                                            <span className="font-normal text-[11px] text-zinc-400 dark:text-zinc-500">permohonan</span>
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-5.5 whitespace-nowrap text-xs text-center">
                                                        <button
                                                            disabled={isToggling}
                                                            onClick={() => handleToggleStatus(layanan)}
                                                            className="inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
                                                            title={layanan.is_active ? "Nonaktifkan Layanan (Sembunyikan dari Landing Page)" : "Aktifkan Layanan (Tampilkan di Landing Page)"}
                                                        >
                                                            <span
                                                                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${layanan.is_active
                                                                    ? "bg-[var(--green-color)]"
                                                                    : "bg-zinc-300 dark:bg-zinc-700"
                                                                    }`}
                                                            >
                                                                <span
                                                                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${layanan.is_active
                                                                        ? "translate-x-4"
                                                                        : "translate-x-0.5"
                                                                        }`}
                                                                />
                                                            </span>

                                                            <span
                                                                className={
                                                                    layanan.is_active
                                                                        ? "text-[var(--green-color)] font-medium"
                                                                        : "text-zinc-400 font-medium"
                                                                }
                                                            >
                                                                {layanan.is_active ? "Aktif" : "Nonaktif"}
                                                            </span>
                                                        </button>
                                                    </td>
                                                    <td className="px-6 py-5.5 whitespace-nowrap text-xs text-center">
                                                        <div className="flex items-center justify-center">
                                                            <button
                                                                onClick={() => handleEdit(layanan)}
                                                                className="inline-flex items-center justify-center rounded-lg bg-secondary-green-color p-2 text-green-color hover:bg-secondary-green-color/80 transition dark:bg-secondary-green-color/40 dark:text-secondary-green-color cursor-pointer"
                                                                title="Edit Layanan"
                                                            >
                                                                <Pencil className="h-4 w-4" />
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

                        {/* Pagination Footer */}
                        {!loading && filteredLayanan.length > 0 && (
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-zinc-200 px-2 pt-6 dark:border-zinc-800">
                                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                    Menampilkan{" "}
                                    <span className="font-medium text-zinc-900 dark:text-zinc-100">
                                        {startIndex + 1}
                                    </span>
                                    {" – "}
                                    <span className="font-medium text-zinc-900 dark:text-zinc-100">
                                        {endIndex}
                                    </span>{" "}
                                    dari{" "}
                                    <span className="font-medium text-zinc-900 dark:text-zinc-100">
                                        {filteredLayanan.length}
                                    </span>{" "}
                                    layanan
                                </p>

                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
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
                                        className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-zinc-800 cursor-pointer"
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
