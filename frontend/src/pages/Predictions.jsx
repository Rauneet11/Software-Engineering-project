import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { predictionsAPI, datasetsAPI } from '../services/api'
import { PageHeader, LoadingSpinner, EmptyState, MetricCard, ConfirmDialog } from '../components/UI'
import { FiTrendingUp, FiPlay, FiTrash2, FiSearch, FiEye } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'

export default function Predictions() {
  const navigate = useNavigate()
  const [predictions, setPredictions] = useState([])
  const [datasets, setDatasets]       = useState([])
  const [loading, setLoading]         = useState(true)
  const [running, setRunning]         = useState(false)
  const [search, setSearch]           = useState('')
  const [showForm, setShowForm]       = useState(false)
  const [deleteId, setDeleteId]       = useState(null)
  const [form, setForm] = useState({
    dataset_id: '', model_type: 'xgboost', forecast_months: 6, name: ''
  })

  useEffect(() => {
    Promise.all([
      predictionsAPI.list(),
      datasetsAPI.list()
    ]).then(([pRes, dRes]) => {
      setPredictions(pRes.data.results || pRes.data)
      const ds = dRes.data.results || dRes.data
      setDatasets(ds.filter(d => d.status === 'cleaned' || d.status === 'uploaded'))
    }).catch(() => toast.error('Failed to load data'))
      .finally(() => setLoading(false))
  }, [])

  const handleRun = async (e) => {
    e.preventDefault()
    if (!form.dataset_id) { toast.error('Please select a dataset'); return }
    setRunning(true)
    try {
      const res = await predictionsAPI.run({
        ...form,
        name: form.name || `Prediction ${predictions.length + 1}`,
        forecast_months: Number(form.forecast_months)
      })
      setPredictions(prev => [res.data.prediction, ...prev])
      toast.success('Prediction completed! 🎉')
      setShowForm(false)
      navigate(`/forecast?id=${res.data.prediction.id}`)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Prediction failed')
    } finally {
      setRunning(false)
    }
  }

  const handleDelete = async () => {
    try {
      await predictionsAPI.delete(deleteId)
      setPredictions(prev => prev.filter(p => p.id !== deleteId))
      toast.success('Prediction deleted')
    } catch { toast.error('Delete failed') }
    setDeleteId(null)
  }

  const filtered = predictions.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.model_type?.toLowerCase().includes(search.toLowerCase())
  )

  const r2Color = (r2) => {
    if (!r2) return 'text-slate-400'
    if (r2 >= 0.8) return 'text-green-500'
    if (r2 >= 0.6) return 'text-yellow-500'
    return 'text-red-500'
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="ML Predictions"
        subtitle="Train models and generate sales forecasts"
        icon={FiTrendingUp}
        actions={
          <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
            <FiPlay /> Run New Prediction
          </button>
        }
      />

      {/* Run Prediction Modal */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="card p-6 w-full max-w-md">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-5">Configure Prediction</h3>
              <form onSubmit={handleRun} className="space-y-4">
                <div>
                  <label className="label">Prediction Name</label>
                  <input className="input" placeholder="e.g. Q1 2025 Forecast"
                    value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                </div>
                <div>
                  <label className="label">Select Dataset *</label>
                  <select className="input" value={form.dataset_id} onChange={e => setForm({ ...form, dataset_id: e.target.value })} required>
                    <option value="">-- Select a dataset --</option>
                    {datasets.map(d => <option key={d.id} value={d.id}>{d.name} ({d.rows} rows)</option>)}
                  </select>
                  {datasets.length === 0 && <p className="text-xs text-yellow-500 mt-1">⚠ No datasets found. <Link to="/upload" className="underline">Upload one first.</Link></p>}
                </div>
                <div>
                  <label className="label">ML Model</label>
                  <select className="input" value={form.model_type} onChange={e => setForm({ ...form, model_type: e.target.value })}>
                    <option value="xgboost">XGBoost (Recommended)</option>
                    <option value="random_forest">Random Forest</option>
                    <option value="linear">Linear Regression</option>
                  </select>
                </div>
                <div>
                  <label className="label">Forecast Period: <span className="text-primary-500 font-bold">{form.forecast_months} months</span></label>
                  <input type="range" min={3} max={24} step={3} className="w-full mt-1"
                    value={form.forecast_months} onChange={e => setForm({ ...form, forecast_months: e.target.value })} />
                  <div className="flex justify-between text-xs text-slate-400 mt-1">
                    <span>3 months</span><span>24 months</span>
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
                  <button type="submit" disabled={running} className="btn-primary flex-1 flex items-center justify-center gap-2">
                    {running ? <><div className="spinner" /> Running...</> : <><FiPlay /> Run Model</>}
                  </button>
                </div>
              </form>
              {running && (
                <div className="mt-4 p-3 rounded-xl bg-primary-50 dark:bg-primary-900/20 text-center">
                  <p className="text-xs text-primary-600 dark:text-primary-400 animate-pulse">🤖 Training ML model... This may take 15-30 seconds</p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Search */}
      <div className="relative max-w-sm">
        <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input className="input pl-10" placeholder="Search predictions..."
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Predictions List */}
      {loading ? <LoadingSpinner /> : filtered.length === 0 ? (
        <EmptyState icon={FiTrendingUp} title="No predictions yet"
          description="Run your first ML prediction to forecast sales and revenue."
          action={<button onClick={() => setShowForm(true)} className="btn-primary">Run Prediction</button>} />
      ) : (
        <div className="space-y-3">
          {filtered.map((pred, i) => (
            <motion.div key={pred.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="card p-5 hover:shadow-lg transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <FiTrendingUp className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-slate-800 dark:text-white">{pred.name}</p>
                    <span className="badge badge-purple capitalize">{pred.model_type}</span>
                    <span className="badge badge-blue">{pred.forecast_months}mo forecast</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Dataset: {pred.dataset_name || 'Unknown'} · {new Date(pred.created_at).toLocaleString()}
                  </p>
                </div>
                {/* Metrics */}
                <div className="flex gap-4 text-center">
                  <div>
                    <p className="text-xs text-slate-500">R² Score</p>
                    <p className={`font-bold text-sm ${r2Color(pred.r2_score)}`}>
                      {pred.r2_score ? (pred.r2_score * 100).toFixed(1) + '%' : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">MAE</p>
                    <p className="font-bold text-sm text-slate-700 dark:text-slate-300">
                      {pred.mae ? `₹${pred.mae.toFixed(0)}` : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">RMSE</p>
                    <p className="font-bold text-sm text-slate-700 dark:text-slate-300">
                      {pred.rmse ? `₹${pred.rmse.toFixed(0)}` : 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link to={`/forecast?id=${pred.id}`} className="p-2 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 text-slate-500 hover:text-primary-600 transition-colors" title="View forecast">
                    <FiEye />
                  </Link>
                  <button onClick={() => setDeleteId(pred.id)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-500 hover:text-red-600 transition-colors" title="Delete">
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <ConfirmDialog open={!!deleteId} title="Delete Prediction" message="This will permanently delete the prediction and its data. Are you sure?"
        onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </div>
  )
}
