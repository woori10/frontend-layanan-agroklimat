"use client";

import { useEffect, use } from "react";
import { useRouter } from "next/navigation";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function EditUserRedirectPage({ params }: PageProps) {
    const resolvedParams = use(params);
    const userId = resolvedParams.id;
    const router = useRouter();

    useEffect(() => {
        if (userId) {
            router.replace(`/kelola-user/pegawai/tambah?id=${userId}`);
        }
    }, [router, userId]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-secondary-green-color border-t-transparent" />
        </div>
    );
}
