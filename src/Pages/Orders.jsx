import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../Auth/AuthContext'
import { API_BASE_URL } from '../config/api'

const statusStyles = {
  pending: 'bg-amber-100 text-amber-800 border-amber-200',
  completed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  cancelled: 'bg-rose-100 text-rose-800 border-rose-200',
}

const paymentMethodLabels = {
  COD: 'Cash On Delivery',
  CARD: 'Card / Online Card',
  BANK_TRANSFER: 'Pakistani Bank Transfer',
  JAZZCASH: 'JazzCash',
  EASYPAISA: 'Easypaisa',
}

const formatPaymentMethod = (value) => paymentMethodLabels[value] || value

export const Orders = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')
  const [selectedOrder, setSelectedOrder] = React.useState(null)
  const [clearing, setClearing] = React.useState(false)

  React.useEffect(() => {
    const loadOrders = async () => {
      if (!user?.email) {
        setLoading(false)
        return
      }

      try {
        const params = new URLSearchParams({
          userEmail: user.email,
        })
        if (user.uid) {
          params.set('userUid', user.uid)
        }

        const response = await fetch(`${API_BASE_URL}/api/orders?${params.toString()}`)
        if (!response.ok) {
          throw new Error('Unable to load your orders right now.')
        }
        const data = await response.json()
        setOrders(Array.isArray(data) ? data : [])
      } catch (err) {
        setError(err.message || 'Unable to load your orders right now.')
      } finally {
        setLoading(false)
      }
    }

    loadOrders()
  }, [user])

  if (!user) {
    return (
      <main className="bg-white px-4 py-12 text-black sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl rounded-4xl border border-black/10 bg-black px-8 py-20 text-center text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/50">Orders</p>
          <h1 className="mt-4 text-3xl font-black uppercase tracking-[0.16em]">Login Required</h1>
          <p className="mt-4 text-sm text-white/70">Please login to view your order history and status updates.</p>
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="mt-8 rounded-full border border-white/25 px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-white hover:text-black"
          >
            Go To Login
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="bg-white px-4 py-10 text-black sm:px-6 lg:px-8 lg:py-12">
      <section className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-black/45">Orders</p>
            <h1 className="mt-3 text-4xl font-black uppercase tracking-[0.18em]">Your Order History</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-black/60">
              Track all your previous purchases with live status updates including pending, completed, and cancelled orders.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="rounded-4xl border border-black/10 bg-black px-8 py-16 text-center text-white">
            <p className="text-sm uppercase tracking-[0.35em] text-white/50">Loading your orders...</p>
          </div>
        ) : error ? (
          <div className="rounded-4xl border border-black/10 bg-black px-8 py-16 text-center text-white">
            <p className="text-sm uppercase tracking-[0.35em] text-white/50">Error</p>
            <h2 className="mt-4 text-2xl font-bold">{error}</h2>
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-4xl border border-black/10 bg-black px-8 py-16 text-center text-white">
            <p className="text-sm uppercase tracking-[0.35em] text-white/50">No orders yet</p>
            <h2 className="mt-4 text-2xl font-bold">You have not placed any order yet.</h2>
            <button
              type="button"
              onClick={() => navigate('/products')}
              className="mt-6 rounded-full border border-white/25 px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-white hover:text-black"
            >
              Shop Products
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-black/10">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/10 bg-black/5">
                  <th className="px-6 py-4 text-left font-bold uppercase tracking-[0.2em] text-black/70">Order #</th>
                  <th className="px-6 py-4 text-left font-bold uppercase tracking-[0.2em] text-black/70">Date</th>
                  <th className="px-6 py-4 text-left font-bold uppercase tracking-[0.2em] text-black/70">Amount</th>
                  <th className="px-6 py-4 text-left font-bold uppercase tracking-[0.2em] text-black/70">Items</th>
                  <th className="px-6 py-4 text-left font-bold uppercase tracking-[0.2em] text-black/70">Status</th>
                  <th className="px-6 py-4 text-center font-bold uppercase tracking-[0.2em] text-black/70">Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-black/10 hover:bg-black/3 transition">
                    <td className="px-6 py-4 font-semibold text-black">{order.orderNumber}</td>
                    <td className="px-6 py-4 text-black/70">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-semibold text-black">Rs. {Number(order.total || 0).toLocaleString()}</td>
                    <td className="px-6 py-4 text-black/70">{(order.items || []).length} item(s)</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] ${statusStyles[order.status] || 'bg-slate-100 text-slate-700 border-slate-200'}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        type="button"
                        onClick={() => setSelectedOrder(order)}
                        className="rounded-full border border-black px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-black transition hover:bg-black hover:text-white"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {selectedOrder ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-3xl rounded-3xl border border-black/10 bg-white p-6 shadow-[0_25px_80px_rgba(0,0,0,0.35)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-black/45">Order Details</p>
                <h2 className="mt-2 text-2xl font-black uppercase tracking-[0.12em] text-black">{selectedOrder.orderNumber}</h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="rounded-lg border border-black/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-black transition hover:bg-black/5"
              >
                Close
              </button>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-black/10 bg-black/5 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-black/45">Shipping</p>
                <p className="mt-2 text-sm font-semibold text-black">{selectedOrder.customerName}</p>
                <p className="text-sm text-black/70">{selectedOrder.customerEmail}</p>
                <p className="text-sm text-black/70">{selectedOrder.customerPhone}</p>
                <p className="mt-2 text-sm text-black/70">{selectedOrder.shippingAddress}</p>
                <p className="text-sm text-black/70">{selectedOrder.city}</p>
              </div>

              <div className="rounded-2xl border border-black/10 bg-black/5 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-black/45">Summary</p>
                <p className="mt-2 text-sm text-black/70">Status: {selectedOrder.status}</p>
                <p className="text-sm text-black/70">Payment: {formatPaymentMethod(selectedOrder.paymentMethod)}</p>
                <p className="text-sm text-black/70">Subtotal: Rs. {Number(selectedOrder.subtotal || 0).toLocaleString()}</p>
                <p className="text-sm text-black/70">Shipping: Rs. {Number(selectedOrder.shippingFee || 0).toLocaleString()}</p>
                <p className="mt-2 text-sm font-bold text-black">Total: Rs. {Number(selectedOrder.total || 0).toLocaleString()}</p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-black/10 bg-black/5 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-black/45">Items</p>
              <div className="mt-2 space-y-2">
                {(selectedOrder.items || []).map((item, idx) => (
                  <div key={`${selectedOrder.id}-${idx}`} className="flex items-center justify-between gap-3 rounded-xl border border-black/10 bg-white px-3 py-2 text-sm">
                    <div>
                      <p className="font-semibold text-black">{item.title}</p>
                      <p className="text-xs text-black/60">Qty: {item.quantity} | Color: {item.selectedColor || 'N/A'} | Warranty: {item.selectedWarranty || 'N/A'}</p>
                    </div>
                    <p className="font-semibold text-black">Rs. {Number(item.price || 0).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  )
}
