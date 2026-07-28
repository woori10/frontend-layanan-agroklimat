"use client";

import Navbar from "@/components/navbar/Navbar";
import StatusLayananBadge from "@/components/badge/status-layanan/StatusLayananBadge";
import {
    Droplet,
    Thermometer,
    Beaker,
    FileText,
    Filter,
    ChevronLeft,
    ChevronRight,
    ArrowRight,
} from "lucide-react";
import Link from "next/link";

const requests = [
    {
        id: "#REQ-2024-0891",
        title: "Analisis Data Hidrologi DAS Citarum",
        date: "12 Nov 2024",
        status: "Diproses",
        icon: Droplet,
        iconBg: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
    },
    {
        id: "#REQ-2024-0842",
        title: "Permintaan Data Agroklimat Historis Jabar",
        date: "05 Nov 2024",
        status: "Selesai",
        icon: Thermometer,
        iconBg: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
    },
    {
        id: "#REQ-2024-0715",
        title: "Uji Laboratorium Sampel Tanah Subang",
        date: "22 Okt 2024",
        status: "Selesai",
        icon: Beaker,
        iconBg: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
    },
    {
        id: "#REQ-2024-0650",
        title: "Rekomendasi Pola Tanam Padi Hibrida",
        date: "10 Sep 2024",
        status: "Ditolak",
        icon: FileText,
        iconBg: "bg-red-50 text-red-500 dark:bg-red-950/40 dark:text-red-400"
    }
];


export default function LayananSayaPage() {
    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200">
            <Navbar />

            <main className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Breadcrumb */}
                <div className="flex items-center gap-1 mb-6">
                    <Link
                        href="/"
                        className="flex items-center text-xs font-bold text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition"
                    >
                        <ChevronLeft className="h-4 w-4 mr-0.5" />
                        Riwayat Layanan
                    </Link>
                </div>

                {/* Title and Filter Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-[#2C5E3B] dark:text-emerald-450 tracking-tight">
                            Riwayat Layanan Saya
                        </h1>
                        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                            Pantau status pengajuan layanan Anda. Permohonan yang sedang diproses memerlukan waktu 3-5 hari kerja.
                        </p>
                    </div>

                    <button className="flex items-center justify-center gap-2 rounded-xl bg-[#2C5E3B] hover:bg-[#D4E3FC] text-white px-4 py-2.5 text-sm font-bold transition dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-200 w-fit cursor-pointer self-end md:self-auto">
                        <Filter className="h-4 w-4" />
                        <span>Filter</span>
                    </button>
                </div>

                {/* Table Section */}
                <div className="overflow-hidden rounded-lg border border-zinc-200/80 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-zinc-200/80 dark:divide-zinc-800">
                            <thead className="bg-[#E5E7EB]/50 dark:bg-zinc-950">
                                <tr>
                                    <th scope="col" className="px-6 py-4.5 text-left text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                        ID Permohonan
                                    </th>
                                    <th scope="col" className="px-6 py-4.5 text-left text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                        Jenis Layanan
                                    </th>
                                    <th scope="col" className="px-6 py-4.5 text-left text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                        Tanggal Pengajuan
                                    </th>
                                    <th scope="col" className="px-6 py-4.5 text-left text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th scope="col" className="px-6 py-4.5 text-left text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 bg-white dark:bg-zinc-900">
                                {requests.map((request) => {
                                    const IconComponent = request.icon;
                                    return (
                                        <tr key={request.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 transition-colors">
                                            <td className="px-6 py-5.5 whitespace-nowrap text-sm font-bold text-[#2C5E3B] dark:text-emerald-450">
                                                {request.id}
                                            </td>
                                            <td className="px-6 py-5.5 whitespace-nowrap text-sm text-zinc-800 dark:text-zinc-100 font-semibold">
                                                <div className="flex items-center gap-3">
                                                    <div className={`flex h-8 w-8 items-center justify-center rounded-full ${request.iconBg}`}>
                                                        <IconComponent className="h-4 w-4" />
                                                    </div>
                                                    <span>{request.title}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5.5 whitespace-nowrap text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                                                {request.date}
                                            </td>
                                            <td className="px-6 py-5.5 whitespace-nowrap text-sm">
                                                <StatusLayananBadge status={request.status} />
                                            </td>
                                            <td className="px-6 py-5.5 whitespace-nowrap text-sm font-semibold text-[#2C5E3B] dark:text-emerald-450">
                                                <Link
                                                    href={`/layanan-saya/${encodeURIComponent(request.id)}`}
                                                    className="inline-flex items-center gap-1 hover:underline transition"
                                                >
                                                    <span>Detail</span>
                                                    <ArrowRight className="h-3.5 w-3.5" />
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Table Footer / Pagination */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4.5 bg-[#E5E7EB]/50 dark:bg-zinc-950 border-t border-zinc-200/80 dark:border-zinc-800">
                        <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                            Menampilkan 1-4 dari 12 permohonan
                        </span>

                        <div className="flex items-center gap-1.5">
                            <button className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition disabled:opacity-50" disabled>
                                <ChevronLeft className="h-4 w-4" />
                            </button>

                            <button className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold bg-[#2C5E3B] text-white transition">
                                1
                            </button>
                            <button className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 transition">
                                2
                            </button>
                            <button className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 transition">
                                3
                            </button>

                            <button className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition">
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
