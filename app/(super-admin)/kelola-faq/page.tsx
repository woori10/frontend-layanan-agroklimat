"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/sidebar/Sidebar";
import AppBar from "@/components/appbar/AppBar";
import { getUserFromToken, getRedirectPath } from "@/lib/auth";
import { getApiUrl } from "@/lib/api";
import {
    HelpCircle,
    Plus,
    Pencil,
    Trash2,
    Database,
    ShieldAlert,
    Check,
    X,
    Search,
    ArrowUpDown,
    Eye
} from "lucide-react";

interface FaqItem {
    id: number;
    pertanyaan: string;
    jawaban: string;
    urutan: number;
    is_active: boolean;
    createdAt: string;
    updatedAt?: string;
}

type StatusFilter = "all" | "diunggah" | "draft";
const ITEMS_PER_PAGE = 10;

export default function KelolaFaqPage() {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [faqList, setFaqList] = useState<FaqItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    // Search, Filter & Sorting
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
    const [sortNewest, setSortNewest] = useState(false); // Default sort by urutan asc

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);

    // Detail modal state
    const [selectedFaq, setSelectedFaq] = useState<FaqItem | null>(null);

    // Delete modal state
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [faqToDelete, setFaqToDelete] = useState<FaqItem | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const token = typeof window !== "undefined" ? localStorage.getItem("agro_token") : null;

    const fetchFaqs = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${getApiUrl()}/faq/admin`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!res.ok) {
                throw new Error("Gagal mengambil data FAQ");
            }
            const data = await res.json();
            setFaqList(data);
        } catch (err: any) {
            setError(err.message || "Terjadi kesalahan saat memuat data FAQ.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setMounted(true);
        if (!token) {
            router.push("/login");
            return;
        }
        const user = getUserFromToken();
        if (!user || user.role !== "super_admin") {
            router.push(getRedirectPath(user?.role || "publik"));
            return;
        }

        fetchFaqs();
    }, [router]);

    // Filter, Search, & Sorting Logic
    const filteredFaqs = useMemo(() => {
        let result = [...faqList];

        // Search filter
        if (search.trim()) {
            const keyword = search.toLowerCase();
            result = result.filter((item) =>
                item.pertanyaan.toLowerCase().includes(keyword) ||
                item.jawaban.toLowerCase().includes(keyword)
            );
        }

        // Status filter (diunggah = is_active: true, draft = is_active: false)
        if (statusFilter === "diunggah") {
            result = result.filter((item) => item.is_active === true);
        } else if (statusFilter === "draft") {
            result = result.filter((item) => item.is_active === false);
        }

        // Sorting
        result.sort((a, b) => {
            if (sortNewest) {
                const dateA = new Date(a.createdAt).getTime();
                const dateB = new Date(b.createdAt).getTime();
                return dateB - dateA;
            }
            return a.urutan - b.urutan;
        });

        return result;
    }, [faqList, search, statusFilter, sortNewest]);

    // Status Counts
    const totalCount = faqList.length;
    const diunggahCount = faqList.filter((item) => item.is_active === true).length;
    const draftCount = faqList.filter((item) => item.is_active === false).length;

    // Pagination
    const totalPages = Math.ceil(filteredFaqs.length / ITEMS_PER_PAGE);
    const paginatedFaqs = filteredFaqs.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    useEffect(() => {
        setCurrentPage(1);
    }, [search, statusFilter, sortNewest]);

    const handleToggleStatus = async (faq: FaqItem) => {
        try {
            const res = await fetch(`${getApiUrl()}/faq/${faq.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    is_active: !faq.is_active,
                }),
            });

            if (!res.ok) {
                throw new Error("Gagal mengubah status FAQ");
            }

            setFaqList((prev) =>
                prev.map((item) =>
                    item.id === faq.id ? { ...item, is_active: !item.is_active } : item
                )
            );
        } catch (err: any) {
            alert(err.message || "Gagal mengubah status FAQ");
        }
    };

    const handleDelete = async () => {
        if (!faqToDelete) return;
        setDeleteLoading(true);
        try {
            const res = await fetch(`${getApiUrl()}/faq/${faqToDelete.id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                throw new Error("Gagal menghapus FAQ");
            }

            setSuccessMessage("FAQ berhasil dihapus!");
            setTimeout(() => setSuccessMessage(""), 3500);
            setDeleteModalOpen(false);
            setFaqToDelete(null);
            fetchFaqs();
        } catch (err: any) {
            alert(err.message || "Gagal menghapus FAQ");
        } finally {
            setDeleteLoading(false);
        }
    };

    if (!mounted) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-secondary-green-color border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="flex h-screen overflow-hidden bg-zinc-50 font-sans text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <div className="flex flex-1 flex-col overflow-y-auto">
                <AppBar onMenuClick={() => { }} />

                <main className="flex-1 space-y-6 p-8">
                    {/* Header Section */}
                    <div className="flex justify-between items-center w-full relative overflow-hidden space-y-3">
                        <div className="space-y-3">
                            <h1 className="text-2xl font-semibold md:text-3xl text-[var(--foreground)] dark:text-zinc-50">
                                Kelola <span className="text-green-color">FAQ</span>
                            </h1>
                            <p className="max-w-xl text-sm font-medium text-[var(--foregorund)] dark:text-zinc-400">
                                Manajemen Pertanyaan dan Jawaban yang Tampil di Landing Page
                            </p>
                        </div>

                        <div className="flex justify-end items-center">
                            <button
                                onClick={() => router.push("/kelola-faq/tambah")}
                                className="inline-flex items-center gap-2 rounded-xl bg-[var(--green-color)] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#22482E] transition shadow-sm cursor-pointer"
                            >
                                <Plus className="h-4 w-4" />
                                Tambah FAQ
                            </button>
                        </div>
                    </div>

                    {/* Table Card Wrapper */}
                    <div className="rounded-2xl p-4 sm:p-6 md:p-8 border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
                        {/* Alerts */}
                        {error && (
                            <div className="mb-6 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">
                                <ShieldAlert className="h-5 w-5 flex-shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        {successMessage && (
                            <div className="mb-6 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-400">
                                <Check className="h-5 w-5 flex-shrink-0" />
                                <span>{successMessage}</span>
                            </div>
                        )}

                        {/* Toolbar: Status Filter Tabs + Search + Sorting + Tambah Button */}
                        <div className="mb-6 flex flex-col gap-4">
                            <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4">
                                {/* Status Filter Tabs (Semua, Diunggah, Draft) */}
                                <div className="w-full lg:w-auto overflow-x-auto pb-1 -mb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                                    <div className="inline-flex min-w-full sm:min-w-0 items-center rounded-xl bg-secondary-green-color p-1.5 dark:border-zinc-800 dark:bg-zinc-950 gap-1">
                                        <button
                                            type="button"
                                            onClick={() => setStatusFilter("all")}
                                            className={`whitespace-nowrap shrink-0 rounded-lg px-3 py-2 text-xs font-medium transition cursor-pointer ${statusFilter === "all"
                                                ? "bg-white text-[var(--green-color)] shadow-sm dark:bg-zinc-900 font-semibold"
                                                : "text-zinc-600 hover:text-zinc-800 dark:text-zinc-400"
                                                }`}
                                        >
                                            Semua
                                            <span className="ml-1.5">({totalCount})</span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setStatusFilter("diunggah")}
                                            className={`whitespace-nowrap shrink-0 rounded-lg px-3 py-2 text-xs font-medium transition cursor-pointer ${statusFilter === "diunggah"
                                                ? "bg-white text-[var(--green-color)] shadow-sm dark:bg-zinc-900 font-semibold"
                                                : "text-zinc-600 hover:text-zinc-800 dark:text-zinc-400"
                                                }`}
                                        >
                                            Diunggah
                                            <span className="ml-1.5">({diunggahCount})</span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setStatusFilter("draft")}
                                            className={`whitespace-nowrap shrink-0 rounded-lg px-3 py-2 text-xs font-medium transition cursor-pointer ${statusFilter === "draft"
                                                ? "bg-white text-[var(--green-color)] shadow-sm dark:bg-zinc-900 font-semibold"
                                                : "text-zinc-600 hover:text-zinc-800 dark:text-zinc-400"
                                                }`}
                                        >
                                            Draft
                                            <span className="ml-1.5">({draftCount})</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Right Side: Search + Sorting + Tambah FAQ */}
                                <div className="flex w-full lg:w-auto items-center gap-2 sm:gap-3">
                                    {/* Search Input */}
                                    <div className="flex h-10 flex-1 sm:w-64 items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 dark:border-zinc-800 dark:bg-zinc-950">
                                        <Search className="h-4 w-4 text-zinc-400 shrink-0" />
                                        <input
                                            type="text"
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            placeholder="Cari pertanyaan / jawaban..."
                                            className="w-full bg-transparent text-xs text-zinc-800 outline-none placeholder:text-zinc-400 dark:text-zinc-100"
                                        />
                                    </div>

                                    {/* Sorting Button */}
                                    <button
                                        type="button"
                                        onClick={() => setSortNewest((prev) => !prev)}
                                        title={sortNewest ? "Urutan: Terbaru Dibuat" : "Urutan: Nomor Urut (Default)"}
                                        className="flex h-10 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-white px-3 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-800 cursor-pointer"
                                    >
                                        <ArrowUpDown className="h-4 w-4 mr-1.5" />
                                        <span className="hidden sm:inline">{sortNewest ? "Terbaru" : "No. Urut"}</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center space-y-4 py-20">
                                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-secondary-green-color border-t-transparent" />
                                    <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                                        Memuat data FAQ...
                                    </p>
                                </div>
                            ) : filteredFaqs.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-zinc-400 dark:text-zinc-500">
                                    <HelpCircle className="mb-2 h-12 w-12 stroke-1" />
                                    <p className="text-sm font-semibold">Tidak Ada Data FAQ</p>
                                    <p className="text-xs">Tidak ada FAQ yang sesuai dengan filter atau pencarian.</p>
                                </div>
                            ) : (
                                <table className="min-w-full divide-y divide-zinc-200/80 dark:divide-zinc-800">
                                    <thead className="bg-secondary-green-color dark:bg-zinc-950">
                                        <tr>
                                            <th scope="col" className="px-6 py-4.5 text-center text-xs font-semibold text-[var(--foreground)] tracking-wider w-16">
                                                No
                                            </th>
                                            <th scope="col" className="px-6 py-4.5 text-left text-xs font-semibold text-[var(--foreground)] tracking-wider">
                                                Pertanyaan
                                            </th>
                                            <th scope="col" className="px-6 py-4.5 text-left text-xs font-semibold text-[var(--foreground)] tracking-wider">
                                                Jawaban
                                            </th>
                                            <th scope="col" className="px-6 py-4.5 text-center text-xs font-semibold text-[var(--foreground)] tracking-wider w-36">
                                                Status
                                            </th>
                                            <th scope="col" className="px-6 py-4.5 text-center text-xs font-semibold text-[var(--foreground)] tracking-wider w-40">
                                                Aksi
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-zinc-100 bg-white dark:divide-zinc-800 dark:bg-zinc-900">
                                        {paginatedFaqs.map((faq) => {
                                            const isDiunggah = faq.is_active;

                                            return (
                                                <tr key={faq.id} className="transition-colors hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50">
                                                    {/* No Urut */}
                                                    <td className="whitespace-nowrap px-6 py-5 text-center text-xs font-bold text-[#2C5E3B] dark:text-secondary-green-color">
                                                        {faq.urutan}
                                                    </td>

                                                    {/* Pertanyaan */}
                                                    <td className="px-6 py-5 text-left text-xs font-semibold text-zinc-900 dark:text-zinc-100 max-w-xs">
                                                        {faq.pertanyaan}
                                                    </td>

                                                    {/* Jawaban */}
                                                    <td className="px-6 py-5 text-left text-xs text-zinc-600 dark:text-zinc-400 font-medium max-w-md">
                                                        <p className="line-clamp-2 leading-relaxed">
                                                            {faq.jawaban}
                                                        </p>
                                                    </td>

                                                    {/* Status Badge (Diunggah / Draft) */}
                                                    <td className="px-6 py-5 text-center whitespace-nowrap">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleToggleStatus(faq)}
                                                            title="Klik untuk mengubah status Diunggah / Draft"
                                                            className="cursor-pointer"
                                                        >
                                                            <span
                                                                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition ${isDiunggah
                                                                    ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400"
                                                                    : "border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400"
                                                                    }`}
                                                            >
                                                                <span className={`h-1.5 w-1.5 rounded-full ${isDiunggah ? "bg-emerald-500" : "bg-amber-500"}`} />
                                                                {isDiunggah ? "Diunggah" : "Draft"}
                                                            </span>
                                                        </button>
                                                    </td>

                                                    {/* Aksi: Detail, Edit, Hapus */}
                                                    <td className="whitespace-nowrap px-6 py-5 text-center">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => router.push(`/kelola-faq/edit/${faq.id}`)}
                                                                className="p-1 text-zinc-500 hover:text-[#2C5E3B] rounded-md transition cursor-pointer"
                                                                title="Edit FAQ"
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setFaqToDelete(faq);
                                                                    setDeleteModalOpen(true);
                                                                }}
                                                                className="p-1 text-zinc-500 hover:text-red-600 rounded-md transition cursor-pointer"
                                                                title="Hapus FAQ"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
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

                        {/* Pagination */}
                        {!loading && filteredFaqs.length > 0 && totalPages > 0 && (
                            <div className="flex items-center justify-between border-t border-zinc-200 px-2 pt-5 dark:border-zinc-800">
                                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
                                    Menampilkan{" "}
                                    <span className="font-medium text-zinc-900 dark:text-zinc-100">
                                        {(currentPage - 1) * ITEMS_PER_PAGE + 1}
                                    </span>
                                    –
                                    <span className="font-medium text-zinc-900 dark:text-zinc-100">
                                        {Math.min(currentPage * ITEMS_PER_PAGE, filteredFaqs.length)}
                                    </span>{" "}
                                    dari{" "}
                                    <span className="font-medium text-zinc-900 dark:text-zinc-100">
                                        {filteredFaqs.length}
                                    </span>{" "}
                                    FAQ
                                </p>

                                <div className="flex items-center gap-1">
                                    <button
                                        type="button"
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                        className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-zinc-800 cursor-pointer"
                                    >
                                        ‹
                                    </button>

                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                        <button
                                            key={page}
                                            type="button"
                                            onClick={() => setCurrentPage(page)}
                                            className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold transition cursor-pointer ${currentPage === page
                                                ? "bg-[var(--green-color)] text-white shadow-sm"
                                                : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    ))}

                                    <button
                                        type="button"
                                        disabled={currentPage === totalPages}
                                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                        className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-zinc-800 cursor-pointer"
                                    >
                                        ›
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* Modal Detail FAQ (seperti detail kelola user) */}
            {selectedFaq && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
                    <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                        <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
                            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                                Detail Pertanyaan FAQ
                            </h3>
                            <button
                                onClick={() => setSelectedFaq(null)}
                                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="mt-5 space-y-4 text-xs">
                            <div>
                                <span className="text-zinc-500 block text-xs">Nomor Urut Tampil</span>
                                <span className="font-bold text-[#2C5E3B] text-sm">#{selectedFaq.urutan}</span>
                            </div>

                            <div>
                                <span className="text-zinc-500 block text-xs">Status Publikasi</span>
                                <div className="mt-1">
                                    <span
                                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${selectedFaq.is_active
                                            ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400"
                                            : "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400"
                                            }`}
                                    >
                                        <span className={`h-1.5 w-1.5 rounded-full ${selectedFaq.is_active ? "bg-emerald-500" : "bg-amber-500"}`} />
                                        {selectedFaq.is_active ? "Diunggah (Tampil di Landing Page)" : "Draft (Disembunyikan)"}
                                    </span>
                                </div>
                            </div>

                            <div>
                                <span className="text-zinc-500 block text-xs">Pertanyaan</span>
                                <p className="font-semibold text-zinc-900 dark:text-zinc-100 mt-1 text-sm">
                                    {selectedFaq.pertanyaan}
                                </p>
                            </div>

                            <div>
                                <span className="text-zinc-500 block text-xs">Jawaban</span>
                                <div className="mt-1 p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 text-zinc-800 dark:text-zinc-200 leading-relaxed whitespace-pre-line text-xs">
                                    {selectedFaq.jawaban}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-5 mt-5 border-t border-zinc-200 dark:border-zinc-800">
                            <button
                                type="button"
                                onClick={() => {
                                    const id = selectedFaq.id;
                                    setSelectedFaq(null);
                                    router.push(`/kelola-faq/edit/${id}`);
                                }}
                                className="px-4 py-2 rounded-xl bg-[var(--green-color)] text-white hover:bg-[#20492E] font-semibold cursor-pointer text-xs"
                            >
                                Edit FAQ
                            </button>
                            <button
                                type="button"
                                onClick={() => setSelectedFaq(null)}
                                className="px-4 py-2 rounded-xl border border-zinc-300 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 font-semibold cursor-pointer text-xs"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteModalOpen && faqToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                        <div className="text-center space-y-3">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400">
                                <Trash2 className="h-6 w-6" />
                            </div>
                            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                                Hapus Pertanyaan FAQ?
                            </h3>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                Apakah Anda yakin ingin menghapus pertanyaan: <br />
                                <span className="font-semibold text-zinc-800 dark:text-zinc-200">&quot;{faqToDelete.pertanyaan}&quot;</span>?
                                Tindakan ini tidak dapat dibatalkan.
                            </p>
                        </div>

                        <div className="flex items-center justify-center gap-3 mt-6">
                            <button
                                onClick={() => setDeleteModalOpen(false)}
                                className="px-4 py-2.5 rounded-xl border border-zinc-300 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 font-semibold cursor-pointer text-xs"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleteLoading}
                                className="px-5 py-2.5 rounded-xl bg-red-600 text-white hover:bg-red-700 font-semibold cursor-pointer disabled:opacity-50 text-xs"
                            >
                                {deleteLoading ? "Menghapus..." : "Ya, Hapus"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
