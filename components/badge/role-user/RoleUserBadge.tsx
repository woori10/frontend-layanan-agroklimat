"use client";

interface RoleUserBadgeProps {
  role: string;
  className?: string;
}

const getRoleBadgeClass = (role: string) => {
  switch (role) {
    case "super_admin":
      return "bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-450 border border-rose-500/20";
    case "admin":
      return "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-450 border border-blue-500/20";
    case "kepala_balai":
      return "bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-450 border border-purple-500/20";
    case "pegawai":
      return "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-450 border border-amber-500/20";
    default:
      return "bg-zinc-50 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 border border-zinc-500/20";
  }
};

const formatRole = (role: string) => {
  if (!role) return "";
  return role
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export default function RoleUserBadge({ role, className = "" }: RoleUserBadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${getRoleBadgeClass(role)} ${className}`}>
      {formatRole(role)}
    </span>
  );
}
