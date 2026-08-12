"use client";

import { ShieldCheck, Award, UserCheck } from "lucide-react";

const items = [
    {
        icon: ShieldCheck,
        title: "Terjamin",
        desc: "Peralatan & metode pengukuran dikalibrasi secara berkala memastikan hasil akurat & presisi."
    },
    {
        icon: Award,
        title: "Standar Nasional",
        desc: "Seluruh prosedur dan layanan telah memenuhi dan bersertifikasi Standar Nasional Indonesia (SNI)."
    },
    {
        icon: UserCheck,
        title: "Tenaga Ahli Profesional",
        desc: "Didukung oleh tim unit teknis bersertifikasi dengan pengalaman sesuai dibidangnya."
    }
];
export default function Tentang() {

    return (
        <section id="tentang" className="w-full py-16 scroll-mt-20">
            <div>
                <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-center">

                    {/* Left Column: Text Content */}
                    <div className="flex-1 space-y-6 text-left">

                        <div className="space-y-4">
                            <p className="text-md sm:text-lg font-bold text-[var(--yellow-color)] dark:text-emerald-450 leading-tight">
                                Tentang Kami
                            </p>
                            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--green-color)] dark:text-emerald-450 leading-tight">
                                Layanan Agroklimat Terintegrasi
                            </h2>
                        </div>


                        <div className="space-y-4 text-zinc-650 dark:text-zinc-300 text-sm sm:text-base leading-relaxed font-base">
                            <p>
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                            </p>
                            <p>
                                Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                            </p>
                        </div>
                    </div>

                    {/* Right Column: Staggered Image Grid */}
                    <div className="flex-1 w-full max-w-lg lg:max-w-none">
                        <div className="grid grid-cols-2 gap-4 sm:gap-6">
                            {/* Left Column of Grid (Images 1 & 3) */}
                            <div className="space-y-4 sm:space-y-6">
                                {/* Image 1: Top-Left */}
                                <div className="overflow-hidden shadow-lg border border-zinc-200/50 dark:border-zinc-800">
                                    <img
                                        src="/images/tentang_1.png"
                                        alt="Pertanian Presisi 1"
                                        className="w-full aspect-[4/3] object-cover hover:scale-105 transition-transform duration-500"
                                        loading="lazy"
                                    />
                                </div>
                                {/* Image 3: Bottom-Left */}
                                <div className="overflow-hidden shadow-lg border border-zinc-200/50 dark:border-zinc-800">
                                    <img
                                        src="/images/tentang_3.png"
                                        alt="Pertanian Presisi 3"
                                        className="w-full aspect-[4/3] object-cover hover:scale-105 transition-transform duration-500"
                                        loading="lazy"
                                    />
                                </div>
                            </div>

                            {/* Right Column of Grid (Images 2 & 4) */}
                            <div className="space-y-4 sm:space-y-6 pt-8 sm:pt-12">
                                {/* Image 2: Top-Right */}
                                <div className="overflow-hidden shadow-lg border border-zinc-200/50 dark:border-zinc-800">
                                    <img
                                        src="/images/tentang_2.png"
                                        alt="Pertanian Presisi 2"
                                        className="w-full aspect-[4/3] object-cover hover:scale-105 transition-transform duration-500"
                                        loading="lazy"
                                    />
                                </div>
                                {/* Image 4: Bottom-Right */}
                                <div className="overflow-hidden shadow-lg border border-zinc-200/50 dark:border-zinc-800">
                                    <img
                                        src="/images/tentang_4.png"
                                        alt="Pertanian Presisi 4"
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