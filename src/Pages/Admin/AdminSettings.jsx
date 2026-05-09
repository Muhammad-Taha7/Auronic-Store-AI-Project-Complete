import React, { useState } from 'react'

const settingsSections = [
  {
    title: 'Store Information',
    icon: '🏪',
    settings: [
      { label: 'Store Name', value: 'StoreFront' },
      { label: 'Email', value: 'admin@storefront.com' },
      { label: 'Phone', value: '+1 (555) 210-9000' },
      { label: 'Address', value: '123 Business St, City, Country' },
    ],
  },
  {
    title: 'Payment Settings',
    icon: '💳',
    settings: [
      { label: 'Currency', value: 'USD' },
      { label: 'Payment Gateway', value: 'Stripe' },
      { label: 'Tax Rate', value: '10%' },
      { label: 'Shipping Cost', value: 'Free above $100' },
    ],
  },
  {
    title: 'Security',
    icon: '🔒',
    settings: [
      { label: 'Two-Factor Auth', value: 'Enabled' },
      { label: 'Session Timeout', value: '30 minutes' },
      { label: 'Login Attempts', value: '5 max attempts' },
      { label: 'Password Policy', value: 'Strong' },
    ],
  },
  {
    title: 'Notifications',
    icon: '🔔',
    settings: [
      { label: 'Email Notifications', value: 'On', toggle: true },
      { label: 'SMS Alerts', value: 'Off', toggle: true },
      { label: 'Order Updates', value: 'On', toggle: true },
      { label: 'Admin Alerts', value: 'On', toggle: true },
    ],
  },
]

export const AdminSettings = () => {
  const [toggles, setToggles] = useState({
    emailNotifications: true,
    smsAlerts: false,
    orderUpdates: true,
    adminAlerts: true,
  })

  const handleToggle = (key) => {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div>
        <h2 className='text-2xl font-bold text-white'>Settings</h2>
        <p className='text-sm text-slate-400 mt-1'>Manage your store configuration and preferences</p>
      </div>

      {/* Settings Sections */}
      <div className='grid gap-6 lg:grid-cols-2'>
        {/* Store Information */}
        <div className='rounded-xl border border-slate-700/50 bg-slate-800/40 backdrop-blur p-6'>
          <div className='flex items-center gap-3 mb-6'>
            <span className='text-3xl'>🏪</span>
            <h3 className='text-lg font-bold text-white'>Store Information</h3>
          </div>
          <div className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-slate-300 mb-2'>Store Name</label>
              <input
                type='text'
                defaultValue='StoreFront'
                className='w-full rounded-lg border border-slate-700 bg-slate-700/50 px-4 py-2 text-white focus:outline-none focus:border-blue-500'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-slate-300 mb-2'>Email</label>
              <input
                type='email'
                defaultValue='admin@storefront.com'
                className='w-full rounded-lg border border-slate-700 bg-slate-700/50 px-4 py-2 text-white focus:outline-none focus:border-blue-500'
              />
            </div>
            <button className='w-full rounded-lg bg-linear-to-r from-blue-600 to-blue-700 px-4 py-2 text-sm font-semibold text-white hover:from-blue-700 hover:to-blue-800 transition-all'>
              Save Changes
            </button>
          </div>
        </div>

        {/* Payment Settings */}
        <div className='rounded-xl border border-slate-700/50 bg-slate-800/40 backdrop-blur p-6'>
          <div className='flex items-center gap-3 mb-6'>
            <span className='text-3xl'>💳</span>
            <h3 className='text-lg font-bold text-white'>Payment Settings</h3>
          </div>
          <div className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-slate-300 mb-2'>Currency</label>
              <select className='w-full rounded-lg border border-slate-700 bg-slate-700/50 px-4 py-2 text-white focus:outline-none focus:border-blue-500'>
                <option>USD</option>
                <option>EUR</option>
                <option>GBP</option>
                <option>PKR</option>
              </select>
            </div>
            <div>
              <label className='block text-sm font-medium text-slate-300 mb-2'>Tax Rate (%)</label>
              <input
                type='number'
                defaultValue='10'
                className='w-full rounded-lg border border-slate-700 bg-slate-700/50 px-4 py-2 text-white focus:outline-none focus:border-blue-500'
              />
            </div>
            <button className='w-full rounded-lg bg-linear-to-r from-blue-600 to-blue-700 px-4 py-2 text-sm font-semibold text-white hover:from-blue-700 hover:to-blue-800 transition-all'>
              Save Changes
            </button>
          </div>
        </div>

        {/* Security Settings */}
        <div className='rounded-xl border border-slate-700/50 bg-slate-800/40 backdrop-blur p-6'>
          <div className='flex items-center gap-3 mb-6'>
            <span className='text-3xl'>🔒</span>
            <h3 className='text-lg font-bold text-white'>Security</h3>
          </div>
          <div className='space-y-3'>
            <div className='flex items-center justify-between p-3 rounded-lg bg-slate-700/20 border border-slate-700/50'>
              <div>
                <p className='text-sm font-medium text-white'>Two-Factor Authentication</p>
                <p className='text-xs text-slate-400 mt-0.5'>Add extra layer of security</p>
              </div>
              <label className='relative inline-block h-8 w-14'>
                <input type='checkbox' className='sr-only' checked />
                <span className='absolute inset-0 cursor-pointer rounded-full bg-green-500 transition-all'></span>
              </label>
            </div>
            <div className='flex items-center justify-between p-3 rounded-lg bg-slate-700/20 border border-slate-700/50'>
              <div>
                <p className='text-sm font-medium text-white'>Login Alerts</p>
                <p className='text-xs text-slate-400 mt-0.5'>Notify on unusual activity</p>
              </div>
              <label className='relative inline-block h-8 w-14'>
                <input type='checkbox' className='sr-only' checked />
                <span className='absolute inset-0 cursor-pointer rounded-full bg-green-500 transition-all'></span>
              </label>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className='rounded-xl border border-slate-700/50 bg-slate-800/40 backdrop-blur p-6'>
          <div className='flex items-center gap-3 mb-6'>
            <span className='text-3xl'>🔔</span>
            <h3 className='text-lg font-bold text-white'>Notifications</h3>
          </div>
          <div className='space-y-3'>
            <div className='flex items-center justify-between p-3 rounded-lg bg-slate-700/20 border border-slate-700/50'>
              <p className='text-sm font-medium text-white'>Email Notifications</p>
              <label
                className='relative inline-block h-8 w-14 cursor-pointer'
                onClick={() => handleToggle('emailNotifications')}
              >
                <input type='checkbox' className='sr-only' checked={toggles.emailNotifications} readOnly />
                <span
                  className={`absolute inset-0 rounded-full transition-all ${
                    toggles.emailNotifications ? 'bg-green-500' : 'bg-slate-600'
                  }`}
                ></span>
              </label>
            </div>
            <div className='flex items-center justify-between p-3 rounded-lg bg-slate-700/20 border border-slate-700/50'>
              <p className='text-sm font-medium text-white'>Order Updates</p>
              <label
                className='relative inline-block h-8 w-14 cursor-pointer'
                onClick={() => handleToggle('orderUpdates')}
              >
                <input type='checkbox' className='sr-only' checked={toggles.orderUpdates} readOnly />
                <span
                  className={`absolute inset-0 rounded-full transition-all ${
                    toggles.orderUpdates ? 'bg-green-500' : 'bg-slate-600'
                  }`}
                ></span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className='rounded-xl border border-red-500/30 bg-red-500/10 backdrop-blur p-6'>
        <h3 className='text-lg font-bold text-red-300 mb-4'>Danger Zone</h3>
        <p className='text-sm text-slate-300 mb-4'>
          These actions are irreversible. Please proceed with caution.
        </p>
        <button className='rounded-lg border border-red-500/30 bg-red-500/20 hover:bg-red-500/30 px-4 py-2 text-sm font-semibold text-red-300 transition-colors'>
          Reset All Data
        </button>
      </div>
    </div>
  )
}
