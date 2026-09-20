"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/sidebar/Sidebar";
import AppBar from "@/components/appbar/AppBar";
import { getUserFromToken, logout, getRedirectPath } from "@/lib/auth";
import { getApiUrl } from "@/lib/api";
import {
    LayoutDashboard,
    LogOut,
    Settings,
    Menu,
    X,
    ChevronRight,
    AlertCircle,
    CheckCircle2,
    LineChart as ChartIcon,
    FileText,
    Clock,
    Activity,
    Gauge,
    Search,
    ChevronLeft,
    ArrowUpDown,
    Inbox,
    Briefcase,
    GraduationCap,
    Droplet,
    Beaker,
    BookOpen,
    Bed,
    ClipboardList,
} from "lucide-react";
import CardDashboard from "@/components/card/card-dashboard/CardDashboard";
import StatusLayananBadge from "@/components/badge/status-layanan/StatusLayananBadge";

export default function DashboardKepalaBalaiPage() {
    const router = useRouter();
    const [userNIP, setUserNIP] = useState("");
    const [userRole, setUserRole] = useState("Kepala Balai");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("ringkasan");
    const [mounted, setMounted] = useState(false);
    const [tikets, setTikets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const [filteredTikets, setFilteredTikets] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedStatus, setSelectedStatus] = useState<string>("semua");
    const [sortOrder, setSortOrder] = useState<"terbaru" | "terlama">("terbaru");

    // Filter tickets based on status, search query, and sortOrder
    useEffect(() => {
        let result = [...tikets];

        if (selectedStatus !== "semua") {
            if (selectedStatus === "menunggu_persetujuan_kepala_balai") {
                result = result.filter((t) => t.status === "menunggu_persetujuan_kepala_balai");
            } else if (selectedStatus === "diproses") {
                result = result.filter((t) => ["diproses", "menunggu_pembayaran"].includes(t.status));
            } else if (selectedStatus === "selesai") {
                result = result.filter((t) => ["menunggu_konfirmasi", "selesai"].includes(t.status));
            } else {
                result = result.filter((t) => t.status === selectedStatus);
            }
        }

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(
                (t) =>
                    (t.no_tiket || "").toLowerCase().includes(query) ||
                    (t.layanan?.nama_layanan || "").toLowerCase().includes(query) ||
                    (t.jawaban_form?.nama_lengkap || t.user?.nama || "").toLowerCase().includes(query)
            );
        }

        result.sort((a, b) => {
            const timeA = new Date(a.tanggal_submit || a.createdAt).getTime();
            const timeB = new Date(b.tanggal_submit || b.createdAt).getTime();
            return sortOrder === "terbaru" ? timeB - timeA : timeA - timeB;
        });

        setFilteredTikets(result);
        setCurrentPage(1);
    }, [tikets, selectedStatus, searchQuery, sortOrder]);

    const countSemua = tikets.length;
    const countMenunggu = tikets.filter((t) => t.status === "menunggu_persetujuan_kepala_balai").length;
    const countDiproses = tikets.filter((t) => ["diproses", "menunggu_pembayaran"].includes(t.status)).length;
    const countSelesai = tikets.filter((t) => ["menunggu_konfirmasi", "selesai"].includes(t.status)).length;

    const totalItems = filteredTikets.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    const currentTikets = filteredTikets.slice(startIndex, endIndex);

    // Authenticate mockup on client side
    useEffect(() => {
        setMounted(true);
        const token = localStorage.getItem("agro_token");
        const storedEmail = localStorage.getItem("agro_user_email");

        if (!token) {
            router.push("/login/pegawai");
        } else {
            if (storedEmail) {
                setUserNIP(storedEmail);
            }
            const user = getUserFromToken();
            if (user) {
                if (user.role !== "kepala_balai") {
                    router.push(getRedirectPath(user.role));
                    return;
                }
                if (user.role) {
                    const roleMapping: Record<string, string> = {
                        super_admin: "Super Admin",
                        admin: "Admin",
                        kepala_balai: "Kepala Balai",
                        pegawai: "Pegawai Unit Teknis",
                    };
                    setUserRole(roleMapping[user.role] || user.role);
                }
            }
        }
    }, [router]);

    // Fetch tickets on mount
    useEffect(() => {
        if (!mounted) return;
        const token = localStorage.getItem("agro_token");
        if (!token) return;

        setLoading(true);
        fetch(`${getApiUrl()}/tiket/kepala-balai`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then((res) => {
                if (!res.ok) throw new Error("Gagal mengambil data permohonan");
                return res.json();
            })
            .then((data) => {
                setTikets(Array.isArray(data) ? data : []);
            })
            .catch((err: any) => {
                setError(err.message || "Gagal mengambil data");
            })
            .finally(() => {
                setLoading(false);
            });
    }, [mounted]);

    const handleLogout = () => {
        logout(router);
    };

    if (!mounted) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-secondary-green-color border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 overflow-hidden font-sans">
            {/* Sidebar for Desktop */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex flex-col flex-1 overflow-y-auto">
                {/* Top Navbar */}
                <AppBar onMenuClick={() => setSidebarOpen(true)} />

                {/* Content Container */}
                <main className="flex-1 p-8 space-y-6">
                    {/* Welcome Banner */}
                    <div className="relative overflow-hidden rounded-2xl p-4 md:p-8 text-white shadow-lg bg-cover bg-center min-h-[160px] flex flex-col justify-center"
                        style={{ backgroundImage: "url('/images/kantor.webp')" }}>
                        {/* Overlay with green-color gradient */}
                        <div
                            className="absolute inset-0 z-0"
                            style={{
                                background: "linear-gradient(to right, var(--green-color) 5%, rgba(36, 78, 43, 0.8) 30%, rgba(36, 78, 43, 0.4) 90%)"
                            }}
                        />

                        <div className="relative z-10 space-y-3 max-w-5xl">
                            <h2 className="text-2xl md:text-4xl font-bold tracking-tight leading-tight">
                                Selamat Datang Kembali <span className="capitalize text-[var(--yellow-color)]">{userRole} !</span>

                            </h2>
                            <p className="text-sm md:text-base text-zinc-100/90 leading-relaxed">
                                Pantau performa layanan dan kelola aktivitas pengguna hari ini.
                            </p>
                        </div>
                    </div>

                    {/* Statistik Permohonan Layanan */}
                    <div className="space-y-3">
                        {/* <h2 className="text-lg font-bold text-zinc-700 dark:text-zinc-300">
                                                Statistik Permohonan Layanan
                                            </h2> */}
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <CardDashboard
                                title="Total Permohonan"
                                icon={FileText}
                                iconBgClass="bg-[#385A3F]"
                                iconColorClass="text-white"
                                apiEndpoint="/tiket/kepala-balai"
                                processData={(data) => Array.isArray(data) ? data.length : 0}
                                desc="permohonan"
                            />
                            <CardDashboard
                                title="Menunggu Persetujuan"
                                icon={Clock}
                                iconBgClass="bg-amber-400 dark:bg-amber-700"
                                iconColorClass="text-white"
                                apiEndpoint="/tiket/kepala-balai?status=menunggu_persetujuan_kepala_balai"
                                processData={(data) => Array.isArray(data) ? data.length : 0}
                                desc="permohonan"
                            />
                            <CardDashboard
                                title="Sedang Diproses"
                                icon={Activity}
                                iconBgClass="bg-blue-400 dark:bg-blue-700"
                                iconColorClass="text-white"
                                apiEndpoint="/tiket/kepala-balai?status=diproses"
                                processData={(data) => Array.isArray(data) ? data.length : 0}
                                desc="permohonan"
                            />
                            <CardDashboard
                                title="Selesai"
                                icon={CheckCircle2}
                                iconBgClass="bg-violet-600 dark:bg-bg-violet-700"
                                iconColorClass="text-white"
                                apiEndpoint="/tiket/kepala-balai?status=selesai"
                                processData={(data) => Array.isArray(data) ? data.length : 0}
                                desc="permohonan"
                            />
                        </div>
                    </div>

                    <div className="rounded-2xl p-4 sm:p-6 md:p-8 border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
                        {/* Filter Section seperti kelola-pegawai */}
                        <div className="mb-6 flex flex-col gap-4">
                            <div className="flex justify-between items-center">
                                <h2 className="text-lg sm:text-xl font-semibold text-[var(--foreground)] dark:text-zinc-50">
                                    Daftar Permohonan
                                </h2>
                            </div>
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                {/* Status Filter Tabs */}
                                <div className="w-full lg:w-auto overflow-x-auto pb-1 -mb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                                    <div className="inline-flex min-w-full sm:min-w-0 items-center rounded-xl bg-secondary-green-color p-1.5 dark:border-zinc-700 dark:bg-zinc-800 gap-1">
                                        {[
                                            { label: "Semua", value: "semua", count: countSemua },
                                            { label: "Perlu Persetujuan", value: "menunggu_persetujuan_kepala_balai", count: countMenunggu },
                                            { label: "Diproses", value: "diproses", count: countDiproses },
                                            { label: "Selesai", value: "selesai", count: countSelesai },
                                        ].map((item) => (
                                            <button
                                                key={item.value}
                                                onClick={() => {
                                                    setSelectedStatus(item.value);
                                                    setCurrentPage(1);
                                                }}
                                                className={`whitespace-nowrap shrink-0 rounded-lg px-3 py-2 text-xs font-medium transition cursor-pointer ${selectedStatus === item.value
                                                    ? "bg-white text-[var(--green-color)] shadow-sm dark:bg-zinc-900 font-semibold"
                                                    : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400"
                                                    }`}
                                            >
                                                {item.label}
                                                <span className="ml-1.5 text-[10px]">({item.count})</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Search dan Sort */}
                                <div className="flex items-center gap-2 w-full lg:w-auto">
                                    <div className="relative flex-1 sm:w-64">
                                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                                        <input
                                            type="text"
                                            placeholder="Cari nomor tiket, layanan, pemohon..."
                                            value={searchQuery}
                                            onChange={(e) => {
                                                setSearchQuery(e.target.value);
                                                setCurrentPage(1);
                                            }}
                                            className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 pl-10 pr-4 text-xs outline-none transition focus:border-[var(--green-color)] focus:ring-2 focus:ring-[var(--green-color)]/10 dark:border-zinc-700 dark:bg-zinc-900"
                                        />
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSortOrder((prev) => (prev === "terbaru" ? "terlama" : "terbaru"));
                                            setCurrentPage(1);
                                        }}
                                        className="inline-flex shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-white p-2.5 text-zinc-600 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 cursor-pointer"
                                        title={sortOrder === "terbaru" ? "Urutkan dari terlama" : "Urutkan dari terbaru"}
                                    >
                                        <ArrowUpDown className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Table */}
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
                            ) : currentTikets.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-zinc-400 dark:text-zinc-500">
                                    <Inbox className="h-12 w-12 stroke-1 mb-2" />
                                    <p className="text-sm font-semibold">Tidak Ada Data</p>
                                    <p className="text-xs">Belum ada riwayat permohonan untuk filter ini.</p>
                                </div>
                            ) : (
                                <table className="min-w-full divide-y divide-zinc-200/80 dark:divide-zinc-800">
                                    <thead className="bg-[var(--secondary-green-color)]">
                                        <tr>
                                            <th scope="col" className="px-6 py-4.5 text-center text-xs font-semibold text-[var(--foreground)] tracking-wider w-16">
                                                No
                                            </th>
                                            <th scope="col" className="px-6 py-4.5 text-left text-xs font-semibold text-[var(--foreground)] tracking-wider">
                                                No. Tiket
                                            </th>
                                            <th scope="col" className="px-6 py-4.5 text-left text-xs font-semibold text-[var(--foreground)] tracking-wider">
                                                Nama Pemohon
                                            </th>
                                            <th scope="col" className="px-6 py-4.5 text-left text-xs font-semibold text-[var(--foreground)] tracking-wider">
                                                Jenis Layanan
                                            </th>
                                            <th scope="col" className="px-6 py-4.5 text-center text-xs font-semibold text-[var(--foreground)] tracking-wider">
                                                Tanggal
                                            </th>
                                            <th scope="col" className="px-6 py-4.5 text-center text-xs font-semibold text-[var(--foreground)] tracking-wider">
                                                Status
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 bg-white dark:bg-zinc-900">
                                        {currentTikets.map((tiket, index) => {
                                            const { icon: IconComponent, iconBg } = getServiceMeta(tiket.layanan?.id || 0);
                                            const detailUrl = `/persetujuan-layanan/${tiket.layanan?.slug || "layanan"}/${tiket.no_tiket}`;
                                            return (
                                                <tr
                                                    key={tiket.id}
                                                    onClick={() => router.push(detailUrl)}
                                                    className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors"
                                                >
                                                    <td className="px-6 py-5.5 whitespace-nowrap text-xs text-center text-zinc-500 dark:text-zinc-400 font-medium">
                                                        {startIndex + index + 1}
                                                    </td>
                                                    <td className="px-6 py-5.5 whitespace-nowrap text-xs font-bold text-[#2C5E3B] dark:text-secondary-green-color text-left">
                                                        {tiket.no_tiket}
                                                    </td>
                                                    <td className="px-6 py-5.5 whitespace-nowrap text-xs text-[var(--foreground)] dark:text-zinc-100 font-base text-left">
                                                        {tiket.jawaban_form?.nama_lengkap || tiket.user?.nama || "-"}
                                                    </td>
                                                    <td className="px-6 py-5.5 whitespace-nowrap text-xs text-[var(--foreground)] dark:text-zinc-100 font-base text-left">
                                                        <div className="flex items-center gap-2.5">
                                                            <div className={`p-1.5 rounded-lg ${iconBg}`}>
                                                                <IconComponent className="h-3.5 w-3.5" />
                                                            </div>
                                                            <span>{tiket.layanan?.nama_layanan || "-"}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5.5 whitespace-nowrap text-center text-xs text-[var(--foreground)] dark:text-zinc-400 font-base">
                                                        {formatDate(tiket.tanggal_submit || tiket.createdAt)}
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

                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            )}

                            {/* Pagination seperti kelola-pegawai */}
                            {!loading && filteredTikets.length > 0 && (
                                <div className="flex items-center justify-between border-t border-zinc-200 px-2 pt-5 dark:border-zinc-800">
                                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                        Menampilkan{" "}
                                        <span className="font-medium text-zinc-900 dark:text-zinc-100">
                                            {filteredTikets.length === 0 ? 0 : startIndex + 1}
                                        </span>
                                        –
                                        <span className="font-medium text-zinc-900 dark:text-zinc-100">
                                            {endIndex}
                                        </span>{" "}
                                        dari{" "}
                                        <span className="font-medium text-zinc-900 dark:text-zinc-100">
                                            {totalItems}
                                        </span>{" "}
                                        tiket
                                    </p>

                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                            disabled={currentPage === 1}
                                            className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-zinc-800 cursor-pointer"
                                        >
                                            ‹
                                        </button>

                                        {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                                            <button
                                                key={page}
                                                onClick={() => setCurrentPage(page)}
                                                className={`flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-sm font-medium transition cursor-pointer ${currentPage === page
                                                    ? "bg-[var(--green-color)] text-white"
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
                                            ›
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>


                </main>
            </div>
        </div>
    );
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
