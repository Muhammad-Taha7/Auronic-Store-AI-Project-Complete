import { useState, useCallback, useEffect } from 'react'
import { API_BASE_URL } from '../../config/api'
import { 
  Mail, Trash2, RefreshCw,
  ExternalLink, Search, Eye, X, MessageSquare, ChevronDown
} from 'lucide-react'

export const AdminQueries = () => {
  const [queries, setQueries] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedQuery, setSelectedQuery] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/api/contacts`)
      if (!res.ok) throw new Error('Failed to load queries')
      const data = await res.json()
      setQueries(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Load error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const initialLoadId = window.setTimeout(() => {
      load()
    }, 0)
    return () => clearTimeout(initialLoadId)
  }, [load])

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/contacts/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead: newStatus === 'cleared' })
      })
      if (!res.ok) throw new Error('Status update failed')
      
      setQueries(queries.map(q => 
        q.id === id ? { ...q, isRead: newStatus === 'cleared' } : q
      ))
    } catch (err) {
      alert("Status update failed: " + err.message)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure?')) return
    try {
      const res = await fetch(`${API_BASE_URL}/api/contacts/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      setQueries((q) => q.filter((item) => item.id !== id))
      setSelectedQuery(null)
    } catch (err) {
      alert(err.message)
    }
  }

  const filteredQueries = queries.filter(q => 
    q.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const pendingCount = filteredQueries.filter(q => !q.isRead).length
  const clearedCount = filteredQueries.filter(q => q.isRead).length

  return (
    <div className="p-6 bg-slate-50 min-h-screen font-sans">
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <MessageSquare className="text-blue-600" /> INBOUND QUERIES
          </h1>
          <p className="text-slate-500 text-sm mt-1">Manage statuses and respond to user inquiries.</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
              <p className="text-[10px] uppercase font-black tracking-wider text-amber-600">Pending</p>
              <p className="text-2xl font-black text-amber-700">{pendingCount}</p>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
              <p className="text-[10px] uppercase font-black tracking-wider text-emerald-600">Cleared</p>
              <p className="text-2xl font-black text-emerald-700">{clearedCount}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-sm"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button onClick={load} className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 text-slate-600 transition-all shadow-sm">
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Sender Info</th>
                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Subject</th>
                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Status Selection</th>
                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                [1, 2, 3].map((i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="4" className="p-8 bg-slate-50/30" />
                  </tr>
                ))
              ) : filteredQueries.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-12 text-center">
                    <Mail className="mx-auto text-slate-300 mb-3" size={40} />
                    <p className="text-slate-500 font-medium">No queries found</p>
                  </td>
                </tr>
              ) : filteredQueries.map((q) => (
                <tr key={q.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${q.isRead ? 'bg-slate-100 text-slate-400' : 'bg-blue-600 text-white shadow-lg shadow-blue-100'}`}>
                        {q.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900">{q.name}</div>
                        <div className="text-[11px] text-slate-400 font-medium">{q.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-600 max-w-[200px] truncate">{q.subject || 'General Inquiry'}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="relative inline-block w-32">
                      <select 
                        value={q.isRead ? 'cleared' : 'pending'}
                        onChange={(e) => handleStatusChange(q.id, e.target.value)}
                        className={`appearance-none w-full pl-3 pr-8 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border outline-none transition-all cursor-pointer
                          ${q.isRead 
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100 focus:ring-emerald-200' 
                            : 'bg-amber-50 text-amber-600 border-amber-100 focus:ring-amber-200'}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="cleared">Cleared</option>
                      </select>
                      <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1">
                      <button 
                        onClick={() => setSelectedQuery(q)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                      >
                        <Eye size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(q.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Modal */}
      {selectedQuery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-center p-8 border-b border-slate-50">
              <h3 className="font-black text-xl text-slate-900">Query Details</h3>
              <button onClick={() => setSelectedQuery(null)} className="p-3 bg-slate-50 hover:bg-red-50 hover:text-red-500 rounded-2xl text-slate-400 transition-all">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest block mb-1">Sender</label>
                  <p className="text-sm font-bold text-slate-800">{selectedQuery.name}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest block mb-1">Email</label>
                  <p className="text-sm font-bold text-slate-800">{selectedQuery.email}</p>
                </div>
              </div>
              <div className="p-6 bg-slate-900 rounded-[1.5rem] text-slate-100 text-sm leading-relaxed font-light shadow-inner">
                {selectedQuery.message}
              </div>
            </div>

            <div className="p-8 bg-slate-50 border-t border-slate-100 flex gap-4">
              <a 
                href={`mailto:${selectedQuery.email}`}
                className="flex-1 bg-blue-600 text-white text-center py-4 rounded-2xl text-sm font-black hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
              >
                <ExternalLink size={18} /> OPEN REPLY
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}