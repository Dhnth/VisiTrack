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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
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
    <div className="w-full" ref={ref}>
      <motion.div 
        className="space-y-3 sm:space-y-4 w-full"
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        {faqData.map((item, index) => {
          const isOpen = openIndex === index
          
          return (
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
                className="w-full flex items-center justify-between p-4 sm:p-5 text-left hover:bg-gray-50 transition cursor-pointer"
              >
                <span className="pr-4 text-sm sm:text-base lg:text-lg font-semibold text-gray-800">
                  {item.question}
                </span>
                <motion.div
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="flex-shrink-0"
                >
                  <ChevronDown className="size-4 sm:size-5 text-[#002962]" />
                </motion.div>
              </button>

              <AnimatePresence mode="wait">
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ 
                      height: "auto", 
                      opacity: 1,
                      transition: {
                        height: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
                        opacity: { duration: 0.3, delay: 0.1 }
                      }
                    }}
                    exit={{ 
                      height: 0, 
                      opacity: 0,
                      transition: {
                        height: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
                        opacity: { duration: 0.2 }
                      }
                    }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 sm:p-5 pt-0 text-gray-600 text-sm sm:text-base">
                      {item.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </motion.div>
    </div>
  )
}