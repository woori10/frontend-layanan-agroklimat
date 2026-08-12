'use client';

import { useState } from "react";
import PengaduanModal from "../modal/PengaduanModal";

export default function Pengaduan() {
    const [isPengaduanOpen, setIsPengaduanOpen] = useState(false);
    return (
        <section id="pengaduan" className="w-full py-8 scroll-mt-20">
            <div className="flex flex-col items-center space-y-6 bg-[var(--green-color)] border-b-8 border-b-[var(--yellow-color)] rounded-xl py-16 px-6 lg:px-24">
                <div className="flex flex-col items-center space-y-6 ">
                    <p className="text-sm sm:text-base font-bold text-[var(--yellow-color)] mt-2 max-w-2xl">
                        Pengaduan dan Bantuan
                    </p>
                    <h1 className="text-4xl sm:text-5xl md:max-w-5xl mx-auto leading-tight font-semibold text-center text-white">Sampaikan kendala atau keluhan terkait layanan BRMP Agroklimat</h1>
                    <button
                        onClick={() => setIsPengaduanOpen(true)}
                        className="px-6 py-3.5 mt-4 text-sm font-bold text-[var(--green-color)] bg-white rounded-xl shadow-md hover:cursor-pointer"
                    >
                        Buat Pengaduan
                    </button>

                </div>
            </div>



            {/* Pengaduan Modal */}
            <PengaduanModal
                isOpen={isPengaduanOpen}
                onClose={() => setIsPengaduanOpen(false)}
            />
        </section>
    )
}