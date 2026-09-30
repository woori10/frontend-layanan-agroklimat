import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, Mail } from "lucide-react";

export default function Kontak() {
    return (
        <footer id="kontak" className="w-full bg-[#2D2D2D] dark:bg-zinc-950 text-zinc-400 py-16 scroll-mt-20">
            <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8">
                {/* 4-Column Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 pb-12">

                    {/* Column 1: Logo & Info */}
                    <div className="space-y-6 text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-3">
                            <Image
                                src="/images/logo_brmp.svg"
                                alt="Logo BRMP"
                                width={44}
                                height={44}
                                className="rounded-full p-1.5 shadow-sm"
                            />
                            <div>
                                <span className="font-extrabold text-sm leading-tight tracking-tight text-white block">
                                    BRMP Agroklimat
                                </span>
                                <span className="text-xs text-zinc-400 font-medium block">
                                    Hidrologi Pertanian
                                </span>
                            </div>
                        </div>
                        <p className="text-sm leading-relaxed text-zinc-300 font-medium max-w-sm mx-auto md:mx-0">
                            BRMP Agroklimat berkomitmen untuk memberikan layanan teknis terbaik demi kemajuan sektor agrikultur nasional.
                        </p>
                    </div>

                    {/* Column 2: Tautan Cepat */}
                    <div className="text-center md:text-left">
                        <h3 className="text-lg font-bold text-white mb-6 border-b-2 border-[var(--green-color)] pb-1.5 w-max mx-auto md:mx-0">
                            Tautan Cepat
                        </h3>
                        <ul className="space-y-1 text-sm font-medium text-zinc-300">
                            <li>
                                <Link href="/" className="hover:text-white transition py-1.5 inline-block">
                                    Beranda
                                </Link>
                            </li>
                            <li>
                                <Link href="#tentang" className="hover:text-white transition py-1.5 inline-block">
                                    Tentang
                                </Link>
                            </li>
                            <li>
                                <Link href="#layanan" className="hover:text-white transition py-1.5 inline-block">
                                    Layanan
                                </Link>
                            </li>
                            <li>
                                <Link href="#faq" className="hover:text-white transition py-1.5 inline-block">
                                    FAQ
                                </Link>
                            </li>
                            <li>
                                <Link href="/login" className="hover:text-white transition py-1.5 inline-block">
                                    Login
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Column 3: Kontak Kami */}
                    <div className="text-center md:text-left">
                        <h3 className="text-lg font-bold text-white mb-6 border-b-2 border-[var(--green-color)] pb-1.5 w-max mx-auto md:mx-0">
                            Kontak Kami
                        </h3>
                        <ul className="space-y-3 text-sm font-medium text-zinc-300">
                            <li className="flex items-start justify-center md:justify-start gap-3 text-center md:text-left max-w-xs mx-auto md:mx-0">
                                <MapPin className="h-5 w-5 text-[#4ade80] dark:text-secondary-green-color mt-0.5 flex-shrink-0" />
                                <span>Jl. Tentara Pelajar No. 1 A Kel. Menteng, Kec. Bogor Barat Kota Bogor, Jawa Barat 16111</span>
                            </li>
                            <li className="flex items-center justify-center md:justify-start gap-3">
                                <Phone className="h-5 w-5 text-[#4ade80] dark:text-secondary-green-color flex-shrink-0" />
                                <a
                                    href="https://wa.me/6281389091091"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-white transition cursor-pointer py-1"
                                >
                                    081389091091
                                </a>
                            </li>

                            <li className="flex items-center justify-center md:justify-start gap-3">
                                <Mail className="h-5 w-5 text-[#4ade80] dark:text-secondary-green-color flex-shrink-0" />
                                <a
                                    href="mailto:brmp.agroklimat@pertanian.go.id"
                                    className="hover:text-white transition cursor-pointer py-1"
                                >
                                    brmp.agroklimat@pertanian.go.id
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Column 4: Jam Operasional */}
                    <div className="text-center md:text-left">
                        <h3 className="text-lg font-bold text-white mb-6 border-b-2 border-[var(--green-color)] pb-1.5 w-max mx-auto md:mx-0">
                            Jam Operasional
                        </h3>
                        <div className="bg-[#3D3D3D]/50 border border-zinc-700/30 p-5 rounded-2xl space-y-4 max-w-md mx-auto md:mx-0 text-left">
                            <div className="flex justify-between items-center text-sm font-medium text-zinc-200">
                                <span>Senin - Kamis</span>
                                <span className="font-mono text-xs">07:30 - 16:00</span>
                            </div>
                            <div className="flex justify-between items-center text-sm font-medium text-zinc-200">
                                <span>Jumat</span>
                                <span className="font-mono text-xs">07:30 - 16:30</span>
                            </div>
                            <div className="border-t border-zinc-700/30 pt-3 text-center">
                                <span className="text-xs font-bold text-[#4ade80] dark:text-secondary-green-color">
                                    Sabtu, Minggu & Hari Libur Tutup
                                </span>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Bottom Bar */}
                <div className="border-t border-zinc-800 pt-8 flex flex-col md:flex-row items-center justify-center text-center gap-4">
                    <p className="text-xs text-zinc-400">
                        © 2026 BRMP Agroklimat dan Hidrologi Pertanian. Seluruh Hak Cipta Dilindungi.
                    </p>
                </div>
            </div>
        </footer>
    );
}
