"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Sidebar from "@/components/sidebar/Sidebar";
import AppBar from "@/components/appbar/AppBar";
import { getUserFromToken } from "@/lib/auth";
import { getApiUrl } from "@/lib/api";
import {
    User as UserIcon,
    Lock,
    Pencil,
    Edit
} from "lucide-react";
import VerifyPasswordModal from "@/components/modal/VerifyPasswordModal";

export default function ProfilPage() {
    const router = useRouter();
    const [userEmail, setUserEmail] = useState("");
    const [userNip, setUserNip] = useState("");
    const [userName, setUserName] = useState("Pengguna");
    const [userRole, setUserRole] = useState("");
    const [userNoHp, setUserNoHp] = useState("");
    const [unitTeknisId, setUnitTeknisId] = useState<number | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);

    const getRoleLabel = (role: string) => {
        switch (role) {
            case "super_admin": return "Super Admin";
            case "admin": return "Admin";
            case "pegawai": return "Pegawai";
            case "kepala_balai": return "Kepala Balai";
            default: return role || "-";
        }
    };

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

                // Set initial data from token
                setUserRole(user.role);
                setUserName(user.nama || "Pengguna");
                setUserEmail(user.email || "");
                setUserNip(user.nip || "");
                setUnitTeknisId(user.unit_teknis_id ?? null);

                // Fetch details from backend API
                fetch(`${getApiUrl()}/auth/profile`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })
                    .then(res => {
                        if (!res.ok) throw new Error("Gagal mengambil profil");
                        return res.json();
                    })
                    .then(data => {
                        if (data.nama) setUserName(data.nama);
                        if (data.email) setUserEmail(data.email);
                        if (data.nip) setUserNip(data.nip);
                        if (data.role) setUserRole(data.role);
                        if (data.no_hp) setUserNoHp(data.no_hp);
                        if (data.unit_teknis_id !== undefined) setUnitTeknisId(data.unit_teknis_id);
                    })
                    .catch(err => {
                        console.error("Gagal mengambil data profil:", err);
                    });
            }
        }
    }, [router]);

    if (!mounted) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-secondary-green-color border-t-transparent"></div>
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
                        <div className="space-y-2">
                            <h1 className="text-2xl sm:text-3xl font-semibold text-[var(--foreground)] dark:text-white tracking-tight">
                                Profil <span className="text-[var(--green-color)] dark:text-zinc-300">{getRoleLabel(userRole)}</span>
                            </h1>
                            <p className="text-sm font-medium text-[var(--foreground)] dark:text-zinc-400">Kelola profil anda</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="md:col-span-2 h-full rounded-2xl border border-zinc-200/60 bg-white shadow-sm dark:bg-zinc-900 dark:border-zinc-800 overflow-hidden text-left flex flex-col">
                            {/* Header */}
                            <div className="px-8 py-6">
                                <div className="flex items-center gap-3">
                                    <div className="flex flex-col">
                                        <h3 className="text-lg font-bold text-[var(--foreground)] dark:text-white">Informasi Pribadi</h3>
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

                                    {/* NIP */}
                                    <div className="space-y-1.5 pb-3">
                                        <label className="text-sm font-medium text-zinc-600">
                                            NIK / No. Identitas
                                        </label>
                                        <div className="text-sm font-medium text-[var(--foreground)] mt-2 px-4 py-3 rounded-xl border border-zinc-200">
                                            {userNip}
                                        </div>
                                    </div>

                                    {/* Role */}
                                    <div className="space-y-1.5 pb-3">
                                        <label className="text-sm font-medium text-zinc-600">
                                            Role
                                        </label>
                                        <div className="text-sm font-medium text-[var(--foreground)] mt-2 px-4 py-3 rounded-xl border border-zinc-200">
                                            {getRoleLabel(userRole)}
                                        </div>
                                    </div>

                                    {/* Unit Teknis */}
                                    <div className="space-y-1.5 pb-3">
                                        <label className="text-sm font-medium text-zinc-600">
                                            Unit Teknis
                                        </label>
                                        <div className="text-sm font-medium text-[var(--foreground)] mt-2 px-4 py-3 rounded-xl border border-zinc-200">
                                            {userRole === "pegawai" ? (getUnitName(unitTeknisId) || "-") : "-"}
                                        </div>
                                    </div>


                                    {/* No Telepon */}
                                    <div className="space-y-1.5 pb-3">
                                        <label className="text-sm font-medium text-zinc-600">
                                            No. Telepon
                                        </label>
                                        <div className="text-sm font-medium text-[var(--foreground)] mt-2 px-4 py-3 rounded-xl border border-zinc-200">
                                            {userNoHp || "-"}
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
                                </div>
                                <div className="flex justify-end py-4">
                                    <Link href="/profile/edit">
                                        <button className="flex items-center justify-center gap-2 bg-[var(--green-color)] hover:bg-[#1E4329] text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-md transition cursor-pointer">
                                            <Pencil className="w-4 h-4" />
                                            <span>Edit Profile</span>
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                        <div className="flex grid grid-row-1 md:grid-rows-2 gap-8">
                            <div className="w-full rounded-2xl border border-zinc-200/60 bg-white p-6 shadow-sm dark:bg-zinc-900 dark:border-zinc-800 text-center flex flex-col items-center">
                                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-secondary-green-color text-[var(--green-color)] dark:bg-secondary-green-color dark:text-secondary-green-color text-3xl font-extrabold shadow-inner mb-4">
                                    {getInitials(userName)}
                                </div>
                                <h3 className="text-xl font-bold text-zinc-900 dark:text-white">{userName}</h3>
                                <p className="text-xs text-zinc-400 mt-1">{userNip}</p>
                            </div>
                            <div className="w-full rounded-2xl border border-zinc-200/60 bg-white p-6 shadow-sm dark:bg-zinc-900 dark:border-zinc-800 text-center flex flex-col items-center">
                                <div className="w-full space-y-4 text-left">
                                    <div className="flex gap-3 items-center">
                                        <Lock className="w-8 h-8 text-[var(--foreground)] bg-red-200 p-2 rounded-lg" />
                                        <p className="text-md font-semibold text-[var(--foreground)] dark:text-zinc-500">Keamanan Akun</p>
                                    </div>
                                    <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                                        Jaga keamanan akun Anda dengan mengganti password secara berkala.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => setIsVerifyModalOpen(true)}
                                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-zinc-50 border border-[var(--green-color)]/80 hover:bg-zinc-100 py-2.5 text-sm font-bold text-[var(--green-color)] dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900 transition cursor-pointer"
                                    >
                                        <Pencil className="h-4 w-4" />
                                        <span>Ganti Kata Sandi</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                    </div>




                </main>
            </div>

            <VerifyPasswordModal
                isOpen={isVerifyModalOpen}
                onClose={() => setIsVerifyModalOpen(false)}
            />
        </div>
    );
}
