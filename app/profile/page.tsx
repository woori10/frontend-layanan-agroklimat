"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Sidebar from "@/components/sidebar/Sidebar";
import AppBar from "@/components/appbar/AppBar";
import { getUserFromToken } from "@/lib/auth";
import {
    Sprout,
    User as UserIcon,
    ChevronDown,
    LogOut,
    Lock,
    Mail,
    Phone,
    Briefcase,
    CheckCircle,
    UserCheck,
    Edit
} from "lucide-react";

export default function ProfilPage() {
    const router = useRouter();
    const [userEmail, setUserEmail] = useState("");
    const [userName, setUserName] = useState("Pengguna");
    const [userRole, setUserRole] = useState("");
    const [unitTeknisId, setUnitTeknisId] = useState<number | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Authenticate mockup on client side
    useEffect(() => {
        setMounted(true);
        const token = localStorage.getItem("agro_token");
        const storedEmail = localStorage.getItem("agro_user_email");
        const storedNip = localStorage.getItem("agro_user_nip");

        if (!token) {
            if (storedNip) {
                router.push("/login/pegawai");
            } else {
                router.push("/login");
            }
        } else {
            const user = getUserFromToken();
            if (user) {
                if (user.role === "publik") {
                    router.push("/profil-publik");
                    return;
                }
                setUserRole(user.role);
                if (user.nama) {
                    setUserName(user.nama);
                } else if (storedEmail) {
                    setUserName(storedEmail.split("@")[0]);
                }

                if (user.email) {
                    setUserEmail(user.email);
                } else if (storedEmail) {
                    setUserEmail(storedEmail);
                } else if (storedNip) {
                    setUserEmail(`NIP: ${storedNip}`);
                }

                if (user.unit_teknis_id) {
                    setUnitTeknisId(user.unit_teknis_id);
                }
            }
        }
    }, [router]);

    if (!mounted) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
            </div>
        );
    }

    const getUnitName = (id: number | null) => {
        if (!id) return "Kantor Pusat BRMP";
        switch (id) {
            case 1: return "Tim Teknis Agroklimat / Hidrologi";
            case 2: return "Koordinator Laboratorium";
            case 3: return "Tim Kerja Layanan dan Pendayagunaan Hasil";
            case 4: return "Tim Siap Tanam";
            case 5: return "Petugas Mess";
            default: return "Kantor Pusat BRMP";
        }
    };

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .slice(0, 2)
            .join("")
            .toUpperCase();
    };

    // 2. Dashboard Profile Layout (admin, super-admin, pegawai, kepala_balai) - with Sidebar & AppBar
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
                    <div className="flex flex-row justify-between items-center gap-8 w-full">
                        <h1 className="text-2xl sm:text-3xl font-semibold text-[var(--green-color)] dark:text-white tracking-tight">
                            Profil Saya
                        </h1>
                        <Link href="/profil-publik/edit">
                            <button className="flex items-center gap-2 bg-[var(--green-color)] hover:bg-[#1E4329] text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-md transition cursor-pointer">
                                <Edit className="w-4 h-4" />
                                <span>Edit Profile</span>
                            </button>
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="md:col-span-2 h-full rounded-2xl border border-zinc-200/60 bg-white shadow-sm dark:bg-zinc-900 dark:border-zinc-800 overflow-hidden text-left flex flex-col">
                            {/* Header */}
                            <div className="bg-[#E5E7EB]/50 dark:bg-zinc-950/40 px-6 py-5">
                                <div className="flex items-center gap-3">
                                    <UserCheck className="h-5 w-5 text-[#2C5E3B] dark:text-emerald-400" />
                                    <h3 className="text-base font-bold text-zinc-800 dark:text-white">Informasi Pribadi</h3>
                                </div>
                            </div>
                            <div className="p-8 flex-grow">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                                            Nama Lengkap
                                        </label>
                                        <div className="flex items-center gap-2.5 bg-zinc-50 dark:bg-zinc-950 px-4 py-3 rounded-xl border border-zinc-200/40 dark:border-zinc-850">
                                            <UserIcon className="h-4 w-4 text-zinc-400" />
                                            <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{userName}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                                            Email / NIP Dinas
                                        </label>
                                        <div className="flex items-center gap-2.5 bg-zinc-50 dark:bg-zinc-950 px-4 py-3 rounded-xl border border-zinc-200/40 dark:border-zinc-850">
                                            <Mail className="h-4 w-4 text-zinc-400" />
                                            <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{userEmail || "-"}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-1 md:col-span-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                                            Unit Teknis / Unit Kerja
                                        </label>
                                        <div className="flex items-center gap-2.5 bg-zinc-50 dark:bg-zinc-950 px-4 py-3 rounded-xl border border-zinc-200/40 dark:border-zinc-850">
                                            <Briefcase className="h-4 w-4 text-zinc-400" />
                                            <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{getUnitName(unitTeknisId)}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-1 md:col-span-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                                            Status Kepegawaian
                                        </label>
                                        <div className="flex items-center gap-2.5 bg-zinc-50 dark:bg-zinc-950 px-4 py-3 rounded-xl border border-zinc-200/40 dark:border-zinc-850">
                                            <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-500" />
                                            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-500">Aktif & Berwenang</span>
                                        </div>
                                    </div>
                                </div>


                            </div>
                        </div>
                        <div className="w-full rounded-2xl border border-zinc-200/60 bg-white p-6 shadow-sm dark:bg-zinc-900 dark:border-zinc-800 text-center flex flex-col items-center">
                            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 text-3xl font-extrabold shadow-inner mb-4">
                                {getInitials(userName)}
                            </div>
                            <h3 className="text-xl font-bold text-zinc-900 dark:text-white">{userName}</h3>
                            <p className="text-xs text-zinc-400 mt-1">Staf Internal Balai</p>

                            <div className="w-full border-t border-zinc-100 dark:border-zinc-850 mt-6 pt-6 space-y-3 text-left">
                                <button className="w-full flex items-center justify-center gap-2 rounded-xl bg-zinc-50 border border-zinc-200/80 hover:bg-zinc-100 py-2.5 text-sm font-bold text-zinc-700 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900 transition cursor-pointer">
                                    <Lock className="h-4 w-4" />
                                    <span>Ganti Kata Sandi</span>
                                </button>
                                <button className="w-full flex items-center justify-center gap-2 rounded-xl bg-zinc-50 border border-zinc-200/80 hover:bg-zinc-100 py-2.5 text-sm font-bold text-zinc-700 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900 transition cursor-pointer">
                                    <Lock className="h-4 w-4" />
                                    <span>Edit Profile</span>
                                </button>
                            </div>
                        </div>
                    </div>




                </main>
            </div>

        </div>
    );
}
