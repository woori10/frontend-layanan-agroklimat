import Image from "next/image";

export default function Tentang() {

    return (
        <section id="tentang" className="w-full py-16 scroll-mt-20">
            <div>
                <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-center">

                    {/* Left Column: Text Content */}
                    <div className="flex-1 space-y-6 text-center md:text-left">

                        <div className="space-y-4">
                            {/* Label kecil — gunakan warna kontras tinggi yang lulus WCAG AA */}
                            <p className="text-md sm:text-lg font-bold text-[var(--green-color)] dark:text-secondary-green-color leading-tight">
                                Tentang Kami
                            </p>
                            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--green-color)] dark:text-secondary-green-color leading-tight">
                                Layanan Agroklimat Terintegrasi
                            </h2>
                        </div>


                        <div className="space-y-4 text-zinc-600 dark:text-zinc-300 text-sm sm:text-base leading-relaxed font-normal">
                            <p>
                                BRMP Agroklimat berkomitmen untuk menyediakan layanan publik terpadu di bidang agroklimatologi, hidrologi, dan pertanian yang transparan, akuntabel, dan berorientasi pada kepuasan masyarakat.
                            </p>
                            <p>
                                Melalui portal ini, kami memfasilitasi permohonan pengujian laboratorium, kalibrasi instrumen, peminjaman peralatan teknis, kunjungan edukasi, serta program magang dan penelitian guna mendukung kemajuan pertanian presisi dan kedaulatan pangan di Indonesia.
                            </p>
                        </div>
                    </div>

                    {/* Right Column: Staggered Image Grid — WebP optimized + lazy load */}
                    <div className="flex-1 w-full max-w-lg lg:max-w-none">
                        <div className="grid grid-cols-2 gap-4 sm:gap-6">
                            {/* Left Column of Grid (Images 1 & 3) */}
                            <div className="space-y-4 sm:space-y-6">
                                <div className="overflow-hidden shadow-lg border border-zinc-200/50 dark:border-zinc-800">
                                    <Image
                                        src="/images/tentang_1.webp"
                                        alt="Tim laboratorium agroklimat sedang melakukan pengujian instrumen"
                                        width={400}
                                        height={300}
                                        className="w-full aspect-[4/3] object-cover hover:scale-105 transition-transform duration-500"
                                        loading="lazy"
                                    />
                                </div>
                                <div className="overflow-hidden shadow-lg border border-zinc-200/50 dark:border-zinc-800">
                                    <Image
                                        src="/images/tentang_3.webp"
                                        alt="Petugas BRMP melakukan pengukuran data iklim di lapangan"
                                        width={400}
                                        height={300}
                                        className="w-full aspect-[4/3] object-cover hover:scale-105 transition-transform duration-500"
                                        loading="lazy"
                                    />
                                </div>
                            </div>

                            {/* Right Column of Grid (Images 2 & 4) */}
                            <div className="space-y-4 sm:space-y-6 pt-8 sm:pt-12">
                                <div className="overflow-hidden shadow-lg border border-zinc-200/50 dark:border-zinc-800">
                                    <Image
                                        src="/images/tentang_2.webp"
                                        alt="Stasiun cuaca otomatis di area pertanian"
                                        width={400}
                                        height={300}
                                        className="w-full aspect-[4/3] object-cover hover:scale-105 transition-transform duration-500"
                                        loading="lazy"
                                    />
                                </div>
                                <div className="overflow-hidden shadow-lg border border-zinc-200/50 dark:border-zinc-800">
                                    <Image
                                        src="/images/tentang_4.webp"
                                        alt="Kegiatan edukasi dan bimbingan teknis pertanian presisi"
                                        width={400}
                                        height={300}
                                        className="w-full aspect-[4/3] object-cover hover:scale-105 transition-transform duration-500"
                                        loading="lazy"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}