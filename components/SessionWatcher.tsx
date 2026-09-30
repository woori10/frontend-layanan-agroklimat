"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function SessionWatcher() {
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const currentSessionId = process.env.NEXT_PUBLIC_SERVER_SESSION_ID;
        if (!currentSessionId) return;

        const storedSessionId = localStorage.getItem("agro_session_id");

        if (storedSessionId && storedSessionId !== currentSessionId) {
            localStorage.clear();
            localStorage.setItem("agro_session_id", currentSessionId);
            if (pathname && !pathname.startsWith("/login") && !pathname.startsWith("/register")) {
                router.push("/login");
            }
        } else if (!storedSessionId) {
            localStorage.setItem("agro_session_id", currentSessionId);
        }
    }, [router, pathname]);

    return null;
}
