"use client";

import { X, MessageSquareWarning } from "lucide-react";
import PengaduanForm from "../form/pengaduan/page";

interface PengaduanModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function PengaduanModal({ isOpen, onClose }: PengaduanModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm transition-opacity duration-300"
                onClick={onClose}
            />

            {/* Modal Box */}
            <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 transition-all transform scale-100 duration-300 text-left flex flex-col">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition cursor-pointer z-10"
                >
                    <X className="h-5 w-5" />
                </button>

                {/* Modal Header */}
                <div className="flex items-start gap-4 pr-6 mb-4">
                    <div className="rounded-xl bg-amber-50 p-3 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 flex-shrink-0">
                        <MessageSquareWarning className="h-6 w-6" />
                    </div>
                    <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50/50 px-2 py-0.5 rounded-md dark:bg-amber-950/30 dark:text-amber-400">
                            Pusat Pengaduan
                        </span>
                        <h3 className="text-xl font-extrabold text-zinc-900 dark:text-white mt-1">
                            Sampaikan Pengaduan Anda
                        </h3>
                    </div>
                </div>

                {/* Modal Body with Form */}
                <PengaduanForm onClose={onClose} />
            </div>
        </div>
    );
}
