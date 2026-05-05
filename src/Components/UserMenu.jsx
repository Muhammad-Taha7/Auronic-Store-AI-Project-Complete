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

  if (!user) {
    return null
  }

  return (
    <div className="relative">
      {/* Profile Picture Button */}
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-sm hover:from-blue-600 hover:to-purple-700 transition-all"
      >
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt={user.displayName || 'User'}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          getInitials(user.displayName || user.email)
        )}
      </button>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-black border border-white/20 rounded-lg shadow-lg overflow-hidden z-50">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-white/10">
            <p className="text-white text-sm font-semibold truncate">
              {user.displayName || 'User'}
            </p>
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
