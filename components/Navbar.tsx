"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface NavLink {
  name: string;
  href: string;
}

const Navbar = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isScrolled, setIsScrolled] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLinkClick = (): void => {
    setIsOpen(false);
  };

  const navLinks: NavLink[] = [
    { name: "Features", href: "#features" },
    { name: "Solutions", href: "#solutions" },
    { name: "Pricing", href: "#pricing" },
    { name: "FaQ", href: "#faq" },
  ];

  // Tambahkan 'as const' di akhir objek untuk memperbaiki error TypeScript
  const sidebarVariants = {
    hidden: { x: "100%" },
    visible: {
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
    exit: { x: "100%", transition: { duration: 0.2 } },
  } as const;

  const itemVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
  } as const;

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 w-full z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/90 backdrop-blur-md shadow-lg"
            : "bg-white shadow-sm"
        }`}
      >
        <div className="max-w-8xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Link href="/" onClick={handleLinkClick}>
              <Image
                src="/images/icon.svg"
                alt="Logo VisiTrack"
                width={32}
                height={32}
                className="size-7 sm:size-8 md:size-9"
                priority
              />
            </Link>
            <p className="text-sm sm:text-base md:text-lg font-semibold text-gray-800 whitespace-nowrap">
              VisiTrack
            </p>
          </div>

          {/* Desktop Menu */}
          <ul className="hidden md:flex gap-6 lg:gap-8 shrink-0">
            {navLinks.map((link, index) => (
              <li key={index}>
                <a
                  href={link.href}
                  className="text-gray-600 hover:text-[#407BA7] transition-colors duration-300 font-medium text-sm lg:text-base whitespace-nowrap"
                >
                  {link.name}
                </a>
              </li>
            ))}
          </ul>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-4 lg:gap-5 shrink-0">
            <Link
              href="/signin"
              className="text-gray-600 hover:text-[#407BA7] transition-colors duration-300 font-medium text-sm lg:text-base whitespace-nowrap"
            >
              Sign in
            </Link>
            <Link
              href="/get-started"
              className="px-4 py-2 border border-[#407BA7] rounded-xl hover:bg-[#407BA7] hover:text-white transition-all duration-300 font-medium text-sm lg:text-base whitespace-nowrap inline-block"
            >
              Get Started
            </Link>
          </div>

          {/* Hamburger Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            // Perbaikan warning: z-[60] -> z-60
            className="md:hidden relative w-8 h-8 flex flex-col justify-center items-center gap-1.5 group z-60 cursor-pointer shrink-0"
            aria-label="Toggle menu"
            type="button"
          >
            <span
              className={`w-5 h-0.5 bg-gray-800 transition-all duration-300 origin-center ${
                // Perbaikan warning: translate-y-[7px] -> translate-y-1.75
                isOpen ? "rotate-45 translate-y-1.75" : ""
              }`}
            />
            <span
              className={`w-5 h-0.5 bg-gray-800 transition-all duration-300 ${
                isOpen ? "opacity-0 scale-0" : ""
              }`}
            />
            <span
              className={`w-5 h-0.5 bg-gray-800 transition-all duration-300 origin-center ${
                // Perbaikan warning: -translate-y-[7px] -> -translate-y-1.75
                isOpen ? "-rotate-45 -translate-y-1.75" : ""
              }`}
            />
          </button>
        </div>
      </nav>

      {/* Sidebar Mobile dengan Animasi Framer Motion */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay Background */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleLinkClick}
              className="fixed inset-0 bg-black/40 z-40 md:hidden"
            />

            {/* Panel Sidebar */}
            <motion.div
              variants={sidebarVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed top-0 right-0 h-full w-[70%] max-w-sm bg-white shadow-2xl z-50 md:hidden flex flex-col pt-20 px-6"
            >
                            {/* Tombol Close */}
              <button
                onClick={handleLinkClick}
                className="absolute top-4 right-4 p-2 text-gray-600 hover:text-gray-900 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
                aria-label="Close menu"
              >
                <X size={24} />
              </button>

              {/* Links dengan animasi stagger */}
              <div className="flex flex-col gap-2 mt-8">
                {navLinks.map((link, index) => (
                  <motion.a
                    key={index}
                    href={link.href}
                    onClick={handleLinkClick}
                    variants={itemVariants}
                    className="block py-3 text-gray-700 hover:text-[#407BA7] transition-colors duration-300 font-medium text-lg border-b border-gray-100"
                  >
                    {link.name}
                  </motion.a>
                ))}
              </div>

              {/* Auth Buttons di Sidebar */}
              <motion.div
                variants={itemVariants}
                className="mt-auto mb-10 flex flex-col gap-4"
              >
                <Link
                  href="/signin"
                  onClick={handleLinkClick}
                  className="text-center text-gray-600 hover:text-[#407BA7] transition-colors duration-300 font-medium py-2 text-base"
                >
                  Sign in
                </Link>
                <Link
                  href="/get-started"
                  onClick={handleLinkClick}
                  className="text-center px-4 py-2 border border-[#407BA7] rounded-xl hover:bg-[#407BA7] hover:text-white transition-all duration-300 font-medium text-base inline-block"
                >
                  Get Started
                </Link>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Spacer */}
      <div className="h-15 sm:h-17 md:h-18" />
    </>
  );
};

export default Navbar;