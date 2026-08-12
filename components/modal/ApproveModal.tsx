"use client";

interface ApproveModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    unitTeknisName: string;
    actionLoading: boolean;
}

export default function ApproveModal({
    isOpen,
    onClose,
    onConfirm,
    unitTeknisName,
    actionLoading
}: ApproveModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-xs p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 animate-in fade-in zoom-in duration-200 text-left font-sans">
                <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-2">
                    Konfirmasi Persetujuan
                </h3>
                <p className="text-xs text-zinc-650 dark:text-zinc-400 mb-4 leading-relaxed font-medium">
                    Apakah Anda yakin ingin menyetujui tiket ini? Permohonan akan segera didisposisikan ke : <strong className="text-[#2C5E3B] dark:text-emerald-400 font-bold">{unitTeknisName || "Unit Teknis Terkait"}</strong>.
                </p>

                <div className="flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-xs font-semibold rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-750 dark:text-zinc-200 cursor-pointer"
                    >
                        Batal
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={actionLoading}
                        className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#2C5E3B] hover:bg-[#1E4329] text-white cursor-pointer shadow-xs disabled:opacity-50"
                    >
                        {actionLoading ? "Memproses..." : "Setuju & Disposisi"}
                    </button>
                </div>
            </div>
        </div>
    );
}
