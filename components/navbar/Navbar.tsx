"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { User, LogOut, ChevronDown, Briefcase, Bell, Menu, X, CheckCheck } from "lucide-react";
import { getUserFromToken, logout } from "@/lib/auth";
import LogoutModal from "@/components/modal/LogoutModal";
import { getNotifikasi, markNotifikasiRead, markAllNotifikasiRead, NotifikasiItem } from "@/lib/notifikasi";

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notifikasiDropdownOpen, setNotifikasiDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotifikasiItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const token = localStorage.getItem("agro_token");
    if (token) {
      const decodedUser = getUserFromToken();
      if (decodedUser) {
        setUser(decodedUser);
      }
    }
  }, []);

  const fetchNotifikasiData = () => {
    if (!user) return;
    getNotifikasi()
      .then((data) => {
        if (!Array.isArray(data)) return;
        setNotifications(data);
        const unread = data.filter((n) => !n.dibaca).length;
        setUnreadCount(unread);
      })
      .catch((err) => {
        console.error("Gagal mengambil notifikasi:", err);
      });
  };

  useEffect(() => {
    fetchNotifikasiData();
  }, [user]);

  const handleToggleNotifikasi = () => {
    const nextOpen = !notifikasiDropdownOpen;
    setNotifikasiDropdownOpen(nextOpen);
    if (nextOpen) {
      setProfileDropdownOpen(false);
      setMobileMenuOpen(false);
      fetchNotifikasiData();
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotifikasiRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, dibaca: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Gagal menandai semua notifikasi dibaca:", err);
    }
  };

  const handleNotificationItemClick = async (notif: NotifikasiItem) => {
    if (!notif.dibaca) {
      try {
        await markNotifikasiRead(notif.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, dibaca: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (err) {
        console.error("Gagal menandai notifikasi dibaca:", err);
      }
    }
    setNotifikasiDropdownOpen(false);
    if (notif.tiket?.no_tiket) {
      router.push(`/layanan-saya/${notif.tiket.no_tiket}`);
    } else {
      router.push("/layanan-saya");
    }
  };

  const handleToggleProfile = () => {
    const nextOpen = !profileDropdownOpen;
    setProfileDropdownOpen(nextOpen);
    if (nextOpen) {
      setNotifikasiDropdownOpen(false);
      setMobileMenuOpen(false);
    }
  };

  const handleToggleMobileMenu = () => {
    const nextOpen = !mobileMenuOpen;
    setMobileMenuOpen(nextOpen);
    if (nextOpen) {
      setProfileDropdownOpen(false);
      setNotifikasiDropdownOpen(false);
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const isToday = date.toDateString() === now.toDateString();
      const timeStr = date.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      });

      if (isToday) return `Hari ini pukul ${timeStr}`;

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      if (date.toDateString() === yesterday.toDateString()) {
        return `Kemarin pukul ${timeStr}`;
      }

      return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "";
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 w-full border-b border-zinc-200/40 bg-secondary-green-color/95 backdrop-blur-sm dark:bg-zinc-900/80 dark:border-zinc-800/40">
        <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/images/logo_brmp.svg"
              alt="Logo BRMP"
              width={40}
              height={40}
              priority
            />
            <div className="flex flex-col">
              <span className="font-bold text-sm leading-tight tracking-tight text-[var(--green-color)] dark:text-white">
                Layanan Agroklimat
              </span>
              <span className="font-bold text-sm leading-tight tracking-tight text-[var(--green-color)] dark:text-white">
                Terintegrasi
              </span>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-semibold text-[var(--foreground)] dark:text-zinc-300">
            <Link href="/" className="hover:text-[var(--green-color)] hover:underline hover:decoration-[var(--green-color)] hover:underline-offset-4 dark:hover:text-white transition">
              Beranda
            </Link>
            <Link href="/#tentang" className="hover:text-[var(--green-color)] hover:underline hover:decoration-[var(--green-color)] hover:underline-offset-4 dark:hover:text-white transition">
              Tentang
            </Link>
            <Link href="/#layanan" className="hover:text-[var(--green-color)] hover:underline hover:decoration-[var(--green-color)] hover:underline-offset-4 dark:hover:text-white transition">
              Layanan
            </Link>
            <Link href="/#faq" className="hover:text-[var(--green-color)] hover:underline hover:decoration-[var(--green-color)] hover:underline-offset-4 dark:hover:text-white transition">
              FAQ
            </Link>
            <Link href="/#pengaduan" className="hover:text-[var(--green-color)] hover:underline hover:decoration-[var(--green-color)] hover:underline-offset-4 dark:hover:text-white transition">
              Pengaduan
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-2 sm:gap-4">
                <div className="relative">
                  <button
                    onClick={handleToggleNotifikasi}
                    className="relative rounded-xl bg-white border border-zinc-200 p-1.5 sm:p-2 text-[var(--green-color)] hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800 cursor-pointer transition"
                    aria-label="Notifikasi"
                  >
                    <Bell className="h-4 w-4" />
                    {unreadCount > 0 && (
                      <span className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-red-500"></span>
                      </span>
                    )}
                  </button>

                  {notifikasiDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 max-w-[calc(100vw-2rem)] rounded-2xl border border-zinc-200/90 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      {/* Header */}
                      <div className="px-4 py-3.5 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-white dark:bg-zinc-950">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100">
                            Notifikasi
                          </h3>
                          {unreadCount > 0 && (
                            <span className="text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 font-bold px-2 py-0.5 rounded-full">
                              {unreadCount} baru
                            </span>
                          )}
                        </div>
                        <button
                          onClick={handleMarkAllRead}
                          title="Tandai semua sudah dibaca"
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 dark:hover:text-zinc-200 dark:hover:bg-zinc-800 transition cursor-pointer"
                        >
                          <CheckCheck className="w-4 h-4" />
                        </button>
                      </div>

                      {/* List Notifikasi */}
                      <div className="max-h-80 sm:max-h-96 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-900">
                        {notifications.length === 0 ? (
                          <div className="px-4 py-10 text-center text-xs text-zinc-400 dark:text-zinc-500">
                            <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                            Belum ada notifikasi.
                          </div>
                        ) : (
                          notifications.map((notif) => (
                            <div
                              key={notif.id}
                              onClick={() => handleNotificationItemClick(notif)}
                              className="flex items-start gap-3.5 p-3.5 sm:p-4 hover:bg-zinc-50/90 dark:hover:bg-zinc-900/60 transition cursor-pointer text-left"
                            >
                              {/* Avatar Bell Bulat Abu-abu */}
                              <div className="flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-zinc-100 dark:bg-zinc-800/90 flex items-center justify-center text-zinc-500 dark:text-zinc-400 mt-0.5">
                                <Bell className="w-4 h-4" />
                              </div>

                              {/* Teks Judul, Titik Hijau, Pesan & Waktu */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <h4 className="font-semibold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 leading-snug">
                                    {notif.judul || "Pemberitahuan Layanan"}
                                  </h4>
                                  {!notif.dibaca && (
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0 mt-1.5" />
                                  )}
                                </div>
                                <p className="text-[11px] sm:text-xs text-zinc-600 dark:text-zinc-300 mt-1 leading-relaxed break-words whitespace-normal">
                                  {notif.pesan}
                                </p>
                                <span className="text-[10px] sm:text-[11px] text-zinc-400 dark:text-zinc-500 mt-1.5 block font-normal">
                                  {formatTimeAgo(notif.timestamp)}
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Footer */}
                      <div className="px-4 py-2.5 border-t border-zinc-100 dark:border-zinc-800 text-center bg-zinc-50/50 dark:bg-zinc-900/20">
                        <Link
                          href="/layanan-saya"
                          onClick={() => setNotifikasiDropdownOpen(false)}
                          className="text-[11px] font-bold text-[var(--green-color)] dark:text-secondary-green-color hover:underline"
                        >
                          Lihat Semua Permohonan
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                <div className="hidden md:block h-6 w-px bg-zinc-200 dark:bg-zinc-800"></div>

                <div className="relative hidden md:block">
                  <button
                    onClick={handleToggleProfile}
                    className="flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800 transition cursor-pointer"
                  >
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary-green-color text-green-color dark:bg-secondary-green-color dark:text-secondary-green-color">
                      <User className="h-4 w-4" />
                    </div>
                    {user.nama && <span className="hidden md:block">{user.nama}</span>}
                    <ChevronDown className="h-4 w-4 text-zinc-400" />
                  </button>

                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-xl border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
                      <Link
                        href={"/profile-publik"}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-900"
                      >
                        <User className="h-4 w-4" />
                        <span>Profil Saya</span>
                      </Link>
                      <Link
                        href="/layanan-saya"
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-900"
                      >
                        <Briefcase className="h-4 w-4" />
                        <span>Layanan Saya</span>
                      </Link>
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          setLogoutModalOpen(true);
                        }}
                        className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-red-650 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20 cursor-pointer"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-3">
                <Link
                  href="/register"
                  className="rounded-full bg-white px-5 py-2 shadow-lg text-sm font-semibold text-[var(--green-color)] hover:text-[var(--hover-green-color)] dark:text-zinc-300 dark:hover:text-white transition"
                >
                  Register
                </Link>
                <Link
                  href="/login"
                  className="rounded-full bg-[var(--green-color)] px-5 py-2 text-sm font-semibold text-white shadow-md hover:bg-[var(--hover-green-color)] transition-all duration-200"
                >
                  Login
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={handleToggleMobileMenu}
              className="flex md:hidden items-center justify-center p-2 rounded-xl bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-200 cursor-pointer transition shadow-xs"
              aria-label={mobileMenuOpen ? "Tutup menu" : "Buka menu"}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-zinc-950/60 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Panel */}
          <aside className="relative ml-auto flex h-full w-full max-w-xs flex-col bg-white dark:bg-zinc-950 shadow-2xl border-l border-zinc-200 dark:border-zinc-800 z-10 transition-all duration-300">
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-5 border-b border-zinc-100 dark:border-zinc-800 bg-secondary-green-color/50 dark:bg-zinc-900/50">
              <div className="flex items-center gap-2.5">
                <Image
                  src="/images/logo_brmp.svg"
                  alt="Logo BRMP"
                  width={34}
                  height={34}
                />
                <div className="flex flex-col">
                  <span className="font-bold text-xs text-[var(--green-color)] dark:text-white leading-tight">
                    Layanan Agroklimat
                  </span>
                  <span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400">
                    Terintegrasi
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition cursor-pointer"
                aria-label="Tutup menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* User Info in Mobile Drawer (if logged in) */}
            {user && (
              <div className="p-3.5 mx-4 mt-4 rounded-xl bg-secondary-green-color/30 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary-green-color text-[var(--green-color)] font-bold">
                  <User className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-100 truncate">
                    {user.nama || "Pengguna"}
                  </p>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                    {user.email || ""}
                  </p>
                </div>
              </div>
            )}

            {/* Menu Links */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
              <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                Menu Utama
              </p>
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-700 hover:bg-secondary-green-color hover:text-[var(--green-color)] dark:text-zinc-200 dark:hover:bg-zinc-900 transition"
              >
                Beranda
              </Link>
              <Link
                href="/#tentang"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-700 hover:bg-secondary-green-color hover:text-[var(--green-color)] dark:text-zinc-200 dark:hover:bg-zinc-900 transition"
              >
                Tentang
              </Link>
              <Link
                href="/#layanan"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-700 hover:bg-secondary-green-color hover:text-[var(--green-color)] dark:text-zinc-200 dark:hover:bg-zinc-900 transition"
              >
                Layanan
              </Link>
              <Link
                href="/#faq"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-700 hover:bg-secondary-green-color hover:text-[var(--green-color)] dark:text-zinc-200 dark:hover:bg-zinc-900 transition"
              >
                FAQ
              </Link>
              <Link
                href="/#pengaduan"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-700 hover:bg-secondary-green-color hover:text-[var(--green-color)] dark:text-zinc-200 dark:hover:bg-zinc-900 transition"
              >
                Pengaduan
              </Link>

              {user && (
                <>
                  <div className="pt-3 pb-1">
                    <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 border-t border-zinc-100 dark:border-zinc-800 pt-3">
                      Akun Saya
                    </p>
                  </div>
                  <Link
                    href="/profile-publik"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-700 hover:bg-secondary-green-color hover:text-[var(--green-color)] dark:text-zinc-200 dark:hover:bg-zinc-900 transition"
                  >
                    <User className="h-4 w-4 text-[var(--green-color)]" />
                    <span>Profil Saya</span>
                  </Link>
                  <Link
                    href="/layanan-saya"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-700 hover:bg-secondary-green-color hover:text-[var(--green-color)] dark:text-zinc-200 dark:hover:bg-zinc-900 transition"
                  >
                    <Briefcase className="h-4 w-4 text-[var(--green-color)]" />
                    <span>Layanan Saya</span>
                  </Link>
                </>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30">
              {user ? (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setLogoutModalOpen(true);
                  }}
                  className="flex w-full items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20 border border-red-200 dark:border-red-900/30 transition cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center rounded-xl bg-[var(--green-color)] px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-[var(--hover-green-color)] transition"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-4 py-2.5 text-sm font-semibold text-[var(--green-color)] dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </aside>
        </div>
      )}

      {/* Spacer to push down content below the fixed header */}
      <div className="h-20 w-full shrink-0" />

      <LogoutModal
        isOpen={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        onConfirm={() => logout(router)}
      />
    </>
  );
}
