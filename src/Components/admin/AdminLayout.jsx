import React, { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'

const navItems = [
  { to: '/admin/dashboard', label: 'Dashboard' },
  { to: '/admin/carousel-images', label: 'Add Carousel Images' },
]

export const AdminLayout = () => {
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem('admin_session')
    localStorage.removeItem('admin_email')
    localStorage.removeItem('admin_user')
    navigate('/admin/login', { replace: true })
  }

  const adminEmail = localStorage.getItem('admin_user') || localStorage.getItem('admin_email') || 'Taha'

  return (
    <div className='min-h-screen bg-white text-black'>
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen border-r border-black/10 bg-black transition-all duration-300 z-40 ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        {/* Logo Section */}
        <div className='flex items-center justify-between p-6 border-b border-white/10'>
          {sidebarOpen && (
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-white text-black font-black'>
                S
              </div>
              <div>
                <p className='text-xs uppercase tracking-widest text-white/50 font-semibold'>
                  Auronic
                </p>
                <p className='text-sm font-bold text-white'>Admin Portal</p>
              </div>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className='rounded-lg p-2 text-white/60 hover:bg-white/10 transition-colors'
          >
            <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d={sidebarOpen ? 'M15 19l-7-7 7-7' : 'M9 5l7 7-7 7'}
              />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className='space-y-2 p-4'>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-white text-black'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              {sidebarOpen && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User Profile Section */}
        <div className='absolute bottom-0 left-0 right-0 border-t border-white/10 bg-black p-4 space-y-3'>
          <div
            className={`rounded-lg px-3 py-2 ${
              sidebarOpen ? 'bg-white/5' : 'bg-transparent'
            }`}
          >
            <p className={`text-xs text-white/50 ${sidebarOpen ? '' : 'text-center'}`}>
              {sidebarOpen ? 'Logged in as' : '👤'}
            </p>
            {sidebarOpen && (
              <>
                <p className='text-sm font-semibold text-white truncate'>{adminEmail}</p>
                <p className='text-xs text-white/50'>Administrator</p>
              </>
            )}
          </div>
          <button
            onClick={() => setShowLogoutModal(true)}
            className='w-full rounded-lg border border-white/15 bg-white px-4 py-2 text-sm font-medium text-black hover:bg-white/90 transition-colors flex items-center justify-center gap-2'
          >
            <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1'
              />
            </svg>
            {sidebarOpen && 'Logout'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        {/* Top Header */}
        <header className='sticky top-0 z-30 border-b border-black/10 bg-white/95 backdrop-blur px-6 py-4 shadow-sm'>
          <div className='flex items-center justify-between gap-4'>
            <div>
              <h1 className='text-2xl font-black text-black'>Admin Portal</h1>
              <p className='text-sm text-black/50 mt-1'>
                Welcome back! Here's what's happening with your business.
              </p>
            </div>
            <div className='flex items-center gap-4'>
              <button className='rounded-lg p-2 text-black/60 hover:bg-black/5 transition-colors'>
                <svg className='h-6 w-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9'
                  />
                </svg>
              </button>
              <div className='h-8 w-8 rounded-full bg-black flex items-center justify-center text-white font-bold text-sm'>
                A
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className='p-6 min-h-[calc(100vh-120px)]'>
          <Outlet />
        </main>
      </div>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4'>
          <div className='rounded-2xl border border-slate-700 bg-slate-800 shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95'>
            <div className='flex items-center justify-center h-12 w-12 rounded-full bg-red-500/10 mx-auto mb-4'>
              <svg className='h-6 w-6 text-red-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 9v2m0 4v2m0 6v-6m0-6V9m0 0l6.586 0a2 2 0 012 2v4.414a2 2 0 01-2 2H3.414a2 2 0 01-2-2V7a2 2 0 012-2h8.172a2 2 0 011.414.586L15 4'
                />
              </svg>
            </div>
            <h3 className='text-lg font-bold text-white text-center mb-2'>Confirm Logout</h3>
            <p className='text-slate-400 text-center text-sm mb-6'>
              Are you sure you want to logout? You'll need to sign in again to access the admin portal.
            </p>
            <div className='flex gap-3'>
              <button
                onClick={() => setShowLogoutModal(false)}
                className='flex-1 rounded-lg border border-slate-600 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700 transition-colors'
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className='flex-1 rounded-lg bg-linear-to-r from-red-600 to-red-700 px-4 py-2 text-sm font-medium text-white hover:from-red-700 hover:to-red-800 transition-all'
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
