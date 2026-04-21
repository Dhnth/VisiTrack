"use client";

import { useState } from "react";
import { motion } from "framer-motion";

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const salesData = [42, 58, 45, 62, 70, 85, 78, 90, 82, 68, 55, 48];

export default function SalesChart() {
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Sales Overview</h3>
          <p className="text-sm text-green-600 mt-1">(+5) more in 2021</p>
        </div>
        <select className="text-sm border border-gray-200 rounded-lg px-3 py-1.5">
          <option>Monthly</option>
          <option>Yearly</option>
        </select>
      </div>

      <div className="flex items-end gap-2 h-64">
        {salesData.map((value, idx) => {
          const height = (value / 100) * 200;
          return (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: height }}
                transition={{ duration: 0.5, delay: idx * 0.03 }}
                onMouseEnter={() => setHoveredBar(idx)}
                onMouseLeave={() => setHoveredBar(null)}
                className="w-full bg-gradient-to-t from-[#800016] to-[#C00021] rounded-t-lg cursor-pointer"
                style={{ height }}
              />
              <span className="text-xs text-gray-500">{months[idx]}</span>
            </div>
          );
        })}
      </div>

      {hoveredBar !== null && (
        <div className="text-center mt-4 text-sm text-gray-600">
          Sales: ${salesData[hoveredBar]}k
        </div>
      )}
    </div>
  );
}