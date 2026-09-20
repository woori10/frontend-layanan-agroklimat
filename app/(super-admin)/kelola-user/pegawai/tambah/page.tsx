"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Sidebar from "@/components/sidebar/Sidebar";
import AppBar from "@/components/appbar/AppBar";
import { getUserFromToken, getRedirectPath } from "@/lib/auth";
import { ChevronLeft, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { getApiUrl } from "@/lib/api";

interface UnitTeknis {
    id: number;
    nama: string;
}

function TambahPegawaiForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const editId = searchParams.get("id");
    const isEdit = Boolean(editId);

    const [mounted, setMounted] = useState(false);

    // Form inputs
    const [nama, setNama] = useState("");
    const [nip, setNip] = useState("");
    const [email, setEmail] = useState("");
    const [noHp, setNoHp] = useState("");
    const [role, setRole] = useState("pegawai"); // default to pegawai
    const [unitTeknisId, setUnitTeknisId] = useState<string>("");

    // Dropdown options
    const [unitTeknisList, setUnitTeknisList] = useState<UnitTeknis[]>([]);

    // Loading / error states
    const [loadingUnits, setLoadingUnits] = useState(true);
    const [loadingData, setLoadingData] = useState(false);
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

        // Fetch unit teknis list & user detail if editing
        const initializeData = async () => {
            try {
                // 1. Fetch unit teknis
                const response = await fetch(`${getApiUrl()}/users/unit-teknis/list`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (!response.ok) {
                    throw new Error("Gagal mengambil data unit teknis");
                }
                const dataUnits = await response.json();
                setUnitTeknisList(dataUnits);
                if (dataUnits.length > 0 && !editId) {
                    setUnitTeknisId(dataUnits[0].id.toString());
                }

                // 2. If edit mode, fetch existing employee detail
                if (editId) {
                    setLoadingData(true);
                    const userRes = await fetch(`${getApiUrl()}/users/${editId}`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });

                    if (!userRes.ok) {
                        throw new Error("Gagal mengambil data pegawai yang akan diedit");
                    }

                    const userData = await userRes.json();
                    setNama(userData.nama || "");
                    setNip(userData.nip || "");
                    setEmail(userData.email || "");
                    setNoHp(userData.no_hp || "");
                    setRole(userData.role || "pegawai");
                    if (userData.unit_teknis_id) {
                        setUnitTeknisId(userData.unit_teknis_id.toString());
                    } else if (dataUnits.length > 0) {
                        setUnitTeknisId(dataUnits[0].id.toString());
                    }
                }
            } catch (err: any) {
                console.error(err);
                setError(err.message || "Terjadi kesalahan saat memuat data.");
            } finally {
                setLoadingUnits(false);
                setLoadingData(false);
            }
        };

        initializeData();
    }, [router, editId]);

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
                email: email.trim() ? email.trim() : undefined,
                no_hp: noHp.trim() ? noHp.trim() : undefined,
                role,
                unit_teknis_id: role === "pegawai" && unitTeknisId ? parseInt(unitTeknisId) : null,
            };

            const url = isEdit
                ? `${getApiUrl()}/users/${editId}`
                : `${getApiUrl()}/users`;
            const method = isEdit ? "PATCH" : "POST";

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                const message = Array.isArray(errData.message)
                    ? errData.message.join(", ")
                    : errData.message || (isEdit ? "Gagal memperbarui pegawai." : "Gagal menambah pegawai.");
                throw new Error(message);
            }

            // Redirect back to user list page
            router.push("/kelola-user/pegawai");
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Terjadi kesalahan saat menyimpan data.");
            setSubmitting(false);
        }
    };

    if (!mounted || loadingData) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-secondary-green-color border-t-transparent"></div>
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
                <AppBar onMenuClick={() => { }} />

                {/* Content Container */}
                <main className="flex-1 p-8 space-y-6">
                    {/* Breadcrumbs / Back button */}
                    <div className="flex items-center gap-2">
                        <Link
                            href={`/kelola-user/pegawai`}
                            className="flex items-center text-sm font-semibold text-[var(--foreground)] transition hover:text-zinc-600 dark:hover:text-zinc-300"
                        >
                            <ChevronLeft className="h-4 w-4 mr-0.5" />
                            Kelola User / Pegawai
                        </Link>
                        <span className="text-sm text-zinc-400 dark:text-zinc-600">/</span>
                        <span className="text-sm font-semibold text-[var(--green-color)]">
                            {isEdit ? "Edit Pegawai" : "Tambah Pegawai"}
                        </span>
                    </div>

                    {/* Form Card */}
                    <div className="rounded-2xl border border-zinc-200 bg-white p-6 md:p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 text-left">
                        {error && (
                            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400 flex items-center gap-2">
                                <ShieldAlert className="h-5 w-5 flex-shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="mb-6">
                            <div className="flex items-center gap-3">
                                <div className="flex-1 space-y-2 pb-4 border-b border-b-zinc-200 dark:border-b-zinc-800">
                                    <h3 className="text-lg font-bold text-[var(--foreground)] dark:text-zinc-300">
                                        {isEdit ? "Form Edit Pegawai" : "Form Tambah Pegawai"}
                                    </h3>
                                    <p className="text-sm text-[var(--foreground)] dark:text-zinc-500">
                                        {isEdit
                                            ? "Perbarui informasi akun pegawai dan hak akses portal internal"
                                            : "Lengkapi formulir untuk membuat akun pegawai dan mengakses portal internal"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Nama Lengkap */}
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-[var(--foreground)] dark:text-zinc-300 tracking-wider block">
                                        Nama Lengkap <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={nama}
                                        onChange={(e) => setNama(e.target.value)}
                                        placeholder="Masukkan nama lengkap"
                                        className="block w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-[#F8FAFC] dark:bg-zinc-950 px-4 py-3 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 shadow-sm focus:border-[var(--green-color)] focus:outline-none focus:ring-1 focus:ring-[var(--green-color)]"
                                        required
                                    />
                                </div>

                                {/* NIP */}
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-[var(--foreground)] dark:text-zinc-300 tracking-wider block">
                                        NIP <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={nip}
                                        onChange={(e) => setNip(e.target.value)}
                                        placeholder={isEdit ? "Masukkan NIP" : "Masukkan NIP (sekaligus password default)"}
                                        className="block w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-[#F8FAFC] dark:bg-zinc-950 px-4 py-3 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 shadow-sm focus:border-[var(--green-color)] focus:outline-none focus:ring-1 focus:ring-[var(--green-color)]"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Email */}
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-[var(--foreground)] dark:text-zinc-300 tracking-wider block">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="contoh: pegawai@pertanian.go.id"
                                        className="block w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-[#F8FAFC] dark:bg-zinc-950 px-4 py-3 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 shadow-sm focus:border-[var(--green-color)] focus:outline-none focus:ring-1 focus:ring-[var(--green-color)]"
                                    />
                                </div>

                                {/* No HP */}
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-[var(--foreground)] dark:text-zinc-300 tracking-wider block">
                                        Nomor HP / WhatsApp
                                    </label>
                                    <input
                                        type="tel"
                                        value={noHp}
                                        onChange={(e) => setNoHp(e.target.value)}
                                        placeholder="contoh: 081234567890"
                                        className="block w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-[#F8FAFC] dark:bg-zinc-950 px-4 py-3 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 shadow-sm focus:border-[var(--green-color)] focus:outline-none focus:ring-1 focus:ring-[var(--green-color)]"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Role */}
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-[var(--foreground)] dark:text-zinc-300 tracking-wider block">
                                        Role / Jabatan <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={role}
                                        onChange={(e) => setRole(e.target.value)}
                                        className="block w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-[#F8FAFC] dark:bg-zinc-950 px-4 py-3 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 shadow-sm focus:border-[var(--green-color)] focus:outline-none focus:ring-1 focus:ring-[var(--green-color)]"
                                    >
                                        <option value="pegawai">Staf Teknis (Pegawai)</option>
                                        <option value="admin">Admin Verifikator</option>
                                        <option value="kepala_balai">Kepala Balai</option>
                                    </select>
                                </div>

                                {/* Unit Teknis - only enabled if role is pegawai */}
                                <div className="space-y-2">
                                    <label className={`text-xs font-medium tracking-wider block ${role !== "pegawai" ? "text-zinc-400 dark:text-zinc-600" : "text-[var(--foreground)] dark:text-zinc-300"}`}>
                                        Unit Teknis {role === "pegawai" && <span className="text-red-500">*</span>}
                                    </label>
                                    <select
                                        value={unitTeknisId}
                                        onChange={(e) => setUnitTeknisId(e.target.value)}
                                        disabled={role !== "pegawai" || loadingUnits}
                                        className="block w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-[#F8FAFC] dark:bg-zinc-950 px-4 py-3 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 shadow-sm focus:border-[var(--green-color)] focus:outline-none focus:ring-1 focus:ring-[var(--green-color)] disabled:opacity-50"
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
                                        <span>{isEdit ? "Simpan Perubahan" : "Buat Akun"}</span>
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

export default function TambahPegawaiPage() {
    return (
        <Suspense
            fallback={
                <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-secondary-green-color border-t-transparent"></div>
                </div>
            }
        >
            <TambahPegawaiForm />
        </Suspense>
    );
}
