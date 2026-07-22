"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/sidebar/Sidebar";
import AppBar from "@/components/appbar/AppBar";
import { getUserFromToken, logout, getRedirectPath } from "@/lib/auth";
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
    Settings,
    Menu,
    X,
    ChevronRight,
    AlertCircle,
    CheckCircle2,
    Gauge,
    LineChart as ChartIcon,
    Bed,
    Briefcase,
    ShieldCheck
} from "lucide-react";

export default function DashboardPegawaiPage() {
    const router = useRouter();
    const [userNIP, setUserNIP] = useState("");
    const [userName, setUserName] = useState("");
    const [unitTeknisId, setUnitTeknisId] = useState<number | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("ringkasan");
    const [mounted, setMounted] = useState(false);

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

                    {/* Sensor Summary Grid */}
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {getUnitTeknisCards(unitTeknisId).map((card, idx) => {
                            const CardIcon = card.icon;
                            return (
                                <div
                                    key={idx}
                                    className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm dark:bg-zinc-900 dark:border-zinc-800 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                            {card.title}
                                        </span>
                                        <div className="rounded-xl bg-zinc-50 p-2 text-zinc-600 dark:bg-zinc-950 dark:text-zinc-400">
                                            <CardIcon className="h-5 w-5" />
                                        </div>
                                    </div>
                                    <div className="mt-4 space-y-1">
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-2xl font-extrabold text-zinc-900 dark:text-white">
                                                {card.value}
                                            </span>
                                            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                                                {card.status}
                                            </span>
                                        </div>
                                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                            {card.desc}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </main>
            </div>
        </div>
    );
}
