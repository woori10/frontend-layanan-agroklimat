"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/sidebar/Sidebar";
import AppBar from "@/components/appbar/AppBar";
import { getUserFromToken, getRedirectPath } from "@/lib/auth";
import { ChevronLeft, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { getApiUrl } from "@/lib/api";

export default function TambahFaqPage() {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    // Form inputs
    const [pertanyaan, setPertanyaan] = useState("");
    const [jawaban, setJawaban] = useState("");
    const [urutan, setUrutan] = useState<number>(1);
    const [isActive, setIsActive] = useState(true);

    // Loading / error states
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

        // Fetch FAQ count to set default urutan
        const fetchNextUrutan = async () => {
            try {
                const res = await fetch(`${getApiUrl()}/faq/admin`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data)) {
                        setUrutan(data.length + 1);
                    }
                }
            } catch (err) {
                console.error("Gagal memuat urutan FAQ:", err);
            }
        };

        fetchNextUrutan();
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!pertanyaan.trim()) {
            setError("Pertanyaan wajib diisi.");
            return;
        }
        if (!jawaban.trim()) {
            setError("Jawaban wajib diisi.");
            return;
        }

        setSubmitting(true);
        try {
            const token = localStorage.getItem("agro_token");
            const res = await fetch(`${getApiUrl()}/faq`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    pertanyaan,
                    jawaban,
                    urutan: Number(urutan),
                    is_active: isActive,
                }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.message || "Gagal menyimpan FAQ.");
            }

            router.push("/kelola-faq");
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Terjadi kesalahan saat menyimpan FAQ.");
        } finally {
            setSubmitting(false);
        }
    };

    if (!mounted) {
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
                            href="/kelola-faq"
                            className="flex items-center text-sm font-semibold text-[var(--foreground)] transition hover:text-zinc-600 dark:hover:text-zinc-300"
                        >
                            <ChevronLeft className="h-4 w-4 mr-0.5" />
                            Kelola FAQ
                        </Link>
                        <span className="text-sm text-zinc-400 dark:text-zinc-600">/</span>
                        <span className="text-sm font-semibold text-[var(--green-color)]">
                            Tambah FAQ
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
                                        Form Tambah FAQ
                                    </h3>
                                    <p className="text-sm text-[var(--foreground)] dark:text-zinc-500">
                                        Lengkapi formulir untuk menambahkan pertanyaan dan jawaban baru ke dalam pusat bantuan FAQ.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Pertanyaan */}
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-[var(--foreground)] dark:text-zinc-300 tracking-wider block">
                                    Pertanyaan <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={pertanyaan}
                                    onChange={(e) => setPertanyaan(e.target.value)}
                                    placeholder="Contoh: Bagaimana cara mengajukan peminjaman alat?"
                                    className="block w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-[#F8FAFC] dark:bg-zinc-950 px-4 py-3 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 shadow-sm focus:border-[var(--green-color)] focus:outline-none focus:ring-1 focus:ring-[var(--green-color)]"
                                    required
                                />
                            </div>

                            {/* Jawaban */}
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-[var(--foreground)] dark:text-zinc-300 tracking-wider block">
                                    Jawaban Lengkap <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    rows={5}
                                    value={jawaban}
                                    onChange={(e) => setJawaban(e.target.value)}
                                    placeholder="Tuliskan jawaban lengkap yang informatif dan mudah dipahami..."
                                    className="block w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-[#F8FAFC] dark:bg-zinc-950 px-4 py-3 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 shadow-sm focus:border-[var(--green-color)] focus:outline-none focus:ring-1 focus:ring-[var(--green-color)] leading-relaxed"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Nomor Urut */}
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-[var(--foreground)] dark:text-zinc-300 tracking-wider block">
                                        Nomor Urutan Tampil
                                    </label>
                                    <input
                                        type="number"
                                        min={1}
                                        value={urutan}
                                        onChange={(e) => setUrutan(Number(e.target.value))}
                                        className="block w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-[#F8FAFC] dark:bg-zinc-950 px-4 py-3 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 shadow-sm focus:border-[var(--green-color)] focus:outline-none focus:ring-1 focus:ring-[var(--green-color)]"
                                    />
                                    <p className="text-[10px] text-zinc-500 font-medium">
                                        Angka terkecil akan tampil paling atas di Landing Page.
                                    </p>
                                </div>

                                {/* Status Publikasi */}
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-[var(--foreground)] dark:text-zinc-300 tracking-wider block">
                                        Status Publikasi
                                    </label>
                                    <select
                                        value={isActive ? "true" : "false"}
                                        onChange={(e) => setIsActive(e.target.value === "true")}
                                        className="block w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-[#F8FAFC] dark:bg-zinc-950 px-4 py-3 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 shadow-sm focus:border-[var(--green-color)] focus:outline-none focus:ring-1 focus:ring-[var(--green-color)]"
                                    >
                                        <option value="true">Diunggah (Tampil di Landing Page)</option>
                                        <option value="false">Draft (Disembunyikan)</option>
                                    </select>
                                    <p className="text-[10px] text-zinc-500 font-medium">
                                        Pilih Draft jika pertanyaan belum siap untuk ditampilkan ke publik.
                                    </p>
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                                <button
                                    type="button"
                                    onClick={() => router.push("/kelola-faq")}
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
                                        <span>Simpan FAQ</span>
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
