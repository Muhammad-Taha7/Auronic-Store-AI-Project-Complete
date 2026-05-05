import React from 'react'
import { API_BASE_URL } from '../../config/api'

const emptyForm = {
  title: '',
  altText: '',
  displayOrder: '0',
  imageUrl: '',
}

export const AdminCarouselImages = () => {
  const [form, setForm] = React.useState(emptyForm)
  const [imageFile, setImageFile] = React.useState(null)
  const [previewUrl, setPreviewUrl] = React.useState('')
  const [uploadMode, setUploadMode] = React.useState('file') // 'file' or 'url'
  const [items, setItems] = React.useState([])
  const [loading, setLoading] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const [message, setMessage] = React.useState('')
  const [error, setError] = React.useState('')

  const loadItems = React.useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/carousel-images`)
      const data = await response.json()
      setItems(Array.isArray(data) ? data : [])
    } catch {
      setError('Unable to load carousel images.')
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadItems()
  }, [loadItems])

  React.useEffect(() => {
    if (uploadMode === 'url') {
      setPreviewUrl(form.imageUrl)
      return undefined
    }

    if (!imageFile) {
      setPreviewUrl('')
      return undefined
    }

    const objectUrl = URL.createObjectURL(imageFile)
    setPreviewUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [imageFile, uploadMode, form.imageUrl])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')

    if (!form.title.trim()) {
      setError('Title is required.')
      return
    }

    if (uploadMode === 'file' && !imageFile) {
      setError('Please select an image file.')
      return
    }

    if (uploadMode === 'url' && !form.imageUrl.trim()) {
      setError('Please enter an image URL.')
      return
    }

    const payload = new FormData()
    payload.append('title', form.title.trim())
    payload.append('altText', form.altText.trim() || form.title.trim())
    payload.append('displayOrder', form.displayOrder)

    if (uploadMode === 'file') {
      payload.append('image', imageFile)
    } else {
      payload.append('imageUrl', form.imageUrl.trim())
    }

    setSaving(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/carousel-images`, {
        method: 'POST',
        body: payload,
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || 'Could not save image.')
      }

      setMessage(data.message || 'Carousel image added successfully.')
      setForm(emptyForm)
      setImageFile(null)
      setUploadMode('file')
      await loadItems()
    } catch (submitError) {
      setError(submitError.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    setError('')
    setMessage('')

    try {
      const response = await fetch(`${API_BASE_URL}/api/carousel-images/${id}`, {
        method: 'DELETE',
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || 'Could not delete image.')
      }

      setMessage(data.message || 'Carousel image deleted.')
      await loadItems()
    } catch (deleteError) {
      setError(deleteError.message)
    }
  }

  return (
    <div className="space-y-8 text-black">
      <div className="flex flex-col gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-black/50">Carousel Management</p>
        <h2 className="text-3xl font-black uppercase tracking-[0.2em]">Add Carousel Images</h2>
        <p className="max-w-2xl text-sm leading-6 text-black/60">
          Upload homepage slides from here. Images are saved in MySQL metadata with files stored on the backend.
        </p>
      </div>

      {(message || error) && (
        <div className={`rounded-2xl border px-5 py-4 text-sm ${error ? 'border-black/15 bg-black/5 text-black' : 'border-black bg-black text-white'}`}>
          {error || message}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <form onSubmit={handleSubmit} className="rounded-4xl border border-black/10 bg-white p-6 shadow-xl">
          <div className="grid gap-5">
            {/* Upload Mode Toggle */}
            <div className="flex gap-2 rounded-xl border border-black/10 bg-black/5 p-1">
              <button
                type="button"
                onClick={() => {
                  setUploadMode('file')
                  setForm((current) => ({ ...current, imageUrl: '' }))
                }}
                className={`flex-1 rounded-lg px-3 py-2 text-xs font-bold uppercase tracking-[0.2em] transition-colors ${
                  uploadMode === 'file'
                    ? 'bg-black text-white'
                    : 'bg-transparent text-black hover:bg-black/10'
                }`}
              >
                File Upload
              </button>
              <button
                type="button"
                onClick={() => {
                  setUploadMode('url')
                  setImageFile(null)
                }}
                className={`flex-1 rounded-lg px-3 py-2 text-xs font-bold uppercase tracking-[0.2em] transition-colors ${
                  uploadMode === 'url'
                    ? 'bg-black text-white'
                    : 'bg-transparent text-black hover:bg-black/10'
                }`}
              >
                From URL
              </button>
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-[0.3em] text-black/50">Title</label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                className="w-full rounded-xl border border-black/10 bg-black/5 px-4 py-3 text-sm font-medium text-black placeholder:text-black/30 focus:border-black focus:outline-none"
                placeholder="Enter slide title"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-[0.3em] text-black/50">Alt Text</label>
              <input
                name="altText"
                value={form.altText}
                onChange={handleChange}
                className="w-full rounded-xl border border-black/10 bg-black/5 px-4 py-3 text-sm font-medium text-black placeholder:text-black/30 focus:border-black focus:outline-none"
                placeholder="Describe the image for accessibility"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-[0.3em] text-black/50">Display Order</label>
              <input
                type="number"
                name="displayOrder"
                value={form.displayOrder}
                onChange={handleChange}
                className="w-full rounded-xl border border-black/10 bg-black/5 px-4 py-3 text-sm font-medium text-black placeholder:text-black/30 focus:border-black focus:outline-none"
                min="0"
              />
            </div>

            {uploadMode === 'file' ? (
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.3em] text-black/50">Image File</label>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                  onChange={(event) => setImageFile(event.target.files?.[0] || null)}
                  className="block w-full text-sm text-black file:mr-4 file:rounded-xl file:border-0 file:bg-black file:px-4 file:py-3 file:text-sm file:font-semibold file:text-white hover:file:bg-black/90"
                />
              </div>
            ) : (
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.3em] text-black/50">Image URL</label>
                <input
                  type="url"
                  name="imageUrl"
                  value={form.imageUrl}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-black/10 bg-black/5 px-4 py-3 text-sm font-medium text-black placeholder:text-black/30 focus:border-black focus:outline-none"
                  placeholder="Paste image URL (e.g., https://...)"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-black px-5 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white transition-colors hover:bg-black/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Carousel Image'}
            </button>
          </div>
        </form>

        <div className="rounded-4xl border border-black/10 bg-black p-6 text-white shadow-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/50">Preview</p>
          <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" className="h-72 w-full object-cover" />
            ) : (
              <div className="flex h-72 items-center justify-center px-6 text-center text-sm leading-6 text-white/50">
                Select an image to see a live preview here.
              </div>
            )}
          </div>
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
            Carousel images saved here will appear automatically on the homepage.
          </div>
        </div>
      </div>

      <div className="rounded-4xl border border-black/10 bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-black uppercase tracking-[0.2em]">Existing Slides</h3>
            <p className="mt-1 text-sm text-black/50">{loading ? 'Loading...' : `${items.length} slide(s)`}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => {
            const imageUrl = item.imageUrl.startsWith('http') 
              ? item.imageUrl 
              : `${API_BASE_URL}${item.imageUrl}`
            return (
            <div key={item.id} className="overflow-hidden rounded-2xl border border-black/10 bg-black text-white shadow-lg">
              <img src={imageUrl} alt={item.altText} className="h-44 w-full object-cover" />
              <div className="space-y-3 p-4">
                <div>
                  <p className="text-base font-bold">{item.title}</p>
                  <p className="text-xs uppercase tracking-[0.3em] text-white/50">Order {item.displayOrder}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  className="w-full rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold uppercase tracking-[0.25em] text-white transition-colors hover:bg-white hover:text-black"
                >
                  Delete
                </button>
              </div>
            </div>
            )
          })}
          {!items.length && !loading && (
            <div className="rounded-2xl border border-dashed border-black/15 bg-black/5 p-8 text-center text-sm text-black/50 md:col-span-2 xl:col-span-3">
              No carousel images added yet.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
