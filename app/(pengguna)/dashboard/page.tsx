"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/sidebar/Sidebar";
import AppBar from "@/components/appbar/AppBar";
import { getUserFromToken } from "@/lib/auth";
import {
  LayoutDashboard,
  Cloud,
  Sun,
  Droplets,
  Thermometer,
  Wind,
  Sprout,
  Calendar,
  Search,
  Bell,
  LogOut,
  Settings,
  Menu,
  X,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Gauge,
  LineChart as ChartIcon
} from "lucide-react";

export default function DashboardPenggunaPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState("petani@agroklimat.com");
  const [userName, setUserName] = useState("Pengguna");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("ringkasan");
  const [mounted, setMounted] = useState(false);

  // Authenticate mockup on client side
  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem("agro_token");
    const storedEmail = localStorage.getItem("agro_user_email");

    if (!token) {
      router.push("/login");
    } else {
      if (storedEmail) {
        setUserEmail(storedEmail);
      }
      const user = getUserFromToken();
      if (user) {
        if (user.role === "super_admin") {
          router.push("/dashboard-admin");
          return;
        }
        if (user.nama) {
          setUserName(user.nama);
        } else if (storedEmail) {
          setUserName(storedEmail.split("@")[0]);
        }
      }
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("agro_token");
    localStorage.removeItem("agro_user_email");
    router.push("/login");
  };

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
      </div>
    );
  }

  // Sample weekly data for chart
  const weeklyData = [
    { day: "Sen", temp: 27, moisture: 60 },
    { day: "Sel", temp: 28, moisture: 62 },
    { day: "Rab", temp: 29, moisture: 65 },
    { day: "Kam", temp: 28, moisture: 63 },
    { day: "Jum", temp: 26, moisture: 70 },
    { day: "Sab", temp: 27, moisture: 68 },
    { day: "Min", temp: 28, moisture: 66 },
  ];

  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 overflow-hidden font-sans">
      {/* Sidebar for Desktop */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 overflow-y-auto">
        {/* Top Navbar */}
        <AppBar onMenuClick={() => setSidebarOpen(true)} />

        {/* Content Container */}
        <main className="flex-1 p-6 space-y-6">
          {/* Welcome Banner */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 p-6 text-white shadow-lg shadow-emerald-600/10">
            <div className="absolute right-0 top-0 -mr-6 -mt-6 opacity-10">
              <Sprout className="h-48 w-48" />
            </div>
            <div className="relative z-10 space-y-2">
              {/* <div className="flex items-center gap-2 rounded-full bg-emerald-500/30 px-3 py-1 text-xs font-semibold w-max border border-emerald-400/20">
                <Sun className="h-3.5 w-3.5 animate-pulse" />
                <span>Cuaca Hari Ini: Cerah Berawan</span>
              </div> */}
              <h2 className="text-2xl font-extrabold md:text-3xl">
                Halo, Selamat Datang Kembali, <span className="capitalize">{userName}</span>!
              </h2>
              {/* <p className="max-w-xl text-sm text-emerald-50">
                Kondisi iklim di Lahan Agrosari 01 saat ini sangat stabil. Waktu terbaik untuk memulai pemupukan nitrogen terjadwal adalah pukul 14:00 - 17:00 hari ini.
              </p> */}
            </div>
          </div>

          {/* Sensor Summary Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: "Kelembaban Tanah",
                value: "64.8%",
                status: "Optimal",
                color: "emerald",
                icon: Droplets,
                desc: "Kecukupan air sangat baik",
              },
              {
                title: "Suhu Udara",
                value: "28.4°C",
                status: "Normal",
                color: "teal",
                icon: Thermometer,
                desc: "Suhu rata-rata ideal",
              },
            ].map((card, idx) => {
              const CardIcon = card.icon;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm dark:bg-zinc-900 dark:border-zinc-800 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                      {card.title}
                    </span>
                    <div className="rounded-xl bg-zinc-50 p-2 text-zinc-600 dark:bg-zinc-950 dark:text-zinc-400">
                      <CardIcon className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="mt-4 space-y-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-extrabold text-zinc-900 dark:text-white">
                        {card.value}
                      </span>
                      <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                        {card.status}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {card.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}
