"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { getUserFromToken } from "@/lib/auth";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

export default function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const rolesString = useMemo(() => allowedRoles.join(","), [allowedRoles]);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("agro_token") : null;
    if (!token) {
      router.replace("/login");
      return;
    }

    const user = getUserFromToken();
    if (!user || !allowedRoles.includes(user.role)) {
      router.replace("/login");
      return;
    }

    setAuthorized(true);
  }, [router, rolesString, allowedRoles]);

  if (!authorized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--green-color)] dark:border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
