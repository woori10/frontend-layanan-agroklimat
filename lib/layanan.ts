import { getApiUrl } from "./api";

function getToken(): string | null {
    return localStorage.getItem("agro_token");
}

export interface UnitTeknis {
    id: number;
    nama: string;
}

export interface Layanan {
    id: number;
    nama_layanan: string;
    slug: string;
    biaya: any;
    sla_hari: number | null;
    unit_teknis_id: number | null;
    unit_teknis: UnitTeknis | null;
}

export async function getLayananBySlug(slug: string): Promise<Layanan> {
    const token = getToken();
    const res = await fetch(`${getApiUrl()}/layanan/slug/${slug}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Layanan tidak ditemukan");
    return res.json();
}

export async function getAllLayanan(): Promise<Layanan[]> {
    const token = getToken();
    const res = await fetch(`${getApiUrl()}/layanan`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Gagal mengambil daftar layanan");
    return res.json();
}