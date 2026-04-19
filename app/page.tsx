"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ScanQrCode,
  ShieldCheck,
  Zap,
  Activity,
  ChartArea,
  Lightbulb,
  MessageCircleQuestion,
} from "lucide-react";

export default function HomePage() {
  return (
    <>
      <nav className="px-10 py-2 flex items-center justify-between">
        {/* logo */}
        <div className="flex items-center gap-3">
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
        </div>

        {/* navigation links */}
        <ul className="flex gap-6">
          <li>
            <a href="#features">Features</a>
          </li>
          <li>
            <a href="#solutions">Solutions</a>
          </li>
          <li>
            <a href="#faq">FaQ</a>
          </li>
          <li>
            <a href="#pricing">Pricing</a>
          </li>
        </ul>

        <div className="flex items-center gap-5">
          <Link href="/signin">Sign in</Link>
          <Link
            href="/get-started"
            className="px-3 py-2 border border-[#407BA7] rounded-xl hover:bg-[#407BA7] hover:text-white transition-all duration-300"
          >
            Get Started
          </Link>
        </div>
      </nav>

      <main>
        {/* home */}
        <section className="min-h-[90vh] rounded-2xl mx-5 flex flex-col items-center relative overflow-hidden border border-black/30 shadow-inner shadow-black/40">
          <div
            className="absolute inset-0 pointer-events-none h-full  rounded-xl z-0 w-full"
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

          {/* QR Code icon decoration */}
          <div className="absolute -top-10 -left-5 bg-white border border-black/20 rounded-2xl rotate-45 z-10">
            <ScanQrCode size={200} className="" strokeWidth={1.5} />
          </div>

          {/* Logo */}
          <div className="rounded-2xl shadow-xl size-18 grid place-items-center mt-30 bg-white border border-black/10 z-10">
            <Image
              src="/images/icon.svg"
              alt="Logo VisiTrack"
              width={60}
              height={60}
              className="size-15"
            />
          </div>

          {/* Hero Text */}
          <h1 className="text-6xl md:text-8xl mt-15 text-black/70 text-center font-bold z-10">
            Scan, validate, and track
          </h1>
          <p className="text-5xl md:text-9xl mt-5 text-black/50 text-center z-10">
            all in one place
          </p>

          <a
            href="#pricing"
            className="px-5 py-3 bg-[#407BA7] text-white rounded-lg hover:bg-[#356a8f] transition-all duration-300 mt-15 z-10"
          >
            Get Started
          </a>

          <div className="rounded-2xl shadow-xl w-85 h-165 grid place-items-center mt-30 absolute bg-white border border-black/30 -right-10 -bottom-100 rotate-15 z-10">
            <p className="mt-10 font-medium text-2xl w-full text-left ml-20">
              Today`s Guest
            </p>
            <Image
              src="/images/layout.svg"
              alt="Layout Tamu VisiTrack"
              width={300}
              height={638}
              className=""
            />
          </div>
        </section>

        {/* features */}
        <section className="mt-20 px-10 min-h-screen" id="features">
          <div className="flex items-center justify-center gap-2 w-45 h-10 border border-[#FF002B] rounded-2xl">
            <Zap className="text-[#FF002B]" />
            <p>Explore Features</p>
          </div>

          <div className="px-3">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-left leading-tight mt-15">
              Everything you need
              <br />
              to manage visitors
              <br />
              <span className="text-[#FF002B]">smartly</span>
              <span className="mx-2">and</span>
              <span className="text-[#407BA7]">securely</span>
            </h1>

            {/* Feature cards */}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mt-10 px-40">
              {/* card 1 */}
              <div className="w-90 h-100 border border-black/30 rounded-xl relative top-0">
                <div className="w-90 h-50 border-b border-black/30 flex items-center justify-center">
                  <div
                    className="absolute inset-0 pointer-events-none w-90 h-50 rounded-xl z-0 "
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

                  <div className="bg-white border border-black/30 size-14 flex items-center justify-center rounded-lg shadow-lg shadow-black/30 z-10">
                    <ShieldCheck className="bg-linear-to-b from-[#C00021] to-[#FF002B] text-white size-10 p-1 rounded-lg" />
                  </div>
                </div>
                <h2 className="text-center mt-8 text-xl font-bold text-black/80">
                  Scan & Verify
                </h2>
                <p className="text-center mt-5 w-60 mx-auto text-black/60">
                  Visitors scan QR code, fill their data, take a selfie, and
                  wait for instant validation.
                </p>
              </div>

              {/* card 2 */}
              <div className="w-90 h-100 border border-black/30 rounded-xl relative -top-20">
                <div className="w-90 h-50 border-b border-black/30 flex items-center justify-center">
                  <div
                    className="absolute inset-0 pointer-events-none w-90 h-50 rounded-xl z-0 "
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

                  <div className="bg-white border border-black/30 size-14 flex items-center justify-center rounded-lg shadow-lg shadow-black/30 z-10">
                    <Activity className="bg-linear-to-b from-[#00043A] to-[#407BA7] text-white size-10 p-1 rounded-lg" />
                  </div>
                </div>
                <h2 className="text-center mt-8 text-xl font-bold text-black/80">
                  Track & Monitor
                </h2>
                <p className="text-center mt-5 w-60 mx-auto text-black/60">
                  Real-time visitor list, active guest tracking, and instant
                  check-out with just one click.
                </p>
              </div>

              {/* card 3 */}
              <div className="w-90 h-100 border border-black/30 rounded-xl relative -top-40">
                <div className="w-90 h-50 border-b border-black/30 flex items-center justify-center">
                  <div
                    className="absolute inset-0 pointer-events-none w-90 h-50 rounded-xl z-0 "
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

                  <div className="bg-white border border-black/30 size-14 flex items-center justify-center rounded-lg shadow-lg shadow-black/30 z-10">
                    <ChartArea className="bg-linear-to-b from-[#C00021] to-[#FF002B] text-white size-10 p-1 rounded-lg" />
                  </div>
                </div>
                <h2 className="text-center mt-8 text-xl font-bold text-black/80">
                  Report & Analyze
                </h2>
                <p className="text-center mt-5 w-60 mx-auto text-black/60">
                  See visit statistics, know who is most visited, and export
                  reports for your institution.
                </p>
              </div>
            </div>
          </div>
        </section>
        {/* solutions */}
        <section className="mt-20 px-10 min-h-screen" id="solutions">
          <div className="flex items-center justify-center gap-2 w-32 h-10 border border-[#407BA7] rounded-2xl">
            <Lightbulb className="text-[#407BA7]" />
            <p>Solutions</p>
          </div>
          <div className="px-10 flex items-center mt-15">
            {/* kiri */}
            <div className="w-1/2">
              <h2 className="text-black/90 font-bold text-5xl">
                Solutions for every institution
              </h2>

              <p className="text-black/50 w-2/3 mt-15 text-2xl">
                From schools to corporate offices, VisiTrack adapts to your
                visitor management needs.
              </p>

              <div className="border border-black/30 w-3/4 h-65 rounded-2xl mt-60">
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
                <div className="px-18">
                  <h3 className="text-xl font-semibold">
                    Digitalize your Guest book
                  </h3>
                  <p className="mt-5 text-black/50 text-lg">
                    Replace paper with smart tracking. Auto reports, and
                    seamless check-in — all in one system.
                  </p>
                </div>
                <div className="flex items-center gap-4 px-4 mt-5">
                  <a
                    href=""
                    className="w-1/2 text-center py-2 bg-[#407BA7] rounded-lg text-white font-semibold"
                  >
                    Digitalize
                  </a>
                  <a
                    href=""
                    className="w-1/2 text-center py-2 border border-black/20 rounded-lg font-semibold"
                  >
                    Learn More
                  </a>
                </div>
              </div>
            </div>

            {/* kanan */}
            <div className="  "></div>
          </div>
        </section>
        {/* FaQ */}
        <section className="mt-20 px-10 min-h-screen" id="faq">
          <div className="flex items-center justify-center gap-2 w-32 h-10 border border-[#FF002B] rounded-2xl">
            <MessageCircleQuestion className="text-[#FF002B]" />
            <p>FAQ</p>
          </div>

          <div className="flex mt-15">
            {/* kiri */}
            <div className="w-1/2">
              <h1 className="text-5xl font-bold w-2/3">
                Got questions? We`ve got answers.
              </h1>
            </div>
            {/* kanan */}
            
          </div>

        </section>
      </main>
    </>
  );
}
