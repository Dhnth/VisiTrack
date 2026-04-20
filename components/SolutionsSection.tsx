"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Lightbulb } from "lucide-react";

export default function SolutionsSection() {
  return (
    <section className="mt-20 px-4 sm:px-6 md:px-10 min-h-screen" id="solutions">
      <div className="flex items-center justify-center gap-2 w-32 h-10 border border-[#407BA7] rounded-2xl mx-auto">
        <Lightbulb className="text-[#407BA7] size-4 sm:size-5" />
        <p className="text-sm sm:text-base">Solutions</p>
      </div>

      <div className="flex flex-col lg:flex-row items-center mt-10 sm:mt-15 gap-8 lg:gap-10 px-4 sm:px-6 lg:px-10">
        {/* Kiri */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="w-full lg:w-1/2"
        >
          <h2 className="text-black/90 font-bold text-3xl sm:text-4xl lg:text-5xl">
            Solutions for every institution
          </h2>
          <p className="text-black/50 w-full lg:w-2/3 mt-5 sm:mt-10 lg:mt-15 text-lg sm:text-xl lg:text-2xl">
            From schools to corporate offices, VisiTrack adapts to your visitor
            management needs.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="border border-black/30 w-full lg:w-3/4 rounded-2xl mt-10 sm:mt-20 lg:mt-60 bg-white"
          >
            <div className="p-4 flex items-center gap-3">
              <div className="bg-black/5 size-10 rounded-lg grid place-items-center">
                <Image
                  src="/images/icon.svg"
                  alt="Logo VisiTrack"
                  width={32}
                  height={32}
                  className="size-8"
                />
              </div>
              <div className="h-10 px-2 text-lg font-semibold bg-black/5 flex items-center rounded-lg text-black/70">
                VisiTrack
              </div>
            </div>
            <div className="px-4 sm:px-8 lg:px-18">
              <h3 className="text-lg sm:text-xl font-semibold">
                Digitalize your Guest book
              </h3>
              <p className="mt-3 sm:mt-5 text-black/50 text-base sm:text-lg">
                Replace paper with smart tracking. Auto reports, and seamless
                check-in — all in one system.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4 px-4 py-6 mt-2 sm:mt-5">
              <motion.a
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                href=""
                className="w-full sm:w-1/2 text-center py-2 bg-[#407BA7] rounded-lg text-white font-semibold"
              >
                Digitalize
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                href=""
                className="w-full sm:w-1/2 text-center py-2 border border-black/20 rounded-lg font-semibold"
              >
                Learn More
              </motion.a>
            </div>
          </motion.div>
        </motion.div>

        {/* Kanan - Dashboard Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="w-full lg:w-1/2 mt-10 lg:mt-0"
        >
          <div className="relative w-full">
            <div className="relative rounded-2xl bg-white shadow-2xl border border-gray-200 overflow-hidden">
              {/* Window Header */}
              <div className="bg-gray-100 h-10 px-4 flex items-center gap-2 border-b border-gray-200">
                <div className="size-3 rounded-full bg-red-400"></div>
                <div className="size-3 rounded-full bg-amber-400"></div>
                <div className="size-3 rounded-full bg-green-400"></div>
              </div>

              {/* App Body - Responsif height */}
              <div className="flex p-3 sm:p-4 gap-3 sm:gap-4 h-[450px] sm:h-[500px] md:h-[550px] lg:h-[600px] bg-gray-50">
                {/* Sidebar - hidden di mobile */}
                <div className="hidden sm:flex w-1/3 md:w-1/4 flex-col gap-3">
                  <div className="h-8 w-2/3 bg-[#800016] rounded-lg mb-4"></div>
                  <div className="h-10 w-full bg-white rounded-xl shadow-sm border border-[#C00021]/20 flex items-center px-3 gap-2">
                    <div className="size-4 bg-[#C00021] rounded"></div>
                    <div className="h-2.5 w-1/2 bg-[#C00021] rounded"></div>
                  </div>
                  <div className="h-10 w-full bg-transparent rounded-xl flex items-center px-3 gap-2">
                    <div className="size-4 bg-gray-300 rounded"></div>
                    <div className="h-2.5 w-2/3 bg-gray-300 rounded"></div>
                  </div>
                  <div className="h-10 w-full bg-transparent rounded-xl flex items-center px-3 gap-2">
                    <div className="size-4 bg-gray-300 rounded"></div>
                    <div className="h-2.5 w-1/2 bg-gray-300 rounded"></div>
                  </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex flex-col gap-3 sm:gap-4">
                  {/* Header section */}
                  <div className="flex justify-between items-end">
                    <div>
                      <div className="h-4 sm:h-5 w-24 sm:w-32 bg-[#800016] rounded-lg mb-1 sm:mb-2"></div>
                      <div className="h-2 sm:h-3 w-32 sm:w-48 bg-gray-400 rounded-lg"></div>
                    </div>
                    <div className="size-8 sm:size-10 rounded-full bg-[#FF002B]/10 border border-[#FF002B]/20 flex items-center justify-center">
                      <div className="size-3 sm:size-4 rounded-full bg-[#FF002B]"></div>
                    </div>
                  </div>

                  {/* Stats Cards */}
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div className="bg-white p-2 sm:p-4 rounded-xl sm:rounded-2xl shadow-sm border border-gray-100">
                      <div className="h-2 sm:h-3 w-16 sm:w-24 bg-gray-300 rounded mb-2 sm:mb-3"></div>
                      <div className="flex items-end gap-1 sm:gap-2">
                        <div className="h-5 sm:h-7 w-10 sm:w-16 bg-[#800016] rounded"></div>
                        <div className="h-4 sm:h-5 w-8 sm:w-10 bg-green-100 rounded text-green-600 flex items-center justify-center text-[8px] sm:text-[10px] font-bold">
                          +12%
                        </div>
                      </div>
                    </div>
                    <div className="bg-white p-2 sm:p-4 rounded-xl sm:rounded-2xl shadow-sm border border-gray-100">
                      <div className="h-2 sm:h-3 w-20 sm:w-28 bg-gray-300 rounded mb-2 sm:mb-3"></div>
                      <div className="flex items-end gap-1 sm:gap-2">
                        <div className="h-5 sm:h-7 w-8 sm:w-12 bg-[#C00021] rounded"></div>
                        <div className="h-3 sm:h-4 w-12 sm:w-16 bg-amber-100 rounded text-amber-600 flex items-center justify-center text-[8px] sm:text-[10px] font-bold">
                          Waiting
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Chart Area */}
                  <div className="flex-1 bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-3 sm:p-4 flex flex-col justify-between">
                    <div className="flex justify-between items-center mb-2 sm:mb-4">
                      <div className="h-3 sm:h-4 w-24 sm:w-36 bg-[#004E89] rounded"></div>
                      <div className="h-5 sm:h-6 w-16 sm:w-20 bg-[#407BA7]/10 rounded-lg"></div>
                    </div>
                    <div className="flex items-end gap-1 sm:gap-2 h-full pt-2 sm:pt-4">
                      <div className="w-full bg-[#FF002B]/20 rounded-t-lg h-[40%]"></div>
                      <div className="w-full bg-[#C00021]/30 rounded-t-lg h-[60%]"></div>
                      <div className="w-full bg-[#A0001C]/40 rounded-t-lg h-[50%]"></div>
                      <div className="w-full bg-[#800016]/50 rounded-t-lg h-[80%]"></div>
                      <div className="w-full bg-[#004E89]/40 rounded-t-lg h-[65%]"></div>
                      <div className="w-full bg-[#407BA7]/50 rounded-t-lg h-[90%]"></div>
                    </div>
                    <div className="flex justify-between mt-2 sm:mt-3 text-[8px] sm:text-[10px] text-gray-400">
                      <span>Sen</span>
                      <span>Sel</span>
                      <span>Rab</span>
                      <span>Kam</span>
                      <span>Jum</span>
                      <span>Sab</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}