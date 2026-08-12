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
  let totalEstimasi = 0;
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

      {isPeminjamanAlat && peminjamanAlatData ? (
        // ==========================================
        // SPECIAL LAYOUT FOR PEMINJAMAN ALAT
        // ==========================================
        <div className="space-y-6">
          {/* Card 1: Informasi Pemohon */}
          <div className="border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 space-y-6 bg-white dark:bg-zinc-950 shadow-sm relative transition duration-300">
            <div className="grid gap-y-5 gap-x-6 sm:grid-cols-2 text-sm">
              {/* Nama Lengkap */}
              <div>
                <span className="block text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                  Nama Lengkap
                </span>
                <span className="block font-bold text-zinc-900 dark:text-white text-[15px] mt-1">
                  {commonData.namaLengkap}
                </span>
              </div>

              {/* Instansi/Lembaga */}
              <div>
                <span className="block text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                  Instansi/Lembaga
                </span>
                <span className="block font-bold text-zinc-900 dark:text-white text-[15px] mt-1">
                  {commonData.alamatInstansi}
                </span>
              </div>

              {/* Email */}
              <div>
                <span className="block text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                  Email
                </span>
                <span className="block font-bold text-zinc-900 dark:text-white text-[15px] mt-1">
                  {userEmail || "-"}
                </span>
              </div>

              {/* Nomor Telepon */}
              <div>
                <span className="block text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                  Nomor Telepon
                </span>
                <span className="block font-bold text-zinc-900 dark:text-white text-[15px] mt-1">
                  {commonData.noTelp}
                </span>
              </div>

              {/* Jenis Layanan */}
              <div>
                <span className="block text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                  Jenis Layanan
                </span>
                <span className="block font-bold text-zinc-900 dark:text-white text-[15px] mt-1">
                  Peminjaman Alat
                </span>
              </div>

              {/* Periode */}
              <div>
                <span className="block text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                  Periode
                </span>
                <span className="block font-bold text-zinc-900 dark:text-white text-[15px] mt-1">
                  {formatDateRange(peminjamanAlatData.periodeMulai, peminjamanAlatData.periodeSelesai)} ({durationDays} Hari)
                </span>
              </div>
            </div>

            {/* Separator line */}
            <div className="border-t border-zinc-100 dark:border-zinc-900 pt-5">
              <span className="block text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                Tujuan Penggunaan
              </span>
              <p className="font-semibold text-zinc-700 dark:text-zinc-300 leading-relaxed text-sm mt-1">
                {peminjamanAlatData.tujuanPenggunaan}
              </p>
            </div>

            {/* Wilayah Kajian */}
            <div className="border-t border-zinc-100 dark:border-zinc-900 pt-5">
              <span className="block text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                Wilayah Kajian
              </span>
              <p className="font-semibold text-zinc-700 dark:text-zinc-300 leading-relaxed text-sm mt-1">
                {peminjamanAlatData.wilayahKajian}
              </p>
            </div>

            {/* Surat Pengantar */}
            {commonData.suratPengantar && (
              <div className="border-t border-zinc-100 dark:border-zinc-900 pt-5">
                <span className="block text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                  Surat Pengantar Instansi
                </span>
                <div className="inline-flex items-center gap-2 text-[var(--green-color)] dark:text-emerald-450 font-bold bg-emerald-50/50 dark:bg-emerald-950/20 px-3 py-1.5 rounded-lg border border-emerald-100 dark:border-emerald-900/30 text-xs mt-1.5">
                  <FileText className="h-4 w-4" />
                  <span>{commonData.suratPengantar.name}</span>
                </div>
              </div>
            )}
          </div>

          {/* Card 2: Alat & Estimasi Biaya */}
          <div className="border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 space-y-6 bg-white dark:bg-zinc-950 shadow-sm relative transition duration-300">
            <div className="divide-y divide-zinc-100 dark:divide-zinc-900">
              {peminjamanAlatData.selectedAlatList.map((tool, idx) => {
                const subtotal = tool.price * tool.units * durationDays;
                totalEstimasi += subtotal;

                return (
                  <div key={idx} className="flex justify-between items-center py-4 first:pt-0 last:pb-0">
                    <div className="space-y-1">
                      <span className="font-bold text-[15px] text-[#2C5E3B] dark:text-emerald-400 block">
                        {tool.name}
                      </span>
                      <span className="text-xs text-zinc-400 dark:text-zinc-500 font-semibold block">
                        Durasi: {durationDays} Hari ({formatDateRange(peminjamanAlatData.periodeMulai, peminjamanAlatData.periodeSelesai)})
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-xs sm:text-sm text-zinc-400 dark:text-zinc-500 font-bold block">
                        {tool.units} Unit × Rp {tool.price.toLocaleString("id-ID")}
                      </span>
                      <span className="font-extrabold text-zinc-900 dark:text-white text-base mt-1 block">
                        Rp {subtotal.toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Total Section */}
            <div className="border-t border-zinc-200 dark:border-zinc-800 pt-6 flex justify-between items-center">
              <span className="text-lg font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
                Total Estimasi
              </span>
              <span className="font-extrabold text-[22px] text-zinc-900 dark:text-white">
                Rp {totalEstimasi.toLocaleString("id-ID")}
              </span>
            </div>
          </div>
        </div>
      ) : (
        // ==========================================
        // DEFAULT FALLBACK LAYOUT FOR OTHER SERVICES
        // ==========================================
        <div className="space-y-6">
          {/* Section 1: Informasi Pemohon */}
          <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 bg-zinc-50/50 dark:bg-zinc-950/10 space-y-4">
            <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 border-b border-zinc-200 dark:border-zinc-800 pb-2">
              1. Informasi Pemohon
            </h3>
            <div className="grid gap-y-4 gap-x-6 sm:grid-cols-2 text-sm">
              <div>
                <span className="block text-xs font-semibold text-zinc-500 dark:text-zinc-500 uppercase tracking-wider mb-1">
                  Nama Lengkap
                </span>
                <span className="font-bold text-zinc-800 dark:text-zinc-200">
                  {commonData.namaLengkap}
                </span>
              </div>

              <div>
                <span className="block text-xs font-semibold text-zinc-500 dark:text-zinc-500 uppercase tracking-wider mb-1">
                  NIP / No. KTP
                </span>
                <span className="font-bold text-zinc-800 dark:text-zinc-200">
                  {commonData.nipKtp}
                </span>
              </div>

              <div>
                <span className="block text-xs font-semibold text-zinc-500 dark:text-zinc-500 uppercase tracking-wider mb-1">
                  Alamat / Instansi Asal
                </span>
                <span className="font-bold text-zinc-800 dark:text-zinc-200">
                  {commonData.alamatInstansi}
                </span>
              </div>

              <div>
                <span className="block text-xs font-semibold text-zinc-500 dark:text-zinc-500 uppercase tracking-wider mb-1">
                  No. Telepon / WhatsApp
                </span>
                <span className="font-bold text-zinc-800 dark:text-zinc-200">
                  {commonData.noTelp}
                </span>
              </div>

              <div>
                <span className="block text-xs font-semibold text-zinc-500 dark:text-zinc-500 uppercase tracking-wider mb-1">
                  Tanggal Pengajuan Surat
                </span>
                <span className="font-bold text-zinc-800 dark:text-zinc-200">
                  {formatDate(commonData.tanggalPengajuan)}
                </span>
              </div>

              <div>
                <span className="block text-xs font-semibold text-zinc-500 dark:text-zinc-500 uppercase tracking-wider mb-1">
                  Surat Pengantar
                </span>
                {commonData.suratPengantar ? (
                  <div className="inline-flex items-center gap-2 text-[var(--green-color)] dark:text-emerald-450 font-bold bg-emerald-50 dark:bg-emerald-950/20 px-3 py-1 rounded-lg border border-emerald-100 dark:border-emerald-900/30 text-xs mt-1">
                    <FileText className="h-4 w-4" />
                    <span>{commonData.suratPengantar.name}</span>
                  </div>
                ) : (
                  <span className="text-zinc-400 dark:text-zinc-600 font-semibold italic">Tidak ada berkas</span>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Detail Peminjaman */}
          <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 bg-zinc-50/50 dark:bg-zinc-950/10 space-y-4">
            <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 border-b border-zinc-200 dark:border-zinc-800 pb-2">
              2. Detail Pengajuan Layanan
            </h3>
            <div className="grid gap-y-4 gap-x-6 sm:grid-cols-2 text-sm">
              {serviceData.map((field, idx) => (
                <div key={idx} className={field.isLongText ? "sm:col-span-2" : ""}>
                  <span className="block text-xs font-semibold text-zinc-500 dark:text-zinc-500 uppercase tracking-wider mb-1">
                    {field.label}
                  </span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200 leading-relaxed block whitespace-pre-wrap">
                    {field.value || "-"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

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
          className="flex items-center gap-2 px-4 py-2.5 border border-[var(--green-color)] dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-[var(--green-color)] dark:text-zinc-300 rounded-xl text-sm font-bold transition disabled:opacity-50 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali
        </button>
        <button
          type="submit"
          disabled={loading || !agreed}
          className={`px-6 py-2.5 rounded-xl text-sm font-extrabold shadow-md transition flex items-center gap-2 cursor-pointer ${agreed && !loading
            ? "bg-[var(--green-color)] hover:bg-emerald-650 text-white"
            : "bg-zinc-300 text-white dark:bg-zinc-850 dark:text-zinc-500 cursor-not-allowed shadow-none"
            }`}
        >
          <Check className="h-4 w-4" />
          Kirim Pengajuan
        </button>
      </div>
    </form>
  );
}
