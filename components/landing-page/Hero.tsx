"use client";

import { useState } from "react";
import { CirclePlay, X } from "lucide-react";
import Link from "next/link";

export default function Hero() {
    const [isVideoOpen, setIsVideoOpen] = useState(false);

    return (
        <div
            className="relative w-full h-[calc(100vh-80px)] min-h-[500px] flex items-center justify-start text-left bg-cover bg-center"
            style={{ backgroundImage: "url('/images/hero.webp')" }}
        >
            {/* Dark tint gradient overlay matching the photo */}
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/85 via-zinc-900/60 to-zinc-900/40" />

            {/* Hero Content */}
            <div className="relative z-10 max-w-[85rem] mx-auto text-center md:text-start px-8 sm:px-6 lg:px-8 w-full space-y-6 text-white">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] max-w-6xl">
                    Portal Layanan Terintegrasi <br />
                    BRMP Agroklimat dan Hidrologi
                </h1>
                <p className="max-w-2xl mx-auto md:mx-0 text-sm sm:text-base lg:text-lg text-zinc-200 leading-relaxed">
                    Layanan terintegrasi untuk standarisasi, konsultasi, dan edukasi pertanian di Indonesia guna mencapai kedaulatan pangan nasional.
                </p>

                {/* Action Buttons */}
                <div className="flex flex-row justify-center md:justify-start gap-4 pt-4">
                    <button
                        onClick={() => setIsVideoOpen(true)}
                        className="inline-flex items-center justify-center rounded-xl bg-white gap-2 px-8 py-4 text-base font-bold text-[#267D48] shadow-lg hover:bg-zinc-100 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer"
                    >
                        <CirclePlay className="w-5 h-5" />
                        Putar Video
                    </button>
                    <Link
                        href="#tentang"
                        className="inline-flex items-center justify-center rounded-xl border border-white/40 px-8 py-4 text-base font-bold text-white hover:bg-white/10 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer"
                    >
                        Buku Panduan
                    </Link>
                </div>
            </div>

            {/* Video Modal Overlay */}
            {isVideoOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md transition-all duration-300"
                    onClick={() => setIsVideoOpen(false)}
                >
                    <div
                        className="relative w-full max-w-4xl mx-4 aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10"
                        style={{
                            animation: "modalFadeInScale 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards"
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close button */}
                        <button
                            onClick={() => setIsVideoOpen(false)}
                            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white/80 hover:text-white transition-all cursor-pointer border border-white/10 hover:rotate-90"
                            aria-label="Tutup video"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        {/* Youtube iframe */}
                        <iframe
                            className="w-full h-full"
                            src="https://www.youtube.com/embed/qMlrShf4GGg?autoplay=1"
                            title="YouTube video player"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                        ></iframe>
                    </div>

                    {/* Inline custom CSS for animation keyframe */}
                    <style>{`
                        @keyframes modalFadeInScale {
                            from {
                                opacity: 0;
                                transform: scale(0.95) translateY(10px);
                            }
                            to {
                                opacity: 1;
                                transform: scale(1) translateY(0);
                            }
                        }
                    `}</style>
                </div>
            )}
        </div>
    );
}

