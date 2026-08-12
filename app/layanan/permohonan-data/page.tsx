"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Kontak from "@/components/landing-page/Kontak";
import CommonServiceForm, { CommonFormData } from "@/components/form/layanan/CommonServiceForm";
import PermohonanDataStep2Form from "@/components/form/layanan/permohonan-data/page";
import ReviewServiceForm from "@/components/form/layanan/ReviewServiceForm";
import { Loader2 } from "lucide-react";
import FormLayout from "@/components/form/layanan/FormLayout";

const API_URL = "http://localhost:3000";
const LAYANAN_ID = 18; // Permohonan Data

export default function PermohonanDataPage() {
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
    const [step2Data, setStep2Data] = useState({
        jenisData: "",
        bentukData: "",
        tujuanPenggunaan: "",
        wilayahKajian: "",
        periodeData: "",
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

    const handleSubmit = async () => {
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
            setError("Jenis Data wajib diisi!");
            setLoading(false);
            return;
        }
        if (!step2Data.bentukData.trim()) {
            setError("Bentuk Data wajib dipilih!");
            setLoading(false);
            return;
        }
        if (!step2Data.tujuanPenggunaan.trim()) {
            setError("Tujuan Penggunaan Data wajib diisi!");
            setLoading(false);
            return;
        }
        if (!step2Data.wilayahKajian.trim()) {
            setError("Wilayah Kajian wajib diisi!");
            setLoading(false);
            return;
        }
        if (!step2Data.periodeData.trim()) {
            setError("Periode Data wajib diisi!");
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
                        bentuk_data: step2Data.bentukData.trim(),
                        tujuan_penggunaan: step2Data.tujuanPenggunaan.trim(),
                        wilayah_kajian: step2Data.wilayahKajian.trim(),
                        periode_data: step2Data.periodeData.trim(),
                    },
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                let errMsg = "Gagal mengajukan permohonan data.";
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
            console.error("[Submit Permohonan Data] Error:", err);
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
        setStep2Data({
            jenisData: "",
            bentukData: "",
            tujuanPenggunaan: "",
            wilayahKajian: "",
            periodeData: "",
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
        <FormLayout
            serviceName="Permohonan Data"
            step={step}
            error={error}
            success={success}
            createdTiketNo={createdTiketNo}
            onAjukanLagi={() => setSuccess(false)}
        >
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
                        serviceName="Permohonan Data"
                        initialData={formData}
                        onNext={(data) => {
                            setFormData(data);
                            setStep(2);
                        }}
                    />
                ) : step === 2 ? (
                    <PermohonanDataStep2Form
                        onBack={() => setStep(1)}
                        onSubmit={(data) => {
                            setStep2Data(data);
                            setStep(3);
                        }}
                        loading={loading}
                    />
                ) : (
                    <ReviewServiceForm
                        commonData={formData}
                        serviceData={[
                            { label: "Jenis Data Yang Diminta", value: step2Data.jenisData, isLongText: true },
                            { label: "Bentuk Data", value: step2Data.bentukData },
                            { label: "Wilayah Kajian", value: step2Data.wilayahKajian },
                            { label: "Periode Data", value: step2Data.periodeData },
                            { label: "Tujuan Penggunaan Data", value: step2Data.tujuanPenggunaan, isLongText: true },
                        ]}
                        onBack={() => setStep(2)}
                        onSubmit={handleSubmit}
                        loading={loading}
                    />
                )}
            </div>
        </FormLayout>
    );
}
