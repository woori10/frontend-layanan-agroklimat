import RoleGuard from "@/components/auth/RoleGuard";

export default function AuditLogLayout({ children }: { children: React.ReactNode }) {
  return <RoleGuard allowedRoles={["super_admin", "kepala_balai"]}>{children}</RoleGuard>;
}
