import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { dashboardAPI } from '../services/api'
import { KPICard, LoadingSpinner, EmptyState } from '../components/UI'
import {
  FiDollarSign, FiTrendingUp, FiTarget, FiActivity,
  FiShoppingBag, FiAward, FiAlertCircle, FiBarChart2,
  FiDatabase, FiFileText, FiUsers
} from 'react-icons/fi'
import { BsGraphUpArrow } from 'react-icons/bs'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  LineElement, PointElement, Title, Tooltip, Legend, ArcElement, Filler
} from 'chart.js'
import { Bar, Doughnut } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, ArcElement, Filler)

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    dashboardAPI.stats()
      .then(res => setStats(res.data))
      .catch(err => setError(err.response?.data?.detail || 'Failed to load stats'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner text="Loading dashboard..." />
  if (error)   return <div className="card p-8 text-center text-red-500">{error}</div>

  const kpis = [
    { title: 'Total Revenue',      value: `₹${(stats.total_revenue || 0).toLocaleString()}`,    subtitle: 'From all predictions', icon: FiDollarSign, gradient: 'kpi-blue' },
    { title: 'Predicted Revenue',  value: `₹${(stats.predicted_revenue || 0).toLocaleString()}`, subtitle: 'ML model forecast',    icon: BsGraphUpArrow, gradient: 'kpi-purple' },
    { title: 'Prediction Accuracy',value: `${stats.prediction_accuracy || 0}%`,                  subtitle: 'Avg R² score',         icon: FiTarget,    gradient: 'kpi-green' },
    { title: 'Total Predictions',  value: stats.total_predictions || 0,                          subtitle: 'Models run',           icon: FiActivity,  gradient: 'kpi-orange' },
    { title: 'Best Product',       value: stats.best_product || 'N/A',                           subtitle: 'Highest revenue',      icon: FiAward,     gradient: 'kpi-indigo' },
    { title: 'Monthly Growth',     value: `${stats.monthly_growth || 0}%`,                       subtitle: 'Forecast trend',       icon: FiTrendingUp, gradient: 'kpi-rose' },
    { title: 'Total Datasets',     value: stats.total_datasets || 0,                             subtitle: 'Uploaded files',       icon: FiDatabase,  gradient: 'kpi-blue' },
    { title: 'Reports Generated',  value: stats.total_reports || 0,                              subtitle: 'PDF reports',          icon: FiFileText,  gradient: 'kpi-purple' },
  ]

  if (user?.role === 'admin') {
    kpis.push({ title: 'Total Users', value: stats.total_users || 0, subtitle: 'Platform users', icon: FiUsers, gradient: 'kpi-green' })
  }

  const recentPreds = stats.recent_predictions || []

  // Mini chart data
  const barData = {
    labels: recentPreds.slice(0, 5).map((_, i) => `Pred ${i+1}`),
    datasets: [{
      label: 'R² Score',
      data: recentPreds.slice(0, 5).map(p => (p.r2_score || 0) * 100),
      backgroundColor: ['#3b82f6','#8b5cf6','#10b981','#f59e0b','#ef4444'],
      borderRadius: 8,
    }]
  }

  const donutData = {
    labels: ['Actual Revenue', 'Predicted Revenue'],
    datasets: [{
      data: [stats.total_revenue || 1, stats.predicted_revenue || 1],
      backgroundColor: ['#3b82f6', '#8b5cf6'],
      borderWidth: 0,
    }]
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Good morning, <span className="gradient-text">{user?.first_name || user?.username}</span> 👋
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Here's your AI-powered sales intelligence overview.
        </p>
      </motion.div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <KPICard key={kpi.title} {...kpi} delay={i * 0.06} />
        ))}
      </div>

      {/* Charts Row */}
      {recentPreds.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card p-5 lg:col-span-2">
            <h3 className="font-bold text-slate-800 dark:text-white mb-4">Recent Prediction Accuracy</h3>
            <Bar data={barData} options={{
              responsive: true,
              plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => `${c.raw.toFixed(1)}%` } } },
              scales: { y: { max: 100, ticks: { callback: v => `${v}%` }, grid: { color: '#e2e8f020' } }, x: { grid: { display: false } } },
            }} />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card p-5">
            <h3 className="font-bold text-slate-800 dark:text-white mb-4">Revenue Breakdown</h3>
            <Doughnut data={donutData} options={{
              responsive: true,
              cutout: '70%',
              plugins: { legend: { position: 'bottom', labels: { padding: 16, font: { size: 12 } } } }
            }} />
          </motion.div>
        </div>
      )}

      {/* Recent Predictions Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="card overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <h3 className="font-bold text-slate-800 dark:text-white">Recent Predictions</h3>
          <Link to="/history" className="text-sm text-primary-600 dark:text-primary-400 hover:underline font-medium">View all →</Link>
        </div>
        {recentPreds.length === 0 ? (
          <EmptyState
            icon={FiBarChart2}
            title="No predictions yet"
            description="Upload a dataset and run your first prediction to see results here."
            action={<Link to="/upload" className="btn-primary text-sm">Upload Dataset</Link>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-700/50">
                <tr>
                  {['Name', 'Model', 'R² Score', 'MAE', 'Date', 'Action'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentPreds.map((pred, i) => (
                  <motion.tr key={pred.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 * i }}
                    className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-5 py-3.5 text-sm font-medium text-slate-800 dark:text-slate-200">{pred.name}</td>
                    <td className="px-5 py-3.5"><span className="badge badge-purple capitalize">{pred.model_type}</span></td>
                    <td className="px-5 py-3.5 text-sm">
                      <span className={`font-semibold ${pred.r2_score >= 0.8 ? 'text-green-500' : pred.r2_score >= 0.6 ? 'text-yellow-500' : 'text-red-500'}`}>
                        {pred.r2_score ? (pred.r2_score * 100).toFixed(1) + '%' : 'N/A'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-600 dark:text-slate-400">{pred.mae ? `₹${pred.mae.toLocaleString()}` : 'N/A'}</td>
                    <td className="px-5 py-3.5 text-xs text-slate-500 dark:text-slate-400">{new Date(pred.created_at).toLocaleDateString()}</td>
                    <td className="px-5 py-3.5">
                      <Link to={`/forecast?id=${pred.id}`} className="text-xs text-primary-600 dark:text-primary-400 hover:underline font-medium">View →</Link>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Quick Actions */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
        <h3 className="font-bold text-slate-800 dark:text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Upload Dataset',    to: '/upload',          icon: FiDatabase, color: 'from-blue-500 to-blue-600' },
            { label: 'Run Prediction',    to: '/predictions',     icon: BsGraphUpArrow, color: 'from-purple-500 to-purple-700' },
            { label: 'Scenario Simulator',to: '/simulator',       icon: FiActivity, color: 'from-emerald-500 to-emerald-600' },
            { label: 'Generate Report',   to: '/reports',         icon: FiFileText, color: 'from-orange-400 to-orange-600' },
          ].map(({ label, to, icon: Icon, color }) => (
            <Link key={to} to={to}
              className={`bg-gradient-to-br ${color} rounded-2xl p-5 text-white hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex flex-col gap-2`}>
              <Icon className="text-2xl opacity-90" />
              <span className="font-semibold text-sm">{label}</span>
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
