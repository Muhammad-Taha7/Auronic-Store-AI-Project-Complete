import React from 'react'
import { API_BASE_URL } from '../../config/api'

// Lucide-style SVG Icons for better UX
const EditIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
const DeleteIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>

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
      setPreviewUrl(editingProductId ? getImageSrc(form.coverImageUrl) : '')
      return undefined
    }
    const objectUrl = URL.createObjectURL(coverImageFile)
    setPreviewUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [coverImageFile, editingProductId, form.coverImageUrl, uploadMode])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')

    if (!form.title.trim() || !form.description.trim()) {
      setError('Title and Description are required.')
      return
    }

    const payload = new FormData()
    Object.keys(form).forEach(key => {
        if(['colors', 'warrantyOptions', 'galleryImages', 'highlights'].includes(key)) {
            payload.append(key, JSON.stringify(form[key].split(/\n|,/).map(i => i.trim()).filter(Boolean)))
        } else if (key !== 'coverImageUrl') {
            payload.append(key, form[key])
        }
    })
    
    payload.append('isTrending', 'false')
    payload.append('isActive', 'true')

    if (uploadMode === 'file' && coverImageFile) {
      payload.append('coverImageFile', coverImageFile)
    } else {
      payload.append('coverImageUrl', form.coverImageUrl.trim())
    }

    setSaving(true)
    try {
      const response = await fetch(
        editingProductId ? `${API_BASE_URL}/api/products/${editingProductId}` : `${API_BASE_URL}/api/products`,
        { method: editingProductId ? 'PUT' : 'POST', body: payload }
      )
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Action failed')
      
      setMessage(editingProductId ? 'Updated successfully' : 'Added successfully')
      resetForm()
      loadProducts()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (product) => {
    setEditingProductId(product.id)
    setForm({
      ...product,
      price: String(product.price || ''),
      originalPrice: String(product.originalPrice || ''),
      colors: toJsonArrayText(product.colors),
      warrantyOptions: toJsonArrayText(product.warrantyOptions),
      galleryImages: toJsonArrayText(product.galleryImages),
      highlights: toJsonArrayText(product.highlights),
      coverImageUrl: product.coverImage?.startsWith('http') ? product.coverImage : '',
    })
    setUploadMode(product.coverImage?.startsWith('http') ? 'url' : 'file')
    formRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleDelete = async (id) => {
    if(!window.confirm("Delete this product?")) return
    try {
      await fetch(`${API_BASE_URL}/api/products/${id}`, { method: 'DELETE' })
      loadProducts()
    } catch (err) { setError(err.message) }
  }

  const resetForm = () => {
    setForm(emptyForm)
    setCoverImageFile(null)
    setEditingProductId(null)
    setPreviewUrl('')
  }

  return (
    <div className=" mx-auto p-4 lg:p-8 space-y-12 text-slate-900 font-sans">
      {/* Header Section */}
      <header className="relative pb-8 border-b border-slate-200">
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-indigo-600">Inventory Management</span>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">Product Engine</h1>
          <p className="text-slate-500 max-w-xl text-sm">Control your digital storefront with precision. Edit catalog details, pricing, and media assets in real-time.</p>
        </div>
      </header>

      {/* Main Interface */}
      <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] items-start">
        
        {/* Form Column */}
        <section ref={formRef} className="space-y-6">
          <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
            <div className="p-1 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between px-6 py-4">
              <h2 className="text-sm font-bold uppercase tracking-widest text-slate-700">
                {editingProductId ? 'Modify Entity' : 'New Product Entry'}
              </h2>
              {editingProductId && (
                <button onClick={resetForm} type="button" className="text-[10px] font-bold uppercase text-red-500 hover:text-red-600">Discard Edit</button>
              )}
            </div>

            <div className="p-6 lg:p-8 space-y-8">
              {/* Basic Info */}
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Product Title</label>
                  <input name="title" value={form.title} onChange={handleChange} className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-slate-900 transition-all" placeholder="Enter name..." />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Classification</label>
                  <input name="category" value={form.category} onChange={handleChange} className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-slate-900 transition-all" placeholder="Electronics, Audio..." />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Marketing Copy</label>
                <textarea name="description" value={form.description} onChange={handleChange} rows={4} className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-slate-900 transition-all resize-none" placeholder="Detailed product story..." />
              </div>

              {/* Financials */}
              <div className="grid gap-6 grid-cols-2 md:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Sale Price</label>
                  <input type="number" name="price" value={form.price} onChange={handleChange} className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold" placeholder="0.00" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">MSRP</label>
                  <input type="number" name="originalPrice" value={form.originalPrice} onChange={handleChange} className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm text-slate-400" placeholder="0.00" />
                </div>
                <div className="space-y-2 col-span-2 md:col-span-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Rating (1-5)</label>
                  <input type="number" step="0.1" name="rating" value={form.rating} onChange={handleChange} className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm" />
                </div>
              </div>

              {/* Media Control */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                 <div className="flex items-center gap-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Media Source:</label>
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                        {['file', 'url'].map(mode => (
                            <button key={mode} type="button" onClick={() => setUploadMode(mode)} className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${uploadMode === mode ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400'}`}>
                                {mode}
                            </button>
                        ))}
                    </div>
                 </div>
                 {uploadMode === 'file' ? (
                    <div className="relative group">
                        <input type="file" onChange={(e) => setCoverImageFile(e.target.files?.[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                        <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center group-hover:border-slate-400 transition-colors">
                            <p className="text-xs font-medium text-slate-500">{coverImageFile ? coverImageFile.name : 'Click or drag image file here'}</p>
                        </div>
                    </div>
                 ) : (
                    <input name="coverImageUrl" value={form.coverImageUrl} onChange={handleChange} className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm" placeholder="https://image-cloud.com/photo.jpg" />
                 )}
              </div>

              {/* Lists Section */}
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Product Highlights</label>
                  <textarea name="highlights" value={form.highlights} onChange={handleChange} rows={3} className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3 text-xs leading-relaxed" placeholder="Feature one&#10;Feature two..." />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Color Variants</label>
                  <textarea name="colors" value={form.colors} onChange={handleChange} rows={3} className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3 text-xs leading-relaxed" placeholder="Jet Black&#10;Snow White..." />
                </div>
              </div>

              <button disabled={saving} className="w-full bg-slate-900 text-white rounded-2xl py-5 text-xs font-black uppercase tracking-[0.3em] hover:bg-indigo-600 transition-all disabled:opacity-50 shadow-lg shadow-slate-200">
                {saving ? 'Processing...' : editingProductId ? 'Push Updates' : 'Deploy Product'}
              </button>
            </div>
          </form>
        </section>

        {/* Sidebar Sticky Preview */}
        <aside className="lg:sticky lg:top-8 space-y-6">
          <div className="bg-slate-900 rounded-3xl p-6 text-white overflow-hidden relative shadow-2xl">
            <div className="absolute top-0 right-0 p-4">
                <div className="w-20 h-20 bg-indigo-500/20 blur-3xl rounded-full"></div>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-4">Live Canvas</p>
            
            <div className="aspect-[4/5] rounded-2xl bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center group">
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              ) : (
                <div className="p-8 text-center">
                    <div className="w-12 h-12 border-2 border-white/20 border-dashed rounded-full mx-auto mb-4"></div>
                    <p className="text-xs text-white/30 italic font-light">Asset visualization will appear here upon selection</p>
                </div>
              )}
            </div>

            <div className="mt-6 space-y-2">
                <h3 className="text-xl font-bold truncate">{form.title || 'Untitled Asset'}</h3>
                <p className="text-indigo-400 font-mono text-sm">
                    {form.price ? `Rs. ${Number(form.price).toLocaleString()}` : 'Price Pending'}
                </p>
            </div>
          </div>

          {(message || error) && (
            <div className={`p-4 rounded-2xl text-xs font-bold uppercase tracking-tight animate-bounce ${error ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
              {error || message}
            </div>
          )}
        </aside>
      </div>

      {/* Catalog Table Area */}
      <section className="pt-12 border-t border-slate-200">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
                <h2 className="text-2xl font-black uppercase tracking-tighter">Current Catalog</h2>
                <p className="text-slate-400 text-sm mt-1">{products.length} Items Syncing</p>
            </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <div key={product.id} className="group bg-white border border-slate-100 rounded-3xl overflow-hidden hover:shadow-xl transition-all duration-500">
              <div className="relative h-48 overflow-hidden">
                <img src={getImageSrc(product.coverImage)} alt={product.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute top-3 left-3">
                    <span className="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-slate-900 shadow-sm">
                        {product.category || 'General'}
                    </span>
                </div>
              </div>
              <div className="p-5">
                <h4 className="font-bold text-slate-800 truncate mb-1">{product.title}</h4>
                <p className="text-indigo-600 font-mono text-xs mb-4">Rs. {Number(product.price).toLocaleString()}</p>
                
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(product)} className="flex-1 bg-slate-50 hover:bg-slate-900 hover:text-white text-slate-600 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2">
                    <EditIcon /> <span className="text-[10px] font-black uppercase">Edit</span>
                  </button>
                  <button onClick={() => handleDelete(product.id)} className="w-12 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 py-2.5 rounded-xl transition-all flex items-center justify-center">
                    <DeleteIcon />
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          {products.length === 0 && !loading && (
            <div className="col-span-full py-20 bg-slate-50 rounded-4xl border-2 border-dashed border-slate-200 text-center">
                <p className="text-slate-400 text-sm font-medium">Database is currently empty.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}