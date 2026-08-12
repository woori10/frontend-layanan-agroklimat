"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/sidebar/Sidebar";
import AppBar from "@/components/appbar/AppBar";
import RoleUserBadge from "@/components/badge/role-user/RoleUserBadge";
import { getUserFromToken, getRedirectPath } from "@/lib/auth";
import { Users, Sprout, ShieldAlert, Pencil, Trash2, Plus } from "lucide-react";

interface UnitTeknis {
    id: number;
    nama: string;
}

interface User {
    id: number;
    nama: string;
    nip: string | null;
    email: string | null;
    no_hp: string | null;
    role: string;
    status_akun: string;
    unit_teknis: UnitTeknis | null;
}

interface KelolaUserProps {
    filterType: "pegawai" | "publik";
}

export default function KelolaUser({ filterType }: KelolaUserProps) {
    const router = useRouter();
    const [userEmail, setUserEmail] = useState("petani@agroklimat.com");
    const [userName, setUserName] = useState("Pengguna");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Users state
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Authenticate and fetch users on client side
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

        const currentUser = getUserFromToken();
        if (!currentUser) {
            router.push("/login");
            return;
        }

        if (currentUser.role !== "super_admin") {
            router.push(getRedirectPath(currentUser.role));
            return;
        }

        if (currentUser.nama) {
            setUserName(currentUser.nama);
        } else if (storedEmail) {
            setUserName(storedEmail.split("@")[0]);
        }

        // Fetch users from backend
        const fetchUsers = async () => {
            try {
                const response = await fetch("http://localhost:3000/users", {
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

    const handleEdit = (user: User) => {
        console.log("Edit user clicked:", user);
        alert(`Edit user: ${user.nama}`);
    };

    const handleDelete = async (id: number) => {
        console.log("Delete user clicked:", id);
        if (confirm("Apakah Anda yakin ingin menghapus user ini?")) {
            try {
                const token = localStorage.getItem("agro_token");
                const response = await fetch(`http://localhost:3000/users/${id}`, {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (!response.ok) {
                    throw new Error("Gagal menghapus user");
                }
                // Refresh user list
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
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
            </div>
        );
    }



    // Filter users based on layout tab
    const filteredUsers = users.filter((u) => {
        if (filterType === "publik") {
            return u.role === "publik";
        } else {
            return u.role !== "publik"; // super_admin, admin, kepala_balai, pegawai
        }
    });

    const isPegawai = filterType === "pegawai";

    return (
        <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 overflow-hidden font-sans">
            {/* Sidebar for Desktop */}
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
                        <div className="relative z-10 space-y-2 text-left">
                            <h2 className="text-2xl font-extrabold md:text-3xl">
                                {isPegawai ? "Kelola Staf & Pegawai" : "Kelola Pengguna Publik"}
                            </h2>
                            <p className="max-w-xl text-sm text-emerald-50 font-medium">
                                {isPegawai
                                    ? "Daftar administrator, kepala balai, dan staf teknis internal BRMP."
                                    : "Daftar pengguna umum dan mitra tani terdaftar."}
                            </p>
                        </div>
                    </div>

                    {isPegawai && (
                        <div className="flex justify-end">
                            <button
                                onClick={() => router.push("/kelola-user/pegawai/tambah")}
                                className="inline-flex items-center gap-2 rounded-xl bg-[var(--green-color)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#22482E] transition shadow-sm cursor-pointer"
                            >
                                <Plus className="h-4 w-4" />
                                Tambah Pegawai
                            </button>
                        </div>
                    )}

                    {/* Main Table Card */}
                    <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
                        {error && (
                            <div className="m-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400 flex items-center gap-2">
                                <ShieldAlert className="h-5 w-5 flex-shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="overflow-x-auto">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Memuat data user...</p>
                                </div>
                            ) : filteredUsers.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-zinc-400 dark:text-zinc-500">
                                    <Users className="h-12 w-12 stroke-1 mb-2" />
                                    <p className="text-sm font-semibold">Tidak Ada Data</p>
                                    <p className="text-xs">Belum ada akun terdaftar dalam kategori ini.</p>
                                </div>
                            ) : (
                                <table className="min-w-full divide-y divide-zinc-200/80 dark:divide-zinc-800">
                                    <thead className="bg-[#E5E7EB]/50 dark:bg-zinc-950">
                                        <tr>
                                            <th scope="col" className="px-6 py-4.5 text-left text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider">Nama</th>
                                            {isPegawai ? (
                                                <th scope="col" className="px-6 py-4.5 text-center text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider">NIP</th>
                                            ) : null}
                                            {!isPegawai ? (
                                                <th scope="col" className="px-6 py-4.5 text-center text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider">Email</th>
                                            ) : null}
                                            {!isPegawai ? (
                                                <th scope="col" className="px-6 py-4.5 text-center text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider">No. HP</th>
                                            ) : (
                                                <th scope="col" className="px-6 py-4.5 text-center text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider">Role</th>
                                            )}
                                            {isPegawai ? (
                                                <th scope="col" className="px-6 py-4.5 text-center text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider">Unit Teknis</th>
                                            ) : null}
                                            <th scope="col" className="px-6 py-4.5 text-center text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 bg-white dark:bg-zinc-900">
                                        {filteredUsers.map((u) => (
                                            <tr key={u.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 transition-colors">
                                                <td className="px-6 py-5.5 whitespace-nowrap text-sm text-[var(--foreground)] font-base text-left">
                                                    {u.nama}
                                                </td>
                                                {isPegawai ? (
                                                    <td className="px-6 py-5.5 whitespace-nowrap text-sm text-[var(--foreground)] text-center">
                                                        {u.nip ? (
                                                            <span className="font-mono text-xs font-medium px-2 py-1 rounded-md">
                                                                {u.nip}
                                                            </span>
                                                        ) : (
                                                            <span className="text-zinc-400 dark:text-zinc-600 font-base">-</span>
                                                        )}
                                                    </td>
                                                ) : null}
                                                {!isPegawai ? (
                                                    <td className="px-6 py-5.5 whitespace-nowrap text-sm text-[var(--foreground)] font-base text-center">
                                                        {u.email || <span className="text-zinc-400 dark:text-zinc-650 font-base">-</span>}
                                                    </td>
                                                ) : null}
                                                {!isPegawai ? (
                                                    <td className="px-6 py-5.5 whitespace-nowrap text-sm text-[var(--foreground)] font-base text-center">
                                                        {u.no_hp || <span className="text-zinc-400 dark:text-zinc-650 font-base">-</span>}
                                                    </td>
                                                ) : (
                                                    <td className="px-6 py-5.5 whitespace-nowrap text-sm text-center">
                                                        <div className="flex justify-center">
                                                            <RoleUserBadge role={u.role} />
                                                        </div>
                                                    </td>
                                                )}
                                                {isPegawai ? (
                                                    <td className="px-6 py-5.5 whitespace-nowrap text-sm text-[var(--foreground)] font-base text-center">
                                                        {u.unit_teknis ? (
                                                            u.unit_teknis.nama
                                                        ) : (
                                                            <span className="text-zinc-400 dark:text-zinc-650 font-base">-</span>
                                                        )}
                                                    </td>
                                                ) : null}
                                                <td className="px-6 py-5.5 whitespace-nowrap text-sm text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button
                                                            onClick={() => handleEdit(u)}
                                                            className="inline-flex items-center justify-center rounded-lg bg-emerald-50 p-2 text-emerald-700 hover:bg-emerald-100 transition dark:bg-emerald-950/40 dark:text-emerald-400 dark:hover:bg-emerald-900/40 cursor-pointer"
                                                            title="Edit"
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(u.id)}
                                                            className="inline-flex items-center justify-center rounded-lg bg-red-50 p-2 text-red-700 hover:bg-red-100 transition dark:bg-red-950/40 dark:text-red-400 dark:hover:bg-red-900/40 cursor-pointer"
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
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
