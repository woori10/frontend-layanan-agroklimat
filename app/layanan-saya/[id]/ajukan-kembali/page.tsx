"use client";

import React, { use, useEffect, useState } from "react";
import Navbar from "@/components/navbar/Navbar";
import {
    ChevronLeft,
    FileText,
    Database,
    Download,
    User,
    RefreshCw,
    Send,
    Upload,
    CloudUpload,
    X
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

interface TiketDetail {
    id: number;
    no_tiket: string;
    status: string;
    tanggal_submit: string;
    tanggal_sla?: string;
    jawaban_form: Record<string, any> | null;
    layanan: {
        id: number;
        nama_layanan: string;
    };
    dokumen: Dokumen[];
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

export default function AjukanKembaliPage({ params }: PageProps) {
    const resolvedParams = use(params);
    const router = useRouter();
    const idStr = resolvedParams.id;

    const [tiket, setTiket] = useState<TiketDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [mounted, setMounted] = useState(false);

    // Form State
    const [catatanRevisi, setCatatanRevisi] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [submitting, setSubmitting] = useState(false);

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
            .then(setTiket)
            .catch((err: any) => setError(err.message))
            .finally(() => setLoading(false));
    }, [idStr, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!catatanRevisi.trim()) {
            alert("Harap masukkan catatan penyesuaian/revisi.");
            return;
        }
        setSubmitting(true);
        try {
            // Mock submit action
            alert("Pengajuan kembali berhasil dikirim!");
            router.push(`/layanan-saya/${idStr}`);
        } catch (err: any) {
            alert(err.message || "Gagal mengirim pengajuan kembali");
        } finally {
            setSubmitting(false);
        }
    };

    if (!mounted) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-secondary-green-color border-t-transparent"></div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200">
                <Navbar />
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-zinc-500">
                    Memuat detail permohonan...
                </main>
            </div>
        );
    }

    if (error || !tiket) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200">
                <Navbar />
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-red-500">
                    {error || "Permohonan tidak ditemukan"}
                </main>
            </div>
        );
    }

    const commonFields = ["nama_lengkap", "nip_ktp", "alamat_instansi", "no_telp"];
    const formAnswers = tiket.jawaban_form || {};
    const lampiranDocs = tiket.dokumen.filter(doc => doc.tipe !== "Laporan Hasil");
    const laporanDocs = tiket.dokumen.filter(doc => doc.tipe === "Laporan Hasil");

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Breadcrumb */}
                <div className="flex items-center gap-1 mb-6">
                    <Link
                        href={`/layanan-saya/${idStr}`}
                        className="flex items-center text-xs font-semibold text-zinc-555 hover:text-zinc-700 dark:text-zinc-650 dark:hover:text-zinc-200 transition"
                    >
                        <ChevronLeft className="h-4 w-4 mr-0.5" />
                        Kembali ke Detail Layanan
                    </Link>
                </div>

                <form onSubmit={handleSubmit} className="rounded-2xl border border-zinc-200/80 bg-white p-6 md:p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                    {/* Title Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800 mb-8">
                        <div>
                            <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white tracking-tight">
                                Ajukan Kembali Permohonan: {tiket.no_tiket}
                            </h1>
                            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-655 font-medium">
                                Kirim permintaan penyesuaian dokumen hasil yang tidak sesuai dengan kebutuhan Anda.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-8 w-full">
                        {/* Read Only: Informasi Pemohon */}
                        <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 md:p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                            <div className="flex border-b border-zinc-300 dark:border-zinc-800/80 items-center gap-2 pb-4 mb-6">
                                <User className="h-5 w-5 text-zinc-400" />
                                <h3 className="text-base font-semibold text-zinc-500">
                                    Informasi Pemohon (Salinan)
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8 text-sm">
                                <div>
                                    <span className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">
                                        Nama Lengkap
                                    </span>
                                    <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                                        {formAnswers.nama_lengkap || "-"}
                                    </span>
                                </div>

                                <div>
                                    <span className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">
                                        NIP / No. KTP
                                    </span>
                                    <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                                        {formAnswers.nip_ktp || "-"}
                                    </span>
                                </div>

                                <div>
                                    <span className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">
                                        Alamat Instansi / Asal
                                    </span>
                                    <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                                        {formAnswers.alamat_instansi || "-"}
                                    </span>
                                </div>

                                <div>
                                    <span className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">
                                        No. Telepon
                                    </span>
                                    <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                                        {formAnswers.no_telp || "-"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Read Only: Detail Layanan */}
                        <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 md:p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40">
                            <div className="flex border-b border-zinc-300 dark:border-zinc-800/80 items-center gap-2 pb-4 mb-6">
                                <Database className="h-5 w-5 text-zinc-400" />
                                <h3 className="text-base font-semibold text-zinc-555">
                                    Detail Layanan Sebelumnya (Salinan)
                                </h3>
                            </div>

                            <div className="space-y-6 text-sm">
                                <div className="grid gap-y-5 gap-x-6 sm:grid-cols-2">
                                    <div>
                                        <span className="block text-xs font-medium text-[var(--foreground)] dark:text-zinc-500 uppercase tracking-wider mb-1">
                                            Nama Layanan
                                        </span>
                                        <span className="block text-sm font-semibold text-zinc-800 dark:text-zinc-200 mt-1">
                                            {tiket.layanan.nama_layanan}
                                        </span>
                                    </div>

                                    <div>
                                        <span className="block text-xs font-medium text-[var(--foreground)] dark:text-zinc-500 uppercase tracking-wider mb-1">
                                            Tanggal Pengajuan
                                        </span>
                                        <span className="block text-sm font-semibold text-zinc-800 dark:text-zinc-200 mt-1">
                                            {formatDate(tiket.tanggal_submit)}
                                        </span>
                                    </div>
                                </div>

                                <div className="grid gap-y-5 gap-x-6 sm:grid-cols-2 pt-4">
                                    {Object.entries(formAnswers)
                                        .filter(([key]) => !commonFields.includes(key))
                                        .map(([key, value]) => {
                                            const formattedKey = key
                                                .split("_")
                                                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                                .join(" ");

                                            const isAlatList = key === "selected_alat_list" && Array.isArray(value);

                                            return (
                                                <div key={key} className={isAlatList ? "col-span-2" : ""}>
                                                    <span className="block text-xs font-medium text-[var(--foreground)] dark:text-zinc-500 uppercase tracking-wider mb-1">
                                                        {formattedKey}
                                                    </span>
                                                    <div className="block text-sm font-semibold text-zinc-800 dark:text-zinc-200 mt-1 leading-relaxed whitespace-pre-line">
                                                        {key === "total_estimasi" ? (
                                                            `Rp ${Number(value).toLocaleString("id-ID")}`
                                                        ) : isAlatList ? (
                                                            value.length > 0 ? (
                                                                <div className="mt-1.5 border border-zinc-200/80 dark:border-zinc-800 rounded-xl p-3.5 bg-zinc-50/50 dark:bg-zinc-950/20 divide-y divide-zinc-100 dark:divide-zinc-800/60 font-semibold text-sm">
                                                                    {value.map((tool: any, idx: number) => (
                                                                        <div key={idx} className="flex justify-between items-center py-2 first:pt-0 last:pb-0 text-xs font-semibold">
                                                                            <span className="font-semibold text-[#2C5E3B] dark:text-secondary-green-color">{tool.name}</span>
                                                                            <span className="text-zinc-500 dark:text-zinc-400 font-medium">
                                                                                {tool.units} Unit × Rp {tool.price.toLocaleString("id-ID")}
                                                                            </span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                <span className="text-zinc-500 dark:text-zinc-400 text-xs mt-1 block font-normal">Tidak ada data alat yang dipinjam</span>
                                                            )
                                                        ) : (typeof value === "string" && (/^\d{4}-\d{2}-\d{2}$/.test(value) || (key.includes("tanggal") && !isNaN(Date.parse(value))))) ? (
                                                            formatDate(value as string)
                                                        ) : (
                                                            value ? String(value) : "-"
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                </div>
                            </div>
                        </div>
                        {/* Form Input revision */}
                        <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 md:p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                            <div className="flex border-b border-zinc-300 dark:border-zinc-800/80 items-center gap-2 pb-4 mb-6">
                                <RefreshCw className="h-5 w-5 text-[#2C5E3B]" />
                                <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200">
                                    Formulir Pengajuan Kembali
                                </h3>
                            </div>

                            <div className="space-y-6">
                                {/* Catatan Penyesuaian */}
                                <div className="space-y-2">
                                    <label htmlFor="catatanRevisi" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                                        Catatan Penyesuaian / Revisi <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        id="catatanRevisi"
                                        required
                                        rows={5}
                                        value={catatanRevisi}
                                        onChange={(e) => setCatatanRevisi(e.target.value)}
                                        className="block w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-[#F8FAFC] dark:bg-zinc-955 px-4 py-3 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 shadow-sm focus:border-[var(--green-color)] focus:outline-none focus:ring-1 focus:ring-[var(--green-color)] resize-none"
                                        placeholder="Jelaskan secara rinci bagian mana yang belum sesuai dan penyesuaian apa saja yang diperlukan..."
                                    />
                                </div>

                                {/* Upload Dokumen Pendukung */}
                                <div className="space-y-2">
                                    <label className="block text-xs md:text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                                        Dokumen Pendukung Tambahan <span className="text-xs text-zinc-450 font-normal">(opsional)</span>
                                    </label>

                                    {!selectedFile ? (
                                        <div className="mt-1 flex justify-center px-4 sm:px-6 pt-5 pb-6 border-2 border-dashed border-zinc-300 dark:border-zinc-800 rounded-xl hover:border-green-color dark:hover:border-secondary-green-color/50 hover:bg-secondary-green-color/10 dark:hover:bg-secondary-green-color/5 transition cursor-pointer">
                                            <div className="space-y-2 text-center flex flex-col items-center">
                                                <CloudUpload className="mx-auto h-10 w-10 text-[var(--green-color)] dark:text-[var(--green-color)]" aria-hidden="true" />
                                                <div className="flex text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 justify-center">
                                                    <label
                                                        htmlFor="file-upload-ajukan-kembali"
                                                        className="relative cursor-pointer rounded-md font-semibold text-[var(--green-color)] dark:text-[var(--foreground)] hover:text-[var(--green-color)] focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[var(--green-color)]"
                                                    >
                                                        <span>Klik untuk upload</span>
                                                        <input
                                                            id="file-upload-ajukan-kembali"
                                                            type="file"
                                                            className="sr-only"
                                                            accept=".pdf,.docx,image/jpeg,image/png"
                                                            onChange={(e) => {
                                                                if (e.target.files && e.target.files[0]) {
                                                                    setSelectedFile(e.target.files[0]);
                                                                }
                                                            }}
                                                        />
                                                    </label>
                                                </div>
                                                <p className="text-[11px] sm:text-xs text-zinc-400 dark:text-zinc-550">
                                                    Format PDF, DOCX, JPG, atau PNG (Maks. 5MB)
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
                                                    <p className="text-xs sm:text-sm font-bold text-zinc-800 dark:text-zinc-200 truncate">
                                                        {selectedFile.name}
                                                    </p>
                                                    <p className="text-[11px] sm:text-xs text-zinc-400">
                                                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setSelectedFile(null)}
                                                className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition shrink-0 cursor-pointer"
                                                title="Hapus berkas"
                                                aria-label="Hapus berkas"
                                            >
                                                <X className="w-5 h-5" aria-hidden="true" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>


                        {/* Submit Action*/}
                        <div>
                            <div className="flex justify-end gap-4">
                                <Link href={`/layanan-saya/${idStr}`}>
                                    <button
                                        type="button"
                                        className="px-6 py-3 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-750 rounded-xl font-bold text-sm transition cursor-pointer text-center"
                                    >
                                        Batal
                                    </button>
                                </Link>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-6 py-3 bg-[var(--green-color)] text-white hover:opacity-90 active:scale-[0.99] rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:bg-zinc-350"
                                >
                                    <Send className="w-4 h-4" />
                                    <span>Kirim Pengajuan Ulang</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </main>
        </div>
    );
}