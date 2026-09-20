"use client";

interface ApproveModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    unitTeknisName?: string;
    serviceSlug?: string;
    isPeminjamanAlat?: boolean;
    message?: React.ReactNode;
    title?: string;
    confirmButtonText?: string;
    actionLoading: boolean;
}

export default function ApproveModal({
    isOpen,
    onClose,
    onConfirm,
    unitTeknisName,
    serviceSlug,
    isPeminjamanAlat: isPeminjamanAlatProp,
    message,
    title,
    confirmButtonText,
    actionLoading
}: ApproveModalProps) {
    if (!isOpen) return null;

    const isPeminjamanAlat = isPeminjamanAlatProp || serviceSlug === "peminjaman-alat";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-xs p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 animate-in fade-in zoom-in duration-200 text-left font-sans">
                <h3 className="text-base text-center font-bold text-zinc-900 dark:text-white mb-2">
                    {title || "Konfirmasi Persetujuan"}
                </h3>
                <div className="text-xs text-center text-zinc-650 dark:text-zinc-400 mb-4 leading-relaxed font-medium">
                    {message ? (
                        message
                    ) : isPeminjamanAlat ? (
                        <>
                            <p>
                                Apakah Anda yakin ingin memverifikasi dan menyetujui tiket ini? Status tiket akan langsung berubah menjadi <strong className="text-[#2C5E3B] dark:text-secondary-green-color font-bold">Diproses</strong> dan diteruskan ke petugas laboratorium.
                            </p>
                        </>
                    ) : (
                        <p>
                            Apakah Anda yakin ingin menyetujui tiket ini? Permohonan akan segera didisposisikan ke <strong className="text-[#2C5E3B] dark:text-secondary-green-color font-bold">{unitTeknisName || "Unit Teknis Terkait"}</strong>.
                        </p>
                    )}
                </div>

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
                        className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#2C5E3B] hover:bg-[#1E4329] text-white cursor-pointer shadow-xs disabled:opacity-50"
                    >
                        {actionLoading ? "Memproses..." : (confirmButtonText || (isPeminjamanAlat ? "Setujui & Proses" : "Setuju & Disposisi"))}
                    </button>
                </div>
            </div>
        </div>
    );
}
