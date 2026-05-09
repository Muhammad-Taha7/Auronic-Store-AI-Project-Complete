import React from 'react'
import { API_BASE_URL } from '../config/api'

const getImageSrc = (imageUrl = '') => {
    if (!imageUrl) return ''
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) return imageUrl
    return `${API_BASE_URL}${imageUrl}`
}

const ArrowIcon = ({ direction = 'next' }) => (
    <svg
        className={`h-5 w-5 ${direction === 'prev' ? 'rotate-180' : ''}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
    >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
)

export const Carousel = ({ items = [] }) => {
    const slides = React.useMemo(
        () =>
            items
                .filter((item) => item?.imageUrl)
                .map((item) => ({
                    id: item.id,
                    title: item.title || 'Featured slide',
                    description: item.altText || item.description || '',
                    imageUrl: getImageSrc(item.imageUrl),
                })),
        [items],
    )

    const [activeIndex, setActiveIndex] = React.useState(0)

    React.useEffect(() => {
        if (activeIndex >= slides.length) {
            setActiveIndex(0)
        }
    }, [activeIndex, slides.length])

    React.useEffect(() => {
        if (slides.length <= 1) return undefined

        const intervalId = window.setInterval(() => {
            setActiveIndex((currentIndex) => (currentIndex + 1) % slides.length)
        }, 5000)

        return () => window.clearInterval(intervalId)
    }, [slides.length])

    const handlePrev = () => {
        setActiveIndex((currentIndex) => (currentIndex - 1 + slides.length) % slides.length)
    }

    const handleNext = () => {
        setActiveIndex((currentIndex) => (currentIndex + 1) % slides.length)
    }

    if (slides.length === 0) {
        return (
            <section className=" ">
                <div className="overflow-hidden  border border-black/10 bg-linear-to-br from-slate-950 via-slate-900 to-slate-800 px-6 py-16 text-white shadow-2xl sm:px-10">
                    <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/50">Carousel</p>
                    <h1 className="mt-4 text-3xl font-black uppercase tracking-[0.16em] sm:text-5xl">No slides available</h1>
                    <p className="mt-4 max-w-2xl text-sm leading-6 text-white/70">
                        Add carousel images from the admin panel to show featured content here.
                    </p>
                </div>
            </section>
        )
    }

    const activeSlide = slides[activeIndex] || slides[0]

   return (
  <section>
    <div className="relative overflow-hidden bg-black shadow-[0_30px_80px_rgba(0,0,0,0.22)] ring-1 ring-black/5">

      {/* HEIGHT FIX */}
      <div className="relative min-h-[280px] sm:min-h-[400px] md:min-h-[880px] lg:min-h-[882      python app.pypx]">

        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-black/20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.14),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.08),transparent_30%)]" />

        {/* Slides */}
        {slides.map((slide, index) => (
          <article
            key={slide.id ?? `${slide.title}-${index}`}
            className={`absolute inset-0 transition-all duration-700 ease-out ${
              index === activeIndex
                ? 'opacity-100 scale-100'
                : 'pointer-events-none opacity-0 scale-105'
            }`}
            aria-hidden={index !== activeIndex}
          >
            <img
              src={slide.imageUrl}
              alt={slide.description || slide.title}
              className="h-full w-full object-cover object-center"
              loading={index === 0 ? 'eager' : 'lazy'}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />
          </article>
        ))}

      {/* CONTENT */}
<div className="relative z-10 flex h-full items-center justify-start px-4 sm:px-8 md:px-12 lg:px-16 pt-[5rem] md:pt-[10rem] lg:pt-[17rem]">
  
  <div className="max-w-xs sm:max-w-md md:max-w-lg lg:max-w-2xl text-white">
    
    <p className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] sm:text-xs tracking-[0.25em] sm:tracking-[0.35em] text-white/80">
      Featured Collection
    </p>

    <h2 className="mt-3 sm:mt-5 text-xl sm:text-3xl md:text-4xl lg:text-6xl font-black uppercase leading-tight tracking-wide">
      {activeSlide.title}
    </h2>

    {activeSlide.description && (
      <p className="mt-2 sm:mt-4 text-xs sm:text-sm md:text-base text-white/75 leading-5 sm:leading-7">
        {activeSlide.description}
      </p>
    )}
  </div>
</div>

        {/* DOTS */}
        {slides.length > 1 && (
          <div className="absolute bottom-3 sm:bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5 sm:gap-2 rounded-full border border-white/10 bg-black/40 px-2 sm:px-3 py-1.5 sm:py-2 backdrop-blur-md">
            {slides.map((slide, index) => (
              <button
                key={slide.id ?? `${slide.title}-${index}`}
                onClick={() => setActiveIndex(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === activeIndex
                    ? 'w-6 sm:w-8 bg-white'
                    : 'w-2 bg-white/50 hover:bg-white/80'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  </section>
)
}
