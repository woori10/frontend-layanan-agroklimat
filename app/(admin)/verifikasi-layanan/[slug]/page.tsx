"use client";

import { useParams, useRouter } from "next/navigation";
import Sidebar from "@/components/sidebar/Sidebar";
import AppBar from "@/components/appbar/AppBar";
import { useState, useEffect } from "react";
import { getTiketByLayanan } from "@/lib/tiket";
import { getLayananBySlug } from "@/lib/layanan";
import StatusLayananBadge from "@/components/badge/status-layanan/StatusLayananBadge";
import { ChevronLeft, ChevronRight, Search, ListFilter, ArrowUpDown, ChevronDown, Inbox } from "lucide-react";

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

interface Tiket {
  id: number;
  no_tiket: string;
  status: string;
  tanggal_submit: string;
  user: { nama: string };
  jawaban_form?: any;
}

interface Layanan {
  id: number;
  nama_layanan: string;
  slug: string;
}

export default function VerifikasiLayananPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [sortOrder, setSortOrder] = useState<"terbaru" | "terlama">("terbaru");

  const [layanan, setLayanan] = useState<Layanan | null>(null);
  const [tikets, setTikets] = useState<Tiket[]>([]);
  const [filteredTikets, setFilteredTikets] = useState<Tiket[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("semua");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    getLayananBySlug(slug)
      .then((data) => {
        setLayanan(data);
        return getTiketByLayanan(data.id);
      })
      .then(setTikets)
      .catch((err: any) => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    let result = [...tikets];

    if (selectedStatus !== "semua") {
      if (selectedStatus === "menunggu_verifikasi") {
        result = result.filter(t => ["menunggu_verifikasi", "diajukan"].includes(t.status));
      } else if (selectedStatus === "diproses") {
        result = result.filter(t => ["diproses", "dipinjam"].includes(t.status));
      } else if (selectedStatus === "selesai") {
        result = result.filter(t => ["menunggu_konfirmasi", "selesai"].includes(t.status));
      } else {
        result = result.filter(t => t.status === selectedStatus);
      }
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(t =>
        (t.no_tiket || "").toLowerCase().includes(query) ||
        (t.jawaban_form?.nama_lengkap || t.user?.nama || "").toLowerCase().includes(query)
      );
    }

    result.sort((a, b) => {
      const timeA = new Date(a.tanggal_submit).getTime();
      const timeB = new Date(b.tanggal_submit).getTime();
      return sortOrder === "terbaru" ? timeB - timeA : timeA - timeB;
    });

    setFilteredTikets(result);
    setCurrentPage(1);
  }, [tikets, selectedStatus, searchQuery, sortOrder]);

  const totalItems = filteredTikets.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentTikets = filteredTikets.slice(startIndex, endIndex);

  const countMenunggu = tikets.filter(t => ["menunggu_verifikasi", "diajukan"].includes(t.status)).length;
  const countDiproses = tikets.filter(t => ["diproses", "dipinjam"].includes(t.status)).length;
  const countSelesai = tikets.filter(t => ["menunggu_konfirmasi", "selesai"].includes(t.status)).length;

  const goToDetail = (noTiket: string) => {
    router.push(`/verifikasi-layanan/${slug}/${noTiket}`);
  };

  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 overflow-hidden font-sans">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-y-auto">
        <AppBar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-8 space-y-6">
          <div className="flex justify-between items-center w-full relative overflow-hidden space-y-3">
            <div className="space-y-3">
              <h1 className="text-2xl font-semibold md:text-3xl text-[var(--foreground)] dark:text-zinc-50">
                Verifikasi Tiket <span className="text-green-color">{layanan?.nama_layanan || "Memuat..."}</span>
              </h1>
              <p className="text-sm font-medium">
                Mengelola verifikasi tiket untuk layanan {layanan?.nama_layanan || ""}
              </p>
            </div>
          </div>

          <div className="rounded-2xl p-4 sm:p-6 md:p-8 border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
            {/* Filter Section seperti kelola-pegawai */}
            <div className="mb-6 flex flex-col gap-4">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                {/* Status Filter Tabs Kanan/Atas */}
                <div className="w-full lg:w-auto overflow-x-auto pb-1 -mb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                  <div className="inline-flex min-w-full sm:min-w-0 items-center rounded-xl bg-secondary-green-color p-1.5 dark:border-zinc-700 dark:bg-zinc-800 gap-1">
                    {[
                      { label: "Semua", value: "semua", count: tikets.length },
                      { label: "Menunggu Verifikasi", value: "menunggu_verifikasi", count: countMenunggu },
                      { label: "Diproses", value: "diproses", count: countDiproses },
                      { label: "Selesai", value: "selesai", count: countSelesai },
                    ].map((item) => (
                      <button
                        key={item.value}
                        onClick={() => {
                          setSelectedStatus(item.value);
                          setCurrentPage(1);
                        }}
                        className={`whitespace-nowrap shrink-0 rounded-lg px-3 py-2 text-xs font-medium transition cursor-pointer ${selectedStatus === item.value
                          ? "bg-white text-[var(--green-color)] shadow-sm dark:bg-zinc-900 font-semibold"
                          : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400"
                          }`}
                      >
                        {item.label}
                        <span className="ml-1.5 text-[10px]">({item.count})</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Search dan Sort */}
                <div className="flex items-center gap-2 w-full lg:w-auto">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                    <input
                      type="text"
                      placeholder="Cari nomor tiket, pemohon..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 pl-10 pr-4 text-xs outline-none transition focus:border-[var(--green-color)] focus:ring-2 focus:ring-[var(--green-color)]/10 dark:border-zinc-700 dark:bg-zinc-900"
                    />
                  </div>

                  {/* Sorting */}
                  <button
                    type="button"
                    onClick={() => {
                      setSortOrder((prev) => (prev === "terbaru" ? "terlama" : "terbaru"));
                      setCurrentPage(1);
                    }}
                    className="inline-flex shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-white p-2.5 text-zinc-600 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 cursor-pointer"
                    title={sortOrder === "terbaru" ? "Urutkan dari terlama" : "Urutkan dari terbaru"}
                  >
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-secondary-green-color border-t-transparent"></div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Memuat data tiket...</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-20 text-red-500">
                  <p className="text-sm font-semibold">{error}</p>
                </div>
              ) : currentTikets.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-zinc-400 dark:text-zinc-500">
                  <Inbox className="h-12 w-12 stroke-1 mb-2" />
                  <p className="text-sm font-semibold">Tidak Ada Data</p>
                  <p className="text-xs">Belum ada pengajuan tiket untuk layanan ini.</p>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-zinc-200/80 dark:divide-zinc-800">
                  <thead className="bg-[var(--secondary-green-color)]">
                    <tr>
                      <th scope="col" className="px-6 py-4.5 text-center text-xs font-semibold text-[var(--foreground)] tracking-wider w-16">No</th>
                      <th scope="col" className="px-6 py-4.5 text-left text-xs font-semibold text-[var(--foreground)] tracking-wider">No Tiket</th>
                      <th scope="col" className="px-6 py-4.5 text-left text-xs font-semibold text-[var(--foreground)] tracking-wider">Nama Pemohon</th>
                      <th scope="col" className="px-6 py-4.5 text-center text-xs font-semibold text-[var(--foreground)] tracking-wider">Tanggal</th>
                      <th scope="col" className="px-6 py-4.5 text-center text-xs font-semibold text-[var(--foreground)] tracking-wider">Status</th>
                      <th scope="col" className="px-6 py-4.5 text-center text-xs font-semibold text-[var(--foreground)] tracking-wider">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 bg-white dark:bg-zinc-900">
                    {currentTikets.map((tiket, index) => (
                      <tr
                        key={tiket.id}
                        onClick={() => goToDetail(tiket.no_tiket)}
                        className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors"
                      >
                        <td className="px-6 py-5.5 whitespace-nowrap text-xs text-center text-zinc-500 dark:text-zinc-400 font-medium">
                          {startIndex + index + 1}
                        </td>
                        <td className="px-6 py-5.5 whitespace-nowrap text-xs font-bold text-[#2C5E3B] dark:text-secondary-green-color text-left">
                          {tiket.no_tiket}
                        </td>
                        <td className="px-6 py-5.5 whitespace-nowrap text-xs text-[var(--foreground)] dark:text-zinc-100 font-base text-left">
                          {tiket.jawaban_form?.nama_lengkap || tiket.user?.nama || "-"}
                        </td>
                        <td className="px-6 py-5.5 whitespace-nowrap text-xs text-[var(--foreground)] dark:text-zinc-400 font-base text-center">
                          {formatDate(tiket.tanggal_submit)}
                        </td>
                        <td className="px-6 py-5.5 whitespace-nowrap text-xs text-center">
                          <div className="flex justify-center"><StatusLayananBadge status={tiket.status} layananSlug={slug} /></div>
                        </td>
                        <td className="px-6 py-5.5 whitespace-nowrap text-xs text-center">
                          <div className="flex justify-center">
                            {tiket.status === "menunggu_verifikasi" ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  goToDetail(tiket.no_tiket);
                                }}
                                className="cursor-pointer text-xs font-semibold text-[#00a700] transition hover:text-[#008700]"
                              >
                                Verifikasi
                              </button>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  goToDetail(tiket.no_tiket);
                                }}
                                className="cursor-pointer text-xs font-semibold text-[#0076FF] transition hover:text-[#005ecb]"
                              >
                                Lihat Detail
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* Pagination seperti kelola-pegawai */}
              {!loading && filteredTikets.length > 0 && (
                <div className="flex items-center justify-between border-t border-zinc-200 px-2 pt-5 dark:border-zinc-800">
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Menampilkan{" "}
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">
                      {filteredTikets.length === 0 ? 0 : startIndex + 1}
                    </span>
                    –
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">
                      {endIndex}
                    </span>{" "}
                    dari{" "}
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">
                      {totalItems}
                    </span>{" "}
                    tiket
                  </p>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-zinc-800 cursor-pointer"
                    >
                      ‹
                    </button>

                    {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-sm font-medium transition cursor-pointer ${currentPage === page
                          ? "bg-[var(--green-color)] text-white"
                          : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                          }`}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-zinc-800 cursor-pointer"
                    >
                      ›
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}