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
    Receipt,
    History,
    ClipboardCheck,
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
                { label: "Agroedukasi dan Kunjungan Edukasi", href: "/dashboard/layanan/layanan-agroedukasi" },
                { label: "Layanan Mess", href: "/dashboard/layanan/layanan-mess" },
            ],
        },
        { label: "Profil", href: "/profil", icon: User },
    ],

    admin: [
        { label: "Dashboard", href: "/dashboard-admin", icon: LayoutDashboard },
        {
            label: "Verifikasi Layanan",
            icon: FileCheck,
            subItems: [
                { label: "Siap Tanam", href: "/verifikasi-layanan/1" },
                { label: "Rekomendasi dan Penilaian SNI", href: "/verifikasi-layanan/2" },
                { label: "Permohonan Data dan Alat", href: "/verifikasi-layanan/3" },
                { label: "Konsultasi dan Rekomendasi", href: "/verifikasi-layanan/4" },
                { label: "Bimbingan dan Teknis Narasumber", href: "/verifikasi-layanan/5" },
                { label: "Magang Teknis PKL", href: "/verifikasi-layanan/6" },
                { label: "Agroedukasi dan Kunjungan Edukasi", href: "/verifikasi-layanan/8" },
                { label: "Layanan Mess", href: "/verifikasi-layanan/9" },
            ],
        },
        {
            label: "Tagihan",
            href: "/tagihan",
            icon: Receipt,
            subItems: [
                { label: "Permohonan Data dan Alat", href: "/tagihan/3" },
                { label: "Layanan Mess", href: "/tagihan/9" },
            ],
        },
        { label: "Profil", href: "/profil", icon: User },
    ],

    pegawai: [
        { label: "Dashboard", href: "/dashboard-pegawai", icon: LayoutDashboard },
        { label: "Layanan", href: "/layanan", icon: ClipboardList },
        { label: "Profil", href: "/profil", icon: User },
    ],

    super_admin: [
        { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { label: "Kelola User", href: "/kelola-user", icon: Users },
        { label: "Kelola Layanan", href: "/kelola-layanan", icon: Settings },
        { label: "Kelola Tagihan", href: "/kelola-tagihan", icon: Receipt },
        { label: "Audit Log", href: "/audit-log", icon: History },
        { label: "Profil", href: "/profil", icon: User },
    ],

    kepala_balai: [
        { label: "Dashboard", href: "/dashboard-kepala-balai", icon: LayoutDashboard },
        {
            label: "Persetujuan",
            href: "/dashboard-kepala-balai/layanan",
            icon: ClipboardCheck,
            subItems: [
                { label: "Bimbingan dan Teknis Narasumber", href: "/persetujuan-layanan/5" },
                { label: "Magang Teknis PKL", href: "/persetujuan-layanan/6" },
                { label: "Agroedukasi dan Kunjungan Edukasi", href: "/persetujuan-layanan/8" },
            ],
        },
        { label: "Audit Log", href: "/audit-log", icon: History },
        { label: "Profil", href: "/profil", icon: User },
    ],
};