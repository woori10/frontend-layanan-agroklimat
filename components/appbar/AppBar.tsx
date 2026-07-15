"use client";

import { useEffect, useState } from "react";
import { Menu, Search, Calendar, Bell } from "lucide-react";
import { getUserFromToken } from "@/lib/auth";

interface AppBarProps {
    onMenuClick?: () => void;
}

export default function AppBar({ onMenuClick }: AppBarProps) {
    const [userName, setUserName] = useState("Pengguna");

    useEffect(() => {
        const storedEmail = localStorage.getItem("agro_user_email");
        const user = getUserFromToken();
        if (user) {
            if (user.nama) {
                setUserName(user.nama);
            } else if (storedEmail) {
                setUserName(storedEmail.split("@")[0]);
            }
        }
    }, []);

    return (
        <header className="flex items-center justify-between border-b border-zinc-200/80 bg-white px-6 py-4 dark:bg-zinc-900 dark:border-zinc-800">
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 lg:hidden dark:hover:bg-zinc-800 cursor-pointer"
                >
                    <Menu className="h-6 w-6" />
                </button>
                <div className="hidden sm:flex items-center gap-2 rounded-xl bg-zinc-50 border border-zinc-200 px-3 py-1.5 dark:bg-zinc-950 dark:border-zinc-800">
                    <Search className="h-4 w-4 text-zinc-400" />
                    <input
                        type="text"
                        placeholder="Cari lahan atau sensor..."
                        className="bg-transparent text-xs text-zinc-800 placeholder-zinc-400 focus:outline-none dark:text-zinc-50"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                {/* <div className="flex items-center gap-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                    <Calendar className="h-4 w-4" />
                    <span>Kamis, 9 Juli 2026</span>
                </div> */}
                <button className="relative rounded-xl border border-zinc-200 p-2 text-zinc-500 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800 cursor-pointer">
                    <Bell className="h-4 w-4" />
                    <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-emerald-500"></span>
                </button>

                {/* User Profile */}
                <div className="flex items-center gap-2 pl-4 border-l border-zinc-200 dark:border-zinc-800">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 font-bold text-xs uppercase">
                        {userName.charAt(0)}
                    </div>
                    <div className="hidden md:flex flex-col text-left">
                        <span className="text-xs font-semibold text-zinc-850 dark:text-zinc-50 capitalize leading-none mb-0.5">{userName}</span>
                        <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium capitalize">
                            {getUserFromToken()?.role.replace("_", " ") || "Pengguna"}
                        </span>
                    </div>
                </div>
            </div>
        </header>
    );
}
