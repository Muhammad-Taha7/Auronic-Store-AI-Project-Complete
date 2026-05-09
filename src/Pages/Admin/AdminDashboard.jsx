import React from 'react'
import { 
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, 
  BarElement, ArcElement, Tooltip, Legend, Filler 
} from 'chart.js'
import { Line, Doughnut } from 'react-chartjs-2' 
import { 
  TrendingUp, Package, FileText, ShoppingCart, 
  DollarSign, RefreshCw, CheckCircle, Clock, XCircle 
} from 'lucide-react'
import { API_BASE_URL } from '../../config/api'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend, Filler)

const currency = (value) => `Rs. ${Number(value || 0).toLocaleString()}`

// --- Components ---
const StatCard = ({ title, value, icon: Icon, color, detail }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
        <h2 className="text-2xl font-bold text-slate-900">{value}</h2>
        {detail && <p className="text-xs text-slate-400 mt-2">{detail}</p>}
      </div>
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon size={24} className="text-white" />
      </div>
    </div>
  </div>
)

export const AdminDashboard = () => {
  const [ordersAnalytics, setOrdersAnalytics] = React.useState({
    totalOrders: 0, completedOrders: 0, pendingOrders: 0, cancelledOrders: 0, totalRevenue: 0, monthlyRevenue: [],
  })
  const [productStats, setProductStats] = React.useState({ total: 0, trending: 0 })
  const [topProducts, setTopProducts] = React.useState([])
  const [blogStats, setBlogStats] = React.useState({ totalBlogs: 0 })
  const [loading, setLoading] = React.useState(true)

  // Heuristic scoring for trending / high-performing products
  const getProductHeuristicScore = (p) => {
    const sales = Number(p.salesCount ?? p.sold ?? p.totalSold ?? p.orderCount ?? 0)
    const rating = Number(p.rating ?? p.avgRating ?? p.ratingAverage ?? 0)
    const views = Number(p.views ?? p.viewCount ?? 0)
    const stock = Number(p.stock ?? p.quantity ?? p.qty ?? 0)

    // Recency: newer products get a small boost
    const createdAt = p.createdAt ?? p.created_at ?? p.dateAdded ?? null
    const createdTs = createdAt ? Date.parse(createdAt) : 0
    const daysSince = createdTs ? Math.max(1, (Date.now() - createdTs) / (1000 * 60 * 60 * 24)) : 3650
    const recencyScore = 1 / Math.log10(daysSince + 10) // smaller days => larger score

    // Normalize pieces (use logs where counts vary widely)
    const salesNorm = Math.log10(sales + 1) / 5 // small fraction
    const viewsNorm = Math.log10(views + 1) / 5
    const ratingNorm = Math.min(5, Math.max(0, rating)) / 5

    // Weighted sum (tuned for visibility in admin dashboard)
    let score = (salesNorm * 50) + (ratingNorm * 30) + (viewsNorm * 12) + (recencyScore * 8)

    // Trending flag gives a small multiplier
    if (p.isTrending) score *= 1.12

    // Out-of-stock penalty
    if (stock <= 0) score *= 0.7

    // Scale and return a rounded integer score
    return Math.round(score * 10)
  }

  // Simple bubble sort (descending by score). Kept intentionally readable
  const bubbleSortProducts = (arr) => {
    const a = Array.isArray(arr) ? [...arr] : []
    const n = a.length
    for (let i = 0; i < n - 1; i++) {
      let swapped = false
      for (let j = 0; j < n - 1 - i; j++) {
        if ((a[j].score ?? 0) < (a[j + 1].score ?? 0)) {
          const tmp = a[j]
          a[j] = a[j + 1]
          a[j + 1] = tmp
          swapped = true
        }
      }
      if (!swapped) break
    }
    return a
  }

  const loadDashboard = React.useCallback(async () => {
    setLoading(true)
    try {
      const [analyticsRes, productsRes, blogsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/orders/analytics`),
        fetch(`${API_BASE_URL}/api/products?active=1`),
        fetch(`${API_BASE_URL}/api/blogs`),
      ])
      const analyticsData = await analyticsRes.json()
      const productsData = await productsRes.json()
      const blogsData = blogsRes.ok ? await blogsRes.json() : []

      setOrdersAnalytics({
        totalOrders: Number(analyticsData.totalOrders || 0),
        completedOrders: Number(analyticsData.completedOrders || 0),
        pendingOrders: Number(analyticsData.pendingOrders || 0),
        cancelledOrders: Number(analyticsData.cancelledOrders || 0),
        totalRevenue: Number(analyticsData.totalRevenue || 0),
        monthlyRevenue: Array.isArray(analyticsData.monthlyRevenue) ? analyticsData.monthlyRevenue : [],
      })
      
      setProductStats({
        total: Array.isArray(productsData) ? productsData.length : 0,
        trending: Array.isArray(productsData) ? productsData.filter(i => i.isTrending).length : 0,
      })

      // Logic for top products (using your existing functions)
      if (Array.isArray(productsData)) {
        const scored = productsData.map(p => ({ ...p, score: getProductHeuristicScore(p) }))
        const sorted = bubbleSortProducts(scored)
        setTopProducts(sorted.slice(0, 5))
      }

      setBlogStats({ totalBlogs: Array.isArray(blogsData) ? blogsData.length : 0 })
    } catch (err) {
      console.error("Dashboard error:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => { loadDashboard() }, [loadDashboard])

  const revenueData = {
    labels: ordersAnalytics.monthlyRevenue.map(item => item.month),
    datasets: [
      {
        type: 'line',
        label: 'Revenue Trend',
        data: ordersAnalytics.monthlyRevenue.map(item => item.revenue),
        borderColor: '#6366f1',
        borderWidth: 3,
        tension: 0.4,
        fill: true,
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
      },
      {
        type: 'bar',
        label: 'Monthly Revenue',
        data: ordersAnalytics.monthlyRevenue.map(item => item.revenue),
        backgroundColor: '#e2e8f0',
        borderRadius: 6,
      }
    ],
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8 font-sans text-slate-900">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Executive Overview</h1>
          <p className="text-slate-500">Real-time store performance and analytics.</p>
        </div>
        <button 
          onClick={loadDashboard} 
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-indigo-200"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} /> 
          {loading ? 'Refreshing...' : 'Update Data'}
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard 
          title="Total Revenue" 
          value={currency(ordersAnalytics.totalRevenue)} 
          icon={DollarSign} 
          color="bg-emerald-500"
          detail="Life-time earnings"
        />
        <StatCard 
          title="Total Orders" 
          value={ordersAnalytics.totalOrders} 
          icon={ShoppingCart} 
          color="bg-blue-500"
          detail={`${ordersAnalytics.completedOrders} successful deliveries`}
        />
        <StatCard 
          title="Active Products" 
          value={productStats.total} 
          icon={Package} 
          color="bg-indigo-500"
          detail={`${productStats.trending} products trending`}
        />
        <StatCard 
          title="Blog Posts" 
          value={blogStats.totalBlogs} 
          icon={FileText} 
          color="bg-amber-500"
          detail="Content marketing items"
        />
      </div>

      {/* Main Charts Section */}
      <div className="grid gap-8 lg:grid-cols-3 mb-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold">Revenue Velocity</h3>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md uppercase">Monthly Trend</span>
          </div>
          <div className="h-[350px]">
            <Line data={revenueData} options={{ 
              responsive: true, 
              maintainAspectRatio: false,
              plugins: { legend: { position: 'bottom' } },
              scales: { y: { grid: { borderDash: [5, 5] } }, x: { grid: { display: false } } }
            }} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-xl font-bold mb-6">Order Breakdown</h3>
          <div className="h-[300px] flex items-center justify-center">
            <Doughnut 
              data={{
                labels: ['Pending', 'Completed', 'Cancelled'],
                datasets: [{
                  data: [ordersAnalytics.pendingOrders, ordersAnalytics.completedOrders, ordersAnalytics.cancelledOrders],
                  backgroundColor: ['#f59e0b', '#10b981', '#ef4444'],
                  hoverOffset: 15,
                  borderWidth: 0,
                }]
              }} 
              options={{ 
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom' } },
                cutout: '70%'
              }}
            />
          </div>
          <div className="mt-4 space-y-2">
             <div className="flex justify-between text-sm"><span className="text-slate-500 flex items-center gap-2"><Clock size={14}/> Pending</span> <span>{ordersAnalytics.pendingOrders}</span></div>
             <div className="flex justify-between text-sm"><span className="text-slate-500 flex items-center gap-2"><CheckCircle size={14}/> Completed</span> <span>{ordersAnalytics.completedOrders}</span></div>
             <div className="flex justify-between text-sm"><span className="text-slate-500 flex items-center gap-2"><XCircle size={14}/> Cancelled</span> <span>{ordersAnalytics.cancelledOrders}</span></div>
          </div>
        </div>
      </div>

      {/* Top Products Table-Style List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="text-xl font-bold">High Performing Products</h3>
          <div className="flex gap-2">
             <TrendingUp size={18} className="text-emerald-500"/>
             <span className="text-sm font-medium text-slate-500">Sorted by Performance Score</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-slate-400 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Product Details</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Rating</th>
                <th className="px-6 py-4">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {topProducts.map((product, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-slate-400">
                        #{idx + 1}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{product.title}</div>
                        {product.isTrending && <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold uppercase">Trending</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{product.category}</td>
                  <td className="px-6 py-4 font-semibold">{currency(product.price)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-amber-500">
                       ★ <span className="text-slate-900 font-medium">{product.rating}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg font-bold text-xs">
                      {product.score} pts
                    </span>
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