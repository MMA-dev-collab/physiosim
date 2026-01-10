import React, { useEffect, useState } from 'react'
import { API_BASE_URL } from '../../config'
import './CasesTab.css' // Reuse table styles

export default function CategoriesTab({ auth }) {
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [editingId, setEditingId] = useState(null)
    const [form, setForm] = useState({ name: '', icon: '', description: '' })

    const loadCategories = async () => {
        setLoading(true)
        try {
            const res = await fetch(`${API_BASE_URL}/api/categories`, {
                headers: { 'ngrok-skip-browser-warning': 'true' }
            })
            const data = await res.json()
            if (res.ok) {
                setCategories(data)
            } else {
                throw new Error(data.message || 'Failed to load categories')
            }
        } catch (e) {
            setError(e.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadCategories()
    }, [])

    const handleSave = async () => {
        try {
            const url = editingId
                ? `${API_BASE_URL}/api/admin/categories/${editingId}`
                : `${API_BASE_URL}/api/admin/categories`
            const method = editingId ? 'PUT' : 'POST'

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${auth.token}`,
                    'ngrok-skip-browser-warning': 'true'
                },
                body: JSON.stringify(form),
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.message || 'Failed to save')

            setForm({ name: '', icon: '', description: '' })
            setEditingId(null)
            loadCategories()
        } catch (e) {
            alert(e.message)
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure?')) return
        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/categories/${id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${auth.token}`,
                    'ngrok-skip-browser-warning': 'true'
                },
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.message || 'Failed to delete')
            loadCategories()
        } catch (e) {
            alert(e.message)
        }
    }

    const startEdit = (cat) => {
        setEditingId(cat.id)
        setForm({ name: cat.name, icon: cat.icon || '', description: cat.description || '' })
    }

    const cancelEdit = () => {
        setEditingId(null)
        setForm({ name: '', icon: '', description: '' })
    }

    return (
        <div className="admin-categories">
            <div className="section-header" style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ margin: 0 }}>Category Management</h2>
            </div>

            {/* Add/Edit Form */}
            <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem', borderRadius: '16px', boxShadow: 'var(--shadow-md)', background: 'white' }}>
                <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>{editingId ? 'Edit Category' : 'Add New Category'}</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr auto', gap: '1rem', alignItems: 'end' }}>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>Name</span>
                        <input
                            value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })}
                            placeholder="e.g. Pediatrics"
                            style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                        />
                    </label>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>Icon (Emoji)</span>
                        <input
                            value={form.icon}
                            onChange={e => setForm({ ...form, icon: e.target.value })}
                            placeholder="e.g. 👶"
                            style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                        />
                    </label>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>Description</span>
                        <input
                            value={form.description}
                            onChange={e => setForm({ ...form, description: e.target.value })}
                            placeholder="Optional description"
                            style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                        />
                    </label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn-primary" onClick={handleSave}>
                            {editingId ? 'Update' : 'Add'}
                        </button>
                        {editingId && (
                            <button className="btn-secondary" onClick={cancelEdit}>Cancel</button>
                        )}
                    </div>
                </div>
            </div>

            {loading && <div>Loading...</div>}
            {error && <div className="error-text">{error}</div>}

            <div className="cases-table-container">
                <table className="cases-table">
                    <thead>
                        <tr>
                            <th>Icon</th>
                            <th>Name</th>
                            <th>Description</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map(cat => (
                            <tr key={cat.id}>
                                <td style={{ fontSize: '1.5rem' }}>{cat.icon}</td>
                                <td><strong>{cat.name}</strong></td>
                                <td>{cat.description || <span style={{ color: '#9ca3af' }}>-</span>}</td>
                                <td>
                                    <div className="action-buttons">
                                        <button className="btn-icon btn-edit" onClick={() => startEdit(cat)} title="Edit">✎</button>
                                        <button className="btn-icon btn-delete" onClick={() => handleDelete(cat.id)} title="Delete">🗑</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
