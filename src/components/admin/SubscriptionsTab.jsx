import React, { useEffect, useState } from 'react'
import { API_BASE_URL } from '../../config'
import { useToast } from '../../context/ToastContext'
import ConfirmationModal from '../common/ConfirmationModal'
import InputModal from '../common/InputModal'

export default function SubscriptionsTab({ auth }) {
  const { toast } = useToast()
  const [subscriptions, setSubscriptions] = useState([])
  const [plans, setPlans] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingSubscription, setEditingSubscription] = useState(null)
  const [formData, setFormData] = useState({
    userId: '',
    planId: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    daysToAdd: ''
  })
  const [touched, setTouched] = useState({ userId: false, planId: false })

  // Modal states
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => { },
    isDanger: false
  })
  const [inputModal, setInputModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    placeholder: '',
    onSubmit: () => { }
  })

  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false)

  useEffect(() => {
    loadData()
  }, [auth])

  const loadData = async () => {
    try {
      const [subsRes, plansRes, usersRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/admin/subscriptions`, {
          headers: { Authorization: `Bearer ${auth.token}`, 'ngrok-skip-browser-warning': 'true' }
        }),
        fetch(`${API_BASE_URL}/api/admin/subscription-plans`, {
          headers: { Authorization: `Bearer ${auth.token}`, 'ngrok-skip-browser-warning': 'true' }
        }),
        fetch(`${API_BASE_URL}/api/admin/users`, {
          headers: { Authorization: `Bearer ${auth.token}`, 'ngrok-skip-browser-warning': 'true' }
        })
      ])

      const [subs, plansData, usersData] = await Promise.all([
        subsRes.json(), plansRes.json(), usersRes.json()
      ])

      setSubscriptions(subs)
      setPlans(plansData)
      setUsers(usersData)
      setLoading(false)
    } catch (err) {
      console.error(err)
      setLoading(false)
    }
  }

  const handleCreateSubscription = async () => {
    setHasAttemptedSubmit(true)
    try {
      if (!formData.userId || formData.userId === '') return
      if (!formData.planId || formData.planId === '') return

      const selectedPlan = plans.find(p => p.id === parseInt(formData.planId))
      if (!selectedPlan) {
        toast.error('Selected plan not found. Please refresh and try again.')
        return
      }

      if (!formData.startDate) {
        toast.warning('Please select a start date')
        return
      }

      let endDate = formData.endDate
      if (!endDate && selectedPlan.durationDays) {
        const start = new Date(formData.startDate)
        const msToAdd = selectedPlan.durationDays * 24 * 60 * 60 * 1000
        const end = new Date(start.getTime() + msToAdd)
        endDate = end.toISOString().split('T')[0]
      }

      if (!endDate) {
        toast.warning('Please provide an end date')
        return
      }

      const res = await fetch(`${API_BASE_URL}/api/admin/subscriptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({
          userId: parseInt(formData.userId),
          planId: parseInt(formData.planId),
          startDate: formData.startDate,
          endDate: endDate
        })
      })

      if (res.ok) {
        const newSubscription = await res.json()
        toast.success(`Subscription created successfully! User now has ${newSubscription.planName} plan.`)
        setShowModal(false)
        setFormData({ userId: '', planId: '', startDate: new Date().toISOString().split('T')[0], endDate: '', daysToAdd: '' })
        setTouched({ userId: false, planId: false })
        setHasAttemptedSubmit(false)
        loadData()
      } else {
        const error = await res.json()
        toast.error(error.message || 'Failed to create subscription')
      }
    } catch (err) {
      console.error('Create subscription error:', err)
      toast.error('Failed to create subscription: ' + err.message)
    }
  }

  const openExtendModal = (subscriptionId) => {
    setInputModal({
      isOpen: true,
      title: 'Extend Subscription',
      message: 'Enter number of days to extend (max 180):',
      placeholder: '30',
      type: 'number',
      min: 0,
      max: 180,
      onSubmit: async (value) => {
        const success = await handleExtend(subscriptionId, value)
        if (success) setInputModal(prev => ({ ...prev, isOpen: false }))
      }
    })
  }

  const handleExtend = async (subscriptionId, daysToAddInput) => {
    const daysToAdd = parseInt(daysToAddInput);
    if (isNaN(daysToAdd) || daysToAdd <= 0) { toast.warning('Please enter a valid number of days'); return false }
    if (daysToAdd > 180) { toast.warning('Maximum extension is 180 days. Please enter a value between 1 and 180.'); return false }

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/subscriptions/${subscriptionId}/extend`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${auth.token}`, 'ngrok-skip-browser-warning': 'true' },
        body: JSON.stringify({ daysToAdd: parseInt(daysToAdd) })
      })
      if (res.ok) { loadData(); toast.success('Subscription extended successfully'); return true }
      else { toast.error('Failed to extend subscription'); return false }
    } catch (err) { toast.error('Failed to extend subscription'); return false }
  }

  const confirmDeactivate = (subscriptionId, currentPlanName) => {
    if (currentPlanName === 'Normal') { toast.info('This user is already on the Normal plan.'); return }
    setConfirmModal({
      isOpen: true, title: 'Deactivate Subscription?',
      message: 'Are you sure you want to deactivate this subscription? The user will be downgraded to the Normal plan immediately.',
      isDanger: true,
      onConfirm: () => { handleDeactivate(subscriptionId); setConfirmModal(prev => ({ ...prev, isOpen: false })) }
    })
  }

  const handleDeactivate = async (subscriptionId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/subscriptions/${subscriptionId}/cancel`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${auth.token}`, 'ngrok-skip-browser-warning': 'true' },
        body: JSON.stringify({ reason: 'Deactivated by admin - downgraded to Normal' })
      })
      if (res.ok) { toast.success('Subscription deactivated. User downgraded to Normal plan.'); loadData() }
      else toast.error('Failed to deactivate subscription')
    } catch (err) { toast.error('Failed to deactivate subscription') }
  }

  const confirmChangePlan = (subscriptionId, newPlanId) => {
    setConfirmModal({
      isOpen: true, title: 'Change Subscription Plan',
      message: 'Are you sure you want to change this subscription plan?', isDanger: false,
      onConfirm: () => { handleChangePlan(subscriptionId, newPlanId); setConfirmModal(prev => ({ ...prev, isOpen: false })) }
    })
  }

  const handleChangePlan = async (subscriptionId, newPlanId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/subscriptions/${subscriptionId}/change-plan`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${auth.token}`, 'ngrok-skip-browser-warning': 'true' },
        body: JSON.stringify({ newPlanId: parseInt(newPlanId) })
      })
      if (res.ok) { loadData(); toast.success('Plan changed successfully') }
      else toast.error('Failed to change plan')
    } catch (err) { toast.error('Failed to change plan') }
  }

  const getStatusStyle = (status) => {
    if (status === 'active') return 'bg-green-100 text-green-800'
    if (status === 'expired') return 'bg-red-100 text-red-800'
    return 'bg-slate-100 text-slate-600'
  }

  const getHealthStyle = (health) => {
    if (health === 'expired') return 'bg-red-100 text-red-700'
    if (health === 'expiring_soon') return 'bg-amber-100 text-amber-700'
    return 'bg-green-100 text-green-700'
  }

  if (loading) return (
    <div className="p-8 animate-pulse space-y-4">
      <div className="flex justify-between items-center">
        <div className="h-8 w-56 bg-slate-200 rounded-lg" />
        <div className="h-10 w-44 bg-slate-200 rounded-lg" />
      </div>
      <div className="bg-white rounded-xl border border-slate-200">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-16 border-b border-slate-100 mx-4" />
        ))}
      </div>
    </div>
  )

  if (plans.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <span className="material-symbols-outlined text-5xl text-amber-400 mb-4 block">warning</span>
          <p className="text-slate-600 font-medium">No subscription plans found</p>
          <p className="text-sm text-slate-400 mt-1">Please ensure the database migration has been run.</p>
          <button onClick={loadData} className="mt-4 px-4 py-2 bg-admin-primary text-white text-sm font-bold rounded-lg hover:bg-admin-primary/90">
            Retry Loading
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Subscription Management</h2>
          <p className="text-slate-500 text-sm mt-1">Manage user subscriptions and plan assignments</p>
        </div>
        <button
          onClick={() => {
            if (users.length === 0) { toast.warning('No users found.'); return }
            if (plans.length === 0) { toast.warning('No subscription plans found.'); return }
            setHasAttemptedSubmit(false)
            setTouched({ userId: false, planId: false })
            setShowModal(true)
          }}
          className="bg-admin-primary text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-admin-primary/90 transition-all shadow-sm"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          Create Subscription
        </button>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">User</th>
                <th className="py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Plan</th>
                <th className="py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Start</th>
                <th className="py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">End</th>
                <th className="py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Days Left</th>
                <th className="py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Health</th>
                <th className="py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {subscriptions.map((sub) => (
                <tr key={sub.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-6">
                    <p className="text-sm font-semibold text-slate-900">{sub.email || sub.name || `User #${sub.userId}`}</p>
                    <p className="text-xs text-slate-400">ID: {sub.userId}</p>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${sub.planName === 'Premium' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                      {sub.planName}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${getStatusStyle(sub.status)}`}>
                      {sub.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm text-slate-600">{new Date(sub.startDate).toLocaleDateString()}</td>
                  <td className="py-4 px-4 text-sm text-slate-600">{new Date(sub.endDate).toLocaleDateString()}</td>
                  <td className="py-4 px-4">
                    <span className={`text-sm font-bold ${sub.daysRemaining < 0 ? 'text-red-500' : sub.daysRemaining <= 7 ? 'text-amber-500' : 'text-admin-accent'
                      }`}>
                      {sub.daysRemaining || 0}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${getHealthStyle(sub.health)}`}>
                      {sub.health || 'active'}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    {sub.status === 'active' && (
                      <div className="flex items-center gap-1 flex-wrap">
                        <button
                          onClick={() => openExtendModal(sub.id)}
                          className="px-2 py-1 bg-admin-accent text-white rounded text-[10px] font-bold hover:bg-admin-accent/90"
                        >
                          Extend
                        </button>
                        <select
                          onChange={(e) => {
                            if (e.target.value && e.target.value !== sub.planId) confirmChangePlan(sub.id, e.target.value)
                          }}
                          value={sub.planId}
                          className="bg-slate-100 border-none rounded text-[10px] font-medium py-1 pl-1 pr-5 max-w-[100px] focus:ring-1 focus:ring-admin-primary/30"
                        >
                          {plans.filter(p => p.isActive || p.id === sub.planId).map(p => (
                            <option key={p.id} value={p.id} disabled={!p.isActive}>{p.name}</option>
                          ))}
                        </select>
                        {sub.planName !== 'Normal' && (
                          <button
                            onClick={() => confirmDeactivate(sub.id, sub.planName)}
                            className="px-2 py-1 bg-amber-500 text-white rounded text-[10px] font-bold hover:bg-amber-600"
                          >
                            Deactivate
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {subscriptions.length === 0 && (
            <div className="py-12 text-center">
              <span className="material-symbols-outlined text-4xl text-slate-300 mb-2 block">credit_card_off</span>
              <p className="text-slate-400 text-sm">No subscriptions found.</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Subscription Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-xl font-bold text-admin-primary">Create New Subscription</h3>
              <button onClick={() => {
                setShowModal(false); setHasAttemptedSubmit(false)
                setFormData({ userId: '', planId: '', startDate: new Date().toISOString().split('T')[0], endDate: '', daysToAdd: '' })
                setTouched({ userId: false, planId: false })
              }} className="text-slate-400 hover:text-slate-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 space-y-5">
              {/* User Select */}
              <div>
                <label className="text-sm font-bold text-slate-700 block mb-2">
                  User <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.userId}
                  onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                  onBlur={() => setTouched({ ...touched, userId: true })}
                  className={`w-full bg-slate-50 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-admin-primary/20 ${(hasAttemptedSubmit || touched.userId) && !formData.userId ? 'border-red-400' : 'border-slate-200'
                    }`}
                >
                  <option value="">Select user...</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.email} ({u.name || 'No name'})</option>
                  ))}
                </select>
                {(hasAttemptedSubmit || touched.userId) && !formData.userId && (
                  <p className="text-xs text-red-500 mt-1">Please select a user</p>
                )}
              </div>

              {/* Plan Select */}
              <div>
                <label className="text-sm font-bold text-slate-700 block mb-2">
                  Plan <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.planId}
                  onChange={(e) => {
                    if (!e.target.value) { setFormData({ ...formData, planId: '', endDate: '' }); return }
                    const plan = plans.find(p => p.id === parseInt(e.target.value))
                    if (plan) {
                      const baseDateStr = formData.startDate || new Date().toISOString().split('T')[0];
                      const start = new Date(baseDateStr);
                      const msToAdd = plan.durationDays * 24 * 60 * 60 * 1000;
                      const end = new Date(start.getTime() + msToAdd);
                      setFormData({ ...formData, planId: e.target.value, startDate: baseDateStr, endDate: end.toISOString().split('T')[0] })
                    } else {
                      setFormData({ ...formData, planId: e.target.value })
                    }
                  }}
                  onBlur={() => setTouched({ ...touched, planId: true })}
                  className={`w-full bg-slate-50 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-admin-primary/20 ${(hasAttemptedSubmit || touched.planId) && !formData.planId ? 'border-red-400' : 'border-slate-200'
                    }`}
                  required
                >
                  <option value="">-- Select plan (required) --</option>
                  {plans.filter(p => p.isActive).map(p => (
                    <option key={p.id} value={p.id}>{p.name} - ${p.price} ({p.durationDays} days)</option>
                  ))}
                </select>
                {(hasAttemptedSubmit || touched.planId) && !formData.planId && (
                  <p className="text-xs text-red-500 mt-1">Please select a plan</p>
                )}
              </div>

              {/* Date Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold text-slate-700 block mb-2">Start Date</label>
                  <input type="date" value={formData.startDate} readOnly
                    className="w-full bg-slate-100 border-slate-200 rounded-lg px-4 py-3 text-sm cursor-not-allowed text-slate-500" />
                </div>
                <div>
                  <label className="text-sm font-bold text-slate-700 block mb-2">End Date</label>
                  <input type="date" value={formData.endDate} readOnly
                    className="w-full bg-slate-100 border-slate-200 rounded-lg px-4 py-3 text-sm cursor-not-allowed text-slate-500" />
                </div>
              </div>
            </div>
            <div className="p-6 bg-slate-50 flex gap-3">
              <button
                onClick={() => {
                  setShowModal(false); setHasAttemptedSubmit(false)
                  setFormData({ userId: '', planId: '', startDate: new Date().toISOString().split('T')[0], endDate: '', daysToAdd: '' })
                  setTouched({ userId: false, planId: false })
                }}
                className="flex-1 px-4 py-3 rounded-xl bg-slate-200 text-slate-700 font-bold hover:bg-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateSubscription}
                disabled={!formData.userId || !formData.planId}
                className="flex-[2] px-4 py-3 rounded-xl bg-admin-primary text-white font-bold shadow-lg shadow-admin-primary/20 hover:bg-admin-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create
              </button>
            </div>
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

      <InputModal
        isOpen={inputModal.isOpen}
        title={inputModal.title}
        message={inputModal.message}
        placeholder={inputModal.placeholder}
        onSubmit={inputModal.onSubmit}
        onCancel={() => setInputModal(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  )
}
