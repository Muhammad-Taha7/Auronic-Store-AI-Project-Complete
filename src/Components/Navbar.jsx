import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../Auth/AuthContext'
import { UserMenu } from './UserMenu'

const navItems = [
  { to: '/', label: 'Home' },
,
  { to: '/products', label: 'Products' },
    { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]

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
  const [cartOpen, setCartOpen] = React.useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()

  const openCart = () => {
    setMobileMenuOpen(false)
    setCartOpen(true)
  }

  const closeCart = () => {
    setCartOpen(false)
  }

  return (
    <>
      {/* Overlay */}
      {(mobileMenuOpen || cartOpen) && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => {
            setMobileMenuOpen(false)
            setCartOpen(false)
          }}
        />
      )}

      {/* Right Cart Drawer */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-md border-l border-white/10 bg-black shadow-2xl transition-transform duration-300 ease-in-out ${
          cartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <div>
            <p className="text-xs font-semibold tracking-[0.35em] text-white/50 uppercase">Cart</p>
            <h2 className="mt-1 text-xl font-black tracking-widest uppercase text-white">Your Items</h2>
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
          <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/5 px-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/15 text-white/80">
              <CartIcon />
            </div>
            <h3 className="mt-5 text-lg font-semibold text-white">Your cart is empty</h3>
            <p className="mt-2 text-sm leading-6 text-white/55">
              Items you add will appear here with the quantity total shown in the badge.
            </p>
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between text-sm text-white/70">
              <span>Total items</span>
              <span className="font-semibold text-white">0</span>
            </div>
            <button
              type="button"
              className="mt-4 w-full rounded-lg bg-white px-4 py-3 text-sm font-semibold uppercase tracking-[0.25em] text-black transition-colors hover:bg-white/90"
            >
              Checkout
            </button>
          </div>
        </div>
      </div>

      {/* Left Drawer */}
      <div
        className={`fixed top-0 left-0 z-50 h-full w-full bg-black border-r border-white/10 flex flex-col transition-transform duration-300 ease-in-out md:hidden ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <NavLink
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 text-white font-black text-xl tracking-widest uppercase"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-white text-black font-black text-sm">
              A
            </span>
           Auronic
          </NavLink>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="text-white/50 hover:text-white transition-colors p-1 rounded-md hover:bg-white/10"
          >
            <svg className="h-7 w-7 bg-white text-black rounded-3xl " fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Drawer Nav Links */}
        <nav className="flex flex-col items-center justify-center  gap-1 px-4 py-6 flex-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-2xl font-semibold tracking-widest uppercase transition-all duration-200 ${
                  isActive
                    ? 'bg-white text-black'
                    : 'text-white/60 hover:text-white hover:bg-white/8'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Drawer Footer CTA */}
        <div className="px-6 py-6 border-t border-white/10">
          {user ? (
            <div className="flex items-center justify-center">
              <UserMenu />
            </div>
          ) : (
            <button
              onClick={() => {
                navigate('/login')
                setMobileMenuOpen(false)
              }}
              className="block w-full text-center py-3 rounded-lg border border-white/25 text-white text-sm font-semibold tracking-widest uppercase hover:bg-white hover:text-black transition-all duration-200"
            >
              Login
            </button>
          )}
        </div>
      </div>

      {/* Navbar */}
      <header className="sticky top-0 z-40 w-full bg-black border-b border-white/10">
        <div className=" px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <NavLink
              to="/"
              className="flex items-center gap-2.5 text-white font-black text-xl tracking-widest uppercase shrink-0"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-white text-black font-black text-sm">
                A
              </span>
              Auronic Store
            </NavLink>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `relative px-4 py-2 text-xs font-semibold tracking-widest uppercase transition-all duration-200 ${
                      isActive
                        ? 'text-white after:scale-x-100'
                        : 'text-white/50 hover:text-white after:scale-x-0 hover:after:scale-x-100'
                    } after:absolute after:bottom-0 after:left-4 after:right-4 after:h-px after:bg-white after:transition-transform after:duration-300 after:origin-left`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-3">
              <button
                type="button"
                className="relative flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white transition-all duration-200 hover:bg-white hover:text-black"
                aria-label="Cart"
                onClick={openCart}
              >
                <CartIcon />
                <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-[10px] font-black leading-none text-black">
                  0
                </span>
              </button>
              {user ? (
                <UserMenu />
              ) : (
                <button
                  onClick={() => navigate('/login')}
                  className="px-5 py-2 text-xs font-semibold tracking-widest uppercase text-white border border-white/20 rounded-lg hover:bg-white hover:text-black transition-all duration-200"
                >
                  Login
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={openCart}
              className="relative mr-2 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-white transition-colors hover:bg-white hover:text-black md:hidden"
              aria-label="Open cart drawer"
            >
              <CartIcon />
              <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-[10px] font-black leading-none text-black">
                0
              </span>
            </button>

            {/* Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex flex-col justify-center items-center gap-1.5 w-9 h-9 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Toggle menu"
            >
              <span
                className={`block h-px w-5 bg-white transition-all duration-300 ${
                  mobileMenuOpen ? 'rotate-45 translate-y-2' : ''
                }`}
              />
              <span
                className={`block h-px w-5 bg-white transition-all duration-300 ${
                  mobileMenuOpen ? 'opacity-0' : ''
                }`}
              />
              <span
                className={`block h-px w-5 bg-white transition-all duration-300 ${
                  mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''
                }`}
              />
            </button>

          </div>
        </div>
      </header>
    </>
  )
}