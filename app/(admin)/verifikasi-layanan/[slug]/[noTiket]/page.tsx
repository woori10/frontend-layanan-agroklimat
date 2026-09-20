"use client";

import React, { use, useEffect, useState } from "react";
import Navbar from "@/components/navbar/Navbar";
import ApproveModal from "@/components/modal/ApproveModal";
import RejectModal from "@/components/modal/RejectModal";
import SuccessModal from "@/components/modal/SuccessModal";
import ErrorModal from "@/components/modal/ErrorModal";
import {
    ChevronLeft,
    Check,
    Hourglass,
    User,
    Flag,
    FileText,
    MapPin,
    Calendar,
    Database,
    Download,
    ClipboardSignature,
    Droplet,
    Briefcase,
    GraduationCap,
    BookOpen,
    Bed,
    ClipboardList,
    X,
    Receipt,
    RefreshCw,
    Award,
    File,
    Wrench,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getTiketDetail, verifikasiTiket } from "@/lib/tiket";
import StatusLayananBadge from "@/components/badge/status-layanan/StatusLayananBadge";
import Sidebar from "@/components/sidebar/Sidebar";
import AppBar from "@/components/appbar/AppBar";
import { getApiUrl } from "@/lib/api";

interface PageProps {
    params: Promise<{
        slug: string;
        noTiket: string;
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
}

interface TiketDetail {
    id: number;
    no_tiket: string;
    status: string;
    tanggal_submit: string;
    tanggal_sla?: string;
    jawaban_form: Record<string, any> | null;
    user?: {
        id?: number;
        nama?: string;
        email?: string;
        nip?: string;
        no_hp?: string;
        instansi?: string;
        alamat?: string;
    } | null;
    layanan: {
        id: number;
        nama_layanan: string;
        slug?: string;
        unit_teknis_id?: number | null;
        unit_teknis?: { id: number; nama: string } | null;
    };
    unit_teknis_id?: number | null;
    unit_teknis?: { id: number; nama: string } | null;
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

function getSteps(status: string, hasTagihan: boolean, tagihanLunas: boolean, isPeminjamanAlat: boolean, isMagang: boolean = false) {
    if (status === "ditolak") {
        return [
            {
                label: "Verifikasi",
                status: "completed",
                date: "Selesai",
                icon: Check
            },
            {
                label: "Ditolak",
                status: "active",
                date: "Ditolak",
                icon: X
            }
        ];
    }

    if (isPeminjamanAlat) {
        const isVerifDone = ["diproses", "dipinjam", "selesai"].includes(status);
        const isVerifActive = ["menunggu_verifikasi", "diajukan", "perlu_revisi"].includes(status);

        const isDiprosesDone = ["dipinjam", "selesai"].includes(status);
        const isDiprosesActive = status === "diproses";

        const isDipinjamDone = status === "selesai";
        const isDipinjamActive = status === "dipinjam";

        const isSelesaiDone = status === "selesai";

        return [
            {
                label: "Verifikasi",
                status: isVerifDone ? "completed" : (isVerifActive ? "active" : "pending"),
                date: isVerifDone ? "Selesai" : (isVerifActive ? "Proses" : "Menunggu"),
                icon: ClipboardList
            },
            {
                label: "Diproses",
                status: isDiprosesDone ? "completed" : (isDiprosesActive ? "active" : "pending"),
                date: isDiprosesDone ? "Selesai" : (isDiprosesActive ? "Sedang Diproses" : "Menunggu"),
                icon: RefreshCw
            },
            {
                label: "Dipinjam",
                status: isDipinjamDone ? "completed" : (isDipinjamActive ? "active" : "pending"),
                date: isDipinjamDone ? "Selesai" : (isDipinjamActive ? "Sedang Dipinjam" : "Menunggu"),
                icon: Wrench
            },
            {
                label: "Selesai",
                status: isSelesaiDone ? "completed" : "pending",
                date: isSelesaiDone ? "Selesai" : "Menunggu",
                icon: Flag
            },
        ];
    }

    const isVerifikasiDone = ["menunggu_persetujuan_kepala_balai", "menunggu_pembayaran", "diproses", "diterima", "menunggu_konfirmasi", "selesai"].includes(status);
    const isVerifikasiActive = ["menunggu_verifikasi", "diajukan", "perlu_revisi"].includes(status);

    const isDisposisiDone = ["menunggu_pembayaran", "diproses", "diterima", "menunggu_konfirmasi", "selesai"].includes(status);
    const isDisposisiActive = status === "menunggu_persetujuan_kepala_balai";

    const isTagihanDone = isDisposisiDone && (["diproses", "diterima", "menunggu_konfirmasi", "selesai"].includes(status) || (!hasTagihan || tagihanLunas));
    const isTagihanActive = status === "menunggu_pembayaran";

    const isDiprosesDone = isMagang ? ["diterima", "selesai"].includes(status) : status === "selesai";
    const isDiprosesActive = status === "diproses";

    const isDiterimaDone = status === "selesai";
    const isDiterimaActive = status === "diterima";

    const isSelesaiDone = status === "selesai";

    return [
        {
            label: "Verifikasi",
            status: isVerifikasiDone ? "completed" : (isVerifikasiActive ? "active" : "pending"),
            date: isVerifikasiDone ? "Selesai" : (isVerifikasiActive ? "Proses" : "Menunggu"),
            icon: ClipboardList
        },
        {
            label: "Disposisi",
            status: isDisposisiDone ? "completed" : (isDisposisiActive ? "active" : "pending"),
            date: isDisposisiDone ? "Selesai" : (isDisposisiActive ? "Menunggu Disposisi" : "Menunggu"),
            icon: ClipboardSignature
        },
        {
            label: "Diproses",
            status: isDiprosesDone ? "completed" : (isDiprosesActive ? "active" : "pending"),
            date: isDiprosesDone ? "Selesai" : (isDiprosesActive ? "Sedang Diproses" : "Menunggu"),
            icon: RefreshCw
        },
        ...(isMagang ? [
            {
                label: "Diterima",
                status: isDiterimaDone ? "completed" : (isDiterimaActive ? "active" : "pending"),
                date: isDiterimaDone ? "Selesai" : (isDiterimaActive ? "Diterima" : "Menunggu"),
                icon: GraduationCap
            }
        ] : []),
        {
            label: "Selesai",
            status: isSelesaiDone ? "completed" : "pending",
            date: isSelesaiDone ? "Selesai" : "Menunggu",
            icon: Flag
        },
    ];
}

export default function DetailLayananPage({ params }: PageProps) {
    const resolvedParams = use(params);
    const router = useRouter();
    const noTiket = resolvedParams.noTiket;
    const slug = resolvedParams.slug;

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [tiket, setTiket] = useState<TiketDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [mounted, setMounted] = useState(false);
    const [alatMaster, setAlatMaster] = useState<any[]>([]);

    const [approveModalOpen, setApproveModalOpen] = useState(false);
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    const [successModalOpen, setSuccessModalOpen] = useState(false);
    const [errorModalOpen, setErrorModalOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const [successRedirect, setSuccessRedirect] = useState<
        "/tagihan" | `/verifikasi-layanan/${string}` | null
    >(null);

    const handleSetujui = async () => {
        if (!tiket) return;

        const unitTeknisId =
            tiket.layanan?.unit_teknis?.id ||
            tiket.layanan?.unit_teknis_id ||
            tiket.unit_teknis_id ||
            tiket.unit_teknis?.id;

        if (!unitTeknisId) {
            setErrorMessage("Gagal menentukan unit teknis terkait untuk layanan ini.");
            setErrorModalOpen(true);
            return;
        }

        setActionLoading(true);

        try {
            await verifikasiTiket(tiket.id, {
                aksi: "disetujui",
                unit_teknis_id: unitTeknisId,
            });

            setApproveModalOpen(false);
            const isPeminjamanAlat = slug === "peminjaman-alat" || tiket.layanan?.slug === "peminjaman-alat";
            setSuccessMessage(
                isPeminjamanAlat
                    ? "Tiket berhasil diverifikasi dan status telah berubah menjadi Diproses!"
                    : "Tiket berhasil diverifikasi dan diteruskan ke Kepala Balai untuk disposisi!"
            );
            setSuccessRedirect(`/verifikasi-layanan/${slug}`);

            setSuccessModalOpen(true);
        } catch (err: any) {
            setApproveModalOpen(false);
            setErrorMessage(err.message || "Gagal menyetujui tiket");
            setErrorModalOpen(true);
        } finally {
            setActionLoading(false);
        }
    };

    const handleTolak = async (alasan: string) => {
        if (!tiket) return;

        if (!alasan.trim()) {
            setErrorMessage("Harap masukkan alasan penolakan.");
            setErrorModalOpen(true);
            return;
        }

        setActionLoading(true);

        try {
            await verifikasiTiket(tiket.id, {
                aksi: "ditolak",
                catatan: alasan,
            });

            setRejectModalOpen(false);
            setSuccessMessage("Tiket berhasil ditolak.");
            setSuccessRedirect(`/verifikasi-layanan/${slug}`);
            setSuccessModalOpen(true);
        } catch (err: any) {
            setRejectModalOpen(false);
            setErrorMessage(err.message || "Gagal menolak tiket");
            setErrorModalOpen(true);
        } finally {
            setActionLoading(false);
        }
    };

    useEffect(() => {
        setMounted(true);
        const token = localStorage.getItem("agro_token");
        if (!token) {
            router.push("/login");
            return;
        }

        if (!noTiket) {
            setError("Nomor Tiket tidak valid");
            setLoading(false);
            return;
        }

        getTiketDetail(noTiket)
            .then(setTiket)
            .catch((err: any) => setError(err.message))
            .finally(() => setLoading(false));

        fetch(`${getApiUrl()}/alat`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data)) setAlatMaster(data);
            })
            .catch(() => { });
    }, [noTiket, router]);

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
                <main className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-zinc-500">
                    Memuat detail permohonan...
                </main>
            </div>
        );
    }

    if (error || !tiket) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200">
                <Navbar />
                <main className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-red-500">
                    {error || "Permohonan tidak ditemukan"}
                </main>
            </div>
        );
    }

    const hasTagihan = !!tiket.tagihan;
    const tagihanLunas = tiket.tagihan?.status_bayar === "lunas";
    const isPeminjamanAlat = slug === "peminjaman-alat" || tiket.layanan?.slug === "peminjaman-alat";
    const isMagang = slug === "magang-pkl" || tiket.layanan?.slug === "magang-pkl";
    const steps = getSteps(tiket.status, hasTagihan, tagihanLunas, isPeminjamanAlat, isMagang);

    // Separate common fields from form answers
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
    const formAnswers = tiket.jawaban_form || {};

    let durationDays = 1;
    const periode = formAnswers.periode_peminjaman || "";
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

    const rawAlatList: any[] = Array.isArray(formAnswers.selected_alat_list)
        ? formAnswers.selected_alat_list
        : (typeof formAnswers.selected_alat_list === "string"
            ? (() => { try { return JSON.parse(formAnswers.selected_alat_list); } catch { return []; } })()
            : []);

    // Sinkronisasi data alat yang dipinjam secara dinamis dari database (alatMaster)
    const selectedAlatList: any[] = rawAlatList.map((tool: any, idx: number) => {
        const matched = alatMaster.find(
            (a: any) =>
                (tool.alatId && String(a.id) === String(tool.alatId)) ||
                (tool.id && String(a.id) === String(tool.id)) ||
                (tool.name && a.nama_alat?.trim().toLowerCase() === tool.name?.trim().toLowerCase()) ||
                (tool.nama_alat && a.nama_alat?.trim().toLowerCase() === tool.nama_alat?.trim().toLowerCase())
        );

        const idAlat = matched
            ? `ALT-${String(matched.id).padStart(3, "0")}`
            : (tool.alatId ? (String(tool.alatId).startsWith("ALT-") ? tool.alatId : `ALT-${String(tool.alatId).padStart(3, "0")}`) : `ALT-${String(idx + 1).padStart(3, "0")}`);
        const name = matched?.nama_alat || tool.name || tool.nama_alat || "Alat";
        const units = Number(tool.units || tool.jumlah || tool.qty || 1);
        const price = Number(matched ? matched.harga_peminjaman : (tool.price || tool.harga || tool.harga_peminjaman || 0));
        const subtotal = price * units * durationDays;

        return {
            ...tool,
            idAlat,
            name,
            units,
            price,
            subtotal,
        };
    });

    if (selectedAlatList.length === 0 && typeof formAnswers.jenis_alat === "string" && formAnswers.jenis_alat.trim()) {
        const text = formAnswers.jenis_alat;
        alatMaster.forEach((a: any) => {
            if (text.toLowerCase().includes(a.nama_alat.trim().toLowerCase())) {
                const regex = new RegExp(
                    a.nama_alat.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + '.*?(\\d+)\\s*(?:unit|Unit)?',
                    'i'
                );
                const match = text.match(regex);
                const units = match && match[1] ? parseInt(match[1], 10) : 1;
                selectedAlatList.push({
                    idAlat: `ALT-${String(a.id).padStart(3, "0")}`,
                    name: a.nama_alat,
                    units: isNaN(units) ? 1 : units,
                    price: a.harga_peminjaman,
                    subtotal: a.harga_peminjaman * (isNaN(units) ? 1 : units) * durationDays,
                });
            }
        });
    }

    let totalEstimasi = 0;
    selectedAlatList.forEach((tool: any) => {
        totalEstimasi += Number(tool.subtotal || 0);
    });

    // Lampiran vs Surat Penerimaan vs Laporan Hasil vs Sertifikat
    const suratPenerimaanDocs = tiket.dokumen.filter(doc =>
        (doc.tipe || "").toLowerCase().includes("penerimaan")
    );
    const lampiranDocs = tiket.dokumen.filter(doc => {
        const tipe = (doc.tipe || "").toLowerCase();
        return tipe !== "laporan hasil" && tipe !== "laporan_hasil" && !tipe.includes("sertifikat") && !tipe.includes("penerimaan");
    });
    const laporanDocs = tiket.dokumen.filter(doc => {
        const tipe = (doc.tipe || "").toLowerCase();
        return (tipe === "laporan hasil" || tipe === "laporan_hasil") && !tipe.includes("sertifikat") && !tipe.includes("penerimaan");
    });
    const sertifikatDocs = tiket.dokumen.filter(doc =>
        (doc.tipe || "").toLowerCase().includes("sertifikat")
    );

    return (
        <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 overflow-hidden font-sans">
            <Sidebar />

            <div className="flex flex-col flex-1 overflow-y-auto">
                <AppBar onMenuClick={() => setSidebarOpen(true)} />
                <main className="flex-1 p-8 space-y-8">

                    {/* Title and Action Button */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div className="flex items-center gap-2">
                            <Link
                                href={`/verifikasi-layanan/${slug}`}
                                className="flex items-center text-sm font-medium text-[var(--foreground)] hover:cursor-pointer transition"
                            >
                                <ChevronLeft className="h-4 w-4 mr-0.5" />
                                Verifikasi Layanan
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

                        {["diajukan", "menunggu_verifikasi"].includes(tiket.status) && (
                            <div className="flex flex-row gap-2">
                                <button
                                    onClick={() => setRejectModalOpen(true)}
                                    disabled={actionLoading}
                                    className="flex items-center justify-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-xs font-semibold transition shadow-sm cursor-pointer self-end md:self-auto disabled:opacity-50"
                                >
                                    <X className="h-4.5 w-4.5" />
                                    <span>Tolak</span>
                                </button>
                                <button
                                    onClick={() => setApproveModalOpen(true)}
                                    disabled={actionLoading}
                                    className="flex items-center justify-center gap-2 rounded-xl bg-[#2C5E3B] hover:bg-[#20492E] text-white px-4 py-2 text-xs font-semibold transition shadow-sm cursor-pointer self-end md:self-auto disabled:opacity-50"
                                >
                                    <Check className="h-4.5 w-4.5" />
                                    <span>Setujui</span>
                                </button>
                            </div>
                        )}


                    </div>

                    {/* Status tracker timeline card */}
                    <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 mb-8">
                        <h2 className="flex justify-between text-base font-bold text-[var(--green-color)] dark:text-zinc-200 mb-2">
                            Detail Pengajuan Layanan {tiket.layanan.nama_layanan} <span className="ml-4"><StatusLayananBadge status={tiket.status} layananSlug={slug} namaLayanan={tiket.layanan.nama_layanan} /></span>
                        </h2>
                        <p className="text-sm text-zinc-650 dark:text-zinc-550 mt-0.5 font-medium">
                            No. Tiket: <span className="font-bold text-[var(--foreground)]">{tiket.no_tiket}</span>
                        </p>
                    </div>

                    {/* Content Details Section */}
                    <div className="space-y-8">
                        {/* Row 1: Informasi Pemohon & Detail Pengajuan Layanan (Side-by-side) */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Card 1: Informasi Pemohon */}
                            <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                                <div className="flex border-b border-zinc-300 dark:border-zinc-800/80 pb-4 mb-6 items-center gap-2">
                                    <h3 className="text-base font-bold text-[var(--green-color)] dark:text-zinc-200">
                                        Informasi Pemohon
                                    </h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
                                    <div>
                                        <span className="text-zinc-500 block text-xs">
                                            Nama Lengkap
                                        </span>
                                        <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                                            {formAnswers.nama_lengkap || formAnswers.nama || tiket.user?.nama || "-"}
                                        </span>
                                    </div>

                                    <div>
                                        <span className="text-zinc-500 block text-xs">
                                            Email
                                        </span>
                                        <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                                            {tiket.user?.email || formAnswers.email || "-"}
                                        </span>
                                    </div>

                                    <div>
                                        <span className="text-zinc-500 block text-xs">
                                            NIP / No. KTP
                                        </span>
                                        <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                                            {formAnswers.nip_ktp || tiket.user?.nip || "-"}
                                        </span>
                                    </div>

                                    <div>
                                        <span className="text-zinc-500 block text-xs">
                                            No. Telepon / WhatsApp
                                        </span>
                                        <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                                            {formAnswers.no_telp || formAnswers.no_telepon || formAnswers.telepon || tiket.user?.no_hp || "-"}
                                        </span>
                                    </div>

                                    <div className="md:col-span-2">
                                        <span className="text-zinc-500 block text-xs">
                                            Alamat Instansi / Asal
                                        </span>
                                        <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                                            {formAnswers.alamat_instansi || formAnswers.asal_instansi || formAnswers.instansi || tiket.user?.instansi || tiket.user?.alamat || "-"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Card 2: Detail Layanan */}
                            <div className="rounded-2xl border border-zinc-200/80 bg-white p-6  shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                                <div className="flex border-b border-zinc-300 dark:border-zinc-800/80 items-center gap-2 pb-4 mb-6">
                                    <h3 className="text-base font-bold text-[var(--green-color)] dark:text-zinc-200">
                                        Detail Pengajuan Layanan
                                    </h3>
                                </div>

                                <div className="space-y-6 text-sm">
                                    <div className="grid gap-y-5 gap-x-6 sm:grid-cols-2">
                                        <div>
                                            <span className="text-zinc-500 block text-xs">
                                                Nama Layanan
                                            </span>
                                            <span className="block text-sm font-semibold text-zinc-800 dark:text-zinc-200 mt-1">
                                                {tiket.layanan.nama_layanan}
                                            </span>
                                        </div>

                                        <div>
                                            <span className="text-zinc-500 block text-xs">
                                                Tanggal Pengajuan
                                            </span>
                                            <span className="block text-sm font-semibold text-zinc-800 dark:text-zinc-200 mt-1">
                                                {formatDate(tiket.tanggal_submit)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Render custom fields from jawaban_form dynamically */}
                                    <div className="grid gap-y-5 gap-x-6 sm:grid-cols-2 pt-4">
                                        {Object.entries(formAnswers)
                                            .filter(([key]) => {
                                                if (commonFields.includes(key)) return false;
                                                if (isPeminjamanAlat && (key === "jenis_alat" || key === "selected_alat_list" || key === "total_estimasi")) {
                                                    return false;
                                                }
                                                return true;
                                            })
                                            .map(([key, value]) => {
                                                const formattedKey = key
                                                    .split("_")
                                                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                                    .join(" ");

                                                return (
                                                    <div key={key}>
                                                        <span className="text-zinc-500 block text-xs">
                                                            {formattedKey}
                                                        </span>
                                                        <div className="block text-sm font-semibold text-zinc-800 dark:text-zinc-200 mt-1 leading-relaxed whitespace-pre-line">
                                                            {typeof value === "object" && value !== null
                                                                ? JSON.stringify(value, null, 2)
                                                                : (value ? String(value) : "-")}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Card: Daftar Alat Yang Dipinjam (Khusus Peminjaman Alat) */}
                        {isPeminjamanAlat && (
                            <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                                <div className="flex border-b border-zinc-300 dark:border-zinc-800/80 items-center gap-2 pb-4 mb-6">
                                    <h3 className="text-base font-bold text-[var(--green-color)] dark:text-zinc-200">
                                        Daftar Alat Yang Dipinjam
                                    </h3>
                                </div>

                                <div className="overflow-x-auto rounded-2xl border border-zinc-200/80 dark:border-zinc-800">
                                    <table className="min-w-full divide-y divide-zinc-200/80 dark:divide-zinc-800">
                                        <thead>
                                            <tr className="bg-zinc-50/50 dark:bg-zinc-800/40">
                                                <th scope="col" className="px-5 py-3.5 text-center text-xs font-bold text-zinc-800 dark:text-zinc-200 w-16">
                                                    No
                                                </th>
                                                <th scope="col" className="px-5 py-3.5 text-left text-xs font-bold text-zinc-800 dark:text-zinc-200">
                                                    ID Alat
                                                </th>
                                                <th scope="col" className="px-5 py-3.5 text-left text-xs font-bold text-zinc-800 dark:text-zinc-200">
                                                    Nama Alat
                                                </th>
                                                <th scope="col" className="px-5 py-3.5 text-center text-xs font-bold text-zinc-800 dark:text-zinc-200">
                                                    Jumlah
                                                </th>
                                                <th scope="col" className="px-5 py-3.5 text-center text-xs font-bold text-zinc-800 dark:text-zinc-200">
                                                    Durasi
                                                </th>
                                                <th scope="col" className="px-5 py-3.5 text-center text-xs font-bold text-zinc-800 dark:text-zinc-200">
                                                    Harga
                                                </th>
                                                <th scope="col" className="px-5 py-3.5 text-center text-xs font-bold text-zinc-800 dark:text-zinc-200">
                                                    Subtotal
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 bg-white dark:bg-zinc-900 text-xs">
                                            {selectedAlatList.length > 0 ? (
                                                selectedAlatList.map((tool: any, idx: number) => (
                                                    <tr key={idx} className="transition-colors hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50">
                                                        <td className="px-5 py-3 text-center text-zinc-500 dark:text-zinc-400 font-medium whitespace-nowrap">
                                                            {idx + 1}
                                                        </td>
                                                        <td className="px-5 py-3 text-left text-zinc-500 dark:text-zinc-400 font-medium font-mono whitespace-nowrap">
                                                            {tool.idAlat}
                                                        </td>
                                                        <td className="px-5 py-3 text-left text-zinc-800 dark:text-zinc-200 font-medium">
                                                            {tool.name}
                                                        </td>
                                                        <td className="px-5 py-3 text-center text-zinc-600 dark:text-zinc-400 font-medium whitespace-nowrap">
                                                            {tool.units}
                                                        </td>
                                                        <td className="px-5 py-3 text-center text-zinc-600 dark:text-zinc-400 font-medium whitespace-nowrap">
                                                            {durationDays} Hari
                                                        </td>
                                                        <td className="px-5 py-3 text-center text-zinc-600 dark:text-zinc-400 font-medium whitespace-nowrap">
                                                            Rp {Number(tool.price).toLocaleString("id-ID")}
                                                        </td>
                                                        <td className="px-5 py-3 text-center text-zinc-800 dark:text-zinc-200 font-medium whitespace-nowrap">
                                                            Rp {Number(tool.subtotal).toLocaleString("id-ID")}
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={7} className="px-5 py-8 text-center text-zinc-500 dark:text-zinc-400 font-medium text-xs">
                                                        Tidak ada data alat yang dipinjam
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                        {selectedAlatList.length > 0 && (
                                            <tfoot className="border-t border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-850/40">
                                                <tr>
                                                    <td colSpan={6} className="px-5 py-3 text-left font-bold text-zinc-800 dark:text-zinc-200 text-xs">
                                                        Total Tagihan
                                                    </td>
                                                    <td className="px-5 py-3 text-center font-extrabold text-[#2C5E3B] dark:text-secondary-green-color text-xs whitespace-nowrap">
                                                        Rp {Number(tiket.tagihan?.jumlah || totalEstimasi || 0).toLocaleString("id-ID")}
                                                    </td>
                                                </tr>
                                            </tfoot>
                                        )}
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Row 2: Dokumen Lampiran (Full width) */}
                        {/* Card 3: Dokumen Lampiran */}
                        <div className="rounded-2xl border border-zinc-200/80 bg-white p-6  shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                            <div className="flex border-b border-zinc-300 dark:border-zinc-800/80 items-center justify-between pb-4 mb-6">
                                <h3 className="text-base font-bold text-[var(--green-color)] dark:text-zinc-200">
                                    Lampiran Pemohon
                                </h3>
                                {lampiranDocs.length > 0 && (
                                    <span className="text-xs whitespace-nowrap font-semibold px-2.5 py-0.5 rounded-full bg-secondary-green-color text-green-color dark:bg-secondary-green-color/20 dark:text-secondary-green-color">
                                        {lampiranDocs.length} Berkas
                                    </span>
                                )}
                            </div>

                            <div className="space-y-4">
                                {lampiranDocs.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {lampiranDocs.map((doc) => (
                                            <div key={doc.id} className="flex items-center justify-between p-3 rounded-xl border border-zinc-300 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/20 gap-3 min-w-0">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary-green-color text-green-color dark:bg-red-950/30 dark:text-red-400">
                                                        <FileText className="h-5 w-5" />
                                                    </div>
                                                    <div className="flex flex-col text-left min-w-0">
                                                        <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate" title={doc.nama_file}>
                                                            {doc.nama_file}
                                                        </span>
                                                        <span className="text-[10px] text-zinc-650 dark:text-zinc-500 font-medium">
                                                            {doc.tipe}
                                                        </span>
                                                    </div>
                                                </div>
                                                <a
                                                    href={doc.url_storage}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-green-color hover:border-green-color transition shrink-0 cursor-pointer shadow-2xs"
                                                >
                                                    <Download className="h-4.5 w-4.5" />
                                                    <span>Unduh</span>
                                                </a>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-6 px-4 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/20 text-center space-y-1">
                                        <File className="h-7 w-7 text-zinc-400 dark:text-zinc-600 mb-1" />
                                        <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Tidak ada dokumen lampiran</p>
                                        <p className="text-[11px] text-zinc-400 dark:text-zinc-500">Pemohon tidak mengunggah berkas tambahan.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Card: Surat Penerimaan (hanya untuk layanan magang-pkl) */}
                    {isMagang && (
                        <div className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                            <div className="bg-[var(--green-color)] px-6 py-4 flex items-center justify-between">
                                <h3 className="text-base text-white font-semibold flex items-center gap-2">
                                    <FileText className="h-4 w-4" />
                                    Surat Penerimaan
                                </h3>
                                {suratPenerimaanDocs.length > 0 && (
                                    <span className="text-xs whitespace-nowrap font-semibold px-2.5 py-0.5 rounded-full bg-white/20 text-white">
                                        {suratPenerimaanDocs.length} Berkas
                                    </span>
                                )}
                            </div>
                            <div className="p-6">
                                {suratPenerimaanDocs.length > 0 ? (
                                    <div className="space-y-3">
                                        {suratPenerimaanDocs.map((doc) => {
                                            const fileUrl = doc.url_storage;
                                            return (
                                                <div
                                                    key={doc.id}
                                                    className="flex items-center justify-between p-3.5 bg-secondary-green-color/30 dark:bg-secondary-green-color/10 border border-green-color/30 dark:border-secondary-green-color/30 rounded-xl"
                                                >
                                                    <div className="flex items-center gap-4 min-w-0">
                                                        <div className="p-2 bg-secondary-green-color dark:bg-secondary-green-color rounded-lg text-green-color shrink-0">
                                                            <FileText className="w-5 h-5" />
                                                        </div>
                                                        <div className="min-w-0 space-y-0.5">
                                                            <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 break-all">
                                                                {doc.nama_file}
                                                            </p>
                                                            <p className="text-[10px] text-zinc-400">
                                                                Diunggah {new Date(doc.tanggal_upload || Date.now()).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                                                            </p>
                                                        </div>
                                                    </div>
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
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-6 px-4 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/20 text-center space-y-1">
                                        <FileText className="h-7 w-7 text-zinc-400 dark:text-zinc-600 mb-1" />
                                        <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Belum ada surat penerimaan</p>
                                        <p className="text-[11px] text-zinc-400 dark:text-zinc-500">Pegawai belum mengunggah surat penerimaan magang / PKL.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Card: Laporan Hasil / Berita Acara */}
                    <div className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                        <div className="bg-[var(--green-color)] px-6 py-4 flex items-center justify-between">
                            <h3 className="text-base text-white font-semibold flex items-center gap-2">
                                Laporan Hasil / Berita Acara
                            </h3>
                            {laporanDocs.length > 0 && (
                                <span className="text-xs whitespace-nowrap font-semibold px-2.5 py-0.5 rounded-full bg-white/20 text-white">
                                    {laporanDocs.length} Berkas
                                </span>
                            )}
                        </div>
                        <div className="p-6">
                            {laporanDocs.length > 0 ? (
                                <div className="space-y-3">
                                    {laporanDocs.map((doc) => {
                                        const fileUrl = doc.url_storage;
                                        return (
                                            <div
                                                key={doc.id}
                                                className="flex items-center justify-between p-3.5 bg-secondary-green-color/30 dark:bg-secondary-green-color/10 border border-green-color/30 dark:border-secondary-green-color/30 rounded-xl"
                                            >
                                                <div className="flex items-center gap-4 min-w-0">
                                                    <div className="p-2 bg-secondary-green-color dark:bg-secondary-green-color rounded-lg text-green-color shrink-0">
                                                        <FileText className="w-5 h-5" />
                                                    </div>
                                                    <div className="min-w-0 space-y-0.5">
                                                        <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 break-all">
                                                            {doc.nama_file}
                                                        </p>
                                                        <p className="text-[10px] text-zinc-400">
                                                            Diunggah {new Date(doc.tanggal_upload || Date.now()).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                                                        </p>
                                                    </div>
                                                </div>
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
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-6 px-4 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/20 text-center space-y-1">
                                    <File className="h-7 w-7 text-zinc-400 dark:text-zinc-600 mb-1" />
                                    <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Belum ada laporan hasil</p>
                                    <p className="text-[11px] text-zinc-400 dark:text-zinc-500">Pegawai belum mengunggah laporan hasil / berita acara.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Card: Sertifikat Magang / PKL (hanya untuk layanan magang-pkl) */}
                    {isMagang && (
                        <div className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                            <div className="bg-[var(--green-color)] px-6 py-4 flex items-center justify-between">
                                <h3 className="text-base text-white font-semibold flex items-center gap-2">
                                    <Award className="h-4 w-4" />
                                    Sertifikat Magang / PKL
                                </h3>
                                {sertifikatDocs.length > 0 && (
                                    <span className="text-xs whitespace-nowrap font-semibold px-2.5 py-0.5 rounded-full bg-white/20 text-white">
                                        {sertifikatDocs.length} Berkas
                                    </span>
                                )}
                            </div>
                            <div className="p-6">
                                {sertifikatDocs.length > 0 ? (
                                    <div className="space-y-3">
                                        {sertifikatDocs.map((doc) => {
                                            const fileUrl = doc.url_storage;
                                            return (
                                                <div
                                                    key={doc.id}
                                                    className="flex items-center justify-between p-3.5 bg-amber-50/60 dark:bg-amber-950/10 border border-amber-200/60 dark:border-amber-800/30 rounded-xl"
                                                >
                                                    <div className="flex items-center gap-4 min-w-0">
                                                        <div className="p-2 bg-amber-100 dark:bg-amber-950/30 rounded-lg text-amber-600 dark:text-amber-400 shrink-0">
                                                            <Award className="w-5 h-5" />
                                                        </div>
                                                        <div className="min-w-0 space-y-0.5">
                                                            <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 break-all">
                                                                {doc.nama_file}
                                                            </p>
                                                            <p className="text-[10px] text-zinc-400">
                                                                Diunggah {new Date(doc.tanggal_upload || Date.now()).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                                                            </p>
                                                        </div>
                                                    </div>
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
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-6 px-4 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/20 text-center space-y-1">
                                        <Award className="h-7 w-7 text-zinc-400 dark:text-zinc-600 mb-1" />
                                        <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Belum ada sertifikat</p>
                                        <p className="text-[11px] text-zinc-400 dark:text-zinc-500">Pegawai belum mengunggah sertifikat magang / PKL.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </main>
            </div >

            {/* Approve Confirmation Modal */}
            <ApproveModal
                isOpen={approveModalOpen}
                onClose={() => setApproveModalOpen(false)}
                onConfirm={handleSetujui}
                serviceSlug={slug || tiket?.layanan?.slug}
                isPeminjamanAlat={false}
                unitTeknisName="Kepala Balai"
                message={
                    <p>
                        Apakah Anda yakin ingin menyetujui verifikasi tiket ini? Permohonan akan diteruskan ke <strong className="text-[#2C5E3B] dark:text-secondary-green-color font-bold">Kepala Balai</strong> untuk disposisi.
                    </p>
                }
                confirmButtonText="Setujui Verifikasi"
                actionLoading={actionLoading}
            />

            {/* Reject Modal */}
            < RejectModal
                isOpen={rejectModalOpen}
                onClose={() => setRejectModalOpen(false)}
                onConfirm={handleTolak}
                actionLoading={actionLoading}
                tiket={tiket}
            />

            {/* Success Modal */}
            < SuccessModal
                isOpen={successModalOpen}
                onClose={() => {
                    setSuccessModalOpen(false);

                    if (successRedirect) {
                        router.push(successRedirect);
                    }
                }}
                title="Berhasil!"
                message={successMessage}
                confirmText="Lanjutkan"
                onConfirm={() => {
                    setSuccessModalOpen(false);

                    if (successRedirect) {
                        router.push(successRedirect);
                    }
                }}
            />

            {/* Error Modal */}
            <ErrorModal
                isOpen={errorModalOpen}
                onClose={() => setErrorModalOpen(false)}
                title="Gagal Memproses"
                message={errorMessage}
            />
        </div >
    );
}
