"use client";

import { useState } from "react";
import { Cloud, Gauge, Sprout, ChevronRight, X } from "lucide-react";
import Link from "next/link";

export default function Layanan() {
    const [selectedFeature, setSelectedFeature] = useState<any>(null);

    const features = [
        {
            title: "Rekomendasi Penilaian SNI",
            desc: "Layanan penilaian kesesuaian agroklimat dan hidrologi berdasarkan standar nasional.",
            detail: "Layanan asesmen teknis dan sertifikasi pemenuhan SNI untuk sistem metrologi, sensor, dan peralatan hidroklimatologi pertanian guna menjamin standar kualitas data nasional.",
            dokumen: "Surat permohonan resmi, dokumen spesifikasi alat, hasil uji mandiri awal, dan profil unit/organisasi.",
            waktu: "14 Hari Kerja",
            biaya: "Sesuai ketentuan tarif PNBP",
            icon: Cloud,
        },
        {
            title: "Peminjaman Alat dan Data",
            desc: "Fasilitasi peminjaman instrumen metrologi dan akses data teknis pertanian.",
            detail: "Fasilitas peminjaman alat ukur cuaca otomatis (AWS), sensor kelembaban tanah, solarimeter, serta penyediaan dataset parameter cuaca pertanian historis terverifikasi.",
            dokumen: "Kartu identitas (KTP/KTM), proposal penelitian/kegiatan resmi, dan surat pernyataan jaminan pemeliharaan alat.",
            waktu: "3 - 5 Hari Kerja",
            biaya: "Gratis (akademisi) / Tarif PNBP (komersil)",
            icon: Gauge,
        },
        {
            title: "Konsultasi Rekomendasi",
            desc: "Layanan konsultasi intensif untuk pemenuhan kriteria penilaian kesesuaian teknis.",
            detail: "Konsultasi teknis tatap muka maupun daring bersama tim ahli metrologi klimatologi untuk penyusunan kajian dan standarisasi operasional kebun presisi Anda.",
            dokumen: "Formulir pengajuan konsultasi online dan ringkasan profil lahan/objek permasalahan.",
            waktu: "1 - 2 Hari Kerja",
            biaya: "Gratis",
            icon: Sprout,
        },
        {
            title: "Bimtek dan Narasumber",
            desc: "Penyelenggaraan bimbingan teknis dan penyediaan tenaga ahli metrologi pertanian.",
            detail: "Penyediaan narasumber profesional dan materi terstruktur untuk pelatihan, seminar, dan bimbingan teknis mengenai penerapan meteorologi klimatologi pertanian modern.",
            dokumen: "Surat undangan resmi instansi penyelenggara, Kerangka Acuan Kerja (KAK) / Term of Reference (TOR) kegiatan.",
            waktu: "Proses penjadwalan 7 hari sebelum acara",
            biaya: "Sesuai kesepakatan / ketentuan narasumber",
            icon: Cloud,
        },
        {
            title: "Magang Teknis / PKL",
            desc: "Kesempatan belajar praktis bagi mahasiswa dan profesional di bidang metrologi.",
            detail: "Program magang praktis dan praktek kerja lapangan (PKL) terstruktur bagi siswa SMK, mahasiswa, maupun praktisi pertanian di laboratorium instrumen Agrohidromet.",
            dokumen: "Surat pengantar sekolah/kampus, proposal magang singkat, daftar riwayat hidup (CV), dan transkrip nilai.",
            waktu: "Durasi program 1 - 3 bulan",
            biaya: "Gratis",
            icon: Gauge,
        },
        {
            title: "Agroedukasi",
            desc: "Kunjungan edukatif memperkenalkan teknologi pertanian modern kepada masyarakat.",
            detail: "Kunjungan edukatif rombongan (sekolah, universitas, kelompok tani) untuk pengenalan alat ukur cuaca klimatologi di taman alat dan laboratorium visualisasi sains.",
            dokumen: "Surat permohonan kunjungan resmi, detail jadwal rencana kunjungan, dan daftar nama peserta.",
            waktu: "Konfirmasi jadwal 3 hari kerja",
            biaya: "Gratis",
            icon: Sprout,
        },
        {
            title: "Konsultasi Siap Tanam",
            desc: "Bimbingan pemilihan varietas dan kalender tanam berbasis data metrologi presisi.",
            detail: "Analisis kecocokan iklim dan ikhtisar cuaca bulanan guna merekomendasikan komoditas pertanian unggulan, penentuan kalender tanam, serta manajemen resiko iklim.",
            dokumen: "Titik koordinat lokasi lahan pertanian dan riwayat jenis tanaman yang digunakan pada musim sebelumnya.",
            waktu: "1 Hari Kerja",
            biaya: "Gratis",
            icon: Cloud,
        },
        {
            title: "Layanan Mess",
            desc: "Fasilitas akomodasi bagi tamu instansi, peneliti, atau peserta pelatihan teknis.",
            detail: "Penyediaan akomodasi/kamar inap dengan fasilitas lengkap dan nyaman di lingkungan balai untuk peneliti, mitra, maupun peserta diklat luar kota.",
            dokumen: "Surat tugas dinas / pengantar instansi, kartu identitas (KTP/Paspor).",
            waktu: "Pemesanan minimal 1 hari sebelum kedatangan",
            biaya: "Sesuai tarif sewa PNBP yang berlaku",
            icon: Gauge,
        },
        {
            title: "Layanan Perpustakaan",
            desc: "Pusat literasi metrologi pertanian dengan koleksi jurnal dan dokumen standar.",
            detail: "Akses membaca dan referensi digital ke pustaka lengkap mengenai sains atmosfer, klimatologi terapan, hidrologi pertanian, regulasi standar ISO/SNI, serta jurnal ilmiah.",
            dokumen: "Kartu identitas pengunjung / kartu keanggotaan perpustakaan.",
            waktu: "Akses langsung di tempat",
            biaya: "Gratis",
            icon: Sprout,
        },
    ];

    return (
        <div id="layanan" className="w-full flex flex-col items-center gap-2">
            <h1 className="text-center text-3xl font-bold text-[var(--green-color)] dark:text-white">Layanan Unggulan Kami</h1>
            <p className="text-center text-zinc-500 dark:text-zinc-400 mt-2">Kami menyediakan berbagai layanan teknis dan edukatif untuk<br />
                mendukung standarisasi metrologi di sektor pertanian Indonesia.</p>

            {/* Grid Cards */}
            <div className="grid gap-6 sm:grid-cols-3 w-full pt-10">
                {features.map((feat, idx) => {
                    const FeatIcon = feat.icon;
                    return (
                        <div
                            key={idx}
                            onClick={() => setSelectedFeature(feat)}
                            className="rounded-2xl border border-zinc-200/60 bg-white/70 p-6 text-left shadow-sm hover:shadow-md hover:border-emerald-500/30 transition-all duration-300 backdrop-blur-sm cursor-pointer flex flex-col justify-between"
                        >
                            <div>
                                <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 w-max">
                                    <FeatIcon className="h-6 w-6" />
                                </div>
                                <h3 className="mt-4 text-lg font-bold text-zinc-900 dark:text-white">
                                    {feat.title}
                                </h3>
                                <p className="mt-2 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                                    {feat.desc}
                                </p>
                            </div>
                            <div className="flex items-center gap-2 w-full mt-6">
                                <span className="text-sm font-semibold text-[var(--green-color)] dark:text-emerald-450 hover:underline">Pelajari Selengkapnya</span>
                                <ChevronRight className="w-4 h-4 text-[var(--green-color)] dark:text-emerald-455" />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Banner CTA */}
            <div className="w-full mt-12 bg-[var(--green-color)] rounded-2xl p-8 flex flex-col justify-center items-center text-center shadow-lg shadow-emerald-950/10">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Siap untuk Meningkatkan Standar Pertanian</h1>
                <p className="text-sm sm:text-base text-white mt-4 max-w-2xl">Dapatkan layanan terbaik langsung dari ahlinya. Proses cepat, transparan, dan akurat.</p>
                <Link href={"/"} className="mt-4">
                    <button className="px-6 py-3 text-sm font-bold text-[var(--green-color)] bg-white rounded-xl shadow-md hover:bg-emerald-50 transition duration-200 cursor-pointer">Ajukan Layanan Sekarang</button>
                </Link>
            </div>

            {/* Service Information Modal */}
            {selectedFeature && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm transition-opacity duration-300"
                        onClick={() => setSelectedFeature(null)}
                    />

                    {/* Modal Box */}
                    <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 transition-all transform scale-100 duration-300 text-left">
                        {/* Close Button */}
                        <button
                            onClick={() => setSelectedFeature(null)}
                            className="absolute right-4 top-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition cursor-pointer"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        {/* Modal Header */}
                        <div className="flex items-start gap-4 pr-6 mb-6">
                            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 flex-shrink-0">
                                <selectedFeature.icon className="h-6 w-6" />
                            </div>
                            <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--green-color)] bg-emerald-50/50 px-2 py-0.5 rounded-md dark:bg-emerald-950/30 dark:text-emerald-400">
                                    Detail Layanan
                                </span>
                                <h3 className="text-xl font-extrabold text-zinc-900 dark:text-white mt-1">
                                    {selectedFeature.title}
                                </h3>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="space-y-5 text-sm leading-relaxed text-zinc-650 dark:text-zinc-300">
                            <div>
                                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-550 mb-1">
                                    Deskripsi Layanan
                                </h4>
                                <p className="font-semibold text-zinc-800 dark:text-zinc-200">
                                    {selectedFeature.detail}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 border-t border-zinc-100 dark:border-zinc-800 pt-4">
                                <div>
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-550 mb-1">
                                        Estimasi Waktu
                                    </h4>
                                    <p className="font-bold text-zinc-900 dark:text-white">
                                        {selectedFeature.waktu}
                                    </p>
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-550 mb-1">
                                        Tarif / Biaya
                                    </h4>
                                    <p className="font-bold text-zinc-900 dark:text-white">
                                        {selectedFeature.biaya}
                                    </p>
                                </div>
                            </div>

                            <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-550 mb-1">
                                    Persyaratan Dokumen
                                </h4>
                                <p className="font-semibold text-zinc-600 dark:text-zinc-400">
                                    {selectedFeature.dokumen}
                                </p>
                            </div>
                        </div>

                        {/* Modal Footer Actions */}
                        <div className="mt-8 flex gap-3">
                            <button
                                onClick={() => setSelectedFeature(null)}
                                className="flex-1 rounded-xl border border-zinc-200 bg-white py-2.5 text-sm font-bold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 transition cursor-pointer"
                            >
                                Tutup
                            </button>
                            <Link href="/login" className="flex-1">
                                <button className="w-full rounded-xl bg-[var(--green-color)] py-2.5 text-sm font-bold text-white shadow-md hover:bg-emerald-600 transition cursor-pointer">
                                    Ajukan Layanan
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
