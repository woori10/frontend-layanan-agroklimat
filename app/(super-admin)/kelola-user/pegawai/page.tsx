"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/sidebar/Sidebar";
import AppBar from "@/components/appbar/AppBar";
import RoleUserBadge from "@/components/badge/role-user/RoleUserBadge";
import { getUserFromToken, getRedirectPath } from "@/lib/auth";
import { getApiUrl } from "@/lib/api";
import {
    Users,
    ShieldAlert,
    Pencil,
    Trash2,
    Plus,
    Search,
    ChevronDown,
    ArrowUpDown,
    ListFilter,
    FileDown,
    KeyRound,
    Copy,
    Check,
    Download,
    CheckCircle2,
} from "lucide-react";

interface UnitTeknis {
    id: number;
    nama: string;
}

interface User {
    id: number;
    nama: string;
    username: string | null;
    nip: string | null;
    email: string | null;
    no_hp: string | null;
    role: string;
    status_akun: string;
    unit_teknis: UnitTeknis | null;
}

interface CredentialModalData {
    username: string;
    role: string;
    unit_teknis?: string | null;
    password?: string;
}

export default function PegawaiPage() {
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isExportingPdf, setIsExportingPdf] = useState(false);

    // Kredensial download state
    const [generatingId, setGeneratingId] = useState<number | null>(null);
    const [credentialModalData, setCredentialModalData] = useState<CredentialModalData | null>(null);
    const [showCredentialModal, setShowCredentialModal] = useState(false);
    const [copiedField, setCopiedField] = useState<string | null>(null);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("semua");
    const [statusFilter, setStatusFilter] = useState("semua");
    const [sortOrder, setSortOrder] = useState("terbaru");

    useEffect(() => {
        setMounted(true);
        const token = localStorage.getItem("agro_token");

        if (!token) {
            router.push("/login");
            return;
        }

        const currentUser = getUserFromToken();
        if (!currentUser) {
            router.push("/login");
            return;
        }

        if (currentUser.role !== "super_admin") {
            router.push(getRedirectPath(currentUser.role));
            return;
        }

        const fetchUsers = async () => {
            try {
                const response = await fetch(`${getApiUrl()}/users`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!response.ok) throw new Error("Gagal mengambil data user");
                const data = await response.json();
                setUsers(data);
            } catch (err: any) {
                console.error(err);
                setError(err.message || "Terjadi kesalahan.");
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [router]);

    const handleEdit = (user: User) => {
        router.push(`/kelola-user/pegawai/tambah?id=${user.id}`);
    };

    const handleDelete = async (id: number) => {
        if (confirm("Apakah Anda yakin ingin menghapus user ini?")) {
            try {
                const token = localStorage.getItem("agro_token");
                const response = await fetch(`${getApiUrl()}/users/${id}`, {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` },
                });

                const data = await response.json().catch(() => ({}));

                if (!response.ok) {
                    const message = Array.isArray(data.message)
                        ? data.message.join(", ")
                        : data.message || "Gagal menghapus user";
                    throw new Error(message);
                }

                setUsers((prev) => prev.filter((u) => u.id !== id));
            } catch (err: any) {
                console.error(err);
                alert(err.message || "Gagal menghapus user");
            }
        }
    };

    const handleToggleStatus = async (user: User) => {
        const newStatus =
            user.status_akun.toLowerCase() === "active" ? "inactive" : "active";

        try {
            const token = localStorage.getItem("agro_token");
            const response = await fetch(
                `${getApiUrl()}/users/${user.id}/status`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ status_akun: newStatus }),
                }
            );

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                const message = Array.isArray(data.message)
                    ? data.message.join(", ")
                    : data.message || "Gagal mengubah status akun";

                throw new Error(message);
            }

            setUsers((prev) =>
                prev.map((u) =>
                    u.id === user.id
                        ? {
                            ...u,
                            status_akun: newStatus,
                        }
                        : u
                )
            );
        } catch (err: any) {
            console.error("Toggle status error:", err);
            alert(err.message || "Gagal mengubah status akun");
        }
    };

    const copyToClipboard = (text: string, fieldName: string) => {
        navigator.clipboard.writeText(text);
        setCopiedField(fieldName);
        setTimeout(() => setCopiedField(null), 2000);
    };

    const downloadSlipPdf = async (cred: CredentialModalData) => {
        try {
            const jsPDFModule = await import("jspdf");
            const jsPDF = jsPDFModule.default;
            const autoTable = (await import("jspdf-autotable")).default;

            const doc = new jsPDF({
                orientation: "portrait",
                unit: "pt",
                format: "a5",
            });

            // Header Kop Dokumen
            doc.setFontSize(11);
            doc.setTextColor(44, 94, 59);
            doc.text("BALAI PENGUJIAN STANDAR INSTRUMEN AGROKLIMAT", doc.internal.pageSize.getWidth() / 2, 35, { align: "center" });

            doc.setFontSize(12);
            doc.setTextColor(30, 30, 30);
            doc.setFont("helvetica", "bold");
            doc.text("SLIP KREDENSIAL AKUN PORTAL INTERNAL", doc.internal.pageSize.getWidth() / 2, 52, { align: "center" });

            doc.setFontSize(8);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(110, 110, 110);
            const printDate = new Date().toLocaleString("id-ID", { dateStyle: "long", timeStyle: "short" });
            doc.text(`Dicetak pada: ${printDate}`, doc.internal.pageSize.getWidth() / 2, 65, { align: "center" });

            // Garis pembatas
            doc.setDrawColor(200, 200, 200);
            doc.setLineWidth(1);
            doc.line(25, 75, doc.internal.pageSize.getWidth() - 25, 75);

            const roleLabel =
                cred.role === "super_admin"
                    ? "Super Admin"
                    : cred.role === "admin"
                        ? "Admin Verifikator"
                        : cred.role === "kepala_balai"
                            ? "Kepala Balai"
                            : "Staf Teknis Pegawai";

            autoTable(doc, {
                startY: 85,
                body: [
                    ["Username Login", `: ${cred.username}`],
                    ["Role / Hak Akses", `: ${roleLabel}`],
                    ["Unit Teknis", `: ${cred.unit_teknis || "-"}`],
                    ["Password Baru", `: ${cred.password || "-"}`],
                    ["Halaman Login", `: ${window.location.origin}/login/pegawai`],
                ],
                theme: "plain",
                styles: {
                    fontSize: 9.5,
                    cellPadding: 5,
                    textColor: [40, 40, 40],
                },
                columnStyles: {
                    0: { fontStyle: "bold", cellWidth: 120 },
                    1: { cellWidth: 240 },
                },
            });

            // Catatan Keamanan
            const finalY = (doc as any).lastAutoTable?.finalY || 200;
            doc.setFillColor(245, 247, 245);
            doc.roundedRect(25, finalY + 15, doc.internal.pageSize.getWidth() - 50, 65, 6, 6, "F");

            doc.setFontSize(8.5);
            doc.setTextColor(44, 94, 59);
            doc.setFont("helvetica", "bold");
            doc.text("PENTING:", 35, finalY + 32);

            doc.setFont("helvetica", "normal");
            doc.setTextColor(80, 80, 80);
            doc.text("1. Harap segera mengganti kata sandi setelah berhasil login.", 35, finalY + 46);
            doc.text("2. Masukkan alamat email unit kerja di menu Edit Profil untuk notifikasi layanan.", 35, finalY + 58);
            doc.text("3. Jaga kerahasiaan username dan kata sandi akun perwakilan Anda.", 35, finalY + 70);

            const fileName = `Kredensial_${cred.username}.pdf`;
            doc.save(fileName);
        } catch (err) {
            console.error("Gagal cetak slip:", err);
            alert("Gagal mengunduh slip PDF kredensial.");
        }
    };

    const handleExportCredentialPdf = async (user: User) => {
        const targetUsername = user.username || user.nama;

        setGeneratingId(user.id);
        try {
            const token = localStorage.getItem("agro_token");
            const res = await fetch(`${getApiUrl()}/users/${user.id}/credential`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.message || "Gagal mengambil data kredensial pegawai");
            }

            const data = await res.json();
            const cred: CredentialModalData = {
                username: data.username || targetUsername,
                role: data.role,
                unit_teknis: data.unit_teknis || (user.unit_teknis ? user.unit_teknis.nama : null),
                password: data.password,
            };

            setCredentialModalData(cred);
            setShowCredentialModal(true);

            // Otomatis download slip PDF menggunakan password awal
            await downloadSlipPdf(cred);
        } catch (err: any) {
            console.error(err);
            alert(err.message || "Gagal mengunduh slip kredensial");
        } finally {
            setGeneratingId(null);
        }
    };

    const pegawaiUsers = users.filter((u) => u.role !== "publik");

    // Filter + Search
    const filteredUsers = pegawaiUsers
        .filter((u) => {
            const keyword = search.toLowerCase();

            const matchSearch =
                u.nama.toLowerCase().includes(keyword) ||
                (u.username ?? "").toLowerCase().includes(keyword) ||
                (u.nip ?? "").toLowerCase().includes(keyword) ||
                (u.email ?? "").toLowerCase().includes(keyword);

            const matchRole = (() => {
                if (roleFilter === "semua") return true;

                // Jika pegawai, filter berdasarkan role + unit teknis
                if (u.role === "pegawai") {
                    const filterParts = roleFilter.split("|");
                    const filterRole = filterParts[0];
                    const filterUnitId = filterParts[1];

                    return (
                        u.role === filterRole &&
                        u.unit_teknis?.id.toString() === filterUnitId
                    );
                }

                // Role selain pegawai
                return u.role === roleFilter;
            })();

            const matchStatus =
                statusFilter === "semua" ||
                u.status_akun.toLowerCase() === statusFilter;

            return (
                matchSearch &&
                matchRole &&
                matchStatus
            );
        })
        .sort((a, b) => {
            if (sortOrder === "terbaru") {
                return b.id - a.id;
            }

            return a.id - b.id;
        });

    const handleExportPdf = async () => {
        if (filteredUsers.length === 0) {
            alert("Tidak ada data pegawai untuk diekspor.");
            return;
        }

        setIsExportingPdf(true);
        try {
            const jsPDFModule = await import("jspdf");
            const jsPDF = jsPDFModule.default;
            const autoTable = (await import("jspdf-autotable")).default;

            const doc = new jsPDF({
                orientation: "portrait",
                unit: "pt",
                format: "a4",
            });

            // Header Dokumen
            doc.setFontSize(13);
            doc.setTextColor(44, 94, 59);
            doc.text("BALAI PENGUJIAN STANDAR INSTRUMEN AGROKLIMAT (BRMP AGROKLIMAT)", doc.internal.pageSize.getWidth() / 2, 40, { align: "center" });

            doc.setFontSize(11);
            doc.setTextColor(50, 50, 50);
            doc.text("Laporan Data Pegawai & Akun Portal Internal", doc.internal.pageSize.getWidth() / 2, 58, { align: "center" });

            doc.setFontSize(8);
            doc.setTextColor(120, 120, 120);
            const exportDate = new Date().toLocaleString("id-ID", { dateStyle: "long", timeStyle: "short" });

            const headerInfo = [
                `Waktu Cetak: ${exportDate}`,
                `Jumlah Akun: ${filteredUsers.length} data`
            ].join(" | ");

            doc.text(headerInfo, doc.internal.pageSize.getWidth() / 2, 72, { align: "center" });

            // Garis pembatas
            doc.setDrawColor(210, 210, 210);
            doc.setLineWidth(1);
            doc.line(30, 82, doc.internal.pageSize.getWidth() - 30, 82);

            const tableRows = filteredUsers.map((u, index) => {
                const roleLabel =
                    u.role === "super_admin" ? "Super Admin"
                    : u.role === "admin" ? "Admin Verifikator"
                    : u.role === "kepala_balai" ? "Kepala Balai"
                    : "Staf Teknis";

                const unitLabel = u.unit_teknis ? u.unit_teknis.nama : "-";
                const statusLabel = u.status_akun.toLowerCase() === "active" ? "Aktif" : "Nonaktif";

                return [
                    (index + 1).toString(),
                    u.username || u.nama,
                    roleLabel,
                    unitLabel,
                    u.email || "-",
                    statusLabel
                ];
            });

            autoTable(doc, {
                startY: 95,
                head: [["No.", "Username", "Role", "Unit Teknis", "Email", "Status"]],
                body: tableRows,
                theme: "striped",
                headStyles: {
                    fillColor: [44, 94, 59],
                    textColor: [255, 255, 255],
                    fontSize: 8.5,
                    fontStyle: "bold",
                    halign: "center",
                },
                bodyStyles: {
                    fontSize: 8,
                    textColor: [50, 50, 50],
                },
                columnStyles: {
                    0: { halign: "center", cellWidth: 28 },
                    1: { cellWidth: 125, fontStyle: "bold" },
                    2: { halign: "center", cellWidth: 85 },
                    3: { cellWidth: 130 },
                    4: { cellWidth: 115 },
                    5: { halign: "center", cellWidth: 50 },
                },
                styles: {
                    cellPadding: 4.5,
                    overflow: "linebreak",
                },
            });

            const fileName = `Daftar_Pegawai_Agroklimat_${new Date().toISOString().slice(0, 10)}.pdf`;
            doc.save(fileName);
        } catch (err) {
            console.error("Gagal export PDF:", err);
            alert("Gagal mengekspor data ke PDF.");
        } finally {
            setIsExportingPdf(false);
        }
    };

    if (!mounted) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-secondary-green-color border-t-transparent"></div>
            </div>
        );
    }

    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

    const roleOptions = Array.from(
        new Map(
            pegawaiUsers.map((u) => {
                if (u.role === "pegawai" && u.unit_teknis) {
                    return [
                        `pegawai|${u.unit_teknis.id}`,
                        `Pegawai ${u.unit_teknis.nama}`,
                    ];
                }

                return [
                    u.role,
                    u.role === "super_admin" ? "Super Admin"
                    : u.role === "admin" ? "Admin Verifikator"
                    : u.role === "kepala_balai" ? "Kepala Balai"
                    : "Pegawai"
                ];
            })
        )
    );

    return (
        <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 overflow-hidden font-sans">
            <Sidebar />
            <div className="flex flex-col flex-1 overflow-y-auto">
                <AppBar onMenuClick={() => setSidebarOpen(true)} />

                <main className="flex-1 p-8 space-y-6">

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full relative overflow-hidden">
                        <div className="space-y-1">
                            <h1 className="text-2xl font-semibold md:text-3xl text-[var(--foreground)] dark:text-zinc-50">
                                Kelola <span className="text-green-color ">Pegawai</span>
                            </h1>
                            <p className="max-w-xl text-xs sm:text-sm font-medium text-zinc-500">
                                Manajemen Akun Perwakilan Jabatan dan Hak Akses Sistem
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2.5">
                            <button
                                onClick={handleExportPdf}
                                disabled={isExportingPdf || filteredUsers.length === 0}
                                className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 transition shadow-2xs cursor-pointer disabled:opacity-50"
                                title="Ekspor daftar pegawai ke file PDF"
                            >
                                <FileDown className="h-4 w-4 text-[var(--green-color)]" />
                                <span>{isExportingPdf ? "Mengekspor..." : "Export PDF"}</span>
                            </button>

                            <button
                                onClick={() => router.push("/kelola-user/pegawai/tambah")}
                                className="inline-flex items-center gap-2 rounded-xl bg-[var(--green-color)] px-4 py-2.5 text-xs sm:text-sm font-medium text-white hover:bg-[#22482E] transition shadow-sm cursor-pointer"
                            >
                                <Plus className="h-4 w-4" />
                                Tambah Pegawai
                            </button>
                        </div>
                    </div>

                    <div className="rounded-2xl p-4 sm:p-6 md:p-8 border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
                        {error && (
                            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400 flex items-center gap-2">
                                <ShieldAlert className="h-5 w-5 flex-shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="mb-6 flex flex-col gap-4">
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                {/* Baris Filter Status Kanan */}
                                <div className="w-full lg:w-auto overflow-x-auto pb-1 -mb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                                    <div className="inline-flex min-w-full sm:min-w-0 items-center rounded-xl bg-secondary-green-color p-1.5 dark:border-zinc-700 dark:bg-zinc-800 gap-1">
                                        {[
                                            {
                                                label: "Semua",
                                                value: "semua",
                                                count: pegawaiUsers.length,
                                            },
                                            {
                                                label: "Aktif",
                                                value: "active",
                                                count: pegawaiUsers.filter(
                                                    (u) => u.status_akun.toLowerCase() === "active"
                                                ).length,
                                            },
                                            {
                                                label: "Nonaktif",
                                                value: "inactive",
                                                count: pegawaiUsers.filter(
                                                    (u) => u.status_akun.toLowerCase() === "inactive"
                                                ).length,
                                            },
                                        ].map((item) => (
                                            <button
                                                key={item.value}
                                                onClick={() => {
                                                    setStatusFilter(item.value);
                                                    setCurrentPage(1);
                                                }}
                                                className={`whitespace-nowrap shrink-0 rounded-lg px-3 py-2 text-xs font-medium transition cursor-pointer ${statusFilter === item.value
                                                    ? "bg-white text-[var(--green-color)] shadow-sm dark:bg-zinc-900 font-semibold"
                                                    : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400"
                                                    }`}
                                            >
                                                {item.label}
                                                <span className="ml-1.5 text-[10px]">
                                                    ({item.count})
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Baris filter kiri */}
                                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                                    <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full lg:w-auto">
                                        {/* Search */}
                                        <div className="relative flex-1 sm:w-64">
                                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                                            <input
                                                type="text"
                                                placeholder="Cari username, email..."
                                                value={search}
                                                onChange={(e) => {
                                                    setSearch(e.target.value);
                                                    setCurrentPage(1);
                                                }}
                                                className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 pl-10 pr-4 text-xs outline-none transition focus:border-[var(--green-color)] focus:ring-2 focus:ring-[var(--green-color)]/10 dark:border-zinc-700 dark:bg-zinc-900"
                                            />
                                        </div>

                                        {/* Filter Role */}
                                        <div className="relative flex-1 sm:flex-initial">
                                            <ListFilter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                                            <select
                                                value={roleFilter}
                                                onChange={(e) => {
                                                    setRoleFilter(e.target.value);
                                                    setCurrentPage(1);
                                                }}
                                                className="w-full appearance-none rounded-xl border border-zinc-200 bg-white py-2.5 pl-10 pr-9 text-xs outline-none transition focus:border-[var(--green-color)] focus:ring-2 focus:ring-[var(--green-color)]/10 dark:border-zinc-700 dark:bg-zinc-900"
                                            >
                                                <option value="semua">Semua Role</option>
                                                {roleOptions.map(([value, label]) => (
                                                    <option key={value} value={value}>
                                                        {label}
                                                    </option>
                                                ))}
                                            </select>
                                            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                                        </div>

                                        {/* Sorting */}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSortOrder((prev) =>
                                                    prev === "terbaru" ? "terlama" : "terbaru"
                                                );
                                                setCurrentPage(1);
                                            }}
                                            className="inline-flex shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-white p-2.5 text-zinc-600 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 cursor-pointer"
                                            title={
                                                sortOrder === "terbaru"
                                                    ? "Urutkan dari terlama"
                                                    : "Urutkan dari terbaru"
                                            }
                                        >
                                            <ArrowUpDown className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                {loading ? (
                                    <div className="flex flex-col items-center justify-center py-20 space-y-4">
                                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-secondary-green-color border-t-transparent"></div>
                                        <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Memuat data pegawai...</p>
                                    </div>
                                ) : currentUsers.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-zinc-400 dark:text-zinc-500">
                                        <Users className="h-12 w-12 stroke-1 mb-2" />
                                        <p className="text-sm font-semibold">Tidak Ada Data</p>
                                        <p className="text-xs">Belum ada akun pegawai terdaftar.</p>
                                    </div>
                                ) : (
                                    <table className="min-w-full divide-y divide-zinc-200/80 dark:divide-zinc-800">
                                        <thead className="bg-[var(--secondary-green-color)]">
                                            <tr>
                                                <th scope="col" className="px-6 py-4.5 text-center text-xs font-semibold text-[var(--foreground)] tracking-wider w-16">No.</th>
                                                <th scope="col" className="px-6 py-4.5 text-left text-xs font-semibold text-[var(--foreground)] tracking-wider">Username</th>
                                                <th scope="col" className="px-6 py-4.5 text-center text-xs font-semibold text-[var(--foreground)] tracking-wider">Role</th>
                                                <th scope="col" className="px-6 py-4.5 text-center text-xs font-semibold text-[var(--foreground)] tracking-wider">Unit Teknis</th>
                                                <th scope="col" className="px-6 py-4.5 text-center text-xs font-semibold text-[var(--foreground)] tracking-wider">Status</th>
                                                <th scope="col" className="px-6 py-4.5 text-center text-xs font-semibold text-[var(--foreground)] tracking-wider">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 bg-white dark:bg-zinc-900">
                                            {currentUsers.map((u, index) => (
                                                <tr key={u.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 transition-colors">
                                                    <td className="whitespace-nowrap px-6 py-5.5 text-center text-xs text-zinc-500 dark:text-zinc-400">
                                                        {startIndex + index + 1}
                                                    </td>
                                                    <td className="px-6 py-5.5 whitespace-nowrap text-xs text-[var(--foreground)] font-medium text-left">
                                                        <div className="font-semibold text-zinc-900 dark:text-zinc-100">{u.username || u.nama}</div>
                                                        {u.email && (
                                                            <div className="text-[11px] text-zinc-400 font-normal">{u.email}</div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-5.5 whitespace-nowrap text-xs text-center">
                                                        <div className="flex justify-center">
                                                            <RoleUserBadge role={u.role} />
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5.5 whitespace-nowrap text-xs text-[var(--foreground)] font-base text-center">
                                                        {u.unit_teknis ? (
                                                            u.unit_teknis.nama
                                                        ) : (
                                                            <span className="text-zinc-400 dark:text-zinc-650 font-base">-</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-5.5 whitespace-nowrap text-xs text-center">
                                                        <button
                                                            onClick={() => handleToggleStatus(u)}
                                                            className="inline-flex items-center gap-2 cursor-pointer"
                                                        >
                                                            <span
                                                                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${u.status_akun.toLowerCase() === "active"
                                                                    ? "bg-[var(--green-color)]"
                                                                    : "bg-zinc-300 dark:bg-zinc-700"
                                                                    }`}
                                                            >
                                                                <span
                                                                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${u.status_akun.toLowerCase() === "active"
                                                                        ? "translate-x-4"
                                                                        : "translate-x-0.5"
                                                                        }`}
                                                                />
                                                            </span>

                                                            <span
                                                                className={
                                                                    u.status_akun.toLowerCase() === "active"
                                                                        ? "text-[var(--green-color)]"
                                                                        : "text-zinc-400"
                                                                }
                                                            >
                                                                {u.status_akun.toLowerCase() === "active"
                                                                    ? "Aktif"
                                                                    : "Nonaktif"}
                                                            </span>
                                                        </button>
                                                    </td>
                                                    <td className="px-6 py-5.5 whitespace-nowrap text-xs text-center">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <button
                                                                onClick={() => handleExportCredentialPdf(u)}
                                                                disabled={generatingId === u.id}
                                                                className="p-1 text-zinc-500 hover:text-[var(--green-color)] dark:hover:text-emerald-400 rounded-md transition cursor-pointer disabled:opacity-50"
                                                                title="Unduh Slip Kredensial (PDF)"
                                                            >
                                                                {generatingId === u.id ? (
                                                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--green-color)] border-t-transparent" />
                                                                ) : (
                                                                    <FileDown className="h-4 w-4" />
                                                                )}
                                                            </button>
                                                            <button
                                                                onClick={() => handleEdit(u)}
                                                                className="p-1 text-zinc-500 hover:text-[#2C5E3B] rounded-md transition cursor-pointer"
                                                                title="Edit"
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(u.id)}
                                                                className="p-1 text-zinc-500 hover:text-red-600 rounded-md transition cursor-pointer"
                                                                title="Delete"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>

                            {/* Pagination */}
                            {!loading && filteredUsers.length > 0 && (
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 text-xs text-zinc-500 dark:text-zinc-400">
                                    <p>
                                        Menampilkan{" "}
                                        <span className="font-semibold text-zinc-700 dark:text-zinc-200">
                                            {startIndex + 1}
                                        </span>{" "}
                                        hingga{" "}
                                        <span className="font-semibold text-zinc-700 dark:text-zinc-200">
                                            {Math.min(startIndex + itemsPerPage, filteredUsers.length)}
                                        </span>{" "}
                                        dari{" "}
                                        <span className="font-semibold text-zinc-700 dark:text-zinc-200">
                                            {filteredUsers.length}
                                        </span>{" "}
                                        pegawai
                                    </p>

                                    <div className="inline-flex items-center gap-1">
                                        <button
                                            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                                            disabled={currentPage === 1}
                                            className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
                                        >
                                            Sebelumnya
                                        </button>
                                        <span className="px-3 py-1.5 font-medium text-zinc-700 dark:text-zinc-200">
                                            Halaman {currentPage} dari {totalPages || 1}
                                        </span>
                                        <button
                                            onClick={() =>
                                                setCurrentPage((p) => Math.min(p + 1, totalPages))
                                            }
                                            disabled={currentPage === totalPages || totalPages === 0}
                                            className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
                                        >
                                            Selanjutnya
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>

            {/* Modal Kredensial */}
            {showCredentialModal && credentialModalData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-5 animate-in fade-in zoom-in duration-200">
                        <div className="flex flex-col items-center text-center space-y-2">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                                <CheckCircle2 className="h-6 w-6" />
                            </div>
                            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                                Slip Kredensial Pegawai
                            </h3>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                Slip kredensial (PDF) otomatis diunduh ke perangkat Anda. Berikut data kredensial akun pegawai.
                            </p>
                        </div>

                        {/* Card Info Kredensial */}
                        <div className="space-y-3 rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950">
                            <div className="flex items-center justify-between">
                                <div>
                                    <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Username Login</span>
                                    <p className="text-sm font-bold text-[var(--green-color)] dark:text-emerald-400">{credentialModalData.username}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => copyToClipboard(credentialModalData.username, "username")}
                                    className="flex items-center gap-1 text-xs text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 px-2 py-1 rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 cursor-pointer"
                                    title="Salin username"
                                >
                                    {copiedField === "username" ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                                    <span>{copiedField === "username" ? "Tersalin" : "Salin"}</span>
                                </button>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-zinc-200/80 dark:border-zinc-800">
                                <div>
                                    <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Password Awal</span>
                                    <p className="font-mono text-sm font-bold text-zinc-900 dark:text-zinc-100">{credentialModalData.password}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => copyToClipboard(credentialModalData.password || "", "password")}
                                    className="flex items-center gap-1 text-xs text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 px-2 py-1 rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 cursor-pointer"
                                    title="Salin password"
                                >
                                    {copiedField === "password" ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                                    <span>{copiedField === "password" ? "Tersalin" : "Salin"}</span>
                                </button>
                            </div>

                            {credentialModalData.unit_teknis && (
                                <div className="pt-2 border-t border-zinc-200/80 dark:border-zinc-800">
                                    <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Unit Teknis</span>
                                    <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">{credentialModalData.unit_teknis}</p>
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="space-y-2 pt-2">
                            <button
                                type="button"
                                onClick={() => downloadSlipPdf(credentialModalData)}
                                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--green-color)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#22482E] transition shadow-sm cursor-pointer"
                            >
                                <Download className="h-4 w-4" />
                                <span>Unduh Ulang Slip Kredensial (PDF)</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setShowCredentialModal(false)}
                                className="w-full inline-flex items-center justify-center rounded-xl border border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800 px-4 py-2.5 text-sm font-semibold text-zinc-700 dark:text-zinc-300 transition cursor-pointer"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}