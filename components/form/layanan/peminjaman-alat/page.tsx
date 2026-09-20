"use client";

import { useState, useEffect } from "react";
import { AlertCircle, ArrowLeft, CirclePlus, Trash2 } from "lucide-react";
import { getApiUrl } from "@/lib/api";

export interface PeminjamanAlatStep2 {
  jenisAlat: string;
  tujuanPenggunaan: string;
  wilayahKajian: string;
  periodePeminjaman: string;
  selectedAlatList?: Array<{
    alatId?: string;
    name: string;
    price: number;
    units: number;
  }>;
  periodeMulai?: string;
  periodeSelesai?: string;
}

interface PeminjamanAlatStep2FormProps {
  onBack: () => void;
  onSubmit: (data: PeminjamanAlatStep2) => void;
  loading: boolean;
  initialData?: PeminjamanAlatStep2;
}

interface JenisAlatItem {
  id: string;
  alatId: string;
  name: string;
  price: number;
  units: number;
}

const DEFAULT_ALAT = [
  { id: 1, nama_alat: "Automatic Weather Station (AWS)", harga_peminjaman: 500000, is_active: true },
  { id: 2, nama_alat: "Anemometer Digital", harga_peminjaman: 150000, is_active: true },
  { id: 3, nama_alat: "Barometer Analog", harga_peminjaman: 100000, is_active: false },
  { id: 4, nama_alat: "Solarimeter (Pyranometer)", harga_peminjaman: 250000, is_active: true },
  { id: 5, nama_alat: "Ombrometer (Penakar Hujan)", harga_peminjaman: 75000, is_active: true },
];

export default function PeminjamanAlatStep2Form({
  onBack,
  onSubmit,
  loading,
  initialData,
}: PeminjamanAlatStep2FormProps) {
  const [availableAlat, setAvailableAlat] = useState<any[]>([]);

  // Local states: Only Jenis Alat is dynamic, other fields are common/single
  const [jenisAlatList, setJenisAlatList] = useState<JenisAlatItem[]>(() => {
    if (initialData?.selectedAlatList && initialData.selectedAlatList.length > 0) {
      return initialData.selectedAlatList.map((a) => ({
        id: Math.random().toString(36).substring(2, 9),
        alatId: a.alatId || "",
        name: a.name || "",
        price: a.price || 0,
        units: a.units || 1,
      }));
    }
    return [{ id: Math.random().toString(36).substring(2, 9), alatId: "", name: "", price: 0, units: 1 }];
  });
  const [wilayahKajian, setWilayahKajian] = useState(initialData?.wilayahKajian || "");
  const [periodeMulai, setPeriodeMulai] = useState(initialData?.periodeMulai || "");
  const [periodeSelesai, setPeriodeSelesai] = useState(initialData?.periodeSelesai || "");
  const [tujuanPenggunaan, setTujuanPenggunaan] = useState(initialData?.tujuanPenggunaan || "");
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialData) {
      if (initialData.selectedAlatList && initialData.selectedAlatList.length > 0) {
        setJenisAlatList(
          initialData.selectedAlatList.map((a) => ({
            id: Math.random().toString(36).substring(2, 9),
            alatId: a.alatId || "",
            name: a.name || "",
            price: a.price || 0,
            units: a.units || 1,
          }))
        );
      }
      setWilayahKajian(initialData.wilayahKajian || "");
      setPeriodeMulai(initialData.periodeMulai || "");
      setPeriodeSelesai(initialData.periodeSelesai || "");
      setTujuanPenggunaan(initialData.tujuanPenggunaan || "");
    }
  }, [initialData]);

  // Fetch tools from /alat on mount
  useEffect(() => {
    const fetchAlat = async () => {
      try {
        const token = localStorage.getItem("agro_token");
        const response = await fetch(`${getApiUrl()}/alat`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          const activeAlat = data.filter((a: any) => a.is_active);
          setAvailableAlat(activeAlat.length > 0 ? activeAlat : DEFAULT_ALAT.filter(a => a.is_active));
        } else {
          setAvailableAlat(DEFAULT_ALAT.filter(a => a.is_active));
        }
      } catch (err) {
        console.error("Failed to fetch available tools, using default list:", err);
        setAvailableAlat(DEFAULT_ALAT.filter(a => a.is_active));
      }
    };
    fetchAlat();
  }, []);

  const handleAddJenisAlat = () => {
    setError("");
    // Check if any existing row has unselected tool
    if (jenisAlatList.some((item) => !item.alatId)) {
      setError("Silakan pilih jenis alat pada baris yang sudah ada terlebih dahulu!");
      return;
    }
    // Check if all available tools are already selected
    const selectedAlatIds = jenisAlatList.map((item) => item.alatId).filter(Boolean);
    if (availableAlat.length > 0 && selectedAlatIds.length >= availableAlat.length) {
      setError("Semua jenis alat yang tersedia sudah dipilih!");
      return;
    }
    setJenisAlatList([
      ...jenisAlatList,
      { id: Math.random().toString(36).substring(2, 9), alatId: "", name: "", price: 0, units: 1 }
    ]);
  };

  const handleRemoveJenisAlat = (id: string) => {
    setError("");
    if (jenisAlatList.length > 1) {
      setJenisAlatList(jenisAlatList.filter((item) => item.id !== id));
    }
  };

  const handleSelectAlat = (id: string, alatIdStr: string) => {
    setError("");
    if (alatIdStr && jenisAlatList.some((item) => item.id !== id && item.alatId === alatIdStr)) {
      setError("Alat ini sudah dipilih di baris lain! Silakan pilih alat yang berbeda atau tambah jumlah unit.");
      return;
    }
    const alat = availableAlat.find(a => String(a.id) === alatIdStr);
    if (alat && alat.sisa_stok !== undefined && alat.sisa_stok <= 0) {
      setError(`Alat "${alat.nama_alat}" saat ini stoknya habis dipinjam (0/${alat.stok ?? 1}).`);
      return;
    }
    setJenisAlatList(
      jenisAlatList.map((item) =>
        item.id === id
          ? {
            ...item,
            alatId: alatIdStr,
            name: alat ? alat.nama_alat : "",
            price: alat ? alat.harga_peminjaman : 0,
            units: 1,
          }
          : item
      )
    );
  };

  const handleUpdateUnits = (id: string, value: number) => {
    const row = jenisAlatList.find((item) => item.id === id);
    const tool = availableAlat.find((a) => String(a.id) === row?.alatId);
    const maxAllowed = tool?.sisa_stok !== undefined ? tool.sisa_stok : (tool?.stok ?? 99);

    if (tool && tool.sisa_stok !== undefined && value > maxAllowed) {
      setError(`Jumlah unit untuk "${tool.nama_alat}" melebihi sisa stok yang tersedia (${maxAllowed}/${tool.stok ?? 1} unit).`);
    } else {
      setError("");
    }

    setJenisAlatList(
      jenisAlatList.map((item) =>
        item.id === id ? { ...item, units: Math.max(1, value) } : item
      )
    );
  };

  const getMinEndDate = (startDate: string) => {
    if (!startDate) return undefined;
    const d = new Date(startDate);
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  };

  const handlePeriodeMulaiChange = (val: string) => {
    setPeriodeMulai(val);
    if (periodeSelesai && new Date(periodeSelesai) <= new Date(val)) {
      setPeriodeSelesai("");
      setError("Tanggal selesai harus setelah tanggal mulai peminjaman.");
    } else {
      setError("");
    }
  };

  const handlePeriodeSelesaiChange = (val: string) => {
    setPeriodeSelesai(val);
    if (periodeMulai && new Date(val) <= new Date(periodeMulai)) {
      setError("Tanggal selesai peminjaman harus setelah tanggal mulai peminjaman!");
    } else {
      setError("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate tools
    for (let i = 0; i < jenisAlatList.length; i++) {
      if (!jenisAlatList[i].alatId) {
        const numbering = jenisAlatList.length > 1 ? ` #${i + 1}` : "";
        setError(`Jenis Alat${numbering} wajib dipilih!`);
        return;
      }
    }

    // Check duplicate tools
    const selectedAlatIds = jenisAlatList.map((item) => item.alatId).filter(Boolean);
    const uniqueAlatIds = new Set(selectedAlatIds);
    if (uniqueAlatIds.size !== selectedAlatIds.length) {
      setError("Terdapat jenis alat yang sama dipilih lebih dari satu kali!");
      return;
    }

    if (!wilayahKajian.trim()) {
      setError("Wilayah Kajian wajib diisi!");
      return;
    }
    if (!periodeMulai.trim()) {
      setError("Periode Peminjaman (Mulai) wajib diisi!");
      return;
    }
    if (!periodeSelesai.trim()) {
      setError("Periode Peminjaman (Selesai) wajib diisi!");
      return;
    }

    // Validate end date > start date
    if (new Date(periodeSelesai) <= new Date(periodeMulai)) {
      setError("Tanggal selesai peminjaman harus setelah tanggal mulai peminjaman!");
      return;
    }

    if (!tujuanPenggunaan.trim()) {
      setError("Tujuan Penggunaan Alat wajib diisi!");
      return;
    }

    // Validate tools stock
    for (let i = 0; i < jenisAlatList.length; i++) {
      const item = jenisAlatList[i];
      const foundAlat = availableAlat.find((a) => String(a.id) === item.alatId);
      if (foundAlat && foundAlat.sisa_stok !== undefined) {
        if (foundAlat.sisa_stok <= 0) {
          setError(`Alat "${foundAlat.nama_alat}" saat ini stoknya habis (0/${foundAlat.stok ?? 1}).`);
          return;
        }
        if (item.units > foundAlat.sisa_stok) {
          setError(`Jumlah unit untuk "${foundAlat.nama_alat}" melebihi stok yang tersedia (${item.units} unit diminta, sisa stok: ${foundAlat.sisa_stok}/${foundAlat.stok ?? 1}).`);
          return;
        }
      }
    }

    // Format fields for database
    const formattedJenisAlat = jenisAlatList.map((a, i) =>
      jenisAlatList.length > 1 ? `Alat ${i + 1}: ${a.name} (${a.units} Unit)` : `${a.name} (${a.units} Unit)`
    ).join("\n");

    const formattedPeriodePeminjaman = `${periodeMulai} s.d. ${periodeSelesai}`;

    onSubmit({
      jenisAlat: formattedJenisAlat,
      wilayahKajian: wilayahKajian.trim(),
      periodePeminjaman: formattedPeriodePeminjaman,
      tujuanPenggunaan: tujuanPenggunaan.trim(),
      selectedAlatList: jenisAlatList.map(a => ({
        alatId: a.alatId,
        name: a.name,
        price: a.price,
        units: a.units,
      })),
      periodeMulai,
      periodeSelesai,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Step 2 Header */}
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <h2 className="text-sm md:text-lg font-bold text-zinc-900 dark:text-white">
          Detail Peminjaman Alat
        </h2>
        <p className="text-[var(--green-color)] dark:text-white text-[10px] md:text-xs font-semibold bg-secondary-green-color dark:bg-secondary-green-color border border-[var(--green-color)]/50 px-2 py-1 rounded-xl whitespace-nowrap">
          Langkah 2 dari 2
        </p>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/45 dark:text-red-400 border border-red-200 dark:border-red-900/40 flex items-start gap-3 shadow-sm transition duration-300">
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Kesalahan Validasi:</span>
            <p className="mt-1 text-red-600 dark:text-red-400">{error}</p>
          </div>
        </div>
      )}

      {/* Main card wrapper for clean layout */}
      <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 sm:p-8 space-y-6 bg-white dark:bg-zinc-950 shadow-sm relative transition duration-300">

        {/* Dynamic List of Jenis Alat */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-xs md:text-sm font-bold text-zinc-800 dark:text-zinc-200">
                Daftar Alat Yang Dipinjam
              </h3>
              <p className="text-[11px] md:text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Pilih jenis alat dan jumlah unit yang ingin dipinjam
              </p>
            </div>
            {(() => {
              const isAllAlatSelected = availableAlat.length > 0 && jenisAlatList.filter(item => item.alatId).length >= availableAlat.length;
              return (
                <button
                  type="button"
                  onClick={handleAddJenisAlat}
                  disabled={isAllAlatSelected || loading}
                  className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 text-white rounded-xl text-xs font-bold transition shadow-sm self-start sm:self-auto ${isAllAlatSelected
                    ? "bg-zinc-300 dark:bg-zinc-800 text-zinc-500 cursor-not-allowed"
                    : "bg-[var(--green-color)] hover:bg-[var(--hover-green-color)] cursor-pointer"
                    }`}
                  title={isAllAlatSelected ? "Semua jenis alat yang tersedia sudah dipilih" : "Tambah Alat"}
                >
                  <CirclePlus className="h-4 w-4" />
                  <span>Tambah Alat</span>
                </button>
              );
            })()}
          </div>

          <div className="space-y-4">
            {jenisAlatList.map((alat, index) => {
              return (
                <div
                  key={alat.id}
                  className={`rounded-xl space-y-3 ${index > 0 ? "pt-4 border-t border-zinc-200 dark:border-zinc-800" : ""}`}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                    {/* Select Alat */}
                    <div className={`${jenisAlatList.length > 1 ? "sm:col-span-7" : "sm:col-span-8"} space-y-1.5`}>
                      <label
                        htmlFor={`jenisAlat-${alat.id}`}
                        className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400"
                      >
                        Nama Alat <span className="text-red-500">*</span>
                      </label>
                      <select
                        id={`jenisAlat-${alat.id}`}
                        required
                        disabled={loading}
                        value={alat.alatId}
                        onChange={(e) => handleSelectAlat(alat.id, e.target.value)}
                        className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3.5 py-2.5 text-xs md:text-sm text-zinc-900 dark:text-white shadow-sm focus:border-[var(--green-color)] focus:outline-none focus:ring-1 focus:ring-[var(--green-color)] cursor-pointer text-ellipsis overflow-hidden"
                      >
                        <option value="">-- Pilih Alat --</option>
                        {availableAlat.map((a) => {
                          const isAlreadySelected = jenisAlatList.some(
                            (item) => item.id !== alat.id && item.alatId === String(a.id)
                          );
                          const total = a.stok ?? 1;
                          const sisa = a.sisa_stok !== undefined ? a.sisa_stok : total;
                          const isDepleted = sisa <= 0;

                          return (
                            <option
                              key={a.id}
                              value={String(a.id)}
                              disabled={isAlreadySelected || isDepleted}
                            >
                              {a.nama_alat} (Rp {a.harga_peminjaman.toLocaleString("id-ID")}/hari) - Stok: {sisa}/{total} unit{isDepleted ? " (Stok Habis)" : ""}{isAlreadySelected ? " - (Sudah dipilih)" : ""}
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    {/* Unit / Jumlah */}
                    <div className={`${jenisAlatList.length > 1 ? "sm:col-span-5" : "sm:col-span-4"} space-y-1.5`}>
                      <label
                        htmlFor={`units-${alat.id}`}
                        className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400"
                      >
                        Jumlah Unit <span className="text-red-500">*</span>
                      </label>
                      <div className="flex items-center gap-2">
                        {(() => {
                          const selAlat = availableAlat.find(a => String(a.id) === alat.alatId);
                          const maxVal = selAlat?.sisa_stok !== undefined ? selAlat.sisa_stok : (selAlat?.stok ?? 99);

                          return (
                            <input
                              id={`units-${alat.id}`}
                              type="number"
                              min="1"
                              max={maxVal > 0 ? maxVal : undefined}
                              required
                              disabled={loading}
                              value={alat.units}
                              onChange={(e) => handleUpdateUnits(alat.id, parseInt(e.target.value) || 1)}
                              className="w-full min-w-[60px] rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3.5 py-2.5 text-xs md:text-sm text-zinc-900 dark:text-white shadow-sm focus:border-[var(--green-color)] focus:outline-none focus:ring-1 focus:ring-[var(--green-color)] text-center font-bold"
                              title="Jumlah Unit"
                            />
                          );
                        })()}
                        {jenisAlatList.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveJenisAlat(alat.id)}
                            className="inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 px-2.5 py-2.5 rounded-xl transition border border-transparent hover:border-red-200 dark:hover:border-red-900/40 cursor-pointer flex-shrink-0"
                            title="Hapus Alat"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="hidden sm:inline">Hapus</span>
                          </button>
                        )}
                      </div>
                    </div>

                  </div>

                  {alat.price > 0 && (
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 pt-1 flex flex-wrap justify-between items-center gap-1 border-t border-dashed border-zinc-200 dark:border-zinc-800">
                      <span>Harga Satuan: <strong className="text-zinc-700 dark:text-zinc-300">Rp {alat.price.toLocaleString("id-ID")}/hari</strong></span>
                      <span>Subtotal/hari: <strong className="text-[var(--green-color)]">Rp {(alat.price * alat.units).toLocaleString("id-ID")}/hari</strong></span>
                    </div>
                  )}
                </div>
              );
            })}

          </div>
        </div>

        {/* Wilayah Kajian */}
        <div className="space-y-2">
          <label htmlFor="wilayahKajian" className="block text-xs md:text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            Wilayah Kajian <span className="text-red-500">*</span>
          </label>
          <input
            id="wilayahKajian"
            type="text"
            required
            disabled={loading}
            value={wilayahKajian}
            onChange={(e) => setWilayahKajian(e.target.value)}
            className="block w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-[#F8FAFC] dark:bg-zinc-950 px-4 py-3 text-xs md:text-sm text-zinc-900 dark:text-white placeholder-zinc-400 shadow-sm focus:border-[var(--green-color)] focus:outline-none focus:ring-1 focus:ring-[var(--green-color)]"
            placeholder="Contoh: Kabupaten Bogor, Jawa Barat"
          />
        </div>

        {/* Periode Peminjaman */}
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="periodeMulai" className="block text-xs md:text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              Periode Peminjaman (Mulai) <span className="text-red-500">*</span>
            </label>
            <input
              id="periodeMulai"
              type="date"
              required
              disabled={loading}
              value={periodeMulai}
              onChange={(e) => handlePeriodeMulaiChange(e.target.value)}
              className="block w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-[#F8FAFC] dark:bg-zinc-950 px-4 py-3 text-xs md:text-sm text-zinc-900 dark:text-white shadow-sm focus:border-[var(--green-color)] focus:outline-none focus:ring-1 focus:ring-[var(--green-color)]"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="periodeSelesai" className="block text-xs md:text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              Periode Peminjaman (Selesai) <span className="text-red-500">*</span>
            </label>
            <input
              id="periodeSelesai"
              type="date"
              required
              disabled={loading || !periodeMulai}
              min={getMinEndDate(periodeMulai)}
              value={periodeSelesai}
              onChange={(e) => handlePeriodeSelesaiChange(e.target.value)}
              className="block w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-[#F8FAFC] dark:bg-zinc-950 px-4 py-3 text-xs md:text-sm text-zinc-900 dark:text-white shadow-sm focus:border-[var(--green-color)] focus:outline-none focus:ring-1 focus:ring-[var(--green-color)] disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-1">
              Tanggal selesai harus setelah tanggal mulai peminjaman
            </p>
          </div>
        </div>

        {/* Tujuan Penggunaan Alat */}
        <div className="space-y-2">
          <label htmlFor="tujuanPenggunaan" className="block text-xs md:text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            Tujuan Penggunaan Alat <span className="text-red-500">*</span>
          </label>
          <textarea
            id="tujuanPenggunaan"
            required
            rows={4}
            disabled={loading}
            value={tujuanPenggunaan}
            onChange={(e) => setTujuanPenggunaan(e.target.value)}
            className="block w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-[#F8FAFC] dark:bg-zinc-950 px-4 py-3 text-xs md:text-sm text-zinc-900 dark:text-white placeholder-zinc-400 shadow-sm focus:border-[var(--green-color)] focus:outline-none focus:ring-1 focus:ring-[var(--green-color)]"
            placeholder="Jelaskan secara detail tujuan penggunaan alat yang Anda pinjam"
          />
        </div>
      </div>

      {/* Action Buttons for Step 2 */}
      <div className="flex justify-between gap-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="px-5 py-2.5 border border-zinc-300 dark:border-zinc-700 hover:cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 rounded-xl text-xs md:text-sm font-bold transition disabled:opacity-50"
        >
          Kembali
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-[var(--green-color)] hover:cursor-pointer hover:bg-[var(--hover-green-color)] text-white rounded-xl text-xs md:text-sm font-bold shadow-md transition disabled:opacity-50 flex items-center gap-2"
        >
          Kirim Pengajuan
        </button>
      </div>
    </form>
  );
}
