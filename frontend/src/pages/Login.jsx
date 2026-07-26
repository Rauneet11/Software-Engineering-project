import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { FiEye, FiEyeOff, FiMail, FiLock, FiUser } from 'react-icons/fi'
import { BsGraphUpArrow } from 'react-icons/bs'

export default function Login() {
  const { login } = useAuth()
  const navigate   = useNavigate()
  const [form, setForm]     = useState({ username: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.username || !form.password) { toast.error('Please fill all fields'); return }
    setLoading(true)
    try {
      await login(form)
      toast.success('Welcome back! 🎉')
      navigate('/dashboard')
    } catch (err) {
      const msg = err.response?.data?.non_field_errors?.[0] || err.response?.data?.detail || 'Login failed'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const fillDemo = (role) => {
    const creds = { admin: { username:'admin', password:'admin123' }, manager: { username:'manager', password:'manager123' }, analyst: { username:'analyst', password:'analyst123' } }
    setForm(creds[role])
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel – Branding */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #4c1d95 60%, #1e40af 100%)' }}>
        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/5 blur-2xl" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-purple-500/20 blur-3xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
              <BsGraphUpArrow className="text-white text-xl" />
            </div>
            <div>
              <p className="font-bold text-white text-lg">SalesCast AI</p>
              <p className="text-white/60 text-sm">Revenue Forecasting Platform</p>
            </div>
          </div>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h1 className="text-4xl font-bold leading-tight mb-4">
              Predict Your Revenue<br />Before It Happens
            </h1>
            <p className="text-white/70 text-lg leading-relaxed">
              AI-powered sales forecasting using XGBoost ML models.
              Upload data, get predictions, and drive decisions with confidence.
            </p>
          </motion.div>
        </div>

        <div className="relative z-10 grid grid-cols-3 gap-4">
          {[['98%', 'Forecast Accuracy'], ['6 Months', 'Ahead Forecast'], ['10+', 'AI Metrics']].map(([v, l]) => (
            <div key={l} className="bg-white/10 rounded-2xl p-4 backdrop-blur">
              <p className="text-2xl font-bold text-white">{v}</p>
              <p className="text-white/60 text-xs mt-1">{l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel – Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50 dark:bg-slate-950">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          <div className="mb-8 text-center lg:text-left">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Welcome back</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Username</label>
              <div className="relative">
                <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  className="input pl-10"
                  placeholder="Enter username"
                  value={form.username}
                  onChange={e => setForm({ ...form, username: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPass ? 'text' : 'password'}
                  className="input pl-10 pr-10"
                  placeholder="Enter password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                />
                <button type="button" onClick={() => setShowPass(s => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPass ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded text-primary-500" /> Remember me
              </label>
              <Link to="/forgot-password" className="text-sm text-primary-600 dark:text-primary-400 hover:underline">
                Forgot password?
              </Link>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
              {loading ? <><div className="spinner" /> Signing in...</> : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">Create account</Link>
          </p>

          {/* Demo shortcuts */}
          <div className="mt-8 p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Demo Accounts</p>
            <div className="grid grid-cols-3 gap-2">
              {['admin', 'manager', 'analyst'].map(role => (
                <button key={role} onClick={() => fillDemo(role)}
                  className="text-xs py-2 px-3 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-primary-100 dark:hover:bg-primary-900/40 text-slate-600 dark:text-slate-300 hover:text-primary-600 transition-colors capitalize font-medium">
                  {role}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
