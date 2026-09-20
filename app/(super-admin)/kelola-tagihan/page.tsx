"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/sidebar/Sidebar";
import AppBar from "@/components/appbar/AppBar";
import { getUserFromToken, getRedirectPath } from "@/lib/auth";
import { getAllTagihan } from "@/lib/tiket";
import { Search, ChevronLeft, ChevronRight, Eye, ArrowUpDown, ExternalLink, Pencil } from "lucide-react";

interface TagihanItem {
    id: number;
    tiket_id: number;
    jumlah: number;
    status_bayar: "menunggu" | "lunas" | "batal";
    bukti_bayar?: string | null;
    tanggal_lunas?: string | null;
    bank_pengirim?: string | null;
    nama_pengirim?: string | null;
    tanggal_transfer?: string | null;
    createdAt: string;
    updatedAt: string;
    tiket?: {
        id: number;
        no_tiket: string;
        status: string;
        tanggal_submit: string;
        jawaban_form?: any;
        user?: {
            id: number;
            nama: string;
            email: string;
            no_hp?: string;
        };
        layanan?: {
            id: number;
            nama_layanan: string;
            slug: string;
        };
        unit_teknis?: {
            id: number;
            nama: string;
        };
    };
}

function formatDate(dateStr?: string | null) {
    if (!dateStr) return "-";
    try {
        const date = new Date(dateStr);
        return date.toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric"
        });
    } catch {
        return dateStr;
    }
}

export default function KelolaTagihanPage() {
    const router = useRouter();
    const [userEmail, setUserEmail] = useState("petani@agroklimat.com");
    const [userName, setUserName] = useState("Pengguna");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Data tagihan dari database
    const [tagihans, setTagihans] = useState<TagihanItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filter & Search
    const [activeTab, setActiveTab] = useState("semua");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortAsc, setSortAsc] = useState(false);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Rekening info state
    const [rekeningInfo, setRekeningInfo] = useState({
        namaBank: "Bank Mandiri",
        noRekening: "137-00-1234567-8",
        namaPemilik: "Balai Agroklimatologi",
        tipe: "PNBP",
        status: "Aktif",
        instansi: "Kementerian Pertanian / BSIP",
    });

    // Authenticate super_admin
    useEffect(() => {
        setMounted(true);
        const token = localStorage.getItem("agro_token");
        const storedEmail = localStorage.getItem("agro_user_email");

        if (!token) {
            router.push("/login");
            return;
        }

        if (storedEmail) setUserEmail(storedEmail);
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

        // Load saved rekening info from localStorage if available
        const savedBank = localStorage.getItem("agro_rekening_bank");
        const savedNo = localStorage.getItem("agro_rekening_nomor");
        const savedPemilik = localStorage.getItem("agro_rekening_pemilik");
        const savedTipe = localStorage.getItem("agro_rekening_tipe");
        const savedStatus = localStorage.getItem("agro_rekening_status");
        const savedInstansi = localStorage.getItem("agro_rekening_instansi");

        if (savedBank || savedNo || savedPemilik || savedTipe || savedStatus || savedInstansi) {
            setRekeningInfo({
                namaBank: savedBank || "Bank Mandiri",
                noRekening: savedNo || "137-00-1234567-8",
                namaPemilik: savedPemilik || "Balai Agroklimatologi",
                tipe: savedTipe ? savedTipe.split(" ")[0] : "PNBP",
                status: savedStatus || "Aktif",
                instansi: savedInstansi || "Kementerian Pertanian / BSIP",
            });
        }

        // Fetch data tagihan awal dari database
        fetchTagihanData(true);

        // 1. Auto-refresh saat kembali fokus ke tab / window (misal setelah buka detail atau edit)
        const handleFocus = () => {
            fetchTagihanData(false);
        };
        window.addEventListener("focus", handleFocus);

        // 2. Polling otomatis setiap 10 detik di background tanpa menampilkan spinner reload
        const intervalId = setInterval(() => {
            fetchTagihanData(false);
        }, 10000);

        return () => {
            window.removeEventListener("focus", handleFocus);
            clearInterval(intervalId);
        };
    }, [router]);

    const fetchTagihanData = async (showLoading = false) => {
        try {
            if (showLoading) setLoading(true);
            setError(null);
            const data = await getAllTagihan();
            setTagihans(Array.isArray(data) ? data : []);
        } catch (err: any) {
            console.error("Gagal mengambil data tagihan:", err);
            if (showLoading) {
                setError(err.message || "Gagal mengambil data tagihan");
            }
        } finally {
            if (showLoading) setLoading(false);
        }
    };

    // Kalkulasi Statistik Real-Time dari Database
    const totalUangMasuk = useMemo(() => {
        return tagihans
            .filter((t) => t.status_bayar === "lunas")
            .reduce((sum, t) => sum + (t.jumlah || 0), 0);
    }, [tagihans]);

    const totalDataTagihan = tagihans.length;

    // Filter tagihan berdasarkan tab status bayar & pencarian
    const filteredTagihans = useMemo(() => {
        return tagihans.filter((item) => {
            // Filter tab: Status Pembayaran
            if (activeTab !== "semua" && item.status_bayar !== activeTab) {
                return false;
            }

            // Filter search query
            if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase();
                const noTiket = (item.tiket?.no_tiket || "").toLowerCase();
                const nama = (
                    item.nama_pengirim ||
                    item.tiket?.jawaban_form?.nama_lengkap ||
                    item.tiket?.user?.nama ||
                    ""
                ).toLowerCase();
                const namaLayanan = (item.tiket?.layanan?.nama_layanan || "").toLowerCase();
                const bank = (item.bank_pengirim || "").toLowerCase();

                return (
                    noTiket.includes(query) ||
                    nama.includes(query) ||
                    namaLayanan.includes(query) ||
                    bank.includes(query)
                );
            }

            return true;
        }).sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return sortAsc ? dateA - dateB : dateB - dateA;
        });
    }, [tagihans, activeTab, searchQuery, sortAsc]);

    // Pagination calculation
    const totalPages = Math.max(1, Math.ceil(filteredTagihans.length / itemsPerPage));
    const paginatedTagihans = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredTagihans.slice(start, start + itemsPerPage);
    }, [filteredTagihans, currentPage, itemsPerPage]);

    // Reset pagination ketika filter berubah
    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab, searchQuery]);

    if (!mounted) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-secondary-green-color border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 overflow-hidden font-sans">
            <Sidebar />

            <div className="flex flex-col flex-1 overflow-y-auto">
                <AppBar onMenuClick={() => setSidebarOpen(true)} />

                <main className="flex-1 p-8 space-y-6">
                    {/* Header Section */}
                    <div className="relative overflow-hidden space-y-3 rounded-xl">
                        <h1 className="text-2xl font-semibold md:text-3xl text-[var(--foreground)] dark:text-zinc-50">
                            Kelola <span className="text-green-color">Tagihan</span>
                        </h1>
                        <p className="max-w-xl text-sm font-medium text-zinc-500 dark:text-zinc-400">
                            Manajemen Data Rekening & Tagihan Layanan
                        </p>
                    </div>

                    {/* Card Section */}
                    <div className="w-full">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            {/* LEFT - Statistics */}
                            <div className="md:col-span-2 flex flex-col gap-4">
                                {/* Total Uang Masuk */}
                                <div className="w-full rounded-xl border border-zinc-200/60 bg-white p-5 shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
                                    <div className="flex flex-col gap-1">
                                        <h1 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">Total Uang Masuk</h1>
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl font-bold text-[#19363B] dark:text-white">
                                                Rp {totalUangMasuk.toLocaleString("id-ID")}
                                            </span>
                                            <span className="text-xs font-medium text-green-500">
                                                {tagihans.filter((t) => t.status_bayar === "lunas").length} Lunas
                                            </span>
                                        </div>
                                        <span className="text-xs text-zinc-500">Semua Waktu</span>
                                    </div>
                                </div>

                                {/* Total Data Tagihan */}
                                <div className="w-full rounded-xl border border-zinc-200/60 bg-white p-5 shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
                                    <div className="flex flex-col gap-1">
                                        <h1 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">Total Data Tagihan</h1>
                                        <span className="text-2xl font-bold text-[#19363B] dark:text-white">
                                            {totalDataTagihan}
                                        </span>
                                        <span className="text-xs text-zinc-500">Tercatat di Database</span>
                                    </div>
                                </div>
                            </div>

                            {/* RIGHT - Rekening Aktif */}
                            <div className="md:col-span-3 w-full rounded-xl border border-zinc-200/60 bg-white p-5 shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
                                <h1 className="text-lg font-bold text-zinc-800 dark:text-zinc-100 mb-3">Rekening Penerima Aktif</h1>

                                <div className="flex flex-col lg:flex-row gap-5">
                                    {/* Credit Card */}
                                    <div className="relative w-full lg:w-[255px] h-[166px] shrink-0 rounded-2xl overflow-hidden bg-gradient-to-br from-[#69b58b] via-[#7ed5a4] to-[#4e8d68] p-4 text-white shadow-sm">
                                        <div className="absolute -top-8 -right-5 w-28 h-28 rounded-3xl rotate-45 bg-white/10" />
                                        <div className="absolute -bottom-10 -left-8 w-32 h-32 rounded-3xl rotate-45 bg-[#1f6670]/40" />
                                        <div className="absolute top-12 left-20 w-16 h-16 rounded-2xl rotate-45 bg-white/10" />

                                        <div className="relative z-10 h-full flex flex-col justify-between">
                                            <div className="flex items-center justify-between">
                                                <span className="text-lg font-medium tracking-wide">{rekeningInfo.namaBank}</span>
                                            </div>

                                            <div>
                                                <p className="text-base tracking-widest font-semibold font-mono">{rekeningInfo.noRekening}</p>
                                            </div>

                                            <div className="flex justify-between items-end">
                                                <div>
                                                    <p className="text-[8px] opacity-80">Pemilik Rekening</p>
                                                    <p className="text-xs font-semibold">{rekeningInfo.namaPemilik}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[8px] opacity-80">Tipe</p>
                                                    <p className="text-xs font-semibold">{rekeningInfo.tipe}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Account Information */}
                                    <div className="flex flex-col justify-between flex-1 min-w-0">
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-zinc-500">Status Rekening:</span>
                                                <span className="text-sm font-semibold text-green-500">{rekeningInfo.status}</span>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-zinc-500">Total Masuk:</span>
                                                <span className="text-sm font-bold text-zinc-800 dark:text-zinc-100">
                                                    Rp {totalUangMasuk.toLocaleString("id-ID")}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-zinc-500">Instansi:</span>
                                                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                                    {rekeningInfo.instansi}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Button Edit Rekening */}
                                        <div className="mt-3">
                                            <Link
                                                href="/kelola-tagihan/edit-rekening"
                                                className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200/90 dark:border-zinc-700 bg-white dark:bg-zinc-800 py-2 px-4 text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-750 transition cursor-pointer shadow-2xs"
                                            >
                                                <Pencil className="h-3.5 w-3.5 text-zinc-500 dark:text-zinc-400" />
                                                Edit Rekening
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Table Section */}
                    <div className="rounded-2xl p-4 sm:p-6 md:p-8 border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
                        {/* Table Toolbar */}
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-4">
                            {/* Filter Status Pembayaran */}
                            <div className="w-full lg:w-auto overflow-x-auto pb-1 -mb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                                <div className="inline-flex min-w-full sm:min-w-0 items-center rounded-xl bg-secondary-green-color p-1.5 dark:bg-zinc-800 gap-1">
                                    {[
                                        { label: "Semua", value: "semua", count: tagihans.length },
                                        {
                                            label: "Lunas",
                                            value: "lunas",
                                            count: tagihans.filter((item) => item.status_bayar === "lunas").length,
                                        },
                                        {
                                            label: "Menunggu",
                                            value: "menunggu",
                                            count: tagihans.filter((item) => item.status_bayar === "menunggu").length,
                                        },
                                        {
                                            label: "Batal",
                                            value: "batal",
                                            count: tagihans.filter((item) => item.status_bayar === "batal").length,
                                        },
                                    ].map((item) => (
                                        <button
                                            key={item.value}
                                            type="button"
                                            className={`whitespace-nowrap shrink-0 rounded-lg px-3 py-2 text-xs font-medium transition cursor-pointer ${activeTab === item.value
                                                ? "bg-white text-[var(--green-color)] shadow-sm dark:bg-zinc-900 font-semibold"
                                                : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
                                                }`}
                                            onClick={() => setActiveTab(item.value)}
                                        >
                                            {item.label}
                                            <span className="ml-1.5 text-[10px]">({item.count})</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Search + Sorting */}
                            <div className="flex w-full lg:w-auto items-center gap-2">
                                <div className="relative flex-1 sm:w-64">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                                    <input
                                        type="text"
                                        placeholder="Cari tiket, pemohon, rekening..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full rounded-xl border border-zinc-200 bg-white py-2 pl-9 pr-4 text-xs outline-none transition focus:border-[var(--green-color)] focus:ring-2 focus:ring-[var(--green-color)]/10 dark:border-zinc-700 dark:bg-zinc-900"
                                    />
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setSortAsc(!sortAsc)}
                                    className="inline-flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-600 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 cursor-pointer"
                                    title={sortAsc ? "Urutan: Terlama dahulu" : "Urutan: Terbaru dahulu"}
                                >
                                    <ArrowUpDown className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        {/* Table Card */}
                        <div className="overflow-x-auto rounded-lg border border-zinc-200/80 dark:border-zinc-800">
                            <table className="min-w-full divide-y divide-zinc-200/80 dark:divide-zinc-800">
                                <thead className="bg-secondary-green-color dark:bg-zinc-950">
                                    <tr>
                                        <th scope="col" className="px-6 py-4.5 text-center text-xs font-semibold text-[var(--foreground)] w-16">No</th>
                                        <th scope="col" className="px-6 py-4.5 text-left text-xs font-semibold text-[var(--foreground)]">No Tiket</th>
                                        <th scope="col" className="px-6 py-4.5 text-left text-xs font-semibold text-[var(--foreground)]">Nama</th>
                                        <th scope="col" className="px-6 py-4.5 text-left text-xs font-semibold text-[var(--foreground)]">Tanggal</th>
                                        <th scope="col" className="px-6 py-4.5 text-left text-xs font-semibold text-[var(--foreground)]">Tagihan</th>
                                        <th scope="col" className="px-6 py-4.5 text-left text-xs font-semibold text-[var(--foreground)]">Rekening</th>
                                        <th scope="col" className="px-6 py-4.5 text-left text-xs font-semibold text-[var(--foreground)]">Status</th>
                                        <th scope="col" className="px-6 py-4.5 text-center text-xs font-semibold text-[var(--foreground)]">Aksi</th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-zinc-100 bg-white dark:divide-zinc-800 dark:bg-zinc-900">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={8} className="px-6 py-12 text-center text-sm text-zinc-500">
                                                <div className="flex flex-col items-center justify-center gap-2">
                                                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--green-color)] border-t-transparent" />
                                                    <span>Memuat data tagihan dari database...</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : error ? (
                                        <tr>
                                            <td colSpan={8} className="px-6 py-10 text-center text-sm text-red-500">
                                                {error}
                                            </td>
                                        </tr>
                                    ) : paginatedTagihans.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="px-6 py-12 text-center text-sm text-zinc-500">
                                                Tidak ada data tagihan yang sesuai.
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedTagihans.map((item, idx) => {
                                            const noTiket = item.tiket?.no_tiket || `TIK-${item.tiket_id}`;
                                            const namaPemohon = item.nama_pengirim || item.tiket?.jawaban_form?.nama_lengkap || item.tiket?.user?.nama || "Pengguna";
                                            const tanggal = formatDate(item.tanggal_transfer || item.createdAt);
                                            const namaBank = item.bank_pengirim || "Bank Mandiri";

                                            return (
                                                <tr key={item.id} className="transition-colors hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50">
                                                    <td className="whitespace-nowrap px-6 py-5 text-center text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                                                        {(currentPage - 1) * itemsPerPage + idx + 1}
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-5 text-left text-xs font-semibold text-[var(--green-color)]">
                                                        {noTiket}
                                                    </td>
                                                    <td className="px-6 py-5 text-left text-xs text-zinc-800 dark:text-zinc-100 font-medium">
                                                        <div>{namaPemohon}</div>
                                                        <div className="text-[11px] text-zinc-400 font-normal">
                                                            {item.tiket?.layanan?.nama_layanan || "Layanan Agroklimat"}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5 text-left text-xs text-zinc-600 dark:text-zinc-400">
                                                        {tanggal}
                                                    </td>
                                                    <td className="px-6 py-5 text-left text-xs font-bold text-zinc-800 dark:text-zinc-100">
                                                        Rp {item.jumlah.toLocaleString("id-ID")}
                                                    </td>
                                                    <td className="px-6 py-5 text-left text-xs text-zinc-600 dark:text-zinc-400">
                                                        {namaBank}
                                                    </td>
                                                    <td className="px-6 py-5 text-left text-xs">
                                                        {item.status_bayar === "lunas" ? (
                                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-green-50 text-green-700 border border-green-200 dark:bg-green-950/40 dark:text-green-400 dark:border-green-800">
                                                                Lunas
                                                            </span>
                                                        ) : item.status_bayar === "menunggu" ? (
                                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800">
                                                                Menunggu Bayar
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800">
                                                                Batal
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-5 text-center">
                                                        <div className="flex items-center justify-center">
                                                            <Link
                                                                href={`/kelola-tagihan/detail-tagihan/${noTiket}`}
                                                                className="cursor-pointer text-xs font-semibold text-[#0076FF] transition hover:text-[#005ecb]"
                                                                title="Lihat Detail Tagihan"
                                                            >
                                                                Lihat Detail

                                                            </Link>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Table Footer / Pagination */}
                        <div className="flex items-center justify-between border-t border-zinc-200 px-2 pt-5 dark:border-zinc-800">
                            <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                Menampilkan{" "}
                                <span className="font-medium text-zinc-900 dark:text-zinc-100">
                                    {filteredTagihans.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}
                                </span>
                                –
                                <span className="font-medium text-zinc-900 dark:text-zinc-100">
                                    {Math.min(currentPage * itemsPerPage, filteredTagihans.length)}
                                </span>{" "}
                                dari{" "}
                                <span className="font-medium text-zinc-900 dark:text-zinc-100">
                                    {filteredTagihans.length}
                                </span>{" "}
                                Tagihan
                            </p>

                            {/* Pagination */}
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-zinc-800 cursor-pointer"
                                    title="Sebelumnya"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </button>

                                {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-sm font-medium transition cursor-pointer ${currentPage === page
                                            ? "bg-[var(--green-color)] text-white"
                                            : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                                            }`}
                                    >
                                        {page}
                                    </button>
                                ))}

                                <button
                                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-zinc-800 cursor-pointer"
                                    title="Selanjutnya"
                                >
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
