"use client";

import { useState } from "react";
import { AlertCircle, FileText, Info, Globe, Calendar } from "lucide-react";

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
          Detail Kebutuhan Data
        </h2>
        <p className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm mt-1">
          Spesifikasi Permohonan
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
          <input
            id="jenisData"
            type="text"
            required
            disabled={loading}
            value={jenisData}
            onChange={(e) => setJenisData(e.target.value)}
            className="block w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-[#F8FAFC] dark:bg-zinc-950 px-4 py-3 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 shadow-sm focus:border-[var(--green-color)] focus:outline-none focus:ring-1 focus:ring-[var(--green-color)]"
            placeholder="Contoh: Curah Hujan Bulanan, Radiasi Matahari, Suhu Udara"
          />
        </div>
      </div>

      {/* Bentuk Data */}
      <div className="space-y-3">
        <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300">
          Bentuk Data yang Diinginkan <span className="text-red-500">*</span>
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Card 1: Data Mentah */}
          <button
            type="button"
            disabled={loading}
            onClick={() => setBentukData("Data mentah")}
            className={`flex items-center gap-4 p-4 rounded-xl border text-left transition duration-200 ${bentukData === "Data mentah"
                ? "border-[var(--green-color)] bg-emerald-50/20 dark:bg-emerald-950/10 ring-1 ring-[var(--green-color)]"
                : "border-zinc-200 dark:border-zinc-800 bg-[#F8FAFC]/50 dark:bg-zinc-900/50 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50"
              }`}
          >
            <div className="flex-shrink-0">
              <div
                className={`h-5 w-5 rounded-full border flex items-center justify-center transition duration-200 ${bentukData === "Data mentah"
                    ? "border-[var(--green-color)] bg-white dark:bg-zinc-950"
                    : "border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                  }`}
              >
                {bentukData === "Data mentah" && (
                  <div className="h-2.5 w-2.5 rounded-full bg-[var(--green-color)]" />
                )}
              </div>
            </div>
            <div>
              <span className="block text-sm font-bold text-zinc-900 dark:text-white leading-tight">
                Data Mentah
              </span>
              <span className="block text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-normal">
                Data observasi harian tanpa pengolahan lanjut.
              </span>
            </div>
          </button>

          {/* Card 2: Hasil Analisis */}
          <button
            type="button"
            disabled={loading}
            onClick={() => setBentukData("Hasil Analisis")}
            className={`flex items-center gap-4 p-4 rounded-xl border text-left transition duration-200 ${bentukData === "Hasil Analisis"
                ? "border-[var(--green-color)] bg-emerald-50/20 dark:bg-emerald-950/10 ring-1 ring-[var(--green-color)]"
                : "border-zinc-200 dark:border-zinc-800 bg-[#F8FAFC]/50 dark:bg-zinc-900/50 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50"
              }`}
          >
            <div className="flex-shrink-0">
              <div
                className={`h-5 w-5 rounded-full border flex items-center justify-center transition duration-200 ${bentukData === "Hasil Analisis"
                    ? "border-[var(--green-color)] bg-white dark:bg-zinc-950"
                    : "border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                  }`}
              >
                {bentukData === "Hasil Analisis" && (
                  <div className="h-2.5 w-2.5 rounded-full bg-[var(--green-color)]" />
                )}
              </div>
            </div>
            <div>
              <span className="block text-sm font-bold text-zinc-900 dark:text-white leading-tight">
                Hasil Analisis
              </span>
              <span className="block text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-normal">
                Data yang telah diolah menjadi statistik atau grafik.
              </span>
            </div>
          </button>
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
            <input
              id="wilayahKajian"
              type="text"
              required
              disabled={loading}
              value={wilayahKajian}
              onChange={(e) => setWilayahKajian(e.target.value)}
              className="block w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-[#F8FAFC] dark:bg-zinc-950 px-4 py-3 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 shadow-sm focus:border-[var(--green-color)] focus:outline-none focus:ring-1 focus:ring-[var(--green-color)]"
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
            <input
              id="periodeData"
              type="text"
              required
              disabled={loading}
              value={periodeData}
              onChange={(e) => setPeriodeData(e.target.value)}
              className="block w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-[#F8FAFC] dark:bg-zinc-950 px-4 py-3 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 shadow-sm focus:border-[var(--green-color)] focus:outline-none focus:ring-1 focus:ring-[var(--green-color)]"
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
          <textarea
            id="tujuanPenggunaan"
            required
            rows={4}
            disabled={loading}
            value={tujuanPenggunaan}
            onChange={(e) => setTujuanPenggunaan(e.target.value)}
            className="block w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-[#F8FAFC] dark:bg-zinc-950 px-4 py-3 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 shadow-sm focus:border-[var(--green-color)] focus:outline-none focus:ring-1 focus:ring-[var(--green-color)]"
            placeholder="Jelaskan secara detail tujuan penggunaan data (misal: Penelitian Tesis, Tugas Akhir, Kajian Iklim Instansi)"
          />
        </div>
      </div>

      {/* Action Buttons for Step 2 */}
      <div className="flex justify-between gap-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
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
