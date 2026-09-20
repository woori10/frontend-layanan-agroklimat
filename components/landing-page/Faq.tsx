"use client";

import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { getApiUrl } from "@/lib/api";

interface FaqItem {
    id: number;
    pertanyaan: string;
    jawaban: string;
}

const DEFAULT_FAQS: FaqItem[] = [
    {
        id: 1,
        pertanyaan: "Bagaimana cara mengajukan peminjaman alat?",
        jawaban: "Anda dapat mengajukan peminjaman alat dengan mendaftar akun terlebih dahulu, memilih menu Layanan Peminjaman Alat, mengisi formulir pengajuan, dan menunggu verifikasi dari petugas kami."
    },
    {
        id: 2,
        pertanyaan: "Apakah layanan konsultasi dikenakan biaya?",
        jawaban: "Layanan konsultasi dasar tidak dikenakan biaya. Namun, untuk konsultasi khusus yang memerlukan pengkajian mendalam atau survei lapangan, biaya akan disesuaikan dengan ketentuan tarif PNBP yang berlaku."
    },
    {
        id: 3,
        pertanyaan: "Berapa lama waktu pengolahan data agroklimat?",
        jawaban: "Waktu pengolahan data bervariasi antara 3 hingga 7 hari kerja tergantung pada cakupan wilayah, kompleksitas parameter data, serta kelengkapan dokumen pengajuan Anda."
    }
];

export default function Faq() {
    const [openId, setOpenId] = useState<number | null>(null);
    const [faqs, setFaqs] = useState<FaqItem[]>(DEFAULT_FAQS);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFaqs = async () => {
            try {
                const res = await fetch(`${getApiUrl()}/faq`);
                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data) && data.length > 0) {
                        setFaqs(data);
                    }
                }
            } catch (err) {
                console.error("Gagal memuat FAQ dari server:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchFaqs();
    }, []);

    const toggleFaq = (id: number) => {
        setOpenId(openId === id ? null : id);
    };

    return (
        <section id="faq" className="w-full pt-16 pb-8 scroll-mt-20">
            <div className="flex gap-12 lg:gap-16 items-center">

                <div className="flex-1 flex flex-col justify-between text-left">
                    <div>
                        <h2 className="text-2xl sm:text-4xl font-bold text-[var(--green-color)] dark:text-secondary-green-color leading-tight mb-8">
                            FAQs Layanan BRMP
                        </h2>

                        <div className="space-y-4 w-full">
                            {faqs.map((item) => {
                                const isOpen = openId === item.id;
                                return (
                                    <div
                                        key={item.id}
                                        onClick={() => toggleFaq(item.id)}
                                        className={`border rounded-2xl p-5 cursor-pointer transition-all duration-300 ${isOpen
                                            ? "bg-secondary-green-color/95 border-[var(--green-color)]/30 dark:bg-secondary-green-color/30 dark:border-[var(--green-color)]"
                                            : "border-[var(--green-color)]/20 bg-white dark:bg-secondary-green-color/5 dark:border-[var(--green-color)]/20"
                                            }`}
                                    >
                                        <button
                                            type="button"
                                            className="w-full flex justify-between items-center text-left gap-4 text-zinc-900 dark:text-white font-semibold text-base sm:text-lg focus:outline-none cursor-pointer"
                                        >
                                            <span>{item.pertanyaan}</span>
                                            {isOpen ? (
                                                <ChevronUp className="w-5 h-5 text-[var(--green-color)] dark:text-secondary-green-color shrink-0 transition-colors duration-200" />
                                            ) : (
                                                <ChevronDown className="w-5 h-5 text-[var(--green-color)] dark:text-zinc-300 shrink-0 transition-colors duration-200" />
                                            )}
                                        </button>
                                        {isOpen && (
                                            <div className="mt-3 text-zinc-650 dark:text-zinc-300 text-sm leading-relaxed font-medium whitespace-pre-line">
                                                {item.jawaban}
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