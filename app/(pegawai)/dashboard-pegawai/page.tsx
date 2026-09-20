"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/sidebar/Sidebar";
import AppBar from "@/components/appbar/AppBar";
import { getUserFromToken, logout, getRedirectPath } from "@/lib/auth";
import { getUnitTeknisTikets } from "@/lib/tiket";
import StatusLayananBadge from "@/components/badge/status-layanan/StatusLayananBadge";
import {
    LayoutDashboard,
    Cloud,
    Sun,
    Droplets,
    Thermometer,
    Wind,
    Sprout,
    Calendar,
    Search,
    Bell,
    LogOut,
    FileText,
    Settings,
    Menu,
    X,
    ChevronLeft,
    ChevronRight,
    AlertCircle,
    CheckCircle2,
    Gauge,
    LineChart as ChartIcon,
    Bed,
    Briefcase,
    ShieldCheck,
    Clock,
    Activity,
    ArrowUpDown,
    Inbox
} from "lucide-react";
import CardDashboard from "@/components/card/card-dashboard/CardDashboard";

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

export default function DashboardPegawaiPage() {
    const router = useRouter();
    const [userNIP, setUserNIP] = useState("");
    const [userName, setUserName] = useState("");
    const [userRole, setUserRole] = useState("Pegawai Unit Teknis");
    const [unitTeknisId, setUnitTeknisId] = useState<number | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("ringkasan");
    const [mounted, setMounted] = useState(false);

    const [tikets, setTikets] = useState<any[]>([]);
    const [filteredTikets, setFilteredTikets] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedStatus, setSelectedStatus] = useState<string>("semua");
    const [sortOrder, setSortOrder] = useState<"terbaru" | "terlama">("terbaru");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    useEffect(() => {
        let result = [...tikets];

        if (selectedStatus !== "semua") {
            if (selectedStatus === "selesai") {
                result = result.filter(
                    (t) => t.status === "menunggu_konfirmasi" || t.status === "selesai"
                );
            } else if (selectedStatus === "diproses") {
                result = result.filter((t) => t.status === "diproses" || t.status === "dipinjam");
            } else if (selectedStatus === "menunggu_pembayaran") {
                result = result.filter((t) => t.status === "menunggu_pembayaran");
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
    const countDiproses = tikets.filter((t) => t.status === "diproses" || t.status === "dipinjam").length;
    const countMenungguBayar = tikets.filter((t) => t.status === "menunggu_pembayaran").length;
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
                if (user.role !== "pegawai") {
                    router.push(getRedirectPath(user.role));
                    return;
                }
                if (user.nama) {
                    setUserName(user.nama);
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
                if (user.unit_teknis_id !== undefined) {
                    setUnitTeknisId(user.unit_teknis_id);
                }
            }
        }
    }, [router]);

    useEffect(() => {
        if (!mounted) return;
        const token = localStorage.getItem("agro_token");
        if (!token) return;

        setLoading(true);
        getUnitTeknisTikets()
            .then((data) => {
                const validData = Array.isArray(data)
                    ? data.filter((t: any) => t.status !== "menunggu_persetujuan_kepala_balai")
                    : [];
                setTikets(validData);
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

    const getUnitTeknisName = (id: number | null) => {
        switch (id) {
            case 1: return "Tim Teknis Agroklimat / Hidrologi";
            case 2: return "Koordinator Laboratorium";
            case 3: return "Tim Kerja Layanan dan Pendayagunaan Hasil";
            case 4: return "Tim Siap Tanam";
            case 5: return "Petugas Mess";
            default: return "Unit Teknis Umum";
        }
    };

    const getUnitTeknisCards = (id: number | null) => {
        switch (id) {
            case 1: // Agroklimat / Hidrologi
                return [
                    {
                        title: "Suhu Udara Rata-Rata",
                        value: "28.4°C",
                        status: "Optimal",
                        icon: Thermometer,
                        desc: "Temperatur stasiun meteorologi",
                    },
                    {
                        title: "Kelembaban Udara",
                        value: "72.5%",
                        status: "Normal",
                        icon: Droplets,
                        desc: "Tingkat uap air stabil",
                    },
                    {
                        title: "Curah Hujan Harian",
                        value: "12.4 mm",
                        status: "Rendah",
                        icon: Cloud,
                        desc: "Hujan ringan terpantau",
                    },
                    {
                        title: "Kecepatan Angin",
                        value: "14.2 km/h",
                        status: "Stabil",
                        icon: Wind,
                        desc: "Arah barat daya",
                    }
                ];
            case 2: // Koordinator Laboratorium
                return [
                    {
                        title: "Alat Dipinjam",
                        value: "8 Unit",
                        status: "Aktif",
                        icon: Settings,
                        desc: "Peminjaman oleh peneliti/publik",
                    },
                    {
                        title: "Alat Siap Kalibrasi",
                        value: "3 Unit",
                        status: "Jadwal",
                        icon: Gauge,
                        desc: "Pengecekan rutin lab",
                    },
                    {
                        title: "Suhu Lab Utama",
                        value: "22.1°C",
                        status: "Optimal",
                        icon: Thermometer,
                        desc: "Suhu AC terjaga konstan",
                    },
                    {
                        title: "Total Stok Alat",
                        value: "45 Unit",
                        status: "Tersedia",
                        icon: Sprout,
                        desc: "Tercatat di inventaris lab",
                    }
                ];
            case 3: // Tim Kerja Layanan & Pendayagunaan Hasil
                return [
                    {
                        title: "Tiket Layanan Baru",
                        value: "12 Tiket",
                        status: "Menunggu",
                        icon: Calendar,
                        desc: "Perlu konfirmasi & verifikasi",
                    },
                    {
                        title: "Rata-rata SLA",
                        value: "94.2%",
                        status: "Tepat Waktu",
                        icon: ChartIcon,
                        desc: "Penyelesaian tiket tepat waktu",
                    },
                    {
                        title: "Kepuasan Layanan",
                        value: "4.8 / 5.0",
                        status: "Sangat Baik",
                        icon: CheckCircle2,
                        desc: "Berdasarkan ulasan publik",
                    },
                    {
                        title: "Layanan Aktif",
                        value: "8 Jenis",
                        status: "Tersedia",
                        icon: Briefcase,
                        desc: "Layanan yang tayang di sistem",
                    }
                ];
            case 4: // Tim Siap Tanam
                return [
                    {
                        title: "Kelembaban Lahan",
                        value: "64.8%",
                        status: "Optimal",
                        icon: Droplets,
                        desc: "Kandungan air tanah mencukupi",
                    },
                    {
                        title: "Status Siap Tanam",
                        value: "Siap Tanam",
                        status: "Sangat Cocok",
                        icon: Sprout,
                        desc: "Kondisi tanah ideal untuk pembenihan",
                    },
                    {
                        title: "Rekomendasi Pemupukan",
                        value: "Terjadwal",
                        status: "Aman",
                        icon: Calendar,
                        desc: "Rekomendasi NPK pukul 15:00",
                    },
                    {
                        title: "Kadar pH Tanah",
                        value: "6.5 pH",
                        status: "Netral",
                        icon: Gauge,
                        desc: "Kondisi asam-basa optimal",
                    }
                ];
            case 5: // Petugas Mess
                return [
                    {
                        title: "Mess Terisi",
                        value: "14 Kamar",
                        status: "Terisi",
                        icon: Bed,
                        desc: "Kamar dihuni oleh tamu",
                    },
                    {
                        title: "Mess Kosong",
                        value: "6 Kamar",
                        status: "Tersedia",
                        icon: CheckCircle2,
                        desc: "Siap untuk reservasi baru",
                    },
                    {
                        title: "Reservasi Masuk",
                        value: "3 Pengajuan",
                        status: "Pending",
                        icon: Calendar,
                        desc: "Menunggu pembayaran/konfirmasi",
                    },
                    {
                        title: "Kebersihan Kamar",
                        value: "100%",
                        status: "Bersih",
                        icon: ShieldCheck,
                        desc: "Pemeriksaan harian selesai",
                    }
                ];
            default:
                return [
                    {
                        title: "Selamat Datang",
                        value: "100%",
                        status: "Aktif",
                        icon: Sprout,
                        desc: "Silakan hubungi administrator jika unit salah",
                    }
                ];
        }
    };

    const getUnitTeknisServices = (id: number | null) => {
        switch (id) {
            case 1:
                return [
                    { id: 14, slug: "rekomendasi-sni", name: "Rekomendasi & Penilaian Kesesuaian SNI", type: "gratis" },
                    { id: 15, slug: "konsultasi-rekomendasi", name: "Konsultasi Rekomendasi & Penilaian Kesesuaian SNI", type: "gratis" },
                    { id: 18, slug: "permohonan-data", name: "Permohonan Data", type: "gratis" }
                ];
            case 2:
                return [
                    { id: 19, slug: "peminjaman-alat", name: "Peminjaman Alat", type: "berbayar" }
                ];
            case 3:
                return [
                    { id: 17, slug: "bimbingan-teknis", name: "Bimbingan Teknis & Narasumber", type: "gratis" },
                    { id: 20, slug: "magang-pkl", name: "Magang Teknis / PKL", type: "gratis" },
                    { id: 21, slug: "agroedukasi", name: "Agroedukasi / Kunjungan Edukasi", type: "gratis" },
                    { id: 22, slug: "layanan-perpustakaan", name: "Layanan Perpustakaan", type: "gratis" }
                ];
            case 4:
                return [
                    { id: 16, slug: "rekomendasi-siap-tanam", name: "Rekomendasi Siap Tanam", type: "gratis" }
                ];
            case 5:
                return [
                    { id: 23, slug: "layanan-mess", name: "Layanan Mess", type: "berbayar" }
                ];
            default:
                return [];
        }
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
                            <h2 className="text-xl md:text-4xl font-bold tracking-tight leading-tight">
                                Selamat Datang Kembali <span className="capitalize text-[var(--yellow-color)]">{userName || userRole} !</span>
                            </h2>
                            <p className="text-xs md:text-base text-zinc-100/90 leading-relaxed">
                                Dashboard Pegawai <span className="font-bold text-[var(--yellow-color)]">{getUnitTeknisName(unitTeknisId)}</span>
                            </p>
                        </div>
                    </div>
                    {/* Statistik Permohonan Layanan */}
                    <div className="space-y-3">
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <CardDashboard
                                title="Total Permohonan"
                                icon={FileText}
                                iconBgClass="bg-[#385A3F]"
                                iconColorClass="text-white"
                                apiEndpoint="/tiket/unit-teknis/me"
                                processData={(data) => Array.isArray(data) ? data.length : 0}
                                desc="permohonan"
                            />
                            <CardDashboard
                                title="Perlu Diproses"
                                icon={Activity}
                                iconBgClass="bg-blue-400 dark:bg-blue-700"
                                iconColorClass="text-white"
                                apiEndpoint="/tiket/unit-teknis/me"
                                processData={(data) => Array.isArray(data) ? data.filter((t: any) => t.status === "diproses").length : 0}
                                desc="tiket"
                            />
                            <CardDashboard
                                title="Menunggu Pembayaran"
                                icon={Clock}
                                iconBgClass="bg-amber-400 dark:bg-amber-700"
                                iconColorClass="text-white"
                                apiEndpoint="/tiket/unit-teknis/me"
                                processData={(data) => Array.isArray(data) ? data.filter((t: any) => t.status === "menunggu_pembayaran").length : 0}
                                desc="tiket"
                            />
                            <CardDashboard
                                title="Selesai"
                                icon={CheckCircle2}
                                iconBgClass="bg-violet-600 dark:bg-violet-700"
                                iconColorClass="text-white"
                                apiEndpoint="/tiket/unit-teknis/me"
                                processData={(data) => Array.isArray(data) ? data.filter((t: any) => t.status === "menunggu_konfirmasi" || t.status === "selesai").length : 0}
                                desc="tiket"
                            />
                        </div>
                    </div>
                    {/* Services List Card */}
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-secondary-green-color rounded-2xl border border-foreground/20 p-6 shadow-sm dark:bg-zinc-900 dark:border-zinc-800 text-left">
                        <div className="flex gap-4">
                            <div className="hidden md:flex h-10 w-10 items-center justify-center rounded-full bg-green-color text-white dark:bg-secondary-green-color dark:text-secondary-green-color">
                                <Sprout className="h-5 w-5" />
                            </div>
                            <div className="items-center gap-2">
                                <h3 className="text-md font-semibold text-zinc-900 dark:text-white">
                                    Layanan yang Dikelola
                                </h3>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                    Berikut adalah layanan yang menjadi tanggung jawab unit anda.
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-wrap max-w-md items-center gap-3 justify-start md:justify-end">
                            {getUnitTeknisServices(unitTeknisId).length > 0 ? (
                                getUnitTeknisServices(unitTeknisId).map((svc) => (
                                    <div
                                        key={svc.id}
                                        onClick={() => router.push(`/penugasan-layanan/${svc.slug}`)}
                                        className="flex items-center justify-between px-3 py-2 rounded-full bg-white border border-zinc-100 hover:border-secondary-green-color/30 hover:bg-secondary-green-color/10 transition dark:border-zinc-800 dark:hover:bg-secondary-green-color/10 cursor-pointer"
                                    >
                                        <div className="flex flex-row items-center gap-3">

                                            <div className="flex flex-col ">
                                                <h4 className="font-semibold text-green-color dark:text-white text-[10px] md:text-xs">
                                                    {svc.name}
                                                </h4>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                    Tidak ada layanan spesifik yang terdaftar untuk unit Anda.
                                </p>
                            )}
                        </div>
                    </div>
                    {/* Daftar Permohonan Masuk Card */}
                    <div className="rounded-2xl p-4 sm:p-6 md:p-8 border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
                        {/* Filter Section seperti kelola-pegawai */}
                        <div className="mb-6 flex flex-col gap-4">
                            <div className="flex justify-between items-center">
                                <h2 className="text-lg sm:text-xl font-semibold text-[var(--foreground)] dark:text-zinc-50">
                                    Daftar Permohonan Masuk
                                </h2>
                            </div>
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                {/* Status Filter Tabs */}
                                <div className="w-full lg:w-auto overflow-x-auto pb-1 -mb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                                    <div className="inline-flex min-w-full sm:min-w-0 items-center rounded-xl bg-secondary-green-color p-1.5 dark:border-zinc-700 dark:bg-zinc-800 gap-1">
                                        {[
                                            { label: "Semua", value: "semua", count: countSemua },
                                            { label: "Perlu Diproses", value: "diproses", count: countDiproses },
                                            { label: "Menunggu Pembayaran", value: "menunggu_pembayaran", count: countMenungguBayar },
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
                                            const detailUrl = `/penugasan-layanan/${tiket.layanan?.slug || "layanan"}/${tiket.no_tiket}`;
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
                                                        {tiket.layanan?.nama_layanan || "-"}
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
            </div >
        </div >
    );
}
