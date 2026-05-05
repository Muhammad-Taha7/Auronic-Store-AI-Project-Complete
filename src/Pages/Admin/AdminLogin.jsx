import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

export const AdminLogin = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [locked, setLocked] = useState(false)
  const [lockTimer, setLockTimer] = useState(0)

  const from = location.state?.from?.pathname || '/admin/dashboard'

  const sanitize = (val) => val.replace(/[<>"'`]/g, '').trim()

  const startLockout = () => {
    setLocked(true)
    let t = 30
    setLockTimer(t)
    const interval = setInterval(() => {
      t -= 1
      setLockTimer(t)
      if (t <= 0) {
        clearInterval(interval)
        setLocked(false)
        setAttempts(0)
        setLockTimer(0)
      }
    }, 1000)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (locked) return
    setError('')
    setLoading(true)

    const cleanEmail = sanitize(email)
    const cleanPassword = sanitize(password)

    try {
      if (!cleanEmail || !cleanPassword) {
        setError('All fields are required.')
        setLoading(false)
        return
      }

      await new Promise((r) => setTimeout(r, 900))

      const ADMIN_USERNAME = 'Taha'
      const ADMIN_PASSWORD = 'password.11'

      if (cleanEmail === ADMIN_USERNAME && cleanPassword === ADMIN_PASSWORD) {
        const token = btoa(`${cleanEmail}:${Date.now()}:${Math.random().toString(36)}`)
        localStorage.setItem('admin_session', 'active')
        localStorage.setItem('admin_user', cleanEmail)
        localStorage.setItem('admin_auth_token', token)
        localStorage.setItem('admin_login_time', Date.now().toString())
        navigate(from, { replace: true })
      } else {
        const newAttempts = attempts + 1
        setAttempts(newAttempts)
        if (newAttempts >= 3) {
          startLockout()
          setError('Too many failed attempts. Locked for 30 seconds.')
        } else {
          setError(`Invalid credentials. ${3 - newAttempts} attempt(s) remaining.`)
        }
      }
    } catch {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-white flex">

      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-black flex-col justify-between p-12 relative overflow-hidden">
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        {/* Circles */}
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full border border-white/10 translate-x-1/3 translate-y-1/3" />
        <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full border border-white/10 translate-x-1/4 translate-y-1/4" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="h-9 w-9 bg-white rounded-lg flex items-center justify-center">
            <span className="text-black font-black text-base">A</span>
          </div>
          <span className="text-white font-bold  tracking-widest text-3xl uppercase">Auronic</span>
        </div>

        {/* Middle content */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/20 bg-white/5 mb-6">
            <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-white/60 text-xs font-medium tracking-widest uppercase">Secure Portal</span>
          </div>
          <h2 className="text-7xl font-black text-white leading-tight mb-4">
            Admin Dashboard
          </h2>
          <p className="text-white/40 text-sm leading-relaxed max-w-xs">
            Authorized access only. All sessions are monitored and recorded for security purposes.
          </p>
        </div>

        {/* Bottom stats */}
        <div className="relative z-10 grid grid-cols-3 gap-4">
          {[
            { label: 'SSL Encrypted',  },
            { label: '2FA Ready',  },
            { label: 'Monitored', },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
              <div className="text-lg mb-1">{item.icon}</div>
              <p className="text-white/50 text-xs font-medium">{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 bg-white">
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-10">
            <div className="h-8 w-8 bg-black rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-sm">A</span>
            </div>
            <span className="text-black font-bold text-lg tracking-widest uppercase">Auronic</span>
          </div>

          {/* Header */}
          <div className="mb-10">
            <h1 className="text-3xl font-black text-black tracking-tight mb-2">Sign In</h1>
            <p className="text-black/40 text-sm">Enter your credentials to continue</p>
          </div>

          {/* Lockout Banner */}
          {locked && (
            <div className="mb-6 rounded-xl border-2 border-black bg-black p-4">
              <div className="flex items-center gap-3">
                <svg className="h-5 w-5 text-white shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m2-5V9m0 0a3 3 0 100-6 3 3 0 000 6z" />
                </svg>
                <div>
                  <p className="text-white text-sm font-bold">Account Locked</p>
                  <p className="text-white/60 text-xs">Retry in {lockTimer}s</p>
                </div>
                <div className="ml-auto text-white font-black text-xl">{lockTimer}</div>
              </div>
            </div>
          )}

          {/* Error */}
          {error && !locked && (
            <div className="mb-6 rounded-xl border border-black/10 bg-black/5 p-4 flex items-start gap-3">
              <svg className="h-4 w-4 text-black shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10A8 8 0 11 2 10a8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="text-black text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">

            {/* Username */}
            <div>
              <label className="block text-xs font-bold text-black tracking-widest uppercase mb-2">
                Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter username"
                  maxLength={32}
                  disabled={locked}
                  autoComplete="off"
                  className="w-full px-4 py-3.5 rounded-xl border-2 border-black/10 bg-black/5 text-black placeholder-black/30 text-sm font-medium transition-all duration-200 focus:outline-none focus:border-black focus:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
                />
                <svg className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-black/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-black tracking-widest uppercase mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  maxLength={64}
                  disabled={locked}
                  autoComplete="new-password"
                  className="w-full px-4 py-3.5 pr-12 rounded-xl border-2 border-black/10 bg-black/5 text-black placeholder-black/30 text-sm font-medium transition-all duration-200 focus:outline-none focus:border-black focus:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-black/30 hover:text-black transition-colors"
                >
                  {showPassword ? (
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                      <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.064 7 9.542 7 .817 0 1.614-.107 2.454-.303z" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Password strength bar */}
              {password.length > 0 && (
                <div className="mt-2 flex gap-1">
                  {[1, 2, 3, 4].map((i) => {
                    const strength =
                      (password.length >= 6 ? 1 : 0) +
                      (/[A-Z]/.test(password) ? 1 : 0) +
                      (/[0-9]/.test(password) ? 1 : 0) +
                      (/[^A-Za-z0-9]/.test(password) ? 1 : 0)
                    return (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          i <= strength ? 'bg-black' : 'bg-black/10'
                        }`}
                      />
                    )
                  })}
                </div>
              )}
            </div>

           

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || locked}
              className="w-full py-3.5 rounded-xl bg-black text-white text-sm font-bold tracking-widest uppercase transition-all duration-200 hover:bg-black/80 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Verifying...
                </>
              ) : locked ? (
                `Locked · ${lockTimer}s`
              ) : (
                <>
                  Sign In
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Attempt indicators */}
          {attempts > 0 && !locked && (
            <div className="mt-5 flex items-center justify-center gap-1.5">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`h-2 w-2 rounded-full transition-all duration-300 ${
                    i <= attempts ? 'bg-black scale-110' : 'bg-black/15'
                  }`}
                />
              ))}
              <span className="text-xs text-black/40 ml-2">{attempts}/3 attempts</span>
            </div>
          )}

          {/* Footer */}
          <div className="mt-10 pt-6 border-t border-black/8 text-center">
            <p className="text-xs text-black/30 font-medium">
              Protected by enterprise-grade security
            </p>
            <p className="text-xs text-black/20 mt-1">© 2025 StoreFront Admin Portal</p>
          </div>
        </div>
      </div>
    </div>
  )
}