import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi'
import { BsGraphUpArrow } from 'react-icons/bs'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', email: '', first_name: '', last_name: '', password: '', password2: '', role: 'manager' })
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.password2) { toast.error('Passwords do not match'); return }
    setLoading(true)
    try {
      await register(form)
      toast.success('Account created! Welcome 🎉')
      navigate('/dashboard')
    } catch (err) {
      const errors = err.response?.data
      if (errors) {
        const msg = typeof errors === 'string' ? errors : Object.values(errors).flat().join(', ')
        toast.error(msg)
      } else {
        toast.error('Registration failed')
      }
    } finally {
      setLoading(false)
    }
  }

  const field = (key, label, type = 'text', icon, placeholder) => (
    <div>
      <label className="label">{label}</label>
      <div className="relative">
        {icon && React.createElement(icon, { className: 'absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400' })}
        <input
          type={type}
          className={`input ${icon ? 'pl-10' : ''}`}
          placeholder={placeholder || label}
          value={form[key]}
          onChange={e => setForm({ ...form, [key]: e.target.value })}
          required
        />
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-3xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center shadow-xl mx-auto mb-4">
            <BsGraphUpArrow className="text-white text-2xl" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Create Account</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Join the AI Sales Forecasting Platform</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {field('first_name', 'First Name', 'text', FiUser, 'First name')}
              {field('last_name',  'Last Name',  'text', null, 'Last name')}
              {field('username',   'Username',   'text', FiUser, 'Choose a username')}
              {field('email',      'Email',      'email', FiMail, 'your@email.com')}
            </div>

            <div>
              <label className="label">Role</label>
              <select className="input" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                <option value="manager">Store Manager</option>
                <option value="analyst">Marketing Analyst</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    className="input pl-10 pr-10"
                    placeholder="Min. 6 characters"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    required minLength={6}
                  />
                  <button type="button" onClick={() => setShowPass(s => !s)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPass ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>
              <div>
                <label className="label">Confirm Password</label>
                <div className="relative">
                  <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    className="input pl-10"
                    placeholder="Repeat password"
                    value={form.password2}
                    onChange={e => setForm({ ...form, password2: e.target.value })}
                    required minLength={6}
                  />
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
              {loading ? <><div className="spinner" /> Creating account...</> : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
