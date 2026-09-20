"use client";

import { useState, useEffect } from "react";
import { AlertCircle, FileText, Info, ArrowLeft } from "lucide-react";

export interface KonsultasiSiapTanamStep2 {
  jenisData: string;
  alasan: string;
}

interface KonsultasiSiapTanamStep2FormProps {
  onBack: () => void;
  onSubmit: (data: KonsultasiSiapTanamStep2) => void;
  loading: boolean;
  initialData?: KonsultasiSiapTanamStep2;
}

export default function KonsultasiSiapTanamStep2Form({
  onBack,
  onSubmit,
  loading,
  initialData,
}: KonsultasiSiapTanamStep2FormProps) {
  // Local states for custom fields
  const [jenisData, setJenisData] = useState(initialData?.jenisData || "");
  const [alasan, setAlasan] = useState(initialData?.alasan || "");
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialData) {
      setJenisData(initialData.jenisData || "");
      setAlasan(initialData.alasan || "");
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!jenisData.trim()) {
      setError("Jenis Data / Informasi wajib diisi!");
      return;
    }
    if (!alasan.trim()) {
      setError("Alasan Permintaan / Pengajuan wajib diisi!");
      return;
    }

    onSubmit({
      jenisData: jenisData.trim(),
      alasan: alasan.trim()
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Step 2 Header */}
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <h2 className="text-sm md:text-lg font-bold text-zinc-900 dark:text-white">
          Informasi Konsultasi
        </h2>
        <p className="text-[var(--green-color)] dark:text-white text-[10px] md:text-xs font-semibold bg-secondary-green-color dark:bg-secondary-green-color border border-[var(--green-color)]/50 px-2 py-1 rounded-xl whitespace-nowrap">
          Langkah 2 dari 2
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

      {/* Jenis Data / Informasi */}
      <div className="space-y-2">
        <label htmlFor="jenisData" className="block text-xs md:text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          Jenis Data / Informasi <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            id="jenisData"
            type="text"
            required
            disabled={loading}
            value={jenisData}
            onChange={(e) => setJenisData(e.target.value)}
            className="block w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-[#F8FAFC] dark:bg-zinc-950 px-4 py-3 text-xs md:text-sm text-zinc-900 dark:text-white placeholder-zinc-400 shadow-sm focus:border-[var(--green-color)] focus:outline-none focus:ring-1 focus:ring-[var(--green-color)]"
            placeholder="Masukkan jenis data atau informasi singkat yang diminta"
          />
        </div>
      </div>

      {/* Alasan Permintaan / Pengajuan */}
      <div className="space-y-2">
        <label htmlFor="alasan" className="block text-xs md:text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          Alasan Permintaan / Pengajuan Rekomendasi / Pengajuan Konsultasi <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <textarea
            id="alasan"
            required
            rows={4}
            disabled={loading}
            value={alasan}
            onChange={(e) => setAlasan(e.target.value)}
            className="block w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-[#F8FAFC] dark:bg-zinc-950 px-4 py-3 text-xs md:text-sm text-zinc-900 dark:text-white placeholder-zinc-400 shadow-sm focus:border-[var(--green-color)] focus:outline-none focus:ring-1 focus:ring-[var(--green-color)]"
            placeholder="Jelaskan secara detail alasan permohonan data atau pengajuan rekomendasi"
          />
        </div>
      </div>

      {/* Action Buttons for Step 2 */}
      <div className="flex justify-between gap-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="px-5 py-2.5 border border-zinc-300 dark:border-zinc-700 hover:cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 rounded-xl text-xs md:text-sm font-bold transition disabled:opacity-50"
        >
          Kembali
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-[var(--green-color)] hover:cursor-pointer hover:bg-[var(--hover-green-color)] text-white rounded-xl text-xs md:text-sm font-bold shadow-md transition disabled:opacity-50 flex items-center gap-2"
        >
          Kirim Pengajuan
        </button>
      </div>
    </form>
  );
}
