import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { FaCheckCircle, FaRegStar, FaShieldAlt, FaStar, FaTruck, FaHeadphones, FaBolt, FaUndo, FaBoxOpen } from 'react-icons/fa'
import { API_BASE_URL } from '../config/api'
import { useCart } from '../Context/CartContext'

const getImageSrc = (imageUrl = '') => {
  if (!imageUrl) return ''
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) return imageUrl
  return `${API_BASE_URL}${imageUrl}`
}

export const ProductDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addItem } = useCart()

  const [product, setProduct] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')
  const [selectedColor, setSelectedColor] = React.useState('')
  const [selectedWarranty, setSelectedWarranty] = React.useState('')
  const [quantity, setQuantity] = React.useState(1)
  const [selectedImage, setSelectedImage] = React.useState('')
  const [showSuccess, setShowSuccess] = React.useState(false)

  React.useEffect(() => {
    const loadProduct = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/products/${id}`)
        if (!response.ok) {
          throw new Error('Unable to load product details.')
        }
        const data = await response.json()
        setProduct(data)
        setSelectedColor(data.colors?.[0] || '')
        setSelectedWarranty(data.warrantyOptions?.[0] || '')
        setSelectedImage(getImageSrc(data.coverImage))
      } catch (fetchError) {
        setError(fetchError.message || 'Unable to load product details right now.')
      } finally {
        setLoading(false)
      }
    }

    loadProduct()
  }, [id])

  React.useEffect(() => {
    if (!showSuccess) return undefined
    const timeoutId = window.setTimeout(() => setShowSuccess(false), 1400)
    return () => window.clearTimeout(timeoutId)
  }, [showSuccess])

  const handleAddToCart = () => {
    if (!product) return
    addItem(product, {
      selectedColor,
      selectedWarranty,
      quantity,
    })
    setShowSuccess(true)
  }

  if (loading) {
    return (
      <main className="bg-white min-h-screen flex items-center justify-center text-black">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-black/45">Loading product</p>
          <h1 className="mt-4 text-3xl font-black uppercase tracking-[0.18em]">Please wait</h1>
        </div>
      </main>
    )
  }

  if (error || !product) {
    return (
      <main className="bg-white min-h-screen flex items-center justify-center text-black">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-black/45">Error</p>
          <h1 className="mt-4 text-3xl font-black uppercase tracking-[0.18em]">{error || 'Product not found'}</h1>
          <button
            type="button"
            onClick={() => navigate('/products')}
            className="mt-8 rounded-full border border-black/20 px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] hover:bg-black hover:text-white transition"
          >
            Back to products
          </button>
        </div>
      </main>
    )
  }

  const galleryImages = [product.coverImage, ...(product.galleryImages || [])].filter(Boolean)
  const price = Number(product.price || 0)
  const originalPrice = Number(product.originalPrice || 0)
  const discountPercent = originalPrice > 0 ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0
  const subtotal = price * quantity

  return (
    <main className="bg-white text-black min-h-screen">
      {showSuccess ? (
        <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-black/35 backdrop-blur-sm">
          <div className="success-pop flex flex-col items-center gap-4 rounded-4xl border border-black/10 bg-white px-10 py-8 shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
            <FaCheckCircle className="h-20 w-20 text-black" />
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-black/45">Added to cart</p>
          </div>
        </div>
      ) : null}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
        <div className="grid gap-8 lg:gap-12 lg:grid-cols-[1fr_1fr]">
          {/* Left Column - Image Gallery */}
          <div className="flex flex-col gap-4 ">
            <div className="aspect-square h-[40rem] overflow-hidden rounded-2xl border border-black/10 bg-black/5">
              <img 
                src={selectedImage || getImageSrc(product.coverImage)} 
                alt={product.title} 
                className="h-full w-full object-cover"
              />
            </div>

            {galleryImages.length > 1 ? (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {galleryImages.map((imageUrl, index) => {
                  const normalized = getImageSrc(imageUrl)
                  return (
                    <button
                      key={`${imageUrl}-${index}`}
                      type="button"
                      onClick={() => setSelectedImage(normalized)}
                      className={`aspect-square w-20 flex-none overflow-hidden rounded-xl border transition ${
                        selectedImage === normalized ? 'border-black ring-2 ring-black/20' : 'border-black/10 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={normalized} alt={`${product.title} ${index + 1}`} className="h-full w-full object-cover" />
                    </button>
                  )
                })}
              </div>
            ) : null}
          </div>

          {/* Right Column - Product Info */}
          <div className="flex flex-col gap-6">
            {/* Category & Title */}
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.3em] text-black/50">
                {product.category || 'WIRELESS EARBUDS'}
              </p>
              <h1 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight">
                {product.title}
              </h1>
            </div>

            {/* Rating & Reviews */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, index) =>
                  index < Math.round(product.rating || 0) ? 
                    <FaStar key={index} className="text-yellow-500 text-sm" /> : 
                    <FaRegStar key={index} className="text-black/30 text-sm" />
                )}
              </div>
              <span className="text-sm font-medium text-black/60">
                {Number(product.rating || 0).toFixed(1)} / 5
              </span>
              <span className="text-sm text-black/40">•</span>
              <span className="text-sm font-medium text-black/60">
                {product.reviewCount || 128} reviews
              </span>
            </div>

            {/* Price Section with Discount Badge */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold">Rs. {price.toLocaleString()}</span>
              {originalPrice > 0 && (
                <>
                  <span className="text-lg text-black/40 line-through">Rs. {originalPrice.toLocaleString()}</span>
                  <span className="bg-black/5 px-2 py-0.5 rounded-full text-xs font-semibold text-black/70">
                    {discountPercent}% OFF
                  </span>
                </>
              )}
            </div>

            {/* Delivery & Security Icons - Grid */}
            <div className="grid grid-cols-2 gap-3 py-2 border-y border-black/5">
              <div className="flex items-center gap-2 text-sm text-black/60">
                <FaTruck className="text-black/40 text-base" />
                <span>Free Delivery on orders above Rs. 2000</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-black/60">
                <FaShieldAlt className="text-black/40 text-base" />
                <span>Secure Purchase Guarantee</span>
              </div>
            </div>

            {/* Color Selection */}
            {product.colors?.length > 0 && (
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-black/50 mb-3">Color</p>
                <div className="flex flex-wrap gap-3">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                        selectedColor === color 
                          ? 'bg-black text-white shadow-md' 
                          : 'bg-black/5 text-black/70 hover:bg-black/10 border border-black/10'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Warranty Options */}
            {product.warrantyOptions?.length > 0 && (
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-black/50 mb-3">Warranty</p>
                <div className="grid grid-cols-2 gap-3">
                  {product.warrantyOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setSelectedWarranty(option)}
                      className={`px-3 py-2.5 rounded-xl text-sm font-medium text-left transition-all duration-200 ${
                        selectedWarranty === option 
                          ? 'bg-black text-white shadow-md' 
                          : 'bg-black/5 text-black/70 hover:bg-black/10 border border-black/10'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity and Add to Cart */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <div className="flex items-center border border-black/10 rounded-full">
                <button
                  type="button"
                  onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                  className="h-10 w-10 flex items-center justify-center rounded-l-full text-xl font-medium hover:bg-black/5 transition"
                >
                  -
                </button>
                <span className="w-12 text-center text-base font-semibold">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((current) => current + 1)}
                  className="h-10 w-10 flex items-center justify-center rounded-r-full text-xl font-medium hover:bg-black/5 transition"
                >
                  +
                </button>
              </div>

              <div className="flex-1 text-sm">
                <span className="text-black/50">Subtotal: </span>
                <span className="font-bold">Rs. {subtotal.toLocaleString()}</span>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                className="bg-black text-white px-8 py-3 rounded-full text-sm font-semibold uppercase tracking-[0.15em] hover:bg-black/90 transition-all duration-200 active:scale-95"
              >
                Add to Cart
              </button>
            </div>

            {/* Free Delivery Reminder */}
            <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 px-3 py-2 rounded-lg">
              <FaCheckCircle className="text-green-600 text-xs" />
              <span>✓ Free delivery on orders above Rs. 2000</span>
            </div>

            {/* About This Product Section */}
            <div className="mt-4 pt-4 border-t border-black/10">
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-black/50 mb-3">About This Product</h3>
              <p className="text-sm text-black/70 leading-relaxed">
                {product.description || 'Experience powerful sound without the hassle of wires. These wireless earbuds are designed to deliver crystal-clear audio, deep bass, and smooth connectivity for music lovers and professionals alike.'}
              </p>
            </div>

            {/* Key Features as Bullet Points with Icons */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-black/50 mb-3">Key Features</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { icon: FaHeadphones, text: 'Premium Build Quality' },
                  { icon: FaBolt, text: 'Advanced Technology' },
                  { icon: FaBoxOpen, text: '12 Months Warranty' },
                  { icon: FaTruck, text: 'Free Shipping Available' },
                  ...(product.highlights?.map(h => ({ icon: FaCheckCircle, text: h })) || [])
                ].slice(0, 6).map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm text-black/70">
                    <feature.icon className="text-black/40 text-xs" />
                    <span>{feature.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}