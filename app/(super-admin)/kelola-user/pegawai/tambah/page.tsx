"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/sidebar/Sidebar";
import AppBar from "@/components/appbar/AppBar";
import { getUserFromToken, getRedirectPath } from "@/lib/auth";
import { ArrowLeft, UserPlus, Sprout, ShieldAlert } from "lucide-react";

interface UnitTeknis {
    id: number;
    nama: string;
}

export default function TambahPegawaiPage() {
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Form inputs
    const [nama, setNama] = useState("");
    const [nip, setNip] = useState("");
    const [role, setRole] = useState("pegawai"); // default to pegawai
    const [unitTeknisId, setUnitTeknisId] = useState<string>("");

    // Dropdown options
    const [unitTeknisList, setUnitTeknisList] = useState<UnitTeknis[]>([]);

    // Loading / error states
    const [loadingUnits, setLoadingUnits] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

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

        // Fetch unit teknis list
        const fetchUnitTeknis = async () => {
            try {
                const response = await fetch("http://localhost:3000/users/unit-teknis/list", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (!response.ok) {
                    throw new Error("Gagal mengambil data unit teknis");
                }
                const data = await response.json();
                setUnitTeknisList(data);
                if (data.length > 0) {
                    setUnitTeknisId(data[0].id.toString());
                }
            } catch (err: any) {
                console.error(err);
                setError(err.message || "Gagal mengambil data unit teknis.");
            } finally {
                setLoadingUnits(false);
            }
        };

        fetchUnitTeknis();
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!nama.trim()) {
            setError("Nama lengkap wajib diisi.");
            return;
        }
        if (!nip.trim()) {
            setError("NIP wajib diisi.");
            return;
        }
        if (role === "pegawai" && !unitTeknisId) {
            setError("Unit teknis wajib dipilih untuk staf teknis.");
            return;
        }

        setSubmitting(true);
        try {
            const token = localStorage.getItem("agro_token");
            const payload = {
                nama,
                nip,
                role,
                unit_teknis_id: role === "pegawai" ? parseInt(unitTeknisId) : undefined,
            };

            const response = await fetch("http://localhost:3000/users", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || "Gagal menambah pegawai.");
            }

            // Redirect back to user list page
            router.push("/kelola-user/pegawai");
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Terjadi kesalahan saat menyimpan data.");
            setSubmitting(false);
        }
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
            {/* Sidebar for Desktop */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex flex-col flex-1 overflow-y-auto">
                {/* Top Navbar */}
                <AppBar onMenuClick={() => setSidebarOpen(true)} />

                {/* Content Container */}
                <main className="flex-1 p-6 max-w-6xl mx-auto w-full space-y-6">
                    {/* Breadcrumbs / Back button */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => router.push("/kelola-user/pegawai")}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-650 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 transition cursor-pointer"
                        >
                            <ArrowLeft className="h-4.5 w-4.5" />
                        </button>
                        <div className="flex flex-col text-left">
                            <span className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                Kelola User / Pegawai
                            </span>
                            <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                                Tambah Pegawai Baru
                            </span>
                        </div>
                    </div>

                    {/* Welcome / Info Banner */}
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 p-6 text-white shadow-lg shadow-emerald-600/10">
                        <div className="absolute right-0 top-0 -mr-6 -mt-6 opacity-10">
                            <Sprout className="h-48 w-48" />
                        </div>
                        <div className="relative z-10 space-y-2 text-left">
                            <h2 className="text-2xl font-extrabold md:text-3xl">
                                Registrasi Pegawai
                            </h2>
                            <p className="max-w-xl text-sm text-emerald-50 font-medium">
                                Tambahkan admin verifikator, kepala balai, atau staf teknis baru. Default password login akun baru adalah NIP pegawai yang bersangkutan.
                            </p>
                        </div>
                    </div>

                    {/* Form Card */}
                    <div className="rounded-2xl border border-zinc-200 bg-white p-6 md:p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 text-left">
                        {error && (
                            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400 flex items-center gap-2">
                                <ShieldAlert className="h-5 w-5 flex-shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Nama Lengkap */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider block">
                                        Nama Lengkap
                                    </label>
                                    <input
                                        type="text"
                                        value={nama}
                                        onChange={(e) => setNama(e.target.value)}
                                        placeholder="Masukkan nama lengkap"
                                        className="w-full rounded-xl border border-zinc-250 bg-white px-4 py-3 text-sm placeholder-zinc-400 focus:border-[#2C5E3B] focus:ring-1 focus:ring-[#2C5E3B] dark:border-zinc-800 dark:bg-zinc-950 dark:placeholder-zinc-600 focus:outline-none transition"
                                        required
                                    />
                                </div>

                                {/* NIP */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider block">
                                        NIP
                                    </label>
                                    <input
                                        type="text"
                                        value={nip}
                                        onChange={(e) => setNip(e.target.value)}
                                        placeholder="Masukkan NIP (sekaligus password default)"
                                        className="w-full rounded-xl border border-zinc-250 bg-white px-4 py-3 text-sm placeholder-zinc-400 focus:border-[#2C5E3B] focus:ring-1 focus:ring-[#2C5E3B] dark:border-zinc-800 dark:bg-zinc-950 dark:placeholder-zinc-600 focus:outline-none transition"
                                        required
                                    />
                                </div>

                                {/* Role */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider block">
                                        Role / Jabatan
                                    </label>
                                    <select
                                        value={role}
                                        onChange={(e) => setRole(e.target.value)}
                                        className="w-full rounded-xl border border-zinc-250 bg-white px-4 py-3 text-sm focus:border-[#2C5E3B] focus:ring-1 focus:ring-[#2C5E3B] dark:border-zinc-800 dark:bg-zinc-950 focus:outline-none transition cursor-pointer"
                                    >
                                        <option value="pegawai">Staf Teknis (Pegawai)</option>
                                        <option value="admin">Admin Verifikator</option>
                                        <option value="kepala_balai">Kepala Balai</option>
                                    </select>
                                </div>

                                {/* Unit Teknis - only enabled if role is pegawai */}
                                <div className="space-y-2">
                                    <label className={`text-xs font-bold uppercase tracking-wider block ${role !== "pegawai" ? "text-zinc-400 dark:text-zinc-600" : "text-zinc-700 dark:text-zinc-300"}`}>
                                        Unit Teknis
                                    </label>
                                    <select
                                        value={unitTeknisId}
                                        onChange={(e) => setUnitTeknisId(e.target.value)}
                                        disabled={role !== "pegawai" || loadingUnits}
                                        className="w-full rounded-xl border border-zinc-250 bg-white px-4 py-3 text-sm focus:border-[#2C5E3B] focus:ring-1 focus:ring-[#2C5E3B] dark:border-zinc-800 dark:bg-zinc-950 disabled:bg-zinc-100 disabled:text-zinc-400 dark:disabled:bg-zinc-900/50 dark:disabled:text-zinc-600 focus:outline-none transition cursor-pointer"
                                    >
                                        {loadingUnits ? (
                                            <option value="">Memuat unit teknis...</option>
                                        ) : (
                                            unitTeknisList.map((unit) => (
                                                <option key={unit.id} value={unit.id}>
                                                    {unit.nama}
                                                </option>
                                            ))
                                        )}
                                    </select>
                                    {role !== "pegawai" && (
                                        <p className="text-[10px] text-zinc-500 font-medium mt-1">
                                            Unit teknis hanya wajib dipilih untuk role Staf Teknis.
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                                <button
                                    type="button"
                                    onClick={() => router.push("/kelola-user/pegawai")}
                                    className="px-5 py-2.5 rounded-xl border border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800 text-sm font-semibold transition cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-5 py-2.5 rounded-xl bg-[var(--green-color)] text-white hover:bg-[#22482E] disabled:bg-[#2C5E3B]/70 font-semibold text-sm transition shadow-sm cursor-pointer flex items-center gap-2"
                                >
                                    {submitting ? (
                                        <>
                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                            <span>Menyimpan...</span>
                                        </>
                                    ) : (
                                        <>
                                            <UserPlus className="h-4 w-4" />
                                            <span>Simpan Pegawai</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </main>
            </div>
        </div>
    );
}
