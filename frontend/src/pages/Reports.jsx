import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { reportsAPI, predictionsAPI } from '../services/api'
import { PageHeader, LoadingSpinner, EmptyState } from '../components/UI'
import { FiFileText, FiDownload, FiTrash2, FiPlus } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

export default function Reports() {
  const { user } = useAuth()
  const [reports, setReports]         = useState([])
  const [predictions, setPredictions] = useState([])
  const [loading, setLoading]         = useState(true)
  const [generating, setGenerating]   = useState(false)
  const [showForm, setShowForm]       = useState(false)
  const [form, setForm] = useState({ prediction_id: '', company_name: '' })

  useEffect(() => {
    Promise.all([reportsAPI.list(), predictionsAPI.list()])
      .then(([rRes, pRes]) => {
        setReports(rRes.data.results || rRes.data)
        const pList = pRes.data.results || pRes.data
        setPredictions(pList)
        if (pList.length > 0) setForm(f => ({ ...f, prediction_id: pList[0].id, company_name: user?.company || 'Sales Analytics Institute' }))
      })
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false))
  }, [])

  const handleGenerate = async (e) => {
    e.preventDefault()
    if (!form.prediction_id) { toast.error('Select a prediction'); return }
    setGenerating(true)
    try {
      const res = await reportsAPI.generate(form)
      setReports(prev => [res.data.report, ...prev])
      toast.success('PDF report generated! 📄')
      setShowForm(false)
      // Auto-download
      const url = res.data.report.download_url
      if (url) window.open(url, '_blank')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to generate report')
    } finally { setGenerating(false) }
  }

  const handleDelete = async (id) => {
    try {
      await reportsAPI.delete(id)
      setReports(prev => prev.filter(r => r.id !== id))
      toast.success('Report deleted')
    } catch { toast.error('Delete failed') }
  }

  const handleDownload = (report) => {
    const url = reportsAPI.download(report.id)
    const a = document.createElement('a')
    a.href = url
    a.download = report.title + '.pdf'
    a.click()
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Reports" subtitle="Generate and download professional PDF reports" icon={FiFileText}
        actions={
          <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
            <FiPlus /> Generate Report
          </button>
        }
      />

      {/* Generate form modal */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="card p-6 w-full max-w-md">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-5">Generate PDF Report</h3>
              <form onSubmit={handleGenerate} className="space-y-4">
                <div>
                  <label className="label">Select Prediction *</label>
                  <select className="input" value={form.prediction_id} onChange={e => setForm({ ...form, prediction_id: e.target.value })} required>
                    <option value="">-- Select prediction --</option>
                    {predictions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Company Name</label>
                  <input className="input" placeholder="Your company or institute name"
                    value={form.company_name} onChange={e => setForm({ ...form, company_name: e.target.value })} />
                </div>
                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-xs text-blue-700 dark:text-blue-300">
                  📋 The report will include: Model metrics, revenue summary, top products, monthly forecast table, and AI recommendations.
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
                  <button type="submit" disabled={generating} className="btn-primary flex-1 flex items-center justify-center gap-2">
                    {generating ? <><div className="spinner" /> Generating...</> : <><FiFileText /> Generate PDF</>}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Reports list */}
      {loading ? <LoadingSpinner /> : reports.length === 0 ? (
        <EmptyState icon={FiFileText} title="No reports yet"
          description="Generate your first professional PDF report from any prediction."
          action={<button onClick={() => setShowForm(true)} className="btn-primary">Generate Report</button>} />
      ) : (
        <div className="space-y-3">
          {reports.map((report, i) => (
            <motion.div key={report.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className="card p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center flex-shrink-0 shadow-md">
                <FiFileText className="text-white text-xl" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 dark:text-white truncate">{report.title}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Generated {new Date(report.created_at).toLocaleString()} · {report.file_size ? `${(report.file_size / 1024).toFixed(1)} KB` : ''}
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleDownload(report)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/40 transition-colors text-sm font-medium">
                  <FiDownload /> Download
                </button>
                <button onClick={() => handleDelete(report.id)}
                  className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 transition-colors">
                  <FiTrash2 />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
