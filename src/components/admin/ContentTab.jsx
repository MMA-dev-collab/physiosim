import React, { useEffect, useState } from 'react'
import { API_BASE_URL } from '../../config'

export default function ContentTab({ auth }) {
  const [content, setContent] = useState([])
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ page: '', section: '', content: '' })

  useEffect(() => {
    loadContent()
  }, [])

  const loadContent = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/content`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      })
      const data = await res.json()
      if (res.ok) {
        setContent(data)
      }
    } catch (e) {
      console.error(e)
    }
  }

  const saveContent = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/content`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setEditing(null)
        loadContent()
      }
    } catch (e) {
      alert('Error saving content')
    }
  }

  const pages = ['home', 'about', 'membership']
  const sections = {
    home: ['hero_title', 'hero_subtitle', 'features', 'mission'],
    about: ['title', 'description', 'mission'],
    membership: ['title', 'description'],
  }

  return (
    <div className="admin-content">
      <div className="card">
        <div className="section-title">Website Content</div>
        <p className="section-description">
          Edit content for different pages of the website. Changes will be reflected immediately.
        </p>
        {pages.map((page) => (
          <div key={page} style={{ marginTop: '1.5rem', borderTop: '1px solid #e5e7eb', paddingTop: '1rem' }}>
            <h3 style={{ textTransform: 'capitalize', marginBottom: '0.75rem' }}>{page} Page</h3>
            {sections[page].map((section) => {
              const existing = content.find((c) => c.page === page && c.section === section)
              const isEditing = editing?.page === page && editing?.section === section
              return (
                <div key={section} style={{ marginBottom: '1rem', padding: '0.75rem', background: '#f9fafb', borderRadius: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <strong style={{ textTransform: 'capitalize' }}>{section.replace('_', ' ')}</strong>
                    <button className="btn-secondary" onClick={() => {
                      setEditing({ page, section })
                      setForm({ page, section, content: existing?.content || '' })
                    }}>
                      {existing ? 'Edit' : 'Add'}
                    </button>
                  </div>
                  {isEditing ? (
                    <div>
                      <textarea
                        rows={section.includes('title') ? 2 : 4}
                        value={form.content}
                        onChange={(e) => setForm({ ...form, content: e.target.value })}
                        style={{ width: '100%', marginBottom: '0.5rem' }}
                      />
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn-primary" onClick={saveContent}>Save</button>
                        <button className="btn-secondary" onClick={() => setEditing(null)}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>
                      {existing?.content || 'No content set'}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}



