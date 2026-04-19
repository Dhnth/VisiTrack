"use client";

import Image from "next/image";
import Link from "next/link";
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
      <nav className="px-10 py-2 flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3"
        >
          <Link href="/">
            <Image
              src="/images/icon.svg"
              alt="Logo VisiTrack"
              width={36}
              height={36}
              className="size-9"
            />
          </Link>
          <p className="text-lg font-semibold">VisiTrack</p>
        </motion.div>

        <motion.ul
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex gap-6"
        >
          <li><a href="#features">Features</a></li>
          <li><a href="#solutions">Solutions</a></li>
          <li><a href="#pricing">Pricing</a></li>
          <li><a href="#faq">FaQ</a></li>
        </motion.ul>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex items-center gap-5"
        >
          <Link href="/signin">Sign in</Link>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              href="/get-started"
              className="px-3 py-2 border border-[#407BA7] rounded-xl hover:bg-[#407BA7] hover:text-white transition-all duration-300"
            >
              Get Started
            </Link>
          </motion.div>
        </motion.div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="min-h-[90vh] rounded-2xl mx-5 flex flex-col items-center relative overflow-hidden border border-black/30 shadow-inner shadow-black/40">
          <div
            className="absolute inset-0 pointer-events-none h-full rounded-xl z-0 w-full"
            style={{
              backgroundImage: "url(/images/bg-home.svg)",
              backgroundRepeat: "repeat",
              backgroundSize: "221px",
              maskImage: "linear-gradient(to bottom, black 0%, transparent 70%)",
              WebkitMaskImage: "linear-gradient(to bottom, black 0%, transparent 100%)",
            }}
          />

          <motion.div
            initial={{ opacity: 0, rotate: 0, x: -100, y: -50 }}
            animate={{ opacity: 1, rotate: 45, x: 0, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="absolute -top-10 -left-5 bg-white border border-black/20 rounded-2xl z-10"
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
            className="text-6xl md:text-8xl mt-15 text-black/70 text-center font-bold z-10"
          >
            Scan, validate, and track
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-5xl md:text-9xl mt-5 text-black/50 text-center z-10"
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
            className="rounded-2xl shadow-xl w-85 h-165 grid place-items-center mt-30 absolute bg-white border border-black/30 -right-10 -bottom-100 z-10"
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
        <section className="mt-20 px-10 min-h-screen" id="features" ref={featuresRef}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={featuresInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-center gap-2 w-45 h-10 border border-[#FF002B] rounded-2xl mx-auto"
          >
            <Zap className="text-[#FF002B]" />
            <p>Explore Features</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="px-3"
          >
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-left leading-tight mt-15">
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
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mt-10 px-40"
          >
            {/* Card 1 */}
            <motion.div
              variants={fadeInUp}
              whileHover={{ y: -10, transition: { duration: 0.2 } }}
              className="w-90 h-100 border border-black/30 rounded-xl relative top-0 bg-white"
            >
              <div className="w-90 h-50 border-b border-black/30 flex items-center justify-center relative">
                <div
                  className="absolute inset-0 pointer-events-none w-90 h-50 rounded-xl z-0"
                  style={{
                    backgroundImage: "url(/images/bg-card-merah.svg)",
                    backgroundRepeat: "repeat",
                    backgroundSize: "221px",
                    maskImage: "linear-gradient(to bottom, black 0%, transparent 100%)",
                    WebkitMaskImage: "linear-gradient(to bottom, black 0%, transparent 100%)",
                  }}
                />
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  className="bg-white border border-black/30 size-14 flex items-center justify-center rounded-lg shadow-lg shadow-black/30 z-10"
                >
                  <ShieldCheck className="bg-linear-to-b from-[#C00021] to-[#FF002B] text-white size-10 p-1 rounded-lg" />
                </motion.div>
              </div>
              <h2 className="text-center mt-8 text-xl font-bold text-black/80">Scan & Verify</h2>
              <p className="text-center mt-5 w-60 mx-auto text-black/60">
                Visitors scan QR code, fill their data, take a selfie, and wait for instant validation.
              </p>
            </motion.div>

            {/* Card 2 */}
            <motion.div
              variants={fadeInUp}
              whileHover={{ y: -10, transition: { duration: 0.2 } }}
              className="w-90 h-100 border border-black/30 rounded-xl relative -top-20 bg-white"
            >
              <div className="w-90 h-50 border-b border-black/30 flex items-center justify-center relative">
                <div
                  className="absolute inset-0 pointer-events-none w-90 h-50 rounded-xl z-0"
                  style={{
                    backgroundImage: "url(/images/bg-card-biru.svg)",
                    backgroundRepeat: "repeat",
                    backgroundSize: "221px",
                    maskImage: "linear-gradient(to bottom, black 0%, transparent 100%)",
                    WebkitMaskImage: "linear-gradient(to bottom, black 0%, transparent 100%)",
                  }}
                />
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  className="bg-white border border-black/30 size-14 flex items-center justify-center rounded-lg shadow-lg shadow-black/30 z-10"
                >
                  <Activity className="bg-linear-to-b from-[#00043A] to-[#407BA7] text-white size-10 p-1 rounded-lg" />
                </motion.div>
              </div>
              <h2 className="text-center mt-8 text-xl font-bold text-black/80">Track & Monitor</h2>
              <p className="text-center mt-5 w-60 mx-auto text-black/60">
                Real-time visitor list, active guest tracking, and instant check-out with just one click.
              </p>
            </motion.div>

            {/* Card 3 */}
            <motion.div
              variants={fadeInUp}
              whileHover={{ y: -10, transition: { duration: 0.2 } }}
              className="w-90 h-100 border border-black/30 rounded-xl relative -top-40 bg-white"
            >
              <div className="w-90 h-50 border-b border-black/30 flex items-center justify-center relative">
                <div
                  className="absolute inset-0 pointer-events-none w-90 h-50 rounded-xl z-0"
                  style={{
                    backgroundImage: "url(/images/bg-card-merah.svg)",
                    backgroundRepeat: "repeat",
                    backgroundSize: "221px",
                    maskImage: "linear-gradient(to bottom, black 0%, transparent 70%)",
                    WebkitMaskImage: "linear-gradient(to bottom, black 0%, transparent 100%)",
                  }}
                />
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  className="bg-white border border-black/30 size-14 flex items-center justify-center rounded-lg shadow-lg shadow-black/30 z-10"
                >
                  <ChartArea className="bg-linear-to-b from-[#C00021] to-[#FF002B] text-white size-10 p-1 rounded-lg" />
                </motion.div>
              </div>
              <h2 className="text-center mt-8 text-xl font-bold text-black/80">Report & Analyze</h2>
              <p className="text-center mt-5 w-60 mx-auto text-black/60">
                See visit statistics, know who is most visited, and export reports for your institution.
              </p>
            </motion.div>
          </motion.div>
        </section>

        {/* Solutions Section */}
        <section className="mt-20 px-10 min-h-screen" id="solutions">
          <div className="flex items-center justify-center gap-2 w-32 h-10 border border-[#407BA7] rounded-2xl mx-auto">
            <Lightbulb className="text-[#407BA7]" />
            <p>Solutions</p>
          </div>

          <div className="px-10 flex items-center mt-15 gap-10">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="w-1/2"
            >
              <h2 className="text-black/90 font-bold text-5xl">Solutions for every institution</h2>
              <p className="text-black/50 w-2/3 mt-15 text-2xl">
                From schools to corporate offices, VisiTrack adapts to your visitor management needs.
              </p>

              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
                className="border border-black/30 w-3/4 h-65 rounded-2xl mt-60 bg-white"
              >
                <div className="p-4 flex items-center gap-3">
                  <div className="bg-black/5 size-10 rounded-lg grid place-items-center">
                    <Image src="/images/icon.svg" alt="Logo VisiTrack" width={32} height={32} className="size-8" />
                  </div>
                  <div className="h-10 px-2 text-lg font-semibold bg-black/5 flex items-center rounded-lg text-black/70">
                    VisiTrack
                  </div>
                </div>
                <div className="px-18">
                  <h3 className="text-xl font-semibold">Digitalize your Guest book</h3>
                  <p className="mt-5 text-black/50 text-lg">
                    Replace paper with smart tracking. Auto reports, and seamless check-in — all in one system.
                  </p>
                </div>
                <div className="flex items-center gap-4 px-4 mt-5">
                  <motion.a
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    href=""
                    className="w-1/2 text-center py-2 bg-[#407BA7] rounded-lg text-white font-semibold"
                  >
                    Digitalize
                  </motion.a>
                  <motion.a
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    href=""
                    className="w-1/2 text-center py-2 border border-black/20 rounded-lg font-semibold"
                  >
                    Learn More
                  </motion.a>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="w-1/2"
            >
              <div className="relative w-full mt-10 lg:mt-0">
                <div className="relative rounded-2xl bg-white shadow-2xl border border-gray-200 overflow-hidden">
                  <div className="bg-gray-100 h-10 px-4 flex items-center gap-2 border-b border-gray-200">
                    <div className="size-3 rounded-full bg-red-400"></div>
                    <div className="size-3 rounded-full bg-amber-400"></div>
                    <div className="size-3 rounded-full bg-green-400"></div>
                  </div>
                  {/* Catatan: h-[600px] sudah benar jika h-150 tidak terdefinisi di config tailwind Anda */}
                  <div className="flex p-4 gap-4 h-[600px] bg-gray-50">
                    <div className="hidden sm:flex w-1/4 flex-col gap-3">
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
                    <div className="flex-1 flex flex-col gap-4">
                      <div className="flex justify-between items-end">
                        <div>
                          <div className="h-5 w-32 bg-[#800016] rounded-lg mb-2"></div>
                          <div className="h-3 w-48 bg-gray-400 rounded-lg"></div>
                        </div>
                        <div className="size-10 rounded-full bg-[#FF002B]/10 border border-[#FF002B]/20 flex items-center justify-center">
                          <div className="size-4 rounded-full bg-[#FF002B]"></div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                          <div className="h-3 w-24 bg-gray-300 rounded mb-3"></div>
                          <div className="flex items-end gap-2">
                            <div className="h-7 w-16 bg-[#800016] rounded"></div>
                            <div className="h-5 w-10 bg-green-100 rounded text-green-600 flex items-center justify-center text-[10px] font-bold">+12%</div>
                          </div>
                        </div>
                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                          <div className="h-3 w-28 bg-gray-300 rounded mb-3"></div>
                          <div className="flex items-end gap-2">
                            <div className="h-7 w-12 bg-[#C00021] rounded"></div>
                            <div className="h-4 w-16 bg-amber-100 rounded text-amber-600 flex items-center justify-center text-[10px] font-bold">Waiting</div>
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col justify-between">
                        <div className="flex justify-between items-center mb-4">
                          <div className="h-4 w-36 bg-[#004E89] rounded"></div>
                          <div className="h-6 w-20 bg-[#407BA7]/10 rounded-lg"></div>
                        </div>
                        <div className="flex items-end gap-2 h-full pt-4">
                          <div className="w-full bg-[#FF002B]/20 rounded-t-lg h-[40%]"></div>
                          <div className="w-full bg-[#C00021]/30 rounded-t-lg h-[60%]"></div>
                          <div className="w-full bg-[#A0001C]/40 rounded-t-lg h-[50%]"></div>
                          <div className="w-full bg-[#800016]/50 rounded-t-lg h-[80%]"></div>
                          <div className="w-full bg-[#004E89]/40 rounded-t-lg h-[65%]"></div>
                          <div className="w-full bg-[#407BA7]/50 rounded-t-lg h-[90%]"></div>
                        </div>
                        <div className="flex justify-between mt-3 text-[10px] text-gray-400">
                          <span>Sen</span><span>Sel</span><span>Rab</span><span>Kam</span><span>Jum</span><span>Sab</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

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
        <section className="mt-20 px-10 min-h-[90vh]" id="faq">
          <div className="flex items-center justify-center gap-2 w-32 h-10 border border-[#407BA7] rounded-2xl mx-auto">
            <MessageCircleQuestion className="text-[#407BA7]" />
            <p>FAQ</p>
          </div>
          <div className="flex mt-15 gap-10">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="w-1/2"
            >
              <h1 className="text-5xl font-bold w-2/3">Got questions? We`ve got answers.</h1>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="w-1/2"
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