"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    User,
    MapPin,
    Calendar,
    FileText,
    AlertCircle
} from "lucide-react";

export interface LayananPerpustakaanData {
    nama: string;
    asalInstansi: string;
    tanggalDatang: string;
    keperluan: string;
}

interface LayananPerpustakaanFormProps {
    onSubmit: (data: LayananPerpustakaanData) => void;
    loading: boolean;
}

export default function LayananPerpustakaanForm({
    onSubmit,
    loading
}: LayananPerpustakaanFormProps) {
    const router = useRouter();

    // Form states
    const [nama, setNama] = useState("");
    const [asalInstansi, setAsalInstansi] = useState("");
    const [tanggalDatang, setTanggalDatang] = useState("");
    const [keperluan, setKeperluan] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        // Frontend validations
        if (!nama.trim()) {
            setError("Nama Lengkap wajib diisi!");
            return;
        }
        if (!asalInstansi.trim()) {
            setError("Asal Instansi wajib diisi!");
            return;
        }
        if (!tanggalDatang) {
            setError("Tanggal Kedatangan wajib diisi!");
            return;
        }
        if (!keperluan.trim()) {
            setError("Keperluan kunjungan wajib diisi!");
            return;
        }

        onSubmit({
            nama,
            asalInstansi,
            tanggalDatang,
            keperluan
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Header info inside the card */}
            <div className="mb-6 pb-4 border-b border-zinc-200 dark:border-zinc-800">
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                    Formulir Kunjungan Perpustakaan
                </h2>
                <p className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm mt-1">
                    Silakan isi informasi kunjungan Anda ke perpustakaan.
                </p>
            </div>

            {error && (
                <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/45 dark:text-red-400 border border-red-200 dark:border-red-900/40 flex items-start gap-3 shadow-sm transition duration-300">
                    <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <div>
                        <span className="font-bold">Kesalahan Validasi:</span>
                        <p className="mt-1 text-red-600 dark:text-red-400">{error}</p>
                    </div>
                </div>
            )}

            <div className="grid gap-6 sm:grid-cols-2">
                {/* Nama Lengkap */}
                <div className="space-y-2">
                    <label htmlFor="nama" className="block text-sm font-bold text-zinc-700 dark:text-zinc-300">
                        Nama Lengkap <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <input
                            id="nama"
                            type="text"
                            required
                            disabled={loading}
                            value={nama}
                            onChange={(e) => setNama(e.target.value)}
                            className="block w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-[#F8FAFC] dark:bg-zinc-950 px-4 py-3 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 shadow-sm focus:border-[var(--green-color)] focus:outline-none focus:ring-1 focus:ring-[var(--green-color)]"
                            placeholder="Masukkan nama lengkap Anda"
                        />
                    </div>
                </div>

                {/* Tanggal Kedatangan */}
                <div className="space-y-2">
                    <label htmlFor="tanggalDatang" className="block text-sm font-bold text-zinc-700 dark:text-zinc-300">
                        Tanggal Kedatangan <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <input
                            id="tanggalDatang"
                            type="date"
                            required
                            disabled={loading}
                            value={tanggalDatang}
                            onChange={(e) => setTanggalDatang(e.target.value)}
                            className="block w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-[#F8FAFC] dark:bg-zinc-950 px-4 py-3 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 shadow-sm focus:border-[var(--green-color)] focus:outline-none focus:ring-1 focus:ring-[var(--green-color)]"
                        />
                    </div>
                </div>
            </div>

            {/* Asal Instansi */}
            <div className="space-y-2">
                <label htmlFor="asalInstansi" className="block text-sm font-bold text-zinc-700 dark:text-zinc-300">
                    Asal Instansi <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                    <input
                        id="asalInstansi"
                        type="text"
                        required
                        disabled={loading}
                        value={asalInstansi}
                        onChange={(e) => setAsalInstansi(e.target.value)}
                        className="block w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-[#F8FAFC] dark:bg-zinc-950 px-4 py-3 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 shadow-sm focus:border-[var(--green-color)] focus:outline-none focus:ring-1 focus:ring-[var(--green-color)]"
                        placeholder="Contoh: Universitas Indonesia, Instansi Pemerintahan, Swasta, Umum"
                    />
                </div>
            </div>

            {/* Keperluan Kunjungan */}
            <div className="space-y-2">
                <label htmlFor="keperluan" className="block text-sm font-bold text-zinc-700 dark:text-zinc-300">
                    Keperluan Kunjungan <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                    <textarea
                        id="keperluan"
                        required
                        rows={3}
                        disabled={loading}
                        value={keperluan}
                        onChange={(e) => setKeperluan(e.target.value)}
                        className="block w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-[#F8FAFC] dark:bg-zinc-950 px-4 py-3 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 shadow-sm focus:border-[var(--green-color)] focus:outline-none focus:ring-1 focus:ring-[var(--green-color)]"
                        placeholder="Tuliskan tujuan dan keperluan kunjungan Anda (misal: Membaca buku, Mencari jurnal ilmiah, dll.)"
                    />
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <button
                    type="button"
                    onClick={() => router.back()}
                    disabled={loading}
                    className="px-5 py-2.5 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 rounded-xl text-sm font-bold transition disabled:opacity-50"
                >
                    Batal
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 bg-[var(--green-color)] hover:bg-emerald-650 text-white rounded-xl text-sm font-extrabold shadow-md transition disabled:opacity-50 flex items-center gap-2"
                >
                    Kirim
                </button>
            </div>
        </form>
    );
}
