"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Sidebar from "@/components/sidebar/Sidebar";
import AppBar from "@/components/appbar/AppBar";
import Kontak from "@/components/landing-page/Kontak";
import LogoutModal from "@/components/modal/LogoutModal";
import { getUserFromToken, logout } from "@/lib/auth";
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
    UserCheck
} from "lucide-react";

export default function ProfilPage() {
    const router = useRouter();
    const [userEmail, setUserEmail] = useState("");
    const [userName, setUserName] = useState("Pengguna");
    const [userRole, setUserRole] = useState("");
    const [unitTeknisId, setUnitTeknisId] = useState<number | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [logoutModalOpen, setLogoutModalOpen] = useState(false);
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

    // 1. Visitor (publik) Profile Layout - No Sidebar, aligns with landing page
    if (userRole === "publik") {
        return (
            <div className="flex min-h-screen flex-col bg-gradient-to-b from-emerald-50/50 via-white to-teal-50/30 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 text-zinc-900 dark:text-zinc-50 overflow-x-hidden font-sans">
                {/* Header */}
                <header className="relative z-50 w-full border-b border-zinc-200/40 bg-white/40 backdrop-blur-md dark:bg-zinc-900/40 dark:border-zinc-800/40">
                    <div className="max-w-[85rem] mx-auto px-8 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Image
                                src="/images/logo_brmp.svg"
                                alt="Logo BRMP"
                                width={40}
                                height={40}
                                priority
                            />
                            <div className="text-left">
                                <span className="font-bold text-sm leading-tight tracking-tight text-[var(--green-color)] dark:text-white">
                                    BRMP Agroklimat
                                    <br />
                                    Hidrologi Pertanian
                                </span>
                            </div>
                        </div>

                        {/* Navigation Menu */}
                        <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-semibold text-zinc-600 dark:text-zinc-300">
                            <Link href="/" className="hover:text-[var(--green-color)] hover:underline hover:decoration-[var(--green-color)] hover:underline-offset-4 dark:hover:text-white transition">
                                Beranda
                            </Link>
                            <Link href="/#tentang" className="hover:text-[var(--green-color)] hover:underline hover:decoration-[var(--green-color)] hover:underline-offset-4 dark:hover:text-white transition">
                                Tentang
                            </Link>
                            <Link href="/#layanan" className="hover:text-[var(--green-color)] hover:underline hover:decoration-[var(--green-color)] hover:underline-offset-4 dark:hover:text-white transition">
                                Layanan
                            </Link>
                            <Link href="/#faq" className="hover:text-[var(--green-color)] hover:underline hover:decoration-[var(--green-color)] hover:underline-offset-4 dark:hover:text-white transition">
                                FAQ
                            </Link>
                            <Link href="/#kontak" className="hover:text-[var(--green-color)] hover:underline hover:decoration-[var(--green-color)] hover:underline-offset-4 dark:hover:text-white transition">
                                Kontak
                            </Link>
                        </nav>

                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <button
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                    className="flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 shadow-sm hover:bg-zinc-50 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800 transition cursor-pointer"
                                >
                                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                                        <UserIcon className="h-4 w-4" />
                                    </div>
                                    <span>{userName}</span>
                                    <ChevronDown className="h-4 w-4 text-zinc-400" />
                                </button>

                                {dropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-48 rounded-xl border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-800 dark:bg-zinc-950 z-50 text-left">
                                        <Link
                                            href="/profil"
                                            className="flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-900"
                                        >
                                            <UserIcon className="h-4 w-4" />
                                            <span>Profil Saya</span>
                                        </Link>
                                        <button
                                            onClick={() => {
                                                setDropdownOpen(false);
                                                setLogoutModalOpen(true);
                                            }}
                                            className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20 cursor-pointer"
                                        >
                                            <LogOut className="h-4 w-4" />
                                            <span>Logout</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-grow max-w-[85rem] w-full mx-auto px-8 sm:px-6 lg:px-8 py-12">
                    {/* Welcome Banner */}
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 p-8 text-white shadow-lg shadow-emerald-600/10 mb-8">
                        <div className="absolute right-0 top-0 -mr-6 -mt-6 opacity-10">
                            <Sprout className="h-48 w-48" />
                        </div>
                        <div className="relative z-10 space-y-2 text-left">
                            <h2 className="text-2xl font-extrabold md:text-3xl">
                                Profil Pengguna
                            </h2>
                            <p className="max-w-xl text-sm text-emerald-50 font-medium">
                                Kelola detail akun dan informasi pribadi Anda dengan aman.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Left Side: Avatar Card */}
                        <div className="w-full lg:w-1/3 rounded-2xl border border-zinc-200/60 bg-white p-6 shadow-sm dark:bg-zinc-900 dark:border-zinc-800 text-center flex flex-col items-center">
                            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 text-3xl font-extrabold shadow-inner mb-4">
                                {getInitials(userName)}
                            </div>
                            <h3 className="text-xl font-bold text-zinc-900 dark:text-white">{userName}</h3>
                            <p className="text-xs text-zinc-400 mt-1">Anggota Terdaftar</p>

                            <div className="w-full border-t border-zinc-100 dark:border-zinc-850 mt-6 pt-6 space-y-3 text-left">
                                <button className="w-full flex items-center justify-center gap-2 rounded-xl bg-zinc-50 border border-zinc-200/80 hover:bg-zinc-100 py-2.5 text-sm font-bold text-zinc-700 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900 transition cursor-pointer">
                                    <Lock className="h-4 w-4" />
                                    <span>Ubah Kata Sandi</span>
                                </button>
                                <button className="w-full flex items-center justify-center gap-2 rounded-xl bg-zinc-50 border border-zinc-200/80 hover:bg-zinc-100 py-2.5 text-sm font-bold text-zinc-700 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900 transition cursor-pointer">
                                    <Lock className="h-4 w-4" />
                                    <span>Edit Profile</span>
                                </button>
                            </div>
                        </div>

                        {/* Right Side: Account Details Grid */}
                        <div className="flex-1 rounded-2xl border border-zinc-200/60 bg-white p-6 shadow-sm dark:bg-zinc-900 dark:border-zinc-800 text-left">
                            <div className="flex items-center gap-3 border-b border-zinc-100 pb-5 dark:border-zinc-800 mb-6">
                                <UserCheck className="h-5 w-5 text-[var(--green-color)]" />
                                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Informasi Pribadi</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                        Alamat Email
                                    </label>
                                    <div className="flex items-center gap-2.5 bg-zinc-50 dark:bg-zinc-950 px-4 py-3 rounded-xl border border-zinc-200/40 dark:border-zinc-850">
                                        <Mail className="h-4 w-4 text-zinc-400" />
                                        <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{userEmail || "-"}</span>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                                        No. Handphone / WhatsApp
                                    </label>
                                    <div className="flex items-center gap-2.5 bg-zinc-50 dark:bg-zinc-950 px-4 py-3 rounded-xl border border-zinc-200/40 dark:border-zinc-850">
                                        <Phone className="h-4 w-4 text-zinc-400" />
                                        <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">+62 812-3456-7890</span>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                                        Status Akun
                                    </label>
                                    <div className="flex items-center gap-2.5 bg-zinc-50 dark:bg-zinc-950 px-4 py-3 rounded-xl border border-zinc-200/40 dark:border-zinc-850">
                                        <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-500" />
                                        <span className="text-sm font-bold text-emerald-600 dark:text-emerald-500">Aktif & Terverifikasi</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>

                {/* Footer */}
                <Kontak />

                <LogoutModal
                    isOpen={logoutModalOpen}
                    onClose={() => setLogoutModalOpen(false)}
                    onConfirm={() => logout(router)}
                />
            </div>
        );
    }

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
                <main className="flex-1 p-6 space-y-6">
                    {/* Welcome Banner */}
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 p-8 text-white shadow-lg shadow-emerald-600/10">
                        <div className="absolute right-0 top-0 -mr-6 -mt-6 opacity-10">
                            <Sprout className="h-48 w-48" />
                        </div>
                        <div className="relative z-10 space-y-2 text-left">
                            <h2 className="text-2xl font-extrabold md:text-3xl">
                                Profil Staf
                            </h2>
                            <p className="max-w-xl text-sm text-emerald-50 font-medium">
                                Informasi detail kepegawaian dan akun dinas Anda.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Left Side: Avatar Card */}
                        <div className="w-full lg:w-1/3 rounded-2xl border border-zinc-200/60 bg-white p-6 shadow-sm dark:bg-zinc-900 dark:border-zinc-800 text-center flex flex-col items-center">
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

                        {/* Right Side: Account Details Grid */}
                        <div className="flex-1 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:bg-zinc-900 dark:border-zinc-800 text-left">
                            <div className="flex items-center gap-3 border-b border-zinc-100 pb-5 dark:border-zinc-800 mb-6">
                                <Briefcase className="h-5 w-5 text-[var(--green-color)]" />
                                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Detail Kepegawaian</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                </main>
            </div>

            <LogoutModal
                isOpen={logoutModalOpen}
                onClose={() => setLogoutModalOpen(false)}
                onConfirm={() => logout(router)}
            />
        </div>
    );
}
