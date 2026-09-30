"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Kontak from "@/components/landing-page/Kontak";
import CommonServiceForm, { CommonFormData } from "@/components/form/layanan/CommonServiceForm";
import MagangPKLStep2Form, { MagangPKLStep2 } from "@/components/form/layanan/magang-pkl/page";
import ReviewServiceForm from "@/components/form/layanan/ReviewServiceForm";
import { Loader2 } from "lucide-react";
import FormLayout from "@/components/form/layanan/FormLayout";
import { getLayananBySlug } from "@/lib/layanan";
import { getApiUrl } from "@/lib/api";

const SLUG = "magang-pkl";

const formatDateIndo = (dateStr: string) => {
    if (!dateStr) return "-";
    try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        return d.toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    } catch {
        return dateStr;
    }
};

export default function MagangPKLPage() {
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
    const [step2Data, setStep2Data] = useState<MagangPKLStep2>({
        topik: "",
        tanggalMulai: "",
        tanggalSelesai: "",
        durasi: "",
        proposal: null,
    });

    // Status states
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [progressMsg, setProgressMsg] = useState("");
    const [createdTiketNo, setCreatedTiketNo] = useState("");
    const [layananId, setLayananId] = useState<number | null>(null);

    // Authenticate on mount
    useEffect(() => {
        setMounted(true);
        const token = localStorage.getItem("agro_token");
        if (!token) {
            router.push("/login");
            return;
        }
        getLayananBySlug(SLUG)
            .then((l) => setLayananId(l.id))
            .catch(() => setError("Gagal memuat data layanan. Silahkan muat ulang halaman."));
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
        if (!step2Data.topik.trim()) {
            setError("Topik Magang/PKL wajib diisi!");
            setLoading(false);
            return;
        }
        if (!step2Data.tanggalMulai) {
            setError("Tanggal Mulai Magang/PKL wajib diisi!");
            setLoading(false);
            return;
        }
        if (!step2Data.tanggalSelesai) {
            setError("Tanggal Selesai Magang/PKL wajib diisi!");
            setLoading(false);
            return;
        }
        if (new Date(step2Data.tanggalSelesai) < new Date(step2Data.tanggalMulai)) {
            setError("Tanggal Selesai tidak boleh mendahului Tanggal Mulai!");
            setLoading(false);
            return;
        }
        if (!step2Data.proposal) {
            setError("File Proposal wajib diunggah!");
            setLoading(false);
            return;
        }

        const token = localStorage.getItem("agro_token");
        if (!token) {
            setError("Sesi Anda telah berakhir. Silahkan login kembali.");
            setLoading(false);
            return;
        }

        let currentLayananId = layananId;
        if (!currentLayananId) {
            try {
                const l = await getLayananBySlug(SLUG);
                currentLayananId = l.id;
                setLayananId(l.id);
            } catch {
                setError("Data layanan belum siap atau tidak ditemukan. Silahkan muat ulang halaman.");
                setLoading(false);
                return;
            }
        }

        try {
            // 1. Submit ticket data
            setProgressMsg("Mengirimkan formulir pengajuan...");
            const response = await fetch(`${getApiUrl()}/tiket`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    layanan_id: currentLayananId,
                    jawaban_form: {
                        nama_lengkap: formData.namaLengkap.trim(),
                        no_telp: formData.noTelp.trim(),
                        nip_ktp: formData.nipKtp.trim(),
                        alamat_instansi: formData.alamatInstansi.trim(),
                        tanggal_pengajuan: formData.tanggalPengajuan,
                        topik_magang: step2Data.topik.trim(),
                        tanggal_mulai: step2Data.tanggalMulai,
                        tanggal_selesai: step2Data.tanggalSelesai,
                        durasi_magang: step2Data.durasi || `${formatDateIndo(step2Data.tanggalMulai)} s.d. ${formatDateIndo(step2Data.tanggalSelesai)}`,
                    },
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                let errMsg = "Gagal mengajukan magang / PKL.";
                if (data.message) {
                    errMsg = Array.isArray(data.message) ? data.message.join(", ") : data.message;
                }
                throw new Error(errMsg);
            }

            const tiketId = data.id;
            const noTiket = data.no_tiket;
            setCreatedTiketNo(noTiket);

            // 2. Upload file if exist (suratPengantar)
            if (formData.suratPengantar) {
                setProgressMsg("Mengunggah surat pengantar asal instansi...");
                const uploadFormData = new FormData();
                uploadFormData.append("file", formData.suratPengantar);
                uploadFormData.append("tipe", "surat_pengantar");

                const uploadResponse = await fetch(`${getApiUrl()}/tiket/${tiketId}/dokumen`, {
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

            // 3. Upload proposal file
            if (step2Data.proposal) {
                setProgressMsg("Mengunggah proposal magang / PKL...");
                const uploadProposalFormData = new FormData();
                uploadProposalFormData.append("file", step2Data.proposal);
                uploadProposalFormData.append("tipe", "proposal");

                const uploadProposalResponse = await fetch(`${getApiUrl()}/tiket/${tiketId}/dokumen`, {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    body: uploadProposalFormData,
                });

                const uploadProposalData = await uploadProposalResponse.json();
                if (!uploadProposalResponse.ok) {
                    let uploadErrMsg = "Formulir disimpan, namun gagal mengunggah proposal.";
                    if (uploadProposalData.message) {
                        uploadErrMsg = Array.isArray(uploadProposalData.message) ? uploadProposalData.message.join(", ") : uploadProposalData.message;
                    }
                    throw new Error(uploadErrMsg);
                }
            }

            setSuccess(true);
            setProgressMsg("");
            resetForm();
        } catch (err: any) {
            console.error("[Submit Magang / PKL] Error:", err);
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
            topik: "",
            tanggalMulai: "",
            tanggalSelesai: "",
            durasi: "",
            proposal: null,
        });
        setStep(1);
    };

    if (!mounted) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-secondary-green-color border-t-transparent"></div>
            </div>
        );
    }

    return (
        <FormLayout
            serviceName="Magang / PKL"
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
                        serviceName="Magang / PKL"
                        initialData={formData}
                        onNext={(data) => {
                            setFormData(data);
                            setStep(2);
                        }}
                    />
                ) : step === 2 ? (
                    <MagangPKLStep2Form
                        initialData={step2Data}
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
                            { label: "Topik Magang / PKL", value: step2Data.topik, isLongText: true },
                            { label: "Tanggal Mulai", value: formatDateIndo(step2Data.tanggalMulai) },
                            { label: "Tanggal Selesai", value: formatDateIndo(step2Data.tanggalSelesai) },
                            { label: "Estimasi Durasi", value: step2Data.durasi || "-" },
                            { label: "File Proposal", value: step2Data.proposal ? step2Data.proposal.name : "Belum diunggah" }
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