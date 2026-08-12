"use client";

import { useState } from "react";
import {
    Cloud,
    Sprout,
    ChevronRight,
    ChevronLeft,
    GraduationCap,
    Wrench,
    Users,
    Database,
    Briefcase,
    BookOpen,
    Home,
    Award
} from "lucide-react";
import ServiceInfoModal from "../modal/ServiceInfoModal";

export default function Layanan() {
    const [selectedFeature, setSelectedFeature] = useState<any>(null);
    const [activeCategory, setActiveCategory] = useState<string>("Pendayagunaan Hasil");
    const [activeIndex, setActiveIndex] = useState(1); // Defaults to index 1 (Peminjaman Alat) to match the visual mockup

    const categories = ["Teknologi", "Rekomendasi", "Pendayagunaan Hasil", "Pendukung"];

    const features = [
        {
            title: "Rekomendasi Siap Tanam",
            desc: "Bimbingan pemilihan varietas dan kalender tanam berbasis data metrologi presisi.",
            detail: "Analisis kecocokan iklim dan ikhtisar cuaca bulanan guna merekomendasikan komoditas pertanian unggulan, penentuan kalender tanam, serta manajemen resiko iklim.",
            dokumen: "Titik koordinat lokasi lahan pertanian dan riwayat jenis tanaman yang digunakan pada musim sebelumnya.",
            waktu: "1 Hari Kerja",
            biaya: "Gratis",
            icon: Cloud,
            category: "Teknologi",
        },
        {
            title: "Rekomendasi SNI",
            desc: "Layanan penilaian kesesuaian agroklimat dan hidrologi berdasarkan standar nasional.",
            detail: "Layanan asesmen teknis dan sertifikasi pemenuhan SNI untuk sistem metrologi, sensor, dan peralatan hidroklimatologi pertanian guna menjamin standar kualitas data nasional.",
            dokumen: "Surat permohonan resmi, dokumen spesifikasi alat, hasil uji mandiri awal, dan profil unit/organisasi.",
            waktu: "2-5 hari kerja",
            biaya: "Tidak ada tarif / biaya",
            icon: Award,
            category: "Rekomendasi",
        },
        {
            title: "Bimtek & Narasumber",
            desc: "Penyelenggaraan bimbingan teknis dan penyediaan tenaga ahli metrologi pertanian.",
            detail: "Penyediaan narasumber profesional dan materi terstruktur untuk pelatihan, seminar, dan bimbingan teknis mengenai penerapan meteorologi klimatologi pertanian modern.",
            dokumen: "Surat undangan resmi instansi penyelenggara, Kerangka Acuan Kerja (KAK) / Term of Reference (TOR) kegiatan.",
            waktu: "2-5 hari kerja",
            biaya: "Tidak ada tarif / biaya",
            icon: GraduationCap,
            category: "Pendayagunaan Hasil",
        },
        {
            title: "Peminjaman Alat",
            desc: "Fasilitasi peminjaman instrumen metrologi dan akses data teknis pertanian.",
            detail: "Fasilitas peminjaman alat ukur cuaca otomatis (AWS), sensor kelembaban tanah, solarimeter, serta penyediaan dataset parameter cuaca pertanian historis terverifikasi.",
            dokumen: "Kartu identitas (KTP/KTM), proposal penelitian/kegiatan resmi, dan surat pernyataan jaminan pemeliharaan alat.",
            waktu: "2-5 hari kerja",
            biaya: "Biaya sesuai ketentuan yang berlaku",
            icon: Wrench,
            category: "Pendayagunaan Hasil",
        },
        {
            title: "Konsultasi Rekomendasi",
            desc: "Layanan konsultasi intensif untuk pemenuhan kriteria penilaian kesesuaian teknis.",
            detail: "Konsultasi teknis tatap muka maupun daring bersama tim ahli metrologi klimatologi untuk penyusunan kajian dan standarisasi operasional kebun presisi Anda.",
            dokumen: "Formulir pengajuan konsultasi online dan ringkasan profil lahan/objek permasalahan.",
            waktu: "2-5 hari kerja",
            biaya: "Tidak ada tarif / biaya",
            icon: Users,
            category: "Pendayagunaan Hasil",
        },
        {
            title: "Permintaan Data",
            desc: "Layanan permintaan data parameter cuaca dan iklim untuk sektor pertanian.",
            detail: "Penyediaan data parameter cuaca (curah hujan, suhu, kelembaban, radiasi surya) historis terverifikasi untuk kebutuhan penelitian, akademis, maupun perencanaan teknis.",
            dokumen: "Surat permohonan resmi, proposal penelitian atau surat keterangan aktif kuliah/sekolah.",
            waktu: "2-5 hari kerja",
            biaya: "Tidak ada tarif / biaya",
            icon: Database,
            category: "Pendayagunaan Hasil",
        },
        {
            title: "Magang/PKL",
            desc: "Kesempatan belajar praktis bagi mahasiswa dan profesional di bidang metrologi.",
            detail: "Program magang praktis dan praktek kerja lapangan (PKL) terstruktur bagi siswa SMK, mahasiswa, maupun praktisi pertanian di laboratorium instrumen Agrohidromet.",
            dokumen: "Surat pengantar sekolah/kampus, proposal magang singkat, daftar riwayat hidup (CV), dan transkrip nilai.",
            waktu: "2-5 hari kerja",
            biaya: "Tidak ada tarif / biaya",
            icon: Briefcase,
            category: "Pendayagunaan Hasil",
        },
        {
            title: "Layanan Perpustakaan",
            desc: "Pusat literasi metrologi pertanian dengan koleksi jurnal dan dokumen standar.",
            detail: "Akses membaca dan referensi digital ke pustaka lengkap mengenai sains atmosfer, klimatologi terapan, hidrologi pertanian, regulasi standar ISO/SNI, serta jurnal ilmiah.",
            dokumen: "Kartu identitas pengunjung / kartu keanggotaan perpustakaan.",
            waktu: "2-5 hari kerja",
            biaya: "Tidak ada tarif / biaya",
            icon: BookOpen,
            category: "Pendayagunaan Hasil",
        },
        {
            title: "Agroedukasi",
            desc: "Kunjungan edukatif memperkenalkan teknologi pertanian modern kepada masyarakat.",
            detail: "Kunjungan edukatif rombongan (sekolah, universitas, kelompok tani) untuk pengenalan alat ukur cuaca klimatologi di taman alat dan laboratorium visualisasi sains.",
            dokumen: "Surat permohonan kunjungan resmi, detail jadwal rencana kunjungan, dan daftar nama peserta.",
            waktu: "2-5 hari kerja",
            biaya: "Tidak ada tarif / biaya",
            icon: Sprout,
            category: "Pendukung",
        },
        {
            title: "Layanan Mess",
            desc: "Fasilitas akomodasi bagi tamu instansi, peneliti, atau peserta pelatihan teknis.",
            detail: "Penyediaan akomodasi/kamar inap dengan fasilitas lengkap dan nyaman di lingkungan balai untuk peneliti, mitra, maupun peserta diklat luar kota.",
            dokumen: "Surat tugas dinas / pengantar instansi, kartu identitas (KTP/Paspor).",
            waktu: "2-5 hari kerja",
            biaya: "Rp 100.000 / malam per kamar",
            icon: Home,
            category: "Pendukung",
        },
    ];

    const filteredFeatures = features.filter((feat) => feat.category === activeCategory);
    const total = filteredFeatures.length;

    const handleCategoryChange = (category: string) => {
        setActiveCategory(category);
        const count = features.filter((feat) => feat.category === category).length;
        // Default highlight to the middle item if there are at least 3 items, otherwise default to first
        setActiveIndex(count >= 3 ? 1 : 0);
    };

    const nextSlide = () => {
        if (total <= 1) return;
        setActiveIndex((prev) => (prev + 1) % total);
    };

    const prevSlide = () => {
        if (total <= 1) return;
        setActiveIndex((prev) => (prev - 1 + total) % total);
    };

    return (
        <div id="layanan" className="w-full flex flex-col items-center bg-[var(--green-color)] dark:bg-zinc-950 gap-2 py-16 px-6 sm:px-12 lg:px-24">
            <style>{`
                .carousel-track {
                    transform: translateX(calc(var(--center-offset-mobile) - var(--start-index-mobile) * (280px + 24px)));
                }
                @media (min-width: 640px) {
                    .carousel-track {
                        transform: translateX(calc(var(--center-offset-sm) - var(--start-index-mobile) * (320px + 24px)));
                    }
                }
                @media (min-width: 768px) {
                    .carousel-track {
                        transform: translateX(calc(-1 * var(--start-index-tablet) * (100% / 2 + 12px)));
                    }
                }
                @media (min-width: 1024px) {
                    .carousel-track {
                        transform: translateX(calc(-1 * var(--start-index-desktop) * (100% / 3 + 8px)));
                    }
                }
            `}</style>

            <h1 className="text-center text-3xl sm:text-4xl font-extrabold text-white dark:text-white">
                Layanan Unggulan Kami
            </h1>
            <p className="text-center text-white/90 dark:text-zinc-300 mt-2 max-w-2xl text-sm sm:text-base">
                Kami menyediakan berbagai layanan teknis dan edukatif untuk<br className="hidden sm:inline" />
                mendukung standarisasi metrologi di sektor pertanian Indonesia.
            </p>

            {/* Category Filter Tabs */}
            <div className="flex flex-wrap justify-center items-center gap-3 pt-8 w-full">
                {categories.map((cat) => {
                    const isActive = activeCategory === cat;
                    return (
                        <button
                            key={cat}
                            onClick={() => handleCategoryChange(cat)}
                            className={`px-6 py-2.5 rounded-full text-xs md:text-sm font-semibold transition-all duration-300 shadow-sm cursor-pointer hover:scale-102 active:scale-98 ${isActive
                                ? "bg-[var(--yellow-color)] text-[var(--foreground)] scale-105 shadow-md"
                                : "bg-white text-[var(--green-color)] dark:bg-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700/80"
                                }`}
                        >
                            {cat}
                        </button>
                    );
                })}
            </div>

            {/* Carousel Slider */}
            <div className="relative w-full flex items-center justify-between mt-6 px-4 sm:px-16">
                {/* Left Navigation Button */}
                <button
                    onClick={prevSlide}
                    className={`absolute left-0 top-1/2 -translate-y-1/2 z-20 w-11 h-11 bg-white dark:bg-zinc-800 rounded-full flex items-center justify-center shadow-lg text-zinc-650 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 active:scale-90 transition-all cursor-pointer select-none -translate-x-1/2 sm:translate-x-0 ${total <= 1 ? "hidden" : "flex"
                        }`}
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>

                {/* Cards Viewport */}
                <div className="w-full max-w-5xl mx-auto overflow-hidden py-6">
                    <div
                        key={activeCategory}
                        className={`carousel-track w-full flex transition-transform duration-500 ease-in-out gap-6 ${total === 1
                            ? "justify-center"
                            : total === 2
                                ? "justify-start md:justify-center"
                                : "justify-start"
                            }`}
                        style={{
                            "--start-index-mobile": activeIndex,
                            "--start-index-tablet": Math.max(0, Math.min(total - 2, activeIndex)),
                            "--start-index-desktop": Math.max(0, Math.min(total - 3, activeIndex - 1)),
                            "--center-offset-mobile": total > 1 ? "calc(50% - 140px)" : "0px",
                            "--center-offset-sm": total > 1 ? "calc(50% - 160px)" : "0px"
                        } as React.CSSProperties}
                    >
                        {filteredFeatures.map((feat, idx) => {
                            const FeatIcon = feat.icon;
                            const isActive = idx === activeIndex;
                            return (
                                <div
                                    key={feat.title}
                                    onClick={() => setSelectedFeature(feat)}
                                    className={`rounded-3xl border bg-white dark:bg-zinc-900 p-8 text-left transition-all duration-500 cursor-pointer flex flex-col justify-between h-[340px] w-[280px] sm:w-[320px] md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] shrink-0 group ${isActive
                                        ? "border-emerald-500/20 dark:border-zinc-700 shadow-2xl scale-105 z-10 opacity-100 ring-4 ring-white/10"
                                        : "border-zinc-200/40 dark:border-zinc-800/80 shadow-md scale-95 opacity-75 hover:opacity-90"
                                        }`}
                                >
                                    <div>
                                        {/* Icon Container */}
                                        <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 dark:text-emerald-455">
                                            <FeatIcon className="h-5 w-5" />
                                        </div>

                                        {/* Title */}
                                        <h3 className="mt-5 text-xl font-bold text-zinc-900 dark:text-white leading-tight">
                                            {feat.title}
                                        </h3>

                                        {/* Description */}
                                        <p className="mt-3 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400 line-clamp-5">
                                            {feat.detail}
                                        </p>
                                    </div>

                                    {/* Learn More Link */}
                                    <div className="flex items-center gap-1.5 w-full mt-6 text-sm font-semibold text-[var(--green-color)] dark:text-emerald-400">
                                        <span>Pelajari Selengkapnya</span>
                                        <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Right Navigation Button */}
                <button
                    onClick={nextSlide}
                    className={`absolute right-0 top-1/2 -translate-y-1/2 z-20 w-11 h-11 bg-white dark:bg-zinc-800 rounded-full flex items-center justify-center shadow-lg text-zinc-650 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 active:scale-90 transition-all cursor-pointer select-none translate-x-1/2 sm:translate-x-0 ${total <= 1 ? "hidden" : "flex"
                        }`}
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>

            {/* Pagination Dots */}
            {total > 1 && (
                <div className="flex items-center justify-center gap-2.5 mt-8">
                    {filteredFeatures.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setActiveIndex(idx)}
                            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 cursor-pointer ${idx === activeIndex
                                ? "bg-[var(--yellow-color)] scale-110 shadow-sm"
                                : "bg-white/40 hover:bg-white/60"
                                }`}
                            aria-label={`Go to slide ${idx + 1}`}
                        />
                    ))}
                </div>
            )}



            {/* Service Information Modal */}
            <ServiceInfoModal
                isOpen={!!selectedFeature}
                onClose={() => setSelectedFeature(null)}
                feature={selectedFeature}
            />


        </div>
    );
}
