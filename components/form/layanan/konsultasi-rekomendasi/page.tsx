"use client";

import { useState } from "react";
import { AlertCircle, FileText, Info, ArrowLeft } from "lucide-react";

interface KonsultasiRekomendasiStep2FormProps {
  onBack: () => void;
  onSubmit: (data: { jenisData: string; alasan: string }) => void;
  loading: boolean;
}

export default function KonsultasiRekomendasiStep2Form({
  onBack,
  onSubmit,
  loading
}: KonsultasiRekomendasiStep2FormProps) {
  // Local states for custom fields
  const [jenisData, setJenisData] = useState("");
  const [alasan, setAlasan] = useState("");
  const [error, setError] = useState("");

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
      <div className="mb-6 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
          Informasi Konsultasi
        </h2>
        <p className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm mt-1">
          Detail Kebutuhan Teknis dan Jadwal Pertemuan
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
        <label htmlFor="jenisData" className="block text-sm font-bold text-zinc-700 dark:text-zinc-300">
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
            className="block w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-[#F8FAFC] dark:bg-zinc-950 px-4 py-3 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 shadow-sm focus:border-[var(--green-color)] focus:outline-none focus:ring-1 focus:ring-[var(--green-color)]"
            placeholder="Masukkan jenis data atau informasi singkat yang diminta"
          />
        </div>
      </div>

      {/* Alasan Permintaan / Pengajuan */}
      <div className="space-y-2">
        <label htmlFor="alasan" className="block text-sm font-bold text-zinc-700 dark:text-zinc-300">
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
            className="block w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-[#F8FAFC] dark:bg-zinc-950 px-4 py-3 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 shadow-sm focus:border-[var(--green-color)] focus:outline-none focus:ring-1 focus:ring-[var(--green-color)]"
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
          className="flex items-center gap-2 px-4 py-2.5 border border-[var(--green-color)] dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-[var(--green-color)] dark:text-zinc-300 rounded-xl text-sm font-bold transition disabled:opacity-50"
        >
          <ArrowLeft className="h-4 w-4 " />
          Kembali
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2.5 bg-[var(--green-color)] hover:bg-emerald-650 text-white rounded-xl text-sm font-extrabold shadow-md transition disabled:opacity-50 flex items-center gap-2"
        >
          Kirim Pengajuan
        </button>
      </div>
    </form>
  );
}
