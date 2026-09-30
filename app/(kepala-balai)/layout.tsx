import RoleGuard from "@/components/auth/RoleGuard";

export default function KepalaBalaiLayout({ children }: { children: React.ReactNode }) {
  return <RoleGuard allowedRoles={["kepala_balai", "super_admin"]}>{children}</RoleGuard>;
}
