"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/sidebar/Sidebar";
import AppBar from "@/components/appbar/AppBar";
import { getUserFromToken, getRedirectPath } from "@/lib/auth";
import { ChevronLeft, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { getApiUrl } from "@/lib/api";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function EditAlatPage({ params }: PageProps) {
    const resolvedParams = use(params);
    const alatId = resolvedParams.id;
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    // Form inputs
    const [namaAlat, setNamaAlat] = useState("");
    const [hargaPeminjaman, setHargaPeminjaman] = useState<number | string>("");
    const [stok, setStok] = useState<number | string>(1);
    const [dipinjam, setDipinjam] = useState(0);
    const [sisaStok, setSisaStok] = useState(0);
    const [isActive, setIsActive] = useState(true);

    // Loading / error states
    const [loadingData, setLoadingData] = useState(true);
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

        const isKoordLab = currentUser.role === "pegawai" && Number(currentUser.unit_teknis_id) === 2;
        const isSuperAdmin = currentUser.role === "super_admin";

        if (!isKoordLab && !isSuperAdmin) {
            router.push(getRedirectPath(currentUser.role));
            return;
        }

        // Fetch Alat detail
        const loadAlatDetail = async () => {
            try {
                const res = await fetch(`${getApiUrl()}/alat/${alatId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!res.ok) {
                    throw new Error("Gagal mengambil data alat laboratorium");
                }
                const data = await res.json();
                setNamaAlat(data.nama_alat || "");
                setHargaPeminjaman(data.harga_peminjaman || 0);
                setStok(data.stok !== undefined ? data.stok : 1);
                setDipinjam(data.dipinjam || 0);
                setSisaStok(data.sisa_stok !== undefined ? data.sisa_stok : (data.stok || 1));
                setIsActive(data.is_active !== undefined ? data.is_active : true);
            } catch (err: any) {
                console.error(err);
                setError(err.message || "Gagal memuat data alat.");
            } finally {
                setLoadingData(false);
            }
        };

        loadAlatDetail();
    }, [alatId, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!namaAlat.trim()) {
            setError("Nama alat wajib diisi.");
            return;
        }
        if (hargaPeminjaman === "" || Number(hargaPeminjaman) < 0) {
            setError("Tarif peminjaman harus berupa angka yang valid.");
            return;
        }
        if (stok === "" || Number(stok) < 0) {
            setError("Stok alat harus berupa angka yang valid (minimal 0).");
            return;
        }

        setSubmitting(true);
        try {
            const token = localStorage.getItem("agro_token");
            const res = await fetch(`${getApiUrl()}/alat/${alatId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    nama_alat: namaAlat,
                    harga_peminjaman: Number(hargaPeminjaman),
                    stok: Number(stok),
                    is_active: isActive,
                }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.message || "Gagal memperbarui alat.");
            }

            router.push("/daftar-alat");
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Terjadi kesalahan saat memperbarui alat.");
        } finally {
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
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex flex-col flex-1 overflow-y-auto">
                <AppBar onMenuClick={() => { }} />

                {/* Content Container */}
                <main className="flex-1 p-8 space-y-6">
                    {/* Breadcrumbs / Back button */}
                    <div className="flex items-center gap-2">
                        <Link
                            href="/daftar-alat"
                            className="flex items-center text-sm font-medium text-[var(--foreground)] hover:cursor-pointer transition"
                        >
                            <ChevronLeft className="h-4 w-4 mr-0.5" />
                            Daftar Alat
                        </Link>
                        <span className="text-sm text-[var(--foreground)] dark:text-zinc-600">/</span>
                        <span className="text-sm font-medium text-[var(--foreground)] dark:text-zinc-450">
                            Edit
                        </span>
                        <span className="text-sm font-medium text-[var(--foreground)] dark:text-zinc-600">/</span>
                        <span className="text-sm font-semibold text-[var(--green-color)] line-clamp-1 max-w-xs">
                            {namaAlat || `Alat #${alatId}`}
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
                                        Form Edit Alat Laboratorium
                                    </h3>
                                    <p className="text-sm text-[var(--foreground)] dark:text-zinc-500">
                                        Perbarui nama alat, tarif peminjaman, atau status ketersediaan alat ini.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Nama Alat */}
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-[var(--foreground)] dark:text-zinc-300 tracking-wider block">
                                    Nama Alat <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={namaAlat}
                                    onChange={(e) => setNamaAlat(e.target.value)}
                                    placeholder="Masukkan nama alat..."
                                    className="block w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-[#F8FAFC] dark:bg-zinc-950 px-4 py-3 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 shadow-sm focus:border-[var(--green-color)] focus:outline-none focus:ring-1 focus:ring-[var(--green-color)]"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Tarif / Harga Peminjaman */}
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-[var(--foreground)] dark:text-zinc-300 tracking-wider block">
                                        Tarif / Harga Peminjaman (Rp) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        min={0}
                                        step={1000}
                                        value={hargaPeminjaman}
                                        onChange={(e) => setHargaPeminjaman(e.target.value)}
                                        placeholder="Contoh: 250000"
                                        className="block w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-[#F8FAFC] dark:bg-zinc-950 px-4 py-3 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 shadow-sm focus:border-[var(--green-color)] focus:outline-none focus:ring-1 focus:ring-[var(--green-color)]"
                                        required
                                    />
                                    <p className="text-[10px] text-zinc-500 font-medium">
                                        Tarif resmi per unit alat.
                                    </p>
                                </div>

                                {/* Jumlah Stok */}
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-[var(--foreground)] dark:text-zinc-300 tracking-wider block">
                                        Jumlah Stok (Unit) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        min={0}
                                        value={stok}
                                        onChange={(e) => setStok(e.target.value)}
                                        placeholder="Contoh: 5"
                                        className="block w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-[#F8FAFC] dark:bg-zinc-950 px-4 py-3 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 shadow-sm focus:border-[var(--green-color)] focus:outline-none focus:ring-1 focus:ring-[var(--green-color)]"
                                        required
                                    />
                                    <p className="text-[10px] text-zinc-500 font-medium">
                                        Total ketersediaan unit alat.
                                        {dipinjam > 0 && (
                                            <span className="block mt-1 text-amber-600 dark:text-amber-400 font-semibold">
                                                (Saat ini {dipinjam} unit sedang dipinjam, sisa tersedia {sisaStok} unit)
                                            </span>
                                        )}
                                    </p>
                                </div>

                                {/* Status Ketersediaan */}
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-[var(--foreground)] dark:text-zinc-300 tracking-wider block">
                                        Status Ketersediaan
                                    </label>
                                    <select
                                        value={isActive ? "true" : "false"}
                                        onChange={(e) => setIsActive(e.target.value === "true")}
                                        className="block w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-[#F8FAFC] dark:bg-zinc-950 px-4 py-3 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 shadow-sm focus:border-[var(--green-color)] focus:outline-none focus:ring-1 focus:ring-[var(--green-color)]"
                                    >
                                        <option value="true">Tersedia</option>
                                        <option value="false">Tidak Tersedia</option>
                                    </select>
                                    <p className="text-[10px] text-zinc-500 font-medium">
                                        Pilih Tidak Tersedia jika alat sedang dalam perbaikan atau tidak dapat dipinjam.
                                    </p>
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                                <button
                                    type="button"
                                    onClick={() => router.push("/daftar-alat")}
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
                                        <span>Simpan Perubahan</span>
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
