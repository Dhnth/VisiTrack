"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  CheckCircle,
  XCircle,
  Info,
  AlertCircle,
} from "lucide-react";
import Image from "next/image";
import { signOut } from "next-auth/react";
import { getPusherClient } from "@/lib/pusher/client";

const allMenuItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "QR Code", href: "/qrcode", icon: QrCode },
  { name: "Tamu Validasi", href: "/validasi", icon: UserCheck },
  { name: "Tamu Berkunjung", href: "/berkunjung", icon: Users },
  { name: "Input Manual", href: "/input-manual", icon: ClipboardList },
  { name: "History Hari Ini", href: "/history", icon: History },
];

interface Notification {
  id: number;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  createdAt: string;
  guestId?: number;
}

interface NewGuestData {
  guestId: number;
  name: string;
  institution: string;
  purpose: string;
  createdAt: string;
}

interface GuestUpdatedData {
  guestId: number;
  status: string;
  name: string;
  message: string;
}

interface NotificationData {
  id: number;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  createdAt: string;
  guestId?: number;
}

interface ToastState {
  message: string;
  type: string;
  guestId?: number;
}

interface PetugasClientLayoutProps {
  children: React.ReactNode;
  instanceId: number;
  slug: string;
  instanceName: string;
  instanceLogo: string | null;
  petugasName: string;
  petugasEmail: string;
  userRole: string | null;
  enableCheckout?: boolean;
}

export default function PetugasClientLayout({
  children,
  slug,
  instanceName,
  instanceLogo,
  instanceId,
  petugasName,
  petugasEmail,
  enableCheckout: initialEnableCheckout,
}: PetugasClientLayoutProps) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [enableCheckout, setEnableCheckout] = useState(initialEnableCheckout ?? false);
  const [loading, setLoading] = useState(true);
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  
  const pathname = usePathname();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const showToast = (message: string, type: string = "info", guestId?: number) => {
    setToast({ message, type, guestId });
    setTimeout(() => setToast(null), 5000);
  };

  useEffect(() => {
    const fetchSettings = async () => {
      if (initialEnableCheckout !== undefined) {
        setEnableCheckout(initialEnableCheckout);
        setLoading(false);
        return;
      }
      console.log("CLIENT INSTANCE:", instanceId);
console.log("CLIENT CHANNEL:", `instance-${instanceId}-petugas`);

      try {
        const res = await fetch("/api/petugas/settings");
        const data = await res.json();
        if (data.success) {
          setEnableCheckout(data.enable_checkout);
        }
      } catch (error) {
        console.error("Error fetching checkout settings:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [initialEnableCheckout]);

  useEffect(() => {
    const pusher = getPusherClient();
    if (!pusher) return;
    

    const channelName = `instance-${instanceId}-petugas`;
    const channel = pusher.subscribe(channelName);
    
    channel.bind('new-guest', (data: NewGuestData) => {
      const message = `Tamu baru: ${data.name} dari ${data.institution || 'Umum'}`;
      showToast(message, 'info', data.guestId);
      
      const newNotification: Notification = {
        id: Date.now(),
        title: 'Tamu Baru Mendaftar',
        message: `${data.name} dari ${data.institution || 'Umum'} telah mendaftar`,
        type: 'info',
        read: false,
        createdAt: new Date().toISOString(),
        guestId: data.guestId,
      };
      setNotifications(prev => [newNotification, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    channel.bind('guest-updated', (data: GuestUpdatedData) => {
      showToast(data.message, data.status === 'active' ? 'success' : 'warning', data.guestId);
      
      const newNotification: Notification = {
        id: Date.now(),
        title: data.status === 'active' ? 'Tamu Divalidasi' : data.status === 'rejected' ? 'Tamu Ditolak' : 'Status Diubah',
        message: data.message,
        type: data.status === 'active' ? 'success' : data.status === 'rejected' ? 'error' : 'warning',
        read: false,
        createdAt: new Date().toISOString(),
        guestId: data.guestId,
      };
      setNotifications(prev => [newNotification, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    channel.bind('notification', (data: NotificationData) => {
      showToast(data.message, data.type, data.guestId);
      
      const newNotification: Notification = {
        id: data.id,
        title: data.title,
        message: data.message,
        type: data.type,
        read: false,
        createdAt: data.createdAt,
        guestId: data.guestId,
      };
      setNotifications(prev => [newNotification, ...prev]);
      setUnreadCount(prev => prev + 1);
    });
    console.log("CLIENT CHANNEL:", `instance-${instanceId}-petugas`);

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(channelName);
    };
    
  }, [instanceId]);

  const menuItems = (loading ? false : enableCheckout) 
    ? allMenuItems 
    : allMenuItems.filter((item) => item.name !== "Tamu Berkunjung");

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

  const markAsRead = (notificationId: number) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'error':
        return <XCircle size={16} className="text-red-600" />;
      case 'warning':
        return <AlertCircle size={16} className="text-yellow-600" />;
      default:
        return <Info size={16} className="text-blue-600" />;
    }
  };

  const getNotificationBg = (type: string, read: boolean) => {
    if (read) return "hover:bg-gray-50";
    switch (type) {
      case 'success':
        return "bg-green-50 hover:bg-green-100";
      case 'error':
        return "bg-red-50 hover:bg-red-100";
      case 'warning':
        return "bg-yellow-50 hover:bg-yellow-100";
      default:
        return "bg-blue-50 hover:bg-blue-100";
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, x: 100, y: -20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 100, y: -20 }}
            className="fixed top-20 right-4 z-50 bg-white rounded-lg shadow-lg border-l-4 max-w-sm"
            style={{
              borderLeftColor: 
                toast.type === 'success' ? '#10B981' :
                toast.type === 'error' ? '#EF4444' :
                toast.type === 'warning' ? '#F59E0B' : '#407BA7',
            }}
          >
            <div className="p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-full" style={{ 
                  backgroundColor: 
                    toast.type === 'success' ? '#D1FAE5' :
                    toast.type === 'error' ? '#FEE2E2' :
                    toast.type === 'warning' ? '#FEF3C7' : '#DBEAFE',
                }}>
                  {toast.type === 'success' && <CheckCircle size={18} className="text-green-600" />}
                  {toast.type === 'error' && <XCircle size={18} className="text-red-600" />}
                  {toast.type === 'warning' && <AlertCircle size={18} className="text-yellow-600" />}
                  {toast.type === 'info' && <Bell size={18} className="text-[#407BA7]" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">Notifikasi</p>
                  <p className="text-xs text-gray-500 mt-0.5">{toast.message}</p>
                </div>
                {toast.guestId && (
                  <button
                    onClick={() => router.push(`/${slug}/petugas/validasi/${toast.guestId}`)}
                    className="text-xs text-[#407BA7] hover:underline"
                  >
                    Lihat
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
              <Link href={getHref("/")} className="flex items-center gap-2">
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
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-lg hover:bg-gray-100 transition"
              >
                <Bell size={20} className="text-gray-500" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-medium rounded-full flex items-center justify-center px-1">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Dropdown Notifications */}
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden"
                  >
                    <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                      <h3 className="font-semibold text-gray-800">Notifikasi</h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-xs text-[#407BA7] hover:underline"
                        >
                          Tandai semua sudah dibaca
                        </button>
                      )}
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-gray-400">
                          <Bell size={40} className="mx-auto mb-2 opacity-50" />
                          <p className="text-sm">Belum ada notifikasi</p>
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif.id}
                            onClick={() => markAsRead(notif.id)}
                            className={`p-4 border-b border-gray-100 cursor-pointer transition ${getNotificationBg(notif.type, notif.read)}`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="p-2 rounded-full bg-white shadow-sm">
                                {getNotificationIcon(notif.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-800">{notif.title}</p>
                                <p className="text-xs text-gray-500 mt-0.5">{notif.message}</p>
                                <p className="text-xs text-gray-400 mt-1">
                                  {new Date(notif.createdAt).toLocaleString('id-ID')}
                                </p>
                              </div>
                              {notif.guestId && (
                                <Link
                                  href={`/${slug}/petugas/validasi/${notif.guestId}`}
                                  className="text-xs text-[#407BA7] hover:underline whitespace-nowrap"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  Lihat
                                </Link>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

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