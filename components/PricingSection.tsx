'use client'

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

export default function PricingSection() {
  return (
    <section className="py-20 px-5 bg-linear-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-[#800016] mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-gray-600 text-lg">
            Choose the plan that fits your needs
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Starter */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                {pricingData.starter.name}
              </h3>
              <p className="text-gray-500 text-sm mb-4">
                {pricingData.starter.description}
              </p>
              <div className="mb-4">
                <span className="text-4xl font-bold text-[#800016]">
                  {pricingData.starter.price}
                </span>
                <span className="text-gray-500">{pricingData.starter.period}</span>
              </div>
              <button className="w-full bg-[#800016] text-white py-2 rounded-lg hover:bg-[#A0001C] transition cursor-pointer">
                {pricingData.starter.buttonText}
              </button>
            </div>
            <div className="p-6 space-y-3">
              {pricingData.starter.features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="size-4 text-green-500" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Business (Highlighted) */}
          <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden border-2 border-[#C00021] hover:shadow-2xl transition-shadow duration-300 transform md:-translate-y-4">
            <div className="absolute top-0 right-0 bg-[#C00021] text-white px-4 py-1 rounded-bl-lg text-sm font-semibold">
              POPULAR
            </div>
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-2xl font-bold text-[#800016] mb-2">
                {pricingData.business.name}
              </h3>
              <p className="text-gray-500 text-sm mb-4">
                {pricingData.business.description}
              </p>
              <div className="mb-4">
                <span className="text-4xl font-bold text-[#800016]">
                  {pricingData.business.price}
                </span>
                <span className="text-gray-500">{pricingData.business.period}</span>
              </div>
              <button className="w-full bg-[#C00021] text-white py-2 rounded-lg hover:bg-[#FF002B] transition cursor-pointer">
                {pricingData.business.buttonText}
              </button>
            </div>
            <div className="p-6 space-y-3">
              {pricingData.business.features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="size-4 text-green-500" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Enterprise */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                {pricingData.enterprise.name}
              </h3>
              <p className="text-gray-500 text-sm mb-4">
                {pricingData.enterprise.description}
              </p>
              <div className="mb-4">
                <span className="text-4xl font-bold text-[#800016]">
                  {pricingData.enterprise.price}
                </span>
                <span className="text-gray-500">{pricingData.enterprise.period}</span>
              </div>
              <button className="w-full bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition cursor-pointer">
                {pricingData.enterprise.buttonText}
              </button>
            </div>
            <div className="p-6 space-y-3">
              {pricingData.enterprise.features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="size-4 text-green-500" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footnote */}
        <p className="text-center text-gray-400 text-sm mt-8">
          Additional 100 guests only Rp5,000 
        </p>
      </div>
    </section>
  )
}