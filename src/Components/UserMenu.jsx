import React, { useState } from 'react'
import { useAuth } from '../Auth/AuthContext'
import { signOut } from 'firebase/auth'
import { auth } from '../Auth/Firebase'
import { useNavigate } from 'react-router-dom'

export const UserMenu = () => {
  const { user } = useAuth()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await signOut(auth)
      setIsDropdownOpen(false)
      navigate('/')
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  const getInitials = (name) => {
    if (!name) return '?'
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getUserPhotoUrl = () => {
    return (
      user?.photoURL ||
      user?.providerData?.find((provider) => provider?.photoURL)?.photoURL ||
      user?.reloadUserInfo?.photoUrl ||
      ''
    )
  }

  if (!user) {
    return null
  }

  const photoUrl = getUserPhotoUrl()
  const displayName = user.displayName || user.email || 'User'

  return (
    <div className="relative">
      {/* Profile Picture Button */}
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-linear-to-br from-blue-500 to-cyan-600 text-white font-bold text-sm transition-all hover:from-blue-600 hover:to-cyan-700"
      >
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={displayName}
            className="h-full w-full rounded-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          getInitials(displayName)
        )}
      </button>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-black border border-white/20 rounded-lg shadow-lg overflow-hidden z-50">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-white/10">
            <p className="text-white text-sm font-semibold truncate">
              {displayName}
            </p>
          </div>

          <div className="px-2 py-2">
            <button
              type="button"
              onClick={() => {
                navigate('/orders')
                setIsDropdownOpen(false)
              }}
              className="w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-white/90 transition-colors hover:bg-white/10 hover:text-white"
            >
              My Orders
            </button>
          </div>

          {/* Logout Button */}
          <div className="px-4 py-2 border-t border-white/10">
            <button
              onClick={handleLogout}
              className="w-full px-3 py-2 text-sm font-semibold text-white bg-red-600/80 hover:bg-red-600 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      )}

      {/* Close dropdown when clicking outside */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </div>
  )
}
