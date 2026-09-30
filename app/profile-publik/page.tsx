"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import Navbar from "@/components/navbar/Navbar";
import ProfileBanner from "@/components/banner/ProfileBanner";
import { getUserFromToken } from "@/lib/auth";
import { getApiUrl } from "@/lib/api";
import {
    UserCheck,
    Lock,
    Edit,
    ChevronLeft
} from "lucide-react";

// Dynamic import modal agar tidak membebani main thread pada initial page load
const VerifyPasswordModal = dynamic(
    () => import("@/components/modal/VerifyPasswordModal"),
    { ssr: false }
);

interface UserProfile {
    nama: string;
    email: string;
    nip: string;
    no_hp: string;
    instansi: string;
    alamat: string;
}

export default function ProfilPublikPage() {
    const router = useRouter();
    const [profile, setProfile] = useState<UserProfile>({
        nama: "Pengguna",
        email: "",
        nip: "-",
        no_hp: "-",
        instansi: "-",
        alamat: "-",
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("agro_token");

        if (!token) {
            router.push("/login");
            return;
        }

        const user = getUserFromToken();
        if (!user) {
            router.push("/login");
            return;
        }

        if (user.role !== "publik") {
            router.push("/profil");
            return;
        }

        // Tampilkan nama & email seketika dari payload JWT agar UI tidak kosong/shift
        if (user.nama || user.email) {
            setProfile(prev => ({
                ...prev,
                nama: user.nama || prev.nama,
                email: user.email || prev.email,
            }));
        }

        // Ambil data detail profil lengkap dari server
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
                setProfile({
                    nama: data.nama || user.nama || "Pengguna",
                    email: data.email || user.email || "",
                    nip: data.nip || "-",
                    no_hp: data.no_hp || "-",
                    instansi: data.instansi || "-",
                    alamat: data.alamat || "-",
                });
            })
            .catch(() => {
                // Fallback aman dari token jika fetch gagal
                if (user.nama || user.email) {
                    setProfile(prev => ({
                        ...prev,
                        nama: user.nama || prev.nama,
                        email: user.email || prev.email,
                    }));
                }
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [router]);

    const getInitials = (name: string) => {
        if (!name || name === "Pengguna") return "P";
        return name
            .split(" ")
            .filter(Boolean)
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
            <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="pb-4 w-full">
                    {/* Breadcrumb */}
                    <div className="flex justify-between items-center gap-1">
                        <Link
                            href="/"
                            className="inline-flex items-center text-xs font-semibold text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 transition py-1"
                        >
                            <ChevronLeft className="h-4 w-4 mr-0.5" aria-hidden="true" />
                            Kembali ke Beranda
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="contents md:flex md:flex-col md:gap-6 md:col-span-1">
                        {/* Profile Summary Card */}
                        <div className="order-1 w-full rounded-2xl border border-zinc-200/60 bg-white p-8 shadow-xs dark:bg-zinc-900 dark:border-zinc-800 text-center flex flex-col items-center h-fit">
                            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-secondary-green-color text-[var(--green-color)] dark:bg-secondary-green-color dark:text-secondary-green-color text-xl font-extrabold shadow-inner mb-3">
                                {getInitials(profile.nama)}
                            </div>
                            <h2 className="text-lg font-bold text-zinc-900 dark:text-white leading-tight">
                                {profile.nama}
                            </h2>
                            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 pt-2 break-all">
                                {profile.email || "Memuat email..."}
                            </p>
                        </div>

                        {/* Keamanan Akun Card */}
                        <div className="order-3 md:order-2 w-full rounded-2xl border border-zinc-200/60 bg-white p-8 shadow-xs dark:bg-zinc-900 dark:border-zinc-800 flex flex-col h-fit">
                            <div className="w-full space-y-4 text-left">
                                <div className="flex gap-3 items-center">
                                    <div className="flex h-8 w-8 items-center justify-center bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded-lg">
                                        <Lock className="w-4 h-4" aria-hidden="true" />
                                    </div>
                                    <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                                        Keamanan Akun
                                    </h2>
                                </div>
                                <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                                    Jaga keamanan akun Anda dengan mengganti password secara berkala.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => setIsVerifyModalOpen(true)}
                                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-zinc-50 border border-[var(--green-color)]/80 hover:bg-zinc-100 py-2.5 text-sm font-bold text-[var(--green-color)] dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900 transition cursor-pointer"
                                >
                                    <Edit className="h-4 w-4" aria-hidden="true" />
                                    <span>Ganti Kata Sandi</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Left Column: Account Details Grid */}
                    <div className="order-2 md:order-none md:col-span-2 h-full rounded-2xl border border-zinc-200/60 bg-white shadow-xs dark:bg-zinc-900 dark:border-zinc-800 overflow-hidden text-left flex flex-col">
                        {/* Header */}
                        <div className="px-6 sm:px-8 py-6 border-b border-zinc-100 dark:border-zinc-800/60">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-secondary-green-color text-[var(--green-color)] dark:text-secondary-green-color rounded-lg">
                                    <UserCheck className="w-5 h-5" aria-hidden="true" />
                                </div>
                                <div className="flex flex-col">
                                    <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                                        Informasi Pribadi
                                    </h2>
                                    <p className="text-sm font-normal text-zinc-500 dark:text-zinc-400">
                                        Lengkapi data diri anda.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Fields */}
                        <div className="px-6 sm:px-8 py-6 flex-grow">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                                {/* Nama Lengkap */}
                                <div className="space-y-1.5 pb-2">
                                    <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                                        Nama Lengkap
                                    </label>
                                    <div className="text-sm font-medium text-zinc-800 dark:text-zinc-200 min-h-[46px] flex items-center px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                                        {profile.nama}
                                    </div>
                                </div>

                                {/* NIK */}
                                <div className="space-y-1.5 pb-2">
                                    <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                                        NIK / No. Identitas
                                    </label>
                                    <div className="text-sm font-medium text-zinc-800 dark:text-zinc-200 min-h-[46px] flex items-center px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                                        {isLoading ? "..." : profile.nip}
                                    </div>
                                </div>

                                {/* Email */}
                                <div className="space-y-1.5 pb-2">
                                    <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                                        Email
                                    </label>
                                    <div className="text-sm font-medium text-zinc-800 dark:text-zinc-200 min-h-[46px] flex items-center px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                                        {profile.email || "-"}
                                    </div>
                                </div>

                                {/* No Telepon */}
                                <div className="space-y-1.5 pb-2">
                                    <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                                        No. Telepon / WhatsApp
                                    </label>
                                    <div className="text-sm font-medium text-zinc-800 dark:text-zinc-200 min-h-[46px] flex items-center px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                                        {isLoading ? "..." : profile.no_hp}
                                    </div>
                                </div>
                            </div>

                            {/* Asal Instansi */}
                            <div className="space-y-1.5 pb-2 mt-4">
                                <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                                    Asal Instansi
                                </label>
                                <div className="text-sm font-medium text-zinc-800 dark:text-zinc-200 min-h-[46px] flex items-center px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                                    {isLoading ? "..." : profile.instansi}
                                </div>
                            </div>

                            {/* Alamat */}
                            <div className="space-y-1.5 pb-2 mt-4">
                                <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                                    Alamat Lengkap
                                </label>
                                <div className="text-sm font-medium text-zinc-800 dark:text-zinc-200 min-h-[46px] flex items-center px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                                    {isLoading ? "..." : profile.alamat}
                                </div>
                            </div>

                            <div className="flex justify-end pt-6">
                                <Link
                                    href="/profile-publik/edit"
                                    className="inline-flex items-center justify-center gap-2 bg-[var(--green-color)] hover:bg-[#1E4329] text-white px-5 py-2.5 rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer"
                                >
                                    <Edit className="w-4 h-4" aria-hidden="true" />
                                    <span>Edit Profile</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {isVerifyModalOpen && (
                <VerifyPasswordModal
                    isOpen={isVerifyModalOpen}
                    onClose={() => setIsVerifyModalOpen(false)}
                />
            )}
        </div>
    );
}
