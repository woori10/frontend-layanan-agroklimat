"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/sidebar/Sidebar";
import AppBar from "@/components/appbar/AppBar";
import { getUserFromToken } from "@/lib/auth";
import { Sprout, User as UserIcon } from "lucide-react";

export default function ProfilPage() {
    const router = useRouter();
    const [userEmail, setUserEmail] = useState("");
    const [userName, setUserName] = useState("Pengguna");
    const [userRole, setUserRole] = useState("");
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

    const formatRole = (role: string) => {
        if (!role) return "";
        return role.replace("_", " ").toUpperCase();
    };

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
                                Profil Pengguna
                            </h2>
                            <p className="max-w-xl text-sm text-emerald-50">
                                Detail informasi akun Anda di sistem BRMP Agroklimat.
                            </p>
                        </div>
                    </div>

                    {/* Profile Details Card */}
                    <div className="max-w-2xl rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
                        <div className="flex items-center gap-4 border-b border-zinc-100 pb-6 dark:border-zinc-800">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
                                <UserIcon className="h-8 w-8" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-zinc-900 dark:text-white">{userName}</h3>
                                <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                    {formatRole(userRole)}
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 space-y-4">
                            <div>
                                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                                    Nama Lengkap
                                </label>
                                <p className="mt-1 text-sm font-medium text-zinc-900 dark:text-white">
                                    {userName}
                                </p>
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                                    Email / NIP
                                </label>
                                <p className="mt-1 text-sm font-medium text-zinc-900 dark:text-white">
                                    {userEmail || "-"}
                                </p>
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                                    Hak Akses (Role)
                                </label>
                                <p className="mt-1 text-sm font-medium text-zinc-900 dark:text-white">
                                    {formatRole(userRole)}
                                </p>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
