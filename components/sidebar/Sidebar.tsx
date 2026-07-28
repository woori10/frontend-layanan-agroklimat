"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LogOut, ChevronDown, ChevronRight, X } from "lucide-react";
import { getUserFromToken, logout, type JwtPayload } from "@/lib/auth";
import LogoutModal from "../modal/LogoutModal";
import { sidebarMenuByRole } from "@/config/sidebar-menu";

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState<JwtPayload | null>(null);
    const [logoutModalOpen, setLogoutModalOpen] = useState(false);
    const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        setUser(getUserFromToken());

        const handleToggle = () => {
            setIsOpen((prev) => !prev);
        };
        window.addEventListener("toggle-sidebar", handleToggle);
        return () => {
            window.removeEventListener("toggle-sidebar", handleToggle);
        };
    }, []);

    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

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

    const toggleMenu = (label: string) => {
        setExpandedMenus((prev) => ({
            ...prev,
            [label]: !prev[label],
        }));
    };

    const renderSidebarContent = () => (
        <>
            <div className="flex flex-col items-center gap-4 px-6 pt-8 pb-4">
                <Image
                    src="/images/logo_brmp.svg"
                    alt="Logo BRMP"
                    width={48}
                    height={48}
                    priority
                />
                <span className="text-lg font-bold text-[var(--green-color)] dark:text-zinc-50 text-center leading-tight">
                    BRMP Agroklimat
                </span>
            </div>

            <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
                {user && menuItems.map((item) => {
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

            {user && (
                <div className="border-t border-zinc-200 px-3 py-4 dark:border-zinc-800">
                    <button
                        onClick={() => setLogoutModalOpen(true)}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-650 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/50 cursor-pointer"
                    >
                        <LogOut className="h-5 w-5" />
                        Logout
                    </button>
                </div>
            )}
        </>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex h-screen w-64 flex-col border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 flex-shrink-0">
                {renderSidebarContent()}
            </aside>

            {/* Mobile/Tablet Sidebar Drawer */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex lg:hidden">
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-zinc-900/50 backdrop-blur-xs transition-opacity"
                        onClick={() => setIsOpen(false)}
                    />
                    {/* Drawer Panel */}
                    <aside className="relative flex h-full w-64 flex-col border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 shadow-xl transition-all duration-300">
                        {/* Close button inside drawer */}
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 cursor-pointer"
                            aria-label="Close Sidebar"
                        >
                            <X className="h-5 w-5" />
                        </button>
                        {renderSidebarContent()}
                    </aside>
                </div>
            )}

            <LogoutModal
                isOpen={logoutModalOpen}
                onClose={() => setLogoutModalOpen(false)}
                onConfirm={() => logout(router)}
            />
        </>
    );
}