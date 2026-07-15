export interface JwtPayload {
    sub: number;
    email: string | null;
    role: string;
    nama: string;
    iat: number;
    exp: number;
}

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

export function logout(router: { push: (path: string) => void }) {
    localStorage.removeItem("agro_token");
    localStorage.removeItem("agro_user_email");
    router.push("/login");
}