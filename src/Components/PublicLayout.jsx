import React from 'react'
import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'

export const PublicLayout = () => {
  return (
    <div className='min-h-screen bg-slate-50 text-slate-900'>
      <Navbar />
      
        <Outlet />
      
    
    </div>
  )
}
