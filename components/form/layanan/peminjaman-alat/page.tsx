"use client";

import { useState, useEffect } from "react";
import { AlertCircle, ArrowLeft, CirclePlus, Trash2 } from "lucide-react";

export interface PeminjamanAlatStep2 {
  jenisAlat: string;
  tujuanPenggunaan: string;
  wilayahKajian: string;
  periodePeminjaman: string;
  selectedAlatList?: Array<{
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
  loading
}: PeminjamanAlatStep2FormProps) {
  const [availableAlat, setAvailableAlat] = useState<any[]>([]);
  
  // Local states: Only Jenis Alat is dynamic, other fields are common/single
  const [jenisAlatList, setJenisAlatList] = useState<JenisAlatItem[]>([
    { id: Math.random().toString(36).substring(2, 9), alatId: "", name: "", price: 0, units: 1 }
  ]);
  const [wilayahKajian, setWilayahKajian] = useState("");
  const [periodeMulai, setPeriodeMulai] = useState("");
  const [periodeSelesai, setPeriodeSelesai] = useState("");
  const [tujuanPenggunaan, setTujuanPenggunaan] = useState("");
  const [error, setError] = useState("");

  // Fetch tools from /alat on mount
  useEffect(() => {
    const fetchAlat = async () => {
      try {
        const token = localStorage.getItem("agro_token");
        const response = await fetch("http://localhost:3000/alat", {
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
    setJenisAlatList([
      ...jenisAlatList,
      { id: Math.random().toString(36).substring(2, 9), alatId: "", name: "", price: 0, units: 1 }
    ]);
  };

  const handleRemoveJenisAlat = (id: string) => {
    if (jenisAlatList.length > 1) {
      setJenisAlatList(jenisAlatList.filter((item) => item.id !== id));
    }
  };

  const handleSelectAlat = (id: string, alatIdStr: string) => {
    const alat = availableAlat.find(a => String(a.id) === alatIdStr);
    setJenisAlatList(
      jenisAlatList.map((item) =>
        item.id === id
          ? {
              ...item,
              alatId: alatIdStr,
              name: alat ? alat.nama_alat : "",
              price: alat ? alat.harga_peminjaman : 0,
            }
          : item
      )
    );
  };

  const handleUpdateUnits = (id: string, value: number) => {
    setJenisAlatList(
      jenisAlatList.map((item) =>
        item.id === id ? { ...item, units: Math.max(1, value) } : item
      )
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate fields
    for (let i = 0; i < jenisAlatList.length; i++) {
      if (!jenisAlatList[i].alatId) {
        const numbering = jenisAlatList.length > 1 ? ` #${i + 1}` : "";
        setError(`Jenis Alat${numbering} wajib dipilih!`);
        return;
      }
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
    if (!tujuanPenggunaan.trim()) {
      setError("Tujuan Penggunaan Alat wajib diisi!");
      return;
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
      <div className="mb-6 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
          Detail Peminjaman Alat
        </h2>
        <p className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm mt-1">
          Spesifikasi Alat dan Waktu Peminjaman
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
          <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
            Daftar Alat Yang Dipinjam
          </h3>
          
          <div className="space-y-4">
            {jenisAlatList.map((alat, index) => {
              const isLast = index === jenisAlatList.length - 1;
              return (
                <div key={alat.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label htmlFor={`jenisAlat-${alat.id}`} className="block text-sm font-bold text-zinc-700 dark:text-zinc-300">
                      Jenis Alat #{index + 1} <span className="text-red-500">*</span>
                    </label>
                  </div>
                  <div className="flex items-stretch gap-3">
                    <select
                      id={`jenisAlat-${alat.id}`}
                      required
                      disabled={loading}
                      value={alat.alatId}
                      onChange={(e) => handleSelectAlat(alat.id, e.target.value)}
                      className="block flex-grow rounded-xl border border-zinc-300 dark:border-zinc-700 bg-[#F8FAFC] dark:bg-zinc-950 px-4 py-3 text-sm text-zinc-900 dark:text-white shadow-sm focus:border-[var(--green-color)] focus:outline-none focus:ring-1 focus:ring-[var(--green-color)] cursor-pointer"
                    >
                      <option value="">-- Pilih Alat --</option>
                      {availableAlat.map((a) => (
                        <option key={a.id} value={String(a.id)}>
                          {a.nama_alat} (Rp {a.harga_peminjaman.toLocaleString("id-ID")}/hari)
                        </option>
                      ))}
                    </select>

                    <div className="w-20 sm:w-24 flex-shrink-0">
                      <input
                        type="number"
                        min="1"
                        required
                        disabled={loading}
                        value={alat.units}
                        onChange={(e) => handleUpdateUnits(alat.id, parseInt(e.target.value) || 1)}
                        className="block w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-[#F8FAFC] dark:bg-zinc-950 px-3 py-3 text-sm text-zinc-900 dark:text-white shadow-sm focus:border-[var(--green-color)] focus:outline-none focus:ring-1 focus:ring-[var(--green-color)] text-center font-bold"
                        title="Jumlah Unit"
                      />
                    </div>

                    {jenisAlatList.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveJenisAlat(alat.id)}
                        className="flex-shrink-0 flex items-center justify-center px-3.5 text-red-500 hover:text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20 border border-zinc-200 dark:border-zinc-800 rounded-xl transition cursor-pointer"
                        title="Hapus Alat"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    )}

                    {isLast && (
                      <button
                        type="button"
                        onClick={handleAddJenisAlat}
                        className="flex-shrink-0 flex items-center justify-center px-4 bg-[var(--green-color)] text-white rounded-xl transition text-xs font-bold cursor-pointer"
                      >
                        <CirclePlus className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Wilayah Kajian */}
        <div className="space-y-2">
          <label htmlFor="wilayahKajian" className="block text-sm font-bold text-zinc-700 dark:text-zinc-300">
            Wilayah Kajian <span className="text-red-500">*</span>
          </label>
          <input
            id="wilayahKajian"
            type="text"
            required
            disabled={loading}
            value={wilayahKajian}
            onChange={(e) => setWilayahKajian(e.target.value)}
            className="block w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-[#F8FAFC] dark:bg-zinc-950 px-4 py-3 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 shadow-sm focus:border-[var(--green-color)] focus:outline-none focus:ring-1 focus:ring-[var(--green-color)]"
            placeholder="Contoh: Kabupaten Bogor, Jawa Barat"
          />
        </div>

        {/* Periode Peminjaman */}
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="periodeMulai" className="block text-sm font-bold text-zinc-700 dark:text-zinc-300">
              Periode Peminjaman (Mulai) <span className="text-red-500">*</span>
            </label>
            <input
              id="periodeMulai"
              type="date"
              required
              disabled={loading}
              value={periodeMulai}
              onChange={(e) => setPeriodeMulai(e.target.value)}
              className="block w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-[#F8FAFC] dark:bg-zinc-950 px-4 py-3 text-sm text-zinc-900 dark:text-white shadow-sm focus:border-[var(--green-color)] focus:outline-none focus:ring-1 focus:ring-[var(--green-color)]"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="periodeSelesai" className="block text-sm font-bold text-zinc-700 dark:text-zinc-300">
              Periode Peminjaman (Selesai) <span className="text-red-500">*</span>
            </label>
            <input
              id="periodeSelesai"
              type="date"
              required
              disabled={loading}
              value={periodeSelesai}
              onChange={(e) => setPeriodeSelesai(e.target.value)}
              className="block w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-[#F8FAFC] dark:bg-zinc-950 px-4 py-3 text-sm text-zinc-900 dark:text-white shadow-sm focus:border-[var(--green-color)] focus:outline-none focus:ring-1 focus:ring-[var(--green-color)]"
            />
          </div>
        </div>

        {/* Tujuan Penggunaan Alat */}
        <div className="space-y-2">
          <label htmlFor="tujuanPenggunaan" className="block text-sm font-bold text-zinc-700 dark:text-zinc-300">
            Tujuan Penggunaan Alat <span className="text-red-500">*</span>
          </label>
          <textarea
            id="tujuanPenggunaan"
            required
            rows={4}
            disabled={loading}
            value={tujuanPenggunaan}
            onChange={(e) => setTujuanPenggunaan(e.target.value)}
            className="block w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-[#F8FAFC] dark:bg-zinc-950 px-4 py-3 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 shadow-sm focus:border-[var(--green-color)] focus:outline-none focus:ring-1 focus:ring-[var(--green-color)]"
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
          className="flex items-center gap-2 px-4 py-2.5 border border-[var(--green-color)] dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-[var(--green-color)] dark:text-zinc-300 rounded-xl text-sm font-bold transition disabled:opacity-50 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2.5 bg-[var(--green-color)] hover:bg-emerald-650 text-white rounded-xl text-sm font-extrabold shadow-md transition disabled:opacity-50 flex items-center gap-2 cursor-pointer"
        >
          Kirim Pengajuan
        </button>
      </div>
    </form>
  );
}
