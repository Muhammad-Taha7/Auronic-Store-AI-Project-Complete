import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './Auth/AuthContext'
import { PublicLayout } from './Components/PublicLayout'
import { ProtectedRoute } from './Components/admin/ProtectedRoute'
import { AdminLayout } from './Components/admin/AdminLayout'
import { Home } from './Pages/Home'
import { About } from './Pages/About'
import { Products } from './Pages/Products'
import { Contact } from './Pages/Contact'
import { Login } from './Pages/Login'
import { NotFound } from './Pages/NotFound'
import { AdminLogin } from './Pages/Admin/AdminLogin'
import { AdminDashboard } from './Pages/Admin/AdminDashboard'
import { AdminCarouselImages } from './Pages/Admin/AdminCarouselImages'

export const App = () => {
  return (
    <AuthProvider>
      <Routes>
        <Route path='/' element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path='about' element={<About />} />
          <Route path='products' element={<Products />} />
          <Route path='contact' element={<Contact />} />
        </Route>

        <Route path='/login' element={<Login />} />

        <Route path='/admin/login' element={<AdminLogin />} />

        <Route
          path='/admin'
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to='dashboard' replace />} />
          <Route path='dashboard' element={<AdminDashboard />} />
          <Route path='carousel-images' element={<AdminCarouselImages />} />
        </Route>

        <Route path='*' element={<NotFound />} />
      </Routes>
    </AuthProvider>
  )
}
