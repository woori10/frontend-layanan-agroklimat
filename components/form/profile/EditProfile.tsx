'use client';
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { saveAuthSession } from "@/lib/auth";
import { getApiUrl } from "@/lib/api";

interface EditProfileProps {
    isStaff?: boolean;
}

export default function EditProfile({ isStaff = false }: EditProfileProps) {
    const router = useRouter();
    const [nama, setNama] = useState("");
    const [nip, setNip] = useState("");
    const [noHp, setNoHp] = useState("");
    const [email, setEmail] = useState("");
    const [instansi, setInstansi] = useState("");
    const [alamat, setAlamat] = useState("");

    // Read-only state for staff
    const [userRole, setUserRole] = useState("");
    const [unitTeknisId, setUnitTeknisId] = useState<number | null>(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const getRoleLabel = (role: string) => {
        switch (role) {
            case "super_admin": return "Super Admin";
            case "admin": return "Admin";
            case "pegawai": return "Pegawai";
            case "kepala_balai": return "Kepala Balai";
            default: return role || "-";
        }
    };

    const getUnitName = (id: number | null) => {
        if (!id) return "Kantor Pusat BRMP";
        switch (id) {
            case 1: return "Tim Teknis Agroklimat / Hidrologi";
            case 2: return "Koordinator Laboratorium";
            case 3: return "Tim Kerja Layanan dan Pendayagunaan Hasil";
            case 4: return "Tim Siap Tanam";
            case 5: return "Petugas Mess";
            default: return "Kantor Pusat BRMP";
        }
    };

    useEffect(() => {
        const token = localStorage.getItem("agro_token");
        if (!token) {
            router.push("/login");
            return;
        }

        fetch(`${getApiUrl()}/auth/profile`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(res => {
                if (!res.ok) throw new Error("Gagal mengambil profil");
                return res.json();
            })
            .then(data => {
                setNama(data.nama || "");
                setNip(data.nip || "");
                setNoHp(data.no_hp || "");
                setEmail(data.email || "");
                setInstansi(data.instansi || "");
                setAlamat(data.alamat || "");
                setUserRole(data.role || "");
                setUnitTeknisId(data.unit_teknis_id ?? null);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setError("Gagal memuat profil.");
                setLoading(false);
            });
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setSaving(true);

        const token = localStorage.getItem("agro_token");
        if (!token) {
            router.push("/login");
            return;
        }

        try {
            const body: any = {
                nama,
                email,
                nip,
                no_hp: noHp,
            };

            if (!isStaff) {
                body.instansi = instansi;
                body.alamat = alamat;
            }

            const res = await fetch(`${getApiUrl()}/auth/profile`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(body)
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Gagal memperbarui profil.");
            }

            // Save new token in session if returned
            if (data.access_token) {
                if (isStaff) {
                    saveAuthSession(data.access_token, nip, "nip");
                    if (email) {
                        localStorage.setItem("agro_user_email", email);
                    }
                } else {
                    saveAuthSession(data.access_token, email, "email");
                }
            }

            setSuccess("Profil berhasil diperbarui!");
            setTimeout(() => {
                router.push(isStaff ? "/profile" : "/profile-publik");
            }, 1500);
        } catch (err: any) {
            setError(err.message || "Terjadi kesalahan.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-secondary-green-color border-t-transparent"></div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 md:p-8 shadow-sm w-full space-y-6 text-left">
            {/* Header Card */}
            <div className="mb-6">
                <div className="flex items-center gap-3">
                    <div className="flex-1 space-y-2 pb-4 border-b border-b-zinc-200 dark:border-b-zinc-800">
                        <h3 className="text-lg font-bold text-[var(--foreground)] dark:text-zinc-300">
                            {isStaff ? "Form Edit Pegawai" : "Form Edit Profil"}
                        </h3>
                        <p className="text-sm text-[var(--foreground)] dark:text-zinc-500">
                            {isStaff
                                ? "Perbarui informasi akun pegawai dan data profil Anda"
                                : "Perbarui informasi data diri dan kontak Anda"}
                        </p>
                    </div>
                </div>
            </div>

            {error && (
                <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-200 dark:bg-red-950/20 dark:border-red-900/50 dark:text-red-400">
                    {error}
                </div>
            )}
            {success && (
                <div className="rounded-lg bg-secondary-green-color p-4 text-sm text-green-color border border-[var(--green-color)]/50">
                    {success}
                </div>
            )}

            <div className="grid gap-6 sm:grid-cols-2">
                {/* Nama Lengkap */}
                <div className="space-y-2">
                    <label htmlFor="namaLengkap" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                        Nama Lengkap <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="namaLengkap"
                        type="text"
                        required
                        value={nama}
                        onChange={(e) => setNama(e.target.value)}
                        className="block w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-[#F8FAFC] dark:bg-zinc-950 px-4 py-3 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 shadow-sm focus:border-[var(--green-color)] focus:outline-none focus:ring-1 focus:ring-[var(--green-color)]"
                        placeholder="Masukkan nama lengkap..."
                    />
                </div>

                {/* No Telp */}
                <div className="space-y-2">
                    <label htmlFor="noTelp" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                        No. Telepon / WhatsApp <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="noTelp"
                        type="tel"
                        required
                        value={noHp}
                        onChange={(e) => setNoHp(e.target.value)}
                        className="block w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-[#F8FAFC] dark:bg-zinc-950 px-4 py-3 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 shadow-sm focus:border-[var(--green-color)] focus:outline-none focus:ring-1 focus:ring-[var(--green-color)]"
                        placeholder="08123456789"
                    />
                </div>

                {/* NIP / No KTP */}
                <div className="space-y-2">
                    <label htmlFor="nipKtp" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                        {isStaff ? "NIP" : "NIK / No. KTP"} <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="nipKtp"
                        type="text"
                        required
                        value={nip}
                        onChange={(e) => setNip(e.target.value)}
                        className="block w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-[#F8FAFC] dark:bg-zinc-950 px-4 py-3 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 shadow-sm focus:border-[var(--green-color)] focus:outline-none focus:ring-1 focus:ring-[var(--green-color)]"
                        placeholder={isStaff ? "Masukkan NIP..." : "Masukkan NIK atau No. KTP..."}
                    />
                </div>

                {/* Email */}
                <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                        Email <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="block w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-[#F8FAFC] dark:bg-zinc-950 px-4 py-3 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 shadow-sm focus:border-[var(--green-color)] focus:outline-none focus:ring-1 focus:ring-[var(--green-color)]"
                        placeholder="nama@email.com"
                    />
                </div>
            </div>

            {isStaff && (
                <div className="grid gap-6 sm:grid-cols-2">
                    {/* Role (Read Only) */}
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                            Role <span className="text-zinc-400 text-xs">(Tidak dapat diubah)</span>
                        </label>
                        <input
                            type="text"
                            disabled
                            value={getRoleLabel(userRole)}
                            className="block w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-[#F1F5F9] dark:bg-zinc-900 px-4 py-3 text-sm text-zinc-500 dark:text-zinc-450 cursor-not-allowed shadow-none"
                        />
                    </div>

                    {/* Unit Teknis (Read Only) */}
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                            Unit Teknis <span className="text-zinc-400 text-xs">(Tidak dapat diubah)</span>
                        </label>
                        <input
                            type="text"
                            disabled
                            value={userRole === "pegawai" ? (getUnitName(unitTeknisId) || "-") : "-"}
                            className="block w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-[#F1F5F9] dark:bg-zinc-900 px-4 py-3 text-sm text-zinc-500 dark:text-zinc-450 cursor-not-allowed shadow-none"
                        />
                    </div>
                </div>
            )}

            {!isStaff && (
                <>
                    {/* Asal Instansi */}
                    <div className="space-y-2">
                        <label htmlFor="instansi" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                            Asal Instansi <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="instansi"
                            type="text"
                            required={!isStaff}
                            value={instansi}
                            onChange={(e) => setInstansi(e.target.value)}
                            className="block w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-[#F8FAFC] dark:bg-zinc-950 px-4 py-3 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 shadow-sm focus:border-[var(--green-color)] focus:outline-none focus:ring-1 focus:ring-[var(--green-color)]"
                            placeholder="Masukkan nama instansi asal..."
                        />
                    </div>

                    {/* Alamat Lengkap */}
                    <div className="space-y-2">
                        <label htmlFor="alamat" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                            Alamat Lengkap <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            id="alamat"
                            required={!isStaff}
                            rows={3}
                            value={alamat}
                            onChange={(e) => setAlamat(e.target.value)}
                            className="block w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-[#F8FAFC] dark:bg-zinc-950 px-4 py-3 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 shadow-sm focus:border-[var(--green-color)] focus:outline-none focus:ring-1 focus:ring-[var(--green-color)] resize-none"
                            placeholder="Masukkan alamat lengkap rumah/kantor..."
                        />
                    </div>
                </>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between md:justify-end gap-4 mt-6">
                <button
                    type="button"
                    onClick={() => router.push(isStaff ? "/profile" : "/profile-publik")}
                    className="px-4 md:px-6 py-2 md:py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl text-xs md:text-sm font-bold transition hover:cursor-pointer"
                >
                    Batal
                </button>
                <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-[var(--green-color)] hover:cursor-pointer text-white rounded-xl text-xs md:text-sm font-bold shadow-md transition flex items-center gap-2 disabled:opacity-55 disabled:cursor-not-allowed"
                >
                    {saving ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
            </div>
        </form>
    );
}