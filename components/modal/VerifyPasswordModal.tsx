"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Eye, EyeOff, X, KeyRound, Loader2, AlertCircle } from "lucide-react";
import { getApiUrl } from "@/lib/api";

interface VerifyPasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function VerifyPasswordModal({ isOpen, onClose }: VerifyPasswordModalProps) {
    const router = useRouter();
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    if (!isOpen) return null;

    const handleClose = () => {
        setPassword("");
        setError("");
        setShowPassword(false);
        onClose();
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!password) {
            setError("Silakan masukkan kata sandi saat ini.");
            return;
        }

        setLoading(true);

        try {
            const token = localStorage.getItem("agro_token");
            if (!token) {
                router.push("/login");
                return;
            }

            const res = await fetch(`${getApiUrl()}/auth/verify-current-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ password }),
            });

            const data = await res.json();

            if (!res.ok) {
                const msg = Array.isArray(data.message) ? data.message.join(", ") : data.message;
                throw new Error(msg || "Kata sandi yang Anda masukkan salah.");
            }

            // Simpan flag bahwa user telah memverifikasi password saat ini
            sessionStorage.setItem("agro_pwd_verified", Date.now().toString());

            handleClose();
            router.push("/ganti-kata-sandi");
        } catch (err: any) {
            setError(err.message || "Terjadi kesalahan saat memverifikasi kata sandi.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="relative w-full max-w-md rounded-2xl bg-white p-6 sm:p-7 shadow-2xl dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 animate-in zoom-in-95 duration-200">
                {/* Close Button */}
                <button
                    type="button"
                    onClick={handleClose}
                    className="absolute right-4 top-4 rounded-xl p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 transition cursor-pointer"
                >
                    <X className="h-5 w-5" />
                </button>

                {/* Header */}
                <div className="flex items-center gap-3.5 mb-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary-green-color text-[var(--green-color)] dark:bg-emerald-950/40 dark:text-emerald-400">
                        <KeyRound className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-white leading-snug">
                            Verifikasi Kata Sandi
                        </h3>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            Keamanan Akun Anda
                        </p>
                    </div>
                </div>

                <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-5 leading-relaxed">
                    Untuk melanjutkan perubahan kata sandi, silakan masukkan kata sandi yang sedang Anda gunakan saat ini.
                </p>

                {error && (
                    <div className="mb-4 rounded-xl bg-red-50 p-3 text-xs text-red-700 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-900/50 flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleVerify} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                            Kata Sandi Saat Ini
                        </label>
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <Lock className="h-4 w-4 text-zinc-400" />
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                autoFocus
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Masukkan kata sandi saat ini"
                                className="block w-full rounded-xl border border-zinc-200 bg-white py-2.5 pl-9 pr-10 text-xs text-zinc-900 placeholder-zinc-400 focus:border-[var(--green-color)] focus:outline-none focus:ring-1 focus:ring-[var(--green-color)] dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={loading}
                            className="rounded-xl px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 transition cursor-pointer disabled:opacity-50"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !password}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--green-color)] px-5 py-2.5 text-xs font-bold text-white hover:bg-[var(--green-color)]/90 shadow-sm transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                            <span>{loading ? "Memverifikasi..." : "Verifikasi & Lanjutkan"}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
