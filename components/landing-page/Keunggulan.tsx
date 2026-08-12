"use client";

import { ShieldCheck, Award, UserCheck } from "lucide-react";

export default function Keunggulan() {
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

    return (
        <div className="relative w-full py-16 bg-cover bg-center overflow-hidden" style={{ backgroundImage: "url('/images/hero.webp')" }}>
            {/* Green overlay with backdrop blur for a premium look */}
            <div className="absolute inset-0 bg-[var(--green-color)]/80 dark:bg-emerald-950/90 backdrop-blur-[2px]" />

            <div className="relative z-10 max-w-[85rem] mx-auto px-8 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                    {items.map((item, index) => {
                        const Icon = item.icon;
                        return (
                            <div key={index} className="flex flex-col sm:flex-row items-center md:items-start gap-4 text-white">
                                <div className="flex-shrink-0 p-3 rounded-xl bg-white/10 border border-white/20 backdrop-blur-sm shadow-inner">
                                    <Icon className="w-8 h-8 text-white" strokeWidth={2} />
                                </div>
                                <div className="text-center md:text-left space-y-2">
                                    <h3 className="font-bold text-lg md:text-xl tracking-tight">
                                        {item.title}
                                    </h3>
                                    <p className="text-sm md:text-base text-zinc-150 leading-relaxed font-medium">
                                        {item.desc}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
