import React, { useState } from 'react'
import { API_BASE_URL } from '../config/api'

export const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus(null)
    try {
      const res = await fetch(`${API_BASE_URL}/api/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        setSubmitStatus('success')
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' })
        setTimeout(() => setSubmitStatus(null), 5000)
      } else {
        const data = await res.json().catch(() => ({}))
        setSubmitStatus(data.message || 'error')
      }
    } catch (err) {
      console.error('Contact submit error', err)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const contactInfo = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      title: 'Visit Us',
      details: ['123 Auronic Street', 'Tech District', 'Karachi, Pakistan'],
      link: null,
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
      title: 'Call Us',
      details: ['+92 300 1234567', '+92 21 3456789'],
      link: 'tel:+923001234567',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      title: 'Email Us',
      details: ['support@auronic.com', 'sales@auronic.com'],
      link: 'mailto:support@auronic.com',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Business Hours',
      details: ['Mon-Fri: 9AM - 8PM', 'Sat: 10AM - 6PM', 'Sun: Closed'],
      link: null,
    },
  ]

  const faqs = [
    {
      question: 'How long does shipping take?',
      answer: 'Standard shipping takes 3-5 business days within major cities, and 5-7 business days for remote areas. Express shipping is available for 1-2 business days delivery.',
    },
    {
      question: 'What is your return policy?',
      answer: 'We offer a 30-day hassle-free return policy. If you\'re not completely satisfied with your purchase, you can return it within 30 days for a full refund or exchange.',
    },
    {
      question: 'Do you offer international shipping?',
      answer: 'Currently, we ship within Pakistan only. We are working on expanding internationally and hope to offer international shipping by end of 2026.',
    },
    {
      question: 'How can I track my order?',
      answer: 'Once your order is shipped, you will receive a tracking number via email and SMS. You can use this number on our Track Order page to check real-time status.',
    },
    {
      question: 'Do you provide warranty on products?',
      answer: 'Yes, all Auronic products come with a 1-year manufacturer warranty covering any manufacturing defects. Extended warranty options are available for select products.',
    },
    {
      question: 'Can I change or cancel my order?',
      answer: 'Orders can be modified or cancelled within 2 hours of placement. Please contact our support team immediately with your order number for assistance.',
    },
  ]

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-black via-gray-900 to-black text-white py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-gray-400">Get in Touch</p>
          <h1 className="mt-4 text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-[0.08em]">
            Contact Us
          </h1>
          <div className="w-20 h-1 bg-white/30 mx-auto mt-6"></div>
          <p className="mt-6 text-base text-gray-300 max-w-2xl mx-auto">
            Have questions? We'd love to hear from you. Our team is here to help you with any inquiries.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Contact Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {contactInfo.map((info, index) => (
            <div
              key={index}
              className="bg-white border border-gray-100 rounded-2xl p-6 text-center shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
            >
              <div className="w-14 h-14 bg-black/5 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-black group-hover:text-white transition-colors duration-300">
                <div className="text-black group-hover:text-white transition-colors duration-300">
                  {info.icon}
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">{info.title}</h3>
              <div className="space-y-1">
                {info.details.map((detail, i) => (
                  <p key={i} className="text-sm text-gray-600">
                    {detail}
                  </p>
                ))}
              </div>
              {info.link && (
                <a
                  href={info.link}
                  className="inline-block mt-4 text-xs font-semibold text-black hover:underline"
                >
                  Contact Now →
                </a>
              )}
            </div>
          ))}
        </div>

        {/* Contact Form & Map Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          {/* Contact Form */}
          <div className="bg-gray-50 rounded-3xl p-8 shadow-sm">
            <div className="mb-8">
              <h2 className="text-2xl font-black uppercase tracking-[0.08em] text-gray-900">
                Send us a Message
              </h2>
              <div className="w-12 h-0.5 bg-black mt-3"></div>
              <p className="mt-4 text-sm text-gray-600">
                Fill out the form below and we'll get back to you within 24 hours.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black/30 transition-all"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black/30 transition-all"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black/30 transition-all"
                    placeholder="+92 300 1234567"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-gray-700 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black/30 transition-all"
                    placeholder="Order Inquiry, Support, etc."
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="5"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black/30 transition-all resize-none"
                  placeholder="Tell us how we can help..."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-black text-white py-3 rounded-xl font-semibold text-sm uppercase tracking-wide hover:bg-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Sending...
                  </div>
                ) : (
                  'Send Message'
                )}
              </button>

              {submitStatus === 'success' && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm text-center animate-fadeIn">
                  ✓ Message sent successfully! We'll get back to you soon.
                </div>
              )}
            </form>
          </div>

          {/* Map & Office Info */}
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-3xl overflow-hidden shadow-sm h-[320px]">
              <iframe
                title="Auronic Office Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d57897.62440912445!2d66.98751855!3d24.86073495!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3eb3150f2e9c1b7d%3A0x8e5e8e5e8e5e8e5e!2sKarachi%2C%20Pakistan!5e0!3m2!1sen!2s!4v1700000000000!5m2!1sen!2s"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>

            <div className="bg-gradient-to-br from-black to-gray-800 text-white rounded-3xl p-8">
              <h3 className="text-xl font-bold mb-4">Why Choose Auronic?</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-gray-300 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-gray-200">Premium quality products with 1-year warranty</p>
                </div>
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-gray-300 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-gray-200">Fast and reliable shipping across Pakistan</p>
                </div>
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-gray-300 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-gray-200">24/7 dedicated customer support</p>
                </div>
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-gray-300 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-gray-200">30-day hassle-free return policy</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="border-t border-gray-100 pt-16">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-black/50">FAQ</p>
            <h2 className="mt-3 text-2xl md:text-3xl font-black uppercase tracking-[0.08em] text-gray-900">
              Frequently Asked Questions
            </h2>
            <div className="w-12 h-0.5 bg-black mx-auto mt-4"></div>
            <p className="mt-4 text-sm text-gray-600 max-w-2xl mx-auto">
              Can't find what you're looking for? Check out our most common questions below.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="group cursor-pointer"
              >
                <div className="bg-gray-50 rounded-2xl p-6 hover:shadow-md transition-all duration-300">
                  <h3 className="font-bold text-gray-900 mb-2 flex items-start gap-2">
                    <span className="text-black text-lg">Q.</span>
                    {faq.question}
                  </h3>
                  <p className="text-sm text-gray-600 pl-6">
                    {faq.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Social Connect */}
        <div className="mt-16 pt-8 border-t border-gray-100 text-center">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-4">
            Connect With Us
          </h3>
          <div className="flex justify-center gap-4">
            <a href="#" className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-black hover:text-white transition-all duration-200">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
              </svg>
            </a>
            <a href="#" className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-black hover:text-white transition-all duration-200">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069z" />
              </svg>
            </a>
            <a href="#" className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-black hover:text-white transition-all duration-200">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 0021.482-11.93c0-.213-.005-.426-.015-.637a10.003 10.003 0 002.456-2.553z" />
              </svg>
            </a>
            <a href="#" className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-black hover:text-white transition-all duration-200">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}