import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { authAPI } from '../services/api'
import { FiMail, FiArrowLeft, FiKey } from 'react-icons/fi'
import { BsGraphUpArrow } from 'react-icons/bs'
import toast from 'react-hot-toast'

export default function ForgotPassword() {
  const [email, setEmail]     = useState('')
  const [token, setToken]     = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep]       = useState(1) // 1=email, 2=reset
  const [newPw, setNewPw]     = useState('')

  const handleForgot = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await authAPI.forgotPassword({ email })
      setToken(res.data.reset_token)
      toast.success('Reset token generated!')
      setStep(2)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Email not found')
    } finally { setLoading(false) }
  }

  const handleReset = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await authAPI.resetPassword({ token, new_password: newPw })
      toast.success('Password reset successfully! Please login.')
      setStep(3)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Reset failed. Invalid or expired token.')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-3xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center shadow-xl mx-auto mb-4">
            <BsGraphUpArrow className="text-white text-2xl" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            {step === 1 ? 'Forgot Password' : step === 2 ? 'Reset Password' : 'Done!'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            {step === 1 ? 'Enter your email to get a reset token' : step === 2 ? 'Enter the token and your new password' : 'Your password has been reset'}
          </p>
        </div>

        <div className="card p-8">
          {step === 1 && (
            <form onSubmit={handleForgot} className="space-y-5">
              <div>
                <label className="label">Email Address</label>
                <div className="relative">
                  <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="email" className="input pl-10" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
              </div>
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-xs text-blue-700 dark:text-blue-300">
                💡 For local development, the reset token will be displayed directly instead of being sent via email.
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                {loading ? <><div className="spinner" /> Sending...</> : 'Get Reset Token'}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleReset} className="space-y-5">
              <div>
                <label className="label">Reset Token</label>
                <div className="relative">
                  <FiKey className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input className="input pl-10 font-mono text-sm" placeholder="Paste token here" value={token} onChange={e => setToken(e.target.value)} required />
                </div>
              </div>
              <div>
                <label className="label">New Password</label>
                <input type="password" className="input" placeholder="Min. 6 characters" value={newPw} onChange={e => setNewPw(e.target.value)} required minLength={6} />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                {loading ? <><div className="spinner" /> Resetting...</> : 'Reset Password'}
              </button>
            </form>
          )}

          {step === 3 && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto">
                <span className="text-3xl">✅</span>
              </div>
              <p className="text-slate-600 dark:text-slate-400">Your password has been changed. You can now log in with your new password.</p>
              <Link to="/login" className="btn-primary block text-center">Go to Login</Link>
            </div>
          )}

          {step !== 3 && (
            <Link to="/login" className="flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-primary-600 dark:hover:text-primary-400 mt-6 transition-colors">
              <FiArrowLeft /> Back to login
            </Link>
          )}
        </div>
      </motion.div>
    </div>
  )
}
