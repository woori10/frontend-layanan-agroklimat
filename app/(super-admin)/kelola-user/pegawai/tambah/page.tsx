"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Sidebar from "@/components/sidebar/Sidebar";
import AppBar from "@/components/appbar/AppBar";
import { getUserFromToken, getRedirectPath } from "@/lib/auth";
import { ChevronLeft, ShieldAlert, CheckCircle2, Copy, Download, KeyRound, Check } from "lucide-react";
import Link from "next/link";
import { getApiUrl } from "@/lib/api";

interface UnitTeknis {
    id: number;
    nama: string;
}

interface CreatedCredential {
    username: string;
    role: string;
    unit_teknis?: string | null;
    password?: string;
}

function TambahPegawaiForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const editId = searchParams.get("id");
    const isEdit = Boolean(editId);

    const [mounted, setMounted] = useState(false);

    // Form inputs
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [noHp, setNoHp] = useState("");
    const [role, setRole] = useState("pegawai");
    const [unitTeknisId, setUnitTeknisId] = useState<string>("");

    // Dropdown options
    const [unitTeknisList, setUnitTeknisList] = useState<UnitTeknis[]>([]);

    // Loading / error states
    const [loadingUnits, setLoadingUnits] = useState(true);
    const [loadingData, setLoadingData] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Modal Kredensial setelah berhasil tambah pegawai
    const [showCredentialModal, setShowCredentialModal] = useState(false);
    const [createdCredential, setCreatedCredential] = useState<CreatedCredential | null>(null);
    const [copiedField, setCopiedField] = useState<string | null>(null);

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

        const initializeData = async () => {
            try {
                // 1. Fetch unit teknis
                const response = await fetch(`${getApiUrl()}/users/unit-teknis/list`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (!response.ok) {
                    throw new Error("Gagal mengambil data unit teknis");
                }
                const dataUnits = await response.json();
                setUnitTeknisList(dataUnits);
                if (dataUnits.length > 0 && !editId) {
                    setUnitTeknisId(dataUnits[0].id.toString());
                }

                // 2. If edit mode, fetch existing employee detail
                if (editId) {
                    setLoadingData(true);
                    const userRes = await fetch(`${getApiUrl()}/users/${editId}`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });

                    if (!userRes.ok) {
                        throw new Error("Gagal mengambil data pegawai yang akan diedit");
                    }

                    const userData = await userRes.json();
                    setUsername(userData.username || userData.nama || "");
                    setEmail(userData.email || "");
                    setNoHp(userData.no_hp || "");
                    setRole(userData.role || "pegawai");
                    if (userData.unit_teknis_id) {
                        setUnitTeknisId(userData.unit_teknis_id.toString());
                    } else if (dataUnits.length > 0) {
                        setUnitTeknisId(dataUnits[0].id.toString());
                    }
                }
            } catch (err: any) {
                console.error(err);
                setError(err.message || "Terjadi kesalahan saat memuat data.");
            } finally {
                setLoadingUnits(false);
                setLoadingData(false);
            }
        };

        initializeData();
    }, [router, editId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
        if (!cleanUsername) {
            setError("Username wajib diisi.");
            return;
        }

        if (role === "pegawai" && !unitTeknisId) {
            setError("Unit teknis wajib dipilih untuk staf teknis.");
            return;
        }

        setSubmitting(true);
        try {
            const token = localStorage.getItem("agro_token");
            const payload = {
                username: cleanUsername,
                email: email.trim() ? email.trim() : undefined,
                no_hp: noHp.trim() ? noHp.trim() : undefined,
                role,
                unit_teknis_id: role === "pegawai" && unitTeknisId ? parseInt(unitTeknisId) : null,
            };

            const url = isEdit
                ? `${getApiUrl()}/users/${editId}`
                : `${getApiUrl()}/users`;
            const method = isEdit ? "PATCH" : "POST";

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                const message = Array.isArray(errData.message)
                    ? errData.message.join(", ")
                    : errData.message || (isEdit ? "Gagal memperbarui pegawai." : "Gagal menambah pegawai.");
                throw new Error(message);
            }

            const data = await response.json();

            if (!isEdit) {
                const selectedUnit = unitTeknisList.find((u) => u.id.toString() === unitTeknisId);
                setCreatedCredential({
                    username: data.username || cleanUsername,
                    role: data.role,
                    unit_teknis: role === "pegawai" ? selectedUnit?.nama : null,
                    password: data.generated_password,
                });
                setShowCredentialModal(true);
            } else {
                router.push("/kelola-user/pegawai");
            }
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Terjadi kesalahan saat menyimpan data.");
            setSubmitting(false);
        }
    };

    const copyToClipboard = (text: string, fieldName: string) => {
        navigator.clipboard.writeText(text);
        setCopiedField(fieldName);
        setTimeout(() => setCopiedField(null), 2000);
    };

    const handleDownloadSlipPdf = async () => {
        if (!createdCredential) return;

        try {
            const jsPDFModule = await import("jspdf");
            const jsPDF = jsPDFModule.default;
            const autoTable = (await import("jspdf-autotable")).default;

            const doc = new jsPDF({
                orientation: "portrait",
                unit: "pt",
                format: "a5",
            });

            // Header Kop Surat
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
                createdCredential.role === "super_admin"
                    ? "Super Admin"
                    : createdCredential.role === "admin"
                        ? "Admin Verifikator"
                        : createdCredential.role === "kepala_balai"
                            ? "Kepala Balai"
                            : "Staf Teknis Pegawai";

            autoTable(doc, {
                startY: 85,
                body: [
                    ["Username Login", `: ${createdCredential.username}`],
                    ["Role / Hak Akses", `: ${roleLabel}`],
                    ["Unit Teknis", `: ${createdCredential.unit_teknis || "-"}`],
                    ["Password Awal", `: ${createdCredential.password || "-"}`],
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
            doc.text("1. Harap segera mengganti kata sandi setelah berhasil login pertama kali.", 35, finalY + 46);
            doc.text("2. Masukkan alamat email unit kerja di menu Edit Profil untuk notifikasi layanan.", 35, finalY + 58);
            doc.text("3. Jaga kerahasiaan username dan kata sandi akun perwakilan Anda.", 35, finalY + 70);

            const fileName = `Kredensial_${createdCredential.username}.pdf`;
            doc.save(fileName);
        } catch (err) {
            console.error("Gagal cetak slip:", err);
            alert("Gagal mengunduh slip PDF kredensial.");
        }
    };

    if (!mounted || loadingData) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-secondary-green-color border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 overflow-hidden font-sans">
            {/* Sidebar for Desktop */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex flex-col flex-1 overflow-y-auto">
                {/* Top Navbar */}
                <AppBar onMenuClick={() => { }} />

                {/* Content Container */}
                <main className="flex-1 p-6 md:p-8 space-y-6">
                    {/* Breadcrumbs / Back button */}
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                        <Link
                            href={`/kelola-user/pegawai`}
                            className="flex items-center font-semibold text-zinc-800 dark:text-zinc-200 transition hover:text-zinc-600 dark:hover:text-zinc-300 shrink-0"
                        >
                            <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-0.5" />
                            Kelola User / Pegawai
                        </Link>
                        <span className="text-zinc-400 dark:text-zinc-500 select-none">/</span>
                        <span className="font-semibold text-green-color dark:text-secondary-green-color">
                            {isEdit ? "Edit Pegawai" : "Tambah Pegawai"}
                        </span>
                    </div>

                    {/* Form Card */}
                    <div className="rounded-2xl border border-zinc-200 bg-white p-6 md:p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 text-left max-w-4xl">
                        {error && (
                            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400 flex items-center gap-2">
                                <ShieldAlert className="h-5 w-5 flex-shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="mb-6">
                            <div className="flex items-center gap-3">
                                <div className="flex-1 space-y-2 pb-4 border-b border-b-zinc-200 dark:border-b-zinc-800">
                                    <h1 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100">
                                        {isEdit ? "Form Edit Pegawai" : "Form Tambah Pegawai"}
                                    </h1>
                                    <p className="text-sm text-zinc-650 dark:text-zinc-300">
                                        {isEdit
                                            ? "Perbarui informasi akun pegawai dan hak akses portal internal"
                                            : "Lengkapi formulir untuk membuat akun perwakilan pegawai dan hak akses portal internal"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Username */}
                                <div className="space-y-2">
                                    <label htmlFor="username" className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 tracking-wider block">
                                        Username <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="username"
                                        name="username"
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="contoh: admin_verifikasi, kepala_balai, pegawai_siap_tanam"
                                        className="block w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-[#F8FAFC] dark:bg-zinc-950 px-4 py-3 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 shadow-sm focus:border-[var(--green-color)] focus:outline-none focus:ring-1 focus:ring-[var(--green-color)]"
                                        required
                                    />
                                    <p className="text-[11px] text-zinc-650 dark:text-zinc-400">
                                        Digunakan untuk login di portal pegawai.
                                    </p>
                                </div>

                                {/* Role */}
                                <div className="space-y-2">
                                    <label htmlFor="role" className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 tracking-wider block">
                                        Role / Jabatan <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        id="role"
                                        name="role"
                                        aria-label="Pilih Role atau Jabatan Pegawai"
                                        value={role}
                                        onChange={(e) => setRole(e.target.value)}
                                        className="block w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-[#F8FAFC] dark:bg-zinc-950 px-4 py-3 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 shadow-sm focus:border-[var(--green-color)] focus:outline-none focus:ring-1 focus:ring-[var(--green-color)] cursor-pointer"
                                    >
                                        <option value="pegawai">Staf Teknis (Pegawai)</option>
                                        <option value="admin">Admin Verifikator</option>
                                        <option value="kepala_balai">Kepala Balai</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Unit Teknis - only enabled if role is pegawai */}
                                <div className="space-y-2">
                                    <label htmlFor="unitTeknisId" className={`text-xs font-semibold tracking-wider block ${role !== "pegawai" ? "text-zinc-500 dark:text-zinc-400" : "text-zinc-800 dark:text-zinc-200"}`}>
                                        Unit Teknis {role === "pegawai" && <span className="text-red-500">*</span>}
                                    </label>
                                    <select
                                        id="unitTeknisId"
                                        name="unitTeknisId"
                                        aria-label="Pilih Unit Teknis Pegawai"
                                        value={unitTeknisId}
                                        onChange={(e) => setUnitTeknisId(e.target.value)}
                                        disabled={role !== "pegawai" || loadingUnits}
                                        className="block w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-[#F8FAFC] dark:bg-zinc-950 px-4 py-3 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 shadow-sm focus:border-[var(--green-color)] focus:outline-none focus:ring-1 focus:ring-[var(--green-color)] disabled:opacity-50 cursor-pointer"
                                    >
                                        {loadingUnits ? (
                                             <option value="">Memuat unit teknis...</option>
                                        ) : (
                                            unitTeknisList.map((unit) => (
                                                <option key={unit.id} value={unit.id}>
                                                    {unit.nama}
                                                </option>
                                            ))
                                        )}
                                    </select>
                                    {role !== "pegawai" && (
                                        <p className="text-[10px] text-zinc-650 dark:text-zinc-400 font-medium mt-1">
                                            Unit teknis hanya wajib dipilih untuk role Staf Teknis.
                                        </p>
                                    )}
                                </div>

                                {/* Email (Opsional) */}
                                <div className="space-y-2">
                                    <label htmlFor="email" className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 tracking-wider block">
                                        Email Unit / Petugas <span className="text-zinc-550 dark:text-zinc-400 font-normal">(Opsional)</span>
                                    </label>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="contoh: unit.agroklimat@pertanian.go.id"
                                        className="block w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-[#F8FAFC] dark:bg-zinc-950 px-4 py-3 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 shadow-sm focus:border-[var(--green-color)] focus:outline-none focus:ring-1 focus:ring-[var(--green-color)]"
                                    />
                                    <p className="text-[11px] text-zinc-650 dark:text-zinc-400">
                                        Dapat dikosongkan. Pengguna bisa mengisinya nanti di menu profil untuk menerima notifikasi.
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* No HP (Opsional) */}
                                <div className="space-y-2">
                                    <label htmlFor="noHp" className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 tracking-wider block">
                                        Nomor HP / WhatsApp <span className="text-zinc-550 dark:text-zinc-400 font-normal">(Opsional)</span>
                                    </label>
                                    <input
                                        id="noHp"
                                        name="noHp"
                                        type="tel"
                                        value={noHp}
                                        onChange={(e) => setNoHp(e.target.value)}
                                        placeholder="contoh: 081234567890"
                                        className="block w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-[#F8FAFC] dark:bg-zinc-950 px-4 py-3 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 shadow-sm focus:border-[var(--green-color)] focus:outline-none focus:ring-1 focus:ring-[var(--green-color)]"
                                    />
                                </div>
                            </div>

                            {!isEdit && (
                                <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/20 flex items-start gap-3">
                                    <KeyRound className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                                    <div className="text-xs text-emerald-800 dark:text-emerald-300 space-y-1">
                                        <p className="font-semibold">Password Awal Otomatis Dibuat oleh Sistem</p>
                                        <p className="text-emerald-700 dark:text-emerald-400">
                                            Password akan digenerate otomatis berdasarkan role (contoh: <code className="font-mono font-bold bg-white/80 dark:bg-zinc-900 px-1 py-0.5 rounded">Pegawai821</code> atau <code className="font-mono font-bold bg-white/80 dark:bg-zinc-900 px-1 py-0.5 rounded">Admin347</code>) dan ditampilkan pada slip kredensial setelah akun dibuat.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Buttons */}
                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                                <button
                                    type="button"
                                    onClick={() => router.push("/kelola-user/pegawai")}
                                    className="px-5 py-2.5 rounded-xl border border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800 text-sm font-semibold transition cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-5 py-2.5 rounded-xl bg-[var(--green-color)] text-white hover:bg-[#22482E] disabled:bg-[#2C5E3B]/70 font-semibold text-sm transition shadow-sm cursor-pointer flex items-center gap-2"
                                >
                                    {submitting ? (
                                        <>
                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                            <span>Menyimpan...</span>
                                        </>
                                    ) : (
                                        <span>{isEdit ? "Simpan Perubahan" : "Buat Akun Pegawai"}</span>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </main>
            </div>

            {/* Modal Sukses & Kredensial Akun Baru */}
            {showCredentialModal && createdCredential && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-5 animate-in fade-in zoom-in duration-200">
                        <div className="flex flex-col items-center text-center space-y-2">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                                <CheckCircle2 className="h-6 w-6" />
                            </div>
                            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                                Akun Pegawai Berhasil Dibuat!
                            </h2>
                            <p className="text-xs text-zinc-650 dark:text-zinc-300">
                                Harap salin atau unduh slip kredensial berikut untuk diserahkan kepada perwakilan petugas.
                            </p>
                        </div>

                        {/* Card Info Kredensial */}
                        <div className="space-y-3 rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950">
                            <div className="flex items-center justify-between">
                                <div>
                                    <span className="text-[11px] font-semibold text-zinc-650 dark:text-zinc-300 uppercase tracking-wider">Username Login</span>
                                    <p className="text-sm font-bold text-green-color dark:text-emerald-400">{createdCredential.username}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => copyToClipboard(createdCredential.username, "username")}
                                    className="flex items-center gap-1 text-xs text-zinc-650 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100 px-2 py-1 rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 cursor-pointer"
                                    title="Salin username"
                                    aria-label="Salin username"
                                >
                                    {copiedField === "username" ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                                    <span>{copiedField === "username" ? "Tersalin" : "Salin"}</span>
                                </button>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-zinc-200/80 dark:border-zinc-800">
                                <div>
                                    <span className="text-[11px] font-semibold text-zinc-650 dark:text-zinc-300 uppercase tracking-wider">Password Awal</span>
                                    <p className="font-mono text-sm font-bold text-zinc-900 dark:text-zinc-100">{createdCredential.password}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => copyToClipboard(createdCredential.password || "", "password")}
                                    className="flex items-center gap-1 text-xs text-zinc-650 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100 px-2 py-1 rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 cursor-pointer"
                                    title="Salin password"
                                    aria-label="Salin password"
                                >
                                    {copiedField === "password" ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                                    <span>{copiedField === "password" ? "Tersalin" : "Salin"}</span>
                                </button>
                            </div>

                            {createdCredential.unit_teknis && (
                                <div className="pt-2 border-t border-zinc-200/80 dark:border-zinc-800">
                                    <span className="text-[11px] font-semibold text-zinc-650 dark:text-zinc-300 uppercase tracking-wider">Unit Teknis</span>
                                    <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">{createdCredential.unit_teknis}</p>
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="space-y-2 pt-2">
                            <button
                                type="button"
                                onClick={handleDownloadSlipPdf}
                                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--green-color)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#22482E] transition shadow-sm cursor-pointer"
                            >
                                <Download className="h-4 w-4" />
                                <span>Unduh Slip Kredensial (PDF)</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => router.push("/kelola-user/pegawai")}
                                className="w-full inline-flex items-center justify-center rounded-xl border border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800 px-4 py-2.5 text-sm font-semibold text-zinc-700 dark:text-zinc-300 transition cursor-pointer"
                            >
                                Selesai & Kembali ke Daftar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function TambahPegawaiPage() {
    return (
        <Suspense
            fallback={
                <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-secondary-green-color border-t-transparent"></div>
                </div>
            }
        >
            <TambahPegawaiForm />
        </Suspense>
    );
}
