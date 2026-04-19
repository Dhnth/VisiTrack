"use client";

import {
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
  FaYoutube,
} from "react-icons/fa";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#00043A] border-t border-gray-200 pt-16 pb-8 px-5">
      <div className="px-20">
        <div className="flex">
          {/* quick links */}
          <div className="w-1/4">
            <h1 className="text-5xl text-white"> Quick Links</h1>
            <ul className="space-y-2 mt-8 text-lg">
              <li>
                <Link
                  href="/"
                  className="text-gray-500 hover:text-[#C00021] transition"
                >
                  Homepage
                </Link>
              </li>
              <li>
                <Link
                  href="#features"
                  className="text-gray-500 hover:text-[#C00021] transition"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="#solutions"
                  className="text-gray-500 hover:text-[#C00021] transition"
                >
                  Solutions
                </Link>
              </li>
              <li>
                <Link
                  href="#faq"
                  className="text-gray-500 hover:text-[#C00021] transition"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="#pricing"
                  className="text-gray-500 hover:text-[#C00021] transition"
                >
                  Pricing
                </Link>
              </li>
            </ul>
          </div>
          {/* contact & legal */}
          <div className="w-1/4">
            <h1 className="text-5xl text-white">Contact & Legal</h1>
            <ul className="space-y-2 mt-8 text-lg">
              <li className="text-gray-500">visitrack@support.com</li>
              <li>
                <Link
                  href="#"
                  className="text-gray-500 hover:text-[#C00021] transition"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-gray-500 hover:text-[#C00021] transition"
                >
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>
          {/* social media */}
          <div className="w-2/4 px-20">
            <h1 className="text-5xl text-white">
              Join The Conversation Let`s Connect
            </h1>
            <div className="flex gap-5 mt-8">
              <Link
                href="#"
                className="bg-gray-100 p-2 rounded-full hover:bg-[#1877F2] hover:text-white transition"
              >
                <FaFacebook className="size-5" />
              </Link>
              <Link
                href="#"
                className="bg-gray-100 p-2 rounded-full hover:bg-[#1DA1F2] hover:text-white transition"
              >
                <FaTwitter className="size-5" />
              </Link>
              <Link
                href="#"
                className="bg-gray-100 p-2 rounded-full hover:bg-[#E4405F] hover:text-white transition"
              >
                <FaInstagram className="size-5" />
              </Link>
              <Link
                href="#"
                className="bg-gray-100 p-2 rounded-full hover:bg-[#0A66C2] hover:text-white transition"
              >
                <FaLinkedin className="size-5" />
              </Link>
              <Link
                href="#"
                className="bg-gray-100 p-2 rounded-full hover:bg-[#FF0000] hover:text-white transition"
              >
                <FaYoutube className="size-5" />
              </Link>
            </div>
          </div>
        </div>
        <div className="flex items-center mt-15">
          <div className="w-1/2">
            <h1 className="text-5xl font-bold text-white w-2/3">
              Never miss an update Join our community
            </h1>
          </div>
          <div className="w-1/2">
            <p className="text-lg text-white">Email</p>
            <input
              type="text"
              className="w-full border-b border-white h-15 focus:outline-none text-white text-xl"
            ></input>
            <button className="bg-white w-full mt-4 h-15 rounded-xl hover:bg-white/70 transition-all duration-300 cursor-pointer">
              Subscribe for free
            </button>
          </div>
        </div>
        <div className="border-t-2 border-white mt-10">
          <p className="text-white text-center mt-10">Copyright © 2026 VisiTrack</p>
        </div>
      </div>
    </footer>
  );
}
