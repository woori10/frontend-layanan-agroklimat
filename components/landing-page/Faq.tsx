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
        <section id="faq" className="w-full pt-16 pb-8 scroll-mt-20">
            <div className="flex gap-12 lg:gap-16 items-center">

                <div className="flex-1 flex flex-col justify-between text-left">
                    <div>
                        <h2 className="text-3xl sm:text-4xl font-bold text-[var(--green-color)] dark:text-emerald-400 leading-tight mb-8">
                            FAQs Layanan BRMP
                        </h2>

                        <div className="space-y-4 w-full">
                            {faqData.map((item) => {
                                const isOpen = openId === item.id;
                                return (
                                    <div
                                        key={item.id}
                                        onClick={() => toggleFaq(item.id)}
                                        className={`border rounded-2xl p-5 cursor-pointer transition-all duration-300 ${isOpen
                                                ? "bg-[#F3FCEB]/95 border-[var(--green-color)]/30 dark:bg-emerald-950/30 dark:border-[var(--green-color)]"
                                                : "border-[var(--green-color)]/20 bg-white dark:bg-emerald-950/5 dark:border-[var(--green-color)]/20"
                                            }`}
                                    >
                                        <button className="w-full flex justify-between items-center text-left gap-4 text-zinc-900 dark:text-white font-semibold text-base sm:text-lg focus:outline-none">
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
            </div>
        </section>
    );
}