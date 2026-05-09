import React from 'react'

const users = [
  { id: 1, name: 'Laila Hassan', role: 'Manager', email: 'laila@storefront.com', status: 'Active', avatar: 'LH' },
  {
    id: 2,
    name: 'Omar Khaled',
    role: 'Support Lead',
    email: 'omar@storefront.com',
    status: 'Active',
    avatar: 'OK',
  },
  { id: 3, name: 'Mona Karim', role: 'Inventory', email: 'mona@storefront.com', status: 'Active', avatar: 'MK' },
  { id: 4, name: 'Rana Ahmed', role: 'Support', email: 'rana@storefront.com', status: 'Inactive', avatar: 'RA' },
]

export const AdminUsers = () => {
  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
        <div>
          <h2 className='text-2xl font-bold text-white'>User Management</h2>
          <p className='text-sm text-slate-400 mt-1'>{users.filter((u) => u.status === 'Active').length} active users</p>
        </div>
        <button className='rounded-lg bg-linear-to-r from-blue-600 to-blue-700 px-4 py-2 text-sm font-semibold text-white hover:from-blue-700 hover:to-blue-800 transition-all'>
          + Add User
        </button>
      </div>

      {/* Users Grid */}
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        {users.map((user) => (
          <div
            key={user.id}
            className='rounded-xl border border-slate-700/50 bg-slate-800/40 backdrop-blur p-6 hover:shadow-lg transition-all'
          >
            <div className='flex items-start justify-between mb-4'>
              <div className='flex items-center gap-3'>
                <div className='h-12 w-12 rounded-full bg-linear-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-bold text-sm'>
                  {user.avatar}
                </div>
                <div>
                  <p className='font-semibold text-white'>{user.name}</p>
                  <p className='text-xs text-slate-400 mt-0.5'>{user.role}</p>
                </div>
              </div>
              <span
                className={`text-xs font-semibold px-2 py-1 rounded-full ${
                  user.status === 'Active'
                    ? 'bg-green-500/10 text-green-300 border border-green-500/30'
                    : 'bg-slate-700/50 text-slate-400 border border-slate-600/30'
                }`}
              >
                {user.status}
              </span>
            </div>

            <div className='mb-4 pt-4 border-t border-slate-700/50'>
              <p className='text-xs text-slate-400'>Email</p>
              <p className='text-sm text-white font-medium truncate'>{user.email}</p>
            </div>

            <div className='flex gap-2'>
              <button className='flex-1 rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-700 transition-colors'>
                Edit
              </button>
              <button className='flex-1 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-300 hover:bg-red-500/20 transition-colors'>
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Statistics */}
      <div className='grid gap-4 sm:grid-cols-3'>
        <div className='rounded-lg border border-slate-700/50 bg-slate-800/40 backdrop-blur p-6'>
          <p className='text-sm text-slate-400 font-medium'>Total Users</p>
          <p className='mt-2 text-3xl font-bold text-white'>{users.length}</p>
        </div>
        <div className='rounded-lg border border-green-500/30 bg-green-500/10 backdrop-blur p-6'>
          <p className='text-sm text-green-300 font-medium'>Active</p>
          <p className='mt-2 text-3xl font-bold text-green-300'>{users.filter((u) => u.status === 'Active').length}</p>
        </div>
        <div className='rounded-lg border border-slate-700/50 bg-slate-800/40 backdrop-blur p-6'>
          <p className='text-sm text-slate-400 font-medium'>Inactive</p>
          <p className='mt-2 text-3xl font-bold text-white'>{users.filter((u) => u.status === 'Inactive').length}</p>
        </div>
      </div>
    </div>
  )
}
