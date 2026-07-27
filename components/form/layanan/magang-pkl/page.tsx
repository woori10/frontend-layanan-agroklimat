"use client";

import { useState, useRef } from "react";
import { AlertCircle, FileText, Info, Clock, FileUp, X } from "lucide-react";

export interface MagangPKLStep2 {
  topik: string;
  durasi: string;
  proposal: File | null;
}

interface MagangPKLStep2FormProps {
  onBack: () => void;
  onSubmit: (data: MagangPKLStep2) => void;
  loading: boolean;
}

export default function MagangPKLStep2Form({
  onBack,
  onSubmit,
  loading
}: MagangPKLStep2FormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Local states for custom fields
  const [topik, setTopik] = useState("");
  const [durasi, setDurasi] = useState("");
  const [proposal, setProposal] = useState<File | null>(null);
  const [error, setError] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const allowedMimeTypes = ["application/pdf", "image/jpeg", "image/png"];
      
      if (!allowedMimeTypes.includes(selectedFile.type)) {
        setError("Tipe file harus PDF, JPG, atau PNG!");
        return;
      }
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError("Ukuran file maksimal adalah 5MB!");
        return;
      }

      setError("");
      setProposal(selectedFile);
    }
  };

  const handleRemoveFile = () => {
    setProposal(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!topik.trim()) {
      setError("Topik Magang/PKL wajib diisi!");
      return;
    }
    if (!durasi.trim()) {
      setError("Durasi Magang/PKL wajib diisi!");
      return;
    }
    if (!proposal) {
      setError("File Proposal wajib diunggah!");
      return;
    }

    onSubmit({
      topik: topik.trim(),
      durasi: durasi.trim(),
      proposal,
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
          Silakan lengkapi informasi detail pengajuan Magang / PKL Anda.
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

      {/* Topik & Durasi Magang/PKL */}
      <div className="grid gap-6 sm:grid-cols-2">
        {/* Topik Magang/PKL */}
        <div className="space-y-2">
          <label htmlFor="topik" className="block text-sm font-bold text-zinc-700 dark:text-zinc-300">
            Topik Magang/PKL <span className="text-red-500">*</span>
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
              placeholder="Contoh: Analisis Iklim Makro, Pengembangan IoT Pertanian"
            />
          </div>
        </div>

        {/* Durasi Magang/PKL */}
        <div className="space-y-2">
          <label htmlFor="durasi" className="block text-sm font-bold text-zinc-700 dark:text-zinc-300">
            Durasi Magang/PKL <span className="text-red-500">*</span>
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
              placeholder="Contoh: 1 Bulan, 3 Bulan, atau 6 Bulan"
            />
          </div>
        </div>
      </div>

      {/* Proposal File Upload */}
      <div className="space-y-2">
        <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300">
          Proposal Magang / PKL <span className="text-red-500">*</span>
        </label>

        {!proposal ? (
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-zinc-300 dark:border-zinc-800 rounded-xl hover:border-emerald-500 dark:hover:border-emerald-500/50 hover:bg-emerald-50/10 dark:hover:bg-emerald-950/5 transition cursor-pointer">
            <div className="space-y-2 text-center flex flex-col items-center">
              <FileUp className="mx-auto h-10 w-10 text-zinc-450 dark:text-zinc-600" />
              <div className="flex text-sm text-zinc-600 dark:text-zinc-400 justify-center">
                <label
                  htmlFor="proposal-file-upload"
                  className="relative cursor-pointer rounded-md font-bold text-[var(--green-color)] dark:text-emerald-400 hover:text-emerald-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-emerald-500"
                >
                  <span>Pilih berkas</span>
                  <input
                    id="proposal-file-upload"
                    name="proposal-file-upload"
                    type="file"
                    ref={fileInputRef}
                    className="sr-only"
                    accept=".pdf,image/jpeg,image/png"
                    disabled={loading}
                    onChange={handleFileChange}
                  />
                </label>
                <p className="pl-1">atau seret ke sini</p>
              </div>
              <p className="text-xs text-zinc-400 dark:text-zinc-550">
                Format PDF, JPG, atau PNG (Maks. 5MB)
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between p-3.5 bg-emerald-50/30 dark:bg-emerald-950/10 border border-emerald-200/50 dark:border-emerald-900/30 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-950 rounded-lg text-emerald-600 dark:text-emerald-400">
                <FileText className="w-5 h-5" />
              </div>
              <div className="max-w-[200px] sm:max-w-[400px] truncate">
                <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200 truncate">{proposal.name}</p>
                <p className="text-xs text-zinc-400">{(proposal.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
            <button
              type="button"
              disabled={loading}
              onClick={handleRemoveFile}
              className="p-1 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition"
              title="Hapus berkas"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
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
