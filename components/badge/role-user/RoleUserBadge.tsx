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
      return "bg-sky-50 text-sky-700 dark:bg-sky-950/30 dark:text-sky-450 border border-sky-500/20";
    case "kepala_balai":
      return "bg-violet-50 text-violet-700 dark:bg-violet-950/30 dark:text-violet-450 border border-violet-500/20";
    case "pegawai":
      return "bg-orange-50 text-orange-700 dark:bg-orange-950/30 dark:text-orange-450 border border-orange-500/20";
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
