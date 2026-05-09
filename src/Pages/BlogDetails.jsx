import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { API_BASE_URL } from '../config/api'
import { usePageTransition } from '../Transition/Transition.jsx'

export const BlogDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { transitionTo } = usePageTransition()
  const [blog, setBlog] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')

  React.useEffect(() => {
    const loadBlog = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/blogs/${id}`)
        if (!response.ok) {
          throw new Error('Blog not found.')
        }
        const data = await response.json()
        setBlog(data)
      } catch (err) {
        setError(err.message || 'Unable to load blog.')
      } finally {
        setLoading(false)
      }
    }

    loadBlog()
  }, [id])

  const handleBackToBlogs = () => {
    transitionTo(() => {
      navigate('/blogs')
    })
  }

  if (loading) {
    return (
      <main className="bg-white px-4 py-12 text-black sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl rounded-4xl border border-black/10 bg-black px-8 py-20 text-center text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/50">Loading...</p>
        </div>
      </main>
    )
  }

  if (error || !blog) {
    return (
      <main className="bg-white px-4 py-12 text-black sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="rounded-4xl border border-black/10 bg-black px-8 py-20 text-center text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/50">Error</p>
            <h1 className="mt-4 text-3xl font-black uppercase tracking-[0.16em]">{error}</h1>
          </div>
          <button
            type="button"
            onClick={handleBackToBlogs}
            className="w-full rounded-full border border-black px-6 py-3 text-xs font-bold uppercase tracking-[0.25em] text-black transition hover:bg-black hover:text-white"
          >
            Back to Blogs
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="bg-white px-4 py-10 text-black sm:px-6 lg:px-8 lg:py-12">
      <article className="mx-auto max-w-4xl space-y-8">
        <button
          type="button"
          onClick={handleBackToBlogs}
          className="inline-flex rounded-full border border-black px-5 py-2 text-xs font-bold uppercase tracking-[0.2em] text-black transition hover:bg-black hover:text-white"
        >
          ← Back to Blogs
        </button>

        {blog.imageUrl ? (
          <img
            src={blog.imageUrl}
            alt={blog.title}
            className="h-96 w-full rounded-3xl object-cover border border-black/10"
            onError={(e) => {
              e.target.style.display = 'none'
            }}
          />
        ) : (
          <div className="h-96 w-full rounded-3xl bg-gradient-to-br from-black/10 to-black/5 flex items-center justify-center border border-black/10">
            <svg className="h-32 w-32 text-black/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-black/45">
              {new Date(blog.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
            <h1 className="mt-3 text-4xl font-black uppercase tracking-[0.18em] text-black">
              {blog.title}
            </h1>
          </div>

          {blog.description && (
            <p className="text-lg text-black/70 leading-relaxed border-l-4 border-black/20 pl-6">
              {blog.description}
            </p>
          )}
        </div>

        <div className="rounded-3xl border border-black/10 bg-black/5 p-8">
          <div className="prose prose-lg max-w-none text-black">
            {blog.content ? (
              <div className="whitespace-pre-wrap break-words text-base leading-relaxed">
                {blog.content}
              </div>
            ) : (
              <p className="text-black/60">No additional content available.</p>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={handleBackToBlogs}
          className="w-full rounded-full border border-black px-6 py-3 text-xs font-bold uppercase tracking-[0.25em] text-black transition hover:bg-black hover:text-white"
        >
          Back to Blogs
        </button>
      </article>
    </main>
  )
}
