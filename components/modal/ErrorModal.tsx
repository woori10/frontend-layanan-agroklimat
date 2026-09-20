"use client";

import React from "react";
import { AlertCircle, X } from "lucide-react";

interface ErrorModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    message?: React.ReactNode;
    confirmText?: string;
    onConfirm?: () => void;
}

export default function ErrorModal({
    isOpen,
    onClose,
    title = "Terjadi Kesalahan",
    message = "Gagal memproses permintaan. Silakan coba lagi.",
    confirmText = "Tutup",
    onConfirm,
}: ErrorModalProps) {
    if (!isOpen) return null;

    const handleConfirm = () => {
        if (onConfirm) {
            onConfirm();
        } else {
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/55 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Modal Box */}
            <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 animate-in fade-in zoom-in-95 duration-200 text-center font-sans">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition cursor-pointer"
                >
                    <X className="h-4 w-4" />
                </button>

                {/* Icon */}
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400">
                    <AlertCircle className="h-8 w-8" />
                </div>

                {/* Title */}
                <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-2">
                    {title}
                </h3>

                {/* Message */}
                <div className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium mb-6">
                    {typeof message === "string" ? <p>{message}</p> : message}
                </div>

                {/* Action Button */}
                <div className="flex justify-center">
                    <button
                        type="button"
                        onClick={handleConfirm}
                        className="w-full py-2.5 px-4 text-xs font-semibold rounded-xl bg-red-600 hover:bg-red-700 text-white transition shadow-sm cursor-pointer"
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
