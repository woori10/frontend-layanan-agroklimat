'use client';
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { saveAuthSession } from "@/lib/auth";

export default function EditProfile() {
    const router = useRouter();
    const [nama, setNama] = useState("");
    const [nip, setNip] = useState("");
    const [noHp, setNoHp] = useState("");
    const [email, setEmail] = useState("");
    const [instansi, setInstansi] = useState("");
    const [alamat, setAlamat] = useState("");
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("agro_token");
        if (!token) {
            router.push("/login");
            return;
        }

        fetch("http://localhost:3000/auth/profile", {
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
            const res = await fetch("http://localhost:3000/auth/profile", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    nama,
                    nip,
                    no_hp: noHp,
                    instansi,
                    alamat
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Gagal memperbarui profil.");
            }

            // Save new token in session if returned
            if (data.access_token) {
                saveAuthSession(data.access_token, email, "email");
            }

            setSuccess("Profil berhasil diperbarui!");
            setTimeout(() => {
                router.push("/profile-publik");
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
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="bg-white border border-zinc-200 rounded-xl p-8 shadow-sm w-full space-y-6">
            {error && (
                <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-200">
                    {error}
                </div>
            )}
            {success && (
                <div className="rounded-lg bg-emerald-50 p-4 text-sm text-emerald-700 border border-emerald-250">
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
                        NIK / No. KTP <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="nipKtp"
                        type="text"
                        required
                        value={nip}
                        onChange={(e) => setNip(e.target.value)}
                        className="block w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-[#F8FAFC] dark:bg-zinc-950 px-4 py-3 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 shadow-sm focus:border-[var(--green-color)] focus:outline-none focus:ring-1 focus:ring-[var(--green-color)]"
                        placeholder="Masukkan NIK atau No. KTP..."
                    />
                </div>

                {/* Email */}
                <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                        Email <span className="text-zinc-450">(Tidak dapat diubah)</span>
                    </label>
                    <input
                        id="email"
                        type="email"
                        disabled
                        value={email}
                        className="block w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-[#F1F5F9] dark:bg-zinc-900 px-4 py-3 text-sm text-zinc-500 dark:text-zinc-400 cursor-not-allowed shadow-none"
                    />
                </div>
            </div>

            {/* Asal Instansi */}
            <div className="space-y-2">
                <label htmlFor="instansi" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    Asal Instansi <span className="text-red-500">*</span>
                </label>
                <input
                    id="instansi"
                    type="text"
                    required
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
                    required
                    rows={3}
                    value={alamat}
                    onChange={(e) => setAlamat(e.target.value)}
                    className="block w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-[#F8FAFC] dark:bg-zinc-950 px-4 py-3 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 shadow-sm focus:border-[var(--green-color)] focus:outline-none focus:ring-1 focus:ring-[var(--green-color)] resize-none"
                    placeholder="Masukkan alamat lengkap rumah/kantor..."
                />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 mt-6">
                <button
                    type="button"
                    onClick={() => router.push("/profile-publik")}
                    className="px-6 py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl text-sm font-bold transition hover:cursor-pointer"
                >
                    Batal
                </button>
                <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-3 bg-[var(--green-color)] hover:cursor-pointer text-white rounded-xl text-sm font-bold shadow-md transition flex items-center gap-2 disabled:opacity-55 disabled:cursor-not-allowed"
                >
                    {saving ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
            </div>
        </form>
    );
}