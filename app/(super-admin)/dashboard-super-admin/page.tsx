"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/sidebar/Sidebar";
import AppBar from "@/components/appbar/AppBar";
import CardDashboard from "@/components/card/card-dashboard/CardDashboard";
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
    ChevronRight,
    AlertCircle,
    CheckCircle2,
    Gauge,
    LineChart as ChartIcon,
    FileText,
    Clock,
    Activity
} from "lucide-react";

export default function DashboardSuperAdminPage() {
    const router = useRouter();
    const [userEmail, setUserEmail] = useState("petani@agroklimat.com");
    const [userName, setUserName] = useState("Pengguna");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("ringkasan");
    const [mounted, setMounted] = useState(false);

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

    // Sample weekly data for chart
    const weeklyData = [
        { day: "Sen", temp: 27, moisture: 60 },
        { day: "Sel", temp: 28, moisture: 62 },
        { day: "Rab", temp: 29, moisture: 65 },
        { day: "Kam", temp: 28, moisture: 63 },
        { day: "Jum", temp: 26, moisture: 70 },
        { day: "Sab", temp: 27, moisture: 68 },
        { day: "Min", temp: 28, moisture: 66 },
    ];

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
                                Selamat Datang Kembali, <span className="capitalize">{userName}</span>!
                            </h2>
                            {/* <p className="max-w-xl text-sm text-emerald-50">
                                Kondisi iklim di Lahan Agrosari 01 saat ini sangat stabil. Waktu terbaik untuk memulai pemupukan nitrogen terjadwal adalah pukul 14:00 - 17:00 hari ini.
                            </p> */}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
