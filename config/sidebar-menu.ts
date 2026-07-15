import {
    LayoutDashboard,
    ClipboardList,
    User,
    Users,
    FileCheck,
    Settings,
    Sprout,
    ShieldCheck,
    Database,
    MessageSquare,
    GraduationCap,
    Briefcase,
    BookOpen,
    Compass,
    Bed,
    type LucideIcon,
} from "lucide-react";

export interface SubMenuItem {
    label: string;
    href: string;
    icon?: LucideIcon;
}

export interface MenuItem {
    label: string;
    href?: string;
    icon: LucideIcon;
    subItems?: SubMenuItem[];
}

export const sidebarMenuByRole: Record<string, MenuItem[]> = {
    pengguna: [
        { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        {
            label: "Layanan",
            icon: Briefcase,
            subItems: [
                { label: "Siap Tanam", href: "/dashboard/layanan/layanan-siap-tanam" },
                { label: "Rekomendasi dan Penilaian SNI", href: "/dashboard/layanan/layanan-rekomendasi" },
                { label: "Permohonan Data  dan Alat", href: "/dashboard/layanan/layanan-permohonan" },
                { label: "Konsultasi dan Rekomendasi", href: "/dashboard/layanan/layanan-konsultasi" },
                { label: "Bimbingan dan Teknis Narasumber", href: "/dashboard/layanan/layanan-bimbingan" },
                { label: "Magang Teknis PKL", href: "/dashboard/layanan/layanan-magang" },
                { label: "Layanan Perpustakaan", href: "/dashboard/layanan/layanan-perpustakaan" },
                { label: "Agroedukasi dan Kunjungan Edukasi", href: "/dashboard/layanan/layanan-agroedukasi" },
                { label: "Layanan Mess", href: "/dashboard/layanan/layanan-mess" },
            ],
        },
        { label: "Profil", href: "/dashboard/profil", icon: User },
    ],

    admin: [
        { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { label: "Verifikasi Tiket", href: "/dashboard/verifikasi", icon: FileCheck },
        { label: "Profil", href: "/dashboard/profil", icon: User },
    ],

    pegawai: [
        { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { label: "Tiket Unit Saya", href: "/dashboard/tiket-unit", icon: ClipboardList },
        { label: "Profil", href: "/dashboard/profil", icon: User },
    ],

    super_admin: [
        { label: "Dashboard", href: "/dashboard-admin", icon: LayoutDashboard },
        { label: "Kelola User", href: "/kelola-user", icon: Users },
        { label: "Kelola Layanan", href: "/kelola-layanan", icon: Settings },
        { label: "Profil", href: "/profil", icon: User },
    ],

    kepala_balai: [
        { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { label: "Profil", href: "/dashboard/profil", icon: User },
    ],

    petugas_pengaduan: [
        { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { label: "Profil", href: "/dashboard/profil", icon: User },
    ],
};