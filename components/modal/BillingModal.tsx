"use client";

import { useState, useEffect } from "react";

interface BillingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (jumlahSatuan: number) => void;
    ticket: {
        layanan: {
            nama: string;
            biaya?: {
                nominal: number;
            } | null;
        };
    } | null;
    actionLoading: boolean;
}

export default function BillingModal({
    isOpen,
    onClose,
    onConfirm,
    ticket,
    actionLoading
}: BillingModalProps) {
    const [jumlahSatuan, setJumlahSatuan] = useState<number>(1);

    // Reset local state when modal is opened
    useEffect(() => {
        if (isOpen) {
            setJumlahSatuan(1);
        }
    }, [isOpen]);

    if (!isOpen || !ticket) return null;

    const nominalBiaya = ticket.layanan.biaya?.nominal || 0;
    const totalEstimasi = nominalBiaya * jumlahSatuan;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-xs p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 animate-in fade-in zoom-in duration-200">
                <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-2">
                    Buat Tagihan Layanan
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
                    Layanan <strong>{ticket.layanan.nama}</strong> bertipe satuan. Input jumlah satuan untuk menghitung nominal tagihan.
                </p>

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-zinc-500 mb-1.5 uppercase">
                            Jumlah Satuan (misal: Hari / Sesi / Halaman)
                        </label>
                        <input
                            type="number"
                            min="1"
                            value={jumlahSatuan}
                            onChange={(e) => setJumlahSatuan(Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm bg-zinc-50 dark:bg-zinc-950 dark:border-zinc-800 focus:outline-hidden focus:border-emerald-500"
                        />
                    </div>

                    <div className="p-3 bg-zinc-50 rounded-lg dark:bg-zinc-950/60 border border-zinc-100 dark:border-zinc-800">
                        <div className="flex justify-between text-xs">
                            <span className="text-zinc-500">Tarif Dasar per Satuan:</span>
                            <span className="font-bold text-zinc-850 dark:text-zinc-200">
                                Rp{nominalBiaya.toLocaleString("id-ID")}
                            </span>
                        </div>
                        <div className="flex justify-between text-xs mt-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                            <span className="font-bold text-zinc-900 dark:text-white">Estimasi Total Tagihan:</span>
                            <span className="font-extrabold text-emerald-600">
                                Rp{totalEstimasi.toLocaleString("id-ID")}
                            </span>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-xs font-semibold rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-750 dark:text-zinc-200 cursor-pointer"
                        >
                            Batal
                        </button>
                        <button
                            type="button"
                            onClick={() => onConfirm(jumlahSatuan)}
                            disabled={actionLoading}
                            className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-xs disabled:opacity-50"
                        >
                            {actionLoading ? "Memproses..." : "Buat Tagihan"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
