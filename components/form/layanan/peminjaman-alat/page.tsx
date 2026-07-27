"use client";

import { useState } from "react";
import { AlertCircle, FileText, Info, Globe, Calendar } from "lucide-react";

export interface PeminjamanAlatStep2 {
  jenisAlat: string;
  tujuanPenggunaan: string;
  wilayahKajian: string;
  periodePeminjaman: string;
}

interface PeminjamanAlatStep2FormProps {
  onBack: () => void;
  onSubmit: (data: PeminjamanAlatStep2) => void;
  loading: boolean;
}

export default function PeminjamanAlatStep2Form({
  onBack,
  onSubmit,
  loading
}: PeminjamanAlatStep2FormProps) {
  // Local states for custom fields
  const [jenisAlat, setJenisAlat] = useState("");
  const [tujuanPenggunaan, setTujuanPenggunaan] = useState("");
  const [wilayahKajian, setWilayahKajian] = useState("");
  const [periodePeminjaman, setPeriodePeminjaman] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!jenisAlat.trim()) {
      setError("Jenis Alat wajib diisi!");
      return;
    }
    if (!tujuanPenggunaan.trim()) {
      setError("Tujuan Penggunaan Alat wajib diisi!");
      return;
    }
    if (!wilayahKajian.trim()) {
      setError("Wilayah Kajian wajib diisi!");
      return;
    }
    if (!periodePeminjaman.trim()) {
      setError("Periode Peminjaman wajib diisi!");
      return;
    }

    onSubmit({
      jenisAlat: jenisAlat.trim(),
      tujuanPenggunaan: tujuanPenggunaan.trim(),
      wilayahKajian: wilayahKajian.trim(),
      periodePeminjaman: periodePeminjaman.trim(),
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
          Silakan lengkapi spesifikasi alat yang ingin Anda pinjam.
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

      {/* Jenis Alat */}
      <div className="space-y-2">
        <label htmlFor="jenisAlat" className="block text-sm font-bold text-zinc-700 dark:text-zinc-300">
          Jenis Alat <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-500">
            <Info className="h-4 w-4" />
          </span>
          <input
            id="jenisAlat"
            type="text"
            required
            disabled={loading}
            value={jenisAlat}
            onChange={(e) => setJenisAlat(e.target.value)}
            className="block w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 pl-10 pr-4 py-2.5 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            placeholder="Contoh: AWS (Automatic Weather Station), Anemometer, Thermohygrometer"
          />
        </div>
      </div>

      {/* Wilayah Kajian & Periode Peminjaman */}
      <div className="grid gap-6 sm:grid-cols-2">
        {/* Wilayah Kajian */}
        <div className="space-y-2">
          <label htmlFor="wilayahKajian" className="block text-sm font-bold text-zinc-700 dark:text-zinc-300">
            Wilayah Kajian <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-500">
              <Globe className="h-4 w-4" />
            </span>
            <input
              id="wilayahKajian"
              type="text"
              required
              disabled={loading}
              value={wilayahKajian}
              onChange={(e) => setWilayahKajian(e.target.value)}
              className="block w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 pl-10 pr-4 py-2.5 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              placeholder="Contoh: Kabupaten Bogor, Jawa Barat"
            />
          </div>
        </div>

        {/* Periode Peminjaman */}
        <div className="space-y-2">
          <label htmlFor="periodePeminjaman" className="block text-sm font-bold text-zinc-700 dark:text-zinc-300">
            Periode Peminjaman <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-405 dark:text-zinc-505">
              <Calendar className="h-4 w-4" />
            </span>
            <input
              id="periodePeminjaman"
              type="text"
              required
              disabled={loading}
              value={periodePeminjaman}
              onChange={(e) => setPeriodePeminjaman(e.target.value)}
              className="block w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 pl-10 pr-4 py-2.5 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              placeholder="Contoh: 1 Juli s.d. 14 Juli 2026"
            />
          </div>
        </div>
      </div>

      {/* Tujuan Penggunaan Alat */}
      <div className="space-y-2">
        <label htmlFor="tujuanPenggunaan" className="block text-sm font-bold text-zinc-700 dark:text-zinc-300">
          Tujuan Penggunaan Alat <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3.5 pt-3.5 flex items-start pointer-events-none text-zinc-400 dark:text-zinc-500">
            <FileText className="h-4 w-4" />
          </span>
          <textarea
            id="tujuanPenggunaan"
            required
            rows={4}
            disabled={loading}
            value={tujuanPenggunaan}
            onChange={(e) => setTujuanPenggunaan(e.target.value)}
            className="block w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 pl-10 pr-4 py-2.5 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
            placeholder="Jelaskan secara detail tujuan penggunaan alat yang Anda pinjam"
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
