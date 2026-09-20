"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, Check, FileText, ShieldAlert } from "lucide-react";
import { CommonFormData } from "./CommonServiceForm";

export interface ReviewField {
  label: string;
  value: string;
  isLongText?: boolean;
}

interface ReviewServiceFormProps {
  commonData: CommonFormData;
  serviceData: ReviewField[];
  onBack: () => void;
  onSubmit: () => void;
  loading: boolean;
  isPeminjamanAlat?: boolean;
  peminjamanAlatData?: {
    selectedAlatList: Array<{
      name: string;
      price: number;
      units: number;
    }>;
    periodeMulai: string;
    periodeSelesai: string;
    tujuanPenggunaan: string;
    wilayahKajian: string;
  };
}

function formatDate(dateString: string) {
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
}

function formatDateRange(startStr: string, endStr: string) {
  try {
    const start = new Date(startStr);
    const end = new Date(endStr);
    const options: Intl.DateTimeFormatOptions = { day: "numeric", month: "long" };
    const startFormatted = start.toLocaleDateString("id-ID", options);
    const endFormatted = end.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
    return `${startFormatted} - ${endFormatted}`;
  } catch {
    return `${startStr} - ${endStr}`;
  }
}

export default function ReviewServiceForm({
  commonData,
  serviceData,
  onBack,
  onSubmit,
  loading,
  isPeminjamanAlat = false,
  peminjamanAlatData
}: ReviewServiceFormProps) {
  const [agreed, setAgreed] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    // Try to get user email from localStorage
    const email = localStorage.getItem("agro_user_email");
    if (email) {
      setUserEmail(email);
    }
  }, []);

  const handleSubmitClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) {
      alert("Anda harus menyetujui pernyataan konfirmasi data.");
      return;
    }
    onSubmit();
  };

  // Calculate loan duration and tools total price
  let durationDays = 1;
  if (isPeminjamanAlat && peminjamanAlatData) {
    try {
      const start = new Date(peminjamanAlatData.periodeMulai);
      const end = new Date(peminjamanAlatData.periodeSelesai);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      durationDays = isNaN(diffDays) ? 1 : Math.max(1, diffDays);
    } catch {
      durationDays = 1;
    }
  }

  const totalEstimasi = (isPeminjamanAlat && peminjamanAlatData?.selectedAlatList)
    ? peminjamanAlatData.selectedAlatList.reduce((acc, tool) => acc + (tool.price * tool.units * durationDays), 0)
    : 0;

  const displayServiceData = isPeminjamanAlat
    ? serviceData.filter((field) => field.label !== "Jenis Alat Yang Dipinjam")
    : serviceData;

  return (
    <form onSubmit={handleSubmitClick} className="space-y-8">
      {/* Header */}
      <div className="mb-6 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
          Tinjau & Konfirmasi Pengajuan
        </h2>
        <p className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm mt-1">
          Periksa kembali seluruh informasi Anda sebelum mengirimkan pengajuan.
        </p>
      </div>

      <div className="space-y-6">
        {/* Section 1: Informasi Pemohon */}
        <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 bg-zinc-50/50 dark:bg-zinc-950/10 space-y-4">
          <h3 className="text-sm font-bold text-[var(--foreground)] dark:text-zinc-200 border-b border-zinc-200 dark:border-zinc-800 pb-2">
            Informasi Pemohon
          </h3>
          <div className="grid gap-y-4 gap-x-6 grid-cols-1 md:grid-cols-2 text-sm">
            <div>
              <span className="text-zinc-500 block text-sm">
                Nama Lengkap
              </span>
              <span className="font-medium text-zinc-900 dark:text-white text-sm break-words">
                {commonData.namaLengkap}
              </span>
            </div>

            <div>
              <span className="text-zinc-500 block text-sm">
                NIP / No. KTP
              </span>
              <span className="font-medium text-zinc-900 dark:text-white text-sm break-words">
                {commonData.nipKtp}
              </span>
            </div>

            <div>
              <span className="text-zinc-500 block text-sm">
                Alamat / Instansi Asal
              </span>
              <span className="font-medium text-zinc-900 dark:text-white text-sm break-words">
                {commonData.alamatInstansi}
              </span>
            </div>

            <div>
              <span className="text-zinc-500 block text-sm">
                No. Telepon / WhatsApp
              </span>
              <span className="font-medium text-zinc-900 dark:text-white text-sm break-words">
                {commonData.noTelp}
              </span>
            </div>

            <div>
              <span className="text-zinc-500 block text-sm">
                Tanggal Pengajuan Surat
              </span>
              <span className="font-medium text-zinc-900 dark:text-white text-sm break-words">
                {formatDate(commonData.tanggalPengajuan)}
              </span>
            </div>

            <div>
              <span className="text-zinc-500 block text-sm">
                Surat Pengantar
              </span>
              {commonData.suratPengantar ? (
                <div className="inline-flex items-center gap-2 text-[var(--green-color)] dark:text-secondary-green-color font-bold bg-secondary-green-color dark:bg-secondary-green-color/20 px-3 py-1 rounded-lg border border-secondary-green-color dark:border-secondary-green-color/30 text-xs mt-1">
                  <FileText className="h-4 w-4" />
                  <span>{commonData.suratPengantar.name}</span>
                </div>
              ) : (
                <span className="text-zinc-400 dark:text-zinc-600 font-base">Tidak ada berkas</span>
              )}
            </div>
          </div>
        </div>

        {/* Section 2: Detail Pengajuan Layanan */}
        <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 bg-zinc-50/50 dark:bg-zinc-950/10 space-y-4">
          <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 border-b border-zinc-200 dark:border-zinc-800 pb-2">
            Detail Pengajuan Layanan
          </h3>
          <div className="grid gap-y-4 gap-x-6 grid-cols-1 md:grid-cols-2 text-sm">
            {displayServiceData.map((field, idx) => (
              <div key={idx} className={field.isLongText ? "col-span-1 md:col-span-2" : "col-span-1"}>
                <span className="text-zinc-500 block text-sm">
                  {field.label}
                </span>
                <span className="font-medium text-zinc-900 dark:text-white text-sm break-words whitespace-pre-line">
                  {field.value || "-"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Daftar Alat Yang Dipinjam (Khusus Peminjaman Alat) */}
        {isPeminjamanAlat && peminjamanAlatData && (
          <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 bg-zinc-50/50 dark:bg-zinc-950/10 space-y-4">
            <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 border-b border-zinc-200 dark:border-zinc-800 pb-2">
              Daftar Alat Yang Dipinjam
            </h3>

            <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
              <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
                <thead>
                  <tr className="bg-zinc-100/70 dark:bg-zinc-800/40">
                    <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-zinc-700 dark:text-zinc-300">
                      No
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-zinc-700 dark:text-zinc-300">
                      Nama Alat
                    </th>
                    <th scope="col" className="px-4 py-3 text-center text-xs font-bold text-zinc-700 dark:text-zinc-300">
                      Jumlah
                    </th>
                    <th scope="col" className="px-4 py-3 text-center text-xs font-bold text-zinc-700 dark:text-zinc-300">
                      Durasi
                    </th>
                    <th scope="col" className="px-4 py-3 text-center text-xs font-bold text-zinc-700 dark:text-zinc-300">
                      Tarif / Hari
                    </th>
                    <th scope="col" className="px-4 py-3 text-center text-xs font-bold text-zinc-700 dark:text-zinc-300">
                      Subtotal
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 bg-white dark:bg-zinc-900 text-xs">
                  {peminjamanAlatData.selectedAlatList && peminjamanAlatData.selectedAlatList.length > 0 ? (
                    peminjamanAlatData.selectedAlatList.map((tool, idx) => {
                      const subtotal = tool.price * tool.units * durationDays;
                      return (
                        <tr key={idx} className="transition-colors hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50">
                          <td className="px-4 py-3 text-left text-zinc-500 dark:text-zinc-400 font-medium">
                            {idx + 1}
                          </td>
                          <td className="px-4 py-3 text-left text-zinc-800 dark:text-zinc-200 font-medium">
                            {tool.name}
                          </td>
                          <td className="px-4 py-3 text-center text-zinc-600 dark:text-zinc-400 font-medium whitespace-nowrap">
                            {tool.units} Unit
                          </td>
                          <td className="px-4 py-3 text-center text-zinc-600 dark:text-zinc-400 font-medium whitespace-nowrap">
                            {durationDays} Hari
                          </td>
                          <td className="px-4 py-3 text-center text-zinc-600 dark:text-zinc-400 font-medium whitespace-nowrap">
                            Rp {Number(tool.price).toLocaleString("id-ID")}
                          </td>
                          <td className="px-4 py-3 text-center text-zinc-800 dark:text-zinc-200 font-medium whitespace-nowrap">
                            Rp {Number(subtotal).toLocaleString("id-ID")}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-4 py-6 text-center text-zinc-500 dark:text-zinc-400 font-medium text-xs">
                        Tidak ada data alat yang dipinjam
                      </td>
                    </tr>
                  )}
                </tbody>
                {peminjamanAlatData.selectedAlatList && peminjamanAlatData.selectedAlatList.length > 0 && (
                  <tfoot className="border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-850/60">
                    <tr>
                      <td colSpan={5} className="px-4 py-3 text-left font-bold text-zinc-800 dark:text-zinc-200 text-xs">
                        Total Estimasi Biaya
                      </td>
                      <td className="px-4 py-3 text-center font-extrabold text-[var(--green-color)] dark:text-secondary-green-color text-xs whitespace-nowrap">
                        Rp {Number(totalEstimasi).toLocaleString("id-ID")}
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Warning Box */}
      <div className="rounded-xl bg-amber-50 dark:bg-amber-950/20 p-4 border border-amber-200 dark:border-amber-900/30 flex items-start gap-3 shadow-sm">
        <ShieldAlert className="h-5 w-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm text-amber-800 dark:text-amber-400 font-medium">
          Harap pastikan semua data yang dimasukkan benar. Pengajuan yang sudah dikirim tidak dapat dibatalkan atau diedit langsung kecuali melalui permintaan revisi oleh Admin.
        </div>
      </div>

      {/* Confirmation Checkbox */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800">
        <input
          id="confirm-agreed"
          type="checkbox"
          required
          disabled={loading}
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="h-4 w-4 rounded border-zinc-300 text-[var(--green-color)] focus:ring-[var(--green-color)] mt-0.5 cursor-pointer"
        />
        <label htmlFor="confirm-agreed" className="text-xs sm:text-sm text-zinc-650 dark:text-zinc-400 font-semibold leading-relaxed cursor-pointer select-none">
          Saya menyatakan bahwa semua data yang saya isi adalah benar, sah, dan sesuai dengan berkas pendukung yang dilampirkan.
        </label>
      </div>

      {/* Footer Navigation */}
      <div className="flex justify-between gap-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 border border-[var(--green-color)] dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-[var(--green-color)] dark:text-zinc-300 rounded-xl text-xs md:text-sm font-bold transition disabled:opacity-50 cursor-pointer"
        >
          Kembali
        </button>
        <button
          type="submit"
          disabled={loading || !agreed}
          className={`px-6 py-2.5 rounded-xl text-xs md:text-sm font-extrabold shadow-md transition flex items-center gap-2 cursor-pointer ${agreed && !loading
            ? "bg-[var(--green-color)] hover:bg-[var(--hover-green-color)] text-white"
            : "bg-zinc-300 text-white dark:bg-zinc-850 dark:text-zinc-500 cursor-not-allowed shadow-none"
            }`}
        >
          Kirim Pengajuan
        </button>
      </div>
    </form>
  );
}
