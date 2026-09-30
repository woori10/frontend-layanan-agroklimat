import RoleGuard from "@/components/auth/RoleGuard";

export default function PegawaiLayout({ children }: { children: React.ReactNode }) {
  return <RoleGuard allowedRoles={["pegawai", "super_admin"]}>{children}</RoleGuard>;
}
