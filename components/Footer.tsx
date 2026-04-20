"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
  FaYoutube,
} from "react-icons/fa";
import Link from "next/link";

// Variants untuk animasi stagger
const containerVariants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
} as const;

// Variants untuk setiap item
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
} as const;

export default function Footer() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <footer className="bg-[#00043A] border-t border-gray-200 pt-12 sm:pt-16 pb-6 sm:pb-8 px-4 sm:px-6 md:px-8 overflow-hidden" ref={ref}>
      <div className="px-2 sm:px-4 md:px-6 lg:px-20">
        {/* Grid untuk 3 kolom - responsive */}
        <motion.div 
          className="flex flex-col md:flex-row gap-6 md:gap-4 lg:gap-8"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {/* quick links */}
          <motion.div className="w-full md:w-1/3 lg:w-1/4" variants={itemVariants}>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl text-white font-bold">Quick Links</h1>
            <ul className="space-y-1.5 sm:space-y-2 mt-4 sm:mt-6 text-sm sm:text-base">
              <li>
                <Link
                  href="/"
                  className="text-gray-400 hover:text-[#407BA7] transition"
                >
                  Homepage
                </Link>
              </li>
              <li>
                <Link
                  href="#features"
                  className="text-gray-400 hover:text-[#407BA7] transition"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="#solutions"
                  className="text-gray-400 hover:text-[#407BA7] transition"
                >
                  Solutions
                </Link>
              </li>
              <li>
                <Link
                  href="#faq"
                  className="text-gray-400 hover:text-[#407BA7] transition"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="#pricing"
                  className="text-gray-400 hover:text-[#407BA7] transition"
                >
                  Pricing
                </Link>
              </li>
            </ul>
          </motion.div>
          
          {/* contact & legal */}
          <motion.div className="w-full md:w-1/3 lg:w-1/4" variants={itemVariants}>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl text-white font-bold">Contact & Legal</h1>
            <ul className="space-y-1.5 sm:space-y-2 mt-4 sm:mt-6 text-sm sm:text-base">
              <li className="text-gray-400 break-all">visitrack@support.com</li>
              <li>
                <Link
                  href="#"
                  className="text-gray-400 hover:text-[#407BA7] transition"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-gray-400 hover:text-[#407BA7] transition"
                >
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </motion.div>
          
          {/* social media */}
          <motion.div className="w-full md:w-1/3 lg:w-2/4 lg:px-6 xl:px-20" variants={itemVariants}>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl text-white font-bold leading-tight">
              Join The Conversation <span className="block sm:inline">Let`s Connect</span>
            </h1>
            <div className="flex flex-wrap gap-3 sm:gap-4 mt-5 sm:mt-6">
              <motion.div whileHover={{ scale: 1.1 }} transition={{ type: "spring", stiffness: 300 }}>
                <Link
                  href="#"
                  className="bg-white/10 p-2 rounded-full hover:bg-[#1877F2] hover:text-white transition block text-white"
                >
                  <FaFacebook className="size-4 sm:size-5" />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.1 }} transition={{ type: "spring", stiffness: 300 }}>
                <Link
                  href="#"
                  className="bg-white/10 p-2 rounded-full hover:bg-[#1DA1F2] hover:text-white transition block text-white"
                >
                  <FaTwitter className="size-4 sm:size-5" />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.1 }} transition={{ type: "spring", stiffness: 300 }}>
                <Link
                  href="#"
                  className="bg-white/10 p-2 rounded-full hover:bg-[#E4405F] hover:text-white transition block text-white"
                >
                  <FaInstagram className="size-4 sm:size-5" />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.1 }} transition={{ type: "spring", stiffness: 300 }}>
                <Link
                  href="#"
                  className="bg-white/10 p-2 rounded-full hover:bg-[#0A66C2] hover:text-white transition block text-white"
                >
                  <FaLinkedin className="size-4 sm:size-5" />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.1 }} transition={{ type: "spring", stiffness: 300 }}>
                <Link
                  href="#"
                  className="bg-white/10 p-2 rounded-full hover:bg-[#FF0000] hover:text-white transition block text-white"
                >
                  <FaYoutube className="size-4 sm:size-5" />
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
        
        {/* Newsletter section - responsive */}
        <motion.div 
          className="flex flex-col md:flex-row items-start md:items-center mt-10 sm:mt-12 gap-6 md:gap-8"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <div className="w-full md:w-1/2">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white w-full md:w-4/5 leading-tight">
              Never miss an update <span className="block sm:inline">Join our community</span>
            </h1>
          </div>
          <div className="w-full md:w-1/2">
            <p className="text-sm sm:text-base text-white">Email</p>
            <input
              type="text"
              placeholder="your@email.com"
              className="w-full border-b border-white/50 h-10 sm:h-11 md:h-12 focus:outline-none text-white text-base sm:text-lg bg-transparent"
            />
            <motion.button 
              className="bg-white w-full mt-4 h-10 sm:h-11 md:h-12 rounded-xl hover:bg-white/80 transition-all duration-300 cursor-pointer text-black font-medium text-sm sm:text-base"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Subscribe for free
            </motion.button>
          </div>
        </motion.div>
        
        {/* Copyright */}
        <motion.div 
          className="border-t border-white/30 mt-10 sm:mt-12 md:mt-14 pt-6 sm:pt-8"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 1.1 }}
        >
          <p className="text-white/60 text-center text-xs sm:text-sm">
            Copyright © 2026 VisiTrack
          </p>
        </motion.div>
      </div>
    </footer>
  );
}