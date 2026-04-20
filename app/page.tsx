"use client";

import Image from "next/image";
import Navbar from "@/components/Navbar";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  ScanQrCode,
  ShieldCheck,
  Zap,
  Activity,
  ChartArea,
  Lightbulb,
  MessageCircleQuestion,
  DollarSign,
} from "lucide-react";
import FAQSection from "@/components/FAQSection";
import PricingSection from "@/components/PricingSection";
import Footer from "@/components/Footer";
import SolutionsSection from "@/components/SolutionsSection";

// Animation variants dengan 'as const' agar TypeScript mengenali literal string "easeOut"
const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
} as const;

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
} as const;

export default function HomePage() {
  const featuresRef = useRef(null);
  const featuresInView = useInView(featuresRef, { once: true, amount: 0.2 });

  return (
    <>
      <Navbar />
      <main>
        {/* Hero Section */}
        <section className="min-h-[90vh] rounded-2xl mx-5 flex flex-col items-center relative overflow-hidden border border-black/30 shadow-inner shadow-black/40">
          <div
            className="absolute inset-0 pointer-events-none h-full rounded-xl z-0 w-full"
            style={{
              backgroundImage: "url(/images/bg-home.svg)",
              backgroundRepeat: "repeat",
              backgroundSize: "221px",
              maskImage:
                "linear-gradient(to bottom, black 0%, transparent 70%)",
              WebkitMaskImage:
                "linear-gradient(to bottom, black 0%, transparent 100%)",
            }}
          />

          <motion.div
            initial={{ opacity: 0, rotate: 0, x: -100, y: -50 }}
            animate={{ opacity: 1, rotate: 45, x: 0, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="absolute -top-20 -left-15 md:-top-10 md:-left-5 bg-white border border-black/20 rounded-2xl z-10"
          >
            <ScanQrCode size={200} strokeWidth={1.5} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="rounded-2xl shadow-xl size-18 grid place-items-center mt-30 bg-white border border-black/10 z-10"
          >
            <Image
              src="/images/icon.svg"
              alt="Logo VisiTrack"
              width={60}
              height={60}
              className="size-15"
            />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-6xl md:text-8xl mt-15 text-black/70 text-left ml-6 font-bold z-10 md:text-center md:ml-0"
          >
            Scan, validate, and track
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-5xl md:text-9xl mt-5 text-black/50 z-10 ml-6 text-left md:text-center md:ml-0 "
          >
            all in one place
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <a
              href="#pricing"
              className="px-5 py-3 bg-[#407BA7] text-white rounded-lg hover:bg-[#356a8f] transition-all duration-300 mt-15 z-10 inline-block"
            >
              Get Started
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 100, rotate: 0 }}
            animate={{ opacity: 1, x: 0, rotate: 15 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="rounded-2xl shadow-xl w-85 h-165 place-items-center mt-30 absolute bg-white border border-black/30 -right-10 -bottom-100 z-10 hidden md:grid"
          >
            <p className="mt-10 font-medium text-2xl w-full text-left ml-20">
              Today`s Guest
            </p>
            <Image
              src="/images/layout.svg"
              alt="Layout Tamu VisiTrack"
              width={300}
              height={638}
            />
          </motion.div>
        </section>

        {/* Features Section */}
        <section
          className="mt-20 px-4 sm:px-6 md:px-10 min-h-screen"
          id="features"
          ref={featuresRef}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={featuresInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-center gap-2 w-40 sm:w-45 h-10 border border-[#FF002B] rounded-2xl mx-auto"
          >
            <Zap className="text-[#FF002B] size-4 sm:size-5" />
            <p className="text-sm sm:text-base">Explore Features</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="px-2 sm:px-4 md:px-6"
          >
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-left leading-tight mt-10 sm:mt-15">
              Everything you need
              <br />
              to manage visitors
              <br />
              <span className="text-[#FF002B]">smartly</span>
              <span className="mx-2">and</span>
              <span className="text-[#407BA7]">securely</span>
            </h1>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate={featuresInView ? "visible" : "hidden"}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10 mt-10 sm:mt-16 px-4 sm:px-8 md:px-16 lg:px-32 xl:px-40"
          >
            {/* Card 1 */}
            <motion.div
              variants={fadeInUp}
              whileHover={{ y: -10, transition: { duration: 0.2 } }}
              className="w-full max-w-[360px] mx-auto md:mx-0 h-auto border border-black/30 rounded-xl relative bg-white"
            >
              <div className="w-full h-48 sm:h-50 border-b border-black/30 flex items-center justify-center relative">
                <div
                  className="absolute inset-0 pointer-events-none w-full h-full rounded-xl z-0"
                  style={{
                    backgroundImage: "url(/images/bg-card-merah.svg)",
                    backgroundRepeat: "repeat",
                    backgroundSize: "221px",
                    maskImage:
                      "linear-gradient(to bottom, black 0%, transparent 100%)",
                    WebkitMaskImage:
                      "linear-gradient(to bottom, black 0%, transparent 100%)",
                  }}
                />
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  className="bg-white border border-black/30 size-14 sm:size-16 flex items-center justify-center rounded-lg shadow-lg shadow-black/30 z-10"
                >
                  <ShieldCheck className="bg-gradient-to-b from-[#C00021] to-[#FF002B] text-white size-9 sm:size-10 p-1.5 sm:p-2 rounded-lg" />
                </motion.div>
              </div>
              <h2 className="text-center mt-6 sm:mt-8 text-lg sm:text-xl font-bold text-black/80 px-4">
                Scan & Verify
              </h2>
              <p className="text-center mt-4 sm:mt-5 px-6 sm:px-8 pb-8 text-sm sm:text-base text-black/60">
                Visitors scan QR code, fill their data, take a selfie, and wait
                for instant validation.
              </p>
            </motion.div>

            {/* Card 2 - efek -top hanya di lg ke atas */}
            <motion.div
              variants={fadeInUp}
              whileHover={{ y: -10, transition: { duration: 0.2 } }}
              className="w-full max-w-[360px] mx-auto md:mx-0 h-auto border border-black/30 rounded-xl relative lg:-top-10 xl:-top-20 bg-white"
            >
              <div className="w-full h-48 sm:h-50 border-b border-black/30 flex items-center justify-center relative">
                <div
                  className="absolute inset-0 pointer-events-none w-full h-full rounded-xl z-0"
                  style={{
                    backgroundImage: "url(/images/bg-card-biru.svg)",
                    backgroundRepeat: "repeat",
                    backgroundSize: "221px",
                    maskImage:
                      "linear-gradient(to bottom, black 0%, transparent 100%)",
                    WebkitMaskImage:
                      "linear-gradient(to bottom, black 0%, transparent 100%)",
                  }}
                />
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  className="bg-white border border-black/30 size-14 sm:size-16 flex items-center justify-center rounded-lg shadow-lg shadow-black/30 z-10"
                >
                  <Activity className="bg-gradient-to-b from-[#00043A] to-[#407BA7] text-white size-9 sm:size-10 p-1.5 sm:p-2 rounded-lg" />
                </motion.div>
              </div>
              <h2 className="text-center mt-6 sm:mt-8 text-lg sm:text-xl font-bold text-black/80 px-4">
                Track & Monitor
              </h2>
              <p className="text-center mt-4 sm:mt-5 px-6 sm:px-8 pb-8 text-sm sm:text-base text-black/60">
                Real-time visitor list, active guest tracking, and instant
                check-out with just one click.
              </p>
            </motion.div>

            {/* Card 3 - efek -top hanya di lg ke atas */}
            <motion.div
              variants={fadeInUp}
              whileHover={{ y: -10, transition: { duration: 0.2 } }}
              className="w-full max-w-[360px] mx-auto md:mx-0 h-auto border border-black/30 rounded-xl relative lg:-top-20 xl:-top-40 bg-white"
            >
              <div className="w-full h-48 sm:h-50 border-b border-black/30 flex items-center justify-center relative">
                <div
                  className="absolute inset-0 pointer-events-none w-full h-full rounded-xl z-0"
                  style={{
                    backgroundImage: "url(/images/bg-card-merah.svg)",
                    backgroundRepeat: "repeat",
                    backgroundSize: "221px",
                    maskImage:
                      "linear-gradient(to bottom, black 0%, transparent 70%)",
                    WebkitMaskImage:
                      "linear-gradient(to bottom, black 0%, transparent 100%)",
                  }}
                />
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  className="bg-white border border-black/30 size-14 sm:size-16 flex items-center justify-center rounded-lg shadow-lg shadow-black/30 z-10"
                >
                  <ChartArea className="bg-gradient-to-b from-[#C00021] to-[#FF002B] text-white size-9 sm:size-10 p-1.5 sm:p-2 rounded-lg" />
                </motion.div>
              </div>
              <h2 className="text-center mt-6 sm:mt-8 text-lg sm:text-xl font-bold text-black/80 px-4">
                Report & Analyze
              </h2>
              <p className="text-center mt-4 sm:mt-5 px-6 sm:px-8 pb-8 text-sm sm:text-base text-black/60">
                See visit statistics, know who is most visited, and export
                reports for your institution.
              </p>
            </motion.div>
          </motion.div>
        </section>

        {/* Solutions Section */}
        <SolutionsSection />

        {/* Pricing Section */}
        <section className="mt-20 px-10 min-h-[90vh]" id="pricing">
          <div className="flex items-center justify-center mx-auto gap-2 w-32 h-10 border border-[#FF002B] rounded-2xl">
            <DollarSign className="text-[#FF002B]" />
            <p>Pricing</p>
          </div>
          <div>
            <PricingSection />
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mt-20 px-4 sm:px-6 md:px-10 min-h-[90vh]" id="faq">
          <div className="flex items-center justify-center gap-2 w-32 h-10 border border-[#407BA7] rounded-2xl mx-auto">
            <MessageCircleQuestion className="text-[#407BA7] size-4 sm:size-5" />
            <p className="text-sm sm:text-base">FAQ</p>
          </div>

          <div className="flex flex-col lg:flex-row items-start mt-10 sm:mt-15 gap-6 lg:gap-10">
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="w-full lg:w-1/3"
            >
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold w-full">
                Got questions? We`ve got answers.
              </h1>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              viewport={{ once: true }}
              className="w-full lg:w-2/3"
            >
              <FAQSection />
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
