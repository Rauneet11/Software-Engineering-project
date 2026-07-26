import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { predictionsAPI } from '../services/api'
import { PageHeader, LoadingSpinner, EmptyState } from '../components/UI'
import { BsGraphUpArrow } from 'react-icons/bs'
import { FiRefreshCw, FiFilter } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

const priorityConfig = {
  high:   { color: 'border-red-300 dark:border-red-700',    bg: 'bg-red-50 dark:bg-red-900/10',    badge: 'badge-red',    dot: 'bg-red-500' },
  medium: { color: 'border-yellow-300 dark:border-yellow-700', bg: 'bg-yellow-50 dark:bg-yellow-900/10', badge: 'badge-yellow', dot: 'bg-yellow-500' },
  low:    { color: 'border-green-300 dark:border-green-700', bg: 'bg-green-50 dark:bg-green-900/10', badge: 'badge-green',  dot: 'bg-green-500' },
}

const typeConfig = {
  inventory: { color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300', label: 'Inventory' },
  marketing: { color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300', label: 'Marketing' },
  category:  { color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300', label: 'Category' },
  opportunity: { color: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300', label: 'Opportunity' },
  warning:   { color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300', label: 'Warning' },
  seasonal:  { color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300', label: 'Seasonal' },
  digital:   { color: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300', label: 'Digital' },
  loyalty:   { color: 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300', label: 'Loyalty' },
}

export default function Recommendations() {
  const [predictions, setPredictions] = useState([])
  const [selectedId, setSelectedId]   = useState(null)
  const [recs, setRecs]               = useState([])
  const [loading, setLoading]         = useState(true)
  const [filter, setFilter]           = useState('all')

  useEffect(() => {
    predictionsAPI.list()
      .then(res => {
        const list = res.data.results || res.data
        setPredictions(list)
        if (list.length > 0) {
          setSelectedId(list[0].id)
          setRecs(list[0].recommendations || [])
        }
      })
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false))
  }, [])

  const handleSelect = (id) => {
    const pred = predictions.find(p => p.id === Number(id))
    setSelectedId(Number(id))
    setRecs(pred?.recommendations || [])
    setFilter('all')
  }

  const filtered = filter === 'all' ? recs : recs.filter(r => r.priority === filter || r.type === filter)

  const counts = {
    high:   recs.filter(r => r.priority === 'high').length,
    medium: recs.filter(r => r.priority === 'medium').length,
    low:    recs.filter(r => r.priority === 'low').length,
  }

  return (
    <div className="space-y-6">
      <PageHeader title="AI Business Insights" subtitle="Rule-based recommendations powered by your prediction data" icon={BsGraphUpArrow} />

      {loading ? <LoadingSpinner /> : predictions.length === 0 ? (
        <EmptyState icon={BsGraphUpArrow} title="No recommendations yet"
          description="Run a prediction to generate AI-powered business recommendations."
          action={<Link to="/predictions" className="btn-primary">Run Prediction</Link>} />
      ) : (
        <>
          {/* Selector + summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="sm:col-span-1">
              <label className="label">Prediction</label>
              <select className="input" value={selectedId || ''} onChange={e => handleSelect(e.target.value)}>
                {predictions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            {[['high', '🔴 High Priority', counts.high], ['medium', '🟡 Medium Priority', counts.medium], ['low', '🟢 Low Priority', counts.low]].map(([k, label, count]) => (
              <button key={k} onClick={() => setFilter(f => f === k ? 'all' : k)}
                className={`card p-4 text-center transition-all cursor-pointer hover:shadow-lg ${filter === k ? 'ring-2 ring-primary-500' : ''}`}>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{count}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{label}</p>
              </button>
            ))}
          </div>

          {/* Filter pills */}
          <div className="flex gap-2 flex-wrap">
            {['all', 'high', 'medium', 'low', 'inventory', 'marketing', 'seasonal', 'digital'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize ${
                  filter === f ? 'bg-primary-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}>{f}</button>
            ))}
          </div>

          {/* Recommendations grid */}
          {filtered.length === 0 ? (
            <div className="text-center py-10 text-slate-400">No recommendations match this filter</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              <AnimatePresence>
                {filtered.map((rec, i) => {
                  const pc = priorityConfig[rec.priority] || priorityConfig.low
                  const tc = typeConfig[rec.type] || typeConfig.inventory
                  return (
                    <motion.div key={`${rec.type}-${i}`}
                      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: i * 0.05 }}
                      className={`card border-l-4 ${pc.color} hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5`}>
                      <div className={`${pc.bg} px-5 pt-5 pb-3 rounded-t-2xl`}>
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <span className="text-2xl">{rec.icon}</span>
                          <div className="flex gap-1.5 flex-wrap justify-end">
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${tc.color}`}>{tc.label}</span>
                            <span className={`badge ${pc.badge} capitalize`}>{rec.priority}</span>
                          </div>
                        </div>
                        <h4 className="font-bold text-slate-900 dark:text-white leading-tight">{rec.title}</h4>
                      </div>
                      <div className="px-5 pb-5 pt-3">
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{rec.description}</p>
                        {rec.product && (
                          <div className="mt-3 flex items-center gap-2">
                            <span className="text-xs text-slate-400">Product:</span>
                            <span className="badge badge-blue">{rec.product}</span>
                          </div>
                        )}
                        {rec.category && (
                          <div className="mt-3 flex items-center gap-2">
                            <span className="text-xs text-slate-400">Category:</span>
                            <span className="badge badge-purple">{rec.category}</span>
                          </div>
                        )}
                        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700">
                          <p className="text-xs text-slate-400 font-mono uppercase tracking-wider">Action: {rec.action}</p>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          )}
        </>
      )}
    </div>
  )
}
