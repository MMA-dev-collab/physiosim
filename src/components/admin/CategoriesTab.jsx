import React, { useEffect, useState } from 'react'
import { API_BASE_URL } from '../../config'
import { useToast } from '../../context/ToastContext'
import ConfirmationModal from '../common/ConfirmationModal'

// Material Symbols icon mapping for categories
const CATEGORY_ICONS = [
    'skeleton', 'psychology', 'fitness_center', 'accessibility_new',
    'respiratory_rate', 'cardiology', 'monitor_heart', 'self_care',
    'elderly', 'child_care', 'healing', 'medical_services',
    'emergency', 'sprint', 'neurology', 'exercise',
]

const ICON_COLORS = [
    'bg-[var(--color-primary-soft)] text-[var(--color-primary)]',
    'bg-[var(--color-badge-bg-beginner)] text-[var(--color-badge-beginner)] border-[var(--color-badge-beginner)]/10',
    'bg-[var(--color-badge-bg-intermediate)] text-[var(--color-badge-intermediate)] border-[var(--color-badge-intermediate)]/10',
    'bg-[var(--color-badge-bg-advanced)] text-[var(--color-badge-advanced)] border-[var(--color-badge-advanced)]/10',
    'bg-purple-100/50 text-purple-600 border-purple-200',
    'bg-blue-100/50 text-blue-600 border-blue-200',
    'bg-emerald-100/50 text-emerald-600 border-emerald-200',
    'bg-cyan-100/50 text-cyan-600 border-cyan-200',
]

export default function CategoriesTab({ auth }) {
    const { toast } = useToast()
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [categoryToDelete, setCategoryToDelete] = useState(null)

    // Form State
    const [showModal, setShowModal] = useState(false)
    const [editingCategory, setEditingCategory] = useState(null)
    const [formName, setFormName] = useState('')
    const [formDescription, setFormDescription] = useState('')
    const [formIcon, setFormIcon] = useState('skeleton')
    const [saving, setSaving] = useState(false)

    const loadCategories = async () => {
        setLoading(true)
        try {
            const res = await fetch(`${API_BASE_URL}/api/categories`, {
                headers: { 'ngrok-skip-browser-warning': 'true' }
            })
            const data = await res.json()
            if (res.ok) setCategories(data)
        } catch (e) {
            toast.error('Failed to load categories')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadCategories()
    }, [])

    const openCreate = () => {
        setEditingCategory(null)
        setFormName('')
        setFormDescription('')
        setFormIcon('skeleton')
        setShowModal(true)
    }

    const openEdit = (cat) => {
        setEditingCategory(cat)
        setFormName(cat.name)
        setFormDescription(cat.description || '')
        setFormIcon(cat.materialIcon || 'skeleton')
        setShowModal(true)
    }

    const handleSave = async () => {
        if (!formName.trim()) {
            toast.error('Category name is required')
            return
        }

        setSaving(true)
        try {
            const url = editingCategory
                ? `${API_BASE_URL}/api/admin/categories/${editingCategory.id}`
                : `${API_BASE_URL}/api/admin/categories`
            const method = editingCategory ? 'PUT' : 'POST'

            const body = {
                name: formName.trim(),
                description: formDescription.trim(),
                icon: formIcon, // Keep emoji support
                materialIcon: formIcon,
            }

            const res = await fetch(url, {
                method,
                headers: {
                    Authorization: `Bearer ${auth.token}`,
                    'Content-Type': 'application/json',
                    'ngrok-skip-browser-warning': 'true'
                },
                body: JSON.stringify(body),
            })

            if (!res.ok) throw new Error('Failed to save')
            toast.success(editingCategory ? 'Category updated' : 'Category created')
            setShowModal(false)
            loadCategories()
        } catch (e) {
            toast.error(e.message)
        } finally {
            setSaving(false)
        }
    }

    const confirmDelete = async () => {
        if (!categoryToDelete) return
        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/categories/${categoryToDelete.id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${auth.token}`,
                    'ngrok-skip-browser-warning': 'true'
                },
            })
            if (!res.ok) throw new Error('Failed to delete')
            toast.success('Category deleted')
            setCategoryToDelete(null)
            loadCategories()
        } catch (e) {
            toast.error(e.message)
        }
    }

    if (loading) return (
        <div className="p-8 animate-pulse">
            <div className="h-8 w-52 bg-slate-200 rounded-lg mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-40 bg-slate-200 rounded-xl" />
                ))}
            </div>
        </div>
    )

    return (
        <div className="p-8 bg-admin-bg min-h-full">
            {/* Header */}
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h2 className="text-3xl font-extrabold text-admin-text tracking-tight">Medical Specialties</h2>
                    <p className="text-admin-text-muted mt-1">Configure and organize physiotherapy simulation categories</p>
                </div>
            </div>

            {/* Card Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {categories.map((cat, index) => (
                    <div key={cat.id} className="group bg-admin-card rounded-xl border border-admin-border p-6 shadow-admin-card hover:shadow-admin-card-hover hover:border-admin-primary transition-all duration-300">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${ICON_COLORS[index % ICON_COLORS.length]}`}>
                                {cat.icon ? (
                                    <span className="text-2xl">{cat.icon}</span>
                                ) : (
                                    <span className="material-symbols-outlined text-3xl">{cat.materialIcon || 'category'}</span>
                                )}
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => openEdit(cat)}
                                    className="p-1.5 text-admin-text-muted hover:text-admin-primary hover:bg-admin-bg rounded-lg transition-colors"
                                >
                                    <span className="material-symbols-outlined text-[20px]">edit</span>
                                </button>
                                <button
                                    onClick={() => setCategoryToDelete(cat)}
                                    className="p-1.5 text-admin-text-muted hover:text-admin-danger hover:bg-admin-danger/10 rounded-lg transition-colors"
                                >
                                    <span className="material-symbols-outlined text-[20px]">delete</span>
                                </button>
                            </div>
                        </div>
                        <h3 className="text-lg font-bold text-admin-text">{cat.name}</h3>
                        {cat.description && (
                            <p className="text-sm text-admin-text-muted mt-1 line-clamp-2">{cat.description}</p>
                        )}
                        <div className="mt-4 flex items-center justify-between">
                            <span className="text-sm font-bold text-admin-text-muted bg-admin-bg border border-admin-border/50 px-3 py-1 rounded-full">
                                {cat.caseCount || 0} Cases
                            </span>
                            <span className="text-admin-accent text-[12px] font-black uppercase tracking-wider flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-admin-accent shadow-sm" />
                                Active
                            </span>
                        </div>
                    </div>
                ))}

                {/* Add New Category Card */}
                <button
                    onClick={openCreate}
                    className="border-2 border-dashed border-admin-border rounded-xl p-6 flex flex-col items-center justify-center gap-3 hover:bg-admin-bg hover:border-admin-primary transition-all group cursor-pointer min-h-[160px]"
                >
                    <div className="w-12 h-12 rounded-full bg-admin-bg flex items-center justify-center group-hover:bg-admin-primary/10 group-hover:text-admin-primary transition-colors border border-admin-border">
                        <span className="material-symbols-outlined text-3xl">add</span>
                    </div>
                    <span className="text-sm font-bold text-admin-text-muted group-hover:text-admin-primary">Add New Specialty</span>
                </button>
            </div>

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-admin-overlay backdrop-blur-sm px-4">
                    <div className="bg-admin-card w-full max-w-lg rounded-2xl shadow-admin-modal border border-admin-border overflow-hidden">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-admin-border flex items-center justify-between bg-admin-bg/50">
                            <h3 className="text-xl font-bold text-admin-text">
                                {editingCategory ? 'Edit Category' : 'Create New Category'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-admin-text-muted hover:text-admin-text transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-admin-text">Category Name</label>
                                <input
                                    className="w-full bg-admin-bg border border-admin-border rounded-lg px-4 py-3 focus:ring-2 focus:ring-admin-primary/20 text-sm text-admin-text placeholder:text-admin-text-muted"
                                    placeholder="e.g. Cardiopulmonary Rehab"
                                    value={formName}
                                    onChange={(e) => setFormName(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-admin-text">Description</label>
                                <textarea
                                    className="w-full bg-admin-bg border border-admin-border rounded-lg px-4 py-3 focus:ring-2 focus:ring-admin-primary/20 text-sm text-admin-text placeholder:text-admin-text-muted"
                                    placeholder="Brief description of this specialty"
                                    rows={3}
                                    value={formDescription}
                                    onChange={(e) => setFormDescription(e.target.value)}
                                />
                            </div>

                            <div className="space-y-4">
                                <label className="text-sm font-bold text-admin-text block">Select Icon</label>
                                <div className="grid grid-cols-6 gap-3">
                                    {CATEGORY_ICONS.map(icon => (
                                        <div
                                            key={icon}
                                            onClick={() => setFormIcon(icon)}
                                            className={`flex items-center justify-center p-3 rounded-xl cursor-pointer transition-colors ${formIcon === icon
                                                ? 'bg-admin-primary text-white shadow-lg shadow-admin-primary/20'
                                                : 'bg-admin-bg text-admin-text-muted hover:bg-admin-primary-soft hover:text-admin-primary'
                                                }`}
                                        >
                                            <span className="material-symbols-outlined">{icon}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Preview */}
                            <div className="space-y-4 pt-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex-1 h-px bg-slate-200" />
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Icon Preview</span>
                                    <div className="flex-1 h-px bg-slate-200" />
                                </div>
                                <div className="flex justify-center">
                                    <div className="w-20 h-20 rounded-2xl bg-admin-primary/10 flex items-center justify-center text-admin-primary">
                                        <span className="material-symbols-outlined text-5xl">{formIcon}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 bg-admin-bg flex gap-3 border-t border-admin-border">
                            <button
                                onClick={() => setShowModal(false)}
                                className="flex-1 px-4 py-3 rounded-xl bg-admin-bg border border-admin-border text-admin-text-muted font-bold hover:bg-admin-card transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex-[2] px-4 py-3 rounded-xl bg-admin-primary text-white font-bold shadow-lg shadow-admin-primary/20 hover:bg-admin-primary-hover transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                            >
                                {saving && (
                                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                )}
                                {saving ? 'Saving...' : editingCategory ? 'Update Specialty' : 'Save Specialty'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmationModal
                isOpen={!!categoryToDelete}
                title="Delete Category?"
                message={`Are you sure you want to delete "${categoryToDelete?.name}"? This action cannot be undone.`}
                confirmText="Delete"
                onConfirm={confirmDelete}
                onCancel={() => setCategoryToDelete(null)}
                isDanger={true}
            />
        </div>
    )
}
