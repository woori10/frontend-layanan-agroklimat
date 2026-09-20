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
    HelpCircle,
    Wrench,
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

export const layananByUnitTeknis: Record<number, SubMenuItem[]> = {
    1: [
        { label: "Rekomendasi & Penilaian SNI", href: "/penugasan-layanan/rekomendasi-sni" },
        { label: "Konsultasi Rekomendasi SNI", href: "/penugasan-layanan/konsultasi-rekomendasi" },
        { label: "Permohonan Data", href: "/penugasan-layanan/permohonan-data" },
    ],
    2: [
        { label: "Peminjaman Alat", href: "/penugasan-layanan/peminjaman-alat" },
    ],
    3: [
        { label: "Bimbingan Teknis & Narasumber", href: "/penugasan-layanan/bimbingan-teknis" },
        { label: "Magang Teknis / PKL", href: "/penugasan-layanan/magang-pkl" },
        { label: "Agroedukasi / Kunjungan Edukasi", href: "/penugasan-layanan/agroedukasi" },
        { label: "Layanan Perpustakaan", href: "/penugasan-layanan/layanan-perpustakaan" },
    ],
    4: [
        { label: "Rekomendasi Siap Tanam", href: "/penugasan-layanan/rekomendasi-siap-tanam" },
    ],
    5: [
        { label: "Layanan Mess", href: "/penugasan-layanan/layanan-mess" },
    ],
};

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
        { label: "Profil", href: "/profile", icon: User },
    ],

    admin: [
        { label: "Dashboard", href: "/dashboard-admin", icon: LayoutDashboard },
        {
            label: "Verifikasi Layanan",
            icon: FileCheck,
            subItems: [
                { label: "Rekomendasi Siap Tanam", href: "/verifikasi-layanan/rekomendasi-siap-tanam" },
                { label: "Rekomendasi & Penilaian SNI", href: "/verifikasi-layanan/rekomendasi-sni" },
                { label: "Konsultasi Rekomendasi SNI", href: "/verifikasi-layanan/konsultasi-rekomendasi" },
                { label: "Bimbingan Teknis & Narasumber", href: "/verifikasi-layanan/bimbingan-teknis" },
                { label: "Magang Teknis / PKL", href: "/verifikasi-layanan/magang-pkl" },
                { label: "Layanan Perpustakaan", href: "/verifikasi-layanan/layanan-perpustakaan" },
                { label: "Agroedukasi / Kunjungan Edukasi", href: "/verifikasi-layanan/agroedukasi" },
                { label: "Permohonan Data", href: "/verifikasi-layanan/permohonan-data" },
                { label: "Peminjaman Alat", href: "/verifikasi-layanan/peminjaman-alat" },
                { label: "Layanan Mess", href: "/verifikasi-layanan/layanan-mess" },
            ],
        },
        { label: "Tagihan", href: "/tagihan", icon: Receipt },
        { label: "Profil", href: "/profile", icon: User },
    ],

    pegawai: [
        { label: "Dashboard", href: "/dashboard-pegawai", icon: LayoutDashboard },
        {
            label: "Penugasan Layanan",
            icon: ClipboardList,
            subItems: [],
        },
        { label: "Profil", href: "/profile", icon: User },
    ],

    super_admin: [
        { label: "Dashboard", href: "/dashboard-super-admin", icon: LayoutDashboard },
        {
            label: "Kelola User",
            icon: Users,
            subItems: [
                { label: "Pegawai", href: "/kelola-user/pegawai" },
                { label: "Publik", href: "/kelola-user/publik" },
            ],
        },
        { label: "Kelola Layanan", href: "/kelola-layanan", icon: Settings },
        { label: "Kelola Tagihan", href: "/kelola-tagihan", icon: Receipt },
        { label: "Kelola FAQ", href: "/kelola-faq", icon: HelpCircle },

        { label: "Audit Log", href: "/audit-log", icon: History },
        { label: "Profil", href: "/profile", icon: User },
    ],

    kepala_balai: [
        { label: "Dashboard", href: "/dashboard-kepala-balai", icon: LayoutDashboard },
        {
            label: "Persetujuan Layanan",
            icon: ClipboardCheck,
            subItems: [
                { label: "Rekomendasi Siap Tanam", href: "/persetujuan-layanan/rekomendasi-siap-tanam" },
                { label: "Rekomendasi & Penilaian SNI", href: "/persetujuan-layanan/rekomendasi-sni" },
                { label: "Konsultasi Rekomendasi SNI", href: "/persetujuan-layanan/konsultasi-rekomendasi" },
                { label: "Bimbingan Teknis & Narasumber", href: "/persetujuan-layanan/bimbingan-teknis" },
                { label: "Magang Teknis / PKL", href: "/persetujuan-layanan/magang-pkl" },
                { label: "Layanan Perpustakaan", href: "/persetujuan-layanan/layanan-perpustakaan" },
                { label: "Agroedukasi / Kunjungan Edukasi", href: "/persetujuan-layanan/agroedukasi" },
                { label: "Permohonan Data", href: "/persetujuan-layanan/permohonan-data" },
                { label: "Peminjaman Alat", href: "/persetujuan-layanan/peminjaman-alat" },
                { label: "Layanan Mess", href: "/persetujuan-layanan/layanan-mess" },
            ],
        },
        { label: "Audit Log", href: "/audit-log", icon: History },
        { label: "Profil", href: "/profile", icon: User },
    ],
};