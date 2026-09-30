"use client";

import { KeyRound, X, AlertCircle } from "lucide-react";

interface ConfirmGenerateCredentialModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    username: string;
    loading?: boolean;
}

export default function ConfirmGenerateCredentialModal({
    isOpen,
    onClose,
    onConfirm,
    username,
    loading = false,
}: ConfirmGenerateCredentialModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 transition-opacity"
                onClick={!loading ? onClose : undefined}
            />

            {/* Modal Box */}
            <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 animate-in fade-in zoom-in duration-200 text-left font-sans z-10">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    disabled={loading}
                    className="absolute right-4 top-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition cursor-pointer disabled:opacity-40"
                >
                    <X className="h-5 w-5" />
                </button>

                {/* Content */}
                <div className="flex flex-col items-center text-center mt-1">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 mb-4">
                        <KeyRound className="h-6 w-6" />
                    </div>

                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                        Generate Kredensial Baru
                    </h3>
                    <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 mt-2 leading-relaxed">
                        Apakah Anda ingin membuat kata sandi baru untuk akun{" "}
                        <strong className="text-zinc-900 dark:text-white font-bold">
                            &quot;{username}&quot;
                        </strong>{" "}
                        dan mengunduh slip data kredensialnya (PDF)?
                    </p>

                    <div className="mt-4 w-full rounded-xl border border-amber-200/80 bg-amber-50/70 p-3 dark:border-amber-900/40 dark:bg-amber-950/20 flex items-start gap-2.5 text-left">
                        <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                        <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-normal">
                            Kata sandi akun sebelumnya akan digantikan dengan kata sandi baru yang baru saja digenerate oleh sistem.
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="mt-6 flex gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 rounded-xl border border-zinc-200 bg-white py-2.5 text-xs sm:text-sm font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 transition cursor-pointer disabled:opacity-50"
                    >
                        Batal
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={loading}
                        className="flex-1 rounded-xl bg-[var(--green-color)] py-2.5 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-[#22482E] transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loading ? (
                            <>
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                <span>Memproses...</span>
                            </>
                        ) : (
                            <span>Ya, Generate & Unduh</span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
