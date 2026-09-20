"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/sidebar/Sidebar";
import AppBar from "@/components/appbar/AppBar";
import RoleUserBadge from "@/components/badge/role-user/RoleUserBadge";
import { getUserFromToken, getRedirectPath } from "@/lib/auth";
import { getApiUrl } from "@/lib/api";
import {
    Users,
    ShieldAlert,
    Pencil,
    Trash2,
    Plus,
    Search,
    ChevronDown,
    ArrowUpDown,
    ListFilter,
    CirclePlus,
} from "lucide-react";

interface UnitTeknis {
    id: number;
    nama: string;
}

interface User {
    id: number;
    nama: string;
    nip: string | null;
    role: string;
    status_akun: string;
    unit_teknis: UnitTeknis | null;
}

export default function PegawaiPage() {
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("semua");
    const [statusFilter, setStatusFilter] = useState("semua");
    const [sortOrder, setSortOrder] = useState("terbaru");

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
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!response.ok) throw new Error("Gagal mengambil data user");
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

    const handleEdit = (user: User) => {
        router.push(`/kelola-user/pegawai/tambah?id=${user.id}`);
    };

    const handleDelete = async (id: number) => {
        if (confirm("Apakah Anda yakin ingin menghapus user ini?")) {
            try {
                const token = localStorage.getItem("agro_token");
                const response = await fetch(`${getApiUrl()}/users/${id}`, {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` },
                });

                const data = await response.json().catch(() => ({}));

                if (!response.ok) {
                    const message = Array.isArray(data.message)
                        ? data.message.join(", ")
                        : data.message || "Gagal menghapus user";
                    throw new Error(message);
                }

                setUsers((prev) => prev.filter((u) => u.id !== id));
            } catch (err: any) {
                console.error(err);
                alert(err.message || "Gagal menghapus user");
            }
        }
    };

    if (!mounted) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-secondary-green-color border-t-transparent"></div>
            </div>
        );
    }

    const pegawaiUsers = users.filter((u) => u.role !== "publik");

    // Filter + Search
    const filteredUsers = pegawaiUsers
        .filter((u) => {
            const keyword = search.toLowerCase();

            const matchSearch =
                u.nama.toLowerCase().includes(keyword) ||
                (u.nip ?? "").toLowerCase().includes(keyword);

            const matchRole = (() => {
                if (roleFilter === "semua") return true;

                // Jika pegawai, filter berdasarkan role + unit teknis
                if (u.role === "pegawai") {
                    const filterParts = roleFilter.split("|");
                    const filterRole = filterParts[0];
                    const filterUnitId = filterParts[1];

                    return (
                        u.role === filterRole &&
                        u.unit_teknis?.id.toString() === filterUnitId
                    );
                }

                // Role selain pegawai
                return u.role === roleFilter;
            })();

            const matchStatus =
                statusFilter === "semua" ||
                u.status_akun.toLowerCase() === statusFilter;

            return (
                matchSearch &&
                matchRole &&
                matchStatus
            );
        })
        .sort((a, b) => {
            if (sortOrder === "terbaru") {
                return b.id - a.id;
            }

            return a.id - b.id;
        });

    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

    const startIndex = (currentPage - 1) * itemsPerPage;

    const currentUsers = filteredUsers.slice(
        startIndex,
        startIndex + itemsPerPage
    );

    const roleOptions = Array.from(
        new Map(
            pegawaiUsers.map((u) => {
                if (u.role === "pegawai" && u.unit_teknis) {
                    return [
                        `pegawai|${u.unit_teknis.id}`,
                        `Pegawai ${u.unit_teknis.nama}`,
                    ];
                }

                return [
                    u.role,
                    u.role
                        .replace("_", " ")
                        .replace(/\b\w/g, (char) => char.toUpperCase()),
                ];
            })
        ).entries()
    );

    const handleToggleStatus = async (user: User) => {
        const newStatus =
            user.status_akun.toLowerCase() === "inactive"
                ? "active"
                : "inactive";

        try {
            const token = localStorage.getItem("agro_token");

            const response = await fetch(
                `${getApiUrl()}/users/${user.id}/status`,
                {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        status_akun: newStatus,
                    }),
                }
            );

            const data = await response.json().catch(() => null);

            console.log("STATUS:", response.status);
            console.log("RESPONSE:", data);

            if (!response.ok) {
                const message = Array.isArray(data?.message)
                    ? data.message.join(", ")
                    : data?.message || `Request gagal (${response.status})`;

                throw new Error(message);
            }

            setUsers((prev) =>
                prev.map((u) =>
                    u.id === user.id
                        ? {
                            ...u,
                            status_akun: newStatus,
                        }
                        : u
                )
            );
        } catch (err: any) {
            console.error("Toggle status error:", err);
            alert(err.message || "Gagal mengubah status akun");
        }
    };


    return (
        <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 overflow-hidden font-sans">
            <Sidebar />
            <div className="flex flex-col flex-1 overflow-y-auto">
                <AppBar onMenuClick={() => setSidebarOpen(true)} />

                <main className="flex-1 p-8 space-y-6">

                    <div className="flex justify-between items-center w-full relative overflow-hidden space-y-3">
                        <div className="space-y-3">
                            <h1 className="text-2xl font-semibold md:text-3xl text-[var(--foreground)] dark:text-zinc-50">
                                Kelola <span className="text-green-color ">Pegawai</span>
                            </h1>
                            <p className="max-w-xl text-sm font-medium">
                                Manajemen Data Pegawai dan Hak Akses Sistem
                            </p>
                        </div>

                        <div className="flex justify-end items-center">
                            <button
                                onClick={() => router.push("/kelola-user/pegawai/tambah")}
                                className="inline-flex items-center gap-2 rounded-xl bg-[var(--green-color)] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#22482E] transition shadow-sm cursor-pointer"
                            >
                                <Plus className="h-4 w-4" />
                                Tambah Pegawai
                            </button>
                        </div>
                    </div>

                    <div className="rounded-2xl p-4 sm:p-6 md:p-8 border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
                        {error && (
                            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400 flex items-center gap-2">
                                <ShieldAlert className="h-5 w-5 flex-shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="mb-6 flex flex-col gap-4">
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                {/* Baris Filter Status Kanan */}
                                <div className="w-full lg:w-auto overflow-x-auto pb-1 -mb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                                    <div className="inline-flex min-w-full sm:min-w-0 items-center rounded-xl bg-secondary-green-color p-1.5 dark:border-zinc-700 dark:bg-zinc-800 gap-1">
                                        {[
                                            {
                                                label: "Semua",
                                                value: "semua",
                                                count: pegawaiUsers.length,
                                            },
                                            {
                                                label: "Aktif",
                                                value: "active",
                                                count: pegawaiUsers.filter(
                                                    (u) => u.status_akun.toLowerCase() === "active"
                                                ).length,
                                            },
                                            {
                                                label: "Nonaktif",
                                                value: "inactive",
                                                count: pegawaiUsers.filter(
                                                    (u) => u.status_akun.toLowerCase() === "inactive"
                                                ).length,
                                            },
                                        ].map((item) => (
                                            <button
                                                key={item.value}
                                                onClick={() => {
                                                    setStatusFilter(item.value);
                                                    setCurrentPage(1);
                                                }}
                                                className={`whitespace-nowrap shrink-0 rounded-lg px-3 py-2 text-xs font-medium transition cursor-pointer ${statusFilter === item.value
                                                    ? "bg-white text-[var(--green-color)] shadow-sm dark:bg-zinc-900 font-semibold"
                                                    : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400"
                                                    }`}
                                            >
                                                {item.label}
                                                <span className="ml-1.5 text-[10px]">
                                                    ({item.count})
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Baris filter kiri */}
                                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                                    <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full lg:w-auto">
                                        {/* Search */}
                                        <div className="relative flex-1 sm:w-60">
                                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                                            <input
                                                type="text"
                                                placeholder="Cari nama, NIP, email..."
                                                value={search}
                                                onChange={(e) => {
                                                    setSearch(e.target.value);
                                                    setCurrentPage(1);
                                                }}
                                                className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 pl-10 pr-4 text-xs outline-none transition focus:border-[var(--green-color)] focus:ring-2 focus:ring-[var(--green-color)]/10 dark:border-zinc-700 dark:bg-zinc-900"
                                            />
                                        </div>

                                        {/* Filter Role */}
                                        <div className="relative flex-1 sm:flex-initial">
                                            <ListFilter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                                            <select
                                                value={roleFilter}
                                                onChange={(e) => {
                                                    setRoleFilter(e.target.value);
                                                    setCurrentPage(1);
                                                }}
                                                className="w-full appearance-none rounded-xl border border-zinc-200 bg-white py-2.5 pl-10 pr-9 text-xs outline-none transition focus:border-[var(--green-color)] focus:ring-2 focus:ring-[var(--green-color)]/10 dark:border-zinc-700 dark:bg-zinc-900"
                                            >
                                                <option value="semua">Semua Role</option>
                                                {roleOptions.map(([value, label]) => (
                                                    <option key={value} value={value}>
                                                        {label}
                                                    </option>
                                                ))}
                                            </select>
                                            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                                        </div>

                                        {/* Sorting */}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSortOrder((prev) =>
                                                    prev === "terbaru" ? "terlama" : "terbaru"
                                                );
                                                setCurrentPage(1);
                                            }}
                                            className="inline-flex shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-white p-2.5 text-zinc-600 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 cursor-pointer"
                                            title={
                                                sortOrder === "terbaru"
                                                    ? "Urutkan dari terlama"
                                                    : "Urutkan dari terbaru"
                                            }
                                        >
                                            <ArrowUpDown className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>


                            <div className="overflow-x-auto">
                                {loading ? (
                                    <div className="flex flex-col items-center justify-center py-20 space-y-4">
                                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-secondary-green-color border-t-transparent"></div>
                                        <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Memuat data pegawai...</p>
                                    </div>
                                ) : currentUsers.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-zinc-400 dark:text-zinc-500">
                                        <Users className="h-12 w-12 stroke-1 mb-2" />
                                        <p className="text-sm font-semibold">Tidak Ada Data</p>
                                        <p className="text-xs">Belum ada akun pegawai terdaftar.</p>
                                    </div>
                                ) : (
                                    <table className="min-w-full divide-y divide-zinc-200/80 dark:divide-zinc-800">
                                        <thead className="bg-[var(--secondary-green-color)]">
                                            <tr>
                                                <th scope="col" className="px-6 py-4.5 text-center text-xs font-semibold text-[var(--foreground)] tracking-wider w-16">No.</th>
                                                <th scope="col" className="px-6 py-4.5 text-left text-xs font-semibold text-[var(--foreground)] tracking-wider">Nama</th>
                                                <th scope="col" className="px-6 py-4.5 text-center text-xs font-semibold text-[var(--foreground)] tracking-wider">NIP</th>
                                                <th scope="col" className="px-6 py-4.5 text-center text-xs font-semibold text-[var(--foreground)] tracking-wider">Role</th>
                                                <th scope="col" className="px-6 py-4.5 text-center text-xs font-semibold text-[var(--foreground)] tracking-wider">Unit Teknis</th>
                                                <th scope="col" className="px-6 py-4.5 text-center text-xs font-semibold text-[var(--foreground)] tracking-wider">Status</th>
                                                <th scope="col" className="px-6 py-4.5 text-center text-xs font-semibold text-[var(--foreground)] tracking-wider">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 bg-white dark:bg-zinc-900">
                                            {currentUsers.map((u, index) => (
                                                <tr key={u.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 transition-colors">
                                                    <td className="whitespace-nowrap px-6 py-5.5 text-center text-xs text-zinc-500 dark:text-zinc-400">
                                                        {startIndex + index + 1}
                                                    </td>
                                                    <td className="px-6 py-5.5 whitespace-nowrap text-xs text-[var(--foreground)] font-base text-left">
                                                        {u.nama}
                                                    </td>
                                                    <td className="px-6 py-5.5 whitespace-nowrap text-xs text-[var(--foreground)] text-center">
                                                        {u.nip}
                                                    </td>
                                                    <td className="px-6 py-5.5 whitespace-nowrap text-xs text-center">
                                                        <div className="flex justify-center">
                                                            <RoleUserBadge role={u.role} />
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5.5 whitespace-nowrap text-xs text-[var(--foreground)] font-base text-center">
                                                        {u.unit_teknis ? (
                                                            u.unit_teknis.nama
                                                        ) : (
                                                            <span className="text-zinc-400 dark:text-zinc-650 font-base">-</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-5.5 whitespace-nowrap text-xs text-center">
                                                        <button
                                                            onClick={() => handleToggleStatus(u)}
                                                            className="inline-flex items-center gap-2 cursor-pointer"
                                                        >
                                                            <span
                                                                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${u.status_akun.toLowerCase() === "active"
                                                                    ? "bg-[var(--green-color)]"
                                                                    : "bg-zinc-300 dark:bg-zinc-700"
                                                                    }`}
                                                            >
                                                                <span
                                                                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${u.status_akun.toLowerCase() === "active"
                                                                        ? "translate-x-4"
                                                                        : "translate-x-0.5"
                                                                        }`}
                                                                />
                                                            </span>

                                                            <span
                                                                className={
                                                                    u.status_akun.toLowerCase() === "active"
                                                                        ? "text-[var(--green-color)]"
                                                                        : "text-zinc-400"
                                                                }
                                                            >
                                                                {u.status_akun.toLowerCase() === "active"
                                                                    ? "Aktif"
                                                                    : "Nonaktif"}
                                                            </span>
                                                        </button>
                                                    </td>
                                                    <td className="px-6 py-5.5 whitespace-nowrap text-xs text-center">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <button
                                                                onClick={() => handleEdit(u)}
                                                                className="p-1 text-zinc-500 hover:text-[#2C5E3B] rounded-md transition cursor-pointer"
                                                                title="Edit"
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(u.id)}
                                                                className="p-1 text-zinc-500 hover:text-red-600 rounded-md transition cursor-pointer"
                                                                title="Delete"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}


                                <div className="flex items-center justify-between border-t border-zinc-200 px-2 pt-5 dark:border-zinc-800">
                                    {/* Info jumlah data */}
                                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                        Menampilkan{" "}
                                        <span className="font-medium text-zinc-900 dark:text-zinc-100">
                                            {filteredUsers.length === 0 ? 0 : startIndex + 1}
                                        </span>
                                        –
                                        <span className="font-medium text-zinc-900 dark:text-zinc-100">
                                            {Math.min(startIndex + itemsPerPage, filteredUsers.length)}
                                        </span>{" "}
                                        dari{" "}
                                        <span className="font-medium text-zinc-900 dark:text-zinc-100">
                                            {filteredUsers.length}
                                        </span>{" "}
                                        pegawai
                                    </p>

                                    {/* Pagination */}
                                    <div className="flex items-center gap-1">
                                        {/* Previous */}
                                        <button
                                            onClick={() => setCurrentPage((prev) => prev - 1)}
                                            disabled={currentPage === 1}
                                            className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-zinc-800"
                                        >
                                            ‹
                                        </button>

                                        {/* Page numbers */}
                                        {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                                            (page) => (
                                                <button
                                                    key={page}
                                                    onClick={() => setCurrentPage(page)}
                                                    className={`flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-sm font-medium transition ${currentPage === page
                                                        ? "bg-[var(--green-color)] text-white"
                                                        : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                                                        }`}
                                                >
                                                    {page}
                                                </button>
                                            )
                                        )}

                                        {/* Next */}
                                        <button
                                            onClick={() => setCurrentPage((prev) => prev + 1)}
                                            disabled={currentPage === totalPages}
                                            className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-zinc-800"
                                        >
                                            ›
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}