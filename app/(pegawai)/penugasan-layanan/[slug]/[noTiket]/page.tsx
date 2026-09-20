"use client";

import React, { use, useEffect, useState } from "react";
import Sidebar from "@/components/sidebar/Sidebar";
import AppBar from "@/components/appbar/AppBar";
import BillingModal from "@/components/modal/BillingModal";
import ConfirmPenugasanModal from "@/components/modal/ConfirmPenugasanModal";
import SuccessModal from "@/components/modal/SuccessModal";
import ErrorModal from "@/components/modal/ErrorModal";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getTiketDetail, mulaiProsesTiket, selesaiProsesTiket, terimaTiket, uploadLaporanHasil, uploadSertifikat, uploadSuratPenerimaan, uploadBeritaAcara, tandaiDipinjamTiket, deleteDokumen } from "@/lib/tiket";
import StatusLayananBadge from "@/components/badge/status-layanan/StatusLayananBadge";
import StatusPembayaranBadge from "@/components/badge/status-pembayaran/StatusPembayaranBadge";
import { getApiUrl } from "@/lib/api";
import {
    ChevronLeft,
    CheckCircle,
    CheckCircle2,
    User,
    FileText,
    Download,
    CreditCard,
    Database,
    Clock,
    Play,
    Calendar,
    UploadCloud,
    CloudUpload,
    AlertCircle,
    Info,
    File,
    X,
    ExternalLink,
    Award
} from "lucide-react";

interface PageProps {
    params: Promise<{
        slug: string;
        noTiket: string;
    }>;
}

export default function PegawaiDetailPenugasanPage({ params }: PageProps) {
    const resolvedParams = use(params);
    const router = useRouter();

    const [tiket, setTiket] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Modal state for billing
    const [billingModalOpen, setBillingModalOpen] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
    const [confirmationType, setConfirmationType] = useState<"mulai" | "selesai" | "terima" | null>(null);

    const [successModalOpen, setSuccessModalOpen] = useState(false);
    const [errorModalOpen, setErrorModalOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    // Upload Laporan Hasil State
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);

    // Upload Surat Penerimaan State (Khusus Magang / PKL)
    const [selectedSuratPenerimaanFile, setSelectedSuratPenerimaanFile] = useState<File | null>(null);
    const [uploadingSuratPenerimaan, setUploadingSuratPenerimaan] = useState(false);
    const [uploadSuratPenerimaanSuccess, setUploadSuratPenerimaanSuccess] = useState(false);

    // Upload Sertifikat State (Khusus Magang / PKL)
    const [selectedSertifikatFile, setSelectedSertifikatFile] = useState<File | null>(null);
    const [uploadingSertifikat, setUploadingSertifikat] = useState(false);
    const [uploadSertifikatSuccess, setUploadSertifikatSuccess] = useState(false);
    const [alatMaster, setAlatMaster] = useState<any[]>([]);

    // Delete Document State
    const [deleteDocModalOpen, setDeleteDocModalOpen] = useState(false);
    const [docToDelete, setDocToDelete] = useState<{ id: number; name: string; type: string } | null>(null);
    const [deletingDoc, setDeletingDoc] = useState(false);

    const fetchTiket = async () => {
        setLoading(true);
        try {
            const data = await getTiketDetail(resolvedParams.noTiket);
            setTiket(data);
            setError(null);
        } catch (err: any) {
            console.error(err);
            setError("Gagal mengambil data detail tiket.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTiket();
        const token = typeof window !== "undefined" ? localStorage.getItem("agro_token") : null;
        if (token) {
            fetch(`${getApiUrl()}/alat`, {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then((res) => res.json())
                .then((data) => {
                    if (Array.isArray(data)) setAlatMaster(data);
                })
                .catch(() => { });
        }
    }, [resolvedParams.noTiket]);

    const handleMulaiProses = async () => {
        if (!tiket) return;
        const biaya = tiket.layanan.biaya;

        if (biaya && biaya.tipe === "per_satuan") {
            setBillingModalOpen(true);
        } else {
            setConfirmationType("mulai");
            setConfirmationModalOpen(true);
        }
    };

    const confirmMulaiProses = async () => {
        if (!tiket) return;

        setActionLoading(true);

        try {
            await mulaiProsesTiket(tiket.id);

            setConfirmationModalOpen(false);
            setConfirmationType(null);

            setSuccessMessage("Tiket berhasil diproses.");
            setSuccessModalOpen(true);

            await fetchTiket();
        } catch (err: any) {
            setConfirmationModalOpen(false);
            setConfirmationType(null);

            setErrorMessage(err.message || "Gagal memproses tiket");
            setErrorModalOpen(true);
        } finally {
            setActionLoading(false);
        }
    };

    const submitBilling = async (jumlahSatuan: number) => {
        if (!tiket) return;

        setActionLoading(true);

        try {
            await mulaiProsesTiket(tiket.id, jumlahSatuan);

            setBillingModalOpen(false);

            setSuccessMessage(
                "Tagihan berhasil dibuat dan tiket sedang menunggu pembayaran pengguna."
            );
            setSuccessModalOpen(true);

            await fetchTiket();
        } catch (err: any) {
            setBillingModalOpen(false);

            setErrorMessage(err.message || "Gagal memproses tagihan");
            setErrorModalOpen(true);
        } finally {
            setActionLoading(false);
        }
    };

    const handleTerimaMagang = () => {
        if (!tiket) return;
        const hasSurat = tiket.dokumen?.some(
            (d: any) => d.tipe === "Surat Penerimaan" || d.tipe?.toLowerCase().includes("surat_penerimaan") || d.tipe?.toLowerCase().includes("penerimaan")
        );
        if (!hasSurat) {
            setErrorMessage("Harap unggah Surat Penerimaan terlebih dahulu sebelum menerima permohonan magang.");
            setErrorModalOpen(true);
            return;
        }
        setConfirmationType("terima");
        setConfirmationModalOpen(true);
    };

    const confirmTerimaMagang = async () => {
        if (!tiket) return;

        setActionLoading(true);

        try {
            await terimaTiket(tiket.id);

            setConfirmationModalOpen(false);
            setConfirmationType(null);

            setSuccessMessage("Permohonan magang berhasil diterima dan Surat Penerimaan telah dikirim ke pemohon.");
            setSuccessModalOpen(true);

            await fetchTiket();
        } catch (err: any) {
            setConfirmationModalOpen(false);
            setConfirmationType(null);

            setErrorMessage(err.message || "Gagal menerima permohonan magang");
            setErrorModalOpen(true);
        } finally {
            setActionLoading(false);
        }
    };

    const handleSelesaiProses = () => {
        if (!tiket) return;

        const isMagangTiket =
            tiket.layanan?.slug === "magang-pkl" ||
            resolvedParams.slug === "magang-pkl" ||
            tiket.layanan?.nama_layanan?.toLowerCase().includes("magang") ||
            tiket.layanan?.nama_layanan?.toLowerCase().includes("pkl");

        const isPeminjamanAlatTiket =
            tiket.layanan?.slug === "peminjaman-alat" ||
            resolvedParams.slug === "peminjaman-alat" ||
            tiket.layanan?.nama_layanan?.toLowerCase().includes("peminjaman alat");

        if (isMagangTiket) {
            const hasSertifikat = tiket.dokumen?.some((d: any) => d.tipe === "Sertifikat" || d.tipe?.toLowerCase().includes("sertifikat"));
            const hasLaporan = tiket.dokumen?.some((d: any) => d.tipe === "Laporan Hasil" || d.tipe === "laporan_hasil");
            if (!hasSertifikat && !hasLaporan) {
                setErrorMessage("Harap unggah Sertifikat Magang atau Laporan Hasil terlebih dahulu sebelum menandai selesai penugasan.");
                setErrorModalOpen(true);
                return;
            }
        }

        if (isPeminjamanAlatTiket) {
            if (tiket.status !== "dipinjam") {
                setErrorMessage("Tiket peminjaman alat harus berstatus 'dipinjam' dan Berita Acara telah diunggah sebelum dapat ditandai selesai.");
                setErrorModalOpen(true);
                return;
            }
        }

        setConfirmationType("selesai");
        setConfirmationModalOpen(true);
    };

    const handleTandaiDipinjam = async () => {
        if (!tiket) return;
        const hasBeritaAcara = tiket.dokumen?.some(
            (d: any) => d.tipe === "Berita Acara" || d.tipe?.toLowerCase().includes("berita_acara") || d.tipe?.toLowerCase().includes("berita acara")
        );
        if (!hasBeritaAcara) {
            setErrorMessage("Harap unggah Berita Acara Serah Terima Alat terlebih dahulu sebelum mengubah status menjadi Dipinjam.");
            setErrorModalOpen(true);
            return;
        }

        setActionLoading(true);
        try {
            await tandaiDipinjamTiket(tiket.id);
            setSuccessMessage("Alat berhasil diserahterimakan dan status permohonan telah diubah menjadi Dipinjam.");
            setSuccessModalOpen(true);
            await fetchTiket();
        } catch (err: any) {
            setErrorMessage(err.message || "Gagal mengubah status menjadi dipinjam");
            setErrorModalOpen(true);
        } finally {
            setActionLoading(false);
        }
    };

    const confirmSelesaiProses = async () => {
        if (!tiket) return;

        setActionLoading(true);

        try {
            await selesaiProsesTiket(tiket.id);

            setConfirmationModalOpen(false);
            setConfirmationType(null);

            const successText = isPeminjamanAlat
                ? "Pengembalian alat berhasil dikonfirmasi. Layanan peminjaman selesai dan stok alat telah dikembalikan."
                : "Layanan selesai dan status tiket berhasil diperbarui.";
            setSuccessMessage(successText);
            setSuccessModalOpen(true);

            await fetchTiket();
        } catch (err: any) {
            setConfirmationModalOpen(false);
            setConfirmationType(null);

            setErrorMessage(err.message || "Gagal memperbarui status tiket");
            setErrorModalOpen(true);
        } finally {
            setActionLoading(false);
        }
    };

    const handleAutoUpload = async (file: File) => {
        if (!file || !tiket) return;

        setUploading(true);
        setSelectedFile(file);

        try {
            await uploadLaporanHasil(tiket.id, file);

            setSelectedFile(null);
            setUploadSuccess(true);

            setSuccessMessage("Laporan hasil berhasil diunggah.");
            setSuccessModalOpen(true);

            await fetchTiket();

            setTimeout(() => setUploadSuccess(false), 4000);
        } catch (err: any) {
            setErrorMessage(err.message || "Gagal mengunggah laporan hasil");
            setErrorModalOpen(true);
            setSelectedFile(null);
        } finally {
            setUploading(false);
        }
    };

    const handleAutoUploadBeritaAcara = async (file: File) => {
        if (!file || !tiket) return;

        setUploading(true);
        setSelectedFile(file);

        try {
            await uploadBeritaAcara(tiket.id, file);

            setSelectedFile(null);
            setUploadSuccess(true);

            setSuccessMessage("Berita Acara berhasil diunggah dan status permohonan otomatis berubah menjadi Dipinjam.");
            setSuccessModalOpen(true);

            await fetchTiket();

            setTimeout(() => setUploadSuccess(false), 4000);
        } catch (err: any) {
            setErrorMessage(err.message || "Gagal mengunggah Berita Acara");
            setErrorModalOpen(true);
            setSelectedFile(null);
        } finally {
            setUploading(false);
        }
    };

    const handleAutoUploadSuratPenerimaan = async (file: File) => {
        if (!file || !tiket) return;

        setUploadingSuratPenerimaan(true);
        setSelectedSuratPenerimaanFile(file);

        try {
            await uploadSuratPenerimaan(tiket.id, file);

            setSelectedSuratPenerimaanFile(null);
            setUploadSuratPenerimaanSuccess(true);

            setSuccessMessage("Surat penerimaan berhasil diunggah.");
            setSuccessModalOpen(true);

            await fetchTiket();

            setTimeout(() => setUploadSuratPenerimaanSuccess(false), 4000);
        } catch (err: any) {
            setErrorMessage(err.message || "Gagal mengunggah surat penerimaan");
            setErrorModalOpen(true);
            setSelectedSuratPenerimaanFile(null);
        } finally {
            setUploadingSuratPenerimaan(false);
        }
    };

    const handleAutoUploadSertifikat = async (file: File) => {
        if (!file || !tiket) return;

        setUploadingSertifikat(true);
        setSelectedSertifikatFile(file);

        try {
            await uploadSertifikat(tiket.id, file);

            setSelectedSertifikatFile(null);
            setUploadSertifikatSuccess(true);

            setSuccessMessage("Sertifikat magang berhasil diunggah.");
            setSuccessModalOpen(true);

            await fetchTiket();

            setTimeout(() => setUploadSertifikatSuccess(false), 4000);
        } catch (err: any) {
            setErrorMessage(err.message || "Gagal mengunggah sertifikat magang");
            setErrorModalOpen(true);
            setSelectedSertifikatFile(null);
        } finally {
            setUploadingSertifikat(false);
        }
    };

    const handleDeleteDocClick = (fileItem: any, typeName: string) => {
        if ((tiket?.status || "").toLowerCase() === "selesai") {
            setErrorMessage("Dokumen tidak dapat dihapus karena penugasan layanan telah selesai.");
            setErrorModalOpen(true);
            return;
        }
        const fileName = fileItem.nama_file || (fileItem.file_url ? fileItem.file_url.split("/").pop() : (fileItem.url_storage ? fileItem.url_storage.split("/").pop() : typeName));
        setDocToDelete({ id: fileItem.id, name: fileName, type: typeName });
        setDeleteDocModalOpen(true);
    };

    const confirmDeleteDoc = async () => {
        if (!docToDelete || !tiket) return;
        if ((tiket?.status || "").toLowerCase() === "selesai") {
            setDeleteDocModalOpen(false);
            setDocToDelete(null);
            setErrorMessage("Dokumen tidak dapat dihapus karena penugasan layanan telah selesai.");
            setErrorModalOpen(true);
            return;
        }
        setDeletingDoc(true);
        try {
            await deleteDokumen(tiket.id, docToDelete.id);
            setDeleteDocModalOpen(false);
            setDocToDelete(null);
            setSuccessMessage(`Dokumen ${docToDelete.type} berhasil dihapus.`);
            setSuccessModalOpen(true);
            await fetchTiket();
        } catch (err: any) {
            setDeleteDocModalOpen(false);
            setDocToDelete(null);
            setErrorMessage(err.message || "Gagal menghapus dokumen");
            setErrorModalOpen(true);
        } finally {
            setDeletingDoc(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950">
                <Sidebar />
                <div className="flex flex-col flex-1">
                    <AppBar />
                    <div className="flex flex-1 items-center justify-center">
                        <div className="h-10 w-10 animate-spin rounded-full border-4 border-secondary-green-color border-t-transparent"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !tiket) {
        return (
            <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950">
                <Sidebar />
                <div className="flex flex-col flex-1">
                    <AppBar />
                    <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
                        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                        <h2 className="text-xl font-bold">{error || "Tiket tidak ditemukan"}</h2>
                        <button
                            onClick={() => router.push(`/penugasan-layanan/${resolvedParams.slug}`)}
                            className="mt-4 px-4 py-2 bg-secondary-green-color text-white rounded-lg hover:bg-green-color/90"
                        >
                            Kembali ke Daftar Tiket
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const { layanan, user, jawaban_form, transaksi, tagihan, hasil_layanan, dokumen, log_status } = tiket;
    const isPerSatuan = layanan.biaya?.tipe === "per_satuan";
    const paymentInfo = tagihan || transaksi;
    const isPeminjamanAlat =
        layanan?.id === 19 ||
        layanan?.slug === "peminjaman-alat" ||
        resolvedParams.slug === "peminjaman-alat" ||
        layanan?.nama_layanan?.toLowerCase().includes("peminjaman alat") ||
        layanan?.nama?.toLowerCase().includes("peminjaman alat");
    const isMagang =
        layanan?.slug === "magang-pkl" ||
        resolvedParams.slug === "magang-pkl" ||
        layanan?.nama_layanan?.toLowerCase().includes("magang") ||
        layanan?.nama_layanan?.toLowerCase().includes("pkl");
    const isLunas = paymentInfo?.status_bayar === "lunas" || paymentInfo?.status === "lunas" || paymentInfo?.status === "berhasil";

    // Peminjaman Alat duration & items calculation
    let durationDays = 1;
    const periode = jawaban_form?.periode_peminjaman || "";
    if (periode.includes(" s.d. ")) {
        try {
            const [startStr, endStr] = periode.split(" s.d. ");
            const start = new Date(startStr);
            const end = new Date(endStr);
            const diffTime = Math.abs(end.getTime() - start.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            durationDays = isNaN(diffDays) ? 1 : Math.max(1, diffDays);
        } catch {
            durationDays = 1;
        }
    }

    const selectedAlatList: any[] = Array.isArray(jawaban_form?.selected_alat_list)
        ? jawaban_form.selected_alat_list
        : (typeof jawaban_form?.selected_alat_list === "string"
            ? (() => { try { return JSON.parse(jawaban_form.selected_alat_list); } catch { return []; } })()
            : []);

    let totalEstimasi = 0;
    selectedAlatList.forEach((tool: any) => {
        const units = Number(tool.units || tool.jumlah || 1);
        const price = Number(tool.price || tool.harga || 0);
        totalEstimasi += price * units * durationDays;
    });

    const commonFields = [
        "nama_lengkap",
        "nama",
        "nip_ktp",
        "alamat_instansi",
        "asal_instansi",
        "instansi",
        "no_telp",
        "no_telepon",
        "telepon",
        "email",
        "tanggal_pengajuan",
    ];

    // Dokumen lampiran pemohon (surat permohonan, proposal, dll)
    const lampiranDocs = (dokumen && dokumen.length > 0)
        ? dokumen.filter((d: any) => {
            const tipe = (d.tipe || "").toLowerCase();
            return tipe !== "laporan hasil" && tipe !== "laporan_hasil" && !tipe.includes("sertifikat") && !tipe.includes("penerimaan") && !tipe.includes("berita");
        })
        : [];

    // Dokumen Berita Acara khusus Peminjaman Alat
    const listDokumenBeritaAcara = (dokumen && dokumen.length > 0)
        ? dokumen.filter((d: any) => d.tipe === "Berita Acara" || d.tipe?.toLowerCase().includes("berita_acara") || d.tipe?.toLowerCase().includes("berita acara"))
        : [];
    const hasUploadedBeritaAcara = listDokumenBeritaAcara.length > 0;

    // Dokumen surat penerimaan khusus magang
    const listDokumenSuratPenerimaan = (dokumen && dokumen.length > 0)
        ? dokumen.filter((d: any) => d.tipe === "Surat Penerimaan" || d.tipe?.toLowerCase().includes("surat_penerimaan") || d.tipe?.toLowerCase().includes("penerimaan"))
        : [];
    const hasUploadedSuratPenerimaan = listDokumenSuratPenerimaan.length > 0;

    // Dokumen hasil/berita acara dari tiket (mendukung tiket.dokumen maupun tiket.hasil_layanan)
    const listDokumenHasil = isPeminjamanAlat
        ? listDokumenBeritaAcara
        : ((dokumen && dokumen.length > 0)
            ? dokumen.filter((d: any) => (d.tipe === "Laporan Hasil" || d.tipe === "laporan_hasil" || !d.tipe) && !d.tipe?.toLowerCase().includes("sertifikat") && !d.tipe?.toLowerCase().includes("penerimaan") && !d.tipe?.toLowerCase().includes("berita"))
            : (hasil_layanan || []));
    const hasUploadedDokumen = listDokumenHasil.length > 0;

    // Dokumen sertifikat khusus magang
    const listDokumenSertifikat = (dokumen && dokumen.length > 0)
        ? dokumen.filter((d: any) => d.tipe === "Sertifikat" || d.tipe?.toLowerCase().includes("sertifikat"))
        : [];
    const hasUploadedSertifikat = listDokumenSertifikat.length > 0;

    const isSelesai = (tiket?.status || "").toLowerCase() === "selesai";
    const isDiterima = (tiket?.status || "").toLowerCase() === "diterima";
    const isDipinjam = (tiket?.status || "").toLowerCase() === "dipinjam";

    const renderInformasiPemohon = () => (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:bg-zinc-900 dark:border-zinc-800 space-y-4">
            <h3 className="text-base text-green-color font-bold flex items-center gap-2 border-b border-zinc-300 pb-3 dark:border-zinc-800">
                Informasi Pemohon
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                    <span className="text-zinc-500 block text-xs">Nama Lengkap</span>
                    <span className="font-semibold text-zinc-900 dark:text-white">
                        {jawaban_form?.nama_lengkap || jawaban_form?.nama || user?.nama || "-"}
                    </span>
                </div>
                <div className="space-y-1">
                    <span className="text-zinc-500 block text-xs">Email</span>
                    <span className="font-semibold text-zinc-900 dark:text-white">
                        {user?.email || jawaban_form?.email || "-"}
                    </span>
                </div>
                <div className="space-y-1">
                    <span className="text-zinc-500 block text-xs">NIP / No. KTP</span>
                    <span className="font-semibold text-zinc-900 dark:text-white">
                        {jawaban_form?.nip_ktp || user?.nip || "-"}
                    </span>
                </div>
                <div className="space-y-1">
                    <span className="text-zinc-500 block text-xs">Nomor Telepon / WhatsApp</span>
                    <span className="font-semibold text-zinc-900 dark:text-white">
                        {jawaban_form?.no_telp || jawaban_form?.no_telepon || jawaban_form?.telepon || user?.no_hp || "-"}
                    </span>
                </div>
                <div className="space-y-1 sm:col-span-2">
                    <span className="text-zinc-500 block text-xs">Alamat Instansi / Asal</span>
                    <span className="font-semibold text-zinc-900 dark:text-white">
                        {jawaban_form?.alamat_instansi || jawaban_form?.asal_instansi || jawaban_form?.instansi || user?.instansi || user?.alamat || "-"}
                    </span>
                </div>
            </div>
        </div>
    );

    const renderDataPengajuanLayanan = (isSidebar: boolean = false) => (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:bg-zinc-900 dark:border-zinc-800 space-y-5">
            <h3 className="text-base text-green-color font-bold flex items-center gap-2 border-b border-zinc-300 pb-3 dark:border-zinc-800">
                Detail Pengajuan Layanan
            </h3>

            <div className="space-y-5 text-sm">
                <div className={isSidebar ? "grid grid-cols-1 gap-4" : "grid grid-cols-1 sm:grid-cols-2 gap-4"}>
                    <div className="space-y-1">
                        <span className="text-zinc-500 block text-xs">Nama Layanan</span>
                        <span className="font-semibold text-zinc-900 dark:text-white">
                            {tiket.layanan?.nama_layanan || tiket.layanan?.nama || "-"}
                        </span>
                    </div>
                    <div className="space-y-1">
                        <span className="text-zinc-500 block text-xs">Tanggal Pengajuan</span>
                        <span className="font-semibold text-zinc-900 dark:text-white">
                            {tiket.tanggal_submit
                                ? new Date(tiket.tanggal_submit).toLocaleDateString("id-ID", {
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                })
                                : "-"}
                        </span>
                    </div>
                </div>

                {/* Custom answers */}
                {jawaban_form && Object.keys(jawaban_form).length > 0 ? (
                    <div className={isSidebar ? "grid grid-cols-1 gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-800" : "grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-800"}>
                        {Object.entries(jawaban_form).map(([key, value]) => {
                            if (commonFields.includes(key)) return null;
                            if (isPeminjamanAlat && (key === "jenis_alat" || key === "selected_alat_list" || key === "total_estimasi")) {
                                return null;
                            }

                            // format label
                            const label = key
                                .replace(/_/g, " ")
                                .replace(/\b\w/g, (c) => c.toUpperCase());

                            const isFileUrl = typeof value === "string" && (
                                value.startsWith("http") ||
                                value.endsWith(".pdf") ||
                                value.endsWith(".png") ||
                                value.endsWith(".jpg") ||
                                value.endsWith(".jpeg")
                            );

                            return (
                                <div key={key} className="space-y-1">
                                    <span className="text-zinc-500 block text-xs">{label}</span>
                                    {isFileUrl ? (
                                        <a
                                            href={value as string}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center gap-1.5 text-xs text-[var(--green-color)] font-semibold hover:underline"
                                        >
                                            <Download className="h-3.5 w-3.5" />
                                            Lihat Dokumen Terlampir
                                        </a>
                                    ) : (
                                        <div className="font-semibold text-zinc-900 dark:text-zinc-100 whitespace-pre-line leading-relaxed">
                                            {typeof value === "object" && value !== null
                                                ? JSON.stringify(value, null, 2)
                                                : (value ? String(value) : "-")}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p className="text-xs text-zinc-500 italic">Tidak ada data formulir tambahan.</p>
                )}
            </div>
        </div>
    );

    const renderDokumenLampiranContent = (isGrid: boolean = false) => (
        <>
            {lampiranDocs.length > 0 ? (
                <div className={isGrid && lampiranDocs.length > 1 ? "grid grid-cols-1 md:grid-cols-2 gap-3" : "space-y-3"}>
                    {lampiranDocs.map((doc: any) => (
                        <div
                            key={doc.id}
                            className="group flex items-center justify-between p-3 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/30 hover:bg-white dark:hover:bg-zinc-850 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all gap-3 min-w-0 shadow-2xs"
                        >
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary-green-color text-green-color dark:bg-secondary-green-color/20 dark:text-secondary-green-color">
                                    <FileText className="h-4.5 w-4.5" />
                                </div>
                                <div className="flex flex-col text-left min-w-0 flex-1">
                                    <span
                                        className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-green-color transition-colors"
                                        title={doc.nama_file || "Dokumen"}
                                    >
                                        {doc.nama_file || "Dokumen Lampiran"}
                                    </span>
                                    <span className="text-[11px] text-zinc-500 capitalize truncate">
                                        {doc.tipe?.replace(/_/g, " ") || "Lampiran"}
                                    </span>
                                </div>
                            </div>
                            <a
                                href={doc.url_storage}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-green-color hover:border-green-color transition shrink-0 cursor-pointer shadow-2xs"
                            >
                                <Download className="h-3.5 w-3.5" />
                                <span>Unduh</span>
                            </a>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-6 px-4 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/20 text-center space-y-1">
                    <File className="h-7 w-7 text-zinc-400 dark:text-zinc-600 mb-1" />
                    <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                        Tidak ada dokumen lampiran
                    </p>
                    <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
                        Pemohon tidak mengunggah berkas tambahan.
                    </p>
                </div>
            )}
        </>
    );

    const renderCardDokumenLampiran = (isGrid: boolean = false) => (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:bg-zinc-900 dark:border-zinc-800 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-300 pb-3 dark:border-zinc-800">
                <h3 className="text-base whitespace-nowrap  text-green-color font-bold flex items-center gap-2">
                    Lampiran Pemohon
                </h3>
                {lampiranDocs.length > 0 && (
                    <span className="text-xs whitespace-nowrap font-semibold px-2.5 py-0.5 rounded-full bg-secondary-green-color text-green-color dark:bg-secondary-green-color/20 dark:text-secondary-green-color">
                        {lampiranDocs.length} Berkas
                    </span>
                )}
            </div>
            {renderDokumenLampiranContent(isGrid)}
        </div>
    );

    const renderCardBiayaTransaksi = () => (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:bg-zinc-900 dark:border-zinc-800 space-y-4">
            <h3 className="text-base font-bold text-green-color flex items-center gap-2 border-b border-zinc-300 pb-3 dark:border-zinc-800">
                Informasi Biaya & Transaksi
            </h3>

            <div className="space-y-3 text-sm">
                {paymentInfo ? (
                    <div className={`space-y-3`}>
                        {paymentInfo.kode_transaksi && (
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-zinc-500">Kode Transaksi</span>
                                <span className="font-xs font-bold text-secondary-green-color">
                                    {paymentInfo.kode_transaksi}
                                </span>
                            </div>
                        )}

                        <div className="flex items-center justify-between text-xs">
                            <span className="text-zinc-500 font-medium">Total Tagihan</span>
                            <span className="text-xs font-extrabold text-[var(--green-color)] dark:text-white">
                                Rp {Number(paymentInfo.jumlah || paymentInfo.total_biaya || 0).toLocaleString("id-ID")}
                            </span>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                            <span className="text-zinc-500 font-medium">Status Pembayaran</span>
                            <StatusPembayaranBadge status={paymentInfo.status_bayar || paymentInfo.status} />
                        </div>

                        {paymentInfo.bank_pengirim && (
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-zinc-500 font-medium">Bank Pengirim</span>
                                <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                                    {paymentInfo.bank_pengirim}
                                </span>
                            </div>
                        )}

                        {paymentInfo.nama_pengirim && (
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-zinc-500 font-medium">Nama Pengirim</span>
                                <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                                    {paymentInfo.nama_pengirim}
                                </span>
                            </div>
                        )}

                        {paymentInfo.tanggal_transfer && (
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-zinc-500 font-medium">Tanggal Transfer</span>
                                <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                                    {new Date(paymentInfo.tanggal_transfer).toLocaleDateString("id-ID", {
                                        day: "numeric",
                                        month: "short",
                                        year: "numeric"
                                    })}
                                </span>
                            </div>
                        )}

                        {paymentInfo.tanggal_lunas && (
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-zinc-500 font-medium">Tanggal Lunas</span>
                                <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                                    {new Date(paymentInfo.tanggal_lunas).toLocaleDateString("id-ID", {
                                        day: "numeric",
                                        month: "short",
                                        year: "numeric"
                                    })}
                                </span>
                            </div>
                        )}

                        {/* Bukti Pembayaran */}
                        <div className="space-y-2">
                            {/* <span className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                                Bukti Pembayaran
                            </span> */}
                            {paymentInfo.bukti_bayar ? (
                                <div className="flex items-center justify-between p-2.5 bg-secondary-green-color/30 dark:bg-secondary-green-color/10 border border-green-color/30 dark:border-secondary-green-color/20 rounded-xl">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <div className="p-1.5 bg-secondary-green-color dark:bg-secondary-green-color text-[var(--green-color)] dark:text-[var(--green-color)] rounded-lg shrink-0">
                                            <FileText className="w-4 h-4" />
                                        </div>
                                        <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 truncate">
                                            Bukti Transfer
                                        </span>
                                    </div>
                                    <a
                                        href={paymentInfo.bukti_bayar}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-1 text-xs text-[var(--green-color)] hover:underline font-bold shrink-0 ml-2"
                                    >
                                        <ExternalLink className="h-3.5 w-3.5" /> Lihat
                                    </a>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center mt-6 py-6 px-4 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/20 text-center space-y-1">
                                    <Clock className="h-7 w-7 text-zinc-400 dark:text-zinc-600 mb-1" />
                                    <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                                        Belum ada bukti pembayaran
                                    </p>
                                    <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
                                        Pemohon belum mengunggah bukti pembayaran.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
                        <p className="text-xs text-zinc-400 italic">Belum ada transaksi / tagihan dibuat.</p>
                    </div>
                )}
            </div>
        </div>
    );

    const renderUploadAndListSuratPenerimaan = () => (
        <>
            {/* Form Upload File Surat Penerimaan */}
            {!hasUploadedSuratPenerimaan && !isSelesai && (
                <div className="space-y-3">
                    {uploadingSuratPenerimaan ? (
                        <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-emerald-300 dark:border-emerald-800 rounded-xl bg-emerald-50/40 dark:bg-emerald-950/20 text-center space-y-2">
                            <div className="h-6 w-6 animate-spin rounded-full border-2 border-green-color border-t-transparent" />
                            <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                                Sedang mengunggah {selectedSuratPenerimaanFile?.name}...
                            </p>
                            <p className="text-[11px] text-zinc-400">Mohon tunggu sebentar</p>
                        </div>
                    ) : (
                        <div className="flex justify-center px-4 py-5 border-2 border-dashed border-zinc-300 dark:border-zinc-800 rounded-xl hover:border-green-color hover:bg-secondary-green-color/10 dark:hover:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-950/50 transition">
                            <div className="space-y-1.5 text-center flex flex-col items-center">
                                <CloudUpload className="mx-auto h-8 w-8 text-[var(--green-color)] dark:text-emerald-500" />
                                <div className="flex text-xs text-zinc-600 dark:text-zinc-400 justify-center items-center">
                                    <label
                                        htmlFor="surat-penerimaan-file-upload"
                                        className="relative cursor-pointer rounded-md font-semibold text-[var(--green-color)] hover:underline focus-within:outline-none"
                                    >
                                        <span>Klik untuk upload surat penerimaan</span>
                                        <input
                                            id="surat-penerimaan-file-upload"
                                            type="file"
                                            accept=".pdf,application/pdf"
                                            className="sr-only"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    handleAutoUploadSuratPenerimaan(file);
                                                }
                                                e.target.value = "";
                                            }}
                                        />
                                    </label>
                                </div>
                                <p className="text-[11px] text-zinc-400">
                                    Masukkan file PDF (Maks. 5 MB)
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {!hasUploadedSuratPenerimaan && isSelesai && (
                <div className="py-6 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-950/20">
                    <FileText className="h-7 w-7 text-zinc-400 dark:text-zinc-600 mx-auto mb-1.5" />
                    <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                        Tidak ada surat penerimaan yang diunggah
                    </p>
                    <p className="text-[11px] text-zinc-400">
                        Penugasan layanan telah selesai.
                    </p>
                </div>
            )}

            {uploadSuratPenerimaanSuccess && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1.5">
                    <CheckCircle className="h-3.5 w-3.5" /> Berhasil mengunggah surat penerimaan!
                </p>
            )}

            {/* List Surat Penerimaan */}
            {hasUploadedSuratPenerimaan && (
                <div className="space-y-3">
                    {tiket.status === "diproses" ? (
                        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-amber-800 dark:text-amber-300 text-[11px]">
                            <Info className="h-3.5 w-3.5 shrink-0" />
                            <span>Surat Penerimaan telah diunggah. Klik tombol <strong>&quot;Diterima&quot;</strong> di atas untuk menyetujui permohonan dan mengirimkan surat kepada pemohon.</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-300 text-[11px]">
                            <CheckCircle className="h-3.5 w-3.5 shrink-0" />
                            <span>Permohonan magang telah diterima dan Surat Penerimaan telah dikirimkan ke pemohon.</span>
                        </div>
                    )}

                    {listDokumenSuratPenerimaan.map((fileItem: any) => {
                        const fileName = fileItem.nama_file || (fileItem.file_url ? fileItem.file_url.split("/").pop() : (fileItem.url_storage ? fileItem.url_storage.split("/").pop() : "Surat Penerimaan"));
                        const fileUrl = fileItem.url_storage || fileItem.file_url;
                        return (
                            <div
                                key={fileItem.id}
                                className="flex items-center justify-between p-3.5 bg-secondary-green-color/30 dark:bg-secondary-green-color/10 border border-green-color/30 dark:border-secondary-green-color/30 rounded-xl"
                            >
                                <div className="flex items-center gap-4 min-w-0">
                                    <div className="p-2 bg-secondary-green-color dark:bg-secondary-green-color rounded-lg text-green-color dark:text-secondary-green-color shrink-0">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <div className="min-w-0 space-y-1">
                                        <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 break-all">
                                            {fileName}
                                        </p>
                                        <p className="text-xs text-zinc-400">
                                            Diunggah {new Date(fileItem.createdAt || fileItem.tanggal_upload || Date.now()).toLocaleDateString("id-ID", {
                                                day: "numeric",
                                                month: "short",
                                                year: "numeric"
                                            })}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0 ml-2">
                                    {fileUrl && (
                                        <a
                                            href={fileUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold rounded-lg shadow-2xs transition shrink-0 cursor-pointer"
                                        >
                                            <Download className="h-3.5 w-3.5" /> Unduh
                                        </a>
                                    )}
                                    {!isSelesai && (
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteDocClick(fileItem, "Surat Penerimaan")}
                                            title="Hapus surat penerimaan"
                                            className="inline-flex items-center justify-center p-1.5 bg-white dark:bg-zinc-800 hover:bg-red-50 dark:hover:bg-red-950/40 text-zinc-400 hover:text-red-600 border border-zinc-200 dark:border-zinc-700 hover:border-red-200 dark:hover:border-red-800 rounded-lg shadow-2xs transition shrink-0 cursor-pointer"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </>
    );

    const renderUploadAndListLaporanHasil = () => (
        <>
            {/* Form Upload File (Hanya tampil jika belum ada dokumen yang diunggah dan layanan belum selesai) */}
            {!hasUploadedDokumen && !isSelesai && (
                <div className="space-y-3">
                    {uploading ? (
                        <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-emerald-300 dark:border-emerald-800 rounded-xl bg-emerald-50/40 dark:bg-emerald-950/20 text-center space-y-2">
                            <div className="h-6 w-6 animate-spin rounded-full border-2 border-green-color border-t-transparent" />
                            <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                                Sedang mengunggah {selectedFile?.name}...
                            </p>
                            <p className="text-[11px] text-zinc-400">Mohon tunggu sebentar</p>
                        </div>
                    ) : (
                        <div className="flex justify-center px-4 py-5 border-2 border-dashed border-zinc-300 dark:border-zinc-800 rounded-xl hover:border-green-color hover:bg-secondary-green-color/10 dark:hover:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-950/50 transition">
                            <div className="space-y-1.5 text-center flex flex-col items-center">
                                <CloudUpload className="mx-auto h-8 w-8 text-[var(--green-color)] dark:text-emerald-500" />
                                <div className="flex text-xs text-zinc-600 dark:text-zinc-400 justify-center items-center">
                                    <label
                                        htmlFor="hasil-file-upload"
                                        className="relative cursor-pointer rounded-md font-semibold text-[var(--green-color)] hover:underline focus-within:outline-none"
                                    >
                                        <span>Klik untuk upload</span>
                                        <input
                                            id="hasil-file-upload"
                                            type="file"
                                            accept=".pdf,application/pdf"
                                            className="sr-only"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    if (isPeminjamanAlat) {
                                                        handleAutoUploadBeritaAcara(file);
                                                    } else {
                                                        handleAutoUpload(file);
                                                    }
                                                }
                                                e.target.value = "";
                                            }}
                                        />
                                    </label>
                                </div>
                                <p className="text-[11px] text-zinc-400">
                                    {isPeminjamanAlat
                                        ? "Unggah Berita Acara PDF (Maks. 5 MB) - Status otomatis menjadi Dipinjam"
                                        : "Masukkan file PDF (Maks. 5 MB)"}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {!hasUploadedDokumen && isSelesai && (
                <div className="py-6 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-950/20">
                    <FileText className="h-7 w-7 text-zinc-400 dark:text-zinc-600 mx-auto mb-1.5" />
                    <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                        {isPeminjamanAlat ? "Tidak ada Berita Acara yang diunggah" : "Tidak ada laporan hasil yang diunggah"}
                    </p>
                    <p className="text-[11px] text-zinc-400">
                        Penugasan layanan telah selesai.
                    </p>
                </div>
            )}

            {uploadSuccess && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1.5">
                    <CheckCircle className="h-3.5 w-3.5" /> Berhasil mengunggah dokumen!
                </p>
            )}

            {/* Laporan Hasil / Berita Acara */}
            {hasUploadedDokumen && (
                <div className="space-y-3">
                    {listDokumenHasil.map((fileItem: any) => {
                        const fileName = fileItem.nama_file || (fileItem.file_url ? fileItem.file_url.split("/").pop() : (fileItem.url_storage ? fileItem.url_storage.split("/").pop() : "Dokumen Hasil"));
                        const fileUrl = fileItem.url_storage || fileItem.file_url;
                        return (
                            <div
                                key={fileItem.id}
                                className="flex items-center justify-between p-3.5 bg-secondary-green-color/30 dark:bg-secondary-green-color/10 border border-green-color/30 dark:border-secondary-green-color/30 rounded-xl"
                            >
                                <div className="flex items-center gap-4 min-w-0">
                                    <div className="p-2 bg-secondary-green-color dark:bg-secondary-green-color rounded-lg text-green-color dark:text-secondary-green-color shrink-0">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <div className="min-w-0 space-y-1">
                                        <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 break-all">
                                            {fileName}
                                        </p>
                                        <p className="text-xs text-zinc-400">
                                            Diunggah {new Date(fileItem.createdAt || fileItem.tanggal_upload || Date.now()).toLocaleDateString("id-ID", {
                                                day: "numeric",
                                                month: "short",
                                                year: "numeric"
                                            })}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0 ml-2">
                                    {fileUrl && (
                                        <a
                                            href={fileUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold rounded-lg shadow-2xs transition shrink-0 cursor-pointer"
                                        >
                                            <Download className="h-3.5 w-3.5" /> Unduh
                                        </a>
                                    )}
                                    {!isSelesai && (
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteDocClick(fileItem, "Laporan Hasil")}
                                            title="Hapus file"
                                            className="inline-flex items-center justify-center p-1.5 bg-white dark:bg-zinc-800 hover:bg-red-50 dark:hover:bg-red-950/40 text-zinc-400 hover:text-red-600 border border-zinc-200 dark:border-zinc-700 hover:border-red-200 dark:hover:border-red-800 rounded-lg shadow-2xs transition shrink-0 cursor-pointer"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </>
    );

    return (
        <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 overflow-hidden font-sans">
            <Sidebar />

            <div className="flex flex-col flex-1 overflow-y-auto">
                <AppBar />

                <main className="flex-1 p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
                    {/* Breadcrumbs & Back */}
                    <div className="flex justify-between items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Link
                                href={`/penugasan-layanan/${resolvedParams.slug}`}
                                className="flex items-center text-sm font-medium text-[var(--foreground)] hover:cursor-pointer transition"
                            >
                                <ChevronLeft className="h-4 w-4 mr-0.5" />
                                Penugasan Layanan
                            </Link>
                            <span className="text-sm text-[var(--foreground)] dark:text-zinc-600">/</span>
                            <span className="text-sm font-medium text-[var(--foreground)] dark:text-zinc-450">
                                {tiket.layanan.nama_layanan}
                            </span>
                            <span className="text-sm text-[var(--foreground)] dark:text-zinc-600">/</span>
                            <span className="text-sm font-semibold text-[var(--green-color)]">
                                {tiket.no_tiket}
                            </span>
                        </div>
                        {isMagang ? (
                            <>
                                {tiket.status === "diproses" && (
                                    <button
                                        onClick={handleTerimaMagang}
                                        disabled={actionLoading}
                                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-color hover:bg-[var(--hover-green-color)] text-white font-semibold shadow-md hover:shadow-lg transition cursor-pointer text-sm"
                                    >
                                        <CheckCircle className="h-4 w-4" />
                                        Diterima
                                    </button>
                                )}
                                {tiket.status === "diterima" && (
                                    <button
                                        onClick={handleSelesaiProses}
                                        disabled={actionLoading}
                                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-color hover:bg-[var(--hover-green-color)] text-white font-semibold shadow-md hover:shadow-lg transition cursor-pointer text-sm"
                                    >
                                        <CheckCircle className="h-4 w-4" />
                                        Tandai Selesai
                                    </button>
                                )}
                            </>
                        ) : isPeminjamanAlat ? (
                            <>
                                {tiket.status === "diproses" && (
                                    <button
                                        onClick={handleTandaiDipinjam}
                                        disabled={actionLoading || !hasUploadedDokumen}
                                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold shadow-md transition text-sm ${hasUploadedDokumen
                                            ? "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer hover:shadow-lg"
                                            : "bg-zinc-200 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed"}`}
                                        title={hasUploadedDokumen ? "Ubah status menjadi dipinjam" : "Unggah Berita Acara terlebih dahulu"}
                                    >
                                        <CheckCircle className="h-4 w-4" />
                                        Serahkan Alat (Dipinjam)
                                    </button>
                                )}
                                {tiket.status === "dipinjam" && (
                                    <button
                                        onClick={handleSelesaiProses}
                                        disabled={actionLoading}
                                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-color hover:bg-[var(--hover-green-color)] text-white font-semibold shadow-md hover:shadow-lg transition cursor-pointer text-sm"
                                    >
                                        <CheckCircle className="h-4 w-4" />
                                        Tandai Selesai (Alat Dikembalikan)
                                    </button>
                                )}
                            </>
                        ) : (
                            tiket.status === "diproses" && (
                                <button
                                    onClick={handleSelesaiProses}
                                    disabled={actionLoading}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-color hover:bg-[var(--hover-green-color)] text-white font-semibold shadow-md hover:shadow-lg transition cursor-pointer text-sm"
                                >
                                    <CheckCircle className="h-4 w-4" />
                                    Tandai Selesai
                                </button>
                            )
                        )}
                    </div>

                    {/* Top Action / Status Banner */}
                    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:bg-zinc-900 dark:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-1">
                            <h2 className="text-base font-bold text-[var(--green-color)] dark:text-zinc-200">
                                Detail Pengajuan Layanan {tiket.layanan.nama_layanan || tiket.layanan.nama}
                            </h2>
                            <p className="text-sm text-zinc-650 dark:text-zinc-550 font-medium">
                                No. Tiket: <span className="font-bold text-[var(--foreground)]">{tiket.no_tiket}</span>
                            </p>
                        </div>

                        {/* Right Section: Status Badge & Action Buttons */}
                        <div className="flex flex-wrap items-center gap-3">
                            <StatusLayananBadge status={tiket.status} layananSlug={resolvedParams.slug} namaLayanan={tiket.layanan.nama_layanan} />
                        </div>
                    </div>

                    {isPeminjamanAlat ? (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Main Info Column (Left 2 cols) */}
                            <div className="lg:col-span-2 space-y-6">
                                {renderInformasiPemohon()}
                                {renderDataPengajuanLayanan(false)}
                            </div>

                            {/* Right Sidebar Info (1 col) */}
                            <div className="space-y-6">
                                {renderCardDokumenLampiran()}
                                {renderCardBiayaTransaksi()}
                            </div>
                        </div>
                    ) : (
                        /* Selain Layanan Peminjaman Alat: Informasi Pemohon dan Data Pengajuan Layanan SEBELAHAN */
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {renderInformasiPemohon()}
                            {renderDataPengajuanLayanan(false)}
                        </div>
                    )}
                    {/* Tabel Alat Yang Dipinjam (Khusus Peminjaman Alat, di paling bawah card) */}
                    {isPeminjamanAlat && (
                        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:bg-zinc-900 dark:border-zinc-800 space-y-4">
                            <h3 className="text-base text-green-color font-bold flex items-center gap-2 border-b border-zinc-300 pb-3 dark:border-zinc-800">
                                Daftar Alat Yang Dipinjam
                            </h3>
                            <div className="overflow-x-auto rounded-2xl border border-zinc-200/80 dark:border-zinc-800">
                                <table className="min-w-full divide-y divide-zinc-200/80 dark:divide-zinc-800">
                                    <thead>
                                        <tr className="bg-zinc-50/50 dark:bg-zinc-800/40">
                                            <th scope="col" className="px-6 py-4 text-center text-sm font-bold text-zinc-800 dark:text-zinc-200 w-16">
                                                No
                                            </th>
                                            <th scope="col" className="px-6 py-4 text-left text-sm font-bold text-zinc-800 dark:text-zinc-200">
                                                ID Alat
                                            </th>
                                            <th scope="col" className="px-6 py-4 text-left text-sm font-bold text-zinc-800 dark:text-zinc-200">
                                                Nama Alat
                                            </th>
                                            <th scope="col" className="px-6 py-4 text-left text-sm font-bold text-zinc-800 dark:text-zinc-200">
                                                Jumlah
                                            </th>
                                            <th scope="col" className="px-6 py-4 text-left text-sm font-bold text-zinc-800 dark:text-zinc-200">
                                                Harga
                                            </th>
                                            <th scope="col" className="px-6 py-4 text-left text-sm font-bold text-zinc-800 dark:text-zinc-200">
                                                Subtotal
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 bg-white dark:bg-zinc-900 text-sm">
                                        {selectedAlatList.length > 0 ? (
                                            selectedAlatList.map((tool: any, idx: number) => {
                                                const units = Number(tool.units || tool.jumlah || 1);
                                                const price = Number(tool.price || tool.harga || 0);
                                                const subtotal = price * units * durationDays;

                                                const matched = alatMaster.find(
                                                    (a: any) => (tool.alatId && String(a.id) === String(tool.alatId)) ||
                                                        (tool.name && a.nama_alat?.trim().toLowerCase() === tool.name?.trim().toLowerCase())
                                                );
                                                const idAlat = matched
                                                    ? `ALT-${String(matched.id).padStart(3, "0")}`
                                                    : (tool.alatId ? `ALT-${String(tool.alatId).padStart(3, "0")}` : `ALT-${String(idx + 1).padStart(3, "0")}`);

                                                return (
                                                    <tr key={idx} className="transition-colors hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50">
                                                        <td className="px-6 py-4 text-center text-zinc-500 dark:text-zinc-400 font-medium text-sm whitespace-nowrap">
                                                            {idx + 1}
                                                        </td>
                                                        <td className="px-6 py-4 text-left text-zinc-500 dark:text-zinc-400 font-medium font-mono text-sm whitespace-nowrap">
                                                            {idAlat}
                                                        </td>
                                                        <td className="px-6 py-4 text-left text-zinc-800 dark:text-zinc-200 font-medium">
                                                            {tool.name}
                                                        </td>
                                                        <td className="px-6 py-4 text-left text-zinc-600 dark:text-zinc-400 font-medium whitespace-nowrap">
                                                            {units}
                                                        </td>
                                                        <td className="px-6 py-4 text-left text-zinc-600 dark:text-zinc-400 font-medium whitespace-nowrap">
                                                            Rp {price.toLocaleString("id-ID")}
                                                        </td>
                                                        <td className="px-6 py-4 text-left text-zinc-800 dark:text-zinc-200 font-medium whitespace-nowrap">
                                                            Rp {subtotal.toLocaleString("id-ID")}
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan={6} className="px-6 py-8 text-center text-zinc-500 dark:text-zinc-400 font-medium text-sm">
                                                    Tidak ada data alat yang dipinjam
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                    {selectedAlatList.length > 0 && (
                                        <tfoot className="border-t border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-850/40">
                                            <tr>
                                                <td colSpan={5} className="px-6 py-4 text-left font-bold text-zinc-800 dark:text-zinc-200 text-sm">
                                                    Total Tagihan {durationDays > 1 && (
                                                        <span className="text-xs text-zinc-500 dark:text-zinc-400 font-normal ml-1.5">
                                                            (Durasi: {durationDays} Hari)
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-left font-extrabold text-[#2C5E3B] dark:text-secondary-green-color text-base whitespace-nowrap">
                                                    Rp {Number(paymentInfo?.jumlah || totalEstimasi || 0).toLocaleString("id-ID")}
                                                </td>
                                            </tr>
                                        </tfoot>
                                    )}
                                </table>
                            </div>
                        </div>
                    )}
                    {/* Dokumen Lampiran Pemohon (Khusus Non-Peminjaman Alat: dipisah card tersendiri di atas Laporan Hasil) */}
                    {!isPeminjamanAlat && renderCardDokumenLampiran(true)}

                    {/* Dokumen Surat Penerimaan (Khusus Magang / PKL) */}
                    {isMagang && (
                        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
                            <div className="bg-green-color px-6 py-4 flex items-center justify-between">
                                <h3 className="text-base text-white font-semibold flex items-center gap-2">
                                    Surat Penerimaan
                                </h3>
                                {listDokumenSuratPenerimaan.length > 0 && (
                                    <span className="text-xs whitespace-nowrap font-semibold px-2.5 py-0.5 rounded-full bg-white/20 text-white">
                                        {listDokumenSuratPenerimaan.length} Berkas
                                    </span>
                                )}
                            </div>
                            <div className="p-6 space-y-4">
                                {renderUploadAndListSuratPenerimaan()}
                            </div>
                        </div>
                    )}

                    {/* Dokumen Laporan Hasil / Berita Acara (Upload & List) */}
                    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
                        <div className="bg-green-color px-6 py-4 flex items-center justify-between">
                            <h3 className="text-base text-white font-semibold flex items-center gap-2">
                                {isPeminjamanAlat ? "Berita Acara Serah Terima Alat" : "Laporan Hasil / Berita Acara"}
                            </h3>
                        </div>
                        <div className="p-6 space-y-4">
                            {renderUploadAndListLaporanHasil()}
                        </div>
                    </div>

                    {/* Dokumen Sertifikat Magang / PKL (Khusus Magang / PKL) */}
                    {isMagang && (
                        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
                            <div className="bg-green-color px-6 py-4 flex items-center justify-between">
                                <h3 className="text-base text-white font-semibold flex items-center gap-2">
                                    Sertifikat Magang / PKL
                                </h3>
                            </div>
                            <div className="p-6 space-y-4">

                                {/* Form Upload Sertifikat File (Hanya jika belum ada sertifikat dan layanan belum selesai) */}
                                {!hasUploadedSertifikat && !isSelesai && (
                                    <div className="space-y-3">
                                        {uploadingSertifikat ? (
                                            <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-emerald-300 dark:border-emerald-800 rounded-xl bg-emerald-50/40 dark:bg-emerald-950/20 text-center space-y-2">
                                                <div className="h-6 w-6 animate-spin rounded-full border-2 border-green-color border-t-transparent" />
                                                <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                                                    Sedang mengunggah {selectedSertifikatFile?.name}...
                                                </p>
                                                <p className="text-[11px] text-zinc-400">Mohon tunggu sebentar</p>
                                            </div>
                                        ) : (
                                            <div className="flex justify-center px-4 py-5 border-2 border-dashed border-zinc-300 dark:border-zinc-800 rounded-xl hover:border-green-color hover:bg-secondary-green-color/10 dark:hover:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-950/50 transition">
                                                <div className="space-y-1.5 text-center flex flex-col items-center">
                                                    <CloudUpload className="mx-auto h-8 w-8 text-[var(--green-color)] dark:text-emerald-500" />
                                                    <div className="flex text-xs text-zinc-600 dark:text-zinc-400 justify-center items-center">
                                                        <label
                                                            htmlFor="sertifikat-file-upload"
                                                            className="relative cursor-pointer rounded-md font-semibold text-[var(--green-color)] hover:underline focus-within:outline-none"
                                                        >
                                                            <span>Klik untuk upload sertifikat</span>
                                                            <input
                                                                id="sertifikat-file-upload"
                                                                type="file"
                                                                accept=".pdf,application/pdf"
                                                                className="sr-only"
                                                                onChange={(e) => {
                                                                    const file = e.target.files?.[0];
                                                                    if (file) {
                                                                        handleAutoUploadSertifikat(file);
                                                                    }
                                                                    e.target.value = "";
                                                                }}
                                                            />
                                                        </label>
                                                    </div>
                                                    <p className="text-[11px] text-zinc-400">
                                                        Masukkan file sertifikat PDF (Maks. 5 MB)
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {!hasUploadedSertifikat && isSelesai && (
                                    <div className="py-6 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-950/20">
                                        <Award className="h-7 w-7 text-zinc-400 dark:text-zinc-600 mx-auto mb-1.5" />
                                        <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                                            Sertifikat magang tidak dilampirkan
                                        </p>
                                        <p className="text-[11px] text-zinc-400">
                                            Penugasan layanan telah selesai.
                                        </p>
                                    </div>
                                )}

                                {uploadSertifikatSuccess && (
                                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1.5">
                                        <CheckCircle className="h-3.5 w-3.5" /> Berhasil mengunggah sertifikat magang!
                                    </p>
                                )}

                                {/* List File Sertifikat */}
                                {hasUploadedSertifikat && (
                                    <div className="space-y-3">
                                        {!isSelesai ? (
                                            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-300 dark:border-yellow-900/40 text-yellow-800 dark:text-yellow-300 text-[11px]">
                                                <Info className="h-3.5 w-3.5 shrink-0" />
                                                <span>Sertifikat ini masih berstatus draf (dapat dihapus/diperbarui) dan belum dikirimkan ke pemohon publik hingga penugasan layanan ditandai selesai.</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-300 dark:border-yellow-900/40 text-yellow-800 dark:text-yellow-300 text-[11px]">
                                                <CheckCircle className="h-3.5 w-3.5 shrink-0" />
                                                <span>Penugasan layanan telah selesai. Sertifikat magang telah diterbitkan ke pemohon dan tidak dapat dihapus lagi.</span>
                                            </div>
                                        )}
                                        {listDokumenSertifikat.map((fileItem: any) => {
                                            const fileName = fileItem.nama_file || (fileItem.file_url ? fileItem.file_url.split("/").pop() : (fileItem.url_storage ? fileItem.url_storage.split("/").pop() : "Sertifikat Magang"));
                                            const fileUrl = fileItem.url_storage || fileItem.file_url;
                                            return (
                                                <div
                                                    key={fileItem.id}
                                                    className="flex items-center justify-between p-3.5 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-300 dark:border-yellow-900/40 rounded-xl"
                                                >
                                                    <div className="flex items-center gap-4 min-w-0">
                                                        <div className="p-2 bg-yellow-100 dark:bg-yellow-900/40 rounded-lg text-yellow-700 dark:text-yellow-300 shrink-0">
                                                            <Award className="w-5 h-5" />
                                                        </div>
                                                        <div className="min-w-0 space-y-1">
                                                            <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 breaks-all">
                                                                {fileName}
                                                            </p>
                                                            <p className="text-xs text-zinc-400">
                                                                Diunggah {new Date(fileItem.createdAt || fileItem.tanggal_upload || Date.now()).toLocaleDateString("id-ID", {
                                                                    day: "numeric",
                                                                    month: "short",
                                                                    year: "numeric"
                                                                })}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 shrink-0 ml-2">
                                                        {fileUrl && (
                                                            <a
                                                                href={fileUrl}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold rounded-lg shadow-xs transition shrink-0 cursor-pointer"
                                                            >
                                                                <Download className="h-3.5 w-3.5" /> Unduh
                                                            </a>
                                                        )}
                                                        {!isSelesai && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDeleteDocClick(fileItem, "Sertifikat Magang")}
                                                                title="Hapus sertifikat"
                                                                className="inline-flex items-center justify-center p-1.5 bg-white dark:bg-zinc-800 hover:bg-red-50 dark:hover:bg-red-950/40 text-zinc-400 hover:text-red-600 border border-zinc-200 dark:border-zinc-700 hover:border-red-200 dark:hover:border-red-800 rounded-lg shadow-xs transition shrink-0 cursor-pointer"
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* Billing Modal */}
            <BillingModal
                isOpen={billingModalOpen}
                onClose={() => setBillingModalOpen(false)}
                onConfirm={submitBilling}
                tiket={
                    tiket
                        ? {
                            layanan: {
                                nama:
                                    tiket.layanan.nama_layanan ||
                                    tiket.layanan.nama ||
                                    "Layanan",
                                biaya: tiket.layanan.biaya,
                            },
                        }
                        : null
                }
                actionLoading={actionLoading}
            />

            {/* Confirmation Penugasan Modal */}
            <ConfirmPenugasanModal
                isOpen={confirmationModalOpen}
                onClose={() => {
                    setConfirmationModalOpen(false);
                    setConfirmationType(null);
                }}
                onConfirm={() => {
                    if (confirmationType === "terima") {
                        confirmTerimaMagang();
                    } else if (confirmationType === "mulai") {
                        confirmMulaiProses();
                    } else {
                        confirmSelesaiProses();
                    }
                }}
                actionLoading={actionLoading}
                title={
                    confirmationType === "terima"
                        ? "Konfirmasi Penerimaan Magang"
                        : confirmationType === "mulai"
                            ? "Mulai Proses Layanan"
                            : isPeminjamanAlat
                                ? "Konfirmasi Pengembalian Alat"
                                : "Konfirmasi Penugasan Layanan"
                }
                message={
                    confirmationType === "terima"
                        ? "Apakah Anda yakin ingin menerima permohonan magang ini? Status tiket akan berubah menjadi 'Diterima' dan Surat Penerimaan akan diterbitkan ke pemohon."
                        : confirmationType === "mulai"
                            ? "Apakah Anda yakin ingin mulai memproses tiket layanan ini?"
                            : isPeminjamanAlat
                                ? "Apakah seluruh alat yang dipinjam telah dikembalikan dalam kondisi baik? Status tiket akan ditandai selesai dan stok alat akan dikembalikan otomatis ke inventaris."
                                : "Apakah Anda yakin ingin menyelesaikan penugasan layanan ini? Dokumen hasil dan sertifikat yang diunggah akan dikirimkan ke pemohon dan tidak dapat dihapus lagi."
                }
                confirmText={
                    confirmationType === "terima"
                        ? "Diterima"
                        : confirmationType === "mulai"
                            ? "Mulai"
                            : "Selesai"
                }
            />

            {/* Success Modal */}
            <SuccessModal
                isOpen={successModalOpen}
                onClose={() => setSuccessModalOpen(false)}
                title="Berhasil!"
                message={successMessage}
                confirmText="Tutup"
                onConfirm={() => setSuccessModalOpen(false)}
            />

            {/* Error Modal */}
            <ErrorModal
                isOpen={errorModalOpen}
                onClose={() => setErrorModalOpen(false)}
                title="Terjadi Kesalahan"
                message={errorMessage}
            />

            {/* Delete Document Confirmation Modal */}
            {deleteDocModalOpen && docToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
                    <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-4 animate-in fade-in zoom-in-95 duration-150">
                        <div className="text-center space-y-2.5">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400">
                                <X className="h-6 w-6 stroke-[2.5]" />
                            </div>
                            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                                Hapus Dokumen?
                            </h3>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                                Apakah Anda yakin ingin menghapus file <br />
                                <span className="font-semibold text-zinc-800 dark:text-zinc-200 break-all">&quot;{docToDelete.name}&quot;</span>?
                                <br />
                                File akan dihapus dan Anda dapat mengunggah kembali file baru.
                            </p>
                        </div>

                        <div className="flex items-center justify-center gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => {
                                    if (!deletingDoc) {
                                        setDeleteDocModalOpen(false);
                                        setDocToDelete(null);
                                    }
                                }}
                                disabled={deletingDoc}
                                className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-300 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 font-semibold cursor-pointer text-xs transition disabled:opacity-50"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={confirmDeleteDoc}
                                disabled={deletingDoc}
                                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold cursor-pointer text-xs transition flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
                            >
                                {deletingDoc ? (
                                    <>
                                        <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                        <span>Menghapus...</span>
                                    </>
                                ) : (
                                    "Ya, Hapus"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
