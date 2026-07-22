"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function Faq() {
    const [openId, setOpenId] = useState<number | null>(null);

    const faqData = [
        {
            id: 1,
            question: "Bagaimana cara mengajukan peminjaman alat?",
            answer: "Anda dapat mengajukan peminjaman alat dengan mendaftar akun terlebih dahulu, memilih menu Layanan Peminjaman Alat, mengisi formulir pengajuan, dan menunggu verifikasi dari petugas kami."
        },
        {
            id: 2,
            question: "Apakah layanan konsultasi dikenakan biaya?",
            answer: "Layanan konsultasi dasar tidak dikenakan biaya. Namun, untuk konsultasi khusus yang memerlukan pengkajian mendalam atau survei lapangan, biaya akan disesuaikan dengan ketentuan tarif PNBP yang berlaku."
        },
        {
            id: 3,
            question: "Berapa lama waktu pengolahan data agroklimat?",
            answer: "Waktu pengolahan data bervariasi antara 3 hingga 7 hari kerja tergantung pada cakupan wilayah, kompleksitas parameter data, serta kelengkapan dokumen pengajuan Anda."
        }
    ];

    const toggleFaq = (id: number) => {
        setOpenId(openId === id ? null : id);
    };

    return (
        <section id="faq" className="w-full py-16 scroll-mt-20">
            <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-stretch">

                {/* Left Column: FAQ Accordion */}
                <div className="flex-1 flex flex-col justify-between text-left">
                    <div>
                        <span className="text-xs font-extrabold uppercase tracking-wider text-[var(--yellow-color)] dark:text-amber-500 block mb-2">
                            Pertanyaan Umum
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-bold text-[var(--green-color)] dark:text-emerald-400 leading-tight mb-8">
                            Informasi & Bantuan
                        </h2>

                        <div className="space-y-4 w-full">
                            {faqData.map((item) => {
                                const isOpen = openId === item.id;
                                return (
                                    <div
                                        key={item.id}
                                        onClick={() => toggleFaq(item.id)}
                                        className="border border-[var(--green-color)] bg-emerald-50/40 dark:bg-emerald-950/5 dark:border-[var(--green-color)] rounded-2xl p-5 cursor-pointer hover:bg-emerald-50/20 dark:hover:bg-emerald-950/10 transition-all duration-300"
                                    >
                                        <button className="w-full flex justify-between items-center text-left gap-4 text-zinc-900 dark:text-white font-bold text-base sm:text-lg focus:outline-none">
                                            <span>{item.question}</span>
                                            <ChevronDown className={`w-5 h-5 text-emerald-600 dark:text-emerald-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                                        </button>
                                        {isOpen && (
                                            <div className="mt-3 text-zinc-650 dark:text-zinc-300 text-sm leading-relaxed font-medium">
                                                {item.answer}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Right Column: Premium Banner with Glassmorphism Card */}
                <div className="flex-1 w-full max-w-lg lg:max-w-none relative overflow-hidden rounded-[2.5rem] shadow-xl border border-zinc-200/50 dark:border-zinc-800 min-h-[350px] lg:min-h-[450px]">
                    {/* Background image */}
                    <img
                        src="/images/faq_banner.png"
                        alt="Pusat Inovasi dan Rekayasa"
                        className="absolute inset-0 w-full h-full object-cover"
                        loading="lazy"
                    />

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-zinc-950/20 to-transparent" />

                    {/* Bottom glassmorphic overlay card */}
                    <div className="absolute bottom-6 left-6 right-6 backdrop-blur-md bg-white/10 dark:bg-zinc-950/30 border border-white/20 dark:border-white/10 rounded-2xl p-6 text-white text-left">
                        <h3 className="font-bold text-lg">Pusat Inovasi & Rekayasa</h3>
                        <p className="text-xs text-zinc-200 mt-2 leading-relaxed font-medium">
                            Menghubungkan sains dan teknologi untuk masa depan pertanian berkelanjutan di seluruh penjuru Indonesia.
                        </p>
                    </div>
                </div>

            </div>
        </section>
    );
}