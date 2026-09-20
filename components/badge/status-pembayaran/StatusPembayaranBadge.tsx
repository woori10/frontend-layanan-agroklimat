"use client";

import React from "react";

export type PaymentStatusType = "lunas" | "menunggu" | "batal" | string;

interface StatusPembayaranBadgeProps {
  status?: PaymentStatusType;
  className?: string;
}

const statusStyles: Record<string, string> = {
  lunas: "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50",
  menunggu: "bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50",
  batal: "bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/50",
};

const statusLabels: Record<string, string> = {
  lunas: "Lunas",
  menunggu: "Menunggu Pembayaran",
  batal: "Batal",
};

export default function StatusPembayaranBadge({
  status = "menunggu",
  className = "",
}: StatusPembayaranBadgeProps) {
  const normalizedStatus = (status || "").toLowerCase().trim();

  const styleClass =
    statusStyles[normalizedStatus] ||
    "bg-zinc-100 text-zinc-700 border border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700";

  const label =
    statusLabels[normalizedStatus] ||
    (status
      ? status.charAt(0).toUpperCase() + status.slice(1)
      : "Menunggu Pembayaran");

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${styleClass} ${className}`}
    >
      {label}
    </span>
  );
}
