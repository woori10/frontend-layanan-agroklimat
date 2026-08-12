"use client";
import Link from "next/link";
import { ChevronLeft, Edit } from "lucide-react";
import Navbar from "@/components/navbar/Navbar";
import EditProfileBanner from "@/components/banner/EditProfileBanner";
import EditProfile from "@/components/form/profile/EditProfile";

export default function EditProfilePublikPage() {
    return (
        <div className="flex min-h-screen flex-col bg-[#F8FAFC] text-zinc-900 dark:text-zinc-50 overflow-x-hidden font-sans">
            {/* Header */}
            <Navbar />
            <EditProfileBanner />

            {/* Main Content */}
            <main className="flex-grow max-w-5xl w-full mx-auto px-8 sm:px-6 lg:px-8 py-8">
                <div className="pb-2 w-full">
                    <div>
                        {/* Breadcrumb */}
                        <div className="flex items-center gap-1 mb-4">
                            <Link
                                href="/profile-publik"
                                className="flex items-center text-xs font-semibold text-[var(--foreground)] hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition"
                            >
                                <ChevronLeft className="h-4 w-4 mr-0.5" />
                                Kembali ke Profil Saya
                            </Link>
                        </div>

                    </div>
                </div>
                <div className="flex flex-col justify-center items-center w-full">
                    <EditProfile />
                </div>
            </main>
        </div>
    );
}