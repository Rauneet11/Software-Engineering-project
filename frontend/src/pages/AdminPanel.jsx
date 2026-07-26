import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { authAPI } from '../services/api'
import { PageHeader, LoadingSpinner, EmptyState, ConfirmDialog } from '../components/UI'
import { FiShield, FiUsers, FiTrash2, FiEdit2, FiCheck, FiX } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import { Navigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const roleColors = { admin: 'badge-red', manager: 'badge-blue', analyst: 'badge-purple' }

export default function AdminPanel() {
  const { user } = useAuth()
  const [users, setUsers]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [editId, setEditId]     = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [editRole, setEditRole] = useState('')

  if (user?.role !== 'admin') return <Navigate to="/dashboard" />

  useEffect(() => {
    authAPI.getUsers()
      .then(res => setUsers(res.data.results || res.data))
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoading(false))
  }, [])

  const handleRoleUpdate = async (id) => {
    try {
      await authAPI.updateUser(id, { role: editRole })
      setUsers(prev => prev.map(u => u.id === id ? { ...u, role: editRole } : u))
      toast.success('Role updated')
      setEditId(null)
    } catch { toast.error('Update failed') }
  }

  const handleDelete = async () => {
    try {
      await authAPI.deleteUser(deleteId)
      setUsers(prev => prev.filter(u => u.id !== deleteId))
      toast.success('User deleted')
    } catch { toast.error('Delete failed') }
    setDeleteId(null)
  }

  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === 'admin').length,
    managers: users.filter(u => u.role === 'manager').length,
    analysts: users.filter(u => u.role === 'analyst').length,
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Admin Panel" subtitle="Manage platform users and permissions" icon={FiShield} />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[['Total Users', stats.total, 'kpi-blue'], ['Admins', stats.admins, 'kpi-rose'], ['Managers', stats.managers, 'kpi-green'], ['Analysts', stats.analysts, 'kpi-purple']].map(([label, val, gradient]) => (
          <div key={label} className="card p-4 text-center">
            <div className={`w-10 h-10 rounded-xl ${gradient} flex items-center justify-center mx-auto mb-2`}><FiUsers className="text-white" /></div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{val}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Users table */}
      {loading ? <LoadingSpinner /> : users.length === 0 ? (
        <EmptyState icon={FiUsers} title="No users found" description="No users registered on this platform." />
      ) : (
        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2"><FiUsers /> All Users ({users.length})</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-700/50">
                <tr>
                  {['User', 'Email', 'Role', 'Joined', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <motion.tr key={u.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                    className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                          {u.username?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{u.first_name} {u.last_name}</p>
                          <p className="text-xs text-slate-400">@{u.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-400">{u.email}</td>
                    <td className="px-5 py-4">
                      {editId === u.id ? (
                        <div className="flex items-center gap-2">
                          <select className="input py-1 text-xs" value={editRole} onChange={e => setEditRole(e.target.value)}>
                            <option value="admin">Admin</option>
                            <option value="manager">Manager</option>
                            <option value="analyst">Analyst</option>
                          </select>
                          <button onClick={() => handleRoleUpdate(u.id)} className="p-1 rounded text-green-500 hover:bg-green-50"><FiCheck /></button>
                          <button onClick={() => setEditId(null)} className="p-1 rounded text-red-500 hover:bg-red-50"><FiX /></button>
                        </div>
                      ) : (
                        <span className={`badge ${roleColors[u.role]} capitalize`}>{u.role}</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-500">{u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}</td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        {u.id !== user.id && (
                          <>
                            <button onClick={() => { setEditId(u.id); setEditRole(u.role) }}
                              className="p-1.5 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 text-slate-400 hover:text-primary-600 transition-colors" title="Edit role">
                              <FiEdit2 className="text-sm" />
                            </button>
                            <button onClick={() => setDeleteId(u.id)}
                              className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 transition-colors" title="Delete user">
                              <FiTrash2 className="text-sm" />
                            </button>
                          </>
                        )}
                        {u.id === user.id && <span className="text-xs text-slate-400">(You)</span>}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmDialog open={!!deleteId} title="Delete User"
        message="This will permanently delete this user and all their data. This action cannot be undone."
        onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </div>
  )
}
