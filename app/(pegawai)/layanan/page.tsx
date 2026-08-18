"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
    status: "diajukan" | "menunggu_verifikasi" | "perlu_revisi" | "diproses" | "menunggu_pembayaran" | "dibatalkan" | "ditolak" | "menunggu_konfirmasi" | "selesai";
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

export default function LayananPegawaiPage() {
    const router = useRouter();
    const [userName, setUserName] = useState("Pegawai");
    const [unitTeknisId, setUnitTeknisId] = useState<number | null>(null);
    const [mounted, setMounted] = useState(false);
    const [tickets, setTickets] = useState<Tiket[]>([]);
    const [filteredTickets, setFilteredTickets] = useState<Tiket[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState<"semua" | "proses" | "tagihan" | "selesai">("semua");
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
            setTickets(data);
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

    // Filter tickets based on tabs and search query
    useEffect(() => {
        let result = tickets;

        // Tab filter
        if (activeTab === "proses") {
            result = tickets.filter(t => t.status === "diproses");
        } else if (activeTab === "tagihan") {
            result = tickets.filter(t => t.status === "menunggu_pembayaran");
        } else if (activeTab === "selesai") {
            result = tickets.filter(t =>
                t.status === "menunggu_konfirmasi" ||
                t.status === "selesai"
            );
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
    }, [tickets, activeTab, searchQuery]);

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
                alert("Status tiket berhasil diupdate menjadi selesai!");
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
                                Penugasan Layanan Masuk
                            </h2>
                            <p className="max-w-xl text-sm text-emerald-50 font-medium">
                                Kelola pengajuan layanan yang telah disetujui admin dan diteruskan ke unit teknis Anda.
                            </p>
                        </div>
                    </div>

                    {/* Filter Tabs & Search Bar */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-4 rounded-xl border border-zinc-200 shadow-xs dark:bg-zinc-900 dark:border-zinc-800">
                        <div className="flex flex-wrap gap-1">
                            {(["semua", "proses", "tagihan", "selesai"] as const).map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all capitalize cursor-pointer ${activeTab === tab
                                        ? "bg-emerald-600 text-white shadow-xs"
                                        : "text-zinc-650 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800"
                                        }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        <div className="relative w-full md:w-80">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                            <input
                                type="text"
                                placeholder="Cari nomor tiket, layanan..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 text-xs border border-zinc-200 rounded-lg focus:outline-hidden focus:border-emerald-500 bg-zinc-50 dark:bg-zinc-950 dark:border-zinc-800"
                            />
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
                                    Belum ada tiket masuk dengan kriteria filter yang Anda pilih.
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
                                                        {ticket.status === "diproses" ? (
                                                            ticket.layanan.biaya?.tipe === "gratis" ? (
                                                                <button
                                                                    onClick={() => handleSelesaiProses(ticket.id, ticket.no_tiket)}
                                                                    disabled={actionLoading}
                                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm hover:shadow-md transition cursor-pointer text-xs"
                                                                >
                                                                    <CheckCircle className="h-3.5 w-3.5" />
                                                                    Selesaikan
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    onClick={() => handleMulaiProses(ticket)}
                                                                    disabled={actionLoading}
                                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm hover:shadow-md transition cursor-pointer text-xs"
                                                                >
                                                                    <Play className="h-3.5 w-3.5" />
                                                                    Buat Tagihan
                                                                </button>
                                                            )
                                                        ) : ticket.status === "menunggu_pembayaran" ? (
                                                            <span className="text-xs text-zinc-500 italic font-medium">Menunggu Pembayaran Pemohon</span>
                                                        ) : (
                                                            <span className="text-xs text-emerald-600 font-semibold flex items-center justify-center gap-1">
                                                                <CheckCircle2 className="h-4 w-4" />
                                                                Selesai
                                                            </span>
                                                        )}
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
