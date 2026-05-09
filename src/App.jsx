import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './Auth/AuthContext'
import { CartProvider } from './Context/CartContext'
import { PublicLayout } from './Components/PublicLayout'
import { ProtectedRoute } from './Components/admin/ProtectedRoute'
import { AdminLayout } from './Components/admin/AdminLayout'
import AuronicChatbot from './Components/AuronicChatbot'
import { Home } from './Pages/Home'
import { About } from './Pages/About'
import { Products } from './Pages/Products'
import { ProductDetails } from './Pages/ProductDetails'
import { Blogs } from './Pages/Blogs'
import { BlogDetails } from './Pages/BlogDetails'
import { Orders } from './Pages/Orders'
import { Contact } from './Pages/Contact'
import { Login } from './Pages/Login'
import { NotFound } from './Pages/NotFound'
import { AdminLogin } from './Pages/Admin/AdminLogin'
import { AdminDashboard } from './Pages/Admin/AdminDashboard'
import { AdminCarouselImages } from './Pages/Admin/AdminCarouselImages'
import { AdminTrendingProducts } from './Pages/Admin/AdminTrendingProducts'
import { AdminProducts } from './Pages/Admin/AdminProducts'
import { AdminOrders } from './Pages/Admin/AdminOrders'
import { AdminBlogs } from './Pages/Admin/AdminBlogs'
import { AdminQueries } from './Pages/Admin/AdminQueries'

import { SplashScreen } from './Pages/Splash/Splash'

export const App = () => {
  const [loading, setLoading] = React.useState(true)

  return (
    <AuthProvider>
      <CartProvider>
        <Routes>
          <Route path='/' element={<PublicLayout />}>
            <Route index element={<Home />} />
            <Route path='about' element={<About />} />
            <Route path='products' element={<Products />} />
            <Route path='products/:id' element={<ProductDetails />} />
            <Route path='blogs' element={<Blogs />} />
            <Route path='blogs/:id' element={<BlogDetails />} />
            <Route path='orders' element={<Orders />} />
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
            <Route path='trending-products' element={<AdminTrendingProducts />} />
            <Route path='products' element={<AdminProducts />} />
            <Route path='blogs' element={<AdminBlogs />} />
            <Route path='queries' element={<AdminQueries />} />
            <Route path='orders' element={<AdminOrders />} />
          </Route>

          <Route path='*' element={<NotFound />} />
        </Routes>
        <AuronicChatbot />
      </CartProvider>
    </AuthProvider>
  )
}