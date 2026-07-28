"use client";

interface StatusLayananBadgeProps {
  status: string;
  className?: string;
}

const statusStyles: Record<string, string> = {
  Diproses: "bg-[#FEF6E6] text-[#B27B1E] border border-[#FBE6C4] dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/50",
  Selesai: "bg-[#E6F7ED] text-[#1E824C] border border-[#CBEED7] dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50",
  Ditolak: "bg-[#FCECEE] text-[#C0392B] border border-[#F9D6D9] dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/50",
  
  // Tambahan status-status lain dari backend (jika ada lowercase/uppercase mapping)
  diajukan: "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/50",
  menunggu_verifikasi: "bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/20 dark:text-purple-400 dark:border-purple-900/50",
  perlu_revisi: "bg-orange-50 text-orange-700 border border-orange-200 dark:bg-orange-950/20 dark:text-orange-400 dark:border-orange-900/50",
  menunggu_pembayaran: "bg-yellow-50 text-yellow-700 border border-yellow-200 dark:bg-yellow-950/20 dark:text-yellow-400 dark:border-yellow-900/50",
  diproses: "bg-[#FEF6E6] text-[#B27B1E] border border-[#FBE6C4] dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/50",
  selesai_diproses: "bg-teal-50 text-teal-700 border border-teal-200 dark:bg-teal-950/20 dark:text-teal-400 dark:border-teal-900/50",
  menunggu_konfirmasi: "bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-900/50",
  selesai: "bg-[#E6F7ED] text-[#1E824C] border border-[#CBEED7] dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50",
  ditolak: "bg-[#FCECEE] text-[#C0392B] border border-[#F9D6D9] dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/50",
  dibatalkan: "bg-zinc-50 text-zinc-700 border border-zinc-200 dark:bg-zinc-950/20 dark:text-zinc-400 dark:border-zinc-900/50",
};

const statusDots: Record<string, string> = {
  Diproses: "bg-[#B27B1E] dark:bg-amber-400",
  Selesai: "bg-[#1E824C] dark:bg-emerald-400",
  Ditolak: "bg-[#C0392B] dark:bg-red-400",
  
  diajukan: "bg-blue-500",
  menunggu_verifikasi: "bg-purple-500",
  perlu_revisi: "bg-orange-500",
  menunggu_pembayaran: "bg-yellow-500",
  diproses: "bg-[#B27B1E] dark:bg-amber-400",
  selesai_diproses: "bg-teal-500",
  menunggu_konfirmasi: "bg-indigo-500",
  selesai: "bg-[#1E824C] dark:bg-emerald-400",
  ditolak: "bg-[#C0392B] dark:bg-red-400",
  dibatalkan: "bg-zinc-500",
};

const statusLabels: Record<string, string> = {
  Diproses: "Diproses",
  Selesai: "Selesai",
  Ditolak: "Ditolak",
  
  diajukan: "Diajukan",
  menunggu_verifikasi: "Menunggu Verifikasi",
  perlu_revisi: "Perlu Revisi",
  menunggu_pembayaran: "Menunggu Pembayaran",
  diproses: "Diproses",
  selesai_diproses: "Selesai Diproses",
  menunggu_konfirmasi: "Menunggu Konfirmasi",
  selesai: "Selesai",
  ditolak: "Ditolak",
  dibatalkan: "Dibatalkan",
};

export default function StatusLayananBadge({ status, className = "" }: StatusLayananBadgeProps) {
  // Gunakan style bawaan atau fallback ke style default jika status tidak terdaftar
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
