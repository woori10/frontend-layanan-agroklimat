"use client";

import Link from "next/link";

export default function Hero() {
    return (
        <div
            className="relative w-full h-[600px] flex items-center justify-start text-left bg-cover bg-center"
            style={{ backgroundImage: "url('/images/hero.webp')" }}
        >
            {/* Dark tint gradient overlay matching the photo */}
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/85 via-zinc-900/60 to-zinc-900/40" />

            {/* Hero Content */}
            <div className="relative z-10 max-w-[85rem] mx-auto px-8 sm:px-6 lg:px-8 w-full space-y-6 text-white">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] max-w-6xl">
                    Membangun Ketahanan Pertanian <br />
                    Melalui Metrologi yang Presisi
                </h1>
                <p className="max-w-2xl text-sm sm:text-base lg:text-lg text-zinc-200 leading-relaxed">
                    Layanan terintegrasi untuk standarisasi, konsultasi, dan edukasi pertanian di Indonesia guna mencapai kedaulatan pangan nasional.
                </p>

                {/* Action Buttons */}
                <div className="flex flex-row gap-4 pt-4">
                    <Link
                        href="#layanan"
                        className="inline-flex items-center justify-center rounded-xl bg-white px-8 py-3.5 text-base font-bold text-[#267D48] shadow-lg hover:bg-zinc-100 transition-all duration-200 cursor-pointer"
                    >
                        Explore Layanan
                    </Link>
                    <Link
                        href="#tentang"
                        className="inline-flex items-center justify-center rounded-xl border border-white/40 px-8 py-3.5 text-base font-bold text-white hover:bg-white/10 transition-all duration-200 cursor-pointer"
                    >
                        Tentang Kami
                    </Link>
                </div>
            </div>
        </div>
    );
}
