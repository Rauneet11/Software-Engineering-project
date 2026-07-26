import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { predictionsAPI } from '../services/api'
import { PageHeader, LoadingSpinner, EmptyState, ConfirmDialog } from '../components/UI'
import { FiClock, FiTrash2, FiSearch, FiEye, FiFilter } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function History() {
  const [predictions, setPredictions] = useState([])
  const [loading, setLoading]         = useState(true)
  const [search, setSearch]           = useState('')
  const [filter, setFilter]           = useState('all')
  const [deleteId, setDeleteId]       = useState(null)
  const [page, setPage]               = useState(1)
  const PER_PAGE = 10

  useEffect(() => {
    predictionsAPI.list({ search })
      .then(res => setPredictions(res.data.results || res.data))
      .catch(() => toast.error('Failed to load history'))
      .finally(() => setLoading(false))
  }, [search])

  const handleDelete = async () => {
    try {
      await predictionsAPI.delete(deleteId)
      setPredictions(prev => prev.filter(p => p.id !== deleteId))
      toast.success('Prediction deleted')
    } catch { toast.error('Delete failed') }
    setDeleteId(null)
  }

  const filtered = predictions.filter(p => {
    if (filter === 'xgboost')      return p.model_type === 'xgboost'
    if (filter === 'random_forest') return p.model_type === 'random_forest'
    if (filter === 'linear')        return p.model_type === 'linear'
    return true
  })

  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)
  const totalPages = Math.ceil(filtered.length / PER_PAGE)

  const r2Color = (r2) => {
    if (!r2) return 'text-slate-400'
    if (r2 >= 0.8) return 'text-green-500'
    if (r2 >= 0.6) return 'text-yellow-500'
    return 'text-red-500'
  }

  const r2Label = (r2) => {
    if (!r2) return ''
    if (r2 >= 0.8) return '🟢 Excellent'
    if (r2 >= 0.6) return '🟡 Good'
    return '🔴 Fair'
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Prediction History" subtitle="Browse and manage all your prediction runs" icon={FiClock} />

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input pl-10" placeholder="Search by name or model..."
            value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
        </div>
        <div className="flex gap-2">
          {['all', 'xgboost', 'random_forest', 'linear'].map(f => (
            <button key={f} onClick={() => { setFilter(f); setPage(1) }}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all capitalize ${
                filter === f ? 'bg-primary-500 text-white' : 'btn-secondary py-2 px-3 text-xs'
              }`}>
              {f === 'all' ? 'All' : f.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4">
        {[
          ['Total Runs', filtered.length, 'text-primary-600 dark:text-primary-400'],
          ['Avg R² Score', filtered.length ? (filtered.reduce((s,p) => s + (p.r2_score || 0), 0) / filtered.length * 100).toFixed(1) + '%' : 'N/A', 'text-green-600 dark:text-green-400'],
          ['Best Accuracy', filtered.length ? Math.max(...filtered.map(p => p.r2_score || 0) * 100).toFixed(1) + '%' : 'N/A', 'text-purple-600 dark:text-purple-400'],
        ].map(([label, val, cls]) => (
          <div key={label} className="card p-4 text-center">
            <p className={`text-xl font-bold ${cls}`}>{val}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      {loading ? <LoadingSpinner /> : paginated.length === 0 ? (
        <EmptyState icon={FiClock} title="No predictions found"
          description={search ? 'Try a different search term.' : 'Start by running your first prediction.'}
          action={!search && <Link to="/predictions" className="btn-primary">Run Prediction</Link>} />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-700/50">
                <tr>
                  {['#', 'Name', 'Model', 'Dataset', 'R² Score', 'MAE', 'RMSE', 'Forecast', 'Date', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map((pred, i) => (
                  <motion.tr key={pred.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                    className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-4 py-3.5 text-xs text-slate-400">{(page - 1) * PER_PAGE + i + 1}</td>
                    <td className="px-4 py-3.5">
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200 max-w-[180px] truncate">{pred.name}</p>
                    </td>
                    <td className="px-4 py-3.5"><span className="badge badge-purple capitalize">{pred.model_type?.replace('_', ' ')}</span></td>
                    <td className="px-4 py-3.5 text-xs text-slate-500 dark:text-slate-400 max-w-[120px] truncate">{pred.dataset_name || '—'}</td>
                    <td className="px-4 py-3.5">
                      <span className={`text-sm font-bold ${r2Color(pred.r2_score)}`}>
                        {pred.r2_score ? (pred.r2_score * 100).toFixed(1) + '%' : '—'}
                      </span>
                      <p className="text-xs text-slate-400 leading-none">{r2Label(pred.r2_score)}</p>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-slate-600 dark:text-slate-400">{pred.mae ? `₹${pred.mae.toFixed(0)}` : '—'}</td>
                    <td className="px-4 py-3.5 text-sm text-slate-600 dark:text-slate-400">{pred.rmse ? `₹${pred.rmse.toFixed(0)}` : '—'}</td>
                    <td className="px-4 py-3.5 text-xs text-slate-500">{pred.forecast_months}mo</td>
                    <td className="px-4 py-3.5 text-xs text-slate-500 whitespace-nowrap">{new Date(pred.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex gap-1">
                        <Link to={`/forecast?id=${pred.id}`} className="p-1.5 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 text-slate-400 hover:text-primary-600 transition-colors" title="View">
                          <FiEye className="text-sm" />
                        </Link>
                        <button onClick={() => setDeleteId(pred.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 transition-colors" title="Delete">
                          <FiTrash2 className="text-sm" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-slate-200 dark:border-slate-700">
              <p className="text-sm text-slate-500">Showing {(page-1)*PER_PAGE+1}–{Math.min(page*PER_PAGE, filtered.length)} of {filtered.length}</p>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1} className="btn-secondary py-1.5 px-3 text-sm disabled:opacity-40">← Prev</button>
                <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages} className="btn-secondary py-1.5 px-3 text-sm disabled:opacity-40">Next →</button>
              </div>
            </div>
          )}
        </div>
      )}

      <ConfirmDialog open={!!deleteId} title="Delete Prediction" message="This will permanently delete this prediction record."
        onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </div>
  )
}
