"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/sidebar/Sidebar";
import AppBar from "@/components/appbar/AppBar";
import CardDashboard from "@/components/card/card-dashboard/CardDashboard";
import StatusLayananBadge from "@/components/badge/status-layanan/StatusLayananBadge";
import { getUserFromToken, logout, getRedirectPath } from "@/lib/auth";
import {
    CheckCircle2,
    LineChart as ChartIcon,
    FileText,
    Clock,
    Activity,
    ArrowRight,
    Droplet,
    Beaker,
    Briefcase,
    GraduationCap,
    BookOpen,
    Bed,
    ClipboardList,
    ChevronLeft,
    ChevronRight,
    Search
} from "lucide-react";
import Link from "next/link";

export default function DashboardAdminPage() {
    const router = useRouter();
    const [userNIP, setUserNIP] = useState("");
    const [userName, setUserName] = useState("");
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
    const [tempStatus, setTempStatus] = useState<string>("semua");
    const [selectedLayanan, setSelectedLayanan] = useState<string>("semua");
    const [tempLayanan, setTempLayanan] = useState<string>("semua");

    const totalItems = filteredTikets.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    const currentTikets = filteredTikets.slice(startIndex, startIndex + itemsPerPage);

    // Get unique list of services from tikets
    const listLayanan = Array.from(
        new Map(
            tikets
                .filter(t => t?.layanan)
                .map(t => [t.layanan.id, t.layanan.nama_layanan])
        ).entries()
    ).map(([id, nama]) => ({ id, nama }));

    // Filter tickets based on status, service, and search query
    useEffect(() => {
        let result = tikets;

        // Status filter
        if (selectedStatus !== "semua") {
            if (selectedStatus === "selesai") {
                result = result.filter(t =>
                    t.status === "selesai_diproses" ||
                    t.status === "menunggu_konfirmasi" ||
                    t.status === "ditolak" ||
                    t.status === "selesai"
                );
            } else if (selectedStatus === "diproses") {
                result = result.filter(t => t.status === "diproses");
            } else if (selectedStatus === "menunggu_verifikasi") {
                result = result.filter(t => t.status === "menunggu_verifikasi");
            } else if (selectedStatus === "ditolak") {
                result = result.filter(t => t.status === "ditolak");
            } else {
                result = result.filter(t => t.status === selectedStatus);
            }
        }

        // Service filter
        if (selectedLayanan !== "semua") {
            result = result.filter(t => t.layanan?.id === Number(selectedLayanan));
        }

        // Search query filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(t =>
                t.no_tiket.toLowerCase().includes(query) ||
                (t.layanan?.nama_layanan || "").toLowerCase().includes(query) ||
                (t.jawaban_form?.nama_lengkap || t.user?.nama || "").toLowerCase().includes(query)
            );
        }

        setFilteredTikets(result);
        setCurrentPage(1); // Reset to first page when filtering
    }, [tikets, selectedStatus, selectedLayanan, searchQuery]);

    // Fetch tickets on mount
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
                setTikets(Array.isArray(data) ? data : []);
            })
            .catch((err: any) => {
                setError(err.message || "Gagal mengambil data");
            })
            .finally(() => {
                setLoading(false);
            });
    }, [mounted]);

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
                if (user.role !== "admin") {
                    router.push(getRedirectPath(user.role));
                    return;
                }
                if (user.nama) {
                    setUserName(user.nama);
                } else if (storedEmail) {
                    setUserName(storedEmail.split("@")[0]);
                }
            }
        }
    }, [router]);

    const handleLogout = () => {
        logout(router);
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
            {/* Sidebar for Desktop */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex flex-col flex-1 overflow-y-auto">
                {/* Top Navbar */}
                <AppBar onMenuClick={() => setSidebarOpen(true)} />

                {/* Content Container */}
                <main className="flex-1 p-8 space-y-6">
                    {/* Welcome Banner */}
                    <div className="relative overflow-hidden space-y-2">
                        <h1 className="text-2xl font-semibold md:text-3xl text-[var(--foreground)]">
                            Dashboard Analitik, <span className="capitalize">{userName}</span>!
                        </h1>
                        <p className="text-[var(--foreground)]">Selamat datang kembali, Administrator. Pantau performa layanan BRMP secara real-time.</p>
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
                                apiEndpoint="/tiket/admin"
                                processData={(data) => Array.isArray(data) ? data.length : 0}
                                desc="permohonan"
                            />
                            <CardDashboard
                                title="Menunggu Verifikasi"
                                icon={Clock}
                                iconBgClass="bg-amber-400 dark:bg-amber-700"
                                iconColorClass="text-white"
                                apiEndpoint="/tiket/admin?status=menunggu_verifikasi"
                                processData={(data) => Array.isArray(data) ? data.length : 0}
                                desc="tiket"
                            />
                            <CardDashboard
                                title="Sedang Diproses"
                                icon={Activity}
                                iconBgClass="bg-blue-400 dark:bg-blue-700"
                                iconColorClass="text-white"
                                apiEndpoint="/tiket/admin?status=diproses"
                                processData={(data) => Array.isArray(data) ? data.length : 0}
                                desc="tiket"
                            />
                            <CardDashboard
                                title="Selesai Diproses"
                                icon={CheckCircle2}
                                iconBgClass="bg-emerald-400 dark:bg-emerald-750"
                                iconColorClass="text-white"
                                apiEndpoint="/tiket/admin?status=selesai_diproses"
                                processData={(data) => Array.isArray(data) ? data.length : 0}
                                desc="tiket"
                            />
                        </div>
                    </div>

                    <div className="bg-white shadow-md rounded-lg dark:bg-zinc-800 dark:shadow-zinc-800">
                        <div className="flex justify-between items-center px-6 py-4">
                            <p className="text-[var(--foreground)] dark:text-white font-semibold text-lg">Daftar Permohonan</p>
                        </div>

                        {/* Filter Dropdown & Search Bar */}
                        <div className="px-4 pb-4">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white">
                                <div className="relative w-full">
                                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                                    <input
                                        type="text"
                                        placeholder="Cari nomor tiket, layanan..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2 text-xs border border-zinc-200 rounded-lg focus:outline-hidden focus:border-emerald-500 bg-zinc-50 dark:bg-zinc-950 dark:border-zinc-800"
                                    />
                                </div>
                                <div className="flex flex-col md:flex-row items-center gap-2 w-full md:w-auto">
                                    <select
                                        value={tempStatus}
                                        onChange={(e) => setTempStatus(e.target.value)}
                                        className="w-full md:w-40 p-2 text-xs border border-zinc-200 rounded-lg focus:outline-hidden focus:border-emerald-500 bg-zinc-50 dark:bg-zinc-950 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 cursor-pointer"
                                    >
                                        <option value="semua">Semua Status</option>
                                        <option value="menunggu_verifikasi">Menunggu Verifikasi</option>
                                        <option value="menunggu_pembayaran">Menunggu Pembayaran</option>
                                        <option value="ditolak">Ditolak</option>
                                        <option value="diproses">Perlu Diproses</option>
                                        <option value="selesai">Selesai</option>
                                    </select>
                                    <select
                                        value={tempLayanan}
                                        onChange={(e) => setTempLayanan(e.target.value)}
                                        className="w-full md:w-48 p-2 text-xs border border-zinc-200 rounded-lg focus:outline-hidden focus:border-emerald-500 bg-zinc-50 dark:bg-zinc-950 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 cursor-pointer"
                                    >
                                        <option value="semua">Semua Layanan</option>
                                        {listLayanan.map((layanan) => (
                                            <option key={layanan.id} value={layanan.id}>
                                                {layanan.nama}
                                            </option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={() => {
                                            setSelectedStatus(tempStatus);
                                            setSelectedLayanan(tempLayanan);
                                        }}
                                        className="px-4 py-2 text-xs font-semibold text-white bg-[var(--green-color)] hover:bg-emerald-700 rounded-lg transition-all shadow-xs cursor-pointer flex-shrink-0"
                                    >
                                        Terapkan
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div>
                            <div className="overflow-hidden border border-zinc-200/80 bg-white shadow-md dark:border-zinc-800 dark:bg-zinc-900">
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-zinc-200/80 dark:divide-zinc-800">
                                        <thead className="bg-[#E5E7EB]/50 dark:bg-zinc-950">
                                            <tr>
                                                <th scope="col" className="px-6 py-4.5 text-left text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider">
                                                    Nama Pemohon
                                                </th>
                                                <th scope="col" className="px-6 py-4.5 text-left text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider">
                                                    Jenis Layanan
                                                </th>
                                                <th scope="col" className="px-6 py-4.5 text-center text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider">
                                                    Tanggal
                                                </th>
                                                <th scope="col" className="px-6 py-4.5 text-center text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider">
                                                    Status
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 bg-white dark:bg-zinc-900">
                                            {loading ? (
                                                <tr>
                                                    <td colSpan={4} className="px-6 py-10 text-center text-sm text-zinc-450 dark:text-zinc-550">
                                                        Memuat riwayat permohonan...
                                                    </td>
                                                </tr>
                                            ) : error ? (
                                                <tr>
                                                    <td colSpan={4} className="px-6 py-10 text-center text-sm text-red-500 font-medium">
                                                        {error}
                                                    </td>
                                                </tr>
                                            ) : tikets.length === 0 ? (
                                                <tr>
                                                    <td colSpan={4} className="px-6 py-10 text-center text-sm text-zinc-450 dark:text-zinc-550">
                                                        Belum ada riwayat permohonan layanan.
                                                    </td>
                                                </tr>
                                            ) : (
                                                currentTikets.map((tiket) => {
                                                    const { icon: IconComponent, iconBg } = getServiceMeta(tiket.layanan.id);
                                                    return (
                                                        <tr key={tiket.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 transition-colors">
                                                            <td className="px-6 py-5.5 whitespace-nowrap text-sm text-[var(--foreground)] dark:text-zinc-100 font-base">
                                                                {tiket.jawaban_form?.nama_lengkap || tiket.user?.nama || "-"}
                                                            </td>
                                                            <td className="px-6 py-5.5 whitespace-nowrap text-sm text-[var(--foreground)] dark:text-zinc-100 font-base">
                                                                <div className="flex items-center gap-3">
                                                                    {tiket.layanan.nama_layanan}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-5.5 whitespace-nowrap text-center text-sm text-[var(--foreground)] dark:text-zinc-400 font-base">
                                                                {formatDate(tiket.createdAt)}
                                                            </td>
                                                            <td className="px-6 py-5.5 whitespace-nowrap text-sm">
                                                                <div className="flex justify-center">
                                                                    <StatusLayananBadge status={tiket.status} />
                                                                </div>
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
                                                            ? "bg-[var(--green-color)] text-white dark:bg-emerald-600"
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
