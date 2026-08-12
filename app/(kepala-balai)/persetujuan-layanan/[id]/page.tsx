"use client";

import { useParams, useRouter } from "next/navigation";
import Sidebar from "@/components/sidebar/Sidebar";
import AppBar from "@/components/appbar/AppBar";
import { useState, useEffect } from "react";
import { getTiketByLayanan, setujuiOlehKepalaBalai } from "@/lib/tiket";
import StatusLayananBadge from "@/components/badge/status-layanan/StatusLayananBadge";
import ApproveModal from "@/components/modal/ApproveModal";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";

function formatDate(dateString: string) {
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
}

const servicesMap: Record<string, string> = {
  "17": "Bimbingan Teknis & Narasumber",
  "20": "Magang Teknis / PKL",
  "21": "Agroedukasi / Kunjungan Edukasi",
};

interface Tiket {
  id: number;
  no_tiket: string;
  status: string;
  tanggal_submit: string;
  user: { nama: string };
  unit_teknis?: { nama: string } | null;
  jawaban_form?: any;
}

export default function PersetujuanLayananPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const serviceName = servicesMap[id] || "Layanan Tidak Dikenal";
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [tikets, setTikets] = useState<Tiket[]>([]);
  const [filteredTikets, setFilteredTikets] = useState<Tiket[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modal approval states
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [selectedTiket, setSelectedTiket] = useState<Tiket | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const totalItems = filteredTikets.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentTikets = filteredTikets.slice(startIndex, startIndex + itemsPerPage);

  const fetchTikets = () => {
    setLoading(true);
    getTiketByLayanan(Number(id))
      .then((data) => {
        // Filter only tickets that are waiting for kepala balai approval
        const filtered = data.filter((t: any) => t.status === "menunggu_persetujuan_kepala_balai");
        setTikets(filtered);
      })
      .catch((err: any) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTikets();
  }, [id]);

  useEffect(() => {
    let result = tikets;

    // Search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(t =>
        t.no_tiket.toLowerCase().includes(query) ||
        (t.jawaban_form?.nama_lengkap || t.user?.nama || "").toLowerCase().includes(query)
      );
    }

    setFilteredTikets(result);
    setCurrentPage(1); // Reset to first page when filtering
  }, [tikets, searchQuery]);

  const handleApproveClick = (tiket: Tiket) => {
    setSelectedTiket(tiket);
    setApproveModalOpen(true);
  };

  const handleConfirmApprove = async () => {
    if (!selectedTiket) return;
    setActionLoading(true);
    try {
      await setujuiOlehKepalaBalai(selectedTiket.id);
      alert("Tiket berhasil disetujui dan didisposisikan!");
      setApproveModalOpen(false);
      setSelectedTiket(null);
      fetchTikets(); // Refresh the list
    } catch (err: any) {
      alert(err.message || "Gagal menyetujui tiket");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 overflow-hidden font-sans">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-y-auto">
        <AppBar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-8 space-y-6">

          <div className="relative overflow-hidden space-y-3">
            <h1 className="text-2xl font-semibold md:text-3xl text-[var(--foreground)] dark:text-zinc-50">
              Persetujuan Tiket <span className="text-[var(--green-color)]">{serviceName}</span>
            </h1>
            <p className="mt-2 text-md text-zinc-600 dark:text-zinc-400">
              Menyetujui dan mendisposisikan tiket untuk layanan {serviceName} ke unit teknis terkait.
            </p>
          </div>

          {/* Search Bar */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-4 rounded-xl border border-zinc-200 shadow-xs dark:bg-zinc-900 dark:border-zinc-800">
            <div className="relative w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Cari nomor tiket, pemohon..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs border border-zinc-200 rounded-lg focus:outline-hidden focus:border-emerald-500 bg-zinc-50 dark:bg-zinc-950 dark:border-zinc-800"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm dark:bg-zinc-900 dark:border-zinc-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-zinc-200/80 dark:divide-zinc-800">
                <thead className="bg-[#E5E7EB]/50 dark:bg-zinc-950">
                  <tr>
                    <th scope="col" className="px-6 py-4.5 text-left text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider">
                      No Tiket
                    </th>
                    <th scope="col" className="px-6 py-4.5 text-left text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider">
                      Nama Pemohon
                    </th>
                    <th scope="col" className="px-6 py-4.5 text-center text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider">
                      Tanggal
                    </th>
                    <th scope="col" className="px-6 py-4.5 text-center text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-4.5 text-center text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 bg-white dark:bg-zinc-900">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-zinc-400 text-sm">
                        Memuat data...
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-red-500 text-sm">
                        {error}
                      </td>
                    </tr>
                  ) : filteredTikets.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-zinc-400 text-sm font-medium">
                        Tidak ada pengajuan yang membutuhkan persetujuan Anda saat ini.
                      </td>
                    </tr>
                  ) : (
                    currentTikets.map((tiket) => (
                      <tr
                        key={tiket.id}
                        className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 transition-colors animate-in fade-in duration-200"
                      >
                        <td className="px-6 py-5.5 whitespace-nowrap text-sm text-[var(--foreground)] dark:text-zinc-100 font-base text-left">
                          {tiket.no_tiket}
                        </td>
                        <td className="px-6 py-5.5 whitespace-nowrap text-sm text-[var(--foreground)] dark:text-zinc-100 font-base text-left">
                          {tiket.jawaban_form?.nama_lengkap || tiket.user?.nama || "-"}
                        </td>
                        <td className="px-6 py-5.5 whitespace-nowrap text-sm text-[var(--foreground)] dark:text-zinc-400 font-base text-center">
                          {formatDate(tiket.tanggal_submit)}
                        </td>
                        <td className="px-6 py-5.5 whitespace-nowrap text-sm text-center">
                          <div className="flex justify-center">
                            <StatusLayananBadge status={tiket.status} />
                          </div>
                        </td>
                        <td className="px-6 py-5.5 whitespace-nowrap text-sm text-center">
                          <div className="flex justify-center">
                            <button
                              onClick={() => router.push(`/persetujuan-layanan/${id}/${tiket.id}`)}
                              className="inline-flex items-center justify-center px-3 py-1.5 bg-[var(--green-color)] hover:bg-[#1E4329] text-white rounded-lg text-xs font-semibold shadow-sm transition cursor-pointer"
                            >
                              Detail
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            {filteredTikets.length > 0 && (
              <div className="flex items-center justify-between border-t border-zinc-200/80 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 px-6 py-4">
                <div className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                  Menampilkan {totalItems === 0 ? 0 : startIndex + 1}-{endIndex} dari {totalItems} permohonan
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="flex h-8 w-8 items-center justify-center rounded-md font-medium text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200/50 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:hover:bg-transparent transition cursor-pointer"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  {Array.from({ length: totalPages }, (_, index) => {
                    const pageNumber = index + 1;
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => setCurrentPage(pageNumber)}
                        className={`flex h-8 w-8 items-center justify-center rounded-md text-sm font-semibold transition cursor-pointer ${currentPage === pageNumber
                          ? "bg-[var(--green-color)] text-white"
                          : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/50 dark:hover:bg-zinc-800"
                          }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="flex h-8 w-8 items-center justify-center rounded-md font-medium text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200/50 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:hover:bg-transparent transition cursor-pointer"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      <ApproveModal
        isOpen={approveModalOpen}
        onClose={() => {
          setApproveModalOpen(false);
          setSelectedTiket(null);
        }}
        onConfirm={handleConfirmApprove}
        unitTeknisName={
          (id === "17" || id === "20" || id === "21")
            ? "Kepala Balai"
            : (selectedTiket?.unit_teknis?.nama || "Unit Teknis Terkait")
        }
        actionLoading={actionLoading}
      />
    </div>
  );
}
