"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    User,
    Phone,
    FileText,
    MapPin,
    Calendar,
    AlertCircle,
    X,
    CloudUpload,
    ArrowRight
} from "lucide-react";

export interface CommonFormData {
    namaLengkap: string;
    noTelp: string;
    nipKtp: string;
    alamatInstansi: string;
    tanggalPengajuan: string;
    suratPengantar: File | null;
}

interface CommonServiceFormProps {
    serviceName: string;
    onNext: (data: CommonFormData) => void;
    initialData?: CommonFormData;
}

export default function CommonServiceForm({
    serviceName,
    onNext,
    initialData
}: CommonServiceFormProps) {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form states
    const [namaLengkap, setNamaLengkap] = useState(initialData?.namaLengkap || "");
    const [noTelp, setNoTelp] = useState(initialData?.noTelp || "");
    const [nipKtp, setNipKtp] = useState(initialData?.nipKtp || "");
    const [alamatInstansi, setAlamatInstansi] = useState(initialData?.alamatInstansi || "");
    const [tanggalPengajuan, setTanggalPengajuan] = useState(
        initialData?.tanggalPengajuan || new Date().toISOString().split('T')[0]
    );
    const [suratPengantar, setSuratPengantar] = useState<File | null>(initialData?.suratPengantar || null);
    const [error, setError] = useState("");

    // Update state if initialData changes
    useEffect(() => {
        if (initialData) {
            setNamaLengkap(initialData.namaLengkap);
            setNoTelp(initialData.noTelp);
            setNipKtp(initialData.nipKtp);
            setAlamatInstansi(initialData.alamatInstansi);
            setTanggalPengajuan(
                initialData.tanggalPengajuan || new Date().toISOString().split('T')[0]
            );
            setSuratPengantar(initialData.suratPengantar);
        }
    }, [initialData]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            // Size check (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setError("Ukuran berkas melebihi batas 5MB!");
                return;
            }
            // Type check
            const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
            if (!allowedTypes.includes(file.type)) {
                setError("Format berkas harus PDF, JPG, atau PNG!");
                return;
            }
            setSuratPengantar(file);
            setError("");
        }
    };

    const handleRemoveFile = () => {
        setSuratPengantar(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        // Frontend validations
        if (!namaLengkap.trim()) {
            setError("Nama Lengkap wajib diisi!");
            return;
        }
        if (!noTelp.trim()) {
            setError("Nomor Telepon wajib diisi!");
            return;
        }
        if (!nipKtp.trim()) {
            setError("NIP / Nomor KTP wajib diisi!");
            return;
        }
        if (!alamatInstansi.trim()) {
            setError("Alamat / Instansi Asal wajib diisi!");
            return;
        }
        if (!tanggalPengajuan) {
            setError("Tanggal Pengajuan Surat wajib diisi!");
            return;
        }

        onNext({
            namaLengkap,
            noTelp,
            nipKtp,
            alamatInstansi,
            tanggalPengajuan,
            suratPengantar
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Header info inside the card */}
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-zinc-200 dark:border-zinc-800">
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                    Informasi Pemohon
                </h2>
                {/* <p className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm mt-1">
                    Silakan lengkapi formulir informasi dasar untuk pengajuan <strong>{serviceName}</strong>.
                </p> */}
                <p className="text-[var(--green-color)] dark:text-white text-xs font-semibold bg-[#D1FAE5] dark:bg-[#1E4329] px-3 py-2 rounded-xl">
                    Langkah 1 dari 2
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

            <div className="grid gap-6 sm:grid-cols-2">
                {/* Nama Lengkap */}
                <div className="space-y-2">
                    <label htmlFor="namaLengkap" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                        Nama Lengkap <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <input
                            id="namaLengkap"
                            type="text"
                            required
                            value={namaLengkap}
                            onChange={(e) => setNamaLengkap(e.target.value)}
                            className="block w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-[#F8FAFC] dark:bg-zinc-950 px-4 py-3 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 shadow-sm focus:border-[var(--green-color)] focus:outline-none focus:ring-1 focus:ring-[var(--green-color)]"
                            placeholder="Masukkan nama lengkap..."
                        />
                    </div>
                </div>

                {/* No Telp */}
                <div className="space-y-2">
                    <label htmlFor="noTelp" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                        No. Telepon / WhatsApp <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <input
                            id="noTelp"
                            type="tel"
                            required
                            value={noTelp}
                            onChange={(e) => setNoTelp(e.target.value)}
                            className="block w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-[#F8FAFC] dark:bg-zinc-950 px-4 py-3 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 shadow-sm focus:border-[var(--green-color)] focus:outline-none focus:ring-1 focus:ring-[var(--green-color)]"
                            placeholder="08123456789"
                        />
                    </div>
                </div>

                {/* NIP / No KTP */}
                <div className="space-y-2">
                    <label htmlFor="nipKtp" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                        NIP / No. KTP <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <input
                            id="nipKtp"
                            type="text"
                            required
                            value={nipKtp}
                            onChange={(e) => setNipKtp(e.target.value)}
                            className="block w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-[#F8FAFC] dark:bg-zinc-950 px-4 py-3 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 shadow-sm focus:border-[var(--green-color)] focus:outline-none focus:ring-1 focus:ring-[var(--green-color)]"
                            placeholder="198327948279249891"
                        />
                    </div>
                </div>

                {/* Tanggal Pengajuan Surat */}
                <div className="space-y-2">
                    <label htmlFor="tanggalPengajuan" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                        Tanggal Pengajuan Surat <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <input
                            id="tanggalPengajuan"
                            type="date"
                            required
                            value={tanggalPengajuan}
                            onChange={(e) => setTanggalPengajuan(e.target.value)}
                            className="block w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-[#F8FAFC] dark:bg-zinc-950 px-4 py-3 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 shadow-sm focus:border-[var(--green-color)] focus:outline-none focus:ring-1 focus:ring-[var(--green-color)]"
                        />
                    </div>
                </div>
            </div>

            {/* Alamat / Instansi Asal */}
            <div className="space-y-2">
                <label htmlFor="alamatInstansi" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    Alamat / Instansi Asal <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                    <textarea
                        id="alamatInstansi"
                        required
                        rows={3}
                        value={alamatInstansi}
                        onChange={(e) => setAlamatInstansi(e.target.value)}
                        className="block w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-[#F8FAFC] dark:bg-zinc-950 px-4 py-3 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 shadow-sm focus:border-[var(--green-color)] focus:outline-none focus:ring-1 focus:ring-[var(--green-color)] resize-none"
                        placeholder="Alamat lengkap atau instansi"
                    />
                </div>
            </div>

            {/* Surat Pengantar Asal Instansi (opsional) */}
            <div className="space-y-2">
                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    Surat Pengantar Asal Instansi <span className="text-xs text-zinc-450 font-normal">(opsional)</span>
                </label>

                {!suratPengantar ? (
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-zinc-300 dark:border-zinc-800 rounded-xl hover:border-emerald-500 dark:hover:border-emerald-500/50 hover:bg-emerald-50/10 dark:hover:bg-emerald-950/5 transition cursor-pointer">
                        <div className="space-y-2 text-center flex flex-col items-center">
                            <CloudUpload className="mx-auto h-10 w-10 text-[var(--green-color)] dark:text-[var(--green-color)]" />
                            <div className="flex text-sm text-zinc-600 dark:text-zinc-400 justify-center">
                                <label
                                    htmlFor="file-upload"
                                    className="relative cursor-pointer rounded-md font-semibold text-[var(--foreground)] dark:text-[var(--foreground)] hover:text-[var(--green-color)] focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[var(--green-color)]"
                                >
                                    <span>Klik atau seret file kesini</span>
                                    <input
                                        id="file-upload"
                                        name="file-upload"
                                        type="file"
                                        ref={fileInputRef}
                                        className="sr-only"
                                        accept=".pdf,image/jpeg,image/png"
                                        onChange={handleFileChange}
                                    />
                                </label>
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
                                <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200 truncate">{suratPengantar.name}</p>
                                <p className="text-xs text-zinc-400">{(suratPengantar.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={handleRemoveFile}
                            className="p-1 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition"
                            title="Hapus berkas"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-5 py-2.5 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 rounded-xl text-sm font-bold transition"
                >
                    Batal
                </button>
                <button
                    type="submit"
                    className="px-6 py-2 bg-[var(--green-color)] hover:cursor-pointer text-white rounded-xl text-sm font-bold shadow-md transition flex items-center gap-2"
                >
                    Selanjutnya
                    <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </form>
    );
}
