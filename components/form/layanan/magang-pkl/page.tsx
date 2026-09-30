"use client";

import { useState, useRef, useEffect } from "react";
import { AlertCircle, FileText, Info, Clock, CloudUpload, ArrowLeft, X } from "lucide-react";

export interface MagangPKLStep2 {
  topik: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  durasi?: string;
  proposal: File | null;
}

interface MagangPKLStep2FormProps {
  onBack: () => void;
  onSubmit: (data: MagangPKLStep2) => void;
  loading: boolean;
  initialData?: MagangPKLStep2;
}

export default function MagangPKLStep2Form({
  onBack,
  onSubmit,
  loading,
  initialData,
}: MagangPKLStep2FormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Local states for custom fields
  const [topik, setTopik] = useState(initialData?.topik || "");
  const [tanggalMulai, setTanggalMulai] = useState(initialData?.tanggalMulai || "");
  const [tanggalSelesai, setTanggalSelesai] = useState(initialData?.tanggalSelesai || "");
  const [proposal, setProposal] = useState<File | null>(initialData?.proposal || null);
  const [error, setError] = useState("");

  const calculateDurasi = (start: string, end: string) => {
    if (!start || !end) return "";
    const s = new Date(start);
    const e = new Date(end);
    const diffTime = e.getTime() - s.getTime();
    if (diffTime < 0) return "";
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    const months = Math.floor(diffDays / 30);
    const remainingDays = diffDays % 30;
    if (months > 0 && remainingDays === 0) {
      return `${months} Bulan (${diffDays} Hari)`;
    } else if (months > 0) {
      return `${months} Bulan ${remainingDays} Hari (${diffDays} Hari)`;
    }
    return `${diffDays} Hari`;
  };

  useEffect(() => {
    if (initialData) {
      setTopik(initialData.topik || "");
      setTanggalMulai(initialData.tanggalMulai || "");
      setTanggalSelesai(initialData.tanggalSelesai || "");
      setProposal(initialData.proposal || null);
    }
  }, [initialData]);

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
    if (!tanggalMulai) {
      setError("Tanggal Mulai Magang/PKL wajib diisi!");
      return;
    }
    if (!tanggalSelesai) {
      setError("Tanggal Selesai Magang/PKL wajib diisi!");
      return;
    }
    if (new Date(tanggalSelesai) < new Date(tanggalMulai)) {
      setError("Tanggal Selesai tidak boleh mendahului Tanggal Mulai!");
      return;
    }
    if (!proposal) {
      setError("File Proposal wajib diunggah!");
      return;
    }

    const durasiText = calculateDurasi(tanggalMulai, tanggalSelesai);

    onSubmit({
      topik: topik.trim(),
      tanggalMulai,
      tanggalSelesai,
      durasi: durasiText,
      proposal,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Step 2 Header */}
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <h2 className="text-sm md:text-lg font-bold text-zinc-900 dark:text-white">
          Informasi Layanan
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

      {/* Topik & Durasi Magang/PKL */}
      <div className="grid gap-6">
        {/* Topik Magang/PKL */}
        <div className="space-y-2">
          <label htmlFor="topik" className="block text-xs md:text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            Topik Magang/PKL <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              id="topik"
              type="text"
              required
              disabled={loading}
              value={topik}
              onChange={(e) => setTopik(e.target.value)}
              className="block w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-[#F8FAFC] dark:bg-zinc-950 px-4 py-3 text-xs md:text-sm text-zinc-900 dark:text-white placeholder-zinc-400 shadow-sm focus:border-[var(--green-color)] focus:outline-none focus:ring-1 focus:ring-[var(--green-color)]"
              placeholder="Contoh: Analisis Iklim Makro, Pengembangan IoT Pertanian"
            />
          </div>
        </div>

        {/* Tanggal Mulai & Selesai Magang/PKL */}
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="tanggal_mulai" className="block text-xs md:text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              Tanggal Mulai <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="tanggal_mulai"
                type="date"
                required
                disabled={loading}
                value={tanggalMulai}
                onChange={(e) => {
                  setTanggalMulai(e.target.value);
                  if (tanggalSelesai && new Date(tanggalSelesai) < new Date(e.target.value)) {
                    setTanggalSelesai("");
                  }
                }}
                className="block w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-[#F8FAFC] dark:bg-zinc-950 px-4 py-3 text-xs md:text-sm text-zinc-900 dark:text-white placeholder-zinc-400 shadow-sm focus:border-[var(--green-color)] focus:outline-none focus:ring-1 focus:ring-[var(--green-color)]"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="tanggal_selesai" className="block text-xs md:text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              Tanggal Selesai <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="tanggal_selesai"
                type="date"
                required
                disabled={loading}
                min={tanggalMulai || undefined}
                value={tanggalSelesai}
                onChange={(e) => setTanggalSelesai(e.target.value)}
                className="block w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-[#F8FAFC] dark:bg-zinc-950 px-4 py-3 text-xs md:text-sm text-zinc-900 dark:text-white placeholder-zinc-400 shadow-sm focus:border-[var(--green-color)] focus:outline-none focus:ring-1 focus:ring-[var(--green-color)]"
              />
            </div>
          </div>
        </div>

        {/* Durasi Estimasi Preview */}
        {tanggalMulai && tanggalSelesai && new Date(tanggalSelesai) >= new Date(tanggalMulai) && (
          <div className="rounded-xl bg-secondary-green-color/40 dark:bg-secondary-green-color/10 border border-[var(--green-color)]/30 p-3.5 flex items-center gap-2.5 text-xs text-[var(--green-color)] dark:text-secondary-green-color font-medium">
            <Clock className="w-4 h-4 shrink-0" />
            <span>
              Estimasi Durasi Magang: <strong className="font-bold">{calculateDurasi(tanggalMulai, tanggalSelesai)}</strong>
            </span>
          </div>
        )}
      </div>

      {/* Proposal File Upload */}
      <div className="space-y-2">
        <label htmlFor="proposal-file-upload" className="block text-xs md:text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          Proposal Magang / PKL <span className="text-red-500">*</span>
        </label>

        {!proposal ? (
          <div className="mt-1 flex justify-center px-4 sm:px-6 pt-5 pb-6 border-2 border-dashed border-zinc-300 dark:border-zinc-800 rounded-xl hover:border-green-color dark:hover:border-secondary-green-color/50 hover:bg-secondary-green-color/10 dark:hover:bg-secondary-green-color/5 transition cursor-pointer">
            <div className="space-y-2 text-center flex flex-col items-center">
              <CloudUpload className="mx-auto h-10 w-10 text-[var(--green-color)] dark:text-[var(--green-color)]" aria-hidden="true" />
              <div className="flex text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 justify-center">
                <label
                  htmlFor="proposal-file-upload"
                  className="relative cursor-pointer rounded-md font-semibold text-[var(--green-color)] dark:text-[var(--foreground)] hover:text-[var(--green-color)] focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[var(--green-color)]"
                >
                  <span>Klik untuk upload</span>
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
              </div>
              <p className="text-[11px] sm:text-xs text-zinc-400 dark:text-zinc-550">
                Format PDF, JPG, atau PNG (Maks. 5MB)
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between p-3.5 bg-secondary-green-color/30 dark:bg-secondary-green-color/10 border border-green-color/30 dark:border-secondary-green-color/30 rounded-xl gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="p-2 bg-secondary-green-color dark:bg-secondary-green-color rounded-lg text-green-color dark:text-secondary-green-color shrink-0">
                <FileText className="w-5 h-5" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1 text-left">
                <p className="text-xs sm:text-sm font-bold text-zinc-800 dark:text-zinc-200 truncate">{proposal.name}</p>
                <p className="text-[11px] sm:text-xs text-zinc-400">{(proposal.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
            <button
              type="button"
              disabled={loading}
              onClick={handleRemoveFile}
              className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition shrink-0 cursor-pointer"
              title="Hapus berkas"
              aria-label="Hapus berkas"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>

      {/* Action Buttons for Step 2 */}
      <div className="flex justify-between gap-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="px-5 py-2.5 border border-zinc-300 dark:border-zinc-700 hover:cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 rounded-xl text-xs md:text-sm font-bold transition"
        >
          Kembali
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-[var(--green-color)] hover:cursor-pointer hover:bg-[var(--hover-green-color)] text-white rounded-xl text-xs md:text-sm font-bold shadow-md transition flex items-center gap-2"
        >
          Kirim Pengajuan
        </button>
      </div>
    </form>
  );
}
