import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { scenariosAPI, predictionsAPI } from '../services/api'
import { PageHeader, LoadingSpinner, EmptyState } from '../components/UI'
import { FiZap, FiTrendingUp, FiTrendingDown, FiMinus } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const SliderField = ({ label, value, min, max, step, unit, onChange, color = 'from-primary-500 to-purple-600' }) => (
  <div className="space-y-2">
    <div className="flex justify-between items-center">
      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">{label}</label>
      <span className={`text-sm font-bold bg-gradient-to-r ${color} bg-clip-text text-transparent`}>{unit}{Number(value).toLocaleString()}</span>
    </div>
    <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(Number(e.target.value))} className="w-full" />
    <div className="flex justify-between text-xs text-slate-400">
      <span>{unit}{Number(min).toLocaleString()}</span>
      <span>{unit}{Number(max).toLocaleString()}</span>
    </div>
  </div>
)

export default function Simulator() {
  const [predictions, setPredictions] = useState([])
  const [scenarios, setScenarios]     = useState([])
  const [loading, setLoading]         = useState(false)
  const [simulating, setSimulating]   = useState(false)
  const [result, setResult]           = useState(null)
  const [form, setForm] = useState({
    prediction_id: '', name: '',
    marketing_budget: 200000,
    product_price: 5000,
    discount_percent: 10,
    expected_demand: 500,
  })

  useEffect(() => {
    setLoading(true)
    Promise.all([predictionsAPI.list(), scenariosAPI.list()])
      .then(([pRes, sRes]) => {
        const pList = pRes.data.results || pRes.data
        setPredictions(pList)
        setScenarios(sRes.data.results || sRes.data)
        if (pList.length > 0) setForm(f => ({ ...f, prediction_id: pList[0].id }))
      }).finally(() => setLoading(false))
  }, [])

  const handleSimulate = async (e) => {
    e.preventDefault()
    if (!form.prediction_id) { toast.error('Please select a prediction first'); return }
    setSimulating(true)
    try {
      const res = await scenariosAPI.simulate({ ...form, name: form.name || `Scenario ${scenarios.length + 1}` })
      setResult(res.data.scenario)
      setScenarios(prev => [res.data.scenario, ...prev])
      toast.success('Simulation complete! 📊')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Simulation failed')
    } finally { setSimulating(false) }
  }

  const DiffIcon = ({ diff }) => {
    if (diff > 0) return <FiTrendingUp className="text-green-500 text-xl" />
    if (diff < 0) return <FiTrendingDown className="text-red-500 text-xl" />
    return <FiMinus className="text-slate-400 text-xl" />
  }

  const comparisonChart = result ? {
    labels: ['Base Revenue', 'Simulated Revenue'],
    datasets: [{
      data: [result.base_revenue, result.simulated_revenue],
      backgroundColor: ['#3b82f6', '#8b5cf6'],
      borderRadius: 10,
    }]
  } : null

  return (
    <div className="space-y-6">
      <PageHeader title="Scenario Simulator" subtitle="Adjust business parameters and predict revenue impact" icon={FiZap} />

      {loading ? <LoadingSpinner /> : predictions.length === 0 ? (
        <EmptyState icon={FiZap} title="No predictions available"
          description="You need at least one prediction to run scenario simulations."
          action={<Link to="/predictions" className="btn-primary">Run a Prediction</Link>} />
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Simulator form */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <form onSubmit={handleSimulate} className="card p-6 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Configure Scenario</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Adjust the sliders to simulate different business scenarios</p>
              </div>

              <div>
                <label className="label">Scenario Name</label>
                <input className="input" placeholder="e.g. High Budget Campaign"
                  value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>

              <div>
                <label className="label">Base Prediction</label>
                <select className="input" value={form.prediction_id} onChange={e => setForm({ ...form, prediction_id: Number(e.target.value) })}>
                  {predictions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>

              <div className="space-y-5 pt-2">
                <SliderField label="💰 Marketing Budget" value={form.marketing_budget} min={10000} max={1000000} step={10000} unit="₹"
                  onChange={v => setForm(f => ({ ...f, marketing_budget: v }))} color="from-blue-500 to-blue-700" />
                <SliderField label="🏷️ Product Price" value={form.product_price} min={100} max={100000} step={100} unit="₹"
                  onChange={v => setForm(f => ({ ...f, product_price: v }))} color="from-purple-500 to-purple-700" />
                <SliderField label="🎁 Discount %" value={form.discount_percent} min={0} max={50} step={1} unit=""
                  onChange={v => setForm(f => ({ ...f, discount_percent: v }))} color="from-green-500 to-emerald-600" />
                <SliderField label="📦 Expected Demand (units)" value={form.expected_demand} min={50} max={5000} step={50} unit=""
                  onChange={v => setForm(f => ({ ...f, expected_demand: v }))} color="from-orange-400 to-orange-600" />
              </div>

              <button type="submit" disabled={simulating} className="btn-primary w-full flex items-center justify-center gap-2">
                {simulating ? <><div className="spinner" /> Simulating...</> : <><FiZap /> Run Simulation</>}
              </button>
            </form>
          </motion.div>

          {/* Results panel */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
            {result ? (
              <>
                {/* KPI Result */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="card p-4 text-center">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Base Revenue</p>
                    <p className="font-bold text-slate-800 dark:text-white text-lg">₹{result.base_revenue?.toLocaleString()}</p>
                  </div>
                  <div className="card p-4 text-center">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Simulated</p>
                    <p className="font-bold text-purple-600 dark:text-purple-400 text-lg">₹{result.simulated_revenue?.toLocaleString()}</p>
                  </div>
                  <div className="card p-4 text-center">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Change</p>
                    <div className="flex items-center justify-center gap-1">
                      <DiffIcon diff={result.revenue_difference} />
                      <p className={`font-bold text-lg ${result.revenue_difference > 0 ? 'text-green-500' : result.revenue_difference < 0 ? 'text-red-500' : 'text-slate-500'}`}>
                        {result.revenue_change_percent > 0 ? '+' : ''}{result.revenue_change_percent?.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>

                {/* Comparison chart */}
                <div className="card p-5">
                  <h4 className="font-bold text-slate-800 dark:text-white mb-4">Revenue Comparison</h4>
                  <Bar data={comparisonChart} options={{
                    responsive: true,
                    plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => `₹${Number(c.raw).toLocaleString()}` } } },
                    scales: { y: { ticks: { callback: v => `₹${(v/1000).toFixed(0)}K` }, grid: { color: 'rgba(148,163,184,0.1)' } }, x: { grid: { display: false } } }
                  }} />
                </div>

                {/* Impact breakdown */}
                {result.simulation_details && (
                  <div className="card p-5">
                    <h4 className="font-bold text-slate-800 dark:text-white mb-3">Impact Breakdown</h4>
                    <div className="space-y-2">
                      {[
                        { label: 'Marketing Impact', value: result.simulation_details.marketing_impact, icon: '💰' },
                        { label: 'Discount Impact',  value: result.simulation_details.discount_impact,  icon: '🎁' },
                        { label: 'Demand Impact',    value: result.simulation_details.demand_impact,    icon: '📦' },
                      ].map(({ label, value, icon }) => (
                        <div key={label} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700 last:border-0">
                          <span className="text-sm text-slate-600 dark:text-slate-400">{icon} {label}</span>
                          <span className={`text-sm font-bold ${value > 0 ? 'text-green-500' : value < 0 ? 'text-red-500' : 'text-slate-400'}`}>
                            {value > 0 ? '+' : ''}{value?.toFixed(1)}%
                          </span>
                        </div>
                      ))}
                      <div className="flex items-center justify-between py-2">
                        <span className="text-sm text-slate-600 dark:text-slate-400">💲 Effective Price</span>
                        <span className="text-sm font-bold text-primary-600 dark:text-primary-400">₹{result.simulation_details.effective_price?.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="card p-10 flex flex-col items-center justify-center text-center gap-4 h-80">
                <div className="w-16 h-16 rounded-2xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
                  <FiZap className="text-primary-400 text-3xl" />
                </div>
                <p className="font-semibold text-slate-600 dark:text-slate-400">Run a simulation to see results</p>
                <p className="text-sm text-slate-400">Adjust the sliders on the left and click Run Simulation</p>
              </div>
            )}

            {/* Recent scenarios */}
            {scenarios.length > 0 && (
              <div className="card p-5">
                <h4 className="font-bold text-slate-800 dark:text-white mb-3">Recent Scenarios</h4>
                <div className="space-y-2">
                  {scenarios.slice(0, 5).map(s => (
                    <div key={s.id} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{s.name}</p>
                        <p className="text-xs text-slate-400">{new Date(s.created_at).toLocaleDateString()}</p>
                      </div>
                      <span className={`text-sm font-bold ${s.revenue_change_percent > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {s.revenue_change_percent > 0 ? '+' : ''}{s.revenue_change_percent?.toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  )
}
