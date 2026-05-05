import React, { useState } from 'react'

const orders = [
  {
    id: '#10031',
    customer: 'Amir Khan',
    total: '$290',
    status: 'Shipped',
    date: '2024-05-03',
    statusColor: 'bg-blue-500/10 text-blue-300 border-blue-500/30',
  },
  {
    id: '#10032',
    customer: 'Sara Nabil',
    total: '$150',
    status: 'Processing',
    date: '2024-05-03',
    statusColor: 'bg-yellow-500/10 text-yellow-300 border-yellow-500/30',
  },
  {
    id: '#10033',
    customer: 'Nora Adel',
    total: '$88',
    status: 'Delivered',
    date: '2024-05-02',
    statusColor: 'bg-green-500/10 text-green-300 border-green-500/30',
  },
  {
    id: '#10034',
    customer: 'Karim Hassan',
    total: '$450',
    status: 'Pending',
    date: '2024-05-01',
    statusColor: 'bg-orange-500/10 text-orange-300 border-orange-500/30',
  },
]

export const AdminOrders = () => {
  const [filterStatus, setFilterStatus] = useState('all')

  const filteredOrders =
    filterStatus === 'all' ? orders : orders.filter((order) => order.status.toLowerCase() === filterStatus)

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div>
        <h2 className='text-2xl font-bold text-white'>Order Tracking</h2>
        <p className='text-sm text-slate-400 mt-1'>{filteredOrders.length} orders</p>
      </div>

      {/* Filter Tabs */}
      <div className='flex flex-wrap gap-2'>
        {['all', 'pending', 'processing', 'shipped', 'delivered'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              filterStatus === status
                ? 'bg-linear-to-r from-blue-600 to-blue-700 text-white'
                : 'border border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className='space-y-3'>
        {filteredOrders.map((order) => (
          <div
            key={order.id}
            className='rounded-lg border border-slate-700/50 bg-slate-800/40 backdrop-blur p-6 hover:shadow-lg transition-all'
          >
            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
              <div className='flex-1 min-w-0'>
                <div className='flex items-center gap-3 mb-2'>
                  <p className='font-bold text-white text-lg'>{order.id}</p>
                  <span className={`text-xs font-semibold border rounded-full px-2.5 py-0.5 ${order.statusColor}`}>
                    {order.status}
                  </span>
                </div>
                <div className='flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-slate-400'>
                  <p>
                    <span className='font-medium'>Customer:</span> {order.customer}
                  </p>
                  <span className='hidden sm:inline'>•</span>
                  <p>
                    <span className='font-medium'>Date:</span> {order.date}
                  </p>
                </div>
              </div>
              <div className='flex items-center justify-between sm:flex-col sm:items-end gap-4'>
                <p className='font-bold text-white text-xl'>{order.total}</p>
                <button className='rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-1 text-xs font-medium text-slate-300 hover:bg-slate-700 transition-colors'>
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
