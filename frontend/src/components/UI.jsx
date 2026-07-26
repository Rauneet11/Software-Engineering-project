import React from 'react'
import { motion } from 'framer-motion'

/**
 * KPI Card – animated stat card with gradient icon background
 */
export function KPICard({ title, value, subtitle, icon: Icon, gradient = 'kpi-blue', delay = 0, prefix = '', suffix = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="card p-5 hover:shadow-xl transition-shadow duration-300"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">{title}</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white truncate">
            {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
          </p>
          {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>}
        </div>
        <div className={`w-12 h-12 rounded-2xl ${gradient} flex items-center justify-center shadow-lg flex-shrink-0 ml-3`}>
          {Icon && <Icon className="text-white text-xl" />}
        </div>
      </div>
    </motion.div>
  )
}

/**
 * Section heading
 */
export function SectionHeading({ title, subtitle, action }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h2>
        {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

/**
 * Empty state
 */
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      {Icon && (
        <div className="w-20 h-20 rounded-3xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center mb-4 mx-auto">
          <Icon className="text-primary-400 dark:text-primary-500 text-4xl" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mb-6">{description}</p>
      {action}
    </motion.div>
  )
}

/**
 * Loading spinner overlay
 */
export function LoadingSpinner({ text = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="w-10 h-10 border-3 border-primary-500 border-t-transparent rounded-full animate-spin" style={{ borderWidth: 3 }} />
      <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{text}</p>
    </div>
  )
}

/**
 * Badge component
 */
export function StatusBadge({ status }) {
  const map = {
    completed: 'badge-green',
    uploaded:  'badge-blue',
    cleaned:   'badge-purple',
    cleaning:  'badge-yellow',
    error:     'badge-red',
    high:      'badge-red',
    medium:    'badge-yellow',
    low:       'badge-green',
  }
  return <span className={map[status] || 'badge-blue'}>{status}</span>
}

/**
 * Model type badge
 */
export function ModelBadge({ type }) {
  const labels = { xgboost: 'XGBoost', linear: 'Linear', random_forest: 'Random Forest' }
  return <span className="badge badge-purple">{labels[type] || type}</span>
}

/**
 * Metric card for model performance
 */
export function MetricCard({ label, value, description, color = 'text-primary-600' }) {
  return (
    <div className="card p-4 text-center">
      <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value ?? 'N/A'}</p>
      {description && <p className="text-xs text-slate-400 mt-1">{description}</p>}
    </div>
  )
}

/**
 * Page header
 */
export function PageHeader({ title, subtitle, icon: Icon, actions }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div className="flex items-center gap-4">
        {Icon && (
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center shadow-lg">
            <Icon className="text-white text-xl" />
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{title}</h1>
          {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  )
}

/**
 * Data table
 */
export function DataTable({ columns, data, loading }) {
  if (loading) return <LoadingSpinner />
  if (!data?.length) return (
    <div className="text-center py-10 text-slate-400 dark:text-slate-500">No data found</div>
  )
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
      <table className="table-auto w-full">
        <thead>
          <tr>
            {columns.map(col => (
              <th key={col.key} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-slate-50 dark:bg-slate-700/50">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
              {columns.map(col => (
                <td key={col.key} className="px-4 py-3.5 text-sm text-slate-700 dark:text-slate-300">
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/**
 * Confirm dialog (simple)
 */
export function ConfirmDialog({ open, title, message, onConfirm, onCancel }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="card max-w-md w-full p-6"
      >
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="btn-secondary">Cancel</button>
          <button onClick={onConfirm} className="btn-danger">Confirm</button>
        </div>
      </motion.div>
    </div>
  )
}
