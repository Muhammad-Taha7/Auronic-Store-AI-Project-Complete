import React from 'react'
import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'
import { PageTransitionProvider } from '../Transition/Transition.jsx'
import { Footer } from './Footer.jsx'

export const PublicLayout = () => {
  return (
    <PageTransitionProvider>
      <div className='min-h-screen bg-slate-50 text-slate-900'>
        <Navbar />
        
          <Outlet />
        <Footer />
      
      </div>
    </PageTransitionProvider>
  )
}
