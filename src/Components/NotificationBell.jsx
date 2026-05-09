import React, { useState, useEffect } from 'react'
import { useAuth } from '../Auth/AuthContext'
import { API_BASE_URL } from '../config/api'

const BellIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0018 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
    />
  </svg>
)

export const NotificationBell = () => {
  const { user } = useAuth()
  const [notificationCount, setNotificationCount] = useState(0)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user) return

    // Fetch initial notifications
    fetchNotifications()

    // Set up polling to check for new orders every 10 seconds
    const interval = setInterval(fetchNotifications, 10000)

    return () => clearInterval(interval)
  }, [user])

  const fetchNotifications = async () => {
    if (!user) return
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/api/orders?userUid=${user.uid}`)
      if (response.ok) {
        const data = await response.json()
        const orders = data.orders || []
        
        // Filter new orders (status: pending or recent)
        const newOrders = orders.filter(order => 
          order.status === 'pending' || order.status === 'new'
        )
        
        setNotificationCount(newOrders.length)
        setNotifications(newOrders)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return null
  }

  return (
    <div className="relative">
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="relative flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white transition-all duration-200 hover:bg-white hover:text-black"
        aria-label="Notifications"
      >
        <BellIcon />
        {notificationCount > 0 && (
          <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-black leading-none text-white">
            {notificationCount > 99 ? '99+' : notificationCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-black border border-white/20 rounded-lg shadow-2xl overflow-hidden z-50">
          {/* Header */}
          <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
            <h3 className="text-white font-semibold">Notifications</h3>
            <button
              onClick={() => setIsDropdownOpen(false)}
              className="text-white/50 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="px-4 py-6 text-center text-white/50">
                <p>Loading...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-6 text-center text-white/50">
                <p>No new notifications</p>
              </div>
            ) : (
              notifications.map((notification, idx) => (
                <div
                  key={idx}
                  className="px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-white">
                        Order #{notification.orderNumber}
                      </p>
                      <p className="text-xs text-white/60 mt-1">
                        {notification.items?.length || 1} item(s) - Rs. {notification.total?.toLocaleString() || '0'}
                      </p>
                      <p className="text-xs text-white/40 mt-1">
                        Status: <span className="text-yellow-400 font-semibold">{notification.status || 'pending'}</span>
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <span className="inline-block px-2 py-1 bg-red-500/20 text-red-300 text-[10px] font-bold rounded">
                        NEW
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Action */}
          {notifications.length > 0 && (
            <div className="px-4 py-2 border-t border-white/10">
              <button
                onClick={() => {
                  setIsDropdownOpen(false)
                  // Navigate to orders page can be added here if needed
                }}
                className="w-full px-3 py-2 text-sm font-semibold text-white bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              >
                View All Orders
              </button>
            </div>
          )}
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
