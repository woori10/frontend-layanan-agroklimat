"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function KelolaUserRedirect() {
    const router = useRouter();
    useEffect(() => {
        router.replace("/kelola-user/pegawai");
    }, [router]);
    return null;
}
