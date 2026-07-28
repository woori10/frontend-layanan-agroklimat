"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/sidebar/Sidebar";
import AppBar from "@/components/appbar/AppBar";
import RoleUserBadge from "@/components/badge/role-user/RoleUserBadge";
import { getUserFromToken, getRedirectPath } from "@/lib/auth";
import { Users, Sprout, ShieldAlert, Pencil, Trash2 } from "lucide-react";

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
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-zinc-100 bg-zinc-50/50 text-xs font-medium uppercase tracking-wider text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950/50 dark:text-zinc-400">
                                            <th className="text-center px-6 py-4">Nama</th>
                                            {isPegawai ? (
                                                <th className="text-center px-6 py-4">NIP</th>
                                            ) : null}
                                            <th className="text-center px-6 py-4">Email</th>
                                            {!isPegawai ? (
                                                <th className="text-center px-6 py-4">No. HP</th>
                                            ) : (
                                                <th className="text-center px-6 py-4">Role</th>
                                            )}
                                            {isPegawai ? (
                                                <th className="text-center px-6 py-4">Unit Teknis</th>
                                            ) : null}
                                            <th className="text-center px-6 py-4">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-100 text-sm dark:divide-zinc-800 font-medium">
                                        {filteredUsers.map((u) => (
                                            <tr key={u.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-950/50 transition">
                                                <td className="text-center px-6 py-4 font-medium text-zinc-900 dark:text-white whitespace-nowrap">
                                                    {u.nama}
                                                </td>
                                                {isPegawai ? (
                                                    <td className="text-center px-6 py-4">
                                                        {u.nip ? (
                                                            <span className="font-mono text-xs font-medium px-2 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-md">
                                                                {u.nip}
                                                            </span>
                                                        ) : (
                                                            <span className="text-zinc-400 dark:text-zinc-600 font-medium">-</span>
                                                        )}
                                                    </td>
                                                ) : null}
                                                <td className="text-center px-6 py-4 text-zinc-650 dark:text-zinc-400 font-medium">
                                                    {u.email || <span className="text-zinc-400 dark:text-zinc-600 font-medium">-</span>}
                                                </td>
                                                {!isPegawai ? (
                                                    <td className="text-center px-6 py-4 text-zinc-650 dark:text-zinc-400 font-medium">
                                                        {u.no_hp || <span className="text-zinc-400 dark:text-zinc-600 font-medium">-</span>}
                                                    </td>
                                                ) : (
                                                    <td className="text-center px-6 py-4 whitespace-nowrap">
                                                        <RoleUserBadge role={u.role} />
                                                    </td>
                                                )}
                                                {isPegawai ? (
                                                    <td className="text-center px-6 py-4 font-medium text-zinc-700 dark:text-zinc-350">
                                                        {u.unit_teknis ? (
                                                            u.unit_teknis.nama
                                                        ) : (
                                                            <span className="text-zinc-400 dark:text-zinc-600 font-medium">-</span>
                                                        )}
                                                    </td>
                                                ) : null}
                                                <td className="text-center px-6 py-4 whitespace-nowrap">
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
