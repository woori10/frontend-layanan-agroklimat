"use client";

interface StatusLayananBadgeProps {
  status: string;
  className?: string;
}

const statusStyles: Record<string, string> = {
  // Menunggu / Netral (abu-abu, turunan slate)
  diajukan: "bg-zinc-100 text-zinc-600 border border-zinc-200 dark:bg-zinc-800/40 dark:text-zinc-400 dark:border-zinc-700",
  menunggu_verifikasi: "bg-zinc-100 text-zinc-600 border border-zinc-200 dark:bg-zinc-800/40 dark:text-zinc-400 dark:border-zinc-700",
  menunggu_persetujuan_kepala_balai: "bg-zinc-100 text-zinc-600 border border-zinc-200 dark:bg-zinc-800/40 dark:text-zinc-400 dark:border-zinc-700",

  // Perlu Perhatian (kuning, dari --yellow-color)
  perlu_revisi: "bg-[#FFFBE0] text-[#8A6D00] border border-[#FFF0A3] dark:bg-yellow-950/20 dark:text-yellow-400 dark:border-yellow-900/50",
  menunggu_pembayaran: "bg-[#FFFBE0] text-[#8A6D00] border border-[#FFF0A3] dark:bg-yellow-950/20 dark:text-yellow-400 dark:border-yellow-900/50",
  menunggu_konfirmasi: "bg-[#FFFBE0] text-[#8A6D00] border border-[#FFF0A3] dark:bg-yellow-950/20 dark:text-yellow-400 dark:border-yellow-900/50",

  // Sedang Diproses (teal — hijau kebiruan, beda arah dari "selesai")
  diproses: "bg-[#E6F4F4] text-[#0F6B6B] border border-[#C2E5E5] dark:bg-teal-950/20 dark:text-teal-400 dark:border-teal-900/50",

  // Selesai / Berhasil (hijau pekat, green-color asli — lebih solid/pekat)
  selesai: "bg-[#145326] text-white border border-[#145326] dark:bg-emerald-700 dark:text-white dark:border-emerald-600",

  // Dibatalkan / Ditolak (merah muted)
  ditolak: "bg-[#FCECEE] text-[#B3392B] border border-[#F5D2D5] dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/50",
  dibatalkan: "bg-[#FCECEE] text-[#B3392B] border border-[#F5D2D5] dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/50",
};

const statusDots: Record<string, string> = {
  diajukan: "bg-zinc-400",
  menunggu_verifikasi: "bg-zinc-400",
  menunggu_persetujuan_kepala_balai: "bg-zinc-400",

  perlu_revisi: "bg-[#C9A200]",
  menunggu_pembayaran: "bg-[#C9A200]",
  menunggu_konfirmasi: "bg-[#C9A200]",

  diproses: "bg-[#2E9B54]",

  selesai: "bg-white",

  ditolak: "bg-[#B3392B]",
  dibatalkan: "bg-[#B3392B]",
};

const statusLabels: Record<string, string> = {
  diajukan: "Diajukan",
  menunggu_verifikasi: "Menunggu Verifikasi",
  menunggu_persetujuan_kepala_balai: "Menunggu Persetujuan",
  perlu_revisi: "Perlu Revisi",
  menunggu_pembayaran: "Menunggu Pembayaran",
  diproses: "Diproses",
  menunggu_konfirmasi: "Menunggu Konfirmasi",
  selesai: "Selesai",
  ditolak: "Ditolak",
  dibatalkan: "Dibatalkan",
};

export default function StatusLayananBadge({ status, className = "" }: StatusLayananBadgeProps) {
  const styleClass = statusStyles[status] || "bg-zinc-50 text-zinc-700 border border-zinc-200 dark:bg-zinc-950/20 dark:text-zinc-400 dark:border-zinc-800";
  const dotClass = statusDots[status] || "bg-zinc-500";
  const label = statusLabels[status] || status;

  return (
    <div className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 w-fit ${styleClass} ${className}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dotClass}`} />
      <span>{label}</span>
    </div>
  );
}