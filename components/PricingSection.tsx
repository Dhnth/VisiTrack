'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Check } from 'lucide-react'

const pricingData = {
  starter: {
    name: 'Starter',
    price: 'Rp99.000',
    period: '/ Bulan',
    description: 'Perfect for Small School',
    buttonText: 'Get Started',
    features: [
      '200 tamu per bulan',
      '20 karyawan',
      '1 petugas',
      '1 admin / PPID',
      'QR Code statis',
      'Validasi foto selfie',
      'Statistik & ranking kunjungan',
      'History pengunjung',
      'Export data (CSV)',
      'Log aktivitas dasar',
      'Support email',
    ],
    highlight: false,
  },
  business: {
    name: 'Business',
    price: 'Rp299.000',
    period: '/ Bulan',
    description: 'Perfect for School',
    buttonText: 'Get Started',
    features: [
      '1.000 tamu per bulan',
      '100 karyawan',
      '3 petugas',
      '2 admin / PPID',
      'QR Code statis',
      'QR Code dinamis (refresh otomatis)',
      'Validasi foto selfie',
      'Statistik & ranking kunjungan',
      'History pengunjung',
      'Export data (CSV, Excel, PDF)',
      'Log aktivitas lengkap',
    ],
    highlight: true,
  },
  enterprise: {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'Perfect for Large Enterprise',
    buttonText: 'Contact Us',
    features: [
      'Unlimited tamu per bulan',
      'Unlimited karyawan',
      'Unlimited petugas',
      'Unlimited admin / PPID',
      'QR Code statis',
      'QR Code dinamis (refresh otomatis)',
      'Validasi foto selfie',
      'Statistik & ranking kunjungan',
      'History pengunjung',
      'Export data (CSV, Excel, PDF)',
      'Log aktivitas lengkap',
      'Dedicated support (24/7)',
      'Custom contract',
    ],
    highlight: false,
  },
}

// Variants untuk animasi container
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
} as const;

// Variants untuk setiap kartu
const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
} as const;

export default function PricingSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section className="py-16 sm:py-20 px-4 sm:px-6 bg-gradient-to-b from-white to-gray-50" ref={ref}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          className="text-center mb-10 sm:mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#800016] mb-3 sm:mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-gray-600 text-base sm:text-lg">
            Choose the plan that fits your needs
          </p>
        </motion.div>

        {/* Pricing Cards - Responsive grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {/* Starter */}
          <motion.div 
            variants={cardVariants}
            whileHover={{ y: -8, transition: { duration: 0.2 } }}
            className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow duration-300 h-full flex flex-col"
          >
            <div className="p-5 sm:p-6 border-b border-gray-100">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                {pricingData.starter.name}
              </h3>
              <p className="text-gray-500 text-xs sm:text-sm mb-4">
                {pricingData.starter.description}
              </p>
              <div className="mb-4">
                <span className="text-3xl sm:text-4xl font-bold text-[#800016]">
                  {pricingData.starter.price}
                </span>
                <span className="text-gray-500 text-sm sm:text-base">{pricingData.starter.period}</span>
              </div>
              <motion.button 
                className="w-full bg-[#800016] text-white py-2 rounded-lg hover:bg-[#A0001C] transition cursor-pointer text-sm sm:text-base"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {pricingData.starter.buttonText}
              </motion.button>
            </div>
            <div className="p-5 sm:p-6 space-y-2 sm:space-y-3 flex-1">
              {pricingData.starter.features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                  <Check className="size-3 sm:size-4 text-green-500 flex-shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Business (Highlighted) - Responsive transform */}
          <motion.div 
            variants={cardVariants}
            whileHover={{ y: -8, transition: { duration: 0.2 } }}
            className="relative bg-white rounded-2xl shadow-2xl overflow-hidden border-2 border-[#C00021] hover:shadow-2xl transition-shadow duration-300 h-full flex flex-col lg:-translate-y-4"
          >
            <div className="absolute top-0 right-0 bg-[#C00021] text-white px-3 sm:px-4 py-1 rounded-bl-lg text-xs sm:text-sm font-semibold">
              POPULAR
            </div>
            <div className="p-5 sm:p-6 border-b border-gray-100">
              <h3 className="text-xl sm:text-2xl font-bold text-[#800016] mb-2">
                {pricingData.business.name}
              </h3>
              <p className="text-gray-500 text-xs sm:text-sm mb-4">
                {pricingData.business.description}
              </p>
              <div className="mb-4">
                <span className="text-3xl sm:text-4xl font-bold text-[#800016]">
                  {pricingData.business.price}
                </span>
                <span className="text-gray-500 text-sm sm:text-base">{pricingData.business.period}</span>
              </div>
              <motion.button 
                className="w-full bg-[#C00021] text-white py-2 rounded-lg hover:bg-[#FF002B] transition cursor-pointer text-sm sm:text-base"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {pricingData.business.buttonText}
              </motion.button>
            </div>
            <div className="p-5 sm:p-6 space-y-2 sm:space-y-3 flex-1">
              {pricingData.business.features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                  <Check className="size-3 sm:size-4 text-green-500 flex-shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Enterprise */}
          <motion.div 
            variants={cardVariants}
            whileHover={{ y: -8, transition: { duration: 0.2 } }}
            className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow duration-300 h-full flex flex-col"
          >
            <div className="p-5 sm:p-6 border-b border-gray-100">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                {pricingData.enterprise.name}
              </h3>
              <p className="text-gray-500 text-xs sm:text-sm mb-4">
                {pricingData.enterprise.description}
              </p>
              <div className="mb-4">
                <span className="text-3xl sm:text-4xl font-bold text-[#800016]">
                  {pricingData.enterprise.price}
                </span>
                <span className="text-gray-500 text-sm sm:text-base">{pricingData.enterprise.period}</span>
              </div>
              <motion.button 
                className="w-full bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition cursor-pointer text-sm sm:text-base"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {pricingData.enterprise.buttonText}
              </motion.button>
            </div>
            <div className="p-5 sm:p-6 space-y-2 sm:space-y-3 flex-1">
              {pricingData.enterprise.features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                  <Check className="size-3 sm:size-4 text-green-500 flex-shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Footnote */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.8 }}
          className="text-center text-gray-400 text-xs sm:text-sm mt-8"
        >
          Additional 100 guests only Rp5,000 
        </motion.p>
      </div>
    </section>
  )
}