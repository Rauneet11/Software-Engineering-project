import React, { useState } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import {
  FiGrid, FiUpload, FiTrendingUp, FiBarChart2, FiZap,
  FiClock, FiFileText, FiUser, FiSettings, FiLogOut,
  FiSun, FiMoon, FiMenu, FiX, FiShield, FiDatabase,
  FiChevronRight, FiBell
} from 'react-icons/fi'
import { BsGraphUpArrow } from 'react-icons/bs'
import toast from 'react-hot-toast'

const NAV_ITEMS = [
  { to: '/dashboard',       label: 'Dashboard',       icon: FiGrid,         roles: ['admin','manager','analyst'] },
  { to: '/upload',          label: 'Upload Dataset',  icon: FiUpload,       roles: ['admin','manager'] },
  { to: '/predictions',     label: 'Predictions',     icon: FiTrendingUp,   roles: ['admin','manager','analyst'] },
  { to: '/forecast',        label: 'Forecast Charts', icon: FiBarChart2,    roles: ['admin','manager','analyst'] },
  { to: '/simulator',       label: 'Scenario Sim',    icon: FiZap,          roles: ['admin','analyst'] },
  { to: '/recommendations', label: 'AI Insights',     icon: BsGraphUpArrow, roles: ['admin','manager','analyst'] },
  { to: '/history',         label: 'History',         icon: FiClock,        roles: ['admin','manager','analyst'] },
  { to: '/reports',         label: 'Reports',         icon: FiFileText,     roles: ['admin','manager','analyst'] },
  { to: '/admin-panel',     label: 'Admin Panel',     icon: FiShield,       roles: ['admin'] },
]

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const { dark, toggle } = useTheme()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileSidebar, setMobileSidebar] = useState(false)

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  const visibleNav = NAV_ITEMS.filter(item => item.roles.includes(user?.role))

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-6 border-b border-white/10">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-400 to-purple-600 flex items-center justify-center shadow-lg">
          <BsGraphUpArrow className="text-white text-lg" />
        </div>
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="overflow-hidden"
            >
              <p className="font-bold text-white text-sm leading-tight">SalesCast AI</p>
              <p className="text-white/50 text-xs">Revenue Forecasting</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {visibleNav.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setMobileSidebar(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium group ${
                isActive
                  ? 'bg-white/15 text-white shadow-sm'
                  : 'text-white/60 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={`text-lg flex-shrink-0 ${isActive ? 'text-white' : 'text-white/60 group-hover:text-white'}`} />
                <AnimatePresence>
                  {sidebarOpen && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="truncate"
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {isActive && sidebarOpen && (
                  <FiChevronRight className="ml-auto text-white/50 text-xs" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User area */}
      <div className="p-3 border-t border-white/10 space-y-1">
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              isActive ? 'bg-white/15 text-white' : 'text-white/60 hover:bg-white/10 hover:text-white'
            }`
          }
        >
          {user?.profile_photo
            ? <img src={user.profile_photo} className="w-7 h-7 rounded-full object-cover border border-white/20" alt="avatar" />
            : <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">{user?.username?.[0]?.toUpperCase()}</div>
          }
          {sidebarOpen && (
            <div className="overflow-hidden">
              <p className="text-white text-sm font-medium truncate">{user?.username}</p>
              <p className="text-white/40 text-xs capitalize">{user?.role}</p>
            </div>
          )}
        </NavLink>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-all duration-200"
        >
          <FiLogOut className="text-lg flex-shrink-0" />
          {sidebarOpen && <span>Logout</span>}
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: sidebarOpen ? 240 : 72 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="hidden md:flex flex-col flex-shrink-0 bg-gradient-to-b from-slate-900 via-primary-950 to-slate-900 overflow-hidden relative z-10 shadow-2xl"
        style={{ background: 'linear-gradient(180deg, #0f172a 0%, #1e3a8a 50%, #0f172a 100%)' }}
      >
        <SidebarContent />
        {/* Collapse toggle */}
        <button
          onClick={() => setSidebarOpen(s => !s)}
          className="absolute top-5 -right-3.5 w-7 h-7 bg-primary-500 rounded-full flex items-center justify-center shadow-lg hover:bg-primary-600 transition-colors z-20"
        >
          <motion.div animate={{ rotate: sidebarOpen ? 0 : 180 }}>
            <FiChevronRight className="text-white text-xs" />
          </motion.div>
        </button>
      </motion.aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileSidebar && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileSidebar(false)}
              className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="md:hidden fixed left-0 top-0 bottom-0 w-64 z-50 shadow-2xl"
              style={{ background: 'linear-gradient(180deg, #0f172a 0%, #1e3a8a 50%, #0f172a 100%)' }}
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Topbar */}
        <header className="h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-700/50 flex items-center px-4 md:px-6 gap-4 flex-shrink-0 z-10">
          <button
            onClick={() => setMobileSidebar(true)}
            className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <FiMenu className="text-slate-600 dark:text-slate-300 text-xl" />
          </button>

          {/* Breadcrumb / page title */}
          <div className="flex-1" />

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggle}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all"
              title="Toggle dark mode"
            >
              {dark ? <FiSun className="text-lg" /> : <FiMoon className="text-lg" />}
            </button>
            <button className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all relative">
              <FiBell className="text-lg" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <NavLink to="/profile" className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-700 ml-1">
              {user?.profile_photo
                ? <img src={user.profile_photo} className="w-8 h-8 rounded-full object-cover" alt="" />
                : <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">{user?.username?.[0]?.toUpperCase()}</div>
              }
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-tight">{user?.first_name || user?.username}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{user?.role}</p>
              </div>
            </NavLink>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  )
}
