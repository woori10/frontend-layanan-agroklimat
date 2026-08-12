'use client';

export default function ProfileBanner() {
    return (
        <div className="relative overflow-hidden bg-[#244E2B] dark:bg-[#17331D] py-12 px-6 sm:px-12 text-center shadow-lg border border-emerald-800/10">
            {/* Decorative Left Blobs */}
            <div className="absolute -left-16 -bottom-16 w-52 h-52 rounded-full bg-black/10 dark:bg-black/20 pointer-events-none"></div>

            {/* Decorative Right Blobs (Overlapping circles) */}
            <div className="absolute -right-36 -top-36 w-96 h-96 rounded-full bg-white/5 pointer-events-none"></div>
            <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-[#2A5932] dark:bg-[#1A3D22] opacity-80 pointer-events-none"></div>

            {/* Content */}
            <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center justify-center space-y-3">
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-sans">
                    Profile
                </h1>
                <p className="text-xs sm:text-sm md:text-base text-zinc-100/90 max-w-3xl leading-relaxed">
                    Lorem ipsum dolor sit amet consectetur, adipisicing elit. Culpa ut laborum mollitia vel consectetur
                </p>
            </div>
        </div>
    );
}
