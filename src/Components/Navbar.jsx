import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../Auth/AuthContext'
import { API_BASE_URL } from '../config/api'
import { useCart } from '../Context/CartContext'
import { UserMenu } from './UserMenu'
import { usePageTransition } from '../Transition/Transition.jsx'

const SHIPPING_FEE = 250

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/products', label: 'Products' },
  { to: '/blogs', label: 'Blogs' },
  { to: '/contact', label: 'Contact' },
]

const defaultCheckoutForm = {
  customerName: '',
  customerEmail: '',
  customerPhone: '',
  shippingAddress: '',
  city: '',
  notes: '',
  paymentMethod: 'COD',
}

const CartIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13 5.4 5M7 13l-1.293 2.293A1 1 0 0 0 6.618 17H19m-12 0a2 2 0 1 0 4 0m8 0a2 2 0 1 0 4 0"
    />
  </svg>
)

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)
  const [showCheckout, setShowCheckout] = React.useState(false)
  const [checkoutForm, setCheckoutForm] = React.useState(defaultCheckoutForm)
  const [checkoutError, setCheckoutError] = React.useState('')
  const [checkoutSuccess, setCheckoutSuccess] = React.useState('')
  const [placingOrder, setPlacingOrder] = React.useState(false)

  const { user } = useAuth()
  const navigate = useNavigate()
  const { transitionTo } = usePageTransition()
  const { items, cartCount, cartSubtotal, isCartOpen, setIsCartOpen, updateQuantity, removeItem, clearCart } = useCart()

  const handleNavigation = (path) => {
    transitionTo(() => {
      navigate(path)
      setMobileMenuOpen(false)
    })
  }

  React.useEffect(() => {
    if (user) {
      setCheckoutForm((current) => ({
        ...current,
        customerName: current.customerName || user.displayName || '',
        customerEmail: current.customerEmail || user.email || '',
      }))
    }
  }, [user])

  const openCart = () => {
    setMobileMenuOpen(false)
    setIsCartOpen(true)
  }

  const closeCart = () => {
    setIsCartOpen(false)
  }

  const totalAmount = cartSubtotal + (items.length ? SHIPPING_FEE : 0)

  const handleCheckoutChange = (event) => {
    const { name, value } = event.target
    setCheckoutForm((current) => ({ ...current, [name]: value }))
  }

  const startCheckout = () => {
    setCheckoutError('')
    setCheckoutSuccess('')

    if (!items.length) {
      setCheckoutError('Your cart is empty.')
      return
    }

    setShowCheckout(true)
  }

  const closeCheckout = () => {
    if (placingOrder) return
    setShowCheckout(false)
  }

  const submitOrder = async (event) => {
    event.preventDefault()
    setCheckoutError('')
    setCheckoutSuccess('')

    if (!checkoutForm.customerName.trim()) {
      setCheckoutError('Name is required.')
      return
    }
    if (!checkoutForm.customerEmail.trim()) {
      setCheckoutError('Email is required.')
      return
    }
    if (!checkoutForm.customerPhone.trim()) {
      setCheckoutError('Phone is required.')
      return
    }
    if (!checkoutForm.shippingAddress.trim()) {
      setCheckoutError('Address is required.')
      return
    }
    if (!checkoutForm.city.trim()) {
      setCheckoutError('City is required.')
      return
    }

    setPlacingOrder(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...checkoutForm,
          paymentMethod: 'COD',
          userUid: user?.uid || '',
          items,
          subtotal: cartSubtotal,
          shippingFee: SHIPPING_FEE,
          total: totalAmount,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || 'Unable to place order right now.')
      }

      clearCart()
      setCheckoutSuccess(`Order placed successfully. Order No: ${data.orderNumber}`)
      setCheckoutForm((current) => ({
        ...defaultCheckoutForm,
        customerName: user?.displayName || '',
        customerEmail: user?.email || '',
      }))

      window.setTimeout(() => {
        setShowCheckout(false)
        setIsCartOpen(false)
        navigate('/orders')
      }, 1200)
    } catch (err) {
      setCheckoutError(err.message || 'Unable to place order right now.')
    } finally {
      setPlacingOrder(false)
    }
  }

  return (
    <>
      {(mobileMenuOpen || isCartOpen || showCheckout) && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => {
            setMobileMenuOpen(false)
            if (!placingOrder) {
              setIsCartOpen(false)
              setShowCheckout(false)
            }
          }}
        />
      )}

      <div
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-md border-l border-white/10 bg-black shadow-2xl transition-transform duration-300 ease-in-out ${
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/50">Cart</p>
            <h2 className="mt-1 text-xl font-black tracking-widest uppercase text-white">Checkout Bag</h2>
          </div>
          <button
            onClick={closeCart}
            className="rounded-md p-2 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Close cart drawer"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex h-[calc(100%-73px)] flex-col px-6 py-6">
          {items.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/5 px-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/15 text-white/80">
                <CartIcon />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-white">Your cart is empty</h3>
              <p className="mt-2 text-sm leading-6 text-white/55">Choose products from store and continue to checkout.</p>
            </div>
          ) : (
            <>
              <div className="flex-1 space-y-4 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.cartKey} className="flex gap-4 rounded-2xl border border-white/10 bg-white/5 p-3">
                    <img src={item.coverImage} alt={item.title} className="h-20 w-20 flex-none rounded-xl object-cover" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-white">{item.title}</p>
                          <p className="mt-1 text-xs text-white/55">{item.selectedColor ? `Color: ${item.selectedColor}` : 'Default color'}</p>
                          <p className="text-xs text-white/55">{item.selectedWarranty ? `Warranty: ${item.selectedWarranty}` : 'Standard warranty'}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(item.cartKey)}
                          className="rounded-full border border-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.25em] text-white/70 transition hover:bg-white hover:text-black"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="mt-3 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.cartKey, item.quantity - 1)}
                            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-white transition hover:bg-white hover:text-black"
                          >
                            -
                          </button>
                          <span className="min-w-10 text-center text-sm font-semibold text-white">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.cartKey, item.quantity + 1)}
                            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-white transition hover:bg-white hover:text-black"
                          >
                            +
                          </button>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-white">Rs. {(Number(item.price) * Number(item.quantity)).toLocaleString()}</p>
                          {item.originalPrice ? (
                            <p className="text-[10px] uppercase tracking-[0.25em] text-white/40 line-through">Rs. {Number(item.originalPrice).toLocaleString()}</p>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between text-sm text-white/70">
                  <span>Subtotal</span>
                  <span className="font-semibold text-white">Rs. {cartSubtotal.toLocaleString()}</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm text-white/70">
                  <span>Shipping</span>
                  <span className="font-semibold text-white">Rs. {SHIPPING_FEE.toLocaleString()}</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm text-white/70">
                  <span>Total</span>
                  <span className="font-semibold text-white">Rs. {totalAmount.toLocaleString()}</span>
                </div>
                <button
                  type="button"
                  onClick={startCheckout}
                  className="mt-4 w-full rounded-lg bg-white px-4 py-3 text-sm font-semibold uppercase tracking-[0.25em] text-black transition-colors hover:bg-white/90"
                >
                  Proceed Checkout
                </button>
                {checkoutError ? <p className="mt-3 text-xs text-red-300">{checkoutError}</p> : null}
              </div>
            </>
          )}
        </div>
      </div>

      {showCheckout ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-3xl border border-black/10 bg-white p-6 shadow-[0_30px_90px_rgba(0,0,0,0.35)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-black/45">Secure Checkout</p>
                <h3 className="mt-2 text-2xl font-black uppercase tracking-[0.16em] text-black">Cash On Delivery</h3>
              </div>
              <button
                type="button"
                onClick={closeCheckout}
                className="rounded-lg border border-black/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-black hover:bg-black/5"
              >
                Close
              </button>
            </div>

            <form onSubmit={submitOrder} className="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.28em] text-black/50">Full Name</label>
                <input
                  name="customerName"
                  value={checkoutForm.customerName}
                  onChange={handleCheckoutChange}
                  className="w-full rounded-xl border border-black/10 px-4 py-3 text-sm focus:border-black focus:outline-none"
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.28em] text-black/50">Email</label>
                <input
                  name="customerEmail"
                  value={checkoutForm.customerEmail}
                  onChange={handleCheckoutChange}
                  className="w-full rounded-xl border border-black/10 px-4 py-3 text-sm focus:border-black focus:outline-none"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.28em] text-black/50">Phone</label>
                <input
                  name="customerPhone"
                  value={checkoutForm.customerPhone}
                  onChange={handleCheckoutChange}
                  className="w-full rounded-xl border border-black/10 px-4 py-3 text-sm focus:border-black focus:outline-none"
                  placeholder="03xx-xxxxxxx"
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.28em] text-black/50">City</label>
                <input
                  name="city"
                  value={checkoutForm.city}
                  onChange={handleCheckoutChange}
                  className="w-full rounded-xl border border-black/10 px-4 py-3 text-sm focus:border-black focus:outline-none"
                  placeholder="Lahore"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.28em] text-black/50">Shipping Address</label>
                <textarea
                  name="shippingAddress"
                  value={checkoutForm.shippingAddress}
                  onChange={handleCheckoutChange}
                  rows={3}
                  className="w-full rounded-xl border border-black/10 px-4 py-3 text-sm focus:border-black focus:outline-none"
                  placeholder="House number, street, area"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.28em] text-black/50">Order Notes (Optional)</label>
                <textarea
                  name="notes"
                  value={checkoutForm.notes}
                  onChange={handleCheckoutChange}
                  rows={2}
                  className="w-full rounded-xl border border-black/10 px-4 py-3 text-sm focus:border-black focus:outline-none"
                  placeholder="Any delivery instructions"
                />
              </div>

              <div className="sm:col-span-2 rounded-2xl border border-black/10 bg-black/5 p-4">
                <div className="flex items-center justify-between text-sm text-black/70">
                  <span>Payment Method</span>
                  <span className="rounded-full border border-black px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em] text-black">Cash On Delivery</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm text-black/70">
                  <span>Total Payable</span>
                  <span className="text-lg font-black text-black">Rs. {totalAmount.toLocaleString()}</span>
                </div>
              </div>

              {checkoutError ? <p className="sm:col-span-2 text-sm text-red-600">{checkoutError}</p> : null}
              {checkoutSuccess ? <p className="sm:col-span-2 text-sm text-green-700">{checkoutSuccess}</p> : null}

              <button
                type="submit"
                disabled={placingOrder}
                className="sm:col-span-2 rounded-xl bg-black px-6 py-3 text-sm font-semibold uppercase tracking-[0.28em] text-white transition hover:bg-black/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {placingOrder ? 'Placing Order...' : 'Place Order'}
              </button>
            </form>
          </div>
        </div>
      ) : null}

      <div
        className={`fixed top-0 left-0 z-50 h-full w-full bg-black border-r border-white/10 flex flex-col transition-transform duration-300 ease-in-out md:hidden ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <button
            onClick={() => handleNavigation('/')}
            className="flex items-center gap-2 text-white font-black text-xl tracking-widest uppercase hover:opacity-80 transition-opacity"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-white text-black font-black text-sm">A</span>
            Auronic
          </button>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="text-white/50 hover:text-white transition-colors p-1 rounded-md hover:bg-white/10"
          >
            <svg className="h-7 w-7 bg-white text-black rounded-3xl" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex flex-col items-center justify-center gap-1 px-4 py-6 flex-1">
          {navItems.map((item) => (
            <button
              key={item.to}
              onClick={() => handleNavigation(item.to)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-2xl font-semibold tracking-widest uppercase transition-all duration-200 w-full justify-center text-white/60 hover:text-white hover:bg-white/8`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="px-6 py-6 border-t border-white/10">
          {user ? (
            <div className="flex items-center justify-center">
              <UserMenu />
            </div>
          ) : (
            <button
              onClick={() => handleNavigation('/login')}
              className="block w-full text-center py-3 rounded-lg border border-white/25 text-white text-sm font-semibold tracking-widest uppercase hover:bg-white hover:text-black transition-all duration-200"
            >
              Login
            </button>
          )}
        </div>
      </div>

      <header className="sticky top-0 z-40 w-full bg-black border-b border-white/10">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => handleNavigation('/')}
              className="flex items-center gap-2.5 text-white font-black text-xl tracking-widest uppercase shrink-0 hover:opacity-80 transition-opacity"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-white text-black font-black text-sm">A</span>
              Auronic Store
            </button>

            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <button
                  key={item.to}
                  onClick={() => handleNavigation(item.to)}
                  className={`relative px-4 py-2 text-xs font-semibold tracking-widest uppercase transition-all duration-200 text-white/50 hover:text-white after:scale-x-0 hover:after:scale-x-100 after:absolute after:bottom-0 after:left-4 after:right-4 after:h-px after:bg-white after:transition-transform after:duration-300 after:origin-left`}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            <div className="hidden md:flex items-center gap-3">
              <button
                type="button"
                className="relative flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white transition-all duration-200 hover:bg-white hover:text-black"
                aria-label="Cart"
                onClick={openCart}
              >
                <CartIcon />
                <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-[10px] font-black leading-none text-black">
                  {cartCount}
                </span>
              </button>
              {user ? (
                <UserMenu />
              ) : (
                <button
                  onClick={() => handleNavigation('/login')}
                  className="px-5 py-2 text-xs font-semibold tracking-widest uppercase text-white border border-white/20 rounded-lg hover:bg-white hover:text-black transition-all duration-200"
                >
                  Login
                </button>
              )}
            </div>

            {user && (
              <button
                type="button"
                onClick={openCart}
                className="relative mr-2 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-white transition-colors hover:bg-white hover:text-black md:hidden"
                aria-label="Open cart drawer"
              >
                <CartIcon />
                <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-[10px] font-black leading-none text-black">
                  {cartCount}
                </span>
              </button>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex flex-col justify-center items-center gap-1.5 w-9 h-9 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Toggle menu"
            >
              <span className={`block h-px w-5 bg-white transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`block h-px w-5 bg-white transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : ''}`} />
              <span className={`block h-px w-5 bg-white transition-all duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </button>
          </div>
        </div>
      </header>
    </>
  )
}
