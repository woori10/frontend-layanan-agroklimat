"use client";

import { useState } from "react";
import { AlertCircle, FileText, Info, Database, Globe, Calendar } from "lucide-react";

export interface PermohonanDataStep2 {
  jenisData: string;
  bentukData: string;
  tujuanPenggunaan: string;
  wilayahKajian: string;
  periodeData: string;
}

interface PermohonanDataStep2FormProps {
  onBack: () => void;
  onSubmit: (data: PermohonanDataStep2) => void;
  loading: boolean;
}

export default function PermohonanDataStep2Form({
  onBack,
  onSubmit,
  loading
}: PermohonanDataStep2FormProps) {
  // Local states for custom fields
  const [jenisData, setJenisData] = useState("");
  const [bentukData, setBentukData] = useState("Data mentah");
  const [tujuanPenggunaan, setTujuanPenggunaan] = useState("");
  const [wilayahKajian, setWilayahKajian] = useState("");
  const [periodeData, setPeriodeData] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!jenisData.trim()) {
      setError("Jenis Data wajib diisi!");
      return;
    }
    if (!bentukData) {
      setError("Bentuk Data wajib dipilih!");
      return;
    }
    if (!tujuanPenggunaan.trim()) {
      setError("Tujuan Penggunaan Data wajib diisi!");
      return;
    }
    if (!wilayahKajian.trim()) {
      setError("Wilayah Kajian wajib diisi!");
      return;
    }
    if (!periodeData.trim()) {
      setError("Periode Data wajib diisi!");
      return;
    }

    onSubmit({
      jenisData: jenisData.trim(),
      bentukData,
      tujuanPenggunaan: tujuanPenggunaan.trim(),
      wilayahKajian: wilayahKajian.trim(),
      periodeData: periodeData.trim(),
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
          Silakan lengkapi spesifikasi data yang Anda perlukan.
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

      {/* Jenis Data */}
      <div className="space-y-2">
        <label htmlFor="jenisData" className="block text-sm font-bold text-zinc-700 dark:text-zinc-300">
          Jenis Data <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-500">
            <Info className="h-4 w-4" />
          </span>
          <input
            id="jenisData"
            type="text"
            required
            disabled={loading}
            value={jenisData}
            onChange={(e) => setJenisData(e.target.value)}
            className="block w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 pl-10 pr-4 py-2.5 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            placeholder="Contoh: Curah Hujan Bulanan, Radiasi Matahari, Suhu Udara"
          />
        </div>
      </div>

      {/* Bentuk Data */}
      <div className="space-y-2">
        <label htmlFor="bentukData" className="block text-sm font-bold text-zinc-700 dark:text-zinc-300">
          Bentuk Data <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-500">
            <Database className="h-4 w-4" />
          </span>
          <select
            id="bentukData"
            required
            disabled={loading}
            value={bentukData}
            onChange={(e) => setBentukData(e.target.value)}
            className="block w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 pl-10 pr-4 py-2.5 text-sm text-zinc-900 dark:text-white shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="Data mentah">Data mentah</option>
            <option value="Hasil Analisis">Hasil Analisis</option>
          </select>
        </div>
      </div>

      {/* Wilayah Kajian & Periode Data */}
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

        {/* Periode Data */}
        <div className="space-y-2">
          <label htmlFor="periodeData" className="block text-sm font-bold text-zinc-700 dark:text-zinc-300">
            Periode Data <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-405 dark:text-zinc-505">
              <Calendar className="h-4 w-4" />
            </span>
            <input
              id="periodeData"
              type="text"
              required
              disabled={loading}
              value={periodeData}
              onChange={(e) => setPeriodeData(e.target.value)}
              className="block w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 pl-10 pr-4 py-2.5 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              placeholder="Contoh: Tahun 2015 s.d. 2025"
            />
          </div>
        </div>
      </div>

      {/* Tujuan Penggunaan Data */}
      <div className="space-y-2">
        <label htmlFor="tujuanPenggunaan" className="block text-sm font-bold text-zinc-700 dark:text-zinc-300">
          Tujuan Penggunaan Data <span className="text-red-500">*</span>
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
            placeholder="Jelaskan secara detail tujuan penggunaan data (misal: Penelitian Tesis, Tugas Akhir, Kajian Iklim Instansi)"
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
