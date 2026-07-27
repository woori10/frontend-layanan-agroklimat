"use client";

import { useState } from "react";
import { Cloud, Gauge, Sprout, ChevronRight } from "lucide-react";
import Link from "next/link";
import ServiceInfoModal from "../modal/ServiceInfoModal";
import PengaduanModal from "../modal/PengaduanModal";

export default function Layanan() {
    const [selectedFeature, setSelectedFeature] = useState<any>(null);
    const [isPengaduanOpen, setIsPengaduanOpen] = useState(false);

    const features = [
        {
            title: "Rekomendasi Penilaian SNI",
            desc: "Layanan penilaian kesesuaian agroklimat dan hidrologi berdasarkan standar nasional.",
            detail: "Layanan asesmen teknis dan sertifikasi pemenuhan SNI untuk sistem metrologi, sensor, dan peralatan hidroklimatologi pertanian guna menjamin standar kualitas data nasional.",
            dokumen: "Surat permohonan resmi, dokumen spesifikasi alat, hasil uji mandiri awal, dan profil unit/organisasi.",
            waktu: "2-5 hari kerja",
            biaya: "Tidak ada tarif / biaya",
            icon: Cloud,
        },
        {
            title: "Konsultasi Rekomendasi",
            desc: "Layanan konsultasi intensif untuk pemenuhan kriteria penilaian kesesuaian teknis.",
            detail: "Konsultasi teknis tatap muka maupun daring bersama tim ahli metrologi klimatologi untuk penyusunan kajian dan standarisasi operasional kebun presisi Anda.",
            dokumen: "Formulir pengajuan konsultasi online dan ringkasan profil lahan/objek permasalahan.",
            waktu: "2-5 hari kerja",
            biaya: "Tidak ada tarif / biaya",
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
            title: "Bimbingan Teknis dan Narasumber",
            desc: "Penyelenggaraan bimbingan teknis dan penyediaan tenaga ahli metrologi pertanian.",
            detail: "Penyediaan narasumber profesional dan materi terstruktur untuk pelatihan, seminar, dan bimbingan teknis mengenai penerapan meteorologi klimatologi pertanian modern.",
            dokumen: "Surat undangan resmi instansi penyelenggara, Kerangka Acuan Kerja (KAK) / Term of Reference (TOR) kegiatan.",
            waktu: "2-5 hari kerja",
            biaya: "Tidak ada tarif / biaya",
            icon: Cloud,
        },
        {
            title: "Permohonan Data",
            desc: "Fasilitasi peminjaman instrumen metrologi dan akses data teknis pertanian.",
            detail: "Fasilitas peminjaman alat ukur cuaca otomatis (AWS), sensor kelembaban tanah, solarimeter, serta penyediaan dataset parameter cuaca pertanian historis terverifikasi.",
            dokumen: "Kartu identitas (KTP/KTM), proposal penelitian/kegiatan resmi, dan surat pernyataan jaminan pemeliharaan alat.",
            waktu: "2-5 hari kerja",
            biaya: "Tidak ada tarif / biaya",
            icon: Gauge,
        },
        {
            title: "Peminjaman Alat",
            desc: "Fasilitasi peminjaman instrumen metrologi dan akses data teknis pertanian.",
            detail: "Fasilitas peminjaman alat ukur cuaca otomatis (AWS), sensor kelembaban tanah, solarimeter, serta penyediaan dataset parameter cuaca pertanian historis terverifikasi.",
            dokumen: "Kartu identitas (KTP/KTM), proposal penelitian/kegiatan resmi, dan surat pernyataan jaminan pemeliharaan alat.",
            waktu: "2-5 hari kerja",
            biaya: "Biaya sesuai ketentuan yang berlaku",
            icon: Gauge,
        },
        {
            title: "Magang Teknis / PKL",
            desc: "Kesempatan belajar praktis bagi mahasiswa dan profesional di bidang metrologi.",
            detail: "Program magang praktis dan praktek kerja lapangan (PKL) terstruktur bagi siswa SMK, mahasiswa, maupun praktisi pertanian di laboratorium instrumen Agrohidromet.",
            dokumen: "Surat pengantar sekolah/kampus, proposal magang singkat, daftar riwayat hidup (CV), dan transkrip nilai.",
            waktu: "2-5 hari kerja",
            biaya: "Tidak ada tarif / biaya",
            icon: Gauge,
        },
        {
            title: "Agroedukasi",
            desc: "Kunjungan edukatif memperkenalkan teknologi pertanian modern kepada masyarakat.",
            detail: "Kunjungan edukatif rombongan (sekolah, universitas, kelompok tani) untuk pengenalan alat ukur cuaca klimatologi di taman alat dan laboratorium visualisasi sains.",
            dokumen: "Surat permohonan kunjungan resmi, detail jadwal rencana kunjungan, dan daftar nama peserta.",
            waktu: "2-5 hari kerja",
            biaya: "Tidak ada tarif / biaya",
            icon: Sprout,
        },
        {
            title: "Layanan Mess",
            desc: "Fasilitas akomodasi bagi tamu instansi, peneliti, atau peserta pelatihan teknis.",
            detail: "Penyediaan akomodasi/kamar inap dengan fasilitas lengkap dan nyaman di lingkungan balai untuk peneliti, mitra, maupun peserta diklat luar kota.",
            dokumen: "Surat tugas dinas / pengantar instansi, kartu identitas (KTP/Paspor).",
            waktu: "2-5 hari kerja",
            biaya: "Rp 100.000 / malam per kamar",
            icon: Gauge,
        },
        {
            title: "Layanan Perpustakaan",
            desc: "Pusat literasi metrologi pertanian dengan koleksi jurnal dan dokumen standar.",
            detail: "Akses membaca dan referensi digital ke pustaka lengkap mengenai sains atmosfer, klimatologi terapan, hidrologi pertanian, regulasi standar ISO/SNI, serta jurnal ilmiah.",
            dokumen: "Kartu identitas pengunjung / kartu keanggotaan perpustakaan.",
            waktu: "2-5 hari kerja",
            biaya: "Tidak ada tarif / biaya",
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
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Pusat Pengaduan</h1>
                <p className="text-sm sm:text-base text-white mt-4 max-w-2xl">Sampaikan keluhan atau masukan Anda terkait layanan kami melalui form di bawah ini.</p>
                <button
                    onClick={() => setIsPengaduanOpen(true)}
                    className="mt-4 px-6 py-3 text-sm font-bold text-[var(--green-color)] bg-white rounded-xl shadow-md hover:bg-emerald-50 transition duration-200 cursor-pointer animate-pulse hover:animate-none"
                >
                    Laporkan Pengaduan
                </button>
            </div>

            {/* Service Information Modal */}
            <ServiceInfoModal
                isOpen={!!selectedFeature}
                onClose={() => setSelectedFeature(null)}
                feature={selectedFeature}
            />

            {/* Pengaduan Modal */}
            <PengaduanModal
                isOpen={isPengaduanOpen}
                onClose={() => setIsPengaduanOpen(false)}
            />
        </div>
    );
}
