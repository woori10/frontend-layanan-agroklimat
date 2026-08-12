"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar/Navbar";
import { getUserFromToken } from "@/lib/auth";
import {
    Sprout,
    User as UserIcon,
    Lock,
    Mail,
    Phone,
    CheckCircle,
    UserCheck,
    Shield,
    Key,
    ArrowLeft,
    Edit,
    ChevronLeft,
    ShieldUser
} from "lucide-react";
import Link from "next/link";
import ProfileBanner from "@/components/banner/ProfileBanner";

export default function ProfilPublikPage() {
    const router = useRouter();
    const [userEmail, setUserEmail] = useState("");
    const [userName, setUserName] = useState("Pengguna");
    const [userRole, setUserRole] = useState("");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const token = localStorage.getItem("agro_token");
        const storedEmail = localStorage.getItem("agro_user_email");

        if (!token) {
            router.push("/login");
        } else {
            const user = getUserFromToken();
            if (user) {
                if (user.role !== "publik") {
                    router.push("/profil");
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
                }
            } else {
                router.push("/login");
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

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .slice(0, 2)
            .join("")
            .toUpperCase();
    };

    return (
        <div className="flex min-h-screen flex-col bg-[#F8FAFC] text-zinc-900 dark:text-zinc-50 overflow-x-hidden font-sans">
            {/* Header */}
            <Navbar />
            <ProfileBanner />

            {/* Main Content */}
            <main className="flex-grow max-w-7xl w-full mx-auto px-8 sm:px-6 lg:px-8 py-8">
                <div className="pb-4 w-full">
                    <div className="space-y-3">
                        {/* Breadcrumb */}
                        <div className="flex justify-between items-center gap-1 ">
                            <Link
                                href="/"
                                className="flex items-center text-xs font-semibold text-[var(--foreground)] hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition"
                            >
                                <ChevronLeft className="h-4 w-4 mr-0.5" />
                                Kembali ke Beranda
                            </Link>

                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-6 md:col-span-1">
                        {/* Right Column 1: Profile Summary Card */}
                        <div className="w-full rounded-2xl border border-zinc-200/60 bg-white p-8 shadow-sm dark:bg-zinc-900 dark:border-zinc-800 text-center flex flex-col items-center h-fit">
                            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[var(--green-color)] dark:bg-emerald-950 dark:text-emerald-400 text-xl font-extrabold shadow-inner mb-3">
                                {getInitials(userName)}
                            </div>
                            <h3 className="text-lg font-bold text-zinc-900 dark:text-white leading-tight">{userName}</h3>
                            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 pt-2">{userEmail}</p>
                        </div>
                        {/* Rigth Column 2 : Profile Summary Card */}
                        <div className="w-full rounded-2xl border border-zinc-200/60 bg-white p-8 shadow-sm dark:bg-zinc-900 dark:border-zinc-800 flex flex-col h-fit">
                            <div className="w-full space-y-4 text-left">
                                <div className="flex gap-3 items-center">
                                    <Lock className="w-8 h-8 text-[var(--foreground)] bg-red-200 p-2 rounded-lg" />
                                    <p className="text-md font-semibold text-[var(--foreground)] dark:text-zinc-500">Keamanan Akun</p>
                                </div>
                                <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                                    Jaga keamanan akun Anda dengan mengganti password secara berkala.
                                </p>
                                <Link href="#" className="w-full block">
                                    <button className="w-full flex items-center justify-center gap-2 rounded-xl bg-zinc-50 border border-[var(--green-color)]/80 hover:bg-zinc-100 py-2.5 text-sm font-bold text-[var(--green-color)] dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900 transition cursor-pointer">
                                        <Edit className="h-4 w-4" />
                                        <span>Ganti Kata Sandi</span>
                                    </button>
                                </Link>

                            </div>
                        </div>
                    </div>
                    {/* Left Column: Account Details Grid */}
                    <div className="md:col-span-2 h-full rounded-2xl border border-zinc-200/60 bg-white shadow-sm dark:bg-zinc-900 dark:border-zinc-800 overflow-hidden text-left flex flex-col">
                        {/* Header */}
                        <div className="px-8 py-6">
                            <div className="flex items-center gap-3">
                                <UserCheck className="w-10 h-10 bg-emerald-100 p-2.5 text-[var(--green-color)] dark:text-emerald-400 rounded-lg" />
                                <div className="flex flex-col">
                                    <h3 className="text-lg font-bold text-zinc-850 dark:text-white">Informasi Pribadi</h3>
                                    <p className="text-sm font-base text-[var(--foreground)]">Lengkapi data diri anda.</p>
                                </div>
                            </div>
                        </div>

                        {/* Fields */}
                        <div className="px-8 py-2 flex-grow">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                                {/* Nama Lengkap */}
                                <div className="space-y-1.5 pb-3">
                                    <label className="text-sm font-medium text-zinc-600">
                                        Nama Lengkap
                                    </label>
                                    <div className="text-sm font-medium text-[var(--foreground)] mt-2 px-4 py-3 rounded-xl border border-zinc-200">
                                        {userName}
                                    </div>
                                </div>

                                {/* NIK */}
                                <div className="space-y-1.5 pb-3">
                                    <label className="text-sm font-medium text-zinc-600">
                                        NIK / No. Identitas
                                    </label>
                                    <div className="text-sm font-medium text-[var(--foreground)] mt-2 px-4 py-3 rounded-xl border border-zinc-200">
                                        3273123456789001
                                    </div>
                                </div>

                                {/* Email */}
                                <div className="space-y-1.5 pb-3">
                                    <label className="text-sm font-medium text-zinc-600">
                                        Email
                                    </label>
                                    <div className="text-sm font-medium text-[var(--foreground)] mt-2 px-4 py-3 rounded-xl border border-zinc-200">
                                        {userEmail || "-"}
                                    </div>
                                </div>

                                {/* No Telepon */}
                                <div className="space-y-1.5 pb-3">
                                    <label className="text-sm font-medium text-zinc-600">
                                        No. Telepon / WhatsApp
                                    </label>
                                    <div className="text-sm font-medium text-[var(--foreground)] mt-2 px-4 py-3 rounded-xl border border-zinc-200">
                                        +62 812-3456-7890
                                    </div>
                                </div>
                            </div>

                            {/* Asal Instansi */}
                            <div className="space-y-1.5 pb-3">
                                <label className="text-sm font-medium text-zinc-600">
                                    Asal Instansi
                                </label>
                                <div className="text-sm font-medium text-[var(--foreground)] mt-2 px-4 py-3 rounded-xl border border-zinc-200">
                                    -
                                </div>
                            </div>

                            {/* Alamat */}
                            <div className="space-y-1.5 pb-3">
                                <label className="text-sm font-medium text-zinc-600">
                                    Alamat Lengkap
                                </label>
                                <div className="text-sm font-medium text-[var(--foreground)] mt-2 px-4 py-3 rounded-xl border border-zinc-200">
                                    Bogor
                                </div>
                            </div>

                            <div className="flex justify-end py-4">
                                <Link href="/profile-publik/edit">
                                    <button className="flex items-center justify-center gap-2 bg-[var(--green-color)] hover:bg-[#1E4329] text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-md transition cursor-pointer">
                                        <Edit className="w-4 h-4" />
                                        <span>Edit Profile</span>
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
