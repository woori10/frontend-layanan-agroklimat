import RoleGuard from "@/components/auth/RoleGuard";

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  return <RoleGuard allowedRoles={["super_admin"]}>{children}</RoleGuard>;
}
