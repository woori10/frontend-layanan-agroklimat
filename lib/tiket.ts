const API_URL = "http://localhost:3000";

function getToken(): string | null {
    return localStorage.getItem("agro_token");
}

export async function getTiketByLayanan(layananId: number) {
    const token = getToken();
    const res = await fetch(`${API_URL}/tiket/admin?layanan_id=${layananId}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Gagal mengambil data tiket");
    return res.json();
}

export async function getTiketDetail(tiketId: number) {
    const token = getToken();
    const res = await fetch(`${API_URL}/tiket/admin/${tiketId}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Gagal mengambil detail tiket");
    return res.json();
}

export async function verifikasiTiket(
    tiketId: number,
    data: { aksi: "disetujui" | "perlu_revisi" | "ditolak"; catatan?: string; unit_teknis_id?: number }
) {
    const token = getToken();
    const res = await fetch(`${API_URL}/tiket/${tiketId}/verifikasi`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || "Gagal memverifikasi tiket");
    return result;
}

export async function getUnitTeknisList() {
    const token = getToken();
    const res = await fetch(`${API_URL}/unit-teknis`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Gagal mengambil unit teknis");
    return res.json();
}

export async function getUserTikets() {
    const token = getToken();
    const res = await fetch(`${API_URL}/tiket`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Gagal mengambil data tiket saya");
    return res.json();
}

export async function getUserTiketDetail(identifier: string) {
    const token = getToken();
    const res = await fetch(`${API_URL}/tiket/${identifier}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Gagal mengambil detail tiket saya");
    return res.json();
}

export async function getUnitTeknisTikets(status?: string) {
    const token = getToken();
    const url = status ? `${API_URL}/tiket/unit-teknis/me?status=${status}` : `${API_URL}/tiket/unit-teknis/me`;
    const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Gagal mengambil data tiket unit teknis");
    return res.json();
}

export async function mulaiProsesTiket(tiketId: number, jumlahSatuan?: number) {
    const token = getToken();
    const res = await fetch(`${API_URL}/tiket/${tiketId}/proses`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ jumlah_satuan: jumlahSatuan }),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || "Gagal mulai memproses tiket");
    return result;
}

export async function selesaiProsesTiket(tiketId: number) {
    const token = getToken();
    const res = await fetch(`${API_URL}/tiket/${tiketId}/selesai`, {
        method: "PATCH",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || "Gagal menyelesaikan proses tiket");
    return result;
}

export async function konfirmasiPembayaranTiket(tiketId: number) {
    const token = getToken();
    const res = await fetch(`${API_URL}/tiket/${tiketId}/konfirmasi-pembayaran`, {
        method: "PATCH",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || "Gagal mengonfirmasi pembayaran tiket");
    return result;
}

export async function setujuiOlehKepalaBalai(tiketId: number) {
    const token = getToken();
    const res = await fetch(`${API_URL}/tiket/${tiketId}/setujui-kepala`, {
        method: "PATCH",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || "Gagal menyetujui tiket oleh Kepala Balai");
    return result;
}

export async function uploadLaporanHasil(tiketId: number, file: File) {
    const token = getToken();
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${API_URL}/tiket/${tiketId}/dokumen/laporan-hasil`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: formData,
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || "Gagal mengunggah berita acara");
    return result;
}