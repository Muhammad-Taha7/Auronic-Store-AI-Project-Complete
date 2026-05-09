import React from 'react'
import { API_BASE_URL } from '../../config/api'
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Image as ImageIcon, 
  Link as LinkIcon, 
  Upload, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle,
  XCircle,
  Star,
  Layers
} from 'lucide-react'

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

export const AdminTrendingProducts = () => {
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
      const response = await fetch(`${API_BASE_URL}/api/products?trending=1`)
      const data = await response.json()
      setProducts(Array.isArray(data) ? data : [])
    } catch {
      setError('Unable to load trending products.')
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

    if (!form.title.trim()) { setError('Title is required.'); return; }
    if (!form.description.trim()) { setError('Description is required.'); return; }
    if (!form.price) { setError('Price is required.'); return; }
    if (uploadMode === 'file' && !coverImageFile && !editingProductId) { setError('Please select a cover image file.'); return; }
    if (uploadMode === 'url' && !form.coverImageUrl.trim() && !editingProductId) { setError('Please enter a cover image URL.'); return; }

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
    payload.append('isTrending', 'true')
    payload.append('isActive', 'true')

    if (uploadMode === 'file') {
      if (coverImageFile) payload.append('coverImageFile', coverImageFile)
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
      if (!response.ok) throw new Error(data.message || 'Could not save product.')

      setMessage(data.message || (editingProductId ? 'Product updated successfully.' : 'Product added successfully.'))
      resetForm()
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
    if(!window.confirm("Delete this trending product?")) return;
    setError(''); setMessage('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/products/${productId}`, { method: 'DELETE' })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Could not delete product.')
      setMessage('Product deleted successfully.')
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
    <div className="max-w-[2000px] mx-auto space-y-10 pb-20 text-slate-900">
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 p-8 md:p-12 text-white shadow-2xl">
        <div className="relative z-10 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500 shadow-lg shadow-indigo-500/40">
              <TrendingUp size={22} className="text-white" />
            </div>
            <span className="text-xs font-black uppercase tracking-[0.4em] text-indigo-400">Featured Inventory</span>
          </div>
          <h2 className="text-4xl font-black uppercase tracking-tight md:text-5xl">Trending Products</h2>
          <p className="max-w-2xl text-lg font-medium leading-relaxed text-slate-400">
            Control the spotlight. Products managed here appear in the primary homepage slider as high-priority features.
          </p>
        </div>
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-indigo-600/20 blur-3xl" />
      </div>

      {/* Notifications */}
      {(message || error) && (
        <div className={`flex items-center gap-3 rounded-2xl border px-6 py-4 animate-in fade-in slide-in-from-top-2 ${
          error ? 'border-rose-200 bg-rose-50 text-rose-800' : 'border-emerald-200 bg-emerald-50 text-emerald-800'
        }`}>
          {error ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
          <p className="text-sm font-bold">{error || message}</p>
          <button onClick={() => {setError(''); setMessage('')}} className="ml-auto opacity-50 hover:opacity-100">
            <XCircle size={18} />
          </button>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        {/* Main Editor Form */}
        <form ref={formRef} onSubmit={handleSubmit} className="group rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm transition-shadow hover:shadow-xl">
          <div className="space-y-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-6">
              <div>
                <h3 className="text-lg font-black uppercase tracking-wider text-slate-800">
                  {editingProductId ? 'Modify Product' : 'Register New Item'}
                </h3>
                <p className="text-sm font-medium text-slate-400">Step 1: Product Specifications</p>
              </div>
              {editingProductId && (
                <button type="button" onClick={resetForm} className="group flex items-center gap-2 rounded-xl bg-rose-50 px-4 py-2 text-xs font-bold text-rose-600 transition-colors hover:bg-rose-100">
                  <XCircle size={14} /> Cancel Selection
                </button>
              )}
            </div>

            {/* Upload Mode Selector */}
            <div className="inline-flex w-full gap-2 rounded-2xl bg-slate-100 p-1.5">
              <button
                type="button"
                onClick={() => { setUploadMode('file'); setForm(c => ({...c, coverImageUrl: ''})) }}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-xs font-black uppercase tracking-widest transition-all ${
                  uploadMode === 'file' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Upload size={14} /> Local File
              </button>
              <button
                type="button"
                onClick={() => { setUploadMode('url'); setCoverImageFile(null) }}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-xs font-black uppercase tracking-widest transition-all ${
                  uploadMode === 'url' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <LinkIcon size={14} /> Image URL
              </button>
            </div>

            {/* Form Fields */}
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Product Title</label>
                <input name="title" value={form.title} onChange={handleChange} className="w-full rounded-2xl border-slate-200 bg-slate-50 px-5 py-4 text-sm font-bold focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all" placeholder="Sony WH-1000XM5" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Category</label>
                <input name="category" value={form.category} onChange={handleChange} className="w-full rounded-2xl border-slate-200 bg-slate-50 px-5 py-4 text-sm font-bold focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all" placeholder="Audio Gear" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Global Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={4} className="w-full rounded-2xl border-slate-200 bg-slate-50 px-5 py-4 text-sm font-medium leading-relaxed focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all resize-none" placeholder="Elaborate on the craftsmanship and tech..." />
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Retail Price (₨)</label>
                <div className="relative">
                  <input type="number" name="price" value={form.price} onChange={handleChange} className="w-full rounded-2xl border-slate-200 bg-slate-50 pl-10 pr-5 py-4 text-sm font-bold focus:border-emerald-500 focus:bg-white outline-none transition-all" placeholder="0" />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₨</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Original Price</label>
                <input type="number" name="originalPrice" value={form.originalPrice} onChange={handleChange} className="w-full rounded-2xl border-slate-200 bg-slate-50 px-5 py-4 text-sm font-bold focus:border-indigo-500 focus:bg-white outline-none transition-all" placeholder="0" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Star Rating</label>
                <div className="relative">
                  <input type="number" step="0.1" max="5" name="rating" value={form.rating} onChange={handleChange} className="w-full rounded-2xl border-slate-200 bg-slate-50 pl-10 pr-5 py-4 text-sm font-bold focus:border-amber-500 focus:bg-white outline-none transition-all" />
                  <Star size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500 fill-amber-500" />
                </div>
              </div>
            </div>

            {/* Asset Inputs */}
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Status Badge</label>
                <input name="badge" value={form.badge} onChange={handleChange} className="w-full rounded-2xl border-slate-200 bg-slate-50 px-5 py-4 text-sm font-bold outline-none" placeholder="e.g. HOT" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Priority Order</label>
                <input type="number" name="displayOrder" value={form.displayOrder} onChange={handleChange} className="w-full rounded-2xl border-slate-200 bg-slate-50 px-5 py-4 text-sm font-bold outline-none" />
              </div>
            </div>

            {/* Image Handling */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Primary Media</label>
              {uploadMode === 'file' ? (
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-200 border-dashed rounded-[1.5rem] cursor-pointer bg-slate-50 hover:bg-slate-100 transition-all">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-2 text-slate-400" />
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Click to upload image</p>
                    </div>
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => setCoverImageFile(e.target.files?.[0] || null)} />
                  </label>
                </div>
              ) : (
                <input name="coverImageUrl" value={form.coverImageUrl} onChange={handleChange} className="w-full rounded-2xl border-slate-200 bg-slate-50 px-5 py-4 text-sm font-medium outline-none transition-all focus:bg-white focus:ring-4 focus:ring-indigo-500/10" placeholder="https://cdn.photos.com/prod.jpg" />
              )}
            </div>

            {/* Multi-line fields */}
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Available Colors</label>
                <textarea name="colors" value={form.colors} onChange={handleChange} rows={3} className="w-full rounded-2xl border-slate-200 bg-slate-50 p-4 text-xs font-bold outline-none resize-none" placeholder="Silver&#10;Midnight Blue" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Key Highlights</label>
                <textarea name="highlights" value={form.highlights} onChange={handleChange} rows={3} className="w-full rounded-2xl border-slate-200 bg-slate-50 p-4 text-xs font-bold outline-none resize-none" placeholder="Noise Canceling&#10;30h Battery" />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 rounded-2xl border border-slate-200 py-4 text-xs font-black uppercase tracking-[0.2em] text-slate-500 transition-all hover:bg-slate-50"
              >
                Clear Fields
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-[2] flex items-center justify-center gap-3 rounded-2xl bg-indigo-600 py-4 text-xs font-black uppercase tracking-[0.2em] text-white shadow-xl shadow-indigo-600/30 transition-all hover:bg-indigo-700 hover:translate-y-[-2px] disabled:opacity-50 active:translate-y-0"
              >
                {saving ? 'Processing...' : editingProductId ? <><Edit3 size={16} /> Update Details</> : <><Plus size={18} /> Deploy Product</>}
              </button>
            </div>
          </div>
        </form>

        {/* Sidebar Preview */}
        <div className="space-y-8">
          <div className="sticky top-8 space-y-6">
            <div className="overflow-hidden rounded-[2.5rem] bg-slate-900 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/5 px-8 py-5">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50">Real-time Preview</span>
                <ImageIcon size={16} className="text-white/20" />
              </div>
              <div className="relative aspect-[4/5] w-full bg-slate-800">
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="h-full w-full object-cover animate-in fade-in zoom-in-95" />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-4 px-12 text-center">
                    <div className="rounded-full bg-white/5 p-5">
                      <ImageIcon size={40} className="text-white/10" />
                    </div>
                    <p className="text-sm font-medium leading-relaxed text-white/30 uppercase tracking-widest">Awaiting Media Asset</p>
                  </div>
                )}
                {form.badge && (
                  <div className="absolute top-6 left-6 rounded-lg bg-indigo-600 px-3 py-1.5 text-[10px] font-black text-white uppercase tracking-tighter">
                    {form.badge}
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-950 p-8 pt-20">
                  <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1">{form.category || 'Category'}</p>
                  <h4 className="text-2xl font-black text-white line-clamp-1">{form.title || 'Product Title'}</h4>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xl font-black text-white">₨ {Number(form.price || 0).toLocaleString()}</span>
                    <div className="flex items-center gap-1">
                      <Star size={14} className="fill-amber-500 text-amber-500" />
                      <span className="text-sm font-bold text-white">{form.rating}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-indigo-100 bg-indigo-50/50 p-6">
               <div className="flex items-start gap-4">
                  <div className="rounded-full bg-indigo-100 p-2 text-indigo-600">
                    <Layers size={20} />
                  </div>
                  <div>
                    <h5 className="text-sm font-black uppercase tracking-wider text-slate-800">Visibility Rule</h5>
                    <p className="mt-1 text-xs font-medium leading-relaxed text-slate-500">
                      Trending products are automatically prioritized in SEO tags and homepage hero components. Use high-resolution 4:5 aspect ratio images for best results.
                    </p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid List Section */}
      <div className="space-y-8 pt-10 border-t border-slate-100">
        <div className="flex items-end justify-between">
          <div>
            <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900">Current Rotation</h3>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">
              {loading ? 'Refreshing...' : `${products.length} Products Active`}
            </p>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <div key={product.id} className="group relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white transition-all hover:border-indigo-200 hover:shadow-2xl">
              <div className="relative aspect-square overflow-hidden bg-slate-100">
                <img src={getImageSrc(product.coverImage)} alt={product.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />
                <div className="absolute bottom-4 left-4 right-4 translate-y-12 opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100">
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(product)} className="flex-1 rounded-xl bg-white py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-900 shadow-xl hover:bg-indigo-600 hover:text-white transition-colors">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(product.id)} className="flex-1 rounded-xl bg-rose-600 py-2.5 text-[10px] font-black uppercase tracking-widest text-white shadow-xl hover:bg-rose-700 transition-colors">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start gap-2">
                  <h4 className="font-bold text-slate-800 line-clamp-1">{product.title}</h4>
                  <span className="text-[10px] font-black text-indigo-600">#{product.displayOrder}</span>
                </div>
                <p className="mt-1 text-xs font-black uppercase tracking-widest text-slate-400">₨ {Number(product.price).toLocaleString()}</p>
              </div>
            </div>
          ))}
          
          {!products.length && !loading && (
            <div className="col-span-full flex flex-col items-center justify-center rounded-[3rem] border-2 border-dashed border-slate-200 py-24 text-center">
              <div className="rounded-full bg-slate-50 p-6 mb-4">
                <TrendingUp size={40} className="text-slate-200" />
              </div>
              <h4 className="text-lg font-black uppercase tracking-widest text-slate-400">Rotation Empty</h4>
              <p className="mt-2 text-sm text-slate-400 max-w-xs px-6">Add trending products to populate the homepage featured slider.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}