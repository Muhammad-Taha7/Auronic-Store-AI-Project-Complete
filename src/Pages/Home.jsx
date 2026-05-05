import React from 'react'
import { Carousel } from '../Components/Carousel'
import { API_BASE_URL } from '../config/api'

export const Home = () => {
  const [items, setItems] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')

  React.useEffect(() => {
    const loadCarousel = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/carousel-images`)
        if (!response.ok) {
          throw new Error('Unable to load homepage carousel.')
        }
        const data = await response.json()
        setItems(Array.isArray(data) ? data : [])
      } catch {
        setError('Unable to load homepage carousel right now.')
      } finally {
        setLoading(false)
      }
    }

    loadCarousel()
  }, [])

  return (
    <main className="bg-white text-black">
      <section className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-black/45">Homepage</p>
          <h1 className="mt-4 text-4xl font-black uppercase tracking-[0.2em] sm:text-6xl">Featured Carousel</h1>
          <p className="mt-4 text-sm leading-6 text-black/60">
            The hero slider below is driven by the admin carousel upload screen and backed by MySQL.
          </p>
        </div>
      </section>

      {loading ? (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="rounded-[2rem] border border-black/10 bg-black px-8 py-20 text-center text-white">
            <p className="text-sm uppercase tracking-[0.35em] text-white/50">Loading carousel</p>
          </div>
        </section>
      ) : error ? (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="rounded-[2rem] border border-black/10 bg-black px-8 py-20 text-center text-white">
            <p className="text-sm uppercase tracking-[0.35em] text-white/50">Error</p>
            <h2 className="mt-4 text-2xl font-bold">{error}</h2>
          </div>
        </section>
      ) : (
        <Carousel items={items} />
      )}
    </main>
  )
}
