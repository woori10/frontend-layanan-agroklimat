"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, Search, Calendar, Bell, LogOut, CheckCheck } from "lucide-react";
import { getUserFromToken, logout } from "@/lib/auth";
import { getNotifikasi, markNotifikasiRead, markAllNotifikasiRead, NotifikasiItem } from "@/lib/notifikasi";
import LogoutModal from "@/components/modal/LogoutModal";
import Link from "next/link";

const STAFF_ROLES = ["super_admin", "admin", "kepala_balai", "pegawai"];

const getDashboardTitle = (role: string) => {
    switch (role.toLowerCase().replace(" ", "_")) {
        case "super_admin":
            return "Dashboard Super Admin";
        case "admin":
            return "Dashboard Admin";
        case "kepala_balai":
            return "Dashboard Kepala Balai";
        case "pegawai":
            return "Dashboard Pegawai Unit Teknis";
        default:
            return "";
    }
};

interface AppBarProps {
    onMenuClick?: () => void;
    title?: string;
}

export default function AppBar({ onMenuClick, title }: AppBarProps) {
    const router = useRouter();
    const [userName, setUserName] = useState("Pengguna");
    const [userRole, setUserRole] = useState("Pengguna");
    const [rawRole, setRawRole] = useState("");
    const [notifications, setNotifications] = useState<NotifikasiItem[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifikasiDropdownOpen, setNotifikasiDropdownOpen] = useState(false);
    const [logoutModalOpen, setLogoutModalOpen] = useState(false);

    const dashboardTitle = title || getDashboardTitle(rawRole);

    useEffect(() => {
        const storedEmail = localStorage.getItem("agro_user_email");
        const user = getUserFromToken();
        if (user) {
            if (user.nama) {
                setUserName(user.nama);
            } else if (storedEmail) {
                setUserName(storedEmail.split("@")[0]);
            }
            if (user.role) {
                setRawRole(user.role);
                setUserRole(user.role.replace("_", " "));
            }

            const staffRoles = ["super_admin", "admin", "kepala_balai", "pegawai"];
            if (staffRoles.includes(user.role)) {
                fetchStaffNotifications();
            }
        }
    }, []);

    const fetchStaffNotifications = () => {
        getNotifikasi()
            .then((data: NotifikasiItem[]) => {
                if (!Array.isArray(data)) return;
                setNotifications(data);
                const unread = data.filter((n) => !n.dibaca).length;
                setUnreadCount(unread);
            })
            .catch((err) => {
                console.error("Gagal mengambil notifikasi staff:", err);
            });
    };

    const handleToggleNotifikasi = () => {
        const nextOpen = !notifikasiDropdownOpen;
        setNotifikasiDropdownOpen(nextOpen);
        if (nextOpen) {
            fetchStaffNotifications();
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await markAllNotifikasiRead();
            setNotifications((prev) => prev.map((n) => ({ ...n, dibaca: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error("Gagal menandai semua notifikasi dibaca:", err);
        }
    };

    const handleNotificationItemClick = async (notif: NotifikasiItem) => {
        if (!notif.dibaca) {
            try {
                await markNotifikasiRead(notif.id);
                setNotifications((prev) =>
                    prev.map((n) => (n.id === notif.id ? { ...n, dibaca: true } : n))
                );
                setUnreadCount((prev) => Math.max(0, prev - 1));
            } catch (err) {
                console.error("Gagal menandai notifikasi dibaca:", err);
            }
        }
        setNotifikasiDropdownOpen(false);
        const link = getNotificationLink(notif, rawRole);
        if (link && link !== "#") {
            router.push(link);
        }
    };

    const getNotificationLink = (notif: NotifikasiItem, role: string) => {
        if (!notif.tiket) return "#";
        const cleanRole = role.replace(" ", "_");
        const layananSlug = notif.tiket.layanan?.slug || notif.tiket.id;
        const noTiket = notif.tiket.no_tiket || notif.tiket.id;
        switch (cleanRole) {
            case "admin":
            case "super_admin":
                return `/verifikasi-layanan/${layananSlug}/${noTiket}`;
            case "kepala_balai":
                return `/persetujuan-layanan/${layananSlug}/${noTiket}`;
            case "pegawai":
                return `/penugasan-layanan/${layananSlug}/${noTiket}`;
            default:
                return "#";
        }
    };

    const formatTimeAgo = (timestamp: string) => {
        try {
            const date = new Date(timestamp);
            const now = new Date();
            const isToday = date.toDateString() === now.toDateString();
            const timeStr = date.toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
            });

            if (isToday) return `Hari ini pukul ${timeStr}`;

            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            if (date.toDateString() === yesterday.toDateString()) {
                return `Kemarin pukul ${timeStr}`;
            }

            return date.toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
            });
        } catch {
            return "";
        }
    };

    return (
        <>
            <header className="flex items-center justify-between border-b border-zinc-200/80 bg-white px-6 py-4 dark:bg-zinc-900 dark:border-zinc-800">
                <div className="flex items-center gap-3 sm:gap-4">
                    <button
                        onClick={() => {
                            window.dispatchEvent(new Event("toggle-sidebar"));
                            if (onMenuClick) onMenuClick();
                        }}
                        className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 lg:hidden dark:hover:bg-zinc-800 cursor-pointer"
                    >
                        <Menu className="h-6 w-6" />
                    </button>
                    {dashboardTitle && (
                        <h1 className="text-base sm:text-lg font-semibold text-[var(--foreground)] dark:text-zinc-100 tracking-tight">
                            {dashboardTitle}
                        </h1>
                    )}
                </div>

                <div className="ml-auto relative flex items-center gap-4">
                    <div className="relative">
                        <button
                            onClick={handleToggleNotifikasi}
                            className="relative rounded-xl border border-zinc-200 p-2 text-zinc-500 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800 cursor-pointer transition"
                        >
                            <Bell className="h-4 w-4" />
                            {unreadCount > 0 && (
                                <span className="absolute top-1 right-1 flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                </span>
                            )}
                        </button>

                        {notifikasiDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-zinc-200/90 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                                {/* Header */}
                                <div className="px-4 py-3.5 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-white dark:bg-zinc-950">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100">
                                            Notifikasi
                                        </h3>
                                        {unreadCount > 0 && (
                                            <span className="text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 font-bold px-2 py-0.5 rounded-full">
                                                {unreadCount} baru
                                            </span>
                                        )}
                                    </div>
                                    <button
                                        onClick={handleMarkAllRead}
                                        title="Tandai semua sudah dibaca"
                                        className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 dark:hover:text-zinc-200 dark:hover:bg-zinc-800 transition cursor-pointer"
                                    >
                                        <CheckCheck className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* List Notifikasi */}
                                <div className="max-h-80 sm:max-h-96 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-900">
                                    {notifications.length === 0 ? (
                                        <div className="px-4 py-10 text-center text-xs text-zinc-400 dark:text-zinc-500">
                                            <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                            Belum ada notifikasi.
                                        </div>
                                    ) : (
                                        notifications.map((notif) => (
                                            <div
                                                key={notif.id}
                                                onClick={() => handleNotificationItemClick(notif)}
                                                className="flex items-start gap-3.5 p-3.5 sm:p-4 hover:bg-zinc-50/90 dark:hover:bg-zinc-900/60 transition cursor-pointer text-left"
                                            >
                                                {/* Avatar Bell Bulat Abu-abu */}
                                                <div className="flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-zinc-100 dark:bg-zinc-800/90 flex items-center justify-center text-zinc-500 dark:text-zinc-400 mt-0.5">
                                                    <Bell className="w-4 h-4" />
                                                </div>

                                                {/* Teks Judul, Titik Hijau, Pesan & Waktu */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <h4 className="font-semibold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 leading-snug">
                                                            {notif.judul || "Aktivitas Layanan"}
                                                        </h4>
                                                        {!notif.dibaca && (
                                                            <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0 mt-1.5" />
                                                        )}
                                                    </div>
                                                    <p className="text-[11px] sm:text-xs text-zinc-600 dark:text-zinc-300 mt-1 leading-relaxed break-words whitespace-normal">
                                                        {notif.pesan}
                                                    </p>
                                                    <span className="text-[10px] sm:text-[11px] text-zinc-400 dark:text-zinc-500 mt-1.5 block font-normal">
                                                        {formatTimeAgo(notif.timestamp)}
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                {rawRole === "super_admin" || rawRole === "kepala_balai" ? (
                                    <div className="px-4 py-2.5 border-t border-zinc-100 dark:border-zinc-800 text-center bg-zinc-50/50 dark:bg-zinc-900/20">
                                        <Link
                                            href="/audit-log"
                                            onClick={() => setNotifikasiDropdownOpen(false)}
                                            className="text-[11px] font-bold text-[var(--green-color)] dark:text-secondary-green-color hover:underline"
                                        >
                                            Lihat Semua Audit Log
                                        </Link>
                                    </div>
                                ) : null}
                            </div>
                        )}
                    </div>

                    {/* User Profile */}
                    <div className="flex items-center gap-2 pl-3 sm:pl-4 border-l border-zinc-200 dark:border-zinc-800">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary-green-color text-green-color dark:bg-secondary-green-color/40 dark:text-secondary-green-color font-bold text-xs uppercase">
                            {userName.charAt(0)}
                        </div>
                        <div className="hidden md:flex flex-col text-left">
                            <span className="text-xs font-semibold text-zinc-850 dark:text-zinc-50 capitalize leading-none mb-0.5">{userName}</span>
                            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium capitalize">
                                {userRole}
                            </span>
                        </div>
                    </div>

                    {/* Logout Button */}
                    {STAFF_ROLES.includes(rawRole) && (
                        <div className="pl-3 sm:pl-4 border-l border-zinc-200 dark:border-zinc-800">
                            <button
                                type="button"
                                onClick={() => setLogoutModalOpen(true)}
                                className="flex items-center gap-1.5 sm:gap-2 rounded-xl text-xs font-semibold text-red-600 hover:text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-400 dark:hover:bg-red-950/40 transition cursor-pointer shadow-xs"
                                title="Logout"
                                aria-label="Logout"
                            >
                                <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
                            </button>
                        </div>
                    )}
                </div>
            </header>

            <LogoutModal
                isOpen={logoutModalOpen}
                onClose={() => setLogoutModalOpen(false)}
                onConfirm={() => logout(router)}
            />
        </>
    );
}