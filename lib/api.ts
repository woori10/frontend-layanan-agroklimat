export function getApiUrl(): string {
    if (typeof window !== "undefined") {
        return "/api-backend";
    }
    return process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3000";
}

export default getApiUrl;

