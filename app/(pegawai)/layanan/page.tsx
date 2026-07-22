"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/sidebar/Sidebar";
import AppBar from "@/components/appbar/AppBar";
import { getUserFromToken } from "@/lib/auth";
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
    LineChart as ChartIcon
} from "lucide-react";

export default function LayananPage() {
    const router = useRouter();
    const [userEmail, setUserEmail] = useState("petani@agroklimat.com");
    const [userName, setUserName] = useState("Pengguna");
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
            router.push("/login");
        } else {
            if (storedEmail) {
                setUserEmail(storedEmail);
            }
            const user = getUserFromToken();
            if (user) {
                if (user.role !== "pegawai") {
                    router.push("/dashboard-pegawai");
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
        localStorage.removeItem("agro_token");
        localStorage.removeItem("agro_user_email");
        router.push("/login");
    };

    const getUnitTeknisServices = (id: number | null) => {
        switch (id) {
            case 1:
                return [
                    { id: 2, name: "Rekomendasi & Penilaian Kesesuaian Agroklimat/Hidrologi (SNI)", type: "gratis" }
                ];
            case 2:
                return [
                    { id: 3, name: "Permohonan Data / Peminjaman Alat (Lab. Agrohidromet)", type: "berbayar" }
                ];
            case 3:
                return [
                    { id: 4, name: "Konsultasi Rekomendasi & Penilaian Kesesuaian", type: "gratis" },
                    { id: 5, name: "Bimbingan Teknis & Narasumber", type: "gratis" },
                    { id: 6, name: "Magang Teknis / PKL", type: "gratis" },
                    { id: 7, name: "Layanan Perpustakaan", type: "gratis" },
                    { id: 8, name: "Agroedukasi / Kunjungan Edukasi", type: "gratis" }
                ];
            case 4:
                return [
                    { id: 1, name: "Rekomendasi Siap Tanam", type: "gratis" }
                ];
            case 5:
                return [
                    { id: 9, name: "Layanan Mess", type: "berbayar" }
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
                                Layanan & Tugas Unit Anda
                            </h2>
                            <p className="max-w-xl text-sm text-emerald-50 font-medium">
                                Daftar layanan pertanian yang berada di bawah wewenang unit teknis Anda.
                            </p>
                        </div>
                    </div>

                    {/* Services List Card */}
                    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-4">
                            Layanan yang Dikelola
                        </h3>
                        <div className="space-y-4">
                            {getUnitTeknisServices(unitTeknisId).length > 0 ? (
                                getUnitTeknisServices(unitTeknisId).map((svc) => (
                                    <div
                                        key={svc.id}
                                        className="flex items-center justify-between p-4 rounded-xl border border-zinc-100 hover:border-emerald-500/30 hover:bg-emerald-50/10 transition dark:border-zinc-800 dark:hover:bg-emerald-950/10"
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
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                            svc.type === "gratis"
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
