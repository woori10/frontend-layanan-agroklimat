"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/sidebar/Sidebar";
import AppBar from "@/components/appbar/AppBar";
import { getUserFromToken, getRedirectPath } from "@/lib/auth";
import {
    Sprout,
    ChevronLeft,
    ChevronRight,
    Pencil,
    Trash2,
    Database,
    ShieldAlert,
    Plus,
    ToggleLeft,
    ToggleRight
} from "lucide-react";

export default function KelolaLayananPage() {
    const router = useRouter();
    const [userEmail, setUserEmail] = useState("petani@agroklimat.com");
    const [userName, setUserName] = useState("Pengguna");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    const [layananList, setLayananList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Authenticate mockup and fetch data on client side
    useEffect(() => {
        setMounted(true);
        const token = localStorage.getItem("agro_token");
        const storedEmail = localStorage.getItem("agro_user_email");

        if (!token) {
            router.push("/login");
            return;
        }

        if (storedEmail) {
            setUserEmail(storedEmail);
        }
        const user = getUserFromToken();
        if (user) {
            if (user.role !== "super_admin") {
                router.push(getRedirectPath(user.role));
                return;
            }
            if (user.nama) {
                setUserName(user.nama);
            } else if (storedEmail) {
                setUserName(storedEmail.split("@")[0]);
            }
        }

        // Fetch layanan from backend
        const fetchLayanan = async () => {
            try {
                const response = await fetch("http://localhost:3000/layanan", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (!response.ok) {
                    throw new Error("Gagal mengambil data layanan");
                }
                const data = await response.json();
                const initializedData = data.map((layanan: any) => ({
                    ...layanan,
                    is_active: layanan.is_active !== undefined ? layanan.is_active : true
                }));
                setLayananList(initializedData);
            } catch (err: any) {
                console.error(err);
                setError(err.message || "Terjadi kesalahan.");
            } finally {
                setLoading(false);
            }
        };

        fetchLayanan();
    }, [router]);

    const formatBiaya = (biaya: any) => {
        if (!biaya) return "-";
        if (biaya.tipe === "gratis") return "Gratis";
        if (biaya.tipe === "tetap") {
            return biaya.nominal ? `Rp ${biaya.nominal.toLocaleString("id-ID")}` : (biaya.catatan || "Tarif PNBP");
        }
        if (biaya.tipe === "per_satuan") {
            return `Rp ${biaya.nominal?.toLocaleString("id-ID")} / ${biaya.satuan}`;
        }
        return JSON.stringify(biaya);
    };

    const handleEdit = (layanan: any) => {
        alert(`Edit layanan: ${layanan.nama_layanan}`);
    };

    const handleDelete = (id: number) => {
        if (confirm("Apakah Anda yakin ingin menghapus layanan ini? (Mockup)")) {
            alert(`Menghapus layanan ID: ${id}`);
        }
    };

    const handleToggle = (id: number) => {
        setLayananList((prev) =>
            prev.map((layanan) =>
                layanan.id === id ? { ...layanan, is_active: !layanan.is_active } : layanan
            )
        );
    };

    if (!mounted) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 overflow-hidden font-sans">
            {/* Sidebar for Desktop & Mobile */}
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
                                Kelola Master Layanan
                            </h2>
                            <p className="max-w-xl text-sm text-emerald-50 font-medium">
                                Konfigurasi master data layanan agroklimat dan hidrologi, termasuk skema biaya, persyaratan dokumen, dan estimasi waktu pengerjaan (SLA).
                            </p>
                        </div>
                    </div>

                    {error && (
                        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400 flex items-center gap-2">
                            <ShieldAlert className="h-5 w-5 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}
                    <div className="flex justify-end">
                        <button
                            onClick={() => router.push("/kelola-layanan/tambah")}
                            className="inline-flex items-center gap-2 rounded-xl bg-[var(--green-color)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#22482E] transition shadow-sm cursor-pointer"
                        >
                            <Plus className="h-4 w-4" />
                            Tambah Layanan
                        </button>
                    </div>

                    {/* Table Section */}
                    <div className="overflow-hidden rounded-lg border border-zinc-200/80 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                        <div className="overflow-x-auto">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Memuat data layanan...</p>
                                </div>
                            ) : layananList.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-zinc-400 dark:text-zinc-500">
                                    <Database className="h-12 w-12 stroke-1 mb-2" />
                                    <p className="text-sm font-semibold">Tidak Ada Data</p>
                                    <p className="text-xs">Belum ada layanan terdaftar di database.</p>
                                </div>
                            ) : (
                                <table className="min-w-full divide-y divide-zinc-200/80 dark:divide-zinc-800">
                                    <thead className="bg-[#E5E7EB]/50 dark:bg-zinc-950">
                                        <tr>
                                            <th scope="col" className="px-6 py-4.5 text-left text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider w-16">
                                                No
                                            </th>
                                            <th scope="col" className="px-6 py-4.5 text-left text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider">
                                                Nama Layanan
                                            </th>
                                            <th scope="col" className="px-6 py-4.5 text-left text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider">
                                                Tarif / Biaya
                                            </th>
                                            <th scope="col" className="px-6 py-4.5 text-left text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider w-36">
                                                Status
                                            </th>
                                            <th scope="col" className="px-6 py-4.5 text-left text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider w-36">
                                                Aksi
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 bg-white dark:bg-zinc-900">
                                        {layananList.map((layanan, idx) => {
                                            return (
                                                <tr key={layanan.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 transition-colors">
                                                    <td className="px-6 py-5.5 whitespace-nowrap text-sm font-semibold text-[#2C5E3B] dark:text-emerald-450 text-left">
                                                        {idx + 1}
                                                    </td>
                                                    <td className="px-6 py-5.5 whitespace-nowrap text-sm text-zinc-800 dark:text-zinc-100 font-semibold text-left">
                                                        {layanan.nama_layanan}
                                                    </td>
                                                    <td className="px-6 py-5.5 whitespace-nowrap text-sm text-zinc-500 dark:text-zinc-400 font-medium text-left">
                                                        {formatBiaya(layanan.biaya)}
                                                    </td>
                                                    <td className="px-6 py-5.5 whitespace-nowrap text-sm text-left">
                                                        {layanan.is_active ? (
                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-450">
                                                                Aktif
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-650 border border-zinc-200 dark:bg-zinc-800/30 dark:text-zinc-400 dark:border-zinc-800">
                                                                Non-Aktif
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-5.5 whitespace-nowrap text-sm text-left">
                                                        <div className="flex items-center justify-start gap-2">
                                                            <button
                                                                onClick={() => handleEdit(layanan)}
                                                                className="inline-flex items-center justify-center rounded-lg bg-emerald-50 p-2 text-emerald-700 hover:bg-emerald-100 transition dark:bg-emerald-950/40 dark:text-emerald-450 dark:hover:bg-emerald-900/40 cursor-pointer"
                                                                title="Edit"
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleToggle(layanan.id)}
                                                                className={`inline-flex items-center justify-center rounded-lg p-1.5 transition cursor-pointer ${layanan.is_active
                                                                        ? "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                                                                        : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400 dark:hover:bg-emerald-900/40"
                                                                    }`}
                                                                title={layanan.is_active ? "Non-aktifkan" : "Aktifkan"}
                                                            >
                                                                {layanan.is_active ? (
                                                                    <ToggleRight className="h-5 w-5 text-emerald-600" />
                                                                ) : (
                                                                    <ToggleLeft className="h-5 w-5 text-zinc-400" />
                                                                )}
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        {/* Table Footer / Pagination */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4.5 bg-[#E5E7EB]/50 dark:bg-zinc-950 border-t border-zinc-200/80 dark:border-zinc-800">
                            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                                Menampilkan 1-{layananList.length} dari {layananList.length} layanan
                            </span>

                            <div className="flex items-center gap-1.5">
                                <button className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition disabled:opacity-50" disabled>
                                    <ChevronLeft className="h-4 w-4" />
                                </button>

                                <button className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold bg-[#2C5E3B] text-white transition">
                                    1
                                </button>

                                <button className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition disabled:opacity-50" disabled>
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
