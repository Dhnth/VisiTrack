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
  hidden: { opacity: 1 }, // Biarkan container langsung ada (background biru langsung penuh)
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15, // Sedikit dipercepat
      delayChildren: 0.2,
    },
  },
} as const;

// Variants untuk setiap item (kurangi y agar tidak keluar dari kontainer)
const itemVariants = {
  hidden: { opacity: 0, y: 20 }, // Diubah dari 30 ke 20 agar lebih smooth
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
} as const;

export default function Footer() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    // Tambahkan 'overflow-hidden' untuk memotong efek y:20 yang keluar dari area biru
    <footer className="bg-[#00043A] border-t border-gray-200 pt-16 pb-8 px-5 overflow-hidden" ref={ref}>
      <div className="px-20">
        <motion.div 
          className="flex gap-8" // Tambah gap untuk aman di resize
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {/* quick links */}
          <motion.div className="w-1/-4 md:w-1/4" variants={itemVariants}>
            <h1 className="text-4xl md:text-5xl text-white font-bold">Quick Links</h1>
            <ul className="space-y-2 mt-8 text-lg">
              <li>
                <Link
                  href="/"
                  className="text-gray-500 hover:text-[#004E89] transition"
                >
                  Homepage
                </Link>
              </li>
              <li>
                <Link
                  href="#features"
                  className="text-gray-500 hover:text-[#004E89] transition"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="#solutions"
                  className="text-gray-500 hover:text-[#004E89] transition"
                >
                  Solutions
                </Link>
              </li>
              <li>
                <Link
                  href="#faq"
                  className="text-gray-500 hover:text-[#004E89] transition"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="#pricing"
                  className="text-gray-500 hover:text-[#004E89] transition"
                >
                  Pricing
                </Link>
              </li>
            </ul>
          </motion.div>
          
          {/* contact & legal */}
          <motion.div className="w-1/4 md:w-1/4" variants={itemVariants}>
            <h1 className="text-4xl md:text-5xl text-white font-bold">Contact & Legal</h1>
            <ul className="space-y-2 mt-8 text-lg">
              <li className="text-gray-500">visitrack@support.com</li>
              <li>
                <Link
                  href="#"
                  className="text-gray-500 hover:text-[#004E89] transition"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-gray-500 hover:text-[#004E89] transition"
                >
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </motion.div>
          
          {/* social media */}
          <motion.div className="w-2/4 md:w-2/4 px-0 md:px-20" variants={itemVariants}>
            <h1 className="text-4xl md:text-5xl text-white font-bold leading-tight">
              Join The Conversation Let`s Connect
            </h1>
            <div className="flex gap-5 mt-8">
              <motion.div whileHover={{ scale: 1.1 }} transition={{ type: "spring", stiffness: 300 }}>
                <Link
                  href="#"
                  className="bg-gray-100 p-2 rounded-full hover:bg-[#1877F2] hover:text-white transition block"
                >
                  <FaFacebook className="size-5" />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.1 }} transition={{ type: "spring", stiffness: 300 }}>
                <Link
                  href="#"
                  className="bg-gray-100 p-2 rounded-full hover:bg-[#1DA1F2] hover:text-white transition block"
                >
                  <FaTwitter className="size-5" />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.1 }} transition={{ type: "spring", stiffness: 300 }}>
                <Link
                  href="#"
                  className="bg-gray-100 p-2 rounded-full hover:bg-[#E4405F] hover:text-white transition block"
                >
                  <FaInstagram className="size-5" />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.1 }} transition={{ type: "spring", stiffness: 300 }}>
                <Link
                  href="#"
                  className="bg-gray-100 p-2 rounded-full hover:bg-[#0A66C2] hover:text-white transition block"
                >
                  <FaLinkedin className="size-5" />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.1 }} transition={{ type: "spring", stiffness: 300 }}>
                <Link
                  href="#"
                  className="bg-gray-100 p-2 rounded-full hover:bg-[#FF0000] hover:text-white transition block"
                >
                  <FaYoutube className="size-5" />
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
        
        <motion.div 
          className="flex flex-col md:flex-row items-center mt-15"
          initial={{ opacity: 0, y: 20 }} // Diubah dari 30 ke 20
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <div className="w-full md:w-1/2 mb-8 md:mb-0">
            <h1 className="text-3xl md:text-5xl font-bold text-white w-full md:w-2/3">
              Never miss an update Join our community
            </h1>
          </div>
          <div className="w-full md:w-1/2">
            <p className="text-lg text-white">Email</p>
            <input
              type="text"
              className="w-full border-b border-white h-12 md:h-15 focus:outline-none text-white text-xl bg-transparent"
            ></input>
            <motion.button 
              className="bg-white w-full mt-4 h-12 md:h-15 rounded-xl hover:bg-white/70 transition-all duration-300 cursor-pointer text-black font-medium"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Subscribe for free
            </motion.button>
          </div>
        </motion.div>
        
        <motion.div 
        className="border-t-2 border-white mt-10"
        initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 1.1 }}
        >
          <motion.p 
          className="text-white text-center mt-10"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 1.2 }}
          >Copyright © 2026 VisiTrack</motion.p>
        </motion.div>
      </div>
    </footer>
  );
}