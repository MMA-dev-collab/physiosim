import React, { useEffect, useState } from 'react'
import { API_BASE_URL } from '../../config'
import { useToast } from '../../context/ToastContext'
import ConfirmationModal from '../common/ConfirmationModal'

export default function SubscriptionPlansTab({ auth }) {
  const { toast } = useToast()
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingPlan, setEditingPlan] = useState(null)

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false, title: '', message: '', onConfirm: () => { }, isDanger: false
  })
  const [formData, setFormData] = useState({
    name: '', price: '', durationYears: '', durationDays: '', durationHours: '',
    maxFreeCases: '0', description: '', features: [], isActive: true, isPremium: false,
    isUnlimited: false, newFeature: ''
  })

  useEffect(() => { loadPlans() }, [auth])

  const loadPlans = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/subscription-plans`, {
        headers: { Authorization: `Bearer ${auth.token}`, 'ngrok-skip-browser-warning': 'true' }
      })
      if (!res.ok) { const error = await res.json(); throw new Error(error.message || `HTTP ${res.status}`) }
      const data = await res.json()
      setPlans(data || [])
      setLoading(false)
    } catch (err) {
      console.error('Error loading plans:', err)
      toast.error(`Failed to load plans: ${err.message}`)
      setPlans([])
      setLoading(false)
    }
  }

  const handleOpenModal = (plan = null) => {
    try {
      if (plan) {
        setEditingPlan(plan)
        const totalDays = plan.durationDays || 0
        const years = Math.floor(totalDays / 365)
        const dayRemainder = totalDays % 365
        const days = Math.floor(dayRemainder)
        const hours = Math.round((dayRemainder - days) * 24)
        setFormData({
          name: plan.name || '', price: plan.price || '',
          durationYears: years > 0 ? years.toString() : '',
          durationDays: days > 0 ? days.toString() : '',
          durationHours: hours > 0 ? hours.toString() : '',
          maxFreeCases: plan.maxFreeCases === null || plan.maxFreeCases === undefined ? '' : plan.maxFreeCases.toString(),
          description: plan.description || '',
          features: Array.isArray(plan.features) ? plan.features : [],
          isActive: plan.isActive !== undefined ? !!plan.isActive : true,
          isPremium: plan.role === 'premium',
          isUnlimited: parseInt(plan.durationDays) >= 36500,
          newFeature: ''
        })
      } else {
        setEditingPlan(null)
        setFormData({
          name: '', price: '', durationYears: '', durationDays: '', durationHours: '',
          maxFreeCases: '0', description: '', features: [], isActive: true, isPremium: false, newFeature: ''
        })
      }
      setShowModal(true)
    } catch (err) {
      console.error('Error opening modal:', err)
      toast.error(`Error opening form: ${err.message}`)
    }
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingPlan(null)
    setFormData({
      name: '', price: '', durationYears: '', durationDays: '', durationHours: '',
      maxFreeCases: '0', description: '', features: [], isActive: true, isPremium: false,
      isUnlimited: false, newFeature: ''
    })
  }

  const handleAddFeature = () => {
    if (formData.newFeature.trim()) {
      setFormData({ ...formData, features: [...formData.features, formData.newFeature.trim()], newFeature: '' })
    }
  }

  const handleRemoveFeature = (index) => {
    setFormData({ ...formData, features: formData.features.filter((_, i) => i !== index) })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (loading) return
    setLoading(true)

    if (!formData.name || formData.name.trim() === '') { toast.error('Plan name is required'); setLoading(false); return }
    if (!formData.price || formData.price === '') { toast.error('Price is required'); setLoading(false); return }

    const years = parseInt(formData.durationYears) || 0
    const days = parseInt(formData.durationDays) || 0
    const hours = parseInt(formData.durationHours) || 0
    if (years === 0 && days === 0 && hours === 0) { toast.error('Please specify at least one duration (years, days, or hours)'); setLoading(false); return }

    const price = parseFloat(formData.price)
    if (isNaN(price) || price < 0) { toast.error('Price must be a valid number (0 or greater)'); setLoading(false); return }

    let totalDays = 0; let finalDays = 0;
    if (formData.isUnlimited) { finalDays = 36500 }
    else { totalDays = (years * 365) + days + (hours / 24); finalDays = parseFloat(totalDays.toFixed(4)); }

    if (finalDays > 36500) { toast.error('Duration is too long'); setLoading(false); return }

    let maxCases = null;
    if (formData.maxFreeCases && formData.maxFreeCases.trim() !== '') {
      const parsed = parseInt(formData.maxFreeCases);
      if (isNaN(parsed) || parsed < 0) { toast.error('Max Free Cases must be empty (unlimited) or a number >= 0'); setLoading(false); return }
      maxCases = parsed;
    } else { maxCases = null; }

    try {
      const url = editingPlan ? `${API_BASE_URL}/api/admin/subscription-plans/${editingPlan.id}` : `${API_BASE_URL}/api/admin/subscription-plans`
      const method = editingPlan ? 'PUT' : 'POST'

      const requestBody = {
        name: formData.name.trim(), price: price, durationDays: finalDays,
        duration_value: finalDays, duration_unit: 'day', maxFreeCases: maxCases
      }
      if (formData.description && formData.description.trim()) requestBody.description = formData.description.trim()
      if (formData.features && Array.isArray(formData.features) && formData.features.length > 0) requestBody.features = formData.features
      if (formData.isActive !== undefined) requestBody.isActive = formData.isActive

      if (formData.isPremium) { requestBody.role = 'premium'; }
      else {
        const preservedRoles = ['normal', 'ultra'];
        if (editingPlan && preservedRoles.includes(editingPlan.role)) { requestBody.role = editingPlan.role; }
        else { requestBody.role = 'custom'; }
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${auth.token}`, 'ngrok-skip-browser-warning': 'true' },
        body: JSON.stringify(requestBody)
      })

      const responseData = await res.json()
      if (res.ok) {
        toast.success(editingPlan ? 'Plan updated successfully' : 'Plan created successfully')
        setTimeout(() => { handleCloseModal(); loadPlans(); setLoading(false) }, 500)
      } else {
        const errorMsg = responseData.message || responseData.error || `HTTP ${res.status}: Failed to save plan`
        toast.error(errorMsg)
        setLoading(false)
      }
    } catch (err) {
      const errorMsg = err.message || 'Network error. Please check your connection.'
      toast.error(`Failed to save plan: ${errorMsg}`)
      setLoading(false)
    }
  }

  const confirmDelete = (planId, plan) => {
    const isCore = plan?.name === 'Normal' || (plan?.name === 'Premium' && plan?.role === 'premium');
    if (isCore) { toast.error('Cannot delete core plans. Deactivate instead.'); return }
    setConfirmModal({
      isOpen: true, title: 'Delete Subscription Plan?',
      message: `Are you sure you want to delete the plan "${plan?.name || 'Unknown'}"? This action cannot be undone.`,
      isDanger: true, onConfirm: () => { handleDelete(planId); setConfirmModal(prev => ({ ...prev, isOpen: false })) }
    })
  }

  const handleDelete = async (planId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/subscription-plans/${planId}`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${auth.token}`, 'ngrok-skip-browser-warning': 'true' }
      })
      if (res.ok) { toast.success('Plan deleted successfully'); loadPlans() }
      else { const error = await res.json(); toast.error(error.message || 'Failed to delete plan') }
    } catch (err) { toast.error('Failed to delete plan') }
  }

  const confirmToggleActive = (plan) => {
    setConfirmModal({
      isOpen: true, title: `${plan.isActive ? 'Deactivate' : 'Activate'} Plan?`,
      message: `Are you sure you want to ${plan.isActive ? 'deactivate' : 'activate'} the plan "${plan.name}"?`,
      isDanger: plan.isActive,
      onConfirm: () => { toggleActive(plan); setConfirmModal(prev => ({ ...prev, isOpen: false })) }
    })
  }

  const toggleActive = async (plan) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/subscription-plans/${plan.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${auth.token}`, 'ngrok-skip-browser-warning': 'true' },
        body: JSON.stringify({ isActive: !plan.isActive })
      })
      if (res.ok) { toast.success(`Plan ${!plan.isActive ? 'activated' : 'deactivated'} successfully`); loadPlans() }
      else toast.error('Failed to update plan')
    } catch (err) { toast.error('Failed to update plan') }
  }

  const formatDuration = (plan) => {
    const totalDays = plan.durationDays || 0;
    if (totalDays >= 36500) return 'Unlimited';
    const years = Math.floor(totalDays / 365);
    const dayRemainder = totalDays % 365;
    const days = Math.floor(dayRemainder);
    const hours = Math.round((dayRemainder - days) * 24);
    const parts = [];
    if (years > 0) parts.push(`${years}y`);
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    return parts.length > 0 ? parts.join(' ') : `${totalDays}d`;
  }

  if (loading) return (
    <div className="p-8 animate-pulse">
      <div className="flex justify-between items-center mb-8">
        <div className="h-8 w-56 bg-slate-200 rounded-lg" />
        <div className="h-10 w-36 bg-slate-200 rounded-lg" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => <div key={i} className="h-52 bg-slate-200 rounded-xl" />)}
      </div>
    </div>
  )

  if (plans.length === 0) {
    return (
      <div className="p-8">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center">
          <span className="material-symbols-outlined text-5xl text-amber-400 mb-4 block">warning</span>
          <h3 className="text-xl font-bold text-amber-800 mb-2">No Plans Found</h3>
          <p className="text-amber-700 mb-6 max-w-lg mx-auto">
            No subscription plans found in the database. This usually means the database migration hasn't been run yet.
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleOpenModal() }}
              type="button"
              className="bg-admin-primary text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-admin-primary/90 transition-all"
            >
              + Create Plan
            </button>
            <button onClick={loadPlans} className="bg-admin-accent text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-admin-accent/90 transition-all">
              🔄 Retry Loading
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-admin-primary tracking-tight">Pricing Plans</h2>
          <p className="text-slate-500 mt-1">Create and manage subscription plans that users can subscribe to</p>
        </div>
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleOpenModal() }}
          type="button"
          className="bg-admin-primary text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-admin-primary/90 transition-all shadow-lg shadow-admin-primary/20"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          Create Plan
        </button>
      </div>

      {/* Plan Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div key={plan.id} className={`relative bg-white rounded-2xl border shadow-sm overflow-hidden group transition-all hover:shadow-xl ${!plan.isActive ? 'border-slate-300 opacity-70' : plan.role === 'premium' ? 'border-admin-primary/40' : 'border-slate-200'
            }`}>
            {/* Card Header */}
            <div className={`p-6 pb-0 ${plan.role === 'premium' ? 'bg-admin-primary/5' : ''}`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xl font-extrabold text-slate-900">{plan.name}</h3>
                    {plan.role === 'premium' && (
                      <span className="material-symbols-outlined text-admin-primary text-lg">verified</span>
                    )}
                  </div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${plan.role === 'premium' ? 'bg-blue-100 text-blue-800'
                      : plan.role === 'normal' ? 'bg-green-100 text-green-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                    {plan.role === 'premium' ? '🔒 Premium' : plan.role === 'normal' ? '🆓 Free' : `⚙️ ${plan.role}`}
                  </span>
                </div>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${plan.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                  }`}>
                  {plan.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              {/* Price */}
              <div className="mt-4 mb-6">
                <span className="text-4xl font-black text-slate-900">${parseFloat(plan.price).toFixed(0)}</span>
                <span className="text-slate-500 text-sm font-medium ml-1">/ {formatDuration(plan)}</span>
              </div>
            </div>

            {/* Card Body */}
            <div className="px-6 pb-4 space-y-3">
              {/* Max Cases */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Max Cases</span>
                <span className="font-bold text-slate-800">
                  {plan.maxFreeCases === null || plan.maxFreeCases === undefined ? 'Unlimited' : plan.maxFreeCases}
                </span>
              </div>

              {/* Features */}
              {Array.isArray(plan.features) && plan.features.length > 0 && (
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  {plan.features.slice(0, 4).map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-admin-accent text-sm mt-0.5">check_circle</span>
                      <span className="text-xs text-slate-600">{feature}</span>
                    </div>
                  ))}
                  {plan.features.length > 4 && (
                    <p className="text-xs text-slate-400 italic">+{plan.features.length - 4} more features</p>
                  )}
                </div>
              )}
              {(!Array.isArray(plan.features) || plan.features.length === 0) && (
                <p className="text-xs text-slate-400 italic pt-3 border-t border-slate-100">No features listed</p>
              )}

              {plan.description && (
                <p className="text-xs text-slate-500 line-clamp-2">{plan.description}</p>
              )}
            </div>

            {/* Card Footer Actions */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex gap-2">
              <button
                onClick={() => handleOpenModal(plan)}
                className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-admin-primary hover:bg-admin-primary/5 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => confirmToggleActive(plan)}
                className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold transition-colors ${plan.isActive
                    ? 'bg-amber-500 text-white hover:bg-amber-600'
                    : 'bg-admin-accent text-white hover:bg-admin-accent/90'
                  }`}
              >
                {plan.isActive ? 'Deactivate' : 'Activate'}
              </button>
              {(plan.name !== 'Normal' && !(plan.name === 'Premium' && plan.role === 'premium')) && (
                <button
                  onClick={() => confirmDelete(plan.id, plan)}
                  className="px-3 py-2 bg-red-500 text-white rounded-lg text-xs font-bold hover:bg-red-600 transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">delete</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Create/Edit Plan Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between shrink-0">
              <h3 className="text-xl font-bold text-admin-primary">
                {editingPlan ? 'Edit Subscription Plan' : 'Create New Subscription Plan'}
              </h3>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-5">
                {/* Plan Name */}
                <div>
                  <label className="text-sm font-bold text-slate-700 block mb-2">Plan Name <span className="text-red-500">*</span></label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required placeholder="e.g., Premium, Enterprise"
                    className="w-full bg-slate-50 border-slate-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-admin-primary/20" />
                </div>

                {/* Price & Duration */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-bold text-slate-700 block mb-2">Price ($) <span className="text-red-500">*</span></label>
                    <input type="number" step="0.01" min="0" value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })} required
                      className="w-full bg-slate-50 border-slate-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-admin-primary/20" />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-slate-700 block mb-2">Max Free Cases</label>
                    <input type="number" min="0" value={formData.maxFreeCases}
                      onChange={(e) => setFormData({ ...formData, maxFreeCases: e.target.value })}
                      placeholder="Empty = unlimited"
                      className="w-full bg-slate-50 border-slate-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-admin-primary/20" />
                  </div>
                </div>

                {/* Duration Fields */}
                <div>
                  <label className="text-sm font-bold text-slate-700 block mb-2">Duration</label>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs text-slate-500 block mb-1">Years</label>
                      <input type="number" min="0" value={formData.durationYears}
                        onChange={(e) => {
                          let val = parseInt(e.target.value) || 0;
                          if (val > 10) val = 10; if (val < 0) val = 0;
                          setFormData({ ...formData, durationYears: val.toString() });
                        }}
                        onKeyDown={(e) => { const a = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter']; if (!/^\d$/.test(e.key) && !a.includes(e.key)) e.preventDefault(); }}
                        disabled={formData.isUnlimited} placeholder="0"
                        className="w-full bg-slate-50 border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-admin-primary/20 disabled:opacity-50" />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 block mb-1">Days</label>
                      <input type="number" min="0" value={formData.durationDays}
                        onChange={(e) => {
                          let days = parseInt(e.target.value) || 0; let years = parseInt(formData.durationYears) || 0;
                          if (days >= 365) { years += Math.floor(days / 365); days = days % 365; }
                          if (years > 10) { years = 10; days = 0; } if (years < 0) years = 0; if (days < 0) days = 0;
                          setFormData({ ...formData, durationDays: days.toString(), durationYears: years.toString() });
                        }}
                        onKeyDown={(e) => { const a = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter']; if (!/^\d$/.test(e.key) && !a.includes(e.key)) e.preventDefault(); }}
                        disabled={formData.isUnlimited} placeholder="30"
                        className="w-full bg-slate-50 border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-admin-primary/20 disabled:opacity-50" />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 block mb-1">Hours</label>
                      <input type="number" min="0" value={formData.durationHours}
                        onChange={(e) => {
                          let hours = parseInt(e.target.value) || 0; let days = parseInt(formData.durationDays) || 0; let years = parseInt(formData.durationYears) || 0;
                          if (hours >= 24) { const ed = Math.floor(hours / 24); hours = hours % 24; days += ed; if (days >= 365) { years += Math.floor(days / 365); days = days % 365; } }
                          if (years > 10) { years = 10; days = 0; hours = 0; } if (years < 0) years = 0; if (days < 0) days = 0; if (hours < 0) hours = 0;
                          setFormData({ ...formData, durationHours: hours.toString(), durationDays: days.toString(), durationYears: years.toString() });
                        }}
                        onKeyDown={(e) => { const a = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter']; if (!/^\d$/.test(e.key) && !a.includes(e.key)) e.preventDefault(); }}
                        disabled={formData.isUnlimited} placeholder="0"
                        className="w-full bg-slate-50 border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-admin-primary/20 disabled:opacity-50" />
                    </div>
                  </div>
                  <label className="flex items-center gap-2 mt-3 cursor-pointer">
                    <input type="checkbox" checked={formData.isUnlimited}
                      onChange={(e) => setFormData({ ...formData, isUnlimited: e.target.checked })}
                      className="rounded border-slate-300 text-admin-primary focus:ring-admin-primary/20" />
                    <span className="text-xs text-slate-600">Unlimited Duration (100 years)</span>
                  </label>
                  <p className="text-[11px] text-slate-400 mt-1">Values auto-convert (24h → 1d, 365d → 1y).</p>
                </div>

                {/* Description */}
                <div>
                  <label className="text-sm font-bold text-slate-700 block mb-2">Description</label>
                  <textarea value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows="3" placeholder="Describe what this plan offers..."
                    className="w-full bg-slate-50 border-slate-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-admin-primary/20 resize-y" />
                </div>

                {/* Features */}
                <div>
                  <label className="text-sm font-bold text-slate-700 block mb-2">Features</label>
                  <div className="flex gap-2 mb-3">
                    <input type="text" value={formData.newFeature}
                      onChange={(e) => setFormData({ ...formData, newFeature: e.target.value })}
                      onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddFeature() } }}
                      placeholder="Add a feature..."
                      className="flex-1 bg-slate-50 border-slate-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-admin-primary/20" />
                    <button type="button" onClick={handleAddFeature}
                      className="px-4 py-2 bg-admin-accent text-white rounded-lg text-sm font-bold hover:bg-admin-accent/90 transition-colors">
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.features.map((feature, index) => (
                      <span key={index} className="inline-flex items-center gap-1.5 px-3 py-1 bg-admin-primary/10 text-admin-primary rounded-full text-xs font-medium">
                        {feature}
                        <button type="button" onClick={() => handleRemoveFeature(index)}
                          className="text-red-400 hover:text-red-600 text-sm leading-none">×</button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Toggles */}
                <div className="space-y-3 pt-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="rounded border-slate-300 text-admin-primary focus:ring-admin-primary/20" />
                    <span className="text-sm text-slate-700">Active (plan is available for subscription)</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={formData.isPremium}
                      onChange={(e) => setFormData({ ...formData, isPremium: e.target.checked })}
                      className="rounded border-slate-300 text-admin-primary focus:ring-admin-primary/20" />
                    <span className="text-sm text-slate-700">Grant Premium Access (unlocks premium cases)</span>
                  </label>
                </div>
              </div>

              <div className="p-6 bg-slate-50 border-t border-slate-200 flex gap-3 shrink-0">
                <button type="button" onClick={handleCloseModal}
                  className="flex-1 px-4 py-3 rounded-xl bg-slate-200 text-slate-700 font-bold hover:bg-slate-300 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={loading}
                  className="flex-[2] px-4 py-3 rounded-xl bg-admin-primary text-white font-bold shadow-lg shadow-admin-primary/20 hover:bg-admin-primary/90 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                  {loading && (
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  )}
                  {loading ? 'Saving...' : (editingPlan ? 'Update Plan' : 'Create Plan')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        isDanger={confirmModal.isDanger}
      />
    </div>
  )
}
