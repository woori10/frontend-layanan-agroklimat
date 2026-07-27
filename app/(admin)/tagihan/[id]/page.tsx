"use client";

import { useParams } from "next/navigation";
import Sidebar from "@/components/sidebar/Sidebar";
import AppBar from "@/components/appbar/AppBar";
import { useState } from "react";

const servicesMap: Record<string, string> = {
  "1": "Rekomendasi Siap Tanam",
  "2": "Rekomendasi & Penilaian Kesesuaian Agroklimat/Hidrologi (SNI)",
  "3": "Peminjaman Alat",
  "4": "Permohonan Data",
  "5": "Konsultasi Rekomendasi & Penilaian Kesesuaian",
  "6": "Bimbingan Teknis & Narasumber",
  "7": "Magang Teknis / PKL",
  "8": "Layanan Perpustakaan",
  "9": "Agroedukasi / Kunjungan Edukasi",
};

export default function TagihanLayananPage() {
  const params = useParams();
  const id = params.id as string;
  const serviceName = servicesMap[id] || "Layanan Tidak Dikenal";
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 overflow-hidden font-sans">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-y-auto">
        <AppBar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-6 space-y-6">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
            <h1 className="text-2xl font-bold text-[var(--green-color)] dark:text-zinc-50">
              Tagihan - {serviceName}
            </h1>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Mengelola tagihan untuk ID Layanan: {id}
            </p>
            {/* Logika tagihan dapat dimasukkan di sini */}
          </div>
        </main>
      </div>
    </div>
  );
}
