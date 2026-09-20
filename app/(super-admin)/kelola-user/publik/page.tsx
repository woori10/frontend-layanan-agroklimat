"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/sidebar/Sidebar";
import AppBar from "@/components/appbar/AppBar";
import { getUserFromToken, getRedirectPath } from "@/lib/auth";
import { Users, ShieldAlert, Search, ArrowUpDown, ChevronLeft, ChevronRight, X } from "lucide-react";
import { getApiUrl } from "@/lib/api";

interface User {
    id: number;
    nama: string;
    nip: string | null;
    email: string | null;
    no_hp: string | null;
    role: string;
    status_akun: string;
    instansi: string | null;
    alamat: string | null;
    createdAt: string;
}

type StatusFilter = "all" | "active" | "inactive";

const ITEMS_PER_PAGE = 10;

export default function PublikPage() {
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Search & Filter
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

    // Sorting
    const [sortNewest, setSortNewest] = useState(true);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);

    // Detail user
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    // Auth & Fetch Data
    useEffect(() => {
        setMounted(true);
        const token = localStorage.getItem("agro_token");

        if (!token) {
            router.push("/login");
            return;
        }

        const currentUser = getUserFromToken();
        if (!currentUser) {
            router.push("/login");
            return;
        }

        if (currentUser.role !== "super_admin") {
            router.push(getRedirectPath(currentUser.role));
            return;
        }

        const fetchUsers = async () => {
            try {
                const response = await fetch(`${getApiUrl()}/users`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error("Gagal mengambil data user");
                }

                const data = await response.json();
                setUsers(data);
            } catch (err: any) {
                console.error(err);
                setError(err.message || "Terjadi kesalahan.");
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [router]);

    // Filter, Search, & Sorting
    const publikUsers = useMemo(() => {
        let result = users.filter((user) => user.role === "publik");

        // Search filter
        if (search.trim()) {
            const keyword = search.toLowerCase();
            result = result.filter((user) =>
                [user.nama, user.email, user.no_hp, user.nip, user.instansi]
                    .filter(Boolean)
                    .some((value) => value!.toLowerCase().includes(keyword))
            );
        }

        // Status filter
        if (statusFilter !== "all") {
            result = result.filter((user) => user.status_akun === statusFilter);
        }

        // Sorting
        result.sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return sortNewest ? dateB - dateA : dateA - dateB;
        });

        return result;
    }, [users, search, statusFilter, sortNewest]);

    // Status Count
    const totalCount = users.filter((user) => user.role === "publik").length;
    const activeCount = users.filter((user) => user.role === "publik" && user.status_akun === "active").length;
    const inactiveCount = users.filter((user) => user.role === "publik" && user.status_akun === "inactive").length;

    // Pagination
    const totalPages = Math.ceil(publikUsers.length / ITEMS_PER_PAGE);
    const paginatedUsers = publikUsers.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    useEffect(() => {
        setCurrentPage(1);
    }, [search, statusFilter, sortNewest]);

    // View Detail
    const handleViewDetail = (user: User) => {
        setSelectedUser(user);
    };

    const handleCloseDetail = () => {
        setSelectedUser(null);
    };

    // Close modal on Escape key press
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setSelectedUser(null);
            }
        };
        if (selectedUser) {
            window.addEventListener("keydown", handleKeyDown);
        }
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [selectedUser]);

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
                <AppBar onMenuClick={() => setSidebarOpen(true)} />

                <main className="flex-1 space-y-6 p-8">
                    {/* Header Section */}
                    <div className="flex justify-between items-center w-full relative overflow-hidden space-y-3">
                        <div className="space-y-3">
                            <h1 className="text-2xl font-semibold md:text-3xl text-[var(--foreground)] dark:text-zinc-50">
                                Kelola <span className="text-green-color ">Pengguna Publik</span>
                            </h1>
                            <p className="max-w-xl text-sm font-medium">
                                Manajemen Data Pengguna Publik
                            </p>
                        </div>
                    </div>

                    {/* Content Layout */}
                    {/* Table Card */}
                    <div className="rounded-2xl p-4 sm:p-6 md:p-8 border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
                        {/* Error Alert */}
                        {error && (
                            <div className="m-5 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">
                                <ShieldAlert className="h-5 w-5 flex-shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Toolbar */}
                        <div className="mb-6 flex flex-col gap-4">
                            <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4">
                                {/* Status Filter */}
                                <div className="w-full lg:w-auto overflow-x-auto pb-1 -mb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                                    <div className="inline-flex min-w-full sm:min-w-0 items-center rounded-xl bg-secondary-green-color p-1.5 dark:border-zinc-800 dark:bg-zinc-950 gap-1">
                                        <button
                                            type="button"
                                            onClick={() => setStatusFilter("all")}
                                            className={`whitespace-nowrap shrink-0 rounded-lg px-3 py-2 text-xs font-medium transition cursor-pointer ${statusFilter === "all"
                                                ? "bg-white text-[var(--green-color)] shadow-sm dark:bg-zinc-900 font-semibold"
                                                : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400"
                                                }`}
                                        >
                                            Semua
                                            <span className="ml-1.5">({totalCount})</span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setStatusFilter("active")}
                                            className={`whitespace-nowrap shrink-0 rounded-lg px-3 py-2 text-xs font-medium transition cursor-pointer ${statusFilter === "active"
                                                ? "bg-white text-[var(--green-color)] shadow-sm dark:bg-zinc-900 font-semibold"
                                                : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400"
                                                }`}
                                        >
                                            Aktif
                                            <span className="ml-1.5">({activeCount})</span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setStatusFilter("inactive")}
                                            className={`whitespace-nowrap shrink-0 rounded-lg px-3 py-2 text-xs font-medium transition cursor-pointer ${statusFilter === "inactive"
                                                ? "bg-white text-[var(--green-color)] shadow-sm dark:bg-zinc-900 font-semibold"
                                                : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400"
                                                }`}
                                        >
                                            Nonaktif
                                            <span className="ml-1.5">({inactiveCount})</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Search + Sorting */}
                                <div className="flex w-full lg:w-auto items-center gap-3">
                                    {/* Search Input */}
                                    <div className="flex h-10 w-full sm:w-72 items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 dark:border-zinc-800 dark:bg-zinc-950">
                                        <Search className="h-4 w-4 text-zinc-400 shrink-0" />
                                        <input
                                            type="text"
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            placeholder="Cari pengguna..."
                                            className="w-full bg-transparent text-sm text-zinc-800 outline-none placeholder:text-zinc-400 dark:text-zinc-100"
                                        />
                                    </div>

                                    {/* Sorting Button */}
                                    {/* <button
                                        type="button"
                                        onClick={() => setSortNewest((prev) => !prev)}
                                        title={sortNewest ? "Terbaru" : "Terlama"}
                                        className="flex h-10 items-center justify-center rounded-xl border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-800 cursor-pointer"
                                    >
                                        <ArrowUpDown className="h-4 w-4" />
                                    </button> */}
                                </div>
                            </div>

                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center space-y-4 py-20">
                                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-secondary-green-color border-t-transparent" />
                                    <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                                        Memuat data pengguna...
                                    </p>
                                </div>
                            ) : publikUsers.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-zinc-400 dark:text-zinc-500">
                                    <Users className="mb-2 h-12 w-12 stroke-1" />
                                    <p className="text-sm font-semibold">Tidak Ada Data</p>
                                    <p className="text-xs">Tidak ada pengguna yang sesuai dengan filter.</p>
                                </div>
                            ) : (
                                <table className="min-w-full divide-y divide-zinc-200/80 dark:divide-zinc-800">
                                    <thead className="bg-secondary-green-color dark:bg-zinc-950">
                                        <tr>
                                            <th scope="col" className="px-6 py-4.5 text-center text-xs font-semibold text-[var(--foreground)] tracking-wider">
                                                No.
                                            </th>
                                            <th scope="col" className="px-6 py-4.5 text-left text-xs font-semibold text-[var(--foreground)] tracking-wider">
                                                Nama
                                            </th>
                                            <th scope="col" className="px-6 py-4.5 text-center text-xs font-semibold text-[var(--foreground)] tracking-wider">
                                                Email
                                            </th>
                                            <th scope="col" className="px-6 py-4.5 text-center text-xs font-semibold text-[var(--foreground)] tracking-wider">
                                                No. HP
                                            </th>
                                            <th scope="col" className="px-6 py-4.5 text-center text-xs font-semibold text-[var(--foreground)] tracking-wider">
                                                Status
                                            </th>
                                            <th scope="col" className="px-6 py-4.5 text-center text-xs font-semibold text-[var(--foreground)] tracking-wider">
                                                Aksi
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-zinc-100 bg-white dark:divide-zinc-800 dark:bg-zinc-900">
                                        {paginatedUsers.map((user, index) => {
                                            const isActive = user.status_akun === "active";
                                            const number = (currentPage - 1) * ITEMS_PER_PAGE + index + 1;

                                            return (
                                                <tr key={user.id} className="transition-colors hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50">
                                                    {/* No */}
                                                    <td className="whitespace-nowrap px-6 py-5 text-center text-xs text-zinc-500 dark:text-zinc-400">
                                                        {number}
                                                    </td>

                                                    {/* Nama */}
                                                    <td className="whitespace-nowrap px-6 py-5 text-left text-xs font-medium text-[var(--foreground)]">
                                                        {user.nama}
                                                    </td>

                                                    {/* Email */}
                                                    <td className="whitespace-nowrap px-6 py-5 text-center text-xs text-[var(--foreground)]">
                                                        {user.email || "-"}
                                                    </td>

                                                    {/* No HP */}
                                                    <td className="whitespace-nowrap px-6 py-5 text-center text-xs text-[var(--foreground)]">
                                                        {user.no_hp || "-"}
                                                    </td>

                                                    {/* Status */}
                                                    <td className="px-6 py-5 text-center">
                                                        <span
                                                            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${isActive
                                                                ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400"
                                                                : "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400"
                                                                }`}
                                                        >
                                                            {isActive ? "Aktif" : "Nonaktif"}
                                                        </span>
                                                    </td>

                                                    {/* Aksi */}
                                                    <td className="whitespace-nowrap px-6 py-5 text-center">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleViewDetail(user)}
                                                            className="cursor-pointer text-xs font-semibold text-[#0076FF] transition hover:text-[#005ecb]"
                                                        >
                                                            Lihat Detail
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        {/* Pagination */}
                        {!loading && publikUsers.length > 0 && totalPages > 0 && (
                            <div className="flex items-center justify-between border-t border-zinc-200 px-2 pt-5 dark:border-zinc-800">
                                {/* Info jumlah data */}
                                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                    Menampilkan{" "}
                                    <span className="font-medium text-zinc-900 dark:text-zinc-100">
                                        {publikUsers.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1}
                                    </span>
                                    –
                                    <span className="font-medium text-zinc-900 dark:text-zinc-100">
                                        {Math.min(currentPage * ITEMS_PER_PAGE, publikUsers.length)}
                                    </span>{" "}
                                    dari{" "}
                                    <span className="font-medium text-zinc-900 dark:text-zinc-100">
                                        {publikUsers.length}
                                    </span>{" "}
                                    pengguna
                                </p>

                                {/* Pagination Controls */}
                                <div className="flex items-center gap-1">
                                    {/* Previous */}
                                    <button
                                        type="button"
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                        className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-zinc-800 cursor-pointer"
                                    >
                                        ‹
                                    </button>

                                    {/* Page numbers */}
                                    {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                                        <button
                                            key={page}
                                            type="button"
                                            onClick={() => setCurrentPage(page)}
                                            className={`flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-sm font-medium transition cursor-pointer ${currentPage === page
                                                ? "bg-[var(--green-color)] text-white"
                                                : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    ))}

                                    {/* Next */}
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

                    {/* Modal Detail User (Pop Up Modal) */}
                    {selectedUser && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                            {/* Backdrop */}
                            <div
                                className="fixed inset-0 bg-zinc-950/60 backdrop-blur-xs transition-opacity"
                                onClick={handleCloseDetail}
                            />

                            {/* Modal Box */}
                            <div
                                className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl transition-all dark:border-zinc-800 dark:bg-zinc-900 animate-in zoom-in-95 duration-200"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* Modal Header */}
                                <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
                                    <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                                        Detail Pengguna Publik
                                    </h3>
                                    <button
                                        type="button"
                                        onClick={handleCloseDetail}
                                        className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                                        title="Tutup"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>

                                {/* Modal Body */}
                                <div className="max-h-[calc(85vh-120px)] overflow-y-auto p-6">
                                    {/* Profile Header */}
                                    <div className="text-center">
                                        {/* Avatar */}
                                        <div className="flex mx-auto w-16 h-16 text-3xl items-center justify-center rounded-full bg-secondary-green-color text-green-color dark:bg-secondary-green-color/40 dark:text-secondary-green-color font-bold uppercase">
                                            {selectedUser.nama ? selectedUser.nama.charAt(0) : "U"}
                                        </div>

                                        {/* Name */}
                                        <h2 className="mt-4 text-xl font-bold text-[#2C5E3B] dark:text-zinc-50">
                                            {selectedUser.nama}
                                        </h2>

                                        {/* Role */}
                                        <p className="mt-1 text-sm text-zinc-500">Pengguna Publik</p>

                                        {/* Status */}
                                        <div className="mt-3">
                                            <span
                                                className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${selectedUser.status_akun === "active"
                                                    ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400"
                                                    : "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400"
                                                    }`}
                                            >
                                                {selectedUser.status_akun === "active" ? "Aktif" : "Nonaktif"}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Divider */}
                                    <div className="my-6 border-t border-zinc-200 dark:border-zinc-800" />

                                    {/* User Information */}
                                    <div className="grid grid-cols-2 gap-5">
                                        {/* Email */}
                                        <div>
                                            <p className="mb-1 text-xs font-semibold text-zinc-900 dark:text-zinc-100">Email</p>
                                            <p className="break-words text-xs text-zinc-500 dark:text-zinc-400">{selectedUser.email || "-"}</p>
                                        </div>

                                        {/* No HP */}
                                        <div>
                                            <p className="mb-1 text-xs font-semibold text-zinc-900 dark:text-zinc-100">No. HP</p>
                                            <p className="text-xs text-zinc-500 dark:text-zinc-400">{selectedUser.no_hp || "-"}</p>
                                        </div>

                                        {/* NIK */}
                                        <div>
                                            <p className="mb-1 text-xs font-semibold text-zinc-900 dark:text-zinc-100">NIK</p>
                                            <p className="break-all text-xs text-zinc-500 dark:text-zinc-400">{selectedUser.nip || "-"}</p>
                                        </div>

                                        {/* Instansi */}
                                        <div>
                                            <p className="mb-1 text-xs font-semibold text-zinc-900 dark:text-zinc-100">Instansi / Lembaga</p>
                                            <p className="break-words text-xs text-zinc-500 dark:text-zinc-400">{selectedUser.instansi || "-"}</p>
                                        </div>

                                        {/* Alamat */}
                                        <div className="col-span-2">
                                            <p className="mb-1 text-xs font-semibold text-zinc-900 dark:text-zinc-100">Alamat</p>
                                            <p className="break-words text-xs leading-6 text-zinc-500 dark:text-zinc-400">{selectedUser.alamat || "-"}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Modal Footer */}
                                <div className="flex items-center justify-end border-t border-zinc-200 bg-zinc-50/50 px-6 py-4 dark:border-zinc-800 dark:bg-zinc-800/30">
                                    <button
                                        type="button"
                                        onClick={handleCloseDetail}
                                        className="cursor-pointer rounded-xl border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-zinc-700 shadow-xs transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
                                    >
                                        Tutup
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}