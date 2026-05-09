import React from 'react'
import { API_BASE_URL } from '../../config/api'
import { Plus, Image as ImageIcon, Link as LinkIcon, Trash2, Edit3, X, Save, Info, AlertCircle, CheckCircle2 } from 'lucide-react'

const emptyForm = {
  title: '',
  altText: '',
  displayOrder: '0',
  imageUrl: '',
}

const getImageSrc = (imageUrl = '') => {
  if (!imageUrl) return ''
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) return imageUrl
  return `${API_BASE_URL}${imageUrl}`
}

export const AdminCarouselImages = () => {
  const [form, setForm] = React.useState(emptyForm)
  const [imageFile, setImageFile] = React.useState(null)
  const [previewUrl, setPreviewUrl] = React.useState('')
  const [uploadMode, setUploadMode] = React.useState('file') 
  const [items, setItems] = React.useState([])
  const [loading, setLoading] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const [message, setMessage] = React.useState('')
  const [error, setError] = React.useState('')
  const [editingItemId, setEditingItemId] = React.useState(null)

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
      setPreviewUrl(form.imageUrl ? getImageSrc(form.imageUrl) : '')
      return undefined
    }
    if (!imageFile) {
      setPreviewUrl(editingItemId ? getImageSrc(form.imageUrl) : '')
      return undefined
    }
    const objectUrl = URL.createObjectURL(imageFile)
    setPreviewUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [editingItemId, imageFile, uploadMode, form.imageUrl])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')

    if (!form.title.trim()) { setError('Title is required.'); return; }
    if (!editingItemId && uploadMode === 'file' && !imageFile) { setError('Please select an image file.'); return; }
    if (!editingItemId && uploadMode === 'url' && !form.imageUrl.trim()) { setError('Please enter an image URL.'); return; }

    const payload = new FormData()
    payload.append('title', form.title.trim())
    payload.append('altText', form.altText.trim() || form.title.trim())
    payload.append('displayOrder', form.displayOrder)

    if (uploadMode === 'file') {
      if (imageFile) payload.append('image', imageFile)
    } else {
      payload.append('imageUrl', form.imageUrl.trim())
    }

    setSaving(true)
    try {
      const response = await fetch(
        editingItemId ? `${API_BASE_URL}/api/carousel-images/${editingItemId}` : `${API_BASE_URL}/api/carousel-images`,
        { method: editingItemId ? 'PUT' : 'POST', body: payload }
      )
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Action failed.')
      
      setMessage(editingItemId ? 'Slide updated successfully!' : 'New slide added successfully!')
      resetForm()
      await loadItems()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this slide?")) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/carousel-images/${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Could not delete.')
      setMessage('Slide deleted successfully.')
      await loadItems()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleEdit = (item) => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setEditingItemId(item.id)
    setForm({
      title: item.title || '',
      altText: item.altText || '',
      displayOrder: String(item.displayOrder ?? 0),
      imageUrl: item.imageUrl?.startsWith('http') ? item.imageUrl : '',
    })
    setImageFile(null)
    setUploadMode(item.imageUrl?.startsWith('http') ? 'url' : 'file')
  }

  const resetForm = () => {
    setForm(emptyForm); setImageFile(null); setUploadMode('file');
    setPreviewUrl(''); setEditingItemId(null); setError(''); setMessage('');
  }

  return (
    <div className=" space-y-10 pb-20 text-slate-900">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-indigo-600 font-bold uppercase tracking-widest text-xs">
            <ImageIcon size={14} />
            <span>Storefront Assets</span>
          </div>
          <h2 className="text-4xl font-black tracking-tight">Carousel Gallery</h2>
          <p className="text-slate-500 text-sm max-w-xl">Manage your homepage hero slides. Optimize user engagement with high-quality visual storytelling.</p>
        </div>
      </div>

      {/* Notifications */}
      {(message || error) && (
        <div className={`flex items-center gap-3 px-6 py-4 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-300 border ${
          error ? 'bg-red-50 border-red-200 text-red-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
        }`}>
          {error ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
          <p className="text-sm font-bold tracking-wide">{error || message}</p>
          <button onClick={() => {setError(''); setMessage('')}} className="ml-auto opacity-50 hover:opacity-100"><X size={18}/></button>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        {/* Editor Card */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-slate-200/50 overflow-hidden">
          <div className="bg-slate-50 border-b border-slate-200 px-8 py-5 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              {editingItemId ? <Edit3 size={18} className="text-indigo-600"/> : <Plus size={18} className="text-indigo-600"/>}
              {editingItemId ? 'Update Slide Details' : 'Design New Slide'}
            </h3>
            {editingItemId && (
              <button onClick={resetForm} className="text-xs font-bold text-red-500 hover:text-red-700 uppercase tracking-tighter">Discard Changes</button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Mode Switcher */}
            <div className="flex p-1 bg-slate-100 rounded-2xl w-full max-w-sm">
              <button
                type="button"
                onClick={() => {setUploadMode('file'); setForm(c => ({...c, imageUrl: ''}))}}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black tracking-widest transition-all ${uploadMode === 'file' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <ImageIcon size={14}/> FILE UPLOAD
              </button>
              <button
                type="button"
                onClick={() => {setUploadMode('url'); setImageFile(null)}}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black tracking-widest transition-all ${uploadMode === 'url' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <LinkIcon size={14}/> IMAGE URL
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Slide Headline</label>
                <input
                  name="title" value={form.title} onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                  placeholder="e.g. Summer Collection 2024"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sequence Order</label>
                <input
                  type="number" name="displayOrder" value={form.displayOrder} onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Accessibility (Alt Text)</label>
              <input
                name="altText" value={form.altText} onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                placeholder="Briefly describe this image for screen readers"
              />
            </div>

            <div className="pt-2">
              {uploadMode === 'file' ? (
                <div className="relative group">
                  <input
                    type="file" accept="image/*"
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="border-2 border-dashed border-slate-200 group-hover:border-indigo-400 bg-slate-50 rounded-2xl p-8 transition-all text-center">
                    <ImageIcon className="mx-auto mb-3 text-slate-400 group-hover:text-indigo-500 transition-colors" size={32}/>
                    <p className="text-sm font-bold text-slate-600">{imageFile ? imageFile.name : 'Click or Drag image to upload'}</p>
                    <p className="text-xs text-slate-400 mt-1">Supports PNG, JPG, WebP (Max 5MB)</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">External Resource Link</label>
                  <input
                    type="url" name="imageUrl" value={form.imageUrl} onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-500"
                    placeholder="https://images.unsplash.com/photo-..."
                  />
                </div>
              )}
            </div>

            <button
              type="submit" disabled={saving}
              className="w-full bg-slate-900 hover:bg-indigo-600 text-white rounded-2xl py-4 font-bold text-sm tracking-widest uppercase transition-all shadow-lg shadow-indigo-200 disabled:bg-slate-300 flex items-center justify-center gap-2"
            >
              {saving ? <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <Save size={18}/>}
              {saving ? 'Processing...' : editingItemId ? 'Update This Slide' : 'Launch New Slide'}
            </button>
          </form>
        </div>

        {/* Preview Card */}
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-xl min-h-[450px] flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <span className="text-[10px] font-black tracking-[0.3em] text-white/40 uppercase">Live Canvas Preview</span>
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-red-500/50"/>
                <div className="w-2 h-2 rounded-full bg-amber-500/50"/>
                <div className="w-2 h-2 rounded-full bg-emerald-500/50"/>
              </div>
            </div>
            
            <div className="flex-1 relative rounded-2xl overflow-hidden bg-white/5 border border-white/10 group">
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="h-full w-full object-cover animate-in fade-in duration-500" />
              ) : (
                <div className="h-full w-full flex flex-col items-center justify-center p-12 text-center">
                  <ImageIcon size={48} className="text-white/10 mb-4" />
                  <p className="text-white/30 text-sm font-medium">Waiting for image selection...</p>
                </div>
              )}
              {form.title && (
                 <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                    <p className="text-xs font-bold text-indigo-400 uppercase tracking-tighter mb-1">Slide {form.displayOrder}</p>
                    <h4 className="text-xl font-bold leading-tight">{form.title}</h4>
                 </div>
              )}
            </div>

            <div className="mt-8 flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 items-start">
              <Info className="text-indigo-400 shrink-0" size={20} />
              <p className="text-[11px] leading-relaxed text-white/50">
                This image will be cropped to fit your homepage carousel container. For best results, use a <b>16:9</b> or <b>21:9</b> aspect ratio.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* List Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-black tracking-tight text-slate-800">Active Slides</h3>
            <p className="text-sm text-slate-500">{loading ? 'Syncing...' : `${items.length} items currently live`}</p>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div key={item.id} className="group relative bg-white rounded-3xl border border-slate-200 overflow-hidden hover:shadow-2xl hover:shadow-slate-200 transition-all duration-300">
              <div className="h-48 overflow-hidden relative">
                <img src={getImageSrc(item.imageUrl)} alt={item.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-black text-slate-900 shadow-sm border border-slate-200">
                  ORDER {item.displayOrder}
                </div>
              </div>
              
              <div className="p-5">
                <h4 className="font-bold text-slate-800 line-clamp-1 mb-4">{item.title}</h4>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(item)}
                    className="flex-1 flex items-center justify-center gap-2 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 py-2.5 rounded-xl text-xs font-bold transition-colors"
                  >
                    <Edit3 size={14}/> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="flex-1 flex items-center justify-center gap-2 bg-slate-50 hover:bg-red-50 hover:text-red-600 text-slate-600 py-2.5 rounded-xl text-xs font-bold transition-colors"
                  >
                    <Trash2 size={14}/> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          {!items.length && !loading && (
            <div className="sm:col-span-2 lg:col-span-3 py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200 text-center">
               <ImageIcon size={48} className="mx-auto text-slate-200 mb-4" />
               <h3 className="text-slate-400 font-bold uppercase tracking-widest text-sm">Gallery is Empty</h3>
               <p className="text-slate-400 text-xs mt-1">Start by adding your first promotional slide above.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}