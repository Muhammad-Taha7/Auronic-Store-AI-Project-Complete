import React from 'react'
import { useNavigate } from 'react-router-dom'
import { FaArrowLeft, FaArrowRight, FaStar } from 'react-icons/fa'
import { API_BASE_URL } from '../config/api'

const getImageSrc = (imageUrl = '') => {
  if (!imageUrl) return ''
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) return imageUrl
  return `${API_BASE_URL}${imageUrl}`
}

export const TrendingProductsSlider = ({ items = [] }) => {
  const navigate = useNavigate()
  const scrollerRef = React.useRef(null)

  const scroll = (direction) => {
    const scroller = scrollerRef.current
    if (!scroller) return
    const amount = direction === 'left' ? -380 : 380
    scroller.scrollBy({ left: amount, behavior: 'smooth' })
  }

  return (
    <section className="relative md:px-[25rem]  px-4 py-10 sm:px-6 ">
      <div className="absolute inset-x-4 top-0 h-44 rounded-4xl sm:inset-x-6 lg:inset-x-8" />

      <div className="relative flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-black/45">Trending Products</p>
          <h2 className="mt-2 text-3xl font-black uppercase tracking-[0.14em] text-black sm:text-4xl">Featured Collection</h2>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-black/60">
            Carefully selected products highlighted for this week. Premium quality with complete details and customization.
          </p>
        </div>

        <div className="hidden gap-2 sm:flex">
          <button
            type="button"
            onClick={() => scroll('left')}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white text-black shadow-sm transition hover:bg-black hover:text-white"
            aria-label="Scroll trending products left"
          >
            <FaArrowLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => scroll('right')}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white text-black shadow-sm transition hover:bg-black hover:text-white"
            aria-label="Scroll trending products right"
          >
            <FaArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="mt-6 rounded-4xl border border-black/10 bg-black px-8 py-16 text-center text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/45">No Trending Products</p>
          <h3 className="mt-3 text-2xl font-black uppercase tracking-[0.12em]">Products will appear here</h3>
          <p className="mt-3 text-sm leading-6 text-white/70">Add trending products from admin and they will appear in this featured row.</p>
        </div>
      ) : (
       <div
  ref={scrollerRef}
  className="mt-8 flex gap-5 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
>
  {items.map((item) => (
    <article
      key={item.id}
      className="group min-w-80 max-w-90 flex-1 overflow-hidden border border-black/10 bg-white shadow-[0_16px_40px_rgba(0,0,0,0.10)] transition duration-300 flex flex-col"
    >
      <button
        type="button"
        onClick={() => navigate(`/products/${item.id}`)}
        className="w-full text-left flex flex-col h-full"
      >
        {/* IMAGE */}
        <div className="relative h-90 overflow-hidden bg-black/5">
          <img
            src={getImageSrc(item.coverImage)}
            alt={item.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />

          <div className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-black/70 to-transparent" />

          {/* RATING */}
          <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-black px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-white">
            <FaStar className="text-yellow-400" />
            {Number(item.rating || 0).toFixed(1)}
          </div>

          {/* BADGE */}
          {item.badge && (
            <div className="absolute right-4 top-4 rounded-full border border-white/20 bg-white/90 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-black">
              {item.badge}
            </div>
          )}

          <p className="absolute bottom-3 left-4 text-xs font-semibold uppercase tracking-[0.24em] text-white/90">
            {item.category || "Trending"}
          </p>
        </div>

        {/* CONTENT */}
        <div className="flex flex-col flex-1 space-y-3 p-5">
          <h3 className="line-clamp-2 text-xl font-black uppercase tracking-[0.08em] text-black">
            {item.title}
          </h3>

          <p className="line-clamp-2 text-sm leading-6 text-black/60">
            {item.description}
          </p>

          {/* PRICE + BUTTON FIXED ALIGNMENT */}
          <div className="mt-auto flex items-end justify-between gap-3 pt-4">
            <div>
              <p className="text-2xl font-black text-black">
                Rs. {Number(item.price || 0).toLocaleString()}
              </p>

              {item.originalPrice && (
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/40 line-through">
                  Rs. {Number(item.originalPrice).toLocaleString()}
                </p>
              )}
            </div>

            <span className="border border-black px-4 py-2 text-[11px] font-bold uppercase tracking-[0.24em] text-black transition group-hover:bg-black group-hover:text-white">
              View Product
            </span>
          </div>
        </div>
      </button>
    </article>
  ))}
</div>
      )}
    </section>
  )
}
