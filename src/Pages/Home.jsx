import React from 'react'
import { Carousel } from '../Components/Carousel'
import { API_BASE_URL } from '../config/api'
import { TrendingProductsSlider } from '../Components/TrendingProductsSlider'
import { Featured } from '../Components/Featured'
import { Reviews } from '../Components/Reviews'

export const Home = () => {
  const [carouselItems, setCarouselItems] = React.useState([])
  const [trendingProducts, setTrendingProducts] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')

  React.useEffect(() => {
    const loadHomepageContent = async () => {
      try {
        const [carouselResponse, productsResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/carousel-images`),
          fetch(`${API_BASE_URL}/api/products?trending=1`),
        ])

        if (!carouselResponse.ok || !productsResponse.ok) {
          throw new Error('Unable to load homepage content.')
        }

        const carouselData = await carouselResponse.json()
        const productData = await productsResponse.json()
        setCarouselItems(Array.isArray(carouselData) ? carouselData : [])
        setTrendingProducts(Array.isArray(productData) ? productData : [])
      } catch {
        setError('Unable to load homepage content right now.')
      } finally {
        setLoading(false)
      }
    }

    loadHomepageContent()
  }, [])

  return (
    <main className="bg-white text-black">
      {loading ? (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="rounded-4xl border border-black/10 bg-black px-8 py-20 text-center text-white">
            <p className="text-sm uppercase tracking-[0.35em] text-white/50">Loading homepage</p>
          </div>
        </section>
      ) : error ? (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="rounded-4xl border border-black/10 bg-black px-8 py-20 text-center text-white">
            <p className="text-sm uppercase tracking-[0.35em] text-white/50">Error</p>
            <h2 className="mt-4 text-2xl font-bold">{error}</h2>
          </div>
        </section>
      ) : (
        <>
          <Carousel items={carouselItems} />
          <TrendingProductsSlider items={trendingProducts} />
          <Featured />
          <Reviews />
        </>
      )}
    </main>
  )
}
