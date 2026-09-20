"use client";

interface StatusLayananBadgeProps {
  status: string;
  className?: string;
  layananSlug?: string;
  namaLayanan?: string;
  isMagang?: boolean;
}

const statusStyles: Record<string, string> = {
  // Menunggu / Netral (abu-abu, turunan slate)
  diajukan: "bg-zinc-100 text-zinc-600 border border-zinc-200 dark:bg-zinc-800/40 dark:text-zinc-400 dark:border-zinc-700",
  tiket_dibuat: "bg-zinc-100 text-zinc-600 border border-zinc-200 dark:bg-zinc-800/40 dark:text-zinc-400 dark:border-zinc-700",
  menunggu_verifikasi: "bg-zinc-100 text-zinc-600 border border-zinc-200 dark:bg-zinc-800/40 dark:text-zinc-400 dark:border-zinc-700",
  menunggu_persetujuan_kepala_balai: "bg-zinc-100 text-zinc-600 border border-zinc-200 dark:bg-zinc-800/40 dark:text-zinc-400 dark:border-zinc-700",

  // Perlu Perhatian (kuning, dari --yellow-color)
  perlu_revisi: "bg-[#FFFBE0] text-[#8A6D00] border border-[#FFF0A3] dark:bg-yellow-950/20 dark:text-yellow-400 dark:border-yellow-900/50",
  menunggu_pembayaran: "bg-amber-50 border border-amber-200 text-amber-800",
  menunggu_konfirmasi: "bg-[#FFFBE0] text-[#8A6D00] border border-[#FFF0A3] dark:bg-yellow-950/20 dark:text-yellow-400 dark:border-yellow-900/50",

  // Sedang Diproses (teal — hijau kebiruan, beda arah dari "selesai")
  diproses: "bg-[#E6F4F4] text-[#0F6B6B] border border-[#C2E5E5] dark:bg-teal-950/20 dark:text-teal-400 dark:border-teal-900/50",
  dipinjam: "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800",
  diterima: "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800",

  // Selesai / Berhasil (hijau pekat, green-color asli — lebih solid/pekat)
  selesai: "bg-[#145326] text-white border border-[#145326] dark:bg-secondary-green-color dark:text-white dark:border-secondary-green-color",

  // Dibatalkan / Ditolak (merah muted)
  ditolak: "bg-red-50 text-red-600 border border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/50",
  dibatalkan: "bg-red-50 text-red-600 border border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/50",
};

const statusDots: Record<string, string> = {
  diajukan: "bg-zinc-400",
  tiket_dibuat: "bg-zinc-400",
  menunggu_verifikasi: "bg-zinc-400",
  menunggu_persetujuan_kepala_balai: "bg-zinc-400",

  perlu_revisi: "bg-[#C9A200]",
  menunggu_pembayaran: "bg-amber-800",
  menunggu_konfirmasi: "bg-[#C9A200]",

  diproses: "bg-[#2E9B54]",
  dipinjam: "bg-blue-500",
  diterima: "bg-emerald-500",

  selesai: "bg-white",

  ditolak: "bg-[#B3392B]",
  dibatalkan: "bg-[#B3392B]",
};

const statusLabels: Record<string, string> = {
  diajukan: "Diajukan",
  tiket_dibuat: "Diajukan",
  menunggu_verifikasi: "Menunggu Verifikasi",
  menunggu_persetujuan_kepala_balai: "Menunggu Persetujuan",
  perlu_revisi: "Perlu Revisi",
  menunggu_pembayaran: "Menunggu Pembayaran",
  diproses: "Diproses",
  dipinjam: "Dipinjam",
  diterima: "Diterima",
  menunggu_konfirmasi: "Menunggu Konfirmasi",
  selesai: "Selesai",
  ditolak: "Ditolak",
  dibatalkan: "Dibatalkan",
};

export default function StatusLayananBadge({
  status,
  className = "",
  layananSlug = "",
  namaLayanan = "",
  isMagang = false
}: StatusLayananBadgeProps) {
  const effectiveStatus = status;

  const styleClass = statusStyles[effectiveStatus] || "bg-zinc-50 text-zinc-700 border border-zinc-200 dark:bg-zinc-950/20 dark:text-zinc-400 dark:border-zinc-800";
  const dotClass = statusDots[effectiveStatus] || "bg-zinc-500";
  const label = statusLabels[effectiveStatus] || effectiveStatus;

  return (
    <div className={`px-2 py-1 rounded-full flex items-center gap-1.5 w-fit ${styleClass} ${className}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dotClass}`} />
      <span className="text-[10px] font-semibold">{label}</span>
    </div>
  );
}