import React from 'react'
import { API_BASE_URL } from '../../config/api'

const emptyForm = {
  title: '',
  description: '',
  price: '',
  originalPrice: '',
  category: '',
  badge: '',
  rating: '5',
  displayOrder: '0',
  colors: '',
  warrantyOptions: '',
  galleryImages: '',
  highlights: '',
  coverImageUrl: '',
}

const getImageSrc = (imageUrl = '') => {
  if (!imageUrl) return ''
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) return imageUrl
  return `${API_BASE_URL}${imageUrl}`
}

const toJsonArrayText = (value = []) => {
  if (!Array.isArray(value)) return ''
  return value.join('\n')
}

export const AdminProducts = () => {
  const [form, setForm] = React.useState(emptyForm)
  const [coverImageFile, setCoverImageFile] = React.useState(null)
  const [uploadMode, setUploadMode] = React.useState('url')
  const [previewUrl, setPreviewUrl] = React.useState('')
  const [products, setProducts] = React.useState([])
  const [loading, setLoading] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const [message, setMessage] = React.useState('')
  const [error, setError] = React.useState('')
  const [editingProductId, setEditingProductId] = React.useState(null)
  const formRef = React.useRef(null)

  const loadProducts = React.useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/products?trending=0`)
      const data = await response.json()
      setProducts(Array.isArray(data) ? data : [])
    } catch {
      setError('Unable to load products.')
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadProducts()
  }, [loadProducts])

  React.useEffect(() => {
    if (uploadMode === 'url') {
      setPreviewUrl(form.coverImageUrl ? getImageSrc(form.coverImageUrl) : '')
      return undefined
    }

    if (!coverImageFile) {
      if (editingProductId) {
        setPreviewUrl(getImageSrc(form.coverImageUrl))
      } else {
        setPreviewUrl('')
      }
      return undefined
    }

    const objectUrl = URL.createObjectURL(coverImageFile)
    setPreviewUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [coverImageFile, editingProductId, form.coverImageUrl, uploadMode])

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

    if (!form.description.trim()) {
      setError('Description is required.')
      return
    }

    if (uploadMode === 'file' && !coverImageFile && !editingProductId) {
      setError('Please select a cover image file.')
      return
    }

    if (uploadMode === 'url' && !form.coverImageUrl.trim() && !editingProductId) {
      setError('Please enter a cover image URL.')
      return
    }

    const payload = new FormData()
    payload.append('title', form.title.trim())
    payload.append('description', form.description.trim())
    payload.append('price', form.price)
    payload.append('originalPrice', form.originalPrice)
    payload.append('category', form.category.trim())
    payload.append('badge', form.badge.trim())
    payload.append('rating', form.rating)
    payload.append('displayOrder', form.displayOrder)
    payload.append('colors', JSON.stringify(form.colors.split(/\n|,/).map((item) => item.trim()).filter(Boolean)))
    payload.append('warrantyOptions', JSON.stringify(form.warrantyOptions.split(/\n|,/).map((item) => item.trim()).filter(Boolean)))
    payload.append('galleryImages', JSON.stringify(form.galleryImages.split(/\n|,/).map((item) => item.trim()).filter(Boolean)))
    payload.append('highlights', JSON.stringify(form.highlights.split(/\n|,/).map((item) => item.trim()).filter(Boolean)))
    payload.append('isTrending', 'false')
    payload.append('isActive', 'true')

    if (uploadMode === 'file') {
      if (coverImageFile) {
        payload.append('coverImageFile', coverImageFile)
      }
    } else {
      payload.append('coverImageUrl', form.coverImageUrl.trim())
    }

    setSaving(true)
    try {
      const response = await fetch(
        editingProductId ? `${API_BASE_URL}/api/products/${editingProductId}` : `${API_BASE_URL}/api/products`,
        {
          method: editingProductId ? 'PUT' : 'POST',
          body: payload,
        },
      )

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || (editingProductId ? 'Could not update product.' : 'Could not save product.'))
      }

      setMessage(data.message || (editingProductId ? 'Product updated successfully.' : 'Product added successfully.'))
      setForm(emptyForm)
      setCoverImageFile(null)
      setUploadMode('url')
      setPreviewUrl('')
      setEditingProductId(null)
      await loadProducts()
    } catch (submitError) {
      setError(submitError.message)
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (product) => {
    setError('')
    setMessage('')
    setEditingProductId(product.id)
    setForm({
      title: product.title || '',
      description: product.description || '',
      price: String(product.price ?? ''),
      originalPrice: product.originalPrice ? String(product.originalPrice) : '',
      category: product.category || '',
      badge: product.badge || '',
      rating: String(product.rating ?? '5'),
      displayOrder: String(product.displayOrder ?? 0),
      colors: toJsonArrayText(product.colors),
      warrantyOptions: toJsonArrayText(product.warrantyOptions),
      galleryImages: toJsonArrayText(product.galleryImages),
      highlights: toJsonArrayText(product.highlights),
      coverImageUrl: product.coverImage && product.coverImage.startsWith('http') ? product.coverImage : '',
    })
    setCoverImageFile(null)
    setUploadMode(product.coverImage && product.coverImage.startsWith('http') ? 'url' : 'file')
    setPreviewUrl(getImageSrc(product.coverImage))
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleDelete = async (productId) => {
    setError('')
    setMessage('')

    try {
      const response = await fetch(`${API_BASE_URL}/api/products/${productId}`, {
        method: 'DELETE',
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || 'Could not delete product.')
      }

      setMessage(data.message || 'Product deleted successfully.')
      await loadProducts()
    } catch (deleteError) {
      setError(deleteError.message)
    }
  }

  const resetForm = () => {
    setForm(emptyForm)
    setCoverImageFile(null)
    setUploadMode('url')
    setPreviewUrl('')
    setEditingProductId(null)
    setMessage('')
    setError('')
  }

  return (
    <div className="space-y-8 text-black">
      <div className="flex flex-col gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-black/50">Product Catalog</p>
        <h2 className="text-3xl font-black uppercase tracking-[0.2em]">Add Products</h2>
        <p className="max-w-2xl text-sm leading-6 text-black/60">
          Manage all products in your store catalog. These products will be displayed on the Products page for customers to browse and purchase.
        </p>
      </div>

      {(message || error) && (
        <div className={`rounded-2xl border px-5 py-4 text-sm ${error ? 'border-black/15 bg-black/5 text-black' : 'border-black bg-black text-white'}`}>
          {error || message}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <form ref={formRef} onSubmit={handleSubmit} className="rounded-4xl border border-black/10 bg-white p-6 shadow-xl">
          <div className="grid gap-5">
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-black/10 bg-black/5 px-4 py-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-black/50">
                  {editingProductId ? 'Editing Product' : 'Create Product'}
                </p>
                <p className="mt-1 text-sm text-black/60">
                  {editingProductId ? 'Update the selected product details.' : 'Fill in the product details below.'}
                </p>
              </div>
              {editingProductId ? (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-xl border border-black/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.25em] text-black transition-colors hover:bg-black/5"
                >
                  Cancel Edit
                </button>
              ) : null}
            </div>

            <div className="flex gap-2 rounded-xl border border-black/10 bg-black/5 p-1">
              <button
                type="button"
                onClick={() => {
                  setUploadMode('file')
                  setForm((current) => ({ ...current, coverImageUrl: '' }))
                }}
                className={`flex-1 rounded-lg px-3 py-2 text-xs font-bold uppercase tracking-[0.2em] transition-colors ${
                  uploadMode === 'file' ? 'bg-black text-white' : 'bg-transparent text-black hover:bg-black/10'
                }`}
              >
                File Upload
              </button>
              <button
                type="button"
                onClick={() => {
                  setUploadMode('url')
                  setCoverImageFile(null)
                }}
                className={`flex-1 rounded-lg px-3 py-2 text-xs font-bold uppercase tracking-[0.2em] transition-colors ${
                  uploadMode === 'url' ? 'bg-black text-white' : 'bg-transparent text-black hover:bg-black/10'
                }`}
              >
                From URL
              </button>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.3em] text-black/50">Product Title</label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-black/10 bg-black/5 px-4 py-3 text-sm font-medium text-black placeholder:text-black/30 focus:border-black focus:outline-none"
                  placeholder="e.g. USB-C Charging Cable"
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.3em] text-black/50">Category</label>
                <input
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-black/10 bg-black/5 px-4 py-3 text-sm font-medium text-black placeholder:text-black/30 focus:border-black focus:outline-none"
                  placeholder="e.g. Electronics"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-[0.3em] text-black/50">Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={5}
                className="w-full rounded-xl border border-black/10 bg-black/5 px-4 py-3 text-sm font-medium text-black placeholder:text-black/30 focus:border-black focus:outline-none"
                placeholder="Describe the product features and experience..."
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.3em] text-black/50">Price</label>
                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-black/10 bg-black/5 px-4 py-3 text-sm font-medium text-black placeholder:text-black/30 focus:border-black focus:outline-none"
                  placeholder="25000"
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.3em] text-black/50">Original Price</label>
                <input
                  type="number"
                  name="originalPrice"
                  value={form.originalPrice}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-black/10 bg-black/5 px-4 py-3 text-sm font-medium text-black placeholder:text-black/30 focus:border-black focus:outline-none"
                  placeholder="30000"
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.3em] text-black/50">Rating</label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  name="rating"
                  value={form.rating}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-black/10 bg-black/5 px-4 py-3 text-sm font-medium text-black placeholder:text-black/30 focus:border-black focus:outline-none"
                />
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.3em] text-black/50">Badge</label>
                <input
                  name="badge"
                  value={form.badge}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-black/10 bg-black/5 px-4 py-3 text-sm font-medium text-black placeholder:text-black/30 focus:border-black focus:outline-none"
                  placeholder="e.g. Trending"
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
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-[0.3em] text-black/50">Cover Image</label>
              {uploadMode === 'file' ? (
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                  onChange={(event) => setCoverImageFile(event.target.files?.[0] || null)}
                  className="block w-full text-sm text-black file:mr-4 file:rounded-xl file:border-0 file:bg-black file:px-4 file:py-3 file:text-sm file:font-semibold file:text-white hover:file:bg-black/90"
                />
              ) : (
                <input
                  name="coverImageUrl"
                  value={form.coverImageUrl}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-black/10 bg-black/5 px-4 py-3 text-sm font-medium text-black placeholder:text-black/30 focus:border-black focus:outline-none"
                  placeholder="Paste cover image URL"
                />
              )}
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.3em] text-black/50">Colors</label>
                <textarea
                  name="colors"
                  value={form.colors}
                  onChange={handleChange}
                  rows={4}
                  className="w-full rounded-xl border border-black/10 bg-black/5 px-4 py-3 text-sm font-medium text-black placeholder:text-black/30 focus:border-black focus:outline-none"
                  placeholder="Black\nWhite\nSilver"
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.3em] text-black/50">Warranty Options</label>
                <textarea
                  name="warrantyOptions"
                  value={form.warrantyOptions}
                  onChange={handleChange}
                  rows={4}
                  className="w-full rounded-xl border border-black/10 bg-black/5 px-4 py-3 text-sm font-medium text-black placeholder:text-black/30 focus:border-black focus:outline-none"
                  placeholder="Standard Warranty\n1 Year Protection\n2 Year Premium"
                />
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.3em] text-black/50">Gallery Images</label>
                <textarea
                  name="galleryImages"
                  value={form.galleryImages}
                  onChange={handleChange}
                  rows={4}
                  className="w-full rounded-xl border border-black/10 bg-black/5 px-4 py-3 text-sm font-medium text-black placeholder:text-black/30 focus:border-black focus:outline-none"
                  placeholder="https://...\nhttps://..."
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.3em] text-black/50">Highlights</label>
                <textarea
                  name="highlights"
                  value={form.highlights}
                  onChange={handleChange}
                  rows={4}
                  className="w-full rounded-xl border border-black/10 bg-black/5 px-4 py-3 text-sm font-medium text-black placeholder:text-black/30 focus:border-black focus:outline-none"
                  placeholder="Immersive display\nPremium sound\nFast charging"
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setUploadMode('url')}
                className="rounded-xl border border-black/10 px-5 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-black transition-colors hover:bg-black/5"
              >
                {editingProductId ? 'Keep Current Mode' : 'Use URL Mode'}
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-black px-5 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white transition-colors hover:bg-black/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? 'Saving...' : editingProductId ? 'Update Product' : 'Add Product'}
              </button>
            </div>
          </div>
        </form>

        <div className="rounded-4xl border border-black/10 bg-black p-6 text-white shadow-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/50">Preview</p>
          <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" className="h-72 w-full object-cover" />
            ) : (
              <div className="flex h-72 items-center justify-center px-6 text-center text-sm leading-6 text-white/50">
                Select a product image to see a live preview here.
              </div>
            )}
          </div>
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
            Products added here will appear on the Products catalog page and be available for customers to purchase.
          </div>
        </div>
      </div>

      <div className="rounded-4xl border border-black/10 bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-black uppercase tracking-[0.2em]">Products List</h3>
            <p className="mt-1 text-sm text-black/50">{loading ? 'Loading...' : `${products.length} product(s) in catalog`}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => {
            const imageUrl = getImageSrc(product.coverImage)
            return (
              <div key={product.id} className="overflow-hidden rounded-2xl border border-black/10 bg-black text-white shadow-lg">
                <img src={imageUrl} alt={product.title} className="h-44 w-full object-cover" />
                <div className="space-y-3 p-4">
                  <div>
                    <p className="text-base font-bold">{product.title}</p>
                    <p className="text-xs uppercase tracking-[0.3em] text-white/50">Rs. {Number(product.price || 0).toLocaleString()}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleEdit(product)}
                      className="rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold uppercase tracking-[0.25em] text-white transition-colors hover:bg-white hover:text-black"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(product.id)}
                      className="rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold uppercase tracking-[0.25em] text-white transition-colors hover:bg-white hover:text-black"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
          {!products.length && !loading && (
            <div className="rounded-2xl border border-dashed border-black/15 bg-black/5 p-8 text-center text-sm text-black/50 md:col-span-2 xl:col-span-3">
              No products in catalog yet. Add one to get started!
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
