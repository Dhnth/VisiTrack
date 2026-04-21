"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Building2,
  FileText,
  Settings,
  CreditCard,
  LogOut,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const menuItems = [
  { name: "Dashboard", href: "/superadmin", icon: LayoutDashboard },
  { name: "Instances", href: "/superadmin/instances", icon: Building2 },
  { name: "Users", href: "/superadmin/users", icon: Users },
  { name: "Transactions", href: "/superadmin/transactions", icon: CreditCard },
  { name: "Reports", href: "/superadmin/reports", icon: FileText },
  { name: "Settings", href: "/superadmin/settings", icon: Settings },
];

export default function Sidebar({ isOpen }: SidebarProps) {
  const pathname = usePathname();

  return (
    <motion.aside
      initial={{ width: 260 }}
      animate={{ width: isOpen ? 260 : 80 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="bg-white border-r border-gray-200 h-screen sticky top-0 flex flex-col"
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-gray-200">
        {isOpen ? (
          <span className="text-xl font-bold text-[#800016]">VisiTrack</span>
        ) : (
          <span className="text-xl font-bold text-[#800016]">VT</span>
        )}
      </div>

      {/* Menu Items */}
      <nav className="flex-1 py-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-all duration-200 ${
                isActive
                  ? "bg-[#800016] text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Icon size={20} />
              {isOpen && (
                <span className="text-sm font-medium">{item.name}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-200">
        <button className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-gray-600 hover:bg-gray-100 transition">
          <LogOut size={20} />
          {isOpen && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </motion.aside>
  );
}