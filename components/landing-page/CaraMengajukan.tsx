"use client";

import { ClipboardList, FileText, Search, Settings, CheckCircle } from "lucide-react";

export default function CaraMengajukan() {
    const steps = [
        {
            number: 1,
            title: "Pilih Layanan",
            desc: "Tentukan jenis layanan yang sesuai.",
            icon: ClipboardList
        },
        {
            number: 2,
            title: "Isi Formulir",
            desc: "Lengkapi data diri dan unggah berkas pendukung.",
            icon: FileText
        },
        {
            number: 3,
            title: "Verifikasi",
            desc: "Pengecekan kesesuaian dokumen oleh admin.",
            icon: Search
        },
        {
            number: 4,
            title: "Layanan Diproses",
            desc: "Pemrosesan layanan oleh tim unit teknis.",
            icon: Settings
        },
        {
            number: 5,
            title: "Selesai",
            desc: "Terima hasil layanan, surat atau sertifikat sesuai kebutuhan.",
            icon: CheckCircle
        }
    ];

    return (
        <div className="relative w-full py-16 bg-zinc-50/50 dark:bg-zinc-950/40 rounded-3xl border border-zinc-200/40 dark:border-zinc-800/40 overflow-hidden">
            <div className="relative z-10 max-w-[85rem] mx-auto px-8 sm:px-6 lg:px-8">
                <div className="flex flex-col items-center mb-16">
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--green-color)] dark:text-white text-center">
                        Cara Mengajukan Layanan
                    </h2>
                    <p className="text-zinc-500 dark:text-zinc-400 text-center mt-2 max-w-xl text-sm sm:text-base">
                        Informasi lengkap mengenai cara mengajukan layanan di Agroklimat
                    </p>
                </div>

                {/* Steps Container */}
                <div className="relative w-full max-w-[340px] sm:max-w-[440px] md:max-w-none mx-auto mt-10">
                    {/* Horizontal Gradient Line (Behind Circles on Desktop) */}
                    <div className="absolute top-[36px] left-[10%] right-[10%] h-3 bg-gradient-to-r from-[var(--green-color)] to-[var(--yellow-color)] rounded-full -translate-y-1/2 z-0 hidden md:block" />

                    {/* Vertical Gradient Line (Behind Circles on Mobile) */}
                    <div className="absolute left-[32px] sm:left-[40px] top-[32px] sm:top-[40px] bottom-[32px] sm:bottom-[40px] w-2.5 bg-gradient-to-b from-[var(--green-color)] to-[var(--yellow-color)] rounded-full -translate-x-1/2 z-0 md:hidden" />

                    {/* Responsive Grid/List: Vertical list on mobile, horizontal grid on desktop */}
                    <div className="flex flex-col md:grid md:grid-cols-5 gap-10 md:gap-4 relative z-10 w-full">
                        {steps.map((step) => {
                            const Icon = step.icon;
                            return (
                                <div key={step.number} className="flex flex-row md:flex-col items-center group gap-4 md:gap-0">
                                    {/* Step Number
                                    <span className="text-2xl md:text-3xl font-semibold text-zinc-800 dark:text-zinc-350 transition-all duration-300 group-hover:scale-105 shrink-0 w-10 md:w-auto text-left md:text-center md:mb-4">
                                        {step.number}
                                    </span> */}

                                    {/* Circle Icon Container */}
                                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white dark:bg-zinc-900 border border-[var(--green-color)] dark:border-emerald-500 flex items-center justify-center text-[var(--green-color)] dark:text-emerald-450 group-hover:scale-105 transition-transform duration-300 shrink-0 shadow-md z-10 ring-4 ring-zinc-50 dark:ring-zinc-950">
                                        <Icon className="w-7 h-7 sm:w-8 sm:h-8 stroke-[1.5]" />
                                    </div>

                                    {/* Step Title & Description */}
                                    <div className="flex flex-col items-start md:items-center text-left md:text-center flex-grow mt-0 md:mt-5 ml-2 md:ml-0">
                                        <h3 className="text-lg md:text-base font-extrabold text-zinc-900 dark:text-white leading-snug">
                                            {step.title}
                                        </h3>
                                        <p className="text-sm md:text-xs text-zinc-500 dark:text-zinc-400 mt-1 md:mt-2 leading-relaxed md:max-w-[185px]">
                                            {step.desc}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
