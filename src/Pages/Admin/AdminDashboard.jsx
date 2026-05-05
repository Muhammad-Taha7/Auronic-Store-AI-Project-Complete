import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_BASE_URL } from '../../config/api'

export const AdminDashboard = () => {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    totalImages: 0,
    activeImages: 0,
    pendingImages: 0,
    lastUpdated: null,
  })
  const [carouselImages, setCarouselImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchDashboardData = React.useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`${API_BASE_URL}/api/carousel-images`)
      if (!response.ok) throw new Error('Failed to fetch carousel data')

      const data = await response.json()
      setCarouselImages(Array.isArray(data) ? data : [])

      const activeCount = (data || []).filter((img) => img.isActive).length
      setStats({
        totalImages: (data || []).length,
        activeImages: activeCount,
        pendingImages: Math.max(0, (data || []).length - activeCount),
        lastUpdated: new Date().toLocaleTimeString(),
      })
    } catch (err) {
      setError(err.message || 'Unable to load dashboard data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboardData()
    const interval = setInterval(fetchDashboardData, 30000)
    return () => clearInterval(interval)
  }, [fetchDashboardData])

  const deleteImage = async (imageId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/carousel-images/${imageId}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete image')
      await fetchDashboardData()
    } catch (err) {
      setError(err.message || 'Failed to delete image')
    }
  }

  return (
    <div className="space-y-6 bg-white text-black">
      {/* Header */}
      <div className="rounded-3xl border border-black/10 bg-black p-8 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">Dashboard</p>
            <h1 className="mt-3 text-4xl font-black uppercase tracking-[0.2em]">Auronic Admin Portal</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">
              Manage your carousel images and monitor website performance from here.
            </p>
          </div>
          <button
            onClick={fetchDashboardData}
            className="rounded-2xl border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] hover:bg-white/20 transition-colors"
          >
            Refresh Data
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="rounded-2xl border border-red-300 bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          {
            label: 'Total Slides',
            value: stats.totalImages,
            bgColor: 'bg-black',
            textColor: 'text-white',
          },
          {
            label: 'Active Slides',
            value: stats.activeImages,
            bgColor: 'bg-[#007400]',
            textColor: 'text-white',
          },
          {
            label: 'Last Updated',
            value: stats.lastUpdated || '--',
            bgColor: 'bg-white',
            textColor: 'text-black',
            borderColor: 'border-black/10',
          },
        ].map((stat, idx) => (
          <div
            key={idx}
            className={`rounded-2xl border ${stat.borderColor || 'border-transparent'} ${stat.bgColor} p-6 shadow-md`}
          >
            <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${stat.textColor === 'text-white' ? 'text-white/60' : 'text-black/50'}`}>
              {stat.label}
            </p>
            <p className={`mt-3 text-3xl font-black ${stat.textColor}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quick Actions */}
        <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-md lg:col-span-1">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/50">Quick Actions</p>
          <h2 className="mt-2 text-lg font-black uppercase tracking-[0.15em]">Actions</h2>
          <div className="mt-6 space-y-2">
            <button
              onClick={() => navigate('/admin/carousel-images')}
              className="w-full rounded-xl bg-[#007400] px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white hover:bg-[#006100] transition-colors"
            >
              + Add Carousel Slide
            </button>
            <button
              onClick={fetchDashboardData}
              className="w-full rounded-xl border-2 border-black bg-white px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-black hover:bg-black hover:text-white transition-colors"
            >
              View All Slides
            </button>
            <a
              href="/"
              className="block rounded-xl border border-black/10 bg-black/5 px-4 py-3 text-center text-sm font-semibold uppercase tracking-[0.2em] text-black hover:bg-black hover:text-white transition-colors"
            >
              Preview Homepage
            </a>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-md lg:col-span-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/50">Recent Slides</p>
          <h2 className="mt-2 text-lg font-black uppercase tracking-[0.15em]">Latest Uploads</h2>

          {loading ? (
            <div className="mt-6 text-center text-sm text-black/50">Loading slides...</div>
          ) : carouselImages.length === 0 ? (
            <div className="mt-6 rounded-xl border-2 border-dashed border-black/15 bg-black/5 py-8 text-center text-sm text-black/50">
              No carousel slides yet. Create one to get started.
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {carouselImages.slice(0, 4).map((image) => (
                <div key={image.id} className="rounded-xl border border-black/10 bg-black/5 p-4 flex items-center justify-between hover:bg-black/10 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-black truncate">{image.title}</p>
                    <p className="text-xs text-black/50 mt-1">Order: {image.displayOrder}</p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <span
                      className={`text-xs font-semibold rounded-full px-3 py-1 ${
                        image.isActive
                          ? 'bg-[#007400]/20 text-[#007400]'
                          : 'bg-black/10 text-black/50'
                      }`}
                    >
                      {image.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <button
                      onClick={() => deleteImage(image.id)}
                      className="text-xs font-semibold px-3 py-1 rounded-full border border-red-300 text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* System Info */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-[#007400]/20 bg-[#007400]/5 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#007400]">System</p>
          <h3 className="mt-2 font-bold text-black">Backend Status</h3>
          <p className="mt-3 text-sm text-black/70">
            Flask API connected to MySQL{carouselImages.length > 0 ? ' - All systems operational ✓' : ' - Ready to upload'}
          </p>
        </div>

        <div className="rounded-2xl border border-black/10 bg-black text-white p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">Theme</p>
          <h3 className="mt-2 font-bold">Black • White • #007400</h3>
          <p className="mt-3 text-sm text-white/70">Professional monochrome design with eco-green accents</p>
        </div>
      </div>
    </div>
  )
}