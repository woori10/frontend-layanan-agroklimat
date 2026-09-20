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
        const trimmedNama = namaLengkap.trim();
        const trimmedTelp = noTelp.trim();
        const trimmedNipKtp = nipKtp.trim();
        const trimmedAlamat = alamatInstansi.trim();

        if (!trimmedNama) {
            setError("Nama Lengkap wajib diisi!");
            return;
        }
        if (trimmedNama.length < 3) {
            setError("Nama Lengkap minimal 3 karakter!");
            return;
        }

        if (!trimmedTelp) {
            setError("Nomor Telepon wajib diisi!");
            return;
        }
        // Validasi format nomor telepon (hanya angka/tanda plus, 10 - 15 digit)
        const cleanTelp = trimmedTelp.replace(/[\s-]/g, "");
        const telpRegex = /^(^\+62|62|08)[0-9]{8,13}$/;
        if (!/^[0-9+]+$/.test(cleanTelp) || cleanTelp.length < 10 || cleanTelp.length > 15) {
            setError("Nomor Telepon / WhatsApp tidak valid (harus 10 - 15 digit angka, contoh: 08123456789)!");
            return;
        }

        if (!trimmedNipKtp) {
            setError("NIP / Nomor KTP wajib diisi!");
            return;
        }
        // Validasi NIK/KTP (16 digit) atau NIP (18 digit)
        const digitsOnlyNipKtp = trimmedNipKtp.replace(/\s/g, "");
        if (!/^[0-9]+$/.test(digitsOnlyNipKtp)) {
            setError("NIP / Nomor KTP harus berupa angka!");
            return;
        }
        if (digitsOnlyNipKtp.length !== 16 && digitsOnlyNipKtp.length !== 18) {
            setError("NIP / Nomor KTP harus 16 digit (No. KTP) atau 18 digit (NIP)!");
            return;
        }

        if (!trimmedAlamat) {
            setError("Alamat / Instansi Asal wajib diisi!");
            return;
        }
        if (trimmedAlamat.length < 3) {
            setError("Alamat / Instansi Asal minimal 3 karakter!");
            return;
        }

        if (!tanggalPengajuan) {
            setError("Tanggal Pengajuan Surat wajib diisi!");
            return;
        }

        onNext({
            namaLengkap: trimmedNama,
            noTelp: trimmedTelp,
            nipKtp: trimmedNipKtp,
            alamatInstansi: trimmedAlamat,
            tanggalPengajuan,
            suratPengantar
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Header info inside the card */}
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-zinc-200 dark:border-zinc-800">
                <h2 className="text-sm md:text-lg font-bold text-zinc-900 dark:text-white">
                    Informasi Pemohon
                </h2>
                {/* <p className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm mt-1">
                    Silakan lengkapi formulir informasi dasar untuk pengajuan <strong>{serviceName}</strong>.
                </p> */}
                <p className="text-[var(--green-color)] dark:text-white text-[10px] md:text-xs font-semibold bg-secondary-green-color dark:bg-secondary-green-color border border-[var(--green-color)]/50 px-2 py-1 rounded-xl">
                    Langkah 1 dari 2
                </p>
            </div>

            {error && (
                <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/45 dark:text-red-400 border border-red-200 dark:border-red-900/40 flex items-start gap-3 shadow-sm transition duration-300">
                    <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="mt-1 text-red-600 dark:text-red-400">{error}</p>
                    </div>
                </div>
            )}

            <div className="grid gap-6 sm:grid-cols-2">
                {/* Nama Lengkap */}
                <div className="space-y-2">
                    <label htmlFor="namaLengkap" className="block text-xs md:text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                        Nama Lengkap <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <input
                            id="namaLengkap"
                            type="text"
                            required
                            minLength={3}
                            maxLength={100}
                            value={namaLengkap}
                            onChange={(e) => setNamaLengkap(e.target.value)}
                            className="block w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-[#F8FAFC] dark:bg-zinc-950 px-4 py-3 text-xs md:text-sm text-zinc-900 dark:text-white placeholder-zinc-400 shadow-sm focus:border-[var(--green-color)] focus:outline-none focus:ring-1 focus:ring-[var(--green-color)]"
                            placeholder="Masukkan nama lengkap (min. 3 karakter)"
                        />
                    </div>
                    <p className="text-[11px] text-zinc-400 dark:text-zinc-500">Minimal 3 karakter</p>
                </div>

                {/* No Telp */}
                <div className="space-y-2">
                    <label htmlFor="noTelp" className="block text-xs md:text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                        No. Telepon / WhatsApp <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <input
                            id="noTelp"
                            type="tel"
                            required
                            minLength={10}
                            maxLength={15}
                            value={noTelp}
                            onChange={(e) => {
                                // Hanya izinkan angka dan simbol plus di awal
                                const val = e.target.value.replace(/[^0-9+]/g, "");
                                setNoTelp(val);
                            }}
                            className="block w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-[#F8FAFC] dark:bg-zinc-950 px-4 py-3 text-xs md:text-sm text-zinc-900 dark:text-white placeholder-zinc-400 shadow-sm focus:border-[var(--green-color)] focus:outline-none focus:ring-1 focus:ring-[var(--green-color)]"
                            placeholder="Contoh: 08123456789 (10 - 15 digit)"
                        />
                    </div>
                    <p className="text-[11px] text-zinc-400 dark:text-zinc-500">Nomor aktif WhatsApp (10 - 15 digit angka)</p>
                </div>

                {/* NIP / No KTP */}
                <div className="space-y-2">
                    <label htmlFor="nipKtp" className="block text-xs md:text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                        NIP / No. KTP <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <input
                            id="nipKtp"
                            type="text"
                            required
                            maxLength={18}
                            value={nipKtp}
                            onChange={(e) => {
                                // Hanya izinkan input angka
                                const val = e.target.value.replace(/\D/g, "");
                                setNipKtp(val);
                            }}
                            className="block w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-[#F8FAFC] dark:bg-zinc-950 px-4 py-3 text-xs md:text-sm text-zinc-900 dark:text-white placeholder-zinc-400 shadow-sm focus:border-[var(--green-color)] focus:outline-none focus:ring-1 focus:ring-[var(--green-color)]"
                            placeholder="16 digit (No. KTP) atau 18 digit (NIP)"
                        />
                    </div>
                    <p className="text-[11px] text-zinc-400 dark:text-zinc-500">16 digit angka untuk KTP atau 18 digit untuk NIP</p>
                </div>

                {/* Tanggal Pengajuan Surat */}
                <div className="space-y-2">
                    <label htmlFor="tanggalPengajuan" className="block text-xs md:text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                        Tanggal Pengajuan Surat <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <input
                            id="tanggalPengajuan"
                            type="date"
                            required
                            value={tanggalPengajuan}
                            onChange={(e) => setTanggalPengajuan(e.target.value)}
                            className="block w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-[#F8FAFC] dark:bg-zinc-950 px-4 py-3 text-xs md:text-sm text-zinc-900 dark:text-white placeholder-zinc-400 shadow-sm focus:border-[var(--green-color)] focus:outline-none focus:ring-1 focus:ring-[var(--green-color)]"
                        />
                    </div>
                </div>
            </div>

            {/* Alamat / Instansi Asal */}
            <div className="space-y-2">
                <label htmlFor="alamatInstansi" className="block text-xs md:text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    Alamat / Instansi Asal <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                    <textarea
                        id="alamatInstansi"
                        required
                        minLength={3}
                        rows={3}
                        value={alamatInstansi}
                        onChange={(e) => setAlamatInstansi(e.target.value)}
                        className="block w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-[#F8FAFC] dark:bg-zinc-950 px-4 py-3 text-xs md:text-sm text-zinc-900 dark:text-white placeholder-zinc-400 shadow-sm focus:border-[var(--green-color)] focus:outline-none focus:ring-1 focus:ring-[var(--green-color)] resize-none"
                        placeholder="Alamat lengkap atau instansi asal pemohon (min. 3 karakter)"
                    />
                </div>
                <p className="text-[11px] text-zinc-400 dark:text-zinc-500">Minimal 3 karakter</p>
            </div>

            {/* Surat Pengantar Asal Instansi (opsional) */}
            <div className="space-y-2">
                <label className="block text-xs md:text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    Surat Pengantar Asal Instansi <span className="text-xs text-zinc-450 font-normal">(opsional)</span>
                </label>

                {!suratPengantar ? (
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-zinc-300 dark:border-zinc-800 rounded-xl hover:border-green-color dark:hover:border-secondary-green-color/50 hover:bg-secondary-green-color/10 dark:hover:bg-secondary-green-color/5 transition cursor-pointer">
                        <div className="space-y-2 text-center flex flex-col items-center">
                            <CloudUpload className="mx-auto h-10 w-10 text-[var(--green-color)] dark:text-[var(--green-color)]" />
                            <div className="flex text-sm text-zinc-600 dark:text-zinc-400 justify-center">
                                <label
                                    htmlFor="file-upload"
                                    className="relative cursor-pointer rounded-md font-semibold text-[var(--green-color)] dark:text-[var(--foreground)] hover:text-[var(--green-color)] focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[var(--green-color)]"
                                >
                                    <span>Klik untuk upload</span>
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
                                Masukkan file PDF (Maks. 5MB)
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-between p-3.5 bg-secondary-green-color/30 dark:bg-secondary-green-color/10 border border-green-color/30 dark:border-secondary-green-color/30 rounded-xl">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-secondary-green-color dark:bg-secondary-green-color rounded-lg text-green-color dark:text-secondary-green-color">
                                <FileText className="w-5 h-5" />
                            </div>
                            <div className="w-full">
                                <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{suratPengantar.name}</p>
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
            <div className="flex justify-between gap-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-5 py-2.5 border border-zinc-300 dark:border-zinc-700 hover:cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 rounded-xl text-xs md:text-sm font-bold transition"
                >
                    Batal
                </button>
                <button
                    type="submit"
                    className="px-6 py-2 bg-[var(--green-color)] hover:cursor-pointer hover:bg-[var(--hover-green-color)] text-white rounded-xl text-xs md:text-sm font-bold shadow-md transition flex items-center gap-2"
                >
                    Selanjutnya
                    <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </form>
    );
}
