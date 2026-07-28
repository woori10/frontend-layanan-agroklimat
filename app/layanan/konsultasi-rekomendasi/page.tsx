"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/navbar/Navbar";
import Kontak from "@/components/landing-page/Kontak";
import CommonServiceForm, { CommonFormData } from "@/components/form/layanan/CommonServiceForm";
import KonsultasiRekomendasiStep2Form from "@/components/form/layanan/konsultasi-rekomendasi/page";
import {
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  Loader2
} from "lucide-react";

const API_URL = "http://localhost:3000";
const LAYANAN_ID = 4; // Konsultasi Rekomendasi & Penilaian Kesesuaian

export default function KonsultasiRekomendasiPage() {
  const router = useRouter();

  // Auth & Dropdown states
  const [mounted, setMounted] = useState(false);

  // Multi-step states
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<CommonFormData>({
    namaLengkap: "",
    noTelp: "",
    nipKtp: "",
    alamatInstansi: "",
    tanggalPengajuan: "",
    suratPengantar: null,
  });

  // Status states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [progressMsg, setProgressMsg] = useState("");
  const [createdTiketNo, setCreatedTiketNo] = useState("");

  // Authenticate on mount
  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem("agro_token");
    if (!token) {
      router.push("/login");
    }
  }, [router]);

  const handleSubmit = async (step2Data: { jenisData: string; alasan: string }) => {
    setError("");
    setLoading(true);
    setSuccess(false);

    // Double check validations
    if (!formData.namaLengkap.trim()) {
      setError("Nama Lengkap wajib diisi!");
      setLoading(false);
      return;
    }
    if (!formData.noTelp.trim()) {
      setError("Nomor Telepon wajib diisi!");
      setLoading(false);
      return;
    }
    if (!formData.nipKtp.trim()) {
      setError("NIP / Nomor KTP wajib diisi!");
      setLoading(false);
      return;
    }
    if (!formData.alamatInstansi.trim()) {
      setError("Alamat / Instansi Asal wajib diisi!");
      setLoading(false);
      return;
    }
    if (!formData.tanggalPengajuan) {
      setError("Tanggal Pengajuan Surat wajib diisi!");
      setLoading(false);
      return;
    }
    if (!step2Data.jenisData.trim()) {
      setError("Jenis Data / Informasi wajib diisi!");
      setLoading(false);
      return;
    }
    if (!step2Data.alasan.trim()) {
      setError("Alasan Permintaan / Pengajuan wajib diisi!");
      setLoading(false);
      return;
    }

    const token = localStorage.getItem("agro_token");
    if (!token) {
      setError("Sesi Anda telah berakhir. Silahkan login kembali.");
      setLoading(false);
      return;
    }

    try {
      // 1. Submit ticket data
      setProgressMsg("Mengirimkan formulir pengajuan...");
      const response = await fetch(`${API_URL}/tiket`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          layanan_id: LAYANAN_ID,
          jawaban_form: {
            nama_lengkap: formData.namaLengkap.trim(),
            no_telp: formData.noTelp.trim(),
            nip_ktp: formData.nipKtp.trim(),
            alamat_instansi: formData.alamatInstansi.trim(),
            tanggal_pengajuan: formData.tanggalPengajuan,
            jenis_data: step2Data.jenisData.trim(),
            alasan_pengajuan: step2Data.alasan.trim(),
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        let errMsg = "Gagal mengajukan konsultasi rekomendasi.";
        if (data.message) {
          errMsg = Array.isArray(data.message) ? data.message.join(", ") : data.message;
        }
        throw new Error(errMsg);
      }

      const tiketId = data.id;
      const noTiket = data.no_tiket;
      setCreatedTiketNo(noTiket);

      // 2. Upload file if exist
      if (formData.suratPengantar) {
        setProgressMsg("Mengunggah surat pengantar asal instansi...");
        const uploadFormData = new FormData();
        uploadFormData.append("file", formData.suratPengantar);
        uploadFormData.append("tipe", "surat_pengantar");

        const uploadResponse = await fetch(`${API_URL}/tiket/${tiketId}/dokumen`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: uploadFormData,
        });

        const uploadData = await uploadResponse.json();
        if (!uploadResponse.ok) {
          let uploadErrMsg = "Formulir disimpan, namun gagal mengunggah dokumen.";
          if (uploadData.message) {
            uploadErrMsg = Array.isArray(uploadData.message) ? uploadData.message.join(", ") : uploadData.message;
          }
          throw new Error(uploadErrMsg);
        }
      }

      setSuccess(true);
      setProgressMsg("");
      resetForm();
    } catch (err: any) {
      console.error("[Submit Konsultasi Rekomendasi] Error:", err);
      setError(err.message || "Terjadi kesalahan sistem saat memproses formulir.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      namaLengkap: "",
      noTelp: "",
      nipKtp: "",
      alamatInstansi: "",
      tanggalPengajuan: "",
      suratPengantar: null,
    });
    setStep(1);
  };

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-gradient-to-b from-emerald-50/50 via-white to-teal-50/30 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 text-zinc-900 dark:text-zinc-50 overflow-x-hidden font-sans">
      {/* Background patterns */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <svg
          className="absolute left-[max(50%,25rem)] top-0 h-[64rem] w-[128rem] -translate-x-1/2 stroke-emerald-200/30 [mask-image:radial-gradient(64rem_64rem_at_top,white,transparent)] dark:stroke-emerald-950/10"
          aria-hidden="true"
        >
          <defs>
            <pattern
              id="grid-pattern"
              width={200}
              height={200}
              x="50%"
              y={-1}
              patternUnits="userSpaceOnUse"
            >
              <path d="M100 200V.5M.5 .5H200" fill="none" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" strokeWidth={0} fill="url(#grid-pattern)" />
        </svg>
      </div>

      {/* Landing Page Navbar */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-8 z-10">
        
        {/* Header Section */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-2 text-sm text-[var(--green-color)] dark:text-emerald-400 font-bold mb-1">
              <Link href="/" className="flex items-center gap-1 hover:underline">
                <ArrowLeft className="w-4 h-4" /> Beranda
              </Link>
              <span>/</span>
              <span>Layanan</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
              Formulir Konsultasi Rekomendasi
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm mt-1 leading-relaxed">
              Konsultasi Rekomendasi & Penilaian Kesesuaian Agroklimat / Hidrologi.
            </p>
          </div>
        </div>

        {/* Messages & Success Modals */}
        {error && (
          <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/45 dark:text-red-400 border border-red-200 dark:border-red-900/40 flex items-start gap-3 shadow-sm transition duration-300">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Gagal Mengajukan:</span>
              <p className="mt-1 text-red-600 dark:text-red-400">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="rounded-xl bg-emerald-50 p-6 text-sm text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/40 dark:border-emerald-900/40 flex flex-col items-center text-center gap-3 shadow-lg transition duration-300">
            <CheckCircle2 className="h-12 w-12 text-emerald-600 dark:text-emerald-400 animate-bounce" />
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-emerald-900 dark:text-white">Pengajuan Berhasil!</h3>
              <p className="text-emerald-700 dark:text-emerald-400">
                Formulir konsultasi rekomendasi telah diajukan dengan nomor tiket <span className="font-extrabold text-emerald-900 dark:text-white">{createdTiketNo}</span>.
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 pt-2">
                Petugas kami akan melakukan verifikasi berkas dalam 14 hari kerja.
              </p>
            </div>
            <div className="mt-4 flex gap-4 w-full sm:w-auto">
              <button
                onClick={() => setSuccess(false)}
                className="flex-1 px-4 py-2 border border-emerald-300 hover:bg-emerald-100 text-emerald-800 dark:border-emerald-800 dark:hover:bg-emerald-950/30 rounded-xl font-semibold transition"
              >
                Ajukan Lagi
              </button>
              <Link href="/" className="flex-1">
                <button className="w-full px-5 py-2 bg-[var(--green-color)] hover:bg-emerald-650 text-white rounded-xl font-bold shadow-md transition">
                  Kembali ke Beranda
                </button>
              </Link>
            </div>
          </div>
        )}

        {/* Form Container */}
        <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md rounded-2xl border border-zinc-200/60 dark:border-zinc-800/80 p-6 sm:p-8 shadow-xl relative overflow-hidden">
          {loading && (
            <div className="absolute inset-0 bg-white/60 dark:bg-zinc-950/60 z-50 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-10 h-10 animate-spin text-[var(--green-color)]" />
              <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">{progressMsg}</span>
            </div>
          )}

          {step === 1 ? (
            <CommonServiceForm
              serviceName="Konsultasi Rekomendasi"
              initialData={formData}
              onNext={(data) => {
                setFormData(data);
                setStep(2);
              }}
            />
          ) : (
            <KonsultasiRekomendasiStep2Form
              onBack={() => setStep(1)}
              onSubmit={handleSubmit}
              loading={loading}
            />
          )}
        </div>
      </main>

      {/* Landing Page Footer */}
      <Kontak />
    </div>
  );
}
