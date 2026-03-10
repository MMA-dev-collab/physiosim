import React, { useEffect, useState } from 'react'
import { API_BASE_URL } from '../../config'
import { useToast } from '../../context/ToastContext'

export default function CaseAccessTab({ auth }) {
  const { toast } = useToast()
  const [cases, setCases] = useState([])
  const [categories, setCategories] = useState([])
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null)

  // Filters
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [accessFilter, setAccessFilter] = useState('all')

  // Load Data
  const loadCases = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/cases`, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
          'ngrok-skip-browser-warning': 'true'
        },
      })
      const data = await res.json()
      if (res.ok) setCases(data)
    } catch (e) {
      toast.error('Failed to load cases')
    } finally {
      setLoading(false)
    }
  }

  const loadPlans = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/subscription-plans`, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
          'ngrok-skip-browser-warning': 'true'
        },
      })
      const data = await res.json()
      if (res.ok) setPlans(data)
    } catch (e) {
      console.error('Failed to load plans:', e)
    }
  }

  useEffect(() => {
    loadCases()
    loadPlans()
    fetch(`${API_BASE_URL}/api/categories`, {
      headers: { 'ngrok-skip-browser-warning': 'true' }
    })
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(e => console.error(e))
  }, [])

  // Update case access - Refactored for Plan-based Access
  const handleAccessUpdate = async (caseId, updates) => {
    setUpdating(caseId)
    try {
      const caseData = cases.find(c => c.id === caseId)
      if (!caseData) throw new Error('Case not found')

      // Step count validation for activation
      if (updates.status === 'published' && (caseData.stepCount || 0) < 3) {
        throw new Error('the case is drafted')
      }

      // Validate plan and constraints
      if (updates.requiredPlanId) {
        const selectedPlan = plans.find(p => p.id === updates.requiredPlanId)
        if (!selectedPlan) {
          throw new Error('Cannot assign case to deactivated plan. Please select an active plan.')
        }

        // Limit Check
        if (selectedPlan.maxFreeCases !== null && selectedPlan.maxFreeCases !== undefined && selectedPlan.maxFreeCases !== '') {
          const limit = parseInt(selectedPlan.maxFreeCases);
          const currentUsage = cases.filter(c => c.requiredPlanId === selectedPlan.id && c.status === 'published').length;
          const isActivating = (updates.status === 'published' || (updates.status === undefined && caseData.status === 'published'));

          if (isActivating && (caseData.requiredPlanId !== selectedPlan.id || caseData.status !== 'published')) {
            if (currentUsage >= limit) {
              throw new Error(`Limit reached: The plan "${selectedPlan.name}" only allows a maximum of ${limit} assigned cases.`)
            }
          }
        }
      }

      const updateData = { ...caseData, ...updates }

      const res = await fetch(`${API_BASE_URL}/api/admin/cases/${caseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify(updateData)
      })

      if (res.ok) {
        if (updates.status === 'published') {
          toast.success('the case is puplished')
        } else if (updates.status === 'draft') {
          toast.success('the case is drafted')
        } else {
          toast.success('Case updated successfully')
        }
        setCases(cases.map(c =>
          c.id === caseId ? { ...c, ...updateData } : c
        ))
      } else {
        const error = await res.json()
        throw new Error(error.message || 'Failed to update')
      }
    } catch (e) {
      if (e.message.toLowerCase().includes('steps') || e.message.toLowerCase().includes('drafted')) {
        toast.error('the case is drafted')
      } else {
        toast.error(e.message || 'Failed to update case access')
      }
    } finally {
      setUpdating(null)
    }
  }

  // Filter Logic
  const filteredCases = cases.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = categoryFilter === 'all' ||
      (c.categoryId && c.categoryId.toString() === categoryFilter) ||
      (!c.categoryId && c.category === categories.find(cat => cat.id.toString() === categoryFilter)?.name)

    const matchesAccess = (() => {
      if (accessFilter === 'all') return true
      if (accessFilter === 'none') return !c.requiredPlanId
      return c.requiredPlanId === Number(accessFilter)
    })()

    return matchesSearch && matchesCategory && matchesAccess
  })

  // Check if a plan can access a case based on hierarchy
  const canPlanAccessCase = (plan, caseData) => {
    if (!caseData.requiredPlanId) return true
    if (caseData.requiredPlanId === plan.id) return true

    const planHierarchy = { 'normal': 1, 'custom': 1.5, 'premium': 2, 'ultra': 3 }
    const userPlanLevel = planHierarchy[plan.role] || 1
    const requiredPlanLevel = planHierarchy[caseData.requiredPlanRole] || 1

    if (plan.role === 'premium' || plan.role === 'ultra') {
      return userPlanLevel >= requiredPlanLevel
    }
    if (plan.role === caseData.requiredPlanRole) return true;
    return caseData.requiredPlanRole === 'normal';
  }

  const getAccessBadge = (caseData) => {
    const planId = caseData.requiredPlanId;
    if (!planId) return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-admin-success-soft text-admin-success border border-admin-success/10">🆓 Normal</span>;

    const plan = plans.find(p => p.id === planId) || {
      name: caseData.requiredPlanName || 'Unknown Plan',
      role: caseData.requiredPlanRole || 'custom',
      isActive: false
    };

    const isDeactivated = !plan.isActive;
    const name = isDeactivated ? `${plan.name} (Inactive)` : plan.name;

    const styles = {
      premium: 'bg-admin-primary-soft text-admin-primary border-admin-primary/10',
      normal: 'bg-admin-success-soft text-admin-success border-admin-success/10',
      ultra: 'bg-admin-accent/10 text-admin-accent border-admin-accent/10',
    }
    const style = styles[plan.role] || 'bg-admin-bg text-admin-text-muted border-admin-border'
    const icon = plan.role === 'premium' ? '🔒' : plan.role === 'normal' ? '🆓' : '⭐'

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${style} border ${isDeactivated ? 'opacity-70 border-dashed' : ''}`}>
        {icon} {name}
      </span>
    )
  }

  if (loading) return (
    <div className="p-8 animate-pulse space-y-4">
      <div className="h-8 w-64 bg-slate-200 rounded-lg" />
      <div className="flex gap-3">
        {[1, 2, 3].map(i => <div key={i} className="h-10 w-40 bg-slate-200 rounded-lg" />)}
      </div>
      <div className="flex gap-6">
        <div className="w-1/4 space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-24 bg-slate-200 rounded-xl" />)}
        </div>
        <div className="flex-1 h-80 bg-slate-200 rounded-xl" />
      </div>
    </div>
  )

  return (
    <div className="p-8 bg-admin-bg min-h-full">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-black tracking-tight text-admin-text">Access Management</h2>
        <p className="text-admin-text-muted mt-1">Configure simulation case availability across subscription tiers.</p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="relative w-72">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-admin-text-muted text-lg">search</span>
          <input
            className="w-full pl-10 pr-4 py-2 bg-admin-card border border-admin-border rounded-lg text-sm focus:ring-2 focus:ring-admin-primary/10 text-admin-text placeholder:text-admin-text-muted shadow-sm"
            placeholder="Search cases..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-admin-card border border-admin-border rounded-lg text-xs font-bold py-2 pl-3 pr-8 focus:ring-2 focus:ring-admin-primary/10 text-admin-text shadow-sm cursor-pointer"
        >
          <option value="all">All Categories</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
          ))}
        </select>
        <select
          value={accessFilter}
          onChange={(e) => setAccessFilter(e.target.value)}
          className="bg-admin-card border border-admin-border rounded-lg text-xs font-bold py-2 pl-3 pr-8 focus:ring-2 focus:ring-admin-primary/10 text-admin-text shadow-sm cursor-pointer"
        >
          <option value="all">All Plans</option>
          <option value="none">No Plan (Public)</option>
          {plans.filter(p => p.isActive).map(p => (
            <option key={p.id} value={p.id}>
              {p.role === 'premium' ? '🔒' : p.role === 'normal' ? '🆓' : '⭐'} {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* Vertical Layout */}
      <div className="flex flex-col gap-8">
        {/* Top: Plan Cards */}
        <div className="w-full">
          <h3 className="text-xs font-bold uppercase tracking-wider text-admin-text-muted px-1 mb-4">Subscription Plans</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {plans.filter(p => p.isActive).map(plan => (
              <div key={plan.id} className="p-4 bg-admin-card border border-admin-border rounded-xl hover:border-admin-primary transition-colors shadow-admin-card flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${plan.role === 'premium' ? 'bg-admin-primary/10 text-admin-primary' : 'bg-admin-bg text-admin-text-muted border border-admin-border'
                      }`}>
                      {plan.role}
                    </span>
                    <span className="text-lg font-black text-admin-text">${parseFloat(plan.price || 0).toFixed(0)}</span>
                  </div>
                  <h4 className="text-base font-bold text-admin-text">{plan.name}</h4>
                </div>
                <p className="text-xs text-admin-text-muted mt-2 font-medium">
                  {(() => {
                    const accessibleCases = cases.filter(c => canPlanAccessCase(plan, c) && c.status === 'published');
                    let count = accessibleCases.length;
                    if (plan.maxFreeCases !== null && plan.maxFreeCases !== undefined && plan.maxFreeCases !== '') {
                      const limit = parseInt(plan.maxFreeCases);
                      if (!isNaN(limit) && count > limit) count = limit;
                    }
                    if (plan.role === 'normal' || plan.name === 'Normal') return `${count} Free Cases`;
                    if (plan.role === 'premium') return `${count} Cases (All Access)`;
                    return `${count} Cases (Includes Free)`;
                  })()}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom: Access Table */}
        <div className="flex-1 bg-admin-card rounded-xl border border-admin-border flex flex-col shadow-admin-card overflow-hidden">
          <div className="p-6 border-b border-admin-border bg-admin-bg/30">
            <h3 className="text-lg font-bold text-admin-text">Case Access Matrix</h3>
            <p className="text-xs text-admin-text-muted mb-4 font-medium">Assign cases to plans and manage publish status.</p>
            <div className="bg-admin-warning-soft border border-admin-warning/20 text-admin-warning rounded-lg p-3 text-xs flex items-center gap-2 font-bold">
              <span className="material-symbols-outlined text-[16px]">info</span>
              <span><strong>Note:</strong> Due to current system architecture, only <strong>one plan</strong> can be assigned per case. Turning on a plan will automatically remove the case from other plans.</span>
            </div>
          </div>
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead className="sticky top-0 bg-admin-card z-10 shadow-sm">
                <tr className="border-b border-admin-border bg-admin-bg/50">
                  <th className="py-3 px-4 text-xs font-bold text-admin-text-muted uppercase tracking-wider">Case</th>
                  <th className="py-3 px-4 text-xs font-bold text-admin-text-muted uppercase tracking-wider">Category</th>
                  <th className="py-3 px-4 text-xs font-bold text-admin-text-muted uppercase tracking-wider">Access Level</th>
                  <th className="py-3 px-4 text-xs font-bold text-admin-text-muted uppercase tracking-wider">Plan</th>
                  <th className="py-3 px-4 text-xs font-bold text-admin-text-muted uppercase tracking-wider">Status</th>
                  <th className="py-3 px-4 text-xs font-bold text-admin-text-muted uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-admin-border/50">
                {filteredCases.map(c => (
                  <tr key={c.id} className={`hover:bg-admin-bg/50 transition-colors ${updating === c.id ? 'opacity-50' : ''}`}>
                    <td className="py-3 px-4">
                      <p className="text-sm font-bold text-admin-text">{c.title}</p>
                      <p className="text-[10px] text-admin-text-muted font-medium">{c.difficulty} • {c.duration} min • {c.stepCount || 0} steps</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs font-bold text-admin-text-muted bg-admin-bg border border-admin-border/50 px-2 py-1 rounded-md">
                        {c.categoryIcon} {c.categoryName || c.category || 'N/A'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {getAccessBadge(c)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2 flex-wrap max-w-sm">
                        {/* Normal / Free Toggle */}
                        <button
                          onClick={() => handleAccessUpdate(c.id, { requiredPlanId: null })}
                          disabled={updating === c.id || !c.requiredPlanId} // Disabled if already Free
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition-all whitespace-nowrap border ${!c.requiredPlanId
                            ? 'bg-admin-success text-white border-admin-success shadow-sm'
                            : 'bg-admin-card text-admin-text-muted border-admin-border hover:border-admin-success/50 hover:text-admin-success'
                            } ${updating === c.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${!c.requiredPlanId ? 'bg-white' : 'bg-admin-success'}`} />
                          Free
                        </button>

                        {/* Toggles for Active Subscription Plans */}
                        {plans.filter(p => p.isActive || p.id === c.requiredPlanId).map(p => {
                          const isActive = c.requiredPlanId === p.id;
                          return (
                            <button
                              key={p.id}
                              onClick={() => handleAccessUpdate(c.id, { requiredPlanId: isActive ? null : p.id })}
                              disabled={updating === c.id || !p.isActive}
                              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition-all whitespace-nowrap border ${isActive
                                ? 'bg-admin-primary text-white border-admin-primary shadow-sm'
                                : 'bg-admin-card text-admin-text-muted border-admin-border hover:border-admin-primary/50 hover:text-admin-primary'
                                } ${updating === c.id || !p.isActive ? 'opacity-50 cursor-not-allowed' : ''}`}
                              title={!p.isActive ? 'Plan is currently inactive' : `Assign to ${p.name}`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-white' : 'bg-admin-primary'}`} />
                              {p.name}
                            </button>
                          )
                        })}
                        {updating === c.id && (
                          <svg className="animate-spin h-3 w-3 text-admin-primary ml-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${c.status === 'published'
                        ? 'bg-admin-success-soft text-admin-success'
                        : 'bg-admin-warning-soft text-admin-warning'
                        }`}>
                        {c.status === 'published' ? 'Active' : 'Draft'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {c.status !== 'published' ? (
                        <button
                          onClick={() => handleAccessUpdate(c.id, { status: 'published' })}
                          disabled={updating === c.id || (c.stepCount || 0) < 3}
                          title={(c.stepCount || 0) < 3 ? 'Need at least 3 steps to activate' : ''}
                          className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors ${(c.stepCount || 0) < 3
                            ? 'bg-admin-bg text-admin-text-muted border border-admin-border cursor-not-allowed'
                            : 'bg-admin-accent text-white hover:bg-admin-accent/90 shadow-sm'
                            } ${updating === c.id ? 'opacity-50' : ''}`}
                        >
                          {updating === c.id ? '...' : 'Activate'}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleAccessUpdate(c.id, { status: 'draft' })}
                          disabled={updating === c.id}
                          className={`px-3 py-1.5 rounded-lg text-[11px] font-bold bg-admin-bg text-admin-text-muted border border-admin-border hover:bg-admin-card transition-colors ${updating === c.id ? 'opacity-50' : ''}`}
                        >
                          {updating === c.id ? '...' : 'Set to Draft'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredCases.length === 0 && !loading && (
              <div className="py-12 text-center">
                <span className="material-symbols-outlined text-4xl text-slate-300 mb-2 block">search_off</span>
                <p className="text-slate-400 text-sm">No cases found matching your filters.</p>
              </div>
            )}
          </div>
          {/* Footer Legend */}
          <div className="p-4 bg-admin-bg/50 border-t border-admin-border flex justify-between items-center shrink-0">
            <p className="text-[11px] text-admin-text-muted italic font-medium">Access changes take effect immediately for all active subscribers.</p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-admin-accent shadow-sm" />
                <span className="text-[11px] font-bold text-admin-text">Enabled</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-admin-border shadow-sm" />
                <span className="text-[11px] font-bold text-admin-text-muted">Disabled</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
