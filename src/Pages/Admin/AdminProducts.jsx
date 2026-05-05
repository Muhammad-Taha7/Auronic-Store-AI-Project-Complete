import React, { useState } from 'react'

const products = [
  { id: 1, name: 'Premium Headphones', sku: 'PH-0091', stock: 48, price: '$199', status: 'Active' },
  { id: 2, name: 'Mechanical Keyboard', sku: 'MK-1020', stock: 75, price: '$149', status: 'Active' },
  { id: 3, name: '4K Monitor', sku: 'MN-4011', stock: 29, price: '$499', status: 'Active' },
  { id: 4, name: 'Wireless Mouse', sku: 'WM-0502', stock: 0, price: '$79', status: 'Out of Stock' },
  { id: 5, name: 'USB-C Cable', sku: 'UC-3001', stock: 150, price: '$25', status: 'Active' },
]

export const AdminProducts = () => {
  const [sortBy, setSortBy] = useState('name')

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
        <div>
          <h2 className='text-2xl font-bold text-white'>Product Management</h2>
          <p className='text-sm text-slate-400 mt-1'>{products.length} products total</p>
        </div>
        <button className='rounded-lg bg-linear-to-r from-blue-600 to-blue-700 px-4 py-2 text-sm font-semibold text-white hover:from-blue-700 hover:to-blue-800 transition-all'>
          + Add Product
        </button>
      </div>

      {/* Search & Filter */}
      <div className='flex flex-col sm:flex-row gap-4'>
        <input
          type='text'
          placeholder='Search products...'
          className='flex-1 rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className='rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500'
        >
          <option value='name'>Sort by Name</option>
          <option value='stock'>Sort by Stock</option>
          <option value='price'>Sort by Price</option>
        </select>
      </div>

      {/* Table */}
      <div className='rounded-xl border border-slate-700/50 bg-slate-800/40 backdrop-blur overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead className='border-b border-slate-700/50 bg-slate-800/50'>
              <tr>
                <th className='px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider'>
                  Product
                </th>
                <th className='px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider'>
                  SKU
                </th>
                <th className='px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider'>
                  Price
                </th>
                <th className='px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider'>
                  Stock
                </th>
                <th className='px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider'>
                  Status
                </th>
                <th className='px-6 py-4 text-right text-xs font-semibold text-slate-300 uppercase tracking-wider'>
                  Action
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-slate-700/50'>
              {products.map((product) => (
                <tr key={product.id} className='hover:bg-slate-800/50 transition-colors'>
                  <td className='px-6 py-4 text-sm font-medium text-white'>{product.name}</td>
                  <td className='px-6 py-4 text-sm text-slate-400'>{product.sku}</td>
                  <td className='px-6 py-4 text-sm font-semibold text-white'>{product.price}</td>
                  <td className='px-6 py-4 text-sm text-slate-400'>{product.stock}</td>
                  <td className='px-6 py-4 text-sm'>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${
                        product.status === 'Active'
                          ? 'bg-green-500/10 text-green-300 border-green-500/30'
                          : 'bg-red-500/10 text-red-300 border-red-500/30'
                      }`}
                    >
                      {product.status}
                    </span>
                  </td>
                  <td className='px-6 py-4 text-right'>
                    <button className='text-blue-400 hover:text-blue-300 transition-colors text-sm font-medium'>
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
