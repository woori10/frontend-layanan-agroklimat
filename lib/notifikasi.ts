import { getApiUrl } from "./api";

function getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("agro_token");
}

export interface NotifikasiItem {
    id: number;
    user_id: number;
    tiket_id: number | null;
    kanal: "dashboard" | "email";
    judul: string | null;
    pesan: string;
    dibaca: boolean;
    status_kirim: boolean;
    timestamp: string;
    tiket?: {
        id: number;
        no_tiket: string;
        status: string;
        layanan?: {
            id: number;
            nama_layanan: string;
            slug: string;
        };
    } | null;
}

export async function getNotifikasi(): Promise<NotifikasiItem[]> {
    const token = getToken();
    if (!token) return [];
    const res = await fetch(`${getApiUrl()}/notifikasi`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Gagal mengambil data notifikasi");
    return res.json();
}

export async function markNotifikasiRead(id: number) {
    const token = getToken();
    if (!token) return;
    const res = await fetch(`${getApiUrl()}/notifikasi/${id}/read`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Gagal menandai notifikasi dibaca");
    return res.json();
}

export async function markAllNotifikasiRead() {
    const token = getToken();
    if (!token) return;
    const res = await fetch(`${getApiUrl()}/notifikasi/read-all`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Gagal menandai semua notifikasi dibaca");
    return res.json();
}
