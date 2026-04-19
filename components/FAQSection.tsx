'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

const faqData = [
  {
    question: 'Apa itu VisiTrack?',
    answer: 'VisiTrack adalah sistem manajemen kunjungan digital yang menggantikan buku tamu fisik. Memudahkan pencatatan, validasi, dan pelaporan kunjungan secara real-time.'
  },
  {
    question: 'Bagaimana cara tamu masuk?',
    answer: 'Tamu scan QR Code, isi formulir online, petugas validasi, lalu tamu langsung tercatat sedang berkunjung.'
  },
  {
    question: 'Berapa biaya berlangganan VisiTrack?',
    answer: 'Ada 3 paket: Starter, Business, dan Enterprise. Hubungi sales untuk informasi harga detail.'
  },
  {
    question: 'Apakah bisa digunakan untuk sekolah/perusahaan/instansi pemerintah?',
    answer: 'Ya. VisiTrack dirancang untuk semua jenis instansi, dari sekolah hingga perusahaan besar dan instansi pemerintah.'
  },
  {
    question: 'Apakah data tamu aman?',
    answer: 'Ya. Data terenkripsi dan disimpan dengan standar keamanan tinggi. Hanya petugas berwenang yang bisa mengakses.'
  },
  {
    question: 'Apakah ada batasan jumlah tamu atau karyawan?',
    answer: 'Tergantung paket yang dipilih. Paket Starter untuk skala kecil, Business dan Enterprise tanpa batasan.'
  }
]

// Variants untuk animasi container (stagger)
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
} as const;

// Variants untuk setiap item FAQ
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
} as const;

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className="w-full px-5 max-w-3xl mx-auto" ref={ref}>
      <motion.div 
        className="space-y-4 w-full"
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        {faqData.map((item, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            className="w-full border border-gray-200 rounded-xl overflow-hidden transition-shadow duration-200"
            style={{
              boxShadow: hoveredIndex === index ? '0 0 0 2px #002962' : 'none',
            }}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <button
              onClick={() => toggle(index)}
              className="w-full flex items-center justify-between p-5 text-left font-semibold text-lg hover:bg-gray-50 transition cursor-pointer"
            >
              <span>{item.question}</span>
              <motion.div
                animate={{ rotate: openIndex === index ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="transition-opacity duration-200"
                style={{
                  opacity: hoveredIndex === index ? 1 : 0,
                }}
              >
                <ChevronDown className="size-5 text-[#002962]" />
              </motion.div>
            </button>

            <AnimatePresence mode="wait">
              {openIndex === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="p-5 pt-0 text-gray-600 ">
                    {item.answer}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}