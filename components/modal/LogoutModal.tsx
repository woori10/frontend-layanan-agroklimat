"use client";

import { LogOut, X } from "lucide-react";

interface LogoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export default function LogoutModal({ isOpen, onClose, onConfirm }: LogoutModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm transition-opacity duration-300"
                onClick={onClose}
            />

            {/* Modal Box */}
            <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 transition-all transform scale-100 duration-300 text-left">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition cursor-pointer"
                >
                    <X className="h-5 w-5" />
                </button>

                {/* Content */}
                <div className="flex flex-col items-center text-center mt-2">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-450 mb-4">
                        <LogOut className="h-6 w-6" />
                    </div>

                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                        Konfirmasi Logout
                    </h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 leading-relaxed font-medium">
                        Apakah Anda yakin ingin keluar dari logout?
                    </p>
                </div>

                {/* Actions */}
                <div className="mt-6 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 rounded-xl border border-zinc-200 bg-white py-2.5 text-sm font-bold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 transition cursor-pointer"
                    >
                        Batal
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 rounded-xl bg-red-700 py-2.5 text-sm font-bold text-white shadow-md hover:bg-rose-550 shadow-rose-600/10 transition cursor-pointer"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
}
