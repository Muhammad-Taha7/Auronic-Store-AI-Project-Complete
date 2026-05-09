import React from 'react'
import { API_BASE_URL } from '../../config/api'
import { 
  Search, 
  Filter, 
  Download, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  MoreHorizontal, 
  Mail, 
  Phone,
  Package,
  TrendingUp,
  RefreshCw
} from 'lucide-react'

const statusOptions = ['pending', 'completed', 'cancelled']

const statusBadgeConfig = {
  pending: {
    bg: 'bg-amber-50 text-amber-700 ring-amber-600/20',
    icon: <Clock size={12} className="mr-1.5" />,
    label: 'Pending'
  },
  completed: {
    bg: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    icon: <CheckCircle2 size={12} className="mr-1.5" />,
    label: 'Completed'
  },
  cancelled: {
    bg: 'bg-rose-50 text-rose-700 ring-rose-600/20',
    icon: <XCircle size={12} className="mr-1.5" />,
    label: 'Cancelled'
  }
}

export const AdminOrders = () => {
  const [orders, setOrders] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')
  const [filterStatus, setFilterStatus] = React.useState('all')
  const [searchTerm, setSearchTerm] = React.useState('')
  const [updatingId, setUpdatingId] = React.useState(null)
  const [itemsPerPage, setItemsPerPage] = React.useState(10)
  const [currentPage, setCurrentPage] = React.useState(1)

  const loadOrders = React.useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams()
      if (filterStatus !== 'all') params.set('status', filterStatus)
      const query = params.toString() ? `?${params.toString()}` : ''
      const response = await fetch(`${API_BASE_URL}/api/orders${query}`)
      if (!response.ok) throw new Error('Unable to load orders right now.')
      const data = await response.json()
      setOrders(Array.isArray(data) ? data : [])
      setCurrentPage(1)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [filterStatus])

  React.useEffect(() => { loadOrders() }, [loadOrders])

  const updateStatus = async (orderId, nextStatus) => {
    setUpdatingId(orderId)
    setError('')
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Unable to update status.')
      setOrders((current) =>
        current.map((order) => (order.id === orderId ? { ...order, status: nextStatus } : order))
      )
    } catch (err) {
      setError(err.message)
    } finally {
      setUpdatingId(null)
    }
  }

  const downloadOrder = async (orderId, orderNumber) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}/download`)
      if (!response.ok) throw new Error('Download failed.')
      const content = await response.text()
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
      const url = window.URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `${orderNumber || `order-${orderId}`}.txt`
      document.body.appendChild(anchor)
      anchor.click()
      document.body.removeChild(anchor)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      setError(err.message)
    }
  }

  const filteredOrders = React.useMemo(() => {
    if (!searchTerm.trim()) return orders
    const term = searchTerm.toLowerCase()
    return orders.filter(order => 
      order.orderNumber?.toLowerCase().includes(term) ||
      order.customerName?.toLowerCase().includes(term) ||
      order.customerEmail?.toLowerCase().includes(term) ||
      order.id?.toString().includes(term)
    )
  }, [orders, searchTerm])

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage)
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const formatCurrency = (value) => `Rs. ${Number(value || 0).toLocaleString()}`
  const formatDate = (date) => new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

  return (
    <div className="max-w-[2000px] mx-auto space-y-8 pb-12 text-slate-900">
      
      {/* Header & Stats Overview */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900">ORDER LOGISTICS</h2>
          <p className="text-slate-500 text-sm mt-1">Real-time order processing and historical data management.</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Sales</p>
            <p className="text-xl font-bold mt-1">{formatCurrency(orders.reduce((s, o) => s + (o.total || 0), 0))}</p>
          </div>
          <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Orders</p>
            <p className="text-xl font-bold mt-1 text-amber-600">{orders.filter(o => o.status === 'pending').length}</p>
          </div>
          <div className="hidden md:block bg-slate-900 text-white border border-slate-900 p-4 rounded-2xl shadow-lg shadow-slate-200">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Completion Rate</p>
            <p className="text-xl font-bold mt-1">{Math.round((orders.filter(o => o.status === 'completed').length / (orders.length || 1)) * 100)}%</p>
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-white p-4 rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/40 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-xl">
            {['all', ...statusOptions].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-5 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
                  filterStatus === status ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="flex gap-3 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, email or order #..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none"
              />
            </div>
            <button onClick={loadOrders} className="p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors">
              <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-700 px-6 py-4 rounded-2xl flex items-center gap-3 animate-in fade-in zoom-in-95">
          <XCircle size={18} />
          <span className="text-sm font-bold tracking-wide">{error}</span>
        </div>
      )}

      {/* Table Section */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-slate-200/50 overflow-hidden">
        {loading ? (
          <div className="py-32 text-center">
            <div className="inline-block w-10 h-10 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Synchronizing Records...</p>
          </div>
        ) : paginatedOrders.length === 0 ? (
          <div className="py-32 text-center">
            <Package size={48} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">No Orders Found</p>
            <p className="text-slate-400 text-xs mt-1">Adjust your filters or try a different search term.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Transaction</th>
                  <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Customer Identity</th>
                  <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Order Date</th>
                  <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Cart Detail</th>
                  <th className="px-6 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Total Amount</th>
                  <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Current Status</th>
                  <th className="px-6 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedOrders.map((order) => {
                  const status = statusBadgeConfig[order.status] || statusBadgeConfig.pending;
                  return (
                    <tr key={order.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-5">
                        <span className="font-mono text-[11px] font-black bg-slate-100 px-2 py-1 rounded text-slate-600">
                          #{order.orderNumber || order.id}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800 text-sm">{order.customerName}</span>
                          <div className="flex items-center gap-3 mt-1 text-slate-400">
                            <span className="flex items-center gap-1 text-[11px]"><Mail size={12}/> {order.customerEmail}</span>
                            <span className="flex items-center gap-1 text-[11px]"><Phone size={12}/> {order.customerPhone}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-slate-500 text-sm">{formatDate(order.createdAt)}</span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="max-w-[200px]">
                          <p className="text-slate-600 text-[13px] font-medium line-clamp-1">
                            {order.items?.[0]?.title} {order.items?.length > 1 ? `+${order.items.length - 1} more` : ''}
                          </p>
                          <p className="text-[11px] text-slate-400 uppercase tracking-tighter">Qty: {order.items?.reduce((a,b) => a + b.quantity, 0)} items</p>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <span className="text-sm font-black text-slate-900">{formatCurrency(order.total)}</span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-tighter ring-1 ring-inset ${status.bg}`}>
                            {status.icon}
                            {status.label}
                          </div>
                          <select
                            value={order.status}
                            onChange={(e) => updateStatus(order.id, e.target.value)}
                            disabled={updatingId === order.id}
                            className="opacity-0 group-hover:opacity-100 transition-opacity bg-transparent text-[11px] font-bold text-indigo-600 underline cursor-pointer outline-none"
                          >
                            {statusOptions.map((opt) => (
                              <option key={opt} value={opt}>{opt.toUpperCase()}</option>
                            ))}
                          </select>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex justify-center">
                          <button
                            onClick={() => downloadOrder(order.id, order.orderNumber)}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                            title="Download Manifest"
                          >
                            <Download size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Improved Pagination */}
        {!loading && filteredOrders.length > 0 && (
          <div className="px-8 py-6 bg-slate-50 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Show</span>
              <select
                value={itemsPerPage}
                onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold focus:outline-none"
              >
                {[10, 20, 50].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-xl border border-slate-200 bg-white disabled:opacity-30 hover:bg-indigo-50 transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              
              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-9 h-9 rounded-xl text-xs font-black transition-all ${
                      currentPage === page ? 'bg-slate-900 text-white shadow-lg' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-xl border border-slate-200 bg-white disabled:opacity-30 hover:bg-indigo-50 transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}