import RoleGuard from "@/components/auth/RoleGuard";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <RoleGuard allowedRoles={["admin", "super_admin"]}>{children}</RoleGuard>;
}
