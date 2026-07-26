import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { predictionsAPI } from '../services/api'
import { PageHeader, LoadingSpinner, EmptyState, MetricCard } from '../components/UI'
import { FiBarChart2, FiTrendingUp, FiAlertCircle } from 'react-icons/fi'
import { useSearchParams, Link } from 'react-router-dom'
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, Title, Tooltip, Legend, ArcElement, Filler
} from 'chart.js'
import { Line, Bar, Doughnut, Scatter } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, ArcElement, Filler)

const CHART_COLORS = { primary: '#3b82f6', purple: '#8b5cf6', green: '#10b981', orange: '#f59e0b', red: '#ef4444', indigo: '#6366f1' }

const baseLineOptions = (title) => ({
  responsive: true,
  plugins: { legend: { position: 'top' }, title: { display: !!title, text: title, font: { size: 14 } } },
  scales: { y: { beginAtZero: false, grid: { color: 'rgba(148,163,184,0.1)' } }, x: { grid: { display: false } } }
})

export default function Forecast() {
  const [params] = useSearchParams()
  const predId   = params.get('id')
  const [predictions, setPredictions] = useState([])
  const [selected, setSelected]       = useState(null)
  const [loading, setLoading]         = useState(true)
  const [activeChart, setActiveChart] = useState('forecast')

  useEffect(() => {
    predictionsAPI.list()
      .then(res => {
        const list = res.data.results || res.data
        setPredictions(list)
        if (predId) {
          const found = list.find(p => String(p.id) === String(predId))
          setSelected(found || list[0] || null)
        } else {
          setSelected(list[0] || null)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [predId])

  const loadDetail = (pred) => {
    if (pred?.result_json && Object.keys(pred.result_json).length > 0) { setSelected(pred); return }
    predictionsAPI.detail(pred.id).then(res => setSelected(res.data)).catch(() => {})
  }

  if (loading) return <LoadingSpinner text="Loading forecasts..." />

  const result    = selected?.result_json || {}
  const forecast  = result.forecast || {}
  const historical= forecast.historical || []
  const future    = forecast.future    || []
  const products  = result.product_summary    || []
  const categories= result.category_analysis || []
  const avp       = result.actual_vs_predicted || []

  // Chart datasets
  const forecastChartData = {
    labels: [...historical.map(h => h.month), ...future.map(f => f.month)],
    datasets: [
      {
        label: 'Historical Revenue',
        data: [...historical.map(h => h.actual_revenue), ...future.map(() => null)],
        borderColor: CHART_COLORS.primary,
        backgroundColor: CHART_COLORS.primary + '20',
        fill: true, tension: 0.4, pointRadius: 3,
      },
      {
        label: 'Forecasted Revenue',
        data: [...historical.map(() => null), ...future.map(f => f.predicted_revenue)],
        borderColor: CHART_COLORS.purple,
        backgroundColor: CHART_COLORS.purple + '20',
        borderDash: [6, 3],
        fill: true, tension: 0.4, pointRadius: 3,
      }
    ]
  }

  const productBarData = {
    labels: products.slice(0, 8).map(p => p.product),
    datasets: [{
      label: 'Revenue',
      data: products.slice(0, 8).map(p => p.revenue),
      backgroundColor: products.map((_, i) => [
        CHART_COLORS.primary, CHART_COLORS.purple, CHART_COLORS.green, CHART_COLORS.orange,
        CHART_COLORS.red, CHART_COLORS.indigo, '#ec4899', '#14b8a6'
      ][i % 8] + 'cc'),
      borderRadius: 6,
    }]
  }

  const categoryDoughnut = {
    labels: categories.map(c => c.category),
    datasets: [{
      data: categories.map(c => c.revenue),
      backgroundColor: [CHART_COLORS.primary, CHART_COLORS.purple, CHART_COLORS.green, CHART_COLORS.orange, CHART_COLORS.red],
      borderWidth: 0,
    }]
  }

  const avpScatterData = {
    datasets: [{
      label: 'Actual vs Predicted',
      data: avp.slice(0, 100).map(p => ({ x: p.actual, y: p.predicted })),
      backgroundColor: CHART_COLORS.primary + '80',
      pointRadius: 4,
    }]
  }

  const charts = [
    { key: 'forecast', label: 'Revenue Forecast' },
    { key: 'products', label: 'Top Products' },
    { key: 'category', label: 'Category Share' },
    { key: 'avp',      label: 'Actual vs Predicted' },
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="Forecast Dashboard" subtitle="Interactive sales and revenue forecast visualizations" icon={FiBarChart2} />

      {predictions.length === 0 ? (
        <EmptyState icon={FiBarChart2} title="No predictions available"
          description="Run a prediction first to see forecast charts."
          action={<Link to="/predictions" className="btn-primary">Run Prediction</Link>} />
      ) : (
        <>
          {/* Prediction selector */}
          <div className="card p-4">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <label className="label mb-0 whitespace-nowrap">Viewing prediction:</label>
              <select className="input max-w-sm" value={selected?.id || ''} onChange={e => {
                const p = predictions.find(p => String(p.id) === e.target.value)
                if (p) loadDetail(p)
              }}>
                {predictions.map(p => <option key={p.id} value={p.id}>{p.name} ({new Date(p.created_at).toLocaleDateString()})</option>)}
              </select>
              {selected && (
                <div className="flex gap-4 ml-auto text-center">
                  <div><p className="text-xs text-slate-400">R²</p><p className="font-bold text-green-500">{selected.r2_score ? (selected.r2_score * 100).toFixed(1) + '%' : 'N/A'}</p></div>
                  <div><p className="text-xs text-slate-400">MAE</p><p className="font-bold text-primary-500">{selected.mae ? `₹${selected.mae.toFixed(0)}` : 'N/A'}</p></div>
                  <div><p className="text-xs text-slate-400">RMSE</p><p className="font-bold text-purple-500">{selected.rmse ? `₹${selected.rmse.toFixed(0)}` : 'N/A'}</p></div>
                </div>
              )}
            </div>
          </div>

          {/* Chart tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {charts.map(c => (
              <button key={c.key} onClick={() => setActiveChart(c.key)}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  activeChart === c.key
                    ? 'bg-gradient-to-r from-primary-500 to-purple-600 text-white shadow-md'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-primary-300'
                }`}>
                {c.label}
              </button>
            ))}
          </div>

          {/* Chart area */}
          <motion.div key={activeChart} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
            {activeChart === 'forecast' && (
              <>
                <h3 className="font-bold text-slate-800 dark:text-white mb-4">Revenue Forecast ({future.length} months ahead)</h3>
                {historical.length === 0 && future.length === 0
                  ? <p className="text-slate-400 text-center py-10">No forecast data available</p>
                  : <div className="h-80"><Line data={forecastChartData} options={baseLineOptions()} /></div>
                }
              </>
            )}
            {activeChart === 'products' && (
              <>
                <h3 className="font-bold text-slate-800 dark:text-white mb-4">Top Products by Revenue</h3>
                {products.length === 0
                  ? <p className="text-slate-400 text-center py-10">No product data available</p>
                  : <div className="h-80"><Bar data={productBarData} options={{ ...baseLineOptions(), indexAxis: 'y' }} /></div>
                }
              </>
            )}
            {activeChart === 'category' && (
              <>
                <h3 className="font-bold text-slate-800 dark:text-white mb-4">Revenue by Category</h3>
                {categories.length === 0
                  ? <p className="text-slate-400 text-center py-10">No category data available</p>
                  : <div className="h-80 flex items-center justify-center"><div className="w-72 h-72"><Doughnut data={categoryDoughnut} options={{ cutout: '65%', plugins: { legend: { position: 'right' } } }} /></div></div>
                }
              </>
            )}
            {activeChart === 'avp' && (
              <>
                <h3 className="font-bold text-slate-800 dark:text-white mb-1">Actual vs Predicted</h3>
                <p className="text-xs text-slate-400 mb-4">Each point represents a data row. Ideal model has points along the diagonal.</p>
                {avp.length === 0
                  ? <p className="text-slate-400 text-center py-10">No actual vs predicted data available</p>
                  : <div className="h-80"><Scatter data={avpScatterData} options={{ plugins: { legend: { display: false } }, scales: { x: { title: { display: true, text: 'Actual' } }, y: { title: { display: true, text: 'Predicted' } } } }} /></div>
                }
              </>
            )}
          </motion.div>

          {/* Forecast table */}
          {future.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="card overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                <h3 className="font-bold text-slate-800 dark:text-white">Monthly Forecast</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 dark:bg-slate-700/50">
                    <tr>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Month</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Predicted Revenue</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Predicted Sales</th>
                    </tr>
                  </thead>
                  <tbody>
                    {future.map((f, i) => (
                      <tr key={i} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30">
                        <td className="px-5 py-3 text-sm font-medium text-slate-800 dark:text-slate-200">{f.month}</td>
                        <td className="px-5 py-3 text-sm text-green-600 dark:text-green-400 font-semibold">₹{f.predicted_revenue?.toLocaleString()}</td>
                        <td className="px-5 py-3 text-sm text-slate-600 dark:text-slate-400">{f.predicted_sales}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  )
}
