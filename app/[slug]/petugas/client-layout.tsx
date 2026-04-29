"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  QrCode,
  UserCheck,
  Users,
  ClipboardList,
  History,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Bell,
} from "lucide-react";
import Image from "next/image";
import { signOut } from "next-auth/react";

const menuItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "QR Code", href: "/qrcode", icon: QrCode },
  { name: "Tamu Validasi", href: "/validasi", icon: UserCheck },
  { name: "Tamu Berkunjung", href: "/berkunjung", icon: Users },
  { name: "Input Manual", href: "/input-manual", icon: ClipboardList },
  { name: "History Hari Ini", href: "/history", icon: History },
];

interface PetugasClientLayoutProps {
  children: React.ReactNode;
  slug: string;
  instanceName: string;
  instanceLogo: string | null;
  petugasName: string;
  petugasEmail: string;
  userRole: string | null;
}

export default function PetugasClientLayout({
  children,
  slug,
  instanceName,
  instanceLogo,
  petugasName,
  petugasEmail,
  userRole,
}: PetugasClientLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Ambil inisial untuk avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };
  

  // Deteksi ukuran layar
  useEffect(() => {
    const checkScreen = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
        setMobileMenuOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  const handleLinkClick = () => {
    if (isMobile) {
      setMobileMenuOpen(false);
    }
  };

  const toggleSidebar = () => {
    if (!isMobile) {
      setSidebarOpen(!sidebarOpen);
    }
  };

  const openMobileMenu = () => {
    setMobileMenuOpen(true);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const getHref = (href: string) => `/${slug}/petugas${href}`;

  const isActiveLink = (href: string) => {
    if (href === "/") {
      return pathname === `/${slug}/petugas`;
    }
    return pathname.startsWith(getHref(href));
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Overlay untuk mobile */}
      <AnimatePresence>
        {isMobile && mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeMobileMenu}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar untuk Desktop */}
      {!isMobile && (
        <motion.aside
          initial={{ width: 280 }}
          animate={{ width: sidebarOpen ? 280 : 80 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="relative bg-white border-r border-gray-200 h-screen flex flex-col shadow-lg"
        >
          {/* Logo Instansi */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
            {sidebarOpen ? (
              <Link
                href={getHref("/")}
                className="flex items-center gap-2"
              >
                {instanceLogo ? (
                  <Image
                    src={instanceLogo}
                    alt={instanceName}
                    width={36}
                    height={36}
                    className="size-9 rounded-lg object-cover"
                  />
                ) : (
                  <div className="size-9 rounded-lg bg-[#407BA7] flex items-center justify-center text-white font-bold text-sm">
                    {instanceName.charAt(0)}
                  </div>
                )}
                <span className="text-xl font-bold text-[#407BA7] truncate max-w-[180px]">
                  {instanceName}
                </span>
              </Link>
            ) : (
              <div className="w-full flex items-center justify-center">
                {instanceLogo ? (
                  <Image
                    src={instanceLogo}
                    alt={instanceName}
                    width={36}
                    height={36}
                    className="size-9 rounded-lg object-cover"
                  />
                ) : (
                  <div className="size-9 rounded-lg bg-[#407BA7] flex items-center justify-center text-white font-bold text-sm">
                    {instanceName.charAt(0)}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Menu */}
          <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActiveLink(item.href);
              return (
                <Link
                  key={item.name}
                  href={getHref(item.href)}
                  onClick={handleLinkClick}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 mb-2 group ${
                    isActive
                      ? "bg-[#407BA7] text-white shadow-sm"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <div
                    className={`size-9 rounded-lg grid place-items-center transition-colors ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-gray-100 text-[#407BA7] group-hover:bg-[#407BA7]/10"
                    }`}
                  >
                    <Icon size={20} />
                  </div>
                  {sidebarOpen && (
                    <span className="text-sm font-medium">{item.name}</span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={() => signOut({ callbackUrl: "/signin" })}
              className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-gray-600 hover:bg-gray-100 transition group cursor-pointer"
            >
              <div className="size-9 rounded-lg grid place-items-center bg-gray-100 text-[#407BA7] group-hover:bg-[#407BA7]/10 transition-colors">
                <LogOut size={20} />
              </div>
              {sidebarOpen && (
                <span className="text-sm font-medium">Logout</span>
              )}
            </button>
          </div>

          {/* Tombol Toggle Sidebar */}
          <button
            onClick={toggleSidebar}
            className="absolute -right-3 top-20 bg-white border border-gray-200 rounded-full p-1.5 shadow-md hover:bg-gray-50 transition"
          >
            {sidebarOpen ? (
              <ChevronLeft size={16} className="text-gray-600" />
            ) : (
              <ChevronRight size={16} className="text-gray-600" />
            )}
          </button>
        </motion.aside>
      )}

      {/* Sidebar untuk Mobile */}
      <AnimatePresence>
        {isMobile && mobileMenuOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed left-0 top-0 z-50 w-72 bg-white border-r border-gray-200 h-screen flex flex-col shadow-xl"
          >
            {/* Logo */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
              <Link
                href={getHref("/")}
                className="flex items-center gap-2"
                onClick={handleLinkClick}
              >
                {instanceLogo ? (
                  <Image
                    src={instanceLogo}
                    alt={instanceName}
                    width={36}
                    height={36}
                    className="size-9 rounded-lg object-cover"
                  />
                ) : (
                  <div className="size-9 rounded-lg bg-[#407BA7] flex items-center justify-center text-white font-bold text-sm">
                    {instanceName.charAt(0)}
                  </div>
                )}
                <span className="text-xl font-bold text-[#407BA7] truncate max-w-[180px]">
                  {instanceName}
                </span>
              </Link>
              <button
                onClick={closeMobileMenu}
                className="p-1 rounded-lg hover:bg-gray-100 transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Menu */}
            <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = isActiveLink(item.href);
                return (
                  <Link
                    key={item.name}
                    href={getHref(item.href)}
                    onClick={handleLinkClick}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 mb-2 group ${
                      isActive
                        ? "bg-[#407BA7] text-white shadow-sm"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <div
                      className={`size-9 rounded-lg grid place-items-center transition-colors ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-gray-100 text-[#407BA7] group-hover:bg-[#407BA7]/10"
                      }`}
                    >
                      <Icon size={20} />
                    </div>
                    <span className="text-sm font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Logout */}
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={() => signOut({ callbackUrl: "/signin" })}
                className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-gray-600 hover:bg-gray-100 transition group"
              >
                <div className="size-9 rounded-lg grid place-items-center bg-gray-100 text-[#407BA7] group-hover:bg-[#407BA7]/10 transition-colors">
                  <LogOut size={20} />
                </div>
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        {/* Top Navbar */}
        <header className="bg-white shadow-sm px-4 sm:px-6 py-3 flex items-center justify-between border-b border-gray-100">
          <div className="flex items-center gap-3">
            {/* Tombol Menu untuk mobile */}
            {isMobile && (
              <button
                onClick={openMobileMenu}
                className="p-2 rounded-lg hover:bg-gray-100 transition"
              >
                <Menu size={20} className="text-gray-600" />
              </button>
            )}
            <div className="hidden sm:block">
              <h1 className="text-lg sm:text-xl font-semibold text-gray-800">
                {instanceName}
              </h1>
              <p className="text-xs text-gray-400">Petugas Panel</p>
            </div>
            <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-[#407BA7] rounded-full whitespace-nowrap">
              Petugas
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <button className="relative p-2 rounded-lg hover:bg-gray-100 transition">
              <Bell size={20} className="text-gray-500" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#FF002B] rounded-full"></span>
            </button>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-700">{petugasName}</p>
                <p className="text-xs text-gray-400">{petugasEmail}</p>
              </div>
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-linear-to-br from-[#407BA7] to-[#5a9bc7] text-white flex items-center justify-center font-medium text-sm">
                {getInitials(petugasName)}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}