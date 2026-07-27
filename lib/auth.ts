const API_URL = "http://localhost:3000";

export interface JwtPayload {
    sub: number;
    email: string | null;
    role: string;
    nama: string;
    unit_teknis_id?: number | null;
    iat: number;
    exp: number;
}

export interface RegisterPayload {
    email: string;
    password: string;
    nama: string;
    no_hp: string;
    unit_teknis_id?: number;
}

export interface LoginPayload {
    email: string;
    password: string;
}

export interface LoginStaffPayload {
    nip: string;
    password: string;
}

interface AuthResponse {
    access_token: string;
}

// ── Helper: ambil pesan error dari response API ──
function extractErrorMessage(data: any, fallback: string): string {
    if (data?.message) {
        return Array.isArray(data.message) ? data.message.join(", ") : data.message;
    }
    return fallback;
}

// ── Register (pengguna publik) ──
export async function registerUser(payload: RegisterPayload): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(extractErrorMessage(data, "Registrasi gagal!"));
    }

    return data;
}

// ── Login pengguna publik (pakai email) ──
export async function loginUser(payload: LoginPayload): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(extractErrorMessage(data, "Login gagal!"));
    }

    return data;
}

// ── Login staff/pegawai (pakai NIP) ──
export async function loginStaff(payload: LoginStaffPayload): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/auth/login/pegawai`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(extractErrorMessage(data, "Login gagal!"));
    }

    return data;
}

// ── Simpan token & data user ke localStorage ──
export function saveAuthSession(token: string, identifier: string, type: "email" | "nip") {
    localStorage.setItem("agro_token", token);
    if (type === "email") {
        localStorage.setItem("agro_user_email", identifier);
    } else {
        localStorage.setItem("agro_user_nip", identifier);
    }
}

// ── Baca payload JWT dari localStorage ──
export function getUserFromToken(): JwtPayload | null {
    if (typeof window === "undefined") return null;

    const token = localStorage.getItem("agro_token");
    if (!token) return null;

    try {
        const payloadBase64 = token.split(".")[1];
        const decoded = JSON.parse(atob(payloadBase64));
        return decoded as JwtPayload;
    } catch (err) {
        console.error("[Auth] Gagal decode token:", err);
        return null;
    }
}

// ── Tentukan halaman tujuan berdasarkan role ──
export function getRedirectPath(role: string): string {
    switch (role) {
        case "super_admin":
            return "/dashboard-super-admin";
        case "admin":
            return "/dashboard-admin";
        case "publik":
            return "/";
        case "pegawai":
            return "/dashboard-pegawai";
        case "kepala_balai":
            return "/dashboard-kepala-balai";
        default:
            return "/";
    }
}

// ── Logout ──
export function logout(router: { push: (path: string) => void }) {
    const user = getUserFromToken();
    const role = user?.role;

    localStorage.removeItem("agro_token");
    localStorage.removeItem("agro_user_email");
    localStorage.removeItem("agro_user_nip");

    if (role && ["super_admin", "admin", "kepala_balai", "pegawai"].includes(role)) {
        router.push("/login/pegawai");
    } else {
        router.push("/login");
    }
}