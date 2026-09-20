"use client";

interface ConfirmPenugasanModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    actionLoading: boolean;
    title?: string;
    message?: string;
    confirmText?: string;
}

export default function ConfirmPenugasanModal({
    isOpen,
    onClose,
    onConfirm,
    actionLoading,
    title,
    message,
    confirmText = "Selesai",
}: ConfirmPenugasanModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-xs p-4">
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-6 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 animate-in fade-in zoom-in duration-200 text-left font-sans">
                <h3 className="text-base text-center font-bold text-zinc-900 dark:text-white mb-2">
                    {title || "Konfirmasi Penugasan Layanan"}
                </h3>
                <p className="text-xs text-center text-zinc-650 dark:text-zinc-400 mb-4 leading-relaxed font-medium">
                    {message || "Apakah Anda yakin ingin menyelesaikan penugasan layanan ini? Dokumen hasil dan sertifikat yang diunggah akan dikirimkan ke pemohon dan tidak dapat dihapus lagi."}
                </p>

                <div className="flex justify-center gap-3">
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
                        className="px-4 py-2 text-xs font-semibold rounded-lg bg-green-color hover:bg-[var(--hover-green-color)] text-white cursor-pointer shadow-xs disabled:opacity-50"
                    >
                        {actionLoading ? "Memproses..." : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
