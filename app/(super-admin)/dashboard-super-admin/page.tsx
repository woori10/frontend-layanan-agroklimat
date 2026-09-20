"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/sidebar/Sidebar";
import AppBar from "@/components/appbar/AppBar";
import { getUserFromToken, getRedirectPath } from "@/lib/auth";
import RoleUserBadge from "@/components/badge/role-user/RoleUserBadge";
import StatusLayananBadge from "@/components/badge/status-layanan/StatusLayananBadge";
import CardDashboard from "@/components/card/card-dashboard/CardDashboard";
import { MoreVertical, TrendingUp, ChevronLeft, ChevronRight, History, ChevronDown, FileText, Inbox, Users, Layers } from "lucide-react";
import Link from "next/link";
import { getApiUrl } from "@/lib/api";

interface Tiket {
    id: number;
    no_tiket: string;
    status: string;
    createdAt: string;
    layanan?: { id: number; nama_layanan: string; slug?: string };
    user?: { id: number; nama: string; role: string; email?: string };
    unit_teknis?: { id: number; nama: string };
    jawaban_form?: { nama_lengkap?: string };
}

interface UserItem {
    id: number;
    nama: string;
    role: string;
    status_akun: string;
    createdAt: string;
}

interface LayananItem {
    id: number;
    nama_layanan: string;
    slug: string;
    is_active: boolean;
    createdAt?: string;
}

interface LayananStat { id: number; nama: string; jumlah: number; }

interface DayInfo {
    date: Date;
    dayName: string;
    fullDayName: string;
    dateNumber: number;
    formattedDate: string;
    isCurrentMonth: boolean;
}

interface WeekInfo {
    weekNumber: number;
    label: string;
    days: DayInfo[];
}

const DAY_LABELS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const FULL_DAY_NAMES = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const MONTH_NAMES = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];
const SHORT_MONTH_NAMES = [
    "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
    "Jul", "Agu", "Sep", "Okt", "Nov", "Des"
];

function getWeeksInMonth(year: number, month: number): WeekInfo[] {
    const firstOfMonth = new Date(year, month, 1);
    const lastOfMonth = new Date(year, month + 1, 0);
    const firstDayOfWeek = firstOfMonth.getDay(); // 0 = Sunday

    const weeks: WeekInfo[] = [];
    const currentSunday = new Date(year, month, 1 - firstDayOfWeek);
    currentSunday.setHours(0, 0, 0, 0);

    let weekNum = 1;
    while (true) {
        const weekDays: DayInfo[] = [];
        let hasDayInMonth = false;
        let startInMonthDate: number | null = null;
        let endInMonthDate: number | null = null;

        for (let i = 0; i < 7; i++) {
            const d = new Date(currentSunday);
            d.setDate(currentSunday.getDate() + (weekNum - 1) * 7 + i);
            const isCurrentMonth = d.getMonth() === month && d.getFullYear() === year;

            if (isCurrentMonth) {
                hasDayInMonth = true;
                if (startInMonthDate === null) startInMonthDate = d.getDate();
                endInMonthDate = d.getDate();
            }

            weekDays.push({
                date: d,
                dayName: DAY_LABELS[i],
                fullDayName: FULL_DAY_NAMES[i],
                dateNumber: d.getDate(),
                formattedDate: `${d.getDate()} ${SHORT_MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`,
                isCurrentMonth,
            });
        }

        if (!hasDayInMonth) {
            break;
        }

        const label =
            startInMonthDate === endInMonthDate
                ? `Minggu ${weekNum} (${startInMonthDate} ${SHORT_MONTH_NAMES[month]})`
                : `Minggu ${weekNum} (${startInMonthDate} - ${endInMonthDate} ${SHORT_MONTH_NAMES[month]})`;

        weeks.push({
            weekNumber: weekNum,
            label,
            days: weekDays,
        });

        const saturday = weekDays[6].date;
        if (saturday >= lastOfMonth) {
            break;
        }

        weekNum++;
        if (weekNum > 6) break;
    }

    return weeks;
}

function timeAgo(dateStr: string): string {
    const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
    if (diff < 60) return `${Math.floor(diff)} detik lalu`;
    if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} hari lalu`;
    return new Date(dateStr).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

function getRoleLabel(role: string): string {
    const map: Record<string, string> = {
        super_admin: "Super Admin", admin: "Admin",
        kepala_balai: "Kepala Balai", pegawai: "Pegawai", publik: "Publik",
    };
    return map[role] || role;
}

function getAktivitasLabel(status: string): string {
    const map: Record<string, string> = {
        menunggu_verifikasi: "Ajukan permohonan",
        diproses: "Diproses",
        menunggu_pembayaran: "Menunggu pembayaran",
        menunggu_konfirmasi: "Menyetujui...",
        selesai: "Memberikan data",
        ditolak: "Menolak permohonan",
    };
    return map[status] || "Memverifikasi";
}

function AreaChart({
    data,
    dayLabels,
    dayDates,
    activeDay,
    onSelectDay,
}: {
    data: number[];
    dayLabels: string[];
    dayDates: DayInfo[];
    activeDay: number;
    onSelectDay: (index: number) => void;
}) {
    const W = 560; const H = 200;
    const PAD_L = 36; const PAD_R = 24; const PAD_T = 24; const PAD_B = 38;
    const chartW = W - PAD_L - PAD_R; const chartH = H - PAD_T - PAD_B;
    const rawMax = Math.max(...data, 0);
    const maxVal = rawMax <= 4 ? 4 : Math.ceil(rawMax / 4) * 4;
    const steps = 4;
    const yLabels = Array.from({ length: steps + 1 }, (_, i) => Math.round((maxVal / steps) * (steps - i)));

    const safeActiveDay = Math.max(0, Math.min(6, activeDay));

    const points = data.map((v, i) => ({
        x: PAD_L + (i / (data.length - 1)) * chartW,
        y: PAD_T + (1 - v / maxVal) * chartH,
        v,
    }));

    const lineD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
    const areaD = `${lineD} L ${points[points.length - 1].x} ${PAD_T + chartH} L ${PAD_L} ${PAD_T + chartH} Z`;
    const colW = chartW / 7;

    return (
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full select-none" style={{ overflow: "visible" }}>
            <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--secondary-green-color)" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="var(--secondary-green-color)" stopOpacity="0.05" />
                </linearGradient>
            </defs>
            {yLabels.map((label, i) => {
                const y = PAD_T + (i / steps) * chartH;
                return (
                    <g key={i}>
                        <line x1={PAD_L} y1={y} x2={W - PAD_R} y2={y} stroke="#e4e4e7" strokeWidth="1" strokeDasharray="4 3" />
                        <text x={PAD_L - 6} y={y + 4} textAnchor="end" fontSize="9" fill="#a1a1aa">{label}</text>
                    </g>
                );
            })}
            <path d={areaD} fill="url(#areaGrad)" />
            <path d={lineD} fill="none" stroke="var(--green-color)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />

            {/* Clickable Column Zones */}
            {points.map((p, i) => (
                <rect
                    key={`col-${i}`}
                    x={p.x - colW / 2}
                    y={PAD_T}
                    width={colW}
                    height={chartH + PAD_B}
                    fill="transparent"
                    className="cursor-pointer"
                    onClick={() => onSelectDay(i)}
                >
                    <title>{`${dayDates[i]?.fullDayName || dayLabels[i]}, ${dayDates[i]?.formattedDate || ""}: ${p.v} permohonan`}</title>
                </rect>
            ))}

            {/* Points & Labels */}
            {points.map((p, i) => {
                const isActive = i === safeActiveDay;
                const isOutOfMonth = dayDates[i] && !dayDates[i].isCurrentMonth;
                const dayDateNum = dayDates[i]?.dateNumber;

                // Tooltip positioning
                const tooltipW = 92;
                const tooltipH = 34;
                let tooltipX = p.x - tooltipW / 2;
                if (tooltipX < PAD_L - 10) tooltipX = PAD_L - 10;
                if (tooltipX + tooltipW > W - PAD_R + 10) tooltipX = W - PAD_R + 10 - tooltipW;
                let tooltipY = p.y - tooltipH - 8;
                if (tooltipY < 0) tooltipY = p.y + 10;

                return (
                    <g key={i} className="cursor-pointer" onClick={() => onSelectDay(i)}>
                        {/* Day Label on X Axis */}
                        <text
                            x={p.x}
                            y={H - 18}
                            textAnchor="middle"
                            fontSize="10"
                            fill={isActive ? "var(--green-color)" : isOutOfMonth ? "#d4d4d8" : "#71717a"}
                            fontWeight={isActive ? "700" : "500"}
                        >
                            {dayLabels[i]}
                        </text>
                        {/* Date Number below Day Label */}
                        {dayDateNum && (
                            <text
                                x={p.x}
                                y={H - 6}
                                textAnchor="middle"
                                fontSize="9"
                                fill={isActive ? "var(--green-color)" : isOutOfMonth ? "#d4d4d8" : "#a1a1aa"}
                                fontWeight={isActive ? "700" : "400"}
                            >
                                {dayDateNum}
                            </text>
                        )}

                        {/* Point Circle */}
                        <circle
                            cx={p.x}
                            cy={p.y}
                            r={isActive ? 5 : 3.5}
                            fill={isActive ? "white" : "var(--green-color)"}
                            stroke="var(--green-color)"
                            strokeWidth={isActive ? 2.5 : 1.5}
                            className="transition-all duration-150"
                        />

                        {/* Active Indicator & Tooltip */}
                        {isActive && (
                            <g pointerEvents="none">
                                <line
                                    x1={p.x}
                                    y1={PAD_T}
                                    x2={p.x}
                                    y2={PAD_T + chartH}
                                    stroke="var(--green-color)"
                                    strokeWidth="1.5"
                                    strokeDasharray="4 3"
                                    opacity="0.6"
                                />
                                <rect
                                    x={tooltipX}
                                    y={tooltipY}
                                    width={tooltipW}
                                    height={tooltipH}
                                    rx="8"
                                    fill="white"
                                    stroke="#e4e4e7"
                                    strokeWidth="1"
                                    filter="drop-shadow(0 4px 6px rgba(0,0,0,0.08))"
                                />
                                <text
                                    x={tooltipX + tooltipW / 2}
                                    y={tooltipY + 14}
                                    textAnchor="middle"
                                    fontSize="9"
                                    fill="#71717a"
                                    fontWeight="500"
                                >
                                    {dayDates[i]?.dayName || dayLabels[i]}, {dayDates[i]?.dateNumber} {SHORT_MONTH_NAMES[dayDates[i]?.date.getMonth() ?? 0]}
                                </text>
                                <text
                                    x={tooltipX + tooltipW / 2}
                                    y={tooltipY + 27}
                                    textAnchor="middle"
                                    fontSize="11"
                                    fontWeight="700"
                                    fill="#18181b"
                                >
                                    {p.v} Tiket
                                </text>
                            </g>
                        )}
                    </g>
                );
            })}
        </svg>
    );
}

export default function DashboardSuperAdminPage() {
    const router = useRouter();
    const [userRole, setUserRole] = useState("Super Admin");
    const [mounted, setMounted] = useState(false);
    const [tikets, setTikets] = useState<Tiket[]>([]);
    const [users, setUsers] = useState<UserItem[]>([]);
    const [layananList, setLayananList] = useState<LayananItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [loadingLayanan, setLoadingLayanan] = useState(true);

    const now = new Date();
    const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear());
    const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth());
    const [selectedWeek, setSelectedWeek] = useState<number>(0);
    const [selectedDay, setSelectedDay] = useState<number>(now.getDay());

    useEffect(() => {
        setMounted(true);
        const token = localStorage.getItem("agro_token");
        if (!token) { router.push("/login"); return; }
        const user = getUserFromToken();
        if (user) {
            if (user.role !== "super_admin") { router.push(getRedirectPath(user.role)); return; }
            const roleMap: Record<string, string> = { super_admin: "Super Admin", admin: "Admin", kepala_balai: "Kepala Balai", pegawai: "Pegawai" };
            setUserRole(roleMap[user.role] || user.role);
        }
    }, [router]);

    useEffect(() => {
        if (!mounted) return;
        const token = localStorage.getItem("agro_token");
        if (!token) return;

        // Fetch Tikets
        fetch(`${getApiUrl()}/tiket/admin`, { headers: { Authorization: `Bearer ${token}` } })
            .then((r) => r.ok ? r.json() : [])
            .then((data) => setTikets(Array.isArray(data) ? data : []))
            .catch(() => setTikets([]))
            .finally(() => setLoading(false));

        // Fetch Users
        fetch(`${getApiUrl()}/users`, { headers: { Authorization: `Bearer ${token}` } })
            .then((r) => r.ok ? r.json() : [])
            .then((data) => setUsers(Array.isArray(data) ? data : []))
            .catch(() => setUsers([]))
            .finally(() => setLoadingUsers(false));

        // Fetch Layanan
        fetch(`${getApiUrl()}/layanan/admin`, { headers: { Authorization: `Bearer ${token}` } })
            .then((r) => r.ok ? r.json() : [])
            .then((data) => setLayananList(Array.isArray(data) ? data : []))
            .catch(() => setLayananList([]))
            .finally(() => setLoadingLayanan(false));
    }, [mounted]);

    const availableYears = useMemo(() => {
        const currentYear = new Date().getFullYear();
        const set = new Set<number>([currentYear]);
        tikets.forEach((t) => {
            if (t.createdAt) {
                const y = new Date(t.createdAt).getFullYear();
                if (!isNaN(y)) set.add(y);
            }
        });
        return Array.from(set).sort((a, b) => b - a);
    }, [tikets]);

    const weeksInMonth = useMemo(() => {
        return getWeeksInMonth(selectedYear, selectedMonth);
    }, [selectedYear, selectedMonth]);

    // Set initial week to current week containing today if viewing current year & month
    useEffect(() => {
        const today = new Date();
        if (selectedYear === today.getFullYear() && selectedMonth === today.getMonth()) {
            const todayDate = today.getDate();
            const currentWeekIdx = weeksInMonth.findIndex((w) =>
                w.days.some((d) => d.isCurrentMonth && d.dateNumber === todayDate)
            );
            if (currentWeekIdx !== -1) {
                setSelectedWeek(currentWeekIdx);
                setSelectedDay(today.getDay());
                return;
            }
        }
        if (selectedWeek >= weeksInMonth.length) {
            setSelectedWeek(0);
        }
    }, [selectedYear, selectedMonth, weeksInMonth]);

    const currentWeek = weeksInMonth[selectedWeek] || weeksInMonth[0] || {
        weekNumber: 1,
        label: "Minggu 1",
        days: [],
    };

    const VERIFIED_STATUSES = useMemo(() => [
        "menunggu_persetujuan_kepala_balai",
        "menunggu_pembayaran",
        "diproses",
        "menunggu_konfirmasi",
        "selesai",
    ], []);

    const weekChartData = useMemo(() => {
        if (!currentWeek || !currentWeek.days) return [0, 0, 0, 0, 0, 0, 0];
        return currentWeek.days.map((day) => {
            return tikets.filter((t) => {
                if (!t.createdAt) return false;
                if (!VERIFIED_STATUSES.includes(t.status)) return false;

                const d = new Date(t.createdAt);
                return (
                    d.getFullYear() === day.date.getFullYear() &&
                    d.getMonth() === day.date.getMonth() &&
                    d.getDate() === day.date.getDate()
                );
            }).length;
        });
    }, [currentWeek, tikets, VERIFIED_STATUSES]);

    const totalWeeklyTickets = useMemo(() => {
        return weekChartData.reduce((acc, curr) => acc + curr, 0);
    }, [weekChartData]);

    const selectedDayInfo = currentWeek?.days?.[selectedDay];

    const selectedDayTikets = useMemo(() => {
        if (!selectedDayInfo) return [];
        return tikets.filter((t) => {
            if (!t.createdAt) return false;
            if (!VERIFIED_STATUSES.includes(t.status)) return false;

            const d = new Date(t.createdAt);
            return (
                d.getFullYear() === selectedDayInfo.date.getFullYear() &&
                d.getMonth() === selectedDayInfo.date.getMonth() &&
                d.getDate() === selectedDayInfo.date.getDate()
            );
        });
    }, [selectedDayInfo, tikets, VERIFIED_STATUSES]);

    const selectedDayLayananSummary = useMemo(() => {
        const map: Record<string, { nama: string; count: number; slug?: string }> = {};
        selectedDayTikets.forEach((t) => {
            const nama = t.layanan?.nama_layanan || "Layanan Lainnya";
            if (!map[nama]) {
                map[nama] = { nama, count: 0, slug: t.layanan?.slug };
            }
            map[nama].count++;
        });
        return Object.values(map).sort((a, b) => b.count - a.count);
    }, [selectedDayTikets]);

    const userStats = useMemo(() => {
        const total = users.length;
        const active = users.filter((u) => u.status_akun === "active").length;
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        const lastWeekTotal = users.filter((u) => {
            if (!u.createdAt) return true;
            return new Date(u.createdAt) < sevenDaysAgo;
        }).length;

        const diff = total - lastWeekTotal;
        let growthPct = 0;
        if (lastWeekTotal > 0) {
            growthPct = Number(((diff / lastWeekTotal) * 100).toFixed(1));
        } else if (total > 0) {
            growthPct = 100;
        }

        return {
            total,
            active,
            lastWeekTotal,
            growthPct: Math.abs(growthPct),
            isPositive: growthPct >= 0,
        };
    }, [users]);

    const layananStats = useMemo(() => {
        const total = layananList.length;
        const active = layananList.filter((l) => l.is_active !== false).length;
        const inactive = total - active;
        const pctActive = total > 0 ? Number(((active / total) * 100).toFixed(1)) : 0;

        return {
            total,
            active,
            inactive,
            pctActive,
        };
    }, [layananList]);

    const stats = useMemo(() => {
        const menunggu = tikets.filter((t) => ["menunggu_verifikasi", "diajukan"].includes(t.status)).length;
        const diproses = tikets.filter((t) => t.status === "diproses").length;
        const selesai = tikets.filter((t) => ["menunggu_konfirmasi", "selesai"].includes(t.status)).length;
        const layananMap: Record<number, LayananStat> = {};
        tikets.forEach((t) => {
            if (t.layanan) {
                const id = t.layanan.id;
                if (!layananMap[id]) layananMap[id] = { id, nama: t.layanan.nama_layanan, jumlah: 0 };
                layananMap[id].jumlah++;
            }
        });
        const topLayanan = Object.values(layananMap).sort((a, b) => b.jumlah - a.jumlah).slice(0, 5);
        const maxJumlah = topLayanan[0]?.jumlah || 1;
        const recent = [...tikets].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);
        return { menunggu, diproses, selesai, topLayanan, maxJumlah, recent };
    }, [tikets]);

    if (!mounted) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--secondary-green-color)] border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 overflow-hidden font-sans">
            <Sidebar />
            <div className="flex flex-col flex-1 overflow-y-auto">
                <AppBar onMenuClick={() => { }} />
                <main className="flex-1 p-6 space-y-6">

                    {/* Welcome Banner */}
                    <div className="relative overflow-hidden rounded-2xl p-6 md:p-10 text-white shadow-lg bg-cover bg-center min-h-[170px] flex flex-col justify-center" style={{ backgroundImage: "url('/images/kantor.webp')" }}>
                        <div className="absolute inset-0 z-0" style={{ background: "linear-gradient(to right, var(--green-color) 5%, rgba(36,78,43,0.82) 35%, rgba(36,78,43,0.35) 100%)" }} />
                        <div className="relative z-10 space-y-2">
                            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
                                Selamat Datang Kembali, <span className="text-[var(--yellow-color)]">{userRole}!</span>
                            </h1>
                            <p className="text-sm md:text-base text-white/80 leading-relaxed">Pantau performa layanan dan kelola aktivitas pengguna hari ini.</p>
                        </div>
                    </div>

                    {/* Stat Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <CardDashboard
                            title="Pengguna Terdaftar"
                            icon={Users}
                            iconBgClass="bg-green-700"
                            iconColorClass="text-white"
                            value={loadingUsers ? "..." : userStats.total}
                            desc="pengguna"
                        />
                        <CardDashboard
                            title="Layanan Aktif"
                            icon={Layers}
                            iconBgClass="bg-blue-400"
                            iconColorClass="text-white"
                            value={loadingLayanan ? "..." : layananStats.active}
                            desc="layanan"
                        />
                        <CardDashboard
                            title="Permohonan Layanan"
                            icon={FileText}
                            iconBgClass="bg-yellow-400"
                            iconColorClass="text-white"
                            value={loading ? "..." : tikets.length}
                            desc="permohonan"
                        />
                    </div>

                    {/* Chart + Top Layanan */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        {/* Area Chart */}
                        {/* Area Chart */}
                        <div className="lg:col-span-2 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 flex flex-col justify-between">
                            <div>
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                                    <div>
                                        <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">Tren Permohonan Layanan</p>
                                        <p className="text-xs text-zinc-400">Pilih bulan dan minggu untuk melihat tren harian</p>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        {/* Dropdown Tahun */}
                                        <div className="relative">
                                            <select
                                                value={selectedYear}
                                                onChange={(e) => {
                                                    setSelectedYear(Number(e.target.value));
                                                    setSelectedWeek(0);
                                                }}
                                                className="appearance-none rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 py-1.5 pl-3 pr-7 text-xs font-medium text-zinc-800 dark:text-zinc-200 outline-none transition focus:border-[var(--green-color)] cursor-pointer"
                                            >
                                                {availableYears.map((y) => (
                                                    <option key={y} value={y}>{y}</option>
                                                ))}
                                            </select>
                                            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
                                        </div>

                                        {/* Dropdown Bulan */}
                                        <div className="relative">
                                            <select
                                                value={selectedMonth}
                                                onChange={(e) => {
                                                    setSelectedMonth(Number(e.target.value));
                                                    setSelectedWeek(0);
                                                }}
                                                className="appearance-none rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 py-1.5 pl-3 pr-7 text-xs font-medium text-zinc-800 dark:text-zinc-200 outline-none transition focus:border-[var(--green-color)] cursor-pointer"
                                            >
                                                {MONTH_NAMES.map((name, idx) => (
                                                    <option key={idx} value={idx}>{name}</option>
                                                ))}
                                            </select>
                                            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
                                        </div>

                                        {/* Dropdown Minggu */}
                                        <div className="relative">
                                            <select
                                                value={selectedWeek}
                                                onChange={(e) => setSelectedWeek(Number(e.target.value))}
                                                className="appearance-none rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 py-1.5 pl-3 pr-7 text-xs font-medium text-zinc-800 dark:text-zinc-200 outline-none transition focus:border-[var(--green-color)] cursor-pointer"
                                            >
                                                {weeksInMonth.map((w, idx) => (
                                                    <option key={idx} value={idx}>{w.label}</option>
                                                ))}
                                            </select>
                                            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
                                        </div>
                                    </div>
                                </div>
                                <div className="h-52">
                                    {loading ? (
                                        <div className="flex h-full items-center justify-center text-xs text-zinc-400">Memuat data...</div>
                                    ) : (
                                        <AreaChart
                                            data={weekChartData}
                                            dayLabels={DAY_LABELS}
                                            dayDates={currentWeek?.days || []}
                                            activeDay={selectedDay}
                                            onSelectDay={(idx) => setSelectedDay(idx)}
                                        />
                                    )}
                                </div>
                            </div>

                            {/* Info Hari Terpilih di Bawah Grafik */}
                            <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-xs">
                                <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                                    <span className="inline-block h-2 w-2 rounded-full bg-[var(--green-color)]"></span>
                                    <span>
                                        Hari Terpilih:{" "}
                                        <strong className="text-zinc-800 dark:text-zinc-200">
                                            {currentWeek?.days[selectedDay]
                                                ? `${currentWeek.days[selectedDay].fullDayName}, ${currentWeek.days[selectedDay].formattedDate}`
                                                : "-"}
                                        </strong>
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-zinc-500">
                                        Total Minggu Ini:{" "}
                                        <strong className="text-zinc-800 dark:text-zinc-200">{totalWeeklyTickets}</strong>
                                    </span>
                                    <span className="rounded-full bg-[var(--secondary-green-color)]/30 px-2.5 py-0.5 font-bold text-[var(--green-color)]">
                                        {weekChartData[selectedDay] ?? 0} Permohonan
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Rincian Tiket Hari Terpilih */}
                        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 flex flex-col justify-between">
                            <div>
                                <div className="flex items-start justify-between gap-2 mb-3">
                                    <div>
                                        <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                                            Rincian Tiket Terpilih
                                        </p>
                                        <p className="text-xs text-zinc-400 mt-0.5">
                                            {selectedDayInfo
                                                ? `${selectedDayInfo.fullDayName}, ${selectedDayInfo.formattedDate}`
                                                : "Pilih hari pada grafik"}
                                        </p>
                                    </div>
                                    <span className="shrink-0 rounded-full bg-[var(--secondary-green-color)]/30 px-2.5 py-1 text-xs font-bold text-[var(--green-color)]">
                                        {selectedDayTikets.length} Tiket
                                    </span>
                                </div>

                                {/* Layanan apa saja pada hari tersebut */}
                                {selectedDayTikets.length > 0 && selectedDayLayananSummary.length > 0 && (
                                    <div className="mb-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                                        <p className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
                                            Layanan Terkait:
                                        </p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {selectedDayLayananSummary.map((item, idx) => (
                                                <span
                                                    key={idx}
                                                    className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 px-2 py-1 text-xs font-medium text-zinc-700 dark:text-zinc-300 border border-zinc-200/60 dark:border-zinc-700/60"
                                                >
                                                    <span className="truncate max-w-[130px]">{item.nama}</span>
                                                    <span className="rounded-full bg-[var(--green-color)] text-white px-1.5 py-0.2 text-[10px] font-bold">
                                                        {item.count}
                                                    </span>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Daftar Rincian Tiket */}
                                {loading ? (
                                    <div className="space-y-2.5">
                                        {[...Array(3)].map((_, i) => (
                                            <div key={i} className="h-16 rounded-xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
                                        ))}
                                    </div>
                                ) : selectedDayTikets.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-7 text-center">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-400 mb-2">
                                            <Inbox className="h-5 w-5" />
                                        </div>
                                        <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                                            Tidak Ada Tiket Terverifikasi
                                        </p>
                                        <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-1 max-w-[220px]">
                                            Tidak ada tiket terverifikasi pada {selectedDayInfo?.fullDayName || "hari ini"}. Klik hari lain pada grafik untuk melihat rincian tiket.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                                        {selectedDayTikets.map((t) => {
                                            const pemohon = t.user?.nama || t.jawaban_form?.nama_lengkap || "Pemohon";
                                            const jam = t.createdAt
                                                ? new Date(t.createdAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB"
                                                : "-";
                                            return (
                                                <div
                                                    key={t.id}
                                                    className="p-2.5 rounded-xl border border-zinc-200/70 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 hover:border-[var(--green-color)]/50 transition"
                                                >
                                                    <div className="flex items-center justify-between gap-2 mb-1">
                                                        <span className="text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200">
                                                            {t.no_tiket}
                                                        </span>
                                                        <StatusLayananBadge
                                                            status={t.status}
                                                            layananSlug={t.layanan?.slug}
                                                            namaLayanan={t.layanan?.nama_layanan}
                                                        />
                                                    </div>
                                                    <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 truncate" title={t.layanan?.nama_layanan}>
                                                        {t.layanan?.nama_layanan || "Layanan"}
                                                    </p>
                                                    <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-zinc-100 dark:border-zinc-800 text-[11px] text-zinc-500 dark:text-zinc-400">
                                                        <span className="truncate max-w-[130px]" title={pemohon}>
                                                            👤 {pemohon}
                                                        </span>
                                                        <span>🕒 {jam}</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Info Footer Hari */}
                            <div className="flex items-center justify-between mt-4 border-t border-zinc-100 dark:border-zinc-800 pt-3 text-xs text-zinc-500">
                                <span>Hari: <strong className="text-zinc-700 dark:text-zinc-300">{selectedDayInfo?.dayName || "-"}</strong></span>
                                <span>
                                    {selectedDayTikets.length > 0 ? (
                                        <strong className="text-[var(--green-color)] font-semibold">
                                            {selectedDayTikets.length} permohonan terverifikasi
                                        </strong>
                                    ) : (
                                        <span className="text-zinc-400">0 permohonan</span>
                                    )}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Aktivitas Terbaru */}
                    <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                        <div className="flex items-center justify-between px-6 py-5">
                            <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">Aktivitas Terbaru</p>
                            <Link href="/audit-log" className="text-xs font-semibold text-[var(--green-color)] hover:underline transition">Lihat Semua</Link>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-zinc-200/80 dark:divide-zinc-800">
                                <thead className="bg-[var(--secondary-green-color)]">
                                    <tr>
                                        {["No.", "No. Tiket", "Waktu", "Nama Pengguna", "Peran", "Layanan", "Aktivitas"].map((h) => {
                                            const isLeft = h === "No. Tiket" || h === "Layanan";
                                            return (
                                                <th
                                                    key={h}
                                                    scope="col"
                                                    className={`px-6 py-4 text-xs font-semibold text-[var(--foreground)] tracking-wider ${isLeft ? "text-left" : "text-center"
                                                        }`}
                                                >
                                                    {h}
                                                </th>
                                            );
                                        })}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 bg-white dark:bg-zinc-900">
                                    {loading ? (
                                        <tr><td colSpan={7} className="px-6 py-10 text-center text-sm text-zinc-400">Memuat data...</td></tr>
                                    ) : stats.recent.length === 0 ? (
                                        <tr><td colSpan={7} className="px-6 py-10 text-center text-sm text-zinc-400">Belum ada aktivitas</td></tr>
                                    ) : stats.recent.map((tiket, idx) => {
                                        const layananNama = tiket.layanan?.nama_layanan || "-";
                                        const short = layananNama.replace("Rekomendasi & Penilaian SNI", "Rekomendasi SNI").replace("Rekomendasi Siap Tanam", "Siap Tanam").replace("Bimbingan Teknis & Narasumber", "Bimtek/Narasumber").replace("Magang Teknis / PKL", "Magang").replace("Agroedukasi / Kunjungan Edukasi", "Agroedukasi");
                                        const nama = tiket.jawaban_form?.nama_lengkap || tiket.user?.nama || "-";
                                        const role = tiket.user?.role ? getRoleLabel(tiket.user.role) : "-";
                                        return (
                                            <tr key={tiket.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 transition-colors">
                                                <td className="px-6 py-5 whitespace-nowrap text-xs text-zinc-500 text-center">{idx + 1}</td>
                                                <td className="px-6 py-5 whitespace-nowrap text-xs font-medium text-zinc-700 dark:text-zinc-300 text-left">{tiket.no_tiket}</td>
                                                <td className="px-6 py-5 whitespace-nowrap text-xs text-zinc-500 text-center">{timeAgo(tiket.createdAt)}</td>
                                                <td className="px-6 py-5 whitespace-nowrap text-xs text-zinc-700 dark:text-zinc-300 text-center">{nama}</td>
                                                <td className="px-6 py-5 whitespace-nowrap text-xs text-zinc-500 text-center">{role}</td>
                                                <td className="px-6 py-5 text-xs text-zinc-500 text-left">{short}</td>
                                                <td className="px-6 py-5 whitespace-nowrap text-xs text-zinc-500 text-center">{getAktivitasLabel(tiket.status)}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </main>
            </div>
        </div>
    );
}
