import React, { useState, useEffect } from 'react'

export const Reviews = () => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [reviewsPerView, setReviewsPerView] = useState(3)

  // 10 Professional Reviews
  const reviews = [
    {
      id: 1,
      name: "Ahmad Raza",
      location: "Lahore, Pakistan",
      rating: 5,
      date: "March 15, 2026",
      title: "Absolutely Outstanding Product!",
      review: "The build quality is exceptional and exceeds my expectations. Performance is smooth, battery life is impressive, and the design is sleek. Worth every penny. Highly recommended for anyone looking for premium quality.",
      avatar: "AR",
      verified: true,
      product: "Auronic Pro X1",
    },
    {
      id: 2,
      name: "Sara Khan",
      location: "Karachi, Pakistan",
      rating: 5,
      date: "March 12, 2026",
      title: "Best investment I've made this year",
      review: "I've been using this for 3 weeks now and I'm completely satisfied. The customer service is responsive, delivery was fast, and the product works flawlessly. The attention to detail is remarkable.",
      avatar: "SK",
      verified: true,
      product: "Auronic Smart Watch",
    },
    {
      id: 3,
      name: "Bilal Ahmed",
      location: "Islamabad, Pakistan",
      rating: 4,
      date: "March 10, 2026",
      title: "Great value for money",
      review: "Solid product with excellent features. The setup was straightforward and it integrates well with other devices. Minor suggestion for the app interface, but overall very satisfied with my purchase.",
      avatar: "BA",
      verified: true,
      product: "Auronic Buds Pro",
    },
    {
      id: 4,
      name: "Fatima Zafar",
      location: "Rawalpindi, Pakistan",
      rating: 5,
      date: "March 8, 2026",
      title: "Exceeded all my expectations",
      review: "I was hesitant at first but decided to give it a try. So glad I did! The quality is top-notch and it looks even better in person. Customer support was very helpful with my questions.",
      avatar: "FZ",
      verified: true,
      product: "Auronic Desk Lamp",
    },
    {
      id: 5,
      name: "Usman Chaudhry",
      location: "Multan, Pakistan",
      rating: 5,
      date: "March 5, 2026",
      title: "Premium quality, premium service",
      review: "This is my second purchase from Auronic and once again I'm impressed. The shipping was quick, packaging was secure, and the product works perfectly. Keep up the great work!",
      avatar: "UC",
      verified: true,
      product: "Auronic Power Bank",
    },
    {
      id: 6,
      name: "Hira Naeem",
      location: "Faisalabad, Pakistan",
      rating: 4,
      date: "March 3, 2026",
      title: "Very good, minor improvements needed",
      review: "Overall a fantastic product. The design is elegant and functionality is great. Would love to see more color options in the future. Still, very happy with my decision to buy.",
      avatar: "HN",
      verified: true,
      product: "Auronic Speaker",
    },
    {
      id: 7,
      name: "Omar Farooq",
      location: "Peshawar, Pakistan",
      rating: 5,
      date: "February 28, 2026",
      title: "Game changer!",
      review: "This has completely transformed my workflow. The efficiency gains are noticeable from day one. Build quality is solid and it feels durable. Definitely worth the investment.",
      avatar: "OF",
      verified: true,
      product: "Auronic Dock Station",
    },
    {
      id: 8,
      name: "Zainab Ali",
      location: "Quetta, Pakistan",
      rating: 5,
      date: "February 25, 2026",
      title: "Beautiful design, amazing performance",
      review: "I'm in love with this product! Not only does it perform exceptionally well, but it also looks stunning on my desk. The unboxing experience was delightful too. 10/10 recommend.",
      avatar: "ZA",
      verified: true,
      product: "Auronic Monitor Light",
    },
    {
      id: 9,
      name: "Hassan Rizvi",
      location: "Gujranwala, Pakistan",
      rating: 4,
      date: "February 22, 2026",
      title: "Reliable and efficient",
      review: "Been using this daily for a month now. No issues whatsoever. Battery life is as advertised and the connectivity is stable. A reliable product from a trustworthy brand.",
      avatar: "HR",
      verified: true,
      product: "Auronic Mouse",
    },
    {
      id: 10,
      name: "Ayesha Mahmood",
      location: "Sialkot, Pakistan",
      rating: 5,
      date: "February 20, 2026",
      title: "Customer for life!",
      review: "This is my third Auronic product and they never disappoint. The quality consistency across their product line is impressive. Excellent customer service and fast shipping.",
      avatar: "AM",
      verified: true,
      product: "Auronic Keyboard",
    },
  ]

  // Calculate average rating
  const averageRating = (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
  const fiveStarCount = reviews.filter(r => r.rating === 5).length
  const fourStarCount = reviews.filter(r => r.rating === 4).length

  // Handle responsive slides
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setReviewsPerView(1)
      } else if (window.innerWidth < 1024) {
        setReviewsPerView(2)
      } else {
        setReviewsPerView(3)
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const totalSlides = Math.ceil(reviews.length / reviewsPerView)
  const maxIndex = totalSlides - 1

  const nextSlide = () => {
    if (isAnimating) return
    setIsAnimating(true)
    setCurrentIndex((prev) => (prev === maxIndex ? 0 : prev + 1))
    setTimeout(() => setIsAnimating(false), 500)
  }

  const prevSlide = () => {
    if (isAnimating) return
    setIsAnimating(true)
    setCurrentIndex((prev) => (prev === 0 ? maxIndex : prev - 1))
    setTimeout(() => setIsAnimating(false), 500)
  }

  const goToSlide = (index) => {
    if (isAnimating) return
    setIsAnimating(true)
    setCurrentIndex(index)
    setTimeout(() => setIsAnimating(false), 500)
  }

  const visibleReviews = reviews.slice(
    currentIndex * reviewsPerView,
    currentIndex * reviewsPerView + reviewsPerView
  )

  // Star Rating Component
  const StarRating = ({ rating }) => {
    return (
      <div className="flex gap-0.5">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className={`w-4 h-4 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-black/50">Testimonials</p>
          <h2 className="mt-3 text-3xl md:text-4xl font-black uppercase tracking-[0.08em] text-black">
            What Our Customers Say
          </h2>
          <div className="mt-4 flex items-center justify-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-2xl font-bold text-black">{averageRating}</span>
              <span className="text-sm text-gray-500">out of 5</span>
            </div>
            <div className="w-px h-6 bg-gray-300"></div>
            <div className="text-sm text-gray-600">
              Based on {reviews.length} reviews
            </div>
            <div className="w-px h-6 bg-gray-300"></div>
            <div className="flex gap-3">
              <div className="flex items-center gap-1">
                <span className="text-xs font-semibold">★★★★★</span>
                <span className="text-xs text-gray-600">({fiveStarCount})</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs font-semibold">★★★★☆</span>
                <span className="text-xs text-gray-600">({fourStarCount})</span>
              </div>
            </div>
          </div>
          <p className="mt-4 text-sm text-gray-500 max-w-2xl mx-auto">
            Real reviews from real customers. Join thousands of satisfied Auronic users worldwide.
          </p>
        </div>

        {/* Reviews Slider */}
        <div className="relative">
          {/* Navigation Buttons */}
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 md:-translate-x-4 z-10 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 focus:outline-none"
            aria-label="Previous reviews"
          >
            <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 md:translate-x-4 z-10 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 focus:outline-none"
            aria-label="Next reviews"
          >
            <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Slides Container */}
          <div className="overflow-hidden px-8">
            <div
              className={`flex gap-6 transition-transform duration-500 ease-in-out ${isAnimating ? 'opacity-90' : 'opacity-100'}`}
              style={{ transform: `translateX(0%)` }}
            >
              {visibleReviews.map((review) => (
                <div
                  key={review.id}
                  className="flex-shrink-0 w-full md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]"
                >
                  <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 h-full flex flex-col">
                    
                    {/* Rating & Verified Badge */}
                    <div className="flex justify-between items-start mb-3">
                      <StarRating rating={review.rating} />
                      {review.verified && (
                        <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Verified
                        </span>
                      )}
                    </div>

                    {/* Review Title */}
                    <h3 className="font-bold text-lg text-gray-900 mb-2">
                      {review.title}
                    </h3>

                    {/* Review Text */}
                    <p className="text-gray-600 text-sm leading-relaxed mb-4 flex-grow">
                      "{review.review}"
                    </p>

                    {/* Customer Info */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-black to-gray-700 flex items-center justify-center text-white text-sm font-semibold">
                          {review.avatar}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{review.name}</p>
                          <p className="text-xs text-gray-400">{review.location}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400">{review.date}</p>
                        <p className="text-xs font-medium text-gray-500 mt-0.5">{review.product}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-8">
            {[...Array(totalSlides)].map((_, idx) => (
              <button
                key={idx}
                onClick={() => goToSlide(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentIndex === idx
                    ? 'w-8 bg-black'
                    : 'w-2 bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <svg className="w-8 h-8 mx-auto text-gray-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <p className="text-xs font-semibold uppercase tracking-wide">100% Secure</p>
              <p className="text-xs text-gray-500 mt-1">SSL Encrypted</p>
            </div>
            <div>
              <svg className="w-8 h-8 mx-auto text-gray-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <p className="text-xs font-semibold uppercase tracking-wide">Easy Returns</p>
              <p className="text-xs text-gray-500 mt-1">30-Day Policy</p>
            </div>
            <div>
              <svg className="w-8 h-8 mx-auto text-gray-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xs font-semibold uppercase tracking-wide">Fast Shipping</p>
              <p className="text-xs text-gray-500 mt-1">2-3 Business Days</p>
            </div>
            <div>
              <svg className="w-8 h-8 mx-auto text-gray-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              <p className="text-xs font-semibold uppercase tracking-wide">24/7 Support</p>
              <p className="text-xs text-gray-500 mt-1">Always Here to Help</p>
            </div>
          </div>
        </div>

      
      </div>
    </div>
  )
}