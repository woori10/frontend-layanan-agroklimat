"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SessionWatcher() {
    const router = useRouter();

    useEffect(() => {
        const currentSessionId = process.env.NEXT_PUBLIC_SERVER_SESSION_ID;
        if (!currentSessionId) return;

        const storedSessionId = localStorage.getItem("agro_session_id");

        if (storedSessionId && storedSessionId !== currentSessionId) {
            console.log("Dev server restarted! Auto logging out...");
            localStorage.clear();
            localStorage.setItem("agro_session_id", currentSessionId);
            router.push("/login");
            window.location.reload();
        } else if (!storedSessionId) {
            localStorage.setItem("agro_session_id", currentSessionId);
        }
    }, [router]);

    return null;
}
