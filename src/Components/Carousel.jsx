import React from 'react'
import { API_BASE_URL } from '../config/api'

export const Carousel = ({ items = [] }) => {
  const [activeIndex, setActiveIndex] = React.useState(0)

  React.useEffect(() => {
    if (!items.length) return undefined

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % items.length)
    }, 5000)

    return () => window.clearInterval(timer)
  }, [items.length])

  React.useEffect(() => {
    if (activeIndex >= items.length) {
      setActiveIndex(0)
    }
  }, [activeIndex, items.length])

  if (!items.length) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-black/10 bg-black px-8 py-20 text-center text-white shadow-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-white/50">Carousel</p>
          <h1 className="mt-4 text-4xl font-black uppercase tracking-[0.25em] sm:text-5xl">No slides yet</h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-white/60">
            Admin can upload images from the Add Carousel Images panel. They will appear here automatically once saved.
          </p>
        </div>
      </section>
    )
  }

  const current = items[activeIndex]
  
  // Handle both URLs and local file paths
  const imageUrl = current.imageUrl.startsWith('http') 
    ? current.imageUrl 
    : `${API_BASE_URL}${current.imageUrl}`

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-[2rem] border border-black/10 bg-black text-white shadow-2xl">
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-zinc-950 sm:aspect-[21/9]">
          <img
            src={imageUrl}
            alt={current.altText}
            className="h-full w-full object-cover opacity-90 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10 lg:p-14">
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-white/50">Featured Slide</p>
            <h1 className="mt-3 max-w-2xl text-3xl font-black uppercase tracking-[0.2em] sm:text-5xl">
              {current.title}
            </h1>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-white/10 bg-white px-6 py-5 text-black sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2">
            {items.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`h-2.5 rounded-full transition-all ${
                  index === activeIndex ? 'w-10 bg-black' : 'w-2.5 bg-black/20'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
          <div className="text-xs font-semibold uppercase tracking-[0.35em] text-black/50">
            {String(activeIndex + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
          </div>
        </div>
      </div>
    </section>
  )
}
