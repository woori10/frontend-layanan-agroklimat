"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/sidebar/Sidebar";
import AppBar from "@/components/appbar/AppBar";
import CardDashboard from "@/components/card/card-dashboard/CardDashboard";
import { getUserFromToken, getRedirectPath } from "@/lib/auth";
import { getAuditLogs } from "@/lib/tiket";
import {
    History,
    Search,
    ChevronRight,
    ChevronDown,
    ChevronUp,
    RefreshCw,
    ListFilter,
    ArrowUpDown,
    Clock,
    Users,
    FileSpreadsheet,
    FileText,
    Loader2,
} from "lucide-react";
import StatusLayananBadge from "@/components/badge/status-layanan/StatusLayananBadge";

interface AuditLog {
    id: number;
    user_id: number | null;
    tiket_id: number | null;
    aksi: string;
    detail_perubahan: string | null;
    timestamp: string;
    user: {
        id: number;
        nama: string;
        email: string;
        role: string;
        unit_teknis?: {
            nama: string;
        } | null;
    } | null;
    tiket: {
        id: number;
        no_tiket: string;
        status: string;
    } | null;
}

export default function AuditLogPage() {
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Core data states
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Filtering & Pagination states
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedRole, setSelectedRole] = useState("semua");
    const [selectedAction, setSelectedAction] = useState("semua");
    const [sortOrder, setSortOrder] = useState<"terbaru" | "terlama">("terbaru");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [expandedRowIds, setExpandedRowIds] = useState<Record<number, boolean>>({});
    const [isExportingExcel, setIsExportingExcel] = useState(false);
    const [isExportingPdf, setIsExportingPdf] = useState(false);

    const toggleRowExpand = (id: number) => {
        setExpandedRowIds(prev => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    // Fetch Audit Logs
    const fetchLogs = async () => {
        setLoading(true);
        setError("");
        try {
            const data = await getAuditLogs();
            setLogs(data);
            setFilteredLogs(data);
        } catch (err: any) {
            setError(err.message || "Gagal memuat data audit log.");
        } finally {
            setLoading(false);
        }
    };

    // Authenticate on client side
    useEffect(() => {
        setMounted(true);
        const token = localStorage.getItem("agro_token");

        if (!token) {
            router.push("/login/pegawai");
        } else {
            const user = getUserFromToken();
            if (user) {
                if (user.role !== "super_admin" && user.role !== "kepala_balai") {
                    router.push(getRedirectPath(user.role));
                    return;
                }
            }
            fetchLogs();
        }
    }, [router]);

    // Apply filtering whenever logs, search, or filters change
    useEffect(() => {
        let result = [...logs];

        // Apply search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(log => {
                const userMatch = log.user?.nama?.toLowerCase().includes(query) ||
                    log.user?.email?.toLowerCase().includes(query);
                const ticketMatch = log.tiket?.no_tiket?.toLowerCase().includes(query);
                const actionMatch = log.aksi?.toLowerCase().includes(query) ||
                    log.detail_perubahan?.toLowerCase().includes(query);
                return userMatch || ticketMatch || actionMatch;
            });
        }

        // Apply role filter
        if (selectedRole !== "semua") {
            result = result.filter(log => log.user?.role === selectedRole);
        }

        // Apply action filter
        if (selectedAction !== "semua") {
            result = result.filter(log => log.aksi === selectedAction);
        }

        // Apply sort
        result.sort((a, b) => {
            const timeA = new Date(a.timestamp).getTime();
            const timeB = new Date(b.timestamp).getTime();
            return sortOrder === "terbaru" ? timeB - timeA : timeA - timeB;
        });

        setFilteredLogs(result);
        setCurrentPage(1);
    }, [logs, searchQuery, selectedRole, selectedAction, sortOrder]);

    // Pagination calculations
    const totalItems = filteredLogs.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    const currentLogs = filteredLogs.slice(startIndex, endIndex);

    // Format ISO string to Indonesian date time format
    const formatDateTime = (dateStr: string) => {
        try {
            const d = new Date(dateStr);
            return d.toLocaleString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            });
        } catch {
            return dateStr;
        }
    };

    // timeAgo helper like dashboard
    const timeAgo = (dateStr: string): string => {
        const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
        if (diff < 60) return `${Math.floor(diff)} detik lalu`;
        if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
        if (diff < 604800) return `${Math.floor(diff / 86400)} hari lalu`;
        return formatDateTime(dateStr);
    };

    // Get pretty action labels and styles
    const getActionDetails = (aksi: string) => {
        switch (aksi) {
            case "tiket_dibuat":
                return { label: "Tiket Diajukan", bg: "bg-secondary-green-color text-secondary-green-color dark:bg-secondary-green-color/30 dark:text-secondary-green-color" };
            case "menunggu_verifikasi":
                return { label: "Submit Ulang (Revisi)", bg: "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400" };
            case "perlu_revisi":
                return { label: "Minta Revisi", bg: "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400" };
            case "ditolak":
                return { label: "Tiket Ditolak", bg: "bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400" };
            case "menunggu_persetujuan_kepala_balai":
                return { label: "Diverifikasi Admin", bg: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400" };
            case "menunggu_pembayaran":
                return { label: "Disetujui Kepala Balai", bg: "bg-cyan-50 text-cyan-700 dark:bg-cyan-950/30 dark:text-cyan-400" };
            case "diproses":
                return { label: "Mulai Diproses", bg: "bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400" };
            case "selesai":
                return { label: "Proses Selesai", bg: "bg-teal-50 text-teal-700 dark:bg-teal-950/30 dark:text-teal-400" };
            case "dibatalkan":
                return { label: "Dibatalkan", bg: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400" };
            default:
                return { label: aksi.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" "), bg: "bg-zinc-50 text-zinc-700 dark:bg-zinc-950/20 dark:text-zinc-300" };
        }
    };

    // Export Audit Log to Excel (.xlsx)
    const exportToExcel = async () => {
        if (filteredLogs.length === 0) {
            alert("Tidak ada data audit log untuk diekspor.");
            return;
        }

        setIsExportingExcel(true);
        try {
            const XLSX = await import("xlsx");

            const dataToExport = filteredLogs.map((log, index) => {
                const nama = log.user?.nama || "System";
                const subLabel = log.user
                    ? log.user.role === "publik"
                        ? log.user.email
                        : log.user.role === "pegawai"
                            ? log.user.unit_teknis?.nama || ""
                            : ""
                    : "";

                return {
                    "No": index + 1,
                    "No. Tiket": log.tiket?.no_tiket || "-",
                    "Waktu": formatDateTime(log.timestamp),
                    "Nama Pengguna": nama,
                    "Email / Unit Teknis": subLabel || "-",
                    "Peran": log.user ? getRoleLabel(log.user.role) : "-",
                    "Aktivitas": getActionDetails(log.aksi)?.label || log.aksi,
                    "Detail Perubahan": log.detail_perubahan || "-",
                };
            });

            const worksheet = XLSX.utils.json_to_sheet(dataToExport);

            worksheet["!cols"] = [
                { wch: 6 },
                { wch: 26 },
                { wch: 22 },
                { wch: 24 },
                { wch: 28 },
                { wch: 16 },
                { wch: 24 },
                { wch: 50 },
            ];

            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Audit Log");

            const dateStr = new Date().toISOString().slice(0, 10);
            XLSX.writeFile(workbook, `audit-log-agroklimat-${dateStr}.xlsx`);
        } catch (err: any) {
            console.error("Export Excel error:", err);
            alert("Gagal mengunduh file Excel: " + err.message);
        } finally {
            setIsExportingExcel(false);
        }
    };

    // Export Audit Log to PDF (.pdf)
    const exportToPdf = async () => {
        if (filteredLogs.length === 0) {
            alert("Tidak ada data audit log untuk diekspor.");
            return;
        }

        setIsExportingPdf(true);
        try {
            const jsPDFModule = await import("jspdf");
            const jsPDF = jsPDFModule.default;
            const autoTable = (await import("jspdf-autotable")).default;

            const doc = new jsPDF({
                orientation: "landscape",
                unit: "pt",
                format: "a4",
            });

            // Header Dokumen
            doc.setFontSize(13);
            doc.setTextColor(44, 94, 59);
            doc.text("BALAI STANDARDISASI INSTRUMEN PERTANIAN (BSIP)", doc.internal.pageSize.getWidth() / 2, 35, { align: "center" });

            doc.setFontSize(11);
            doc.setTextColor(50, 50, 50);
            doc.text("Laporan Audit Log Aktivitas Sistem Layanan Agroklimat", doc.internal.pageSize.getWidth() / 2, 52, { align: "center" });

            doc.setFontSize(8);
            doc.setTextColor(120, 120, 120);
            const exportDate = new Date().toLocaleString("id-ID", { dateStyle: "long", timeStyle: "short" });
            doc.text(`Waktu Cetak: ${exportDate} | Jumlah Rekaman: ${filteredLogs.length} data`, doc.internal.pageSize.getWidth() / 2, 66, { align: "center" });

            // Garis pembatas
            doc.setDrawColor(210, 210, 210);
            doc.setLineWidth(1);
            doc.line(30, 75, doc.internal.pageSize.getWidth() - 30, 75);

            const tableRows = filteredLogs.map((log, index) => {
                const nama = log.user?.nama || "System";
                const subLabel = log.user
                    ? log.user.role === "publik"
                        ? log.user.email
                        : log.user.role === "pegawai"
                            ? log.user.unit_teknis?.nama || ""
                            : ""
                    : "";

                return [
                    index + 1,
                    log.tiket?.no_tiket || "-",
                    formatDateTime(log.timestamp),
                    subLabel ? `${nama}\n(${subLabel})` : nama,
                    log.user ? getRoleLabel(log.user.role) : "-",
                    getActionDetails(log.aksi)?.label || log.aksi,
                    log.detail_perubahan || "-",
                ];
            });

            autoTable(doc, {
                head: [["No.", "No. Tiket", "Waktu", "Nama Pengguna", "Peran", "Aktivitas", "Detail Perubahan"]],
                body: tableRows,
                startY: 85,
                theme: "grid",
                headStyles: {
                    fillColor: [44, 94, 59],
                    textColor: [255, 255, 255],
                    fontSize: 8,
                    fontStyle: "bold",
                    halign: "center",
                },
                bodyStyles: {
                    fontSize: 7.5,
                    textColor: [40, 40, 40],
                    valign: "top",
                },
                columnStyles: {
                    0: { halign: "center", cellWidth: 25 },
                    1: { cellWidth: 120, fontStyle: "bold" },
                    2: { cellWidth: 95 },
                    3: { cellWidth: 125 },
                    4: { cellWidth: 70, halign: "center" },
                    5: { cellWidth: 95, halign: "center" },
                    6: { cellWidth: "auto" },
                },
                alternateRowStyles: {
                    fillColor: [248, 250, 248],
                },
                margin: { left: 30, right: 30, bottom: 30 },
                didDrawPage: (data: any) => {
                    const pageNo = data.pageNumber || ((doc as any).getNumberOfPages ? (doc as any).getNumberOfPages() : 1);
                    const str = `Halaman ${pageNo}`;
                    doc.setFontSize(8);
                    doc.setTextColor(140);
                    doc.text(str, doc.internal.pageSize.getWidth() - 40, doc.internal.pageSize.getHeight() - 15, { align: "right" });
                },
            });

            const dateStr = new Date().toISOString().slice(0, 10);
            doc.save(`audit-log-agroklimat-${dateStr}.pdf`);
        } catch (err: any) {
            console.error("Export PDF error:", err);
            alert("Gagal mengunduh file PDF: " + err.message);
        } finally {
            setIsExportingPdf(false);
        }
    };

    // Get pretty role label
    const getRoleLabel = (role: string) => {
        const map: Record<string, string> = {
            super_admin: "Super Admin",
            kepala_balai: "Kepala Balai",
            admin: "Admin",
            pegawai: "Pegawai",
            publik: "Publik",
        };
        return map[role] || role.replace("_", " ").replace(/\b\w/g, c => c.toUpperCase());
    };

    if (!mounted) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-secondary-green-color border-t-transparent"></div>
            </div>
        );
    }

    // Unique actions list for dropdown filter
    const uniqueActions = Array.from(new Set(logs.map(log => log.aksi)));

    // Stats calculations
    const statsTotalLogs = logs.length;
    const statsUniqueUsers = Array.from(new Set(logs.map(log => log.user_id).filter(Boolean))).length;
    const statsRecentLogs = logs.filter(log => {
        const logDate = new Date(log.timestamp);
        const today = new Date();
        const diffTime = Math.abs(today.getTime() - logDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 1; // within last 24h
    }).length;

    return (
        <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 overflow-hidden font-sans">
            {/* Sidebar for Desktop */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex flex-col flex-1 overflow-y-auto">
                {/* Top Navbar */}
                <AppBar onMenuClick={() => setSidebarOpen(true)} />

                {/* Content Container */}
                <main className="flex-1 p-8 space-y-6">
                    {/* Header Section */}
                    <div className="flex justify-between items-center w-full relative overflow-hidden space-y-3">
                        <div className="space-y-3">
                            <h1 className="text-2xl font-semibold md:text-3xl text-[var(--foreground)] dark:text-zinc-50">
                                <span className="text-green-color">Audit Log</span> Sistem
                            </h1>
                            <p className="text-sm font-medium">
                                Memantau seluruh aktivitas administratif, perubahan status permohonan layanan, dan tindakan pengguna secara realtime.
                            </p>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <CardDashboard
                            title="Total Log Aktivitas"
                            icon={History}
                            iconBgClass="bg-yellow-400"
                            iconColorClass="text-white"
                            value={loading ? "..." : statsTotalLogs}
                            desc="log"
                        />
                        <CardDashboard
                            title="Total Log Hari Ini"
                            icon={Clock}
                            iconBgClass="bg-green-700"
                            iconColorClass="text-white"
                            value={loading ? "..." : statsRecentLogs}
                            desc="log"
                        />
                        <CardDashboard
                            title="Pengguna Aktif"
                            icon={Users}
                            iconBgClass="bg-blue-500"
                            iconColorClass="text-white"
                            value={loading ? "..." : statsUniqueUsers}
                            desc="pengguna"
                        />
                    </div>

                    {/* Table Container */}
                    <div className="rounded-2xl p-4 sm:p-6 border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">

                        {/* Error Banner */}
                        {error && (
                            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">
                                {error}
                                <button onClick={fetchLogs} className="ml-3 underline font-semibold">Coba Lagi</button>
                            </div>
                        )}

                        {/* Control Panel */}
                        <div className="mb-6 flex flex-col gap-4">
                            <div className="flex justify-between items-center flex-wrap gap-3">

                                {/* Tab Filter Aksi (kiri) — style seperti kelola-pegawai */}
                                {/* <div className="flex rounded-xl bg-secondary-green-color p-2 dark:border-zinc-700 dark:bg-zinc-800">
                                    {[
                                        { label: "Semua", value: "semua", count: logs.length },
                                        { label: "Tiket Diajukan", value: "tiket_dibuat", count: logs.filter(l => l.aksi === "tiket_dibuat").length },
                                        { label: "Diproses", value: "diproses", count: logs.filter(l => l.aksi === "diproses").length },
                                        { label: "Selesai", value: "selesai", count: logs.filter(l => l.aksi === "selesai").length },
                                        { label: "Ditolak", value: "ditolak", count: logs.filter(l => l.aksi === "ditolak").length },
                                    ].map((item) => (
                                        <button
                                            key={item.value}
                                            onClick={() => {
                                                setSelectedAction(item.value);
                                                setCurrentPage(1);
                                            }}
                                            className={`rounded-lg px-4 py-2 text-xs font-medium transition ${selectedAction === item.value
                                                ? "bg-white text-[var(--green-color)] shadow-sm dark:bg-zinc-900"
                                                : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400"
                                                }`}
                                        >
                                            {item.label}
                                            <span className="ml-1.5 text-[10px]">({item.count})</span>
                                        </button>
                                    ))}
                                </div> */}
                                <div>
                                    <p className="text-[var-(--foreground)] text-lg font-semibold">Log Aktivitas</p>
                                </div>

                                {/* Filter kanan */}
                                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                                    {/* Search */}
                                    <div className="relative flex-1 sm:w-64 min-w-[160px]">
                                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                                        <input
                                            type="text"
                                            placeholder="Cari nama, tiket, aksi..."
                                            value={searchQuery}
                                            onChange={(e) => {
                                                setSearchQuery(e.target.value);
                                                setCurrentPage(1);
                                            }}
                                            className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 pl-10 pr-4 text-xs outline-none transition focus:border-[var(--green-color)] focus:ring-2 focus:ring-[var(--green-color)]/10 dark:border-zinc-700 dark:bg-zinc-900"
                                        />
                                    </div>

                                    {/* Filter Peran */}
                                    <div className="relative">
                                        <ListFilter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                                        <select
                                            value={selectedRole}
                                            onChange={(e) => {
                                                setSelectedRole(e.target.value);
                                                setCurrentPage(1);
                                            }}
                                            className="appearance-none rounded-xl border border-zinc-200 bg-white py-2.5 pl-10 pr-9 text-xs outline-none transition focus:border-[var(--green-color)] focus:ring-2 focus:ring-[var(--green-color)]/10 dark:border-zinc-700 dark:bg-zinc-900"
                                        >
                                            <option value="semua">Semua Peran</option>
                                            <option value="super_admin">Super Admin</option>
                                            <option value="kepala_balai">Kepala Balai</option>
                                            <option value="admin">Admin</option>
                                            <option value="pegawai">Pegawai</option>
                                            <option value="publik">Publik</option>
                                        </select>
                                        <ChevronRight className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90 text-zinc-400" />
                                    </div>

                                    {/* Sort Button */}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSortOrder(prev => prev === "terbaru" ? "terlama" : "terbaru");
                                            setCurrentPage(1);
                                        }}
                                        className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-xs text-zinc-600 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 cursor-pointer"
                                        title={sortOrder === "terbaru" ? "Urutkan dari terlama" : "Urutkan dari terbaru"}
                                    >
                                        <ArrowUpDown className="h-4 w-4" />
                                    </button>

                                    {/* Refresh Button */}
                                    <button
                                        onClick={fetchLogs}
                                        title="Segarkan data"
                                        className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-xs text-zinc-600 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 cursor-pointer"
                                    >
                                        <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                                    </button>

                                    {/* Export Excel Button */}
                                    <button
                                        type="button"
                                        onClick={exportToExcel}
                                        disabled={isExportingExcel || loading || filteredLogs.length === 0}
                                        className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-600/30 bg-emerald-50 px-3 py-2.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300 dark:hover:bg-emerald-900/50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
                                        title="Ekspor data audit log ke Excel (.xlsx)"
                                    >
                                        {isExportingExcel ? (
                                            <Loader2 className="h-4 w-4 animate-spin text-emerald-700 dark:text-emerald-300" />
                                        ) : (
                                            <FileSpreadsheet className="h-4 w-4 text-emerald-700 dark:text-emerald-300" />
                                        )}
                                        <span className="hidden sm:inline">Excel</span>
                                    </button>

                                    {/* Export PDF Button */}
                                    <button
                                        type="button"
                                        onClick={exportToPdf}
                                        disabled={isExportingPdf || loading || filteredLogs.length === 0}
                                        className="inline-flex items-center gap-1.5 rounded-xl border border-rose-600/30 bg-rose-50 px-3 py-2.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300 dark:hover:bg-rose-900/50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
                                        title="Ekspor data audit log ke PDF (.pdf)"
                                    >
                                        {isExportingPdf ? (
                                            <Loader2 className="h-4 w-4 animate-spin text-rose-700 dark:text-rose-300" />
                                        ) : (
                                            <FileText className="h-4 w-4 text-rose-700 dark:text-rose-300" />
                                        )}
                                        <span className="hidden sm:inline">PDF</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="w-full overflow-hidden">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-secondary-green-color border-t-transparent"></div>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Memuat log aktivitas...</p>
                                </div>
                            ) : currentLogs.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-zinc-400 dark:text-zinc-500">
                                    <History className="h-12 w-12 stroke-1 mb-2" />
                                    <p className="text-sm font-semibold">Tidak Ada Log Aktivitas</p>
                                    <p className="text-xs">Coba sesuaikan kata kunci pencarian atau filter Anda.</p>
                                </div>
                            ) : (
                                <table className="w-full table-fixed divide-y divide-zinc-200/80 dark:divide-zinc-800">
                                    {/* Header — green seperti kelola-pegawai */}
                                    <thead className="bg-[var(--secondary-green-color)]">
                                        <tr>
                                            <th scope="col" className="w-[4%] px-1 py-3 text-center text-xs font-semibold text-[var(--foreground)] tracking-wider">
                                                No.
                                            </th>
                                            <th scope="col" className="w-[21%] px-2.5 py-3 text-left text-xs font-semibold text-[var(--foreground)] tracking-wider">
                                                No. Tiket
                                            </th>
                                            <th scope="col" className="w-[13%] px-2 py-3 text-left text-xs font-semibold text-[var(--foreground)] tracking-wider">
                                                Waktu
                                            </th>
                                            <th scope="col" className="w-[13%] px-2 py-3 text-left text-xs font-semibold text-[var(--foreground)] tracking-wider">
                                                Nama Pengguna
                                            </th>
                                            <th scope="col" className="w-[10%] px-2 py-3 text-left text-xs font-semibold text-[var(--foreground)] tracking-wider">
                                                Peran
                                            </th>
                                            <th scope="col" className="w-[14%] px-2 py-3 text-center text-xs font-semibold text-[var(--foreground)] tracking-wider">
                                                Aktivitas
                                            </th>
                                            <th scope="col" className="w-[25%] px-3 py-3 text-left text-xs font-semibold text-[var(--foreground)] tracking-wider">
                                                Detail Perubahan
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 bg-white dark:bg-zinc-900">
                                        {currentLogs.map((log, index) => {
                                            const nama = log.user?.nama || "System";
                                            const subLabel = log.user
                                                ? log.user.role === "publik"
                                                    ? log.user.email
                                                    : log.user.role === "pegawai"
                                                        ? log.user.unit_teknis?.nama || ""
                                                        : ""
                                                : "";
                                            const isExpanded = !!expandedRowIds[log.id];

                                            return (
                                                <tr
                                                    key={log.id}
                                                    onClick={() => toggleRowExpand(log.id)}
                                                    className={`cursor-pointer transition-colors ${
                                                        isExpanded
                                                            ? "bg-emerald-50/40 dark:bg-emerald-950/20"
                                                            : "hover:bg-zinc-50/80 dark:hover:bg-zinc-800/50"
                                                    }`}
                                                    title={isExpanded ? "Klik untuk merapatkan kembali" : "Klik untuk melihat seluruh pesan yang terpotong"}
                                                >
                                                    {/* No */}
                                                    <td className="px-1 py-3 whitespace-nowrap text-xs text-zinc-500 text-center align-top">
                                                        {startIndex + index + 1}
                                                    </td>

                                                    {/* No Tiket — sejajar kiri, tidak ketimpa */}
                                                    <td className="px-2.5 py-3 whitespace-nowrap text-left align-top">
                                                        {log.tiket ? (
                                                            <span
                                                                className="text-xs font-bold text-[#2C5E3B] dark:text-secondary-green-color block whitespace-nowrap"
                                                                title={log.tiket.no_tiket}
                                                            >
                                                                {log.tiket.no_tiket}
                                                            </span>
                                                        ) : (
                                                            <span className="text-xs text-zinc-300 dark:text-zinc-700">-</span>
                                                        )}
                                                    </td>

                                                    {/* Waktu — sejajar kiri, format bersih */}
                                                    <td className="px-2 py-3 whitespace-nowrap text-left align-top">
                                                        <div className="flex flex-col text-left">
                                                            <span className="text-xs text-zinc-500 dark:text-zinc-400 whitespace-nowrap" title={formatDateTime(log.timestamp)}>
                                                                {timeAgo(log.timestamp)}
                                                            </span>
                                                            {isExpanded && (
                                                                <span className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1 leading-tight whitespace-nowrap">
                                                                    {formatDateTime(log.timestamp)}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>

                                                    {/* Nama Pengguna — ukuran dikecilkan */}
                                                    <td className="px-2 py-3 text-left align-top min-w-0">
                                                        <div className="flex flex-col min-w-0">
                                                            <span
                                                                className={`text-xs font-medium text-zinc-700 dark:text-zinc-300 ${
                                                                    isExpanded ? "break-words leading-tight" : "truncate"
                                                                }`}
                                                                title={nama}
                                                            >
                                                                {nama}
                                                            </span>
                                                            {subLabel && (
                                                                <span
                                                                    className={`text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5 ${
                                                                        isExpanded ? "break-words leading-tight" : "truncate"
                                                                    }`}
                                                                    title={subLabel}
                                                                >
                                                                    {subLabel}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>

                                                    {/* Peran */}
                                                    <td className="px-2 py-3 whitespace-nowrap text-left text-xs text-zinc-500 align-top">
                                                        {log.user ? getRoleLabel(log.user.role) : "-"}
                                                    </td>

                                                    {/* Aktivitas */}
                                                    <td className="px-2 py-3 whitespace-nowrap text-center align-top">
                                                        <div className="flex justify-center">
                                                            <StatusLayananBadge status={log.aksi} className="whitespace-nowrap" />
                                                        </div>
                                                    </td>

                                                    {/* Detail Perubahan — tampil penuh jika dibuka */}
                                                    <td className="px-3 py-3 text-left text-xs text-zinc-500 dark:text-zinc-400 align-top" title={log.detail_perubahan || ""}>
                                                        <div className="flex items-start justify-between gap-2">
                                                            <p className={`break-words leading-relaxed ${isExpanded ? "whitespace-pre-wrap" : "line-clamp-2"}`}>
                                                                {log.detail_perubahan || <span className="text-zinc-300 dark:text-zinc-700 italic">-</span>}
                                                            </p>
                                                            {log.detail_perubahan && log.detail_perubahan.length > 20 && (
                                                                <span className="shrink-0 text-zinc-400 dark:text-zinc-500 mt-0.5" aria-hidden="true">
                                                                    {isExpanded ? (
                                                                        <ChevronUp className="h-4 w-4 text-[var(--green-color)]" />
                                                                    ) : (
                                                                        <ChevronDown className="h-4 w-4" />
                                                                    )}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        {/* Pagination — numbered seperti kelola-pegawai */}
                        {!loading && filteredLogs.length > 0 && (
                            <div className="flex items-center justify-between border-t border-zinc-200 px-2 pt-5 dark:border-zinc-800">
                                {/* Info jumlah data */}
                                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                    Menampilkan{" "}
                                    <span className="font-medium text-zinc-900 dark:text-zinc-100">
                                        {filteredLogs.length === 0 ? 0 : startIndex + 1}
                                    </span>
                                    –
                                    <span className="font-medium text-zinc-900 dark:text-zinc-100">
                                        {endIndex}
                                    </span>{" "}
                                    dari{" "}
                                    <span className="font-medium text-zinc-900 dark:text-zinc-100">
                                        {totalItems}
                                    </span>{" "}
                                    log
                                </p>

                                {/* Pagination dengan nomor */}
                                <div className="flex items-center gap-1">
                                    {/* Previous */}
                                    <button
                                        onClick={() => setCurrentPage(prev => prev - 1)}
                                        disabled={currentPage === 1}
                                        className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-zinc-800"
                                    >
                                        ‹
                                    </button>

                                    {/* Page numbers */}
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-sm font-medium transition ${currentPage === page
                                                ? "bg-[var(--green-color)] text-white"
                                                : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    ))}

                                    {/* Next */}
                                    <button
                                        onClick={() => setCurrentPage(prev => prev + 1)}
                                        disabled={currentPage === totalPages}
                                        className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-zinc-800"
                                    >
                                        ›
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
