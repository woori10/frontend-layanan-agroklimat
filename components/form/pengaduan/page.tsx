"use client";

import { useEffect, useState, useRef } from "react";
import { AlertCircle, CheckCircle2, FileText, Info, Phone, User, Calendar, Clock, HelpCircle, FileUp, X } from "lucide-react";

interface LayananItem {
    id: number;
    nama_layanan: string;
}

interface PengaduanFormProps {
    onClose: () => void;
}

const API_URL = "http://localhost:3000";

export default function PengaduanForm({ onClose }: PengaduanFormProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form fields states
    const [namaPelapor, setNamaPelapor] = useState("");
    const [noHp, setNoHp] = useState("");
    const [statusPelapor, setStatusPelapor] = useState("Masyarakat Umum");
    const [layananId, setLayananId] = useState("");
    const [tanggalKejadian, setTanggalKejadian] = useState("");
    const [waktu, setWaktu] = useState("");
    const [detailKejadian, setDetailKejadian] = useState("");
    const [dampak, setDampak] = useState("");
    const [harapan, setHarapan] = useState("");
    const [bersediaDihubungi, setBersediaDihubungi] = useState(true);
    const [buktiFile, setBuktiFile] = useState<File | null>(null);

    // Operational states
    const [layananList, setLayananList] = useState<LayananItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingLayanan, setLoadingLayanan] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [createdId, setCreatedId] = useState<number | null>(null);

    // Fetch layanans on mount
    useEffect(() => {
        const fetchLayanan = async () => {
            const token = localStorage.getItem("agro_token");
            if (!token) {
                setError("Anda harus masuk (login) terlebih dahulu untuk menyampaikan pengaduan.");
                setLoadingLayanan(false);
                return;
            }

            try {
                const response = await fetch(`${API_URL}/layanan`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error("Gagal memuat daftar layanan");
                }

                const data = await response.json();
                setLayananList(data);
                if (data.length > 0) {
                    setLayananId(data[0].id.toString());
                }
            } catch (err: any) {
                console.error("[Fetch Layanan Error]:", err);
                setError("Gagal mengambil data layanan dari server. Pastikan Anda sudah login.");
            } finally {
                setLoadingLayanan(false);
            }
        };

        fetchLayanan();
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            const allowedMimeTypes = ["application/pdf", "image/jpeg", "image/png"];

            if (!allowedMimeTypes.includes(selectedFile.type)) {
                setError("Tipe file bukti harus PDF, JPG, atau PNG!");
                return;
            }
            if (selectedFile.size > 5 * 1024 * 1024) {
                setError("Ukuran file bukti maksimal 5MB!");
                return;
            }

            setError("");
            setBuktiFile(selectedFile);
        }
    };

    const handleRemoveFile = () => {
        setBuktiFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const token = localStorage.getItem("agro_token");
        if (!token) {
            setError("Sesi Anda telah berakhir. Silakan login kembali.");
            setLoading(false);
            return;
        }

        // Validations
        if (!namaPelapor.trim()) {
            setError("Nama Pelapor wajib diisi!");
            setLoading(false);
            return;
        }
        if (!noHp.trim()) {
            setError("Nomor HP wajib diisi!");
            setLoading(false);
            return;
        }
        if (!layananId) {
            setError("Layanan yang dilaporkan wajib dipilih!");
            setLoading(false);
            return;
        }
        if (!tanggalKejadian) {
            setError("Tanggal kejadian wajib diisi!");
            setLoading(false);
            return;
        }
        if (!waktu) {
            setError("Waktu kejadian wajib diisi!");
            setLoading(false);
            return;
        }
        if (!detailKejadian.trim()) {
            setError("Detail kejadian wajib diisi!");
            setLoading(false);
            return;
        }
        if (!dampak.trim()) {
            setError("Dampak yang dirasakan wajib diisi!");
            setLoading(false);
            return;
        }
        if (!harapan.trim()) {
            setError("Harapan terhadap pelaporan wajib diisi!");
            setLoading(false);
            return;
        }

        try {
            const formData = new FormData();
            formData.append("nama_pelapor", namaPelapor.trim());
            formData.append("no_hp", noHp.trim());
            formData.append("status_pelapor", statusPelapor);
            formData.append("layanan_id", layananId);
            formData.append("tanggal_kejadian", tanggalKejadian);
            formData.append("waktu", waktu);
            formData.append("detail_kejadian", detailKejadian.trim());
            formData.append("dampak", dampak.trim());
            formData.append("harapan", harapan.trim());
            formData.append("bersedia_dihubungi", String(bersediaDihubungi));

            if (buktiFile) {
                formData.append("file", buktiFile);
            }

            const response = await fetch(`${API_URL}/pengaduan`, {
                method: "POST",
                body: formData,
            });

            const responseData = await response.json();

            if (!response.ok) {
                let errMsg = "Gagal mengirimkan pengaduan.";
                if (responseData.message) {
                    errMsg = Array.isArray(responseData.message) ? responseData.message.join(", ") : responseData.message;
                }
                throw new Error(errMsg);
            }

            setCreatedId(responseData.id);
            setSuccess(true);
            resetForm();
        } catch (err: any) {
            console.error("[Submit Pengaduan Error]:", err);
            setError(err.message || "Terjadi kesalahan sistem saat mengirimkan pengaduan.");
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setNamaPelapor("");
        setNoHp("");
        setStatusPelapor("Masyarakat Umum");
        setTanggalKejadian("");
        setWaktu("");
        setDetailKejadian("");
        setDampak("");
        setHarapan("");
        setBersediaDihubungi(true);
        setBuktiFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    if (success) {
        return (
            <div className="p-6 text-center space-y-4">
                <div className="flex justify-center">
                    <CheckCircle2 className="w-16 h-16 text-emerald-500 animate-bounce" />
                </div>
                <h3 className="text-xl font-extrabold text-zinc-900 dark:text-white">
                    Pengaduan Berhasil Dikirim!
                </h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Terima kasih atas laporan Anda. Laporan pengaduan Anda telah kami terima dan akan segera diproses oleh tim layanan pengaduan.
                </p>
                <div className="pt-4">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-[var(--green-color)] hover:bg-emerald-650 text-white rounded-xl text-sm font-bold shadow-md transition"
                    >
                        Tutup
                    </button>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5 max-h-[75vh] overflow-y-auto px-1">
            {error && (
                <div className="rounded-xl bg-red-50 p-4 text-xs sm:text-sm text-red-700 dark:bg-red-950/45 dark:text-red-400 border border-red-200 dark:border-red-900/40 flex items-start gap-3 shadow-sm transition duration-300">
                    <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <div>
                        <span className="font-bold">Gagal Mengajukan:</span>
                        <p className="mt-1 text-red-650 dark:text-red-400">{error}</p>
                    </div>
                </div>
            )}

            {/* Nama & No HP */}
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                    <label htmlFor="namaPelapor" className="block text-xs sm:text-sm font-bold text-zinc-700 dark:text-zinc-300">
                        Nama Pelapor <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-500">
                            <User className="h-4 w-4" />
                        </span>
                        <input
                            id="namaPelapor"
                            type="text"
                            required
                            disabled={loading || loadingLayanan}
                            value={namaPelapor}
                            onChange={(e) => setNamaPelapor(e.target.value)}
                            className="block w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 pl-9 pr-3 py-2 text-xs sm:text-sm text-zinc-900 dark:text-white placeholder-zinc-400 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            placeholder="Masukkan nama Anda"
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label htmlFor="noHp" className="block text-xs sm:text-sm font-bold text-zinc-700 dark:text-zinc-300">
                        Nomor HP / WhatsApp <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-500">
                            <Phone className="h-4 w-4" />
                        </span>
                        <input
                            id="noHp"
                            type="text"
                            required
                            disabled={loading || loadingLayanan}
                            value={noHp}
                            onChange={(e) => setNoHp(e.target.value)}
                            className="block w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 pl-9 pr-3 py-2 text-xs sm:text-sm text-zinc-900 dark:text-white placeholder-zinc-400 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            placeholder="Contoh: 08123456789"
                        />
                    </div>
                </div>
            </div>

            {/* Status Pelapor & Layanan */}
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                    <label htmlFor="statusPelapor" className="block text-xs sm:text-sm font-bold text-zinc-700 dark:text-zinc-300">
                        Status Pelapor <span className="text-red-500">*</span>
                    </label>
                    <select
                        id="statusPelapor"
                        disabled={loading || loadingLayanan}
                        value={statusPelapor}
                        onChange={(e) => setStatusPelapor(e.target.value)}
                        className="block w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-xs sm:text-sm text-zinc-900 dark:text-white shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                        <option value="Masyarakat Umum">Masyarakat Umum</option>
                        <option value="Pengguna Layanan">Pengguna Layanan</option>
                        <option value="Mitra Kerja">Mitra Kerja</option>
                        <option value="Pegawai Internal">Pegawai Internal</option>
                    </select>
                </div>

                <div className="space-y-1.5">
                    <label htmlFor="layananId" className="block text-xs sm:text-sm font-bold text-zinc-700 dark:text-zinc-300">
                        Layanan yang Dilaporkan <span className="text-red-500">*</span>
                    </label>
                    <select
                        id="layananId"
                        required
                        disabled={loading || loadingLayanan}
                        value={layananId}
                        onChange={(e) => setLayananId(e.target.value)}
                        className="block w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-xs sm:text-sm text-zinc-900 dark:text-white shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                        {loadingLayanan ? (
                            <option>Memuat layanan...</option>
                        ) : (
                            layananList.map((item) => (
                                <option key={item.id} value={item.id}>
                                    {item.nama_layanan}
                                </option>
                            ))
                        )}
                    </select>
                </div>
            </div>

            {/* Tanggal & Waktu Kejadian */}
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                    <label htmlFor="tanggalKejadian" className="block text-xs sm:text-sm font-bold text-zinc-700 dark:text-zinc-300">
                        Tanggal Kejadian <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-500">
                            <Calendar className="h-4 w-4" />
                        </span>
                        <input
                            id="tanggalKejadian"
                            type="date"
                            required
                            disabled={loading || loadingLayanan}
                            value={tanggalKejadian}
                            onChange={(e) => setTanggalKejadian(e.target.value)}
                            className="block w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 pl-9 pr-3 py-2 text-xs sm:text-sm text-zinc-900 dark:text-white shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label htmlFor="waktu" className="block text-xs sm:text-sm font-bold text-zinc-700 dark:text-zinc-300">
                        Waktu Kejadian <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-500">
                            <Clock className="h-4 w-4" />
                        </span>
                        <input
                            id="waktu"
                            type="time"
                            required
                            disabled={loading || loadingLayanan}
                            value={waktu}
                            onChange={(e) => setWaktu(e.target.value)}
                            className="block w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 pl-9 pr-3 py-2 text-xs sm:text-sm text-zinc-900 dark:text-white shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                    </div>
                </div>
            </div>

            {/* Detail Kejadian */}
            <div className="space-y-1.5">
                <label htmlFor="detailKejadian" className="block text-xs sm:text-sm font-bold text-zinc-700 dark:text-zinc-300">
                    Detail Kejadian <span className="text-red-500">*</span>
                </label>
                <textarea
                    id="detailKejadian"
                    required
                    rows={3}
                    disabled={loading || loadingLayanan}
                    value={detailKejadian}
                    onChange={(e) => setDetailKejadian(e.target.value)}
                    className="block w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3.5 py-2 text-xs sm:text-sm text-zinc-900 dark:text-white placeholder-zinc-400 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
                    placeholder="Jelaskan kronologi kejadian secara rinci..."
                />
            </div>

            {/* Dampak yang Dirasakan */}
            <div className="space-y-1.5">
                <label htmlFor="dampak" className="block text-xs sm:text-sm font-bold text-zinc-700 dark:text-zinc-300">
                    Dampak yang Dirasakan <span className="text-red-500">*</span>
                </label>
                <textarea
                    id="dampak"
                    required
                    rows={3}
                    disabled={loading || loadingLayanan}
                    value={dampak}
                    onChange={(e) => setDampak(e.target.value)}
                    className="block w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3.5 py-2 text-xs sm:text-sm text-zinc-900 dark:text-white placeholder-zinc-400 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
                    placeholder="Apa dampak merugikan yang Anda rasakan?"
                />
            </div>

            {/* Harapan Pelaporan */}
            <div className="space-y-1.5">
                <label htmlFor="harapan" className="block text-xs sm:text-sm font-bold text-zinc-700 dark:text-zinc-300">
                    Harapan Terhadap Tindak Lanjut Pelaporan <span className="text-red-500">*</span>
                </label>
                <textarea
                    id="harapan"
                    required
                    rows={2}
                    disabled={loading || loadingLayanan}
                    value={harapan}
                    onChange={(e) => setHarapan(e.target.value)}
                    className="block w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3.5 py-2 text-xs sm:text-sm text-zinc-900 dark:text-white placeholder-zinc-400 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
                    placeholder="Apa harapan Anda setelah menyampaikan laporan ini?"
                />
            </div>

            {/* Bukti Pendukung (Opsional) */}
            <div className="space-y-1.5">
                <label className="block text-xs sm:text-sm font-bold text-zinc-700 dark:text-zinc-300">
                    Bukti Pendukung <span className="text-xs text-zinc-450 font-normal">(opsional)</span>
                </label>

                {!buktiFile ? (
                    <div className="mt-1 flex justify-center px-4 py-4 border-2 border-dashed border-zinc-300 dark:border-zinc-800 rounded-xl hover:border-emerald-500 dark:hover:border-emerald-500/50 hover:bg-emerald-50/10 dark:hover:bg-emerald-950/5 transition cursor-pointer">
                        <div className="space-y-1 text-center flex flex-col items-center">
                            <FileUp className="mx-auto h-8 w-8 text-zinc-450 dark:text-zinc-650" />
                            <div className="flex text-xs text-zinc-600 dark:text-zinc-450 justify-center">
                                <label
                                    htmlFor="bukti-file-upload"
                                    className="relative cursor-pointer rounded-md font-bold text-[var(--green-color)] dark:text-emerald-400 hover:text-emerald-500 focus-within:outline-none"
                                >
                                    <span>Pilih berkas</span>
                                    <input
                                        id="bukti-file-upload"
                                        name="bukti-file-upload"
                                        type="file"
                                        ref={fileInputRef}
                                        className="sr-only"
                                        accept=".pdf,image/jpeg,image/png"
                                        disabled={loading || loadingLayanan}
                                        onChange={handleFileChange}
                                    />
                                </label>
                                <p className="pl-1">atau seret ke sini</p>
                            </div>
                            <p className="text-[10px] text-zinc-400 dark:text-zinc-550">
                                PDF, JPG, atau PNG (Maks. 5MB)
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-between p-2.5 bg-emerald-50/30 dark:bg-emerald-950/10 border border-emerald-200/50 dark:border-emerald-900/30 rounded-xl">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-emerald-100 dark:bg-emerald-950 rounded-lg text-emerald-600 dark:text-emerald-400">
                                <FileText className="w-4 h-4" />
                            </div>
                            <div className="max-w-[180px] sm:max-w-[350px] truncate">
                                <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate">{buktiFile.name}</p>
                                <p className="text-[10px] text-zinc-400">{(buktiFile.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            disabled={loading}
                            onClick={handleRemoveFile}
                            className="p-1 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition"
                            title="Hapus berkas"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>

            {/* Bersedia dihubungi */}
            <div className="space-y-1.5 bg-zinc-50 dark:bg-zinc-950/40 p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800/80">
                <span className="block text-xs sm:text-sm font-bold text-zinc-700 dark:text-zinc-300">
                    Apakah Anda bersedia dihubungi untuk klarifikasi lebih lanjut? <span className="text-red-500">*</span>
                </span>
                <div className="flex items-center gap-6 mt-2">
                    <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-300 cursor-pointer">
                        <input
                            type="radio"
                            name="bersediaDihubungi"
                            checked={bersediaDihubungi === true}
                            onChange={() => setBersediaDihubungi(true)}
                            disabled={loading}
                            className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-zinc-300"
                        />
                        Ya, bersedia
                    </label>
                    <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-300 cursor-pointer">
                        <input
                            type="radio"
                            name="bersediaDihubungi"
                            checked={bersediaDihubungi === false}
                            onChange={() => setBersediaDihubungi(false)}
                            disabled={loading}
                            className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-zinc-300"
                        />
                        Tidak
                    </label>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                <button
                    type="button"
                    onClick={onClose}
                    disabled={loading}
                    className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 rounded-xl text-xs sm:text-sm font-bold transition disabled:opacity-50"
                >
                    Batal
                </button>
                <button
                    type="submit"
                    disabled={loading || loadingLayanan}
                    className="px-5 py-2 bg-[var(--green-color)] hover:bg-emerald-650 text-white rounded-xl text-xs sm:text-sm font-extrabold shadow-md transition disabled:opacity-50"
                >
                    Kirim Pengaduan
                </button>
            </div>
        </form>
    );
}
