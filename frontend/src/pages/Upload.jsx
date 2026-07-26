import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { datasetsAPI } from '../services/api'
import { PageHeader, LoadingSpinner, EmptyState } from '../components/UI'
import { FiUpload, FiFile, FiCheck, FiX, FiDatabase, FiEye, FiTrash2, FiRefreshCw } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'

export default function Upload() {
  const [file, setFile]         = useState(null)
  const [uploading, setUploading] = useState(false)
  const [cleaning, setCleaning]  = useState(false)
  const [progress, setProgress]  = useState(0)
  const [dataset, setDataset]    = useState(null)
  const [datasets, setDatasets]  = useState([])
  const [loadingList, setLoadingList] = useState(false)
  const [tab, setTab]            = useState('upload')
  const [preview, setPreview]    = useState(null)
  const fileRef = useRef()

  const loadDatasets = () => {
    setLoadingList(true)
    datasetsAPI.list()
      .then(res => setDatasets(res.data.results || res.data))
      .catch(() => toast.error('Failed to load datasets'))
      .finally(() => setLoadingList(false))
  }

  React.useEffect(() => { loadDatasets() }, [])

  const handleDrop = (e) => {
    e.preventDefault()
    const f = e.dataTransfer.files[0]
    if (f?.name.endsWith('.csv')) setFile(f)
    else toast.error('Only CSV files allowed')
  }

  const handleUpload = async () => {
    if (!file) { toast.error('Please select a file'); return }
    setUploading(true)
    setProgress(0)
    const form = new FormData()
    form.append('file', file)
    try {
      const res = await datasetsAPI.upload(form)
      setDataset(res.data.dataset)
      setDatasets(prev => [res.data.dataset, ...prev])
      toast.success('Dataset uploaded successfully!')
      setProgress(100)
      setTab('datasets')
      setFile(null)
    } catch (err) {
      const msg = err.response?.data?.details?.errors?.[0] || err.response?.data?.error || 'Upload failed'
      toast.error(msg)
    } finally {
      setUploading(false)
    }
  }

  const handleClean = async (id) => {
    setCleaning(id)
    try {
      const res = await datasetsAPI.clean(id)
      setDatasets(prev => prev.map(d => d.id === id ? res.data.dataset : d))
      toast.success('Data cleaned successfully! ✨')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Cleaning failed')
    } finally {
      setCleaning(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await datasetsAPI.delete(id)
      setDatasets(prev => prev.filter(d => d.id !== id))
      toast.success('Dataset deleted')
    } catch { toast.error('Delete failed') }
  }

  const handlePreview = async (id) => {
    try {
      const res = await datasetsAPI.preview(id)
      setPreview({ data: res.data, id })
    } catch { toast.error('Preview failed') }
  }

  const statusColor = { uploaded: 'badge-blue', cleaning: 'badge-yellow', cleaned: 'badge-green', error: 'badge-red' }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dataset Management"
        subtitle="Upload, clean, and manage your sales CSV datasets"
        icon={FiDatabase}
      />

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700">
        {[['upload', 'Upload New'], ['datasets', `My Datasets (${datasets.length})`]].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`px-5 py-2.5 text-sm font-semibold border-b-2 transition-colors ${tab === key ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
            {label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {tab === 'upload' && (
          <motion.div key="upload" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
            {/* Drop zone */}
            <div
              onDrop={handleDrop}
              onDragOver={e => e.preventDefault()}
              onClick={() => fileRef.current.click()}
              className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200 ${
                file ? 'border-green-400 bg-green-50 dark:bg-green-900/10' : 'border-slate-300 dark:border-slate-600 hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/10'
              }`}
            >
              <input ref={fileRef} type="file" accept=".csv" className="hidden"
                onChange={e => setFile(e.target.files[0])} />
              {file ? (
                <div className="space-y-2">
                  <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto">
                    <FiCheck className="text-green-500 text-2xl" />
                  </div>
                  <p className="font-semibold text-slate-800 dark:text-white">{file.name}</p>
                  <p className="text-sm text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                  <button onClick={e => { e.stopPropagation(); setFile(null) }}
                    className="text-red-500 hover:text-red-700 text-sm font-medium">Remove</button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-16 h-16 rounded-2xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mx-auto">
                    <FiUpload className="text-primary-500 text-3xl" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-700 dark:text-slate-300">Drop your CSV file here</p>
                    <p className="text-sm text-slate-500 mt-1">or click to browse files</p>
                  </div>
                  <p className="text-xs text-slate-400">Supports: CSV files with product, quantity, revenue, date columns</p>
                </div>
              )}
            </div>

            {/* Required columns info */}
            <div className="glass-card p-5">
              <h4 className="font-semibold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                <FiFile className="text-primary-500" /> Expected CSV Format
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {['date', 'product', 'quantity', 'revenue', 'category', 'region', 'price', 'discount'].map(col => (
                  <div key={col} className="bg-slate-50 dark:bg-slate-700 rounded-lg px-3 py-2">
                    <code className="text-xs font-mono text-primary-600 dark:text-primary-400">{col}</code>
                    <p className="text-xs text-slate-400 mt-0.5">{col === 'date' || col === 'product' || col === 'quantity' || col === 'revenue' ? '⭐ required' : 'optional'}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Upload progress */}
            {uploading && (
              <div className="card p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="spinner text-primary-500" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Uploading and validating...</span>
                </div>
                <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <motion.div className="h-full bg-gradient-to-r from-primary-500 to-purple-500 rounded-full"
                    animate={{ width: `${progress}%` }} transition={{ duration: 0.5 }} />
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={handleUpload} disabled={!file || uploading} className="btn-primary flex items-center gap-2">
                <FiUpload /> {uploading ? 'Uploading...' : 'Upload Dataset'}
              </button>
              <a href="/api/datasets/sample_sales_data.csv" download className="btn-secondary">Download Sample CSV</a>
            </div>
          </motion.div>
        )}

        {tab === 'datasets' && (
          <motion.div key="datasets" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-slate-500 dark:text-slate-400">{datasets.length} datasets found</p>
              <button onClick={loadDatasets} className="btn-secondary flex items-center gap-2 text-sm py-2 px-3">
                <FiRefreshCw className={loadingList ? 'animate-spin' : ''} /> Refresh
              </button>
            </div>

            {loadingList ? <LoadingSpinner /> : datasets.length === 0 ? (
              <EmptyState icon={FiDatabase} title="No datasets yet" description="Upload your first CSV dataset to get started."
                action={<button onClick={() => setTab('upload')} className="btn-primary">Upload Dataset</button>} />
            ) : (
              <div className="space-y-3">
                {datasets.map(ds => (
                  <motion.div key={ds.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    className="card p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                      <FiFile className="text-primary-500 text-lg" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 dark:text-white truncate">{ds.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{ds.rows} rows · {ds.columns} columns · {new Date(ds.uploaded_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`badge ${statusColor[ds.status] || 'badge-blue'} capitalize`}>{ds.status}</span>
                      <button onClick={() => handlePreview(ds.id)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-primary-600 transition-colors" title="Preview">
                        <FiEye />
                      </button>
                      {ds.status !== 'cleaned' && (
                        <button onClick={() => handleClean(ds.id)} disabled={cleaning === ds.id}
                          className="p-2 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 text-slate-500 hover:text-green-600 transition-colors" title="Clean data">
                          {cleaning === ds.id ? <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : <FiRefreshCw />}
                        </button>
                      )}
                      <button onClick={() => handleDelete(ds.id)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-500 hover:text-red-600 transition-colors" title="Delete">
                        <FiTrash2 />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview Modal */}
      <AnimatePresence>
        {preview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setPreview(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()} className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[80vh] overflow-hidden flex flex-col">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                <h3 className="font-bold text-slate-900 dark:text-white">Dataset Preview</h3>
                <button onClick={() => setPreview(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><FiX /></button>
              </div>
              <div className="p-4 grid grid-cols-3 gap-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/30">
                <div><p className="text-xs text-slate-500">Total Rows</p><p className="font-bold text-slate-800 dark:text-white">{preview.data.stats.rows}</p></div>
                <div><p className="text-xs text-slate-500">Columns</p><p className="font-bold text-slate-800 dark:text-white">{preview.data.stats.columns}</p></div>
                <div><p className="text-xs text-slate-500">Column Names</p><p className="text-xs text-slate-600 dark:text-slate-300 truncate">{preview.data.stats.column_names?.join(', ')}</p></div>
              </div>
              <div className="overflow-auto flex-1">
                {preview.data.preview?.length > 0 && (
                  <table className="w-full text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-700 sticky top-0">
                      <tr>{Object.keys(preview.data.preview[0]).map(k => <th key={k} className="px-3 py-2 text-left text-slate-500 uppercase font-semibold">{k}</th>)}</tr>
                    </thead>
                    <tbody>
                      {preview.data.preview.slice(0, 25).map((row, i) => (
                        <tr key={i} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30">
                          {Object.values(row).map((v, j) => <td key={j} className="px-3 py-2 text-slate-700 dark:text-slate-300">{String(v)}</td>)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
