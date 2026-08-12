"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";

interface RejectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (alasan: string) => void;
    actionLoading: boolean;
    tiket?: {
        no_tiket: string;
    } | null;
}

export default function RejectModal({
    isOpen,
    onClose,
    onConfirm,
    actionLoading,
    tiket
}: RejectModalProps) {
    const [catatanPenolakan, setCatatanPenolakan] = useState("");

    // Reset local state when modal is opened
    useEffect(() => {
        if (isOpen) {
            setCatatanPenolakan("");
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-xs p-4">
            {/* Backdrop */}
            <div className="absolute inset-0" onClick={onClose} />

            {/* Modal Content */}
            <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 animate-in fade-in zoom-in duration-200 text-left overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 dark:bg-red-950/30 text-red-650 dark:text-red-400">
                            <AlertTriangle className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-zinc-900 dark:text-white leading-tight">
                                Konfirmasi Penolakan
                            </h3>
                            <p className="text-xs font-bold text-emerald-650 dark:text-emerald-400 tracking-wide mt-0.5">
                                ID: {tiket?.no_tiket || "-"}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-200 transition cursor-pointer"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                        Anda akan menolak permohonan ini. Harap berikan alasan penolakan untuk diinformasikan kepada pemohon yang bersangkutan.
                    </p>

                    <div className="space-y-2">
                        <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                            Alasan Penolakan <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            rows={4}
                            maxLength={100}
                            placeholder="Contoh: Lampiran surat sakit tidak terbaca atau kebutuhan operasional yang mendesak..."
                            value={catatanPenolakan}
                            onChange={(e) => setCatatanPenolakan(e.target.value)}
                            className="w-full px-4 py-3 border border-zinc-200 rounded-2xl text-sm bg-zinc-50 dark:bg-zinc-950 dark:border-zinc-800 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 font-sans resize-none transition duration-150"
                        />
                        <div className="flex justify-end">
                            <span className="text-[10px] font-medium text-zinc-450 dark:text-zinc-550 uppercase tracking-wider">
                                Maksimal 100 karakter
                            </span>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex justify-end items-center gap-4 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 text-sm font-bold text-zinc-650 hover:text-zinc-900 dark:text-zinc-350 dark:hover:text-white transition cursor-pointer"
                        >
                            Batal
                        </button>
                        <button
                            type="button"
                            onClick={() => onConfirm(catatanPenolakan)}
                            disabled={actionLoading || !catatanPenolakan.trim()}
                            className="px-6 py-2.5 text-sm font-bold rounded-2xl bg-red-800 hover:bg-red-900 text-white cursor-pointer shadow-md disabled:opacity-50 transition duration-150"
                        >
                            {actionLoading ? "Mengirim..." : "Kirim Penolakan"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
