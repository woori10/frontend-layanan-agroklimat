"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LogOut, ChevronDown, ChevronRight } from "lucide-react";
import { getUserFromToken, logout, type JwtPayload } from "@/lib/auth";
import { sidebarMenuByRole } from "@/config/sidebar-menu";

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState<JwtPayload | null>(null);
    const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});

    useEffect(() => {
        setUser(getUserFromToken());
    }, []);

    const menuItems = sidebarMenuByRole[user?.role || ""] || [];

    useEffect(() => {
        if (pathname && menuItems.length > 0) {
            const initialExpanded: Record<string, boolean> = {};
            menuItems.forEach((item) => {
                if (item.subItems) {
                    const hasActiveSubItem = item.subItems.some((sub) => pathname === sub.href);
                    if (hasActiveSubItem) {
                        initialExpanded[item.label] = true;
                    }
                }
            });
            setExpandedMenus((prev) => ({ ...prev, ...initialExpanded }));
        }
    }, [pathname, menuItems]);

    if (!user) return null;

    const toggleMenu = (label: string) => {
        setExpandedMenus((prev) => ({
            ...prev,
            [label]: !prev[label],
        }));
    };

    return (
        <aside className="flex h-screen w-64 flex-col border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex items-center gap-2 border-b border-zinc-200 px-6 py-5 dark:border-zinc-800">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 0 0 4.5 4.5H18a3.75 3.75 0 0 0 1.332-7.257 3 3 0 0 0-3.758-3.848 5.25 5.25 0 0 0-10.233 2.33A4.502 4.502 0 0 0 2.25 15Z" />
                    </svg>
                </div>
                <span className="text-lg font-bold text-zinc-900 dark:text-zinc-50">AgroKlimat</span>
            </div>

            <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
                {menuItems.map((item) => {
                    const Icon = item.icon;

                    if (item.subItems && item.subItems.length > 0) {
                        const isExpanded = !!expandedMenus[item.label];
                        const hasActiveSub = item.subItems.some((sub) => pathname === sub.href);

                        return (
                            <div key={item.label} className="space-y-1">
                                <button
                                    onClick={() => toggleMenu(item.label)}
                                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-xs font-medium transition-colors cursor-pointer ${hasActiveSub
                                        ? "bg-emerald-50/50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                                        : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Icon className="h-5 w-5" />
                                        <span>{item.label}</span>
                                    </div>
                                    {isExpanded ? (
                                        <ChevronDown className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
                                    ) : (
                                        <ChevronRight className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
                                    )}
                                </button>

                                {isExpanded && (
                                    <div className="mt-1 space-y-1 pl-4 border-l border-zinc-200 dark:border-zinc-800 ml-5">
                                        {item.subItems.map((sub) => {
                                            const isSubActive = pathname === sub.href;
                                            const SubIcon = sub.icon;
                                            return (
                                                <Link
                                                    key={sub.href}
                                                    href={sub.href}
                                                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${isSubActive
                                                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
                                                        : "text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
                                                        }`}
                                                >
                                                    {SubIcon && <SubIcon className="h-4 w-4" />}
                                                    <span>{sub.label}</span>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    }

                    const isActive = item.href ? pathname === item.href : false;
                    return (
                        <Link
                            key={item.href || item.label}
                            href={item.href || "#"}
                            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium transition-colors ${isActive
                                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
                                : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
                                }`}
                        >
                            <Icon className="h-5 w-5" />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            <div className="border-t border-zinc-200 px-3 py-4 dark:border-zinc-800">
                <button
                    onClick={() => logout(router)}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/50"
                >
                    <LogOut className="h-5 w-5" />
                    Keluar
                </button>
            </div>
        </aside>
    );
}