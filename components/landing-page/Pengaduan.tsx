export default function Pengaduan() {
    return (
        <section id="pengaduan" className="w-full py-8 scroll-mt-20">
            <div className="flex flex-col items-center space-y-6 bg-[var(--green-color)] border-b-8 border-b-[var(--yellow-color)] rounded-xl py-16 px-6 lg:px-24">
                <div className="flex flex-col items-center space-y-6 ">
                    <p className="text-sm sm:text-base font-bold text-[var(--yellow-color)] mt-2 max-w-2xl">
                        Pengaduan dan Bantuan
                    </p>
                    <h2 className="text-2xl md:text-4xl md:max-w-4xl mx-auto leading-tight font-semibold text-center text-white">
                        Sampaikan kendala atau keluhan terkait layanan BRMP Agroklimat
                    </h2>
                    <a
                        href="https://docs.google.com/forms/d/e/1FAIpQLSej6HyWOxU4hkdt1m74gmNx_oFn1Px-8OQ5Vb4cfmHZanjcvA/viewform"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-6 py-3.5 mt-4 min-h-[48px] inline-flex items-center justify-center text-xs md:text-sm font-bold text-[var(--green-color)] bg-white rounded-xl shadow-md hover:cursor-pointer"
                    >
                        Buat Pengaduan
                    </a>
                </div>
            </div>
        </section>
    );
}