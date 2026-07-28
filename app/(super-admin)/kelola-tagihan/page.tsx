"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/sidebar/Sidebar";
import AppBar from "@/components/appbar/AppBar";
import { getUserFromToken, getRedirectPath } from "@/lib/auth";
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
    ChevronLeft,
    ChevronRight,
    AlertCircle,
    CheckCircle2,
    Gauge,
    Pencil,
    Trash2,
    LineChart as ChartIcon
} from "lucide-react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function KelolaTagihanPage() {
    const router = useRouter();
    const [userEmail, setUserEmail] = useState("petani@agroklimat.com");
    const [userName, setUserName] = useState("Pengguna");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("ringkasan");
    const [mounted, setMounted] = useState(false);

    const requests = [
        {
            id: 1,
            jenisTagihan: "PNBP (Penerimaan Negara Bukan Pajak)",
            jenisLayanan: "Analisis Data Hidrologi DAS Citarum",
            jenisRekening: "Bank Mandiri",
            noRekening: "137-00-1234567-8"
        },
        {
            id: 2,
            jenisTagihan: "Non-PNBP",
            jenisLayanan: "Rekomendasi SNI Agroklimat Lahan Sawah",
            jenisRekening: "Bank BRI",
            noRekening: "0206-01-001234-50-6"
        },
        {
            id: 3,
            jenisTagihan: "PNBP (Penerimaan Negara Bukan Pajak)",
            jenisLayanan: "Penyediaan Peta Klimatologi Wilayah Jawa Barat",
            jenisRekening: "Bank BNI",
            noRekening: "0123456789"
        },
        {
            id: 4,
            jenisTagihan: "PNBP (Penerimaan Negara Bukan Pajak)",
            jenisLayanan: "Peminjaman Alat AWS (Automatic Weather Station)",
            jenisRekening: "Bank Mandiri",
            noRekening: "137-00-9876543-2"
        }
    ];

    // Authenticate mockup on client side
    useEffect(() => {
        setMounted(true);
        const token = localStorage.getItem("agro_token");
        const storedEmail = localStorage.getItem("agro_user_email");

        if (!token) {
            router.push("/login");
        } else {
            if (storedEmail) {
                setUserEmail(storedEmail);
            }
            const user = getUserFromToken();
            if (user) {
                if (user.role !== "super_admin") {
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
        localStorage.removeItem("agro_token");
        localStorage.removeItem("agro_user_email");
        router.push("/login");
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
                            {/* <div className="flex items-center gap-2 rounded-full bg-emerald-500/30 px-3 py-1 text-xs font-semibold w-max border border-emerald-400/20">
                <Sun className="h-3.5 w-3.5 animate-pulse" />
                <span>Cuaca Hari Ini: Cerah Berawan</span>
              </div> */}
                            <h2 className="text-2xl font-extrabold md:text-3xl">
                                Ini halaman kelola tagihan!
                            </h2>
                            <p className="max-w-xl text-sm text-emerald-50">
                                Kondisi iklim di Lahan Agrosari 01 saat ini sangat stabil. Waktu terbaik untuk memulai pemupukan nitrogen terjadwal adalah pukul 14:00 - 17:00 hari ini.
                            </p>
                        </div>

                    </div>
                    {/* Table Section */}
                    <div className="overflow-hidden rounded-lg border border-zinc-200/80 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-zinc-200/80 dark:divide-zinc-800">
                                <thead className="bg-[#E5E7EB]/50 dark:bg-zinc-950">
                                    <tr>
                                        <th scope="col" className="px-6 py-4.5 text-left text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                            No
                                        </th>
                                        <th scope="col" className="px-6 py-4.5 text-left text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                            Jenis Tagihan
                                        </th>
                                        <th scope="col" className="px-6 py-4.5 text-left text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                            Jenis Layanan
                                        </th>
                                        <th scope="col" className="px-6 py-4.5 text-left text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                            Jenis Rekening
                                        </th>
                                        <th scope="col" className="px-6 py-4.5 text-left text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                            No Rekening
                                        </th>
                                        <th scope="col" className="px-6 py-4.5 text-left text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 bg-white dark:bg-zinc-900">
                                    {requests.map((request) => {
                                        return (
                                            <tr key={request.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 transition-colors">
                                                <td className="px-6 py-5.5 whitespace-nowrap text-sm font-semibold text-[#2C5E3B] dark:text-emerald-450 text-left">
                                                    {request.id}
                                                </td>
                                                <td className="px-6 py-5.5 whitespace-nowrap text-sm text-zinc-800 dark:text-zinc-100 font-semibold text-left">
                                                    {request.jenisTagihan}
                                                </td>
                                                <td className="px-6 py-5.5 whitespace-nowrap text-sm text-zinc-500 dark:text-zinc-400 font-medium text-left">
                                                    {request.jenisLayanan}
                                                </td>
                                                <td className="px-6 py-5.5 whitespace-nowrap text-sm text-zinc-500 dark:text-zinc-400 font-medium text-left">
                                                    {request.jenisRekening}
                                                </td>
                                                <td className="px-6 py-5.5 whitespace-nowrap text-sm text-zinc-500 dark:text-zinc-400 font-medium text-left">
                                                    {request.noRekening}
                                                </td>
                                                <td className="px-6 py-5.5 whitespace-nowrap text-sm text-left">
                                                    <div className="flex items-center justify-start gap-2">
                                                        <button
                                                            className="inline-flex items-center justify-center rounded-lg bg-emerald-50 p-2 text-emerald-700 hover:bg-emerald-100 transition dark:bg-emerald-950/40 dark:text-emerald-400 dark:hover:bg-emerald-900/40 cursor-pointer"
                                                            title="Edit"
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            className="inline-flex items-center justify-center rounded-lg bg-red-50 p-2 text-red-700 hover:bg-red-100 transition dark:bg-red-950/40 dark:text-red-400 dark:hover:bg-red-900/40 cursor-pointer"
                                                            title="Delete"
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
                        </div>

                        {/* Table Footer / Pagination */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4.5 bg-[#E5E7EB]/50 dark:bg-zinc-950 border-t border-zinc-200/80 dark:border-zinc-800">
                            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                                Menampilkan 1-4 dari 12 permohonan
                            </span>

                            <div className="flex items-center gap-1.5">
                                <button className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition disabled:opacity-50" disabled>
                                    <ChevronLeft className="h-4 w-4" />
                                </button>

                                <button className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold bg-[#2C5E3B] text-white transition">
                                    1
                                </button>
                                <button className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 transition">
                                    2
                                </button>
                                <button className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 transition">
                                    3
                                </button>

                                <button className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition">
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
