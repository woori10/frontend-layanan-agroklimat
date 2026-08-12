"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Kontak from "@/components/landing-page/Kontak";
import LayananPerpustakaanForm, { LayananPerpustakaanData } from "@/components/form/layanan/layanan-perpustakaan/page";
import { Loader2 } from "lucide-react";
import FormLayout from "@/components/form/layanan/FormLayout";

const API_URL = "http://localhost:3000";
const LAYANAN_ID = 22; // Layanan Perpustakaan

export default function LayananPerpustakaanPage() {
  const router = useRouter();

  // Auth & Dropdown states
  const [mounted, setMounted] = useState(false);

  // Status states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [createdTiketNo, setCreatedTiketNo] = useState("");

  // Authenticate on mount
  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem("agro_token");
    if (!token) {
      router.push("/login");
    }
  }, [router]);

  const handleSubmit = async (formData: LayananPerpustakaanData) => {
    setError("");
    setLoading(true);
    setSuccess(false);

    const token = localStorage.getItem("agro_token");
    if (!token) {
      setError("Sesi Anda telah berakhir. Silahkan login kembali.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/tiket`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          layanan_id: LAYANAN_ID,
          jawaban_form: {
            nama: formData.nama.trim(),
            asal_instansi: formData.asalInstansi.trim(),
            tanggal_datang: formData.tanggalDatang,
            keperluan: formData.keperluan.trim(),
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        let errMsg = "Gagal mengajukan permohonan kunjungan perpustakaan.";
        if (data.message) {
          errMsg = Array.isArray(data.message) ? data.message.join(", ") : data.message;
        }
        throw new Error(errMsg);
      }

      const noTiket = data.no_tiket;
      setCreatedTiketNo(noTiket);
      setSuccess(true);
    } catch (err: any) {
      console.error("[Submit Perpustakaan] Error:", err);
      setError(err.message || "Terjadi kesalahan sistem saat memproses formulir.");
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <FormLayout
      serviceName="Layanan Perpustakaan"
      step={0}
      error={error}
      success={success}
      createdTiketNo={createdTiketNo}
      onAjukanLagi={() => setSuccess(false)}
      successTitle="Pengajuan Kunjungan Berhasil!"
      successDescription={
        <>
          <p className="text-emerald-700 dark:text-emerald-400">
            Formulir kunjungan perpustakaan telah diajukan dengan nomor tiket{" "}
            <span className="font-extrabold text-emerald-900 dark:text-white">{createdTiketNo}</span>.
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 pt-2">
            Silakan datang sesuai tanggal yang telah diajukan dengan membawa kartu identitas Anda.
          </p>
        </>
      }
    >
      {/* Form Container */}
      <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md rounded-2xl border border-zinc-200/60 dark:border-zinc-800/80 p-6 sm:p-8 shadow-xl relative overflow-hidden">
        {loading && (
          <div className="absolute inset-0 bg-white/60 dark:bg-zinc-950/60 z-50 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-10 h-10 animate-spin text-[var(--green-color)]" />
            <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Mengirimkan formulir pengajuan...</span>
          </div>
        )}

        <LayananPerpustakaanForm
          onSubmit={handleSubmit}
          loading={loading}
        />
      </div>
    </FormLayout>
  );
}
