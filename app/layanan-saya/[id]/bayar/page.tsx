"use client";

import React, { use, useEffect, useState } from "react";
import Navbar from "@/components/navbar/Navbar";
import {
  ChevronLeft,
  CreditCard,
  Upload,
  AlertCircle,
  FileText,
  CheckCircle2,
  Copy,
  Receipt,
  ExternalLink,
  ShieldCheck,
  Check
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getUserTiketDetail } from "@/lib/tiket";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

interface Dokumen {
  id: number;
  nama_file: string;
  tipe: string;
  url_storage: string;
  tanggal_upload: string;
}

interface Tagihan {
  id: number;
  jumlah: number;
  status_bayar: "menunggu" | "lunas" | "batal";
  bukti_bayar?: string;
  tanggal_lunas?: string;
  bank_pengirim?: string | null;
  nama_pengirim?: string | null;
  tanggal_transfer?: string | null;
}

interface TiketDetail {
  id: number;
  no_tiket: string;
  status: string;
  tanggal_submit: string;
  layanan: {
    id: number;
    nama_layanan: string;
  };
  dokumen: Dokumen[];
  tagihan?: Tagihan | null;
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

export default function BayarTagihanPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const idStr = resolvedParams.id;

  const [tiket, setTiket] = useState<TiketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [bankPengirim, setBankPengirim] = useState("");
  const [tanggalTransfer, setTanggalTransfer] = useState(new Date().toISOString().split('T')[0]);
  const [namaPengirim, setNamaPengirim] = useState("");

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(type);
    setTimeout(() => setCopySuccess(null), 2000);
  };

  const handleUploadBukti = async () => {
    if (!selectedFile || !tiket) return;
    setUploadLoading(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append("file", selectedFile);
      uploadFormData.append("tipe", "Bukti Pembayaran");
      uploadFormData.append("bank_pengirim", bankPengirim);
      uploadFormData.append("nama_pengirim", namaPengirim);
      uploadFormData.append("tanggal_transfer", tanggalTransfer);

      const token = localStorage.getItem("agro_token");
      const res = await fetch(`http://localhost:3000/tiket/${tiket.id}/dokumen`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: uploadFormData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Gagal mengunggah bukti pembayaran");
      }

      alert("Bukti pembayaran berhasil diunggah! Menunggu konfirmasi admin.");
      setSelectedFile(null);

      // Re-fetch ticket details
      const updatedTiket = await getUserTiketDetail(idStr);
      setTiket(updatedTiket);
      if (updatedTiket.tagihan) {
        if (updatedTiket.tagihan.bank_pengirim) setBankPengirim(updatedTiket.tagihan.bank_pengirim);
        if (updatedTiket.tagihan.nama_pengirim) setNamaPengirim(updatedTiket.tagihan.nama_pengirim);
        if (updatedTiket.tagihan.tanggal_transfer) {
          setTanggalTransfer(new Date(updatedTiket.tagihan.tanggal_transfer).toISOString().split('T')[0]);
        }
      }
    } catch (err: any) {
      alert(err.message || "Gagal mengunggah file");
    } finally {
      setUploadLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem("agro_token");
    if (!token) {
      router.push("/login");
      return;
    }

    if (!idStr) {
      setError("ID Tiket tidak valid");
      setLoading(false);
      return;
    }

    getUserTiketDetail(idStr)
      .then((data) => {
        setTiket(data);
        if (!data.tagihan) {
          setError("Permohonan ini tidak memiliki tagihan pembayaran");
        } else {
          if (data.tagihan.bank_pengirim) setBankPengirim(data.tagihan.bank_pengirim);
          if (data.tagihan.nama_pengirim) setNamaPengirim(data.tagihan.nama_pengirim);
          if (data.tagihan.tanggal_transfer) {
            setTanggalTransfer(new Date(data.tagihan.tanggal_transfer).toISOString().split('T')[0]);
          }
        }
      })
      .catch((err: any) => setError(err.message))
      .finally(() => setLoading(false));
  }, [idStr, router]);

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 py-8 text-center text-zinc-500">
          Memuat detail pembayaran...
        </main>
      </div>
    );
  }

  if (error || !tiket || !tiket.tagihan) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 py-8 text-center">
          <div className="rounded-2xl border border-red-200/80 bg-red-50/50 dark:bg-red-950/20 dark:border-red-900/30 p-8 max-w-md mx-auto">
            <AlertCircle className="h-12 w-12 text-red-550 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">Kesalahan</h2>
            <p className="text-sm text-red-650 dark:text-red-400 mb-6">
              {error || "Permohonan tidak ditemukan"}
            </p>
            <Link
              href={`/layanan-saya/${idStr}`}
              className="inline-flex items-center gap-2 rounded-xl bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 px-5 py-2.5 text-sm font-semibold transition"
            >
              Kembali ke Detail Pengajuan
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const tagihan = tiket.tagihan;
  const isLunas = tagihan.status_bayar === "lunas";
  const isBatal = tagihan.status_bayar === "batal";
  const isMenunggu = tagihan.status_bayar === "menunggu";
  const isFormValid = !!selectedFile && bankPengirim.trim() !== "" && namaPengirim.trim() !== "" && tanggalTransfer !== "";

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1 mb-6">
          <Link
            href={`/layanan-saya/${idStr}`}
            className="flex items-center text-xs font-semibold text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition"
          >
            <ChevronLeft className="h-4 w-4 mr-0.5" />
            Kembali ke Detail Pengajuan
          </Link>
        </div>

        <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 md:p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          {/* Header */}
          <div className="pb-6 border-b border-zinc-200 dark:border-zinc-800 mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-[#2C5E3B]">
                <Receipt className="h-5.5 w-5.5" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white tracking-tight">
                  Pembayaran Tagihan
                </h1>
                <p className="text-sm text-zinc-500 dark:text-zinc-450 font-medium">
                  Selesaikan proses pembayaran layanan Anda melalui transfer bank. Harap unggah bukti transfer setelah melakukan pembayaran.
                </p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              <div>No. Tiket: <span className="text-zinc-800 dark:text-zinc-300">{tiket.no_tiket}</span></div>
              {/* <div>Status Permohonan: <span className="text-zinc-800 dark:text-zinc-300 capitalize">{tiket.status.replace(/_/g, " ")}</span></div> */}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column: Rekening & Petunjuk */}
            <div className="space-y-6">
              <div className="rounded-2xl border border-zinc-200/60 bg-white p-6 dark:border-zinc-800/80 dark:bg-zinc-950/20 space-y-4">
                <div className="flex items-start">
                  <p className="text-[var(--foreground)] text-md font-semibold">Rincian Pembayaran</p>
                </div>
                <div className="bg-[#F8FAFC] dark:bg-zinc-950/20 rounded-xl p-4">
                  <span className="block text-base font-semibold text-zinc-500 dark:text-zinc-550">
                    Total Tagihan
                  </span>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-lg font-semibold text-[#2C5E3B] dark:text-emerald-450">
                      Rp {tagihan.jumlah.toLocaleString("id-ID")}
                    </span>
                    <button
                      onClick={() => handleCopy(tagihan.jumlah.toString(), "nominal")}
                      className="text-xs text-emerald-650 dark:text-emerald-450 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                    >
                      {copySuccess === "nominal" ? (
                        <>
                          <Check className="h-3.5 w-3.5" /> Disalin
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" /> Salin
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center space-y-2">
                  <div>
                    <span className="block text-sm font-medium text-zinc-500 dark:text-zinc-400">
                      Nama Bank
                    </span>
                    <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                      Bank Mandiri
                    </span>
                  </div>
                  <div>
                    <span className="block text-sm font-medium text-zinc-500 dark:text-zinc-500">
                      Atas Nama / Penerima
                    </span>
                    <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                      Balai Agroklimatologi & Hidrologi
                    </span>
                  </div>
                </div>
                <div>
                  <span className="block text-sm font-medium text-zinc-500 dark:text-zinc-400">
                    Nomor Rekening
                  </span>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-base font-bold text-zinc-900 dark:text-white tracking-wide">
                      137-00-1234567-8
                    </span>
                    <button
                      onClick={() => handleCopy("137-00-1234567-8", "rekening")}
                      className="text-xs text-emerald-600 dark:text-emerald-450 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                    >
                      {copySuccess === "rekening" ? (
                        <>
                          <Check className="h-3.5 w-3.5" /> Disalin
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" /> Salin
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Petunjuk Pembayaran */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                  <ShieldCheck className="h-4.5 w-4.5 text-[#2C5E3B]" />
                  Petunjuk Transfer
                </h3>
                <ol className="list-decimal list-inside text-xs text-zinc-500 dark:text-zinc-400 space-y-2 leading-relaxed">
                  <li>Lakukan transfer sesuai nominal di atas melalui ATM, M-Banking, atau Internet Banking.</li>
                  <li>Pastikan nama penerima transfer adalah **Balai Agroklimatologi & Hidrologi**.</li>
                  <li>Simpan struk atau tangkapan layar bukti transfer Anda.</li>
                  <li>Unggah bukti transfer pada kolom yang tersedia di sebelah kanan untuk mempercepat proses verifikasi.</li>
                </ol>
              </div>
            </div>

            {/* Right Column: Upload Proof */}
            <div className="space-y-6">
              {/* Status Box */}
              <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 space-y-5">
                <div className="flex justify-between items-center gap-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4.5 w-4.5 text-[var(--green-color)]" />
                    <p className="text-[var(--foreground)] text-md font-semibold">Konfirmasi Pembayaran</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {isLunas ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-250 dark:bg-emerald-950/20 dark:text-emerald-455">
                        Lunas
                      </span>
                    ) : isBatal ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-250 dark:bg-red-950/20 dark:text-red-455">
                        Batal
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-yellow-50 text-yellow-750 border border-yellow-250 dark:bg-yellow-950/20 dark:text-yellow-455">
                        Menunggu Pembayaran
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center gap-2">
                  <div className="space-y-2 w-full">
                    <p className="block text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-2">
                      Bank Pengirim
                    </p>
                    <input
                      type="text"
                      value={bankPengirim}
                      onChange={(e) => setBankPengirim(e.target.value)}
                      placeholder="Contoh : BCA, BNI, Mandiri"
                      className="w-full rounded-lg bg-[#F8FAFC] border border-zinc-200/60 dark:border-zinc-800 px-3 py-2 text-sm text-[var(--foreground)] dark:bg-zinc-950/50 dark:text-zinc-50 focus:border-[var(--green-color)] focus:ring-1 focus:ring-[var(--green-color)] focus:outline-none disabled:opacity-70"
                      disabled={!!tagihan?.bukti_bayar || uploadLoading}
                    />
                  </div>
                  <div className="space-y-2 w-full">
                    <p className="block text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-2">
                      Tanggal Transfer
                    </p>
                    <input
                      type="date"
                      value={tanggalTransfer}
                      onChange={(e) => setTanggalTransfer(e.target.value)}
                      className="w-full rounded-lg bg-[#F8FAFC] border border-zinc-200/60 dark:border-zinc-800 px-4 py-2 text-sm text-[var(--foreground)] dark:bg-zinc-950/50 dark:text-zinc-50 focus:border-[var(--green-color)] focus:ring-1 focus:ring-[var(--green-color)] focus:outline-none disabled:opacity-70"
                      disabled={!!tagihan?.bukti_bayar || uploadLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="block text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-2">
                    Nama Pengirim
                  </p>
                  <input
                    type="text"
                    value={namaPengirim}
                    onChange={(e) => setNamaPengirim(e.target.value)}
                    placeholder="Nama sesuai buku tabungan atau nomor rekening pengirim"
                    className="w-full rounded-lg bg-[#F8FAFC] border border-zinc-200/60 dark:border-zinc-800 px-4 py-2 text-sm text-[var(--foreground)] dark:bg-zinc-950/50 dark:text-zinc-50 focus:border-[var(--green-color)] focus:ring-1 focus:ring-[var(--green-color)] focus:outline-none disabled:opacity-70"
                    disabled={!!tagihan?.bukti_bayar || uploadLoading}
                  />
                </div>

                {isLunas && (
                  <div className="rounded-xl bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900/20 p-4 text-center">
                    <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-400">
                      Terima kasih! Pembayaran Anda telah dikonfirmasi dan divalidasi oleh Admin.
                    </p>
                  </div>
                )}

                {/* Upload / Proof Display Area */}
                {isMenunggu && (
                  <div className="space-y-4">
                    {tagihan.bukti_bayar ? (
                      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 bg-slate-50/30 dark:bg-zinc-950/10">
                        <span className="block text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2">
                          Bukti yang Diunggah
                        </span>
                        <div className="flex items-center justify-between p-3 rounded-lg border border-zinc-150 dark:border-zinc-800 bg-white dark:bg-zinc-900/50">
                          <div className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-emerald-600" />
                            <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-350 truncate max-w-[150px]">
                              Bukti Transfer
                            </span>
                          </div>
                          <a
                            href={tagihan.bukti_bayar}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[#2C5E3B] hover:text-emerald-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
                          >
                            Lihat <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        </div>
                        <div className="mt-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/10 border border-amber-100 dark:border-amber-900/20 p-3 text-center">
                          <p className="text-[11px] font-semibold text-amber-800 dark:text-amber-400">
                            Bukti pembayaran telah berhasil dikirim. Silakan menunggu konfirmasi verifikasi dari pihak admin.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <span className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
                          Unggah Bukti Pembayaran
                        </span>

                        {!selectedFile && (
                          <div className="flex flex-col items-center justify-center border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-2xl p-6 bg-slate-50/50 dark:bg-zinc-950/10 text-center hover:bg-slate-50 dark:hover:bg-zinc-950/20 transition-all duration-200">
                            <input
                              type="file"
                              id="bukti_bayar_upload"
                              accept="image/jpeg,image/png,application/pdf"
                              className="hidden"
                              onChange={(e) => {
                                if (e.target.files && e.target.files.length > 0) {
                                  setSelectedFile(e.target.files[0]);
                                }
                              }}
                            />
                            <label
                              htmlFor="bukti_bayar_upload"
                              className="cursor-pointer flex flex-col items-center justify-center space-y-2 w-full h-full"
                            >
                              <Upload className="h-8 w-8 text-zinc-400" />
                              <div>
                                <span className="text-xs font-bold text-[#2C5E3B] dark:text-emerald-450 hover:underline">
                                  Klik untuk mengunggah
                                </span>
                                <span className="text-xs font-semibold text-zinc-400 block mt-0.5">
                                  format JPG, PNG, atau PDF (maks. 5MB)
                                </span>
                              </div>
                            </label>
                          </div>
                        )}

                        {selectedFile && (
                          <div className="flex items-center justify-between p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-xs">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4.5 w-4.5 text-[#2C5E3B]" />
                              <div className="flex flex-col text-left">
                                <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate max-w-[180px]">
                                  {selectedFile.name}
                                </span>
                                <span className="text-[10px] text-zinc-400">
                                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={() => setSelectedFile(null)}
                              className="text-red-500 hover:text-red-750 text-xs font-semibold p-1 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg cursor-pointer"
                            >
                              Batal
                            </button>
                          </div>
                        )}

                        <button
                          disabled={!isFormValid || uploadLoading}
                          onClick={handleUploadBukti}
                          className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 shadow-sm flex items-center justify-center gap-2 ${isFormValid && !uploadLoading
                            ? "bg-[#2C5E3B] text-white hover:opacity-90 active:scale-[0.99] cursor-pointer"
                            : "bg-zinc-200 text-zinc-450 dark:bg-zinc-800 dark:text-zinc-600 cursor-not-allowed"
                            }`}
                        >
                          {uploadLoading ? (
                            <>
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                              Mengirim Bukti...
                            </>
                          ) : (
                            <>
                              <Upload className="h-4 w-4" />
                              Kirim Bukti Pembayaran
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
