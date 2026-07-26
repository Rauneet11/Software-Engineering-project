import React, { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { authAPI } from '../services/api'
import { PageHeader } from '../components/UI'
import { FiUser, FiMail, FiPhone, FiLock, FiBriefcase, FiCamera, FiSave, FiEye, FiEyeOff } from 'react-icons/fi'
import toast from 'react-hot-toast'

const roleBadge = { admin: 'badge-red', manager: 'badge-blue', analyst: 'badge-purple' }

export default function Profile() {
  const { user, setUser, refreshUser } = useAuth()
  const [tab, setTab] = useState('profile')
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    first_name: user?.first_name || '',
    last_name:  user?.last_name  || '',
    email:      user?.email      || '',
    phone:      user?.phone      || '',
    bio:        user?.bio        || '',
    company:    user?.company    || '',
  })
  const [pwForm, setPwForm] = useState({ old_password: '', new_password: '', confirm: '' })
  const [showPw, setShowPw] = useState(false)
  const photoRef = useRef()

  const handleProfileSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await authAPI.updateProfile(form)
      setUser(res.data.user)
      toast.success('Profile updated! ✅')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Update failed')
    } finally { setSaving(false) }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    if (pwForm.new_password !== pwForm.confirm) { toast.error('Passwords do not match'); return }
    setSaving(true)
    try {
      await authAPI.changePassword({ old_password: pwForm.old_password, new_password: pwForm.new_password })
      toast.success('Password changed successfully!')
      setPwForm({ old_password: '', new_password: '', confirm: '' })
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to change password')
    } finally { setSaving(false) }
  }

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { toast.error('Photo must be under 5MB'); return }
    const form = new FormData()
    form.append('profile_photo', file)
    try {
      await authAPI.uploadPhoto(form)
      await refreshUser()
      toast.success('Profile photo updated!')
    } catch { toast.error('Photo upload failed') }
  }

  const TABS = [['profile', 'Profile Info'], ['password', 'Security'], ['activity', 'Activity']]

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader title="My Profile" subtitle="Manage your account settings and preferences" icon={FiUser} />

      {/* Profile card */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-24 h-24 rounded-3xl overflow-hidden bg-gradient-to-br from-primary-500 to-purple-600 shadow-xl">
              {user?.profile_photo
                ? <img src={user.profile_photo} className="w-full h-full object-cover" alt="Profile" />
                : <div className="w-full h-full flex items-center justify-center text-white text-3xl font-bold">{user?.username?.[0]?.toUpperCase()}</div>
              }
            </div>
            <button onClick={() => photoRef.current.click()}
              className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-primary-500 hover:bg-primary-600 flex items-center justify-center shadow-lg transition-colors">
              <FiCamera className="text-white text-sm" />
            </button>
            <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
          </div>

          {/* Info */}
          <div className="text-center sm:text-left">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{user?.first_name || user?.username} {user?.last_name}</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">@{user?.username}</p>
            <div className="flex items-center gap-2 mt-2 justify-center sm:justify-start">
              <span className={`badge ${roleBadge[user?.role]} capitalize`}>{user?.role}</span>
              <span className="badge badge-blue">{user?.company || 'Sales Analytics Institute'}</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</p>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700">
        {TABS.map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`px-5 py-2.5 text-sm font-semibold border-b-2 transition-colors ${tab === key ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'profile' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-6">
          <form onSubmit={handleProfileSave} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="label flex items-center gap-2"><FiUser className="text-primary-500" /> First Name</label>
                <input className="input" value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} />
              </div>
              <div>
                <label className="label">Last Name</label>
                <input className="input" value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} />
              </div>
              <div>
                <label className="label flex items-center gap-2"><FiMail className="text-primary-500" /> Email</label>
                <input type="email" className="input" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>
              <div>
                <label className="label flex items-center gap-2"><FiPhone className="text-primary-500" /> Phone</label>
                <input className="input" placeholder="+91 99999 00000" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div>
                <label className="label flex items-center gap-2"><FiBriefcase className="text-primary-500" /> Company/Institute</label>
                <input className="input" placeholder="Company name" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="label">Bio</label>
              <textarea className="input min-h-[80px] resize-none" placeholder="Tell us about yourself..." value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} />
            </div>
            <div className="flex justify-end">
              <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
                {saving ? <><div className="spinner" /> Saving...</> : <><FiSave /> Save Changes</>}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {tab === 'password' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-6">
          <form onSubmit={handlePasswordChange} className="space-y-5 max-w-sm">
            <h3 className="font-bold text-slate-800 dark:text-white mb-4">Change Password</h3>
            {[['old_password', 'Current Password'], ['new_password', 'New Password'], ['confirm', 'Confirm New Password']].map(([key, label]) => (
              <div key={key}>
                <label className="label">{label}</label>
                <div className="relative">
                  <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type={showPw ? 'text' : 'password'} className="input pl-10 pr-10"
                    value={pwForm[key]} onChange={e => setPwForm({ ...pwForm, [key]: e.target.value })} required minLength={6} />
                  <button type="button" onClick={() => setShowPw(s => !s)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPw ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>
            ))}
            <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
              {saving ? <><div className="spinner" /> Changing...</> : <><FiLock /> Change Password</>}
            </button>
          </form>
        </motion.div>
      )}

      {tab === 'activity' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-6">
          <h3 className="font-bold text-slate-800 dark:text-white mb-4">Account Information</h3>
          <div className="space-y-3">
            {[
              ['Username', user?.username],
              ['Email', user?.email],
              ['Role', user?.role],
              ['Member Since', user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'],
              ['Last Updated', user?.updated_at ? new Date(user.updated_at).toLocaleDateString() : 'N/A'],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-700 last:border-0">
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</span>
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 capitalize">{value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
