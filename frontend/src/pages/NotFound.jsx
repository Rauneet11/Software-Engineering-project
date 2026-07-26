import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiHome, FiAlertTriangle } from 'react-icons/fi'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        {/* Animated number */}
        <motion.div
          animate={{ rotate: [0, -5, 5, -5, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
          className="text-[140px] font-black leading-none bg-gradient-to-br from-primary-500 to-purple-600 bg-clip-text text-transparent mb-4"
        >
          404
        </motion.div>

        <div className="w-16 h-16 rounded-3xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mx-auto mb-4">
          <FiAlertTriangle className="text-primary-500 text-3xl" />
        </div>

        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Page Not Found</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="flex gap-3 justify-center">
          <Link to="/dashboard" className="btn-primary flex items-center gap-2">
            <FiHome /> Go to Dashboard
          </Link>
          <button onClick={() => window.history.back()} className="btn-secondary">
            ← Go Back
          </button>
        </div>
      </motion.div>
    </div>
  )
}
