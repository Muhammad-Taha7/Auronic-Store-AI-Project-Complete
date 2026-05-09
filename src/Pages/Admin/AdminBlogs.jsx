import React from 'react'
import { API_BASE_URL } from '../../config/api'

export const AdminBlogs = () => {
  const [blogs, setBlogs] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')
  const [showForm, setShowForm] = React.useState(false)
  const [editingId, setEditingId] = React.useState(null)
  const [submitting, setSubmitting] = React.useState(false)
  const [formData, setFormData] = React.useState({
    title: '',
    description: '',
    content: '',
    imageUrl: '',
  })

  const loadBlogs = React.useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`${API_BASE_URL}/api/blogs`)
      if (!response.ok) {
        throw new Error('Unable to load blogs.')
      }
      const data = await response.json()
      setBlogs(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message || 'Unable to load blogs.')
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadBlogs()
  }, [loadBlogs])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    if (!formData.title.trim()) {
      setError('Title is required.')
      setSubmitting(false)
      return
    }

    if (!formData.content.trim()) {
      setError('Content is required.')
      setSubmitting(false)
      return
    }

    try {
      const url = editingId
        ? `${API_BASE_URL}/api/blogs/${editingId}`
        : `${API_BASE_URL}/api/blogs`
      const method = editingId ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || `Unable to save blog: ${response.statusText}`)
      }

      setFormData({
        title: '',
        description: '',
        content: '',
        imageUrl: '',
      })
      setEditingId(null)
      setShowForm(false)
      await loadBlogs()
    } catch (err) {
      console.error('Blog save error:', err)
      setError(err.message || 'Unable to save blog.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (blog) => {
    setFormData({
      title: blog.title,
      description: blog.description || '',
      content: blog.content,
      imageUrl: blog.imageUrl || '',
    })
    setEditingId(blog.id)
    setShowForm(true)
    setError('')
  }

  const handleDelete = async (blogId) => {
    if (!window.confirm('Are you sure you want to delete this blog?')) {
      return
    }

    setError('')
    try {
      const response = await fetch(`${API_BASE_URL}/api/blogs/${blogId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Unable to delete blog.')
      }

      await loadBlogs()
    } catch (err) {
      setError(err.message || 'Unable to delete blog.')
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingId(null)
    setFormData({
      title: '',
      description: '',
      content: '',
      imageUrl: '',
    })
    setError('')
  }

  const handleAddSample = async () => {
    const sampleBlog = {
      title: 'Getting Started with Technology',
      description: 'A beginner-friendly guide to understanding modern technology and how it impacts our daily lives.',
      content: `Welcome to our blog! In this article, we explore the fundamentals of technology and its importance in today's world.

Key Topics:
- Understanding the basics of digital technology
- How smartphones revolutionized communication
- The impact of cloud computing
- Future trends in artificial intelligence

Technology is continuously evolving, and it's important to stay updated with the latest trends and developments. Whether you're a tech enthusiast or just curious about how things work, this blog is here to provide you with valuable insights and information.

From artificial intelligence to blockchain, we cover a wide range of topics that will help you understand the digital world better. So buckle up and let's dive into the fascinating world of technology!`,
      imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80',
    }

    setFormData(sampleBlog)
    setShowForm(true)
  }

  return (
    <div className="space-y-6 text-black">
      <div className="rounded-3xl border border-black/10 bg-black p-8 text-white shadow-lg">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/50">Blogs</p>
        <h2 className="mt-3 text-3xl font-black uppercase tracking-[0.18em]">Blog Management</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-white/70">
          Create, edit, and manage all blog articles. Add new blogs with title, description, content, and images.
        </p>
      </div>

      {!showForm && (
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => {
              setShowForm(true)
              setEditingId(null)
              setFormData({
                title: '',
                description: '',
                content: '',
                imageUrl: '',
              })
              setError('')
            }}
            className="rounded-full border border-black bg-black px-6 py-3 text-xs font-bold uppercase tracking-[0.25em] text-white transition hover:bg-black/90"
          >
            + Add New Blog
          </button>
          <button
            type="button"
            onClick={handleAddSample}
            className="rounded-full border border-black/20 bg-white px-6 py-3 text-xs font-bold uppercase tracking-[0.25em] text-black transition hover:bg-black/5"
          >
            📝 Add Sample Blog
          </button>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-black/10 bg-white p-6">
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-[0.28em] text-black/50">
              Blog Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full rounded-xl border border-black/10 px-4 py-3 text-sm text-black focus:border-black focus:outline-none"
              placeholder="Enter blog title"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-[0.28em] text-black/50">
              Description (Optional)
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={2}
              className="w-full rounded-xl border border-black/10 px-4 py-3 text-sm text-black focus:border-black focus:outline-none"
              placeholder="Short description of the blog"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-[0.28em] text-black/50">
              Blog Content
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              rows={8}
              className="w-full rounded-xl border border-black/10 px-4 py-3 text-sm text-black focus:border-black focus:outline-none"
              placeholder="Write your blog content here..."
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-[0.28em] text-black/50">
              Image URL (Optional)
            </label>
            <input
              type="url"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleInputChange}
              className="w-full rounded-xl border border-black/10 px-4 py-3 text-sm text-black focus:border-black focus:outline-none"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-xl bg-black px-6 py-3 text-sm font-semibold uppercase tracking-[0.28em] text-white transition hover:bg-black/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? 'Saving...' : editingId ? 'Update Blog' : 'Add Blog'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 rounded-xl border border-black/10 px-6 py-3 text-sm font-semibold uppercase tracking-[0.28em] text-black transition hover:bg-black/5"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="rounded-2xl border border-black/10 bg-black px-6 py-12 text-center text-white">
          <p className="text-sm uppercase tracking-[0.35em] text-white/50">Loading blogs...</p>
        </div>
      ) : error && !showForm ? (
        <div className="rounded-2xl border border-black/10 bg-black px-6 py-12 text-center text-white">
          <p className="text-sm uppercase tracking-[0.35em] text-white/50">Error</p>
          <h3 className="mt-2 font-bold">{error}</h3>
        </div>
      ) : blogs.length === 0 ? (
        <div className="rounded-2xl border border-black/10 bg-black px-6 py-12 text-center text-white">
          <p className="text-sm uppercase tracking-[0.35em] text-white/50">No blogs yet</p>
          <h3 className="mt-2 font-bold">Create your first blog post</h3>
        </div>
      ) : (
        <div className="space-y-3">
          {blogs.map((blog) => (
            <div key={blog.id} className="flex items-center justify-between gap-4 rounded-2xl border border-black/10 bg-white p-4">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-black truncate">{blog.title}</h3>
                <p className="text-xs text-black/55 mt-1">
                  Created: {new Date(blog.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleEdit(blog)}
                  className="rounded-lg border border-black/10 px-3 py-2 text-xs font-bold uppercase tracking-[0.2em] text-black transition hover:bg-black hover:text-white"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(blog.id)}
                  className="rounded-lg border border-red-300 px-3 py-2 text-xs font-bold uppercase tracking-[0.2em] text-red-600 transition hover:bg-red-600 hover:text-white"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
