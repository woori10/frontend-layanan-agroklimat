"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/sidebar/Sidebar";
import AppBar from "@/components/appbar/AppBar";
import { getUserFromToken, getRedirectPath } from "@/lib/auth";
import { ChevronLeft, Building2, CheckCircle2 } from "lucide-react";

export default function EditRekeningPage() {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Rekening state (dengan default yang dapat disimpan ke localStorage)
    const [namaBank, setNamaBank] = useState("Bank Mandiri");
    const [noRekening, setNoRekening] = useState("137-00-1234567-8");
    const [namaPemilik, setNamaPemilik] = useState("Balai Agroklimatologi & Hidrologi");
    const [tipeRekening, setTipeRekening] = useState("PNBP (Penerimaan Negara Bukan Pajak)");
    const [statusRekening, setStatusRekening] = useState("Aktif");
    const [instansi, setInstansi] = useState("Kementerian Pertanian / BSIP Agroklimat");

    const [submitting, setSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        setMounted(true);
        const token = localStorage.getItem("agro_token");
        if (!token) {
            router.push("/login");
            return;
        }

        const user = getUserFromToken();
        if (user && user.role !== "super_admin") {
            router.push(getRedirectPath(user.role));
            return;
        }

        // Ambil data rekening yang tersimpan di localStorage jika ada
        const savedBank = localStorage.getItem("agro_rekening_bank");
        const savedNo = localStorage.getItem("agro_rekening_nomor");
        const savedPemilik = localStorage.getItem("agro_rekening_pemilik");
        const savedTipe = localStorage.getItem("agro_rekening_tipe");
        const savedStatus = localStorage.getItem("agro_rekening_status");
        const savedInstansi = localStorage.getItem("agro_rekening_instansi");

        if (savedBank) setNamaBank(savedBank);
        if (savedNo) setNoRekening(savedNo);
        if (savedPemilik) setNamaPemilik(savedPemilik);
        if (savedTipe) setTipeRekening(savedTipe);
        if (savedStatus) setStatusRekening(savedStatus);
        if (savedInstansi) setInstansi(savedInstansi);
    }, [router]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        // Simpan konfigurasi rekening
        localStorage.setItem("agro_rekening_bank", namaBank);
        localStorage.setItem("agro_rekening_nomor", noRekening);
        localStorage.setItem("agro_rekening_pemilik", namaPemilik);
        localStorage.setItem("agro_rekening_tipe", tipeRekening);
        localStorage.setItem("agro_rekening_status", statusRekening);
        localStorage.setItem("agro_rekening_instansi", instansi);

        setSuccessMessage("Informasi rekening berhasil disimpan!");

        setTimeout(() => {
            setSubmitting(false);
            router.push("/kelola-tagihan");
        }, 1200);
    };

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

                <main className="flex-1 p-6 sm:p-8 space-y-6">
                    {/* Breadcrumb */}
                    <div className="flex items-center gap-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        <Link
                            href="/kelola-tagihan"
                            className="flex items-center text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white transition"
                        >
                            <ChevronLeft className="h-4 w-4 mr-1 text-zinc-700 dark:text-zinc-300" />
                            Kelola Tagihan
                        </Link>
                        <span className="text-zinc-400">/</span>
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100">Edit Rekening</span>
                    </div>

                    <div className="flex flex-col-reverse lg:flex-row items-start gap-8">
                        {/* Left Card - Form Edit */}
                        <div className="flex-1 w-full rounded-2xl border border-zinc-200/80 bg-white p-6 sm:p-8 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
                            {successMessage && (
                                <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-400 flex items-center gap-2">
                                    <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                                    <span>{successMessage}</span>
                                </div>
                            )}

                            <div className="mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="flex-1 space-y-2 pb-4 border-b border-b-zinc-200 dark:border-b-zinc-800">
                                        <h3 className="text-lg font-bold text-[var(--foreground)] dark:text-zinc-300">
                                            Edit Rekening
                                        </h3>
                                        <p className="text-sm text-[var(--foreground)] dark:text-zinc-500">
                                            Lengkapi formulir untuk menyimpan rekening bank tujuan pembayaran layanan.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                                    {/* Nama Bank */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider block">
                                            Nama Bank <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={namaBank}
                                            onChange={(e) => setNamaBank(e.target.value)}
                                            placeholder="Contoh: Bank Mandiri"
                                            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-[var(--green-color)] focus:ring-2 focus:ring-[var(--green-color)]/10 dark:border-zinc-700 dark:bg-zinc-800"
                                        />
                                    </div>

                                    {/* Nomor Rekening */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider block">
                                            Nomor Rekening <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={noRekening}
                                            onChange={(e) => setNoRekening(e.target.value)}
                                            placeholder="Contoh: 137-00-1234567-8"
                                            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-[var(--green-color)] focus:ring-2 focus:ring-[var(--green-color)]/10 dark:border-zinc-700 dark:bg-zinc-800 font-mono"
                                        />
                                    </div>

                                    {/* Nama Pemilik Rekening */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider block">
                                            Nama Pemilik Rekening <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={namaPemilik}
                                            onChange={(e) => setNamaPemilik(e.target.value)}
                                            placeholder="Contoh: Balai Agroklimatologi & Hidrologi"
                                            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-[var(--green-color)] focus:ring-2 focus:ring-[var(--green-color)]/10 dark:border-zinc-700 dark:bg-zinc-800"
                                        />
                                    </div>

                                    {/* Tipe Rekening */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider block">
                                            Tipe Rekening
                                        </label>
                                        <select
                                            value={tipeRekening}
                                            onChange={(e) => setTipeRekening(e.target.value)}
                                            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-[var(--green-color)] focus:ring-2 focus:ring-[var(--green-color)]/10 dark:border-zinc-700 dark:bg-zinc-800 cursor-pointer"
                                        >
                                            <option value="PNBP (Penerimaan Negara Bukan Pajak)">PNBP (Penerimaan Negara Bukan Pajak)</option>
                                            <option value="Non-PNBP">Non-PNBP</option>
                                            <option value="Operasional">Operasional Balai</option>
                                        </select>
                                    </div>

                                    {/* Status Rekening */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider block">
                                            Status Rekening
                                        </label>
                                        <select
                                            value={statusRekening}
                                            onChange={(e) => setStatusRekening(e.target.value)}
                                            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-[var(--green-color)] focus:ring-2 focus:ring-[var(--green-color)]/10 dark:border-zinc-700 dark:bg-zinc-800 cursor-pointer"
                                        >
                                            <option value="Aktif">Aktif</option>
                                            <option value="Nonaktif">Nonaktif</option>
                                        </select>
                                    </div>

                                    {/* Instansi */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider block">
                                            Instansi Terkait
                                        </label>
                                        <input
                                            type="text"
                                            value={instansi}
                                            onChange={(e) => setInstansi(e.target.value)}
                                            placeholder="Kementerian Pertanian / BSIP Agroklimat"
                                            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-[var(--green-color)] focus:ring-2 focus:ring-[var(--green-color)]/10 dark:border-zinc-700 dark:bg-zinc-800"
                                        />
                                    </div>
                                </div>



                                {/* Action Buttons */}
                                <div className="flex items-center justify-end gap-3 pt-6 border-t border-zinc-100 dark:border-zinc-800">
                                    <Link
                                        href="/kelola-tagihan"
                                        className="rounded-xl border border-zinc-200 px-5 py-2.5 text-sm font-semibold text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 transition cursor-pointer"
                                    >
                                        Batal
                                    </Link>

                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="rounded-xl bg-[#2C5E3B] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#234b2f] transition shadow-xs disabled:opacity-50 cursor-pointer"
                                    >
                                        {submitting ? "Menyimpan..." : "Simpan Perubahan"}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Right Card - Card Preview */}
                        <div className="w-full lg:w-auto h-fit shrink-0 rounded-2xl border border-zinc-200/80 bg-white p-6 sm:p-8 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
                            {/* Live Card Preview */}
                            <div className="space-y-4">
                                <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider block">
                                    Pratinjau Kartu Rekening
                                </span>
                                <div className="relative w-full sm:w-[320px] h-[180px] shrink-0 rounded-2xl overflow-hidden bg-gradient-to-br from-[#69b58b] via-[#7ed5a4] to-[#4e8d68] p-5 text-white shadow-sm">
                                    <div className="absolute -top-8 -right-5 w-28 h-28 rounded-3xl rotate-45 bg-white/10" />
                                    <div className="absolute -bottom-10 -left-8 w-32 h-32 rounded-3xl rotate-45 bg-[#1f6670]/40" />
                                    <div className="relative z-10 h-full flex flex-col justify-between">
                                        <div className="flex items-center justify-between">
                                            <span className="text-lg font-semibold tracking-wide">{namaBank || "Nama Bank"}</span>
                                        </div>

                                        <div>
                                            <p className="text-lg tracking-widest font-semibold font-mono">
                                                {noRekening || "000-00-0000000-0"}
                                            </p>
                                        </div>

                                        <div className="flex justify-between items-end">
                                            <div>
                                                <p className="text-[9px] opacity-80 uppercase">Pemilik Rekening</p>
                                                <p className="text-xs font-semibold">{namaPemilik || "-"}</p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] opacity-80 uppercase">Tipe</p>
                                                <p className="text-xs font-semibold">{tipeRekening.split(" ")[0]}</p>
                                            </div>
                                        </div>
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
