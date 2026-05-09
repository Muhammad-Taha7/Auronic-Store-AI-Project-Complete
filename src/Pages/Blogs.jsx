import React from 'react'
import { useNavigate } from 'react-router-dom'
import { API_BASE_URL } from '../config/api'
import { usePageTransition } from '../Transition/Transition.jsx'

export const Blogs = () => {
  const navigate = useNavigate()
  const { transitionTo } = usePageTransition()
  const [blogs, setBlogs] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')

  React.useEffect(() => {
    const loadBlogs = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/blogs`)
        if (!response.ok) {
          throw new Error('Unable to load blogs right now.')
        }
        const data = await response.json()
        setBlogs(Array.isArray(data) ? data : [])
      } catch (err) {
        setError(err.message || 'Unable to load blogs right now.')
      } finally {
        setLoading(false)
      }
    }

    loadBlogs()
  }, [])

  const handleReadMore = (blogId) => {
    transitionTo(() => {
      navigate(`/blogs/${blogId}`)
    })
  }

  if (loading) {
    return (
      <main className="bg-white px-4 py-12 text-black sm:px-6 lg:px-8">
        <div className=" rounded-4xl border border-black/10 bg-black px-8 py-20 text-center text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/50">Loading...</p>
          <h1 className="mt-4 text-3xl font-black uppercase tracking-[0.16em]">Please Wait</h1>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="bg-white px-4 py-12 text-black sm:px-6 lg:px-8">
        <div className=" rounded-4xl border border-black/10 bg-black px-8 py-20 text-center text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/50">Error</p>
          <h1 className="mt-4 text-3xl font-black uppercase tracking-[0.16em]">{error}</h1>
        </div>
      </main>
    )
  }

  return (
    <main className="bg-white px-4 py-10 text-black sm:px-6 lg:px-8 lg:py-12">
      <section className="mx-auto max-w-7xl space-y-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-black/45">Blogs</p>
          <h1 className="mt-3 text-4xl font-black uppercase tracking-[0.18em]">Latest Articles</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-black/60">
            Discover the latest articles, tips, and insights about technology, products, and more.
          </p>
        </div>

        {blogs.length === 0 ? (
          <div className="rounded-4xl border border-black/10 bg-black px-8 py-16 text-center text-white">
            <p className="text-sm uppercase tracking-[0.35em] text-white/50">No blogs yet</p>
            <h2 className="mt-4 text-2xl font-bold">No articles available at this time.</h2>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {blogs.map((blog) => (
              <article
                key={blog.id}
                className="group rounded-2xl border border-black/10 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.08)] overflow-hidden hover:shadow-[0_16px_40px_rgba(0,0,0,0.15)] transition-all duration-300"
              >
                {blog.imageUrl ? (
                  <div className="h-48 w-full overflow-hidden bg-black/5">
                    <img
                      src={blog.imageUrl}
                      alt={blog.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        e.target.style.display = 'none'
                      }}
                    />
                  </div>
                ) : (
                  <div className="h-48 w-full bg-gradient-to-br from-black/10 to-black/5 flex items-center justify-center">
                    <svg className="h-16 w-16 text-black/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                <div className="p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-black/45">
                    {new Date(blog.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                  <h2 className="mt-3 text-lg font-black uppercase tracking-[0.08em] line-clamp-2 text-black">
                    {blog.title}
                  </h2>
                  <p className="mt-3 text-sm text-black/65 line-clamp-3">
                    {blog.description || blog.content?.substring(0, 150)}
                  </p>
                  <button
                    type="button"
                    onClick={() => handleReadMore(blog.id)}
                    className="mt-5 inline-flex rounded-full border border-black px-5 py-2 text-xs font-bold uppercase tracking-[0.2em] text-black transition hover:bg-black hover:text-white"
                  >
                    Read More
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
