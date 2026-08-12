"use client";

import { useState } from "react";
import { AlertCircle, FileText, Info, Calendar, ArrowLeft } from "lucide-react";

interface BimtekNarasumberStep2FormProps {
  onBack: () => void;
  onSubmit: (data: { jenisData: string; alasan: string; tanggalBimbingan: string }) => void;
  loading: boolean;
}

export default function BimtekNarasumberStep2Form({
  onBack,
  onSubmit,
  loading
}: BimtekNarasumberStep2FormProps) {
  // Local states for custom fields
  const [jenisData, setJenisData] = useState("");
  const [alasan, setAlasan] = useState("");
  const [tanggalBimbingan, setTanggalBimbingan] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!jenisData.trim()) {
      setError("Topik Pelatihan wajib diisi!");
      return;
    }
    if (!alasan.trim()) {
      setError("Durasi Pelatihan wajib diisi!");
      return;
    }
    if (!tanggalBimbingan) {
      setError("Tanggal Bimbingan wajib diisi!");
      return;
    }

    onSubmit({
      jenisData: jenisData.trim(),
      alasan: alasan.trim(),
      tanggalBimbingan
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Step 2 Header */}
      <div className="mb-6 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
          Informasi Bimbingan Teknis dan Narasumber
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

      {/* Topik Pelatihan & Tanggal Bimbingan */}
      <div className="grid gap-6 sm:grid-cols-1">
        {/* Topik Pelatihan */}
        <div className="space-y-2">
          <label htmlFor="jenisData" className="block text-sm font-bold text-zinc-700 dark:text-zinc-300">
            Topik Pelatihan <span className="text-red-500">*</span>
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
              placeholder="Contoh : Topik Perubahan Iklim"
            />
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">



          {/* Tanggal Bimbingan */}
          <div className="space-y-2">
            <label htmlFor="tanggalBimbingan" className="block text-sm font-bold text-zinc-700 dark:text-zinc-300">
              Tanggal Bimbingan <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="tanggalBimbingan"
                type="date"
                required
                disabled={loading}
                value={tanggalBimbingan}
                onChange={(e) => setTanggalBimbingan(e.target.value)}
                className="block w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-[#F8FAFC] dark:bg-zinc-950 px-4 py-3 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 shadow-sm focus:border-[var(--green-color)] focus:outline-none focus:ring-1 focus:ring-[var(--green-color)]"
              />
            </div>
          </div>

          {/* Durasi Pelatihan */}
          <div className="space-y-2">
            <label htmlFor="alasan" className="block text-sm font-bold text-zinc-700 dark:text-zinc-300">
              Durasi Pelatihan <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="alasan"
                type="text"
                required
                disabled={loading}
                value={alasan}
                onChange={(e) => setAlasan(e.target.value)}
                className="block w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-[#F8FAFC] dark:bg-zinc-950 px-4 py-3 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 shadow-sm focus:border-[var(--green-color)] focus:outline-none focus:ring-1 focus:ring-[var(--green-color)]"
                placeholder="Masukkan rencana durasi pelatihan (misal: 3 hari, 1 minggu, dll.)"
              />
            </div>
          </div>

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
