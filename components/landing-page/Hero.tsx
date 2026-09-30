"use client";

import { useState } from "react";
import { CirclePlay, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function Hero() {
    const [isVideoOpen, setIsVideoOpen] = useState(false);

    return (
        <div
            className="relative w-full h-[calc(100vh-80px)] min-h-[500px] flex items-center justify-start text-left overflow-hidden"
            role="banner"
        >
            {/* LCP Hero Image — responsive <picture> with fetchpriority for fastest mobile & desktop LCP */}
            <picture>
                <source
                    media="(max-width: 640px)"
                    srcSet="/images/kantor-mobile.webp"
                    type="image/webp"
                />
                <img
                    src="/images/kantor-optimized.webp"
                    alt=""
                    aria-hidden="true"
                    fetchPriority="high"
                    decoding="sync"
                    className="absolute inset-0 w-full h-full object-cover object-center"
                />
            </picture>

            {/* Dark tint — rasio kontras ≥ 4.5:1 dengan teks putih di atasnya */}
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/90 via-zinc-900/70 to-zinc-900/40" />

            {/* Hero Content */}
            <div className="relative z-10 max-w-[85rem] mx-auto text-center md:text-start px-8 sm:px-6 lg:px-8 w-full space-y-6 text-white">
                {/* h1 adalah satu-satunya heading level-1 di halaman ini */}
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] max-w-6xl">
                    Portal Layanan Terintegrasi <br />
                    BRMP Agroklimat dan Hidrologi
                </h1>
                <p className="max-w-2xl mx-auto md:mx-0 text-sm sm:text-base lg:text-lg text-zinc-200 leading-relaxed">
                    Layanan terintegrasi untuk standarisasi, konsultasi, dan edukasi pertanian di Indonesia guna mencapai kedaulatan pangan nasional.
                </p>

                {/* Action Buttons — min 48px touch target */}
                <div className="flex flex-row flex-nowrap justify-center md:justify-start items-center gap-3 sm:gap-4 pt-4">
                    <button
                        onClick={() => setIsVideoOpen(true)}
                        aria-label="Tonton Video Profil BRMP Agroklimat"
                        className="inline-flex items-center justify-center rounded-xl bg-white gap-1.5 sm:gap-2 px-5 sm:px-6 md:px-8 py-3.5 md:py-4 min-h-[48px] text-xs sm:text-sm md:text-base font-bold text-[#267D48] shadow-lg hover:bg-zinc-100 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0"
                    >
                        <CirclePlay className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" aria-hidden="true" />
                        <span>Video Profile</span>
                    </button>
                    <Link
                        href="#tentang"
                        className="inline-flex items-center justify-center rounded-xl border-2 border-white/60 px-5 sm:px-6 md:px-8 py-3.5 md:py-4 min-h-[48px] text-xs sm:text-sm md:text-base font-bold text-white hover:bg-white/15 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0"
                    >
                        <span>Buku Panduan</span>
                    </Link>
                </div>
            </div>

            {/* Video Modal Overlay */}
            {isVideoOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md transition-all duration-300"
                    onClick={() => setIsVideoOpen(false)}
                    role="dialog"
                    aria-modal="true"
                    aria-label="Dialog video profil"
                >
                    <div
                        className="relative w-full max-w-4xl mx-4 aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10"
                        style={{
                            animation: "modalFadeInScale 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards"
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close button — 48px min touch target */}
                        <button
                            onClick={() => setIsVideoOpen(false)}
                            className="absolute top-3 right-3 z-10 flex items-center justify-center w-12 h-12 rounded-full bg-black/60 hover:bg-black/80 text-white/80 hover:text-white transition-all cursor-pointer border border-white/10 hover:rotate-90"
                            aria-label="Tutup video"
                        >
                            <X className="w-5 h-5" aria-hidden="true" />
                        </button>

                        {/* Youtube iframe */}
                        <iframe
                            className="w-full h-full"
                            src="https://www.youtube.com/embed/qMlrShf4GGg?autoplay=1"
                            title="Video Profil BRMP Agroklimat dan Hidrologi Pertanian"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                        ></iframe>
                    </div>

                    <style>{`
                        @keyframes modalFadeInScale {
                            from { opacity: 0; transform: scale(0.95) translateY(10px); }
                            to   { opacity: 1; transform: scale(1) translateY(0); }
                        }
                    `}</style>
                </div>
            )}
        </div>
    );
}
