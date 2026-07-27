"use client";

import { useState } from "react";
import { AlertCircle, FileText, Info, Clock, Users, Calendar } from "lucide-react";

export interface AgroedukasiStep2 {
    topik: string;
    durasi: string;
    jumlahPeserta: string;
    tujuanKunjungan: string;
    tanggalKunjungan: string;
}

interface AgroedukasiStep2FormProps {
    onBack: () => void;
    onSubmit: (data: AgroedukasiStep2) => void;
    loading: boolean;
}

export default function AgroedukasiStep2Form({
    onBack,
    onSubmit,
    loading
}: AgroedukasiStep2FormProps) {
    // Local states for custom fields
    const [topik, setTopik] = useState("");
    const [durasi, setDurasi] = useState("");
    const [jumlahPeserta, setJumlahPeserta] = useState("");
    const [tujuanKunjungan, setTujuanKunjungan] = useState("");
    const [tanggalKunjungan, setTanggalKunjungan] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!topik.trim()) {
            setError("Topik Kunjungan wajib diisi!");
            return;
        }
        if (!durasi.trim()) {
            setError("Durasi Kunjungan wajib diisi!");
            return;
        }
        if (!jumlahPeserta.trim()) {
            setError("Jumlah Peserta wajib diisi!");
            return;
        }
        if (!tujuanKunjungan.trim()) {
            setError("Tujuan kunjungan wajib diisi!");
            return;
        }
        if (!tanggalKunjungan) {
            setError("Tanggal kunjungan wajib diisi!");
            return;
        }

        onSubmit({
            topik: topik.trim(),
            durasi: durasi.trim(),
            jumlahPeserta: jumlahPeserta.trim(),
            tujuanKunjungan: tujuanKunjungan.trim(),
            tanggalKunjungan,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 2 Header */}
            <div className="mb-6 pb-4 border-b border-zinc-200 dark:border-zinc-800">
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                    Langkah 2 dari 2: Informasi Tambahan Layanan
                </h2>
                <p className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm mt-1">
                    Silakan lengkapi detail kunjungan Agroedukasi.
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

            {/* Topik & Durasi */}
            <div className="grid gap-6 sm:grid-cols-2">
                {/* Topik Magang / Pelatihan */}
                <div className="space-y-2">
                    <label htmlFor="topik" className="block text-sm font-bold text-zinc-700 dark:text-zinc-300">
                        Topik Kunjungan <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-500">
                            <Info className="h-4 w-4" />
                        </span>
                        <input
                            id="topik"
                            type="text"
                            required
                            disabled={loading}
                            value={topik}
                            onChange={(e) => setTopik(e.target.value)}
                            className="block w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 pl-10 pr-4 py-2.5 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            placeholder="Contoh: Pengenalan AWS, Budidaya Hidroponik"
                        />
                    </div>
                </div>

                {/* Durasi */}
                <div className="space-y-2">
                    <label htmlFor="durasi" className="block text-sm font-bold text-zinc-700 dark:text-zinc-300">
                        Lama (Durasi) Kunjungan <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-500">
                            <Clock className="h-4 w-4" />
                        </span>
                        <input
                            id="durasi"
                            type="text"
                            required
                            disabled={loading}
                            value={durasi}
                            onChange={(e) => setDurasi(e.target.value)}
                            className="block w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 pl-10 pr-4 py-2.5 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            placeholder="Contoh: 3 Jam, 1 Hari, 2 Minggu"
                        />
                    </div>
                </div>
            </div>

            {/* Jumlah Peserta & Tanggal Kunjungan */}
            <div className="grid gap-6 sm:grid-cols-2">
                {/* Jumlah Peserta */}
                <div className="space-y-2">
                    <label htmlFor="jumlahPeserta" className="block text-sm font-bold text-zinc-700 dark:text-zinc-300">
                        Jumlah Peserta <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-500">
                            <Users className="h-4 w-4" />
                        </span>
                        <input
                            id="jumlahPeserta"
                            type="text"
                            required
                            disabled={loading}
                            value={jumlahPeserta}
                            onChange={(e) => setJumlahPeserta(e.target.value)}
                            className="block w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 pl-10 pr-4 py-2.5 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            placeholder="Contoh: 30 Orang, 2 Kelas"
                        />
                    </div>
                </div>

                {/* Tanggal Kunjungan */}
                <div className="space-y-2">
                    <label htmlFor="tanggalKunjungan" className="block text-sm font-bold text-zinc-700 dark:text-zinc-300">
                        Tanggal Kunjungan <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-500">
                            <Calendar className="h-4 w-4" />
                        </span>
                        <input
                            id="tanggalKunjungan"
                            type="date"
                            required
                            disabled={loading}
                            value={tanggalKunjungan}
                            onChange={(e) => setTanggalKunjungan(e.target.value)}
                            className="block w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 pl-10 pr-4 py-2.5 text-sm text-zinc-900 dark:text-white shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                    </div>
                </div>
            </div>

            {/* Tujuan Kunjungan */}
            <div className="space-y-2">
                <label htmlFor="tujuanKunjungan" className="block text-sm font-bold text-zinc-700 dark:text-zinc-300">
                    Tujuan Kunjungan <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 pt-3.5 flex items-start pointer-events-none text-zinc-400 dark:text-zinc-500">
                        <FileText className="h-4 w-4" />
                    </span>
                    <textarea
                        id="tujuanKunjungan"
                        required
                        rows={4}
                        disabled={loading}
                        value={tujuanKunjungan}
                        onChange={(e) => setTujuanKunjungan(e.target.value)}
                        className="block w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 pl-10 pr-4 py-2.5 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
                        placeholder="Jelaskan secara detail tujuan kunjungan edukasi ini (misal: Pengenalan instrumen agroklimatologi untuk siswa SMA)"
                    />
                </div>
            </div>

            {/* Action Buttons for Step 2 */}
            <div className="flex justify-end gap-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <button
                    type="button"
                    onClick={onBack}
                    disabled={loading}
                    className="px-5 py-2.5 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 rounded-xl text-sm font-bold transition disabled:opacity-50"
                >
                    Kembali
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
