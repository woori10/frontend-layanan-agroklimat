'use client';
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function EditProfile() {
    const router = useRouter();
    return (
        <div className="bg-white border border-zinc-200 rounded-xl p-8 shadow-sm w-full">
            <div className="grid gap-6 sm:grid-cols-2">
                {/* Nama Lengkap */}
                <div className="space-y-2">
                    <label htmlFor="namaLengkap" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                        Nama Lengkap <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <input
                            id="namaLengkap"
                            type="text"
                            required
                            className="block w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-[#F8FAFC] dark:bg-zinc-950 px-4 py-3 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 shadow-sm focus:border-[var(--green-color)] focus:outline-none focus:ring-1 focus:ring-[var(--green-color)]"
                            placeholder="Masukkan nama lengkap..."
                        />
                    </div>
                </div>

                {/* No Telp */}
                <div className="space-y-2">
                    <label htmlFor="noTelp" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                        No. Telepon / WhatsApp <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <input
                            id="noTelp"
                            type="tel"
                            required
                            className="block w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-[#F8FAFC] dark:bg-zinc-950 px-4 py-3 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 shadow-sm focus:border-[var(--green-color)] focus:outline-none focus:ring-1 focus:ring-[var(--green-color)]"
                            placeholder="08123456789"
                        />
                    </div>
                </div>

                {/* NIP / No KTP */}
                <div className="space-y-2">
                    <label htmlFor="nipKtp" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                        NIP / No. KTP <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <input
                            id="nipKtp"
                            type="text"
                            required
                            className="block w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-[#F8FAFC] dark:bg-zinc-950 px-4 py-3 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 shadow-sm focus:border-[var(--green-color)] focus:outline-none focus:ring-1 focus:ring-[var(--green-color)]"
                            placeholder="198327948279249891"
                        />
                    </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                        Email <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <input
                            id="email"
                            type="email"
                            required
                            className="block w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-[#F8FAFC] dark:bg-zinc-950 px-4 py-3 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 shadow-sm focus:border-[var(--green-color)] focus:outline-none focus:ring-1 focus:ring-[var(--green-color)]"
                            placeholder="[EMAIL_ADDRESS]"
                        />
                    </div>
                </div>
            </div>

            {/* Alamat / Instansi Asal */}
            <div className="space-y-2 mt-6">
                <label htmlFor="alamatInstansi" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    Alamat / Instansi Asal <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                    <textarea
                        id="alamatInstansi"
                        required
                        rows={3}
                        className="block w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-[#F8FAFC] dark:bg-zinc-950 px-4 py-3 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 shadow-sm focus:border-[var(--green-color)] focus:outline-none focus:ring-1 focus:ring-[var(--green-color)] resize-none"
                        placeholder="Alamat lengkap atau instansi"
                    />
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 mt-6">
                <button
                    type="submit"
                    className="px-6 py-3 bg-[var(--green-color)] hover:cursor-pointer text-white rounded-xl text-sm font-bold shadow-md transition flex items-center gap-2"
                >
                    Simpan Perubahan
                </button>
            </div>

        </div>
    )
}