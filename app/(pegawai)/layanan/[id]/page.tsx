"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Sidebar from "@/components/sidebar/Sidebar";
import AppBar from "@/components/appbar/AppBar";
import BillingModal from "@/components/modal/BillingModal";
import { getUserFromToken } from "@/lib/auth";
import {
    getUnitTeknisTikets,
    mulaiProsesTiket,
    selesaiProsesTiket
} from "@/lib/tiket";
import {
    Sprout,
    Search,
    Clock,
    AlertCircle,
    CheckCircle2,
    DollarSign,
    ClipboardList,
    Play,
    CheckCircle
} from "lucide-react";

interface Tiket {
    id: number;
    no_tiket: string;
    status: "diajukan" | "menunggu_verifikasi" | "perlu_revisi" | "diproses" | "menunggu_pembayaran" | "dibatalkan" | "ditolak" | "selesai_diproses" | "menunggu_konfirmasi" | "selesai";
    createdAt: string;
    layanan: {
        id: number;
        nama: string;
        biaya: any; // { tipe: "gratis" | "tetap" | "per_satuan", nominal?: number }
    };
    user: {
        nama: string;
        email: string;
    };
    jawaban_form?: Record<string, any> | null;
}

const servicesMap: Record<string, string> = {
    "14": "Rekomendasi & Penilaian Kesesuaian SNI",
    "15": "Konsultasi Rekomendasi & Penilaian Kesesuaian SNI",
    "16": "Rekomendasi Siap Tanam",
    "17": "Bimbingan Teknis & Narasumber",
    "18": "Permohonan Data",
    "19": "Peminjaman Alat",
    "20": "Magang Teknis / PKL",
    "21": "Agroedukasi / Kunjungan Edukasi",
    "22": "Layanan Perpustakaan",
    "23": "Layanan Mess",
};

export default function LayananPegawaiDetailPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    const serviceName = servicesMap[id] || "Layanan Tidak Dikenal";

    const [userName, setUserName] = useState("Pegawai");
    const [unitTeknisId, setUnitTeknisId] = useState<number | null>(null);
    const [mounted, setMounted] = useState(false);
    const [tickets, setTickets] = useState<Tiket[]>([]);
    const [filteredTickets, setFilteredTickets] = useState<Tiket[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedStatus, setSelectedStatus] = useState<string>("semua");
    const [tempStatus, setTempStatus] = useState<string>("semua");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Modal state for billing
    const [billingModalOpen, setBillingModalOpen] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState<Tiket | null>(null);
    const [actionLoading, setActionLoading] = useState(false);

    const fetchTickets = async () => {
        setLoading(true);
        try {
            const data = await getUnitTeknisTikets();
            const validData = Array.isArray(data)
                ? data.filter((t: any) => t.status !== "menunggu_persetujuan_kepala_balai")
                : [];
            setTickets(validData);
            setError(null);
        } catch (err: any) {
            console.error(err);
            setError("Gagal mengambil data tiket unit teknis.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setMounted(true);
        const token = localStorage.getItem("agro_token");

        if (!token) {
            router.push("/login");
        } else {
            const user = getUserFromToken();
            if (user) {
                if (user.role !== "pegawai") {
                    router.push("/dashboard-pegawai");
                    return;
                }
                if (user.nama) setUserName(user.nama);
                if (user.unit_teknis_id !== undefined) {
                    setUnitTeknisId(user.unit_teknis_id);
                }
            }
            fetchTickets();
        }
    }, [router]);

    // Filter tickets based on tabs, search query, and current service ID
    useEffect(() => {
        // Filter by service ID first
        let result = tickets.filter(t => t.layanan.id === Number(id));

        // Status filter
        if (selectedStatus !== "semua") {
            if (selectedStatus === "selesai") {
                result = result.filter(t =>
                    t.status === "selesai_diproses" ||
                    t.status === "menunggu_konfirmasi" ||
                    t.status === "selesai"
                );
            } else {
                result = result.filter(t => t.status === selectedStatus);
            }
        }

        // Search query filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(t =>
                t.no_tiket.toLowerCase().includes(query) ||
                t.layanan.nama.toLowerCase().includes(query) ||
                (t.jawaban_form?.nama_lengkap || t.user.nama || "").toLowerCase().includes(query)
            );
        }

        setFilteredTickets(result);
    }, [tickets, selectedStatus, searchQuery, id]);

    const handleMulaiProses = async (ticket: Tiket) => {
        const biaya = ticket.layanan.biaya;
        if (biaya && biaya.tipe === "per_satuan") {
            setSelectedTicket(ticket);
            setBillingModalOpen(true);
        } else {
            // gratis or tetap
            if (confirm(`Apakah Anda yakin ingin memproses tiket ${ticket.no_tiket}?`)) {
                setActionLoading(true);
                try {
                    await mulaiProsesTiket(ticket.id);
                    alert("Berhasil memproses tiket!");
                    fetchTickets();
                } catch (err: any) {
                    alert(err.message || "Gagal memproses tiket");
                } finally {
                    setActionLoading(false);
                }
            }
        }
    };

    const submitBilling = async (jumlahSatuan: number) => {
        if (!selectedTicket) return;
        setActionLoading(true);
        try {
            await mulaiProsesTiket(selectedTicket.id, jumlahSatuan);
            alert("Tagihan berhasil dibuat!");
            setBillingModalOpen(false);
            fetchTickets();
        } catch (err: any) {
            alert(err.message || "Gagal memproses tagihan");
        } finally {
            setActionLoading(false);
        }
    };

    const handleSelesaiProses = async (ticketId: number, noTiket: string) => {
        if (confirm(`Apakah Anda yakin pekerjaan untuk tiket ${noTiket} telah selesai?`)) {
            setActionLoading(true);
            try {
                await selesaiProsesTiket(ticketId);
                alert("Status tiket berhasil diupdate menjadi selesai diproses!");
                fetchTickets();
            } catch (err: any) {
                alert(err.message || "Gagal memperbarui status");
            } finally {
                setActionLoading(false);
            }
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "diproses":
                return "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-400 border border-blue-200/50";
            case "menunggu_pembayaran":
                return "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400 border border-amber-200/50";
            case "selesai_diproses":
            case "menunggu_konfirmasi":
            case "selesai":
                return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400 border border-emerald-200/50";
            default:
                return "bg-zinc-100 text-zinc-800 dark:bg-zinc-950 dark:text-zinc-400 border border-zinc-200/50";
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case "diproses":
                return "Perlu Diproses";
            case "menunggu_pembayaran":
                return "Menunggu Pembayaran";
            case "selesai_diproses":
                return "Selesai Diproses";
            case "menunggu_konfirmasi":
                return "Menunggu Konfirmasi";
            case "selesai":
                return "Selesai";
            default:
                return status;
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
        <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 overflow-hidden font-sans">
            <Sidebar />

            <div className="flex flex-col flex-1 overflow-y-auto">
                <AppBar />

                <main className="flex-1 p-6 space-y-6">
                    {/* Welcome Header */}
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 p-6 text-white shadow-lg shadow-emerald-600/10">
                        <div className="absolute right-0 top-0 -mr-6 -mt-6 opacity-10">
                            <ClipboardList className="h-48 w-48" />
                        </div>
                        <div className="relative z-10 space-y-2">
                            <h2 className="text-2xl font-extrabold md:text-3xl">
                                Penugasan Layanan - {serviceName}
                            </h2>
                            <p className="max-w-xl text-sm text-emerald-50 font-medium">
                                Kelola pengajuan untuk layanan {serviceName} yang diteruskan ke unit teknis Anda.
                            </p>
                        </div>
                    </div>

                    {/* Filter Dropdown & Search Bar */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-4 rounded-xl border border-zinc-200 shadow-xs dark:bg-zinc-900 dark:border-zinc-800">
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                            <input
                                type="text"
                                placeholder="Cari nomor tiket, layanan..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 text-xs border border-zinc-200 rounded-lg focus:outline-hidden focus:border-emerald-500 bg-zinc-50 dark:bg-zinc-950 dark:border-zinc-800"
                            />
                        </div>
                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <select
                                value={tempStatus}
                                onChange={(e) => setTempStatus(e.target.value)}
                                className="w-full md:w-48 px-3 py-2 text-xs border border-zinc-200 rounded-lg focus:outline-hidden focus:border-emerald-500 bg-zinc-50 dark:bg-zinc-950 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 cursor-pointer"
                            >
                                <option value="semua">Semua Status</option>
                                <option value="diproses">Perlu Diproses</option>
                                <option value="selesai">Selesai</option>
                            </select>
                            <button
                                onClick={() => setSelectedStatus(tempStatus)}
                                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-all shadow-xs cursor-pointer flex-shrink-0"
                            >
                                Terapkan
                            </button>
                        </div>
                    </div>

                    {/* Table List */}
                    <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm dark:bg-zinc-900 dark:border-zinc-800 overflow-hidden">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center p-12 space-y-3">
                                <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
                                <span className="text-xs text-zinc-500">Memuat data tiket...</span>
                            </div>
                        ) : error ? (
                            <div className="flex flex-col items-center justify-center p-12 text-zinc-500">
                                <AlertCircle className="h-10 w-10 text-red-500 mb-2" />
                                <span className="text-sm font-semibold">{error}</span>
                            </div>
                        ) : filteredTickets.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-16 text-zinc-450 dark:text-zinc-500 text-center">
                                <Clock className="h-12 w-12 text-zinc-350 dark:text-zinc-600 mb-3" />
                                <h3 className="font-bold text-sm">Tidak Ada Tiket</h3>
                                <p className="text-xs text-zinc-400 max-w-xs mt-1">
                                    Belum ada tiket masuk untuk layanan ini dengan kriteria filter yang Anda pilih.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-zinc-200/80 dark:divide-zinc-800">
                                    <thead className="bg-[#E5E7EB]/50 dark:bg-zinc-950">
                                        <tr>
                                            <th scope="col" className="px-6 py-4.5 text-left text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider">Nomor Tiket</th>
                                            <th scope="col" className="px-6 py-4.5 text-left text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider">Layanan</th>
                                            <th scope="col" className="px-6 py-4.5 text-left text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider">Pemohon</th>
                                            <th scope="col" className="px-6 py-4.5 text-left text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider">Tanggal Masuk</th>
                                            <th scope="col" className="px-6 py-4.5 text-center text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider">Status</th>
                                            <th scope="col" className="px-6 py-4.5 text-center text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 bg-white dark:bg-zinc-900">
                                        {filteredTickets.map((ticket) => (
                                            <tr key={ticket.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 transition-colors">
                                                <td className="px-6 py-5.5 whitespace-nowrap text-sm font-semibold text-[#2C5E3B] dark:text-emerald-450 text-left">
                                                    {ticket.no_tiket}
                                                </td>
                                                <td className="px-6 py-5.5 whitespace-nowrap text-sm text-left">
                                                    <div className="space-y-0.5">
                                                        <span className="font-semibold text-zinc-950 dark:text-zinc-200 block text-sm">
                                                            {ticket.layanan.nama}
                                                        </span>
                                                        <span className="text-xs text-zinc-500 dark:text-zinc-400 capitalize block">
                                                            Tipe Biaya: {ticket.layanan.biaya?.tipe}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5.5 whitespace-nowrap text-sm text-left">
                                                    <div className="space-y-0.5">
                                                        <span className="font-medium text-zinc-800 dark:text-zinc-200 block text-sm">
                                                            {ticket.jawaban_form?.nama_lengkap || ticket.user.nama}
                                                        </span>
                                                        <span className="text-xs text-zinc-400 block">{ticket.user.email}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5.5 whitespace-nowrap text-sm text-zinc-500 dark:text-zinc-400 font-base text-left">
                                                    {new Date(ticket.createdAt).toLocaleDateString("id-ID", {
                                                        day: "numeric",
                                                        month: "short",
                                                        year: "numeric"
                                                    })}
                                                </td>
                                                <td className="px-6 py-5.5 whitespace-nowrap text-sm text-center">
                                                    <div className="flex justify-center">
                                                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold inline-block border ${getStatusColor(ticket.status)}`}>
                                                            {getStatusLabel(ticket.status)}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5.5 whitespace-nowrap text-sm text-center">
                                                    <div className="flex justify-center">
                                                        <button
                                                            onClick={() => router.push(`/layanan/${id}/${ticket.id}`)}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm hover:shadow-md transition cursor-pointer text-xs"
                                                        >
                                                            Detail
                                                        </button>

                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* Billing Modal */}
            <BillingModal
                isOpen={billingModalOpen}
                onClose={() => setBillingModalOpen(false)}
                onConfirm={submitBilling}
                ticket={selectedTicket}
                actionLoading={actionLoading}
            />
        </div>
    );
}
