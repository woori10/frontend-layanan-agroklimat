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
    Activity
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
    const [unitTeknisId, setUnitTeknisId] = useState<number | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("ringkasan");
    const [mounted, setMounted] = useState(false);

    const [tikets, setTikets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 4;

    const totalItems = tikets.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    const currentTikets = tikets.slice(startIndex, startIndex + itemsPerPage);

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
                } else if (storedEmail) {
                    setUserName(storedEmail.split("@")[0]);
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
                    { id: 14, name: "Rekomendasi & Penilaian Kesesuaian SNI", type: "gratis" },
                    { id: 15, name: "Konsultasi Rekomendasi & Penilaian Kesesuaian SNI", type: "gratis" },
                    { id: 18, name: "Permohonan Data", type: "gratis" }
                ];
            case 2:
                return [
                    { id: 19, name: "Peminjaman Alat", type: "berbayar" }
                ];
            case 3:
                return [
                    { id: 17, name: "Bimbingan Teknis & Narasumber", type: "gratis" },
                    { id: 20, name: "Magang Teknis / PKL", type: "gratis" },
                    { id: 21, name: "Agroedukasi / Kunjungan Edukasi", type: "gratis" },
                    { id: 22, name: "Layanan Perpustakaan", type: "gratis" }
                ];
            case 4:
                return [
                    { id: 16, name: "Rekomendasi Siap Tanam", type: "gratis" }
                ];
            case 5:
                return [
                    { id: 23, name: "Layanan Mess", type: "berbayar" }
                ];
            default:
                return [];
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
            {/* Sidebar for Desktop */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex flex-col flex-1 overflow-y-auto">
                {/* Top Navbar */}
                <AppBar onMenuClick={() => setSidebarOpen(true)} />

                {/* Content Container */}
                <main className="flex-1 p-6 space-y-6">
                    {/* Welcome Banner */}
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 p-6 text-white shadow-lg shadow-emerald-600/10">
                        <div className="absolute right-0 top-0 -mr-6 -mt-6 opacity-10">
                            <Sprout className="h-48 w-48" />
                        </div>
                        <div className="relative z-10 space-y-2">
                            <h2 className="text-2xl font-extrabold md:text-3xl">
                                Selamat Datang di Dashboard Pegawai, <span className="capitalize">{userName}</span>!
                            </h2>
                            <p className="max-w-xl text-sm text-emerald-50 font-medium">
                                Anda login sebagai pegawai: <span className="underline font-bold">{getUnitTeknisName(unitTeknisId)}</span>
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
                                iconBgClass="bg-emerald-400 dark:bg-emerald-750"
                                iconColorClass="text-white"
                                apiEndpoint="/tiket/unit-teknis/me"
                                processData={(data) => Array.isArray(data) ? data.filter((t: any) => t.status === "selesai_diproses" || t.status === "menunggu_konfirmasi" || t.status === "selesai").length : 0}
                                desc="tiket"
                            />
                        </div>
                    </div>
                    {/* Daftar Permohonan Masuk Card */}
                    <div className="bg-white shadow-md rounded-lg dark:bg-zinc-800 dark:shadow-zinc-800">
                        <div className="flex justify-between items-center px-6 py-4">
                            <p className="text-[var(--foreground)] dark:text-white font-semibold text-lg">Daftar Permohonan Masuk</p>
                        </div>
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
                                            currentTikets.map((tiket) => (
                                                <tr key={tiket.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 transition-colors">
                                                    <td className="px-6 py-5.5 whitespace-nowrap text-sm text-[var(--foreground)] dark:text-zinc-100 font-base">
                                                         {tiket.jawaban_form?.nama_lengkap || tiket.user?.nama || "-"}
                                                    </td>
                                                    <td className="px-6 py-5.5 whitespace-nowrap text-sm text-[var(--foreground)] dark:text-zinc-100 font-base">
                                                        {tiket.layanan?.nama_layanan || "-"}
                                                    </td>
                                                    <td className="px-6 py-5.5 whitespace-nowrap text-center text-sm text-[var(--foreground)] dark:text-zinc-400 font-base">
                                                        {formatDate(tiket.tanggal_submit || tiket.createdAt)}
                                                    </td>
                                                    <td className="px-6 py-5.5 whitespace-nowrap text-sm">
                                                        <div className="flex justify-center">
                                                            <StatusLayananBadge status={tiket.status} />
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
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
                    {/* Services List Card */}
                    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:bg-zinc-900 dark:border-zinc-800 text-left">
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-4">
                            Layanan yang Dikelola
                        </h3>
                        <div className="space-y-4">
                            {getUnitTeknisServices(unitTeknisId).length > 0 ? (
                                getUnitTeknisServices(unitTeknisId).map((svc) => (
                                    <div
                                        key={svc.id}
                                        onClick={() => router.push(`/layanan/${svc.id}`)}
                                        className="flex items-center justify-between p-4 rounded-xl border border-zinc-100 hover:border-emerald-500/30 hover:bg-emerald-50/10 transition dark:border-zinc-800 dark:hover:bg-emerald-950/10 cursor-pointer"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                                                <Sprout className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-zinc-900 dark:text-white text-sm sm:text-base">
                                                    {svc.name}
                                                </h4>
                                                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                                    ID Layanan: {svc.id}
                                                </p>
                                            </div>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${svc.type === "gratis"
                                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400"
                                            : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400"
                                            }`}>
                                            {svc.type.toUpperCase()}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                    Tidak ada layanan spesifik yang terdaftar untuk unit Anda.
                                </p>
                            )}
                        </div>
                    </div>


                </main>
            </div>
        </div>
    );
}
