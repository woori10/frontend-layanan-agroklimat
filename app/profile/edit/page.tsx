'use client';

import Sidebar from "@/components/sidebar/Sidebar";
import AppBar from "@/components/appbar/AppBar";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useState } from "react";
import EditProfile from "@/components/form/profile/EditProfile";

export default function EditProfilePage() {

    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 overflow-hidden font-sans">
            {/* Sidebar for Desktop */}
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-y-auto">
                <AppBar onMenuClick={() => setSidebarOpen(true)} />
                <main className="flex-1 p-8 space-y-6">
                    <div className="flex items-center gap-2">
                        <Link
                            href={`/profile`}
                            className="flex items-center text-sm font-medium text-[var(--foreground)] hover:cursor-pointer transition"
                        >
                            <ChevronLeft className="h-4 w-4 mr-0.5" />
                            Profil
                        </Link>
                        <span className="text-sm text-[var(--foreground)] dark:text-zinc-600">/</span>
                        <span className="text-sm font-medium text-[var(--foreground)] dark:text-zinc-450">
                            Edit Profile
                        </span>
                        {/* <span className="text-sm text-[var(--foreground)] dark:text-zinc-600">/</span>
                        <span className="text-sm font-semibold text-[var(--green-color)]">
                            {tiket.no_tiket}
                        </span> */}
                    </div>

                    <div className="w-full">
                        <EditProfile isStaff={true} />
                    </div>
                </main>
            </div>
        </div>
    );
}