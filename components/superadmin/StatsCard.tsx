"use client";

import { motion } from "framer-motion";
import { ArrowUp, ArrowDown } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string;
  change: string;
  isPositive?: boolean;
  icon: React.ReactNode;
}

export default function StatsCard({ title, value, change, isPositive = true, icon }: StatsCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-5"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="p-2 rounded-lg bg-gray-100 text-[#800016]">
          {icon}
        </div>
        <div
          className={`flex items-center gap-1 text-xs font-medium ${
            isPositive ? "text-green-600" : "text-red-600"
          }`}
        >
          {isPositive ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
          {change}
        </div>
      </div>
      <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
      <p className="text-sm text-gray-500 mt-1">{title}</p>
    </motion.div>
  );
}