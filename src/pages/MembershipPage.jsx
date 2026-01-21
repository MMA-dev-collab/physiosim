import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { API_BASE_URL } from '../config'

function MembershipPage({ auth }) {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showComingSoon, setShowComingSoon] = useState(false)

  useEffect(() => {
    if (auth?.token) {
      setLoading(true)
      fetch(`${API_BASE_URL}/api/profile/stats`, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
          'ngrok-skip-browser-warning': 'true'
        },
      })
        .then((res) => res.json())
        .then((data) => {
          setStats(data)
          setLoading(false)
        })
        .catch(() => setLoading(false))
    }
  }, [auth])

  const currentPlan = stats?.membershipType || 'Normal'
  const isPremiumOrUltra = currentPlan !== 'Normal'

  const handleSubscribeClick = (e, planName) => {
    e.preventDefault()
    if (planName === currentPlan || (planName === 'Normal Plan' && currentPlan === 'Normal')) {
      return
    }
    setShowComingSoon(true)
  }

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-eyebrow">Membership</div>
        <h1 className="page-title">Choose the plan that fits your learning journey</h1>
        <p className="page-subtitle">
          Start free with sample cases, then unlock a comprehensive library of interactive
          physiotherapy scenarios with progress tracking and detailed scoring.
        </p>
      </div>

      <div className="membership-grid">
        {!isPremiumOrUltra && (
          <div className="membership-card">
            <div className="membership-header">
              <div className="pill">
                <span>NORMAL</span>
              </div>
              <h2 className="membership-title">Normal Plan</h2>
              <div className="membership-price">
                <span className="price-amount">0 <span style={{ fontSize: '1rem' }}>EGP</span></span>
                <span className="price-period">/forever</span>
              </div>
            </div>
            <p className="membership-description">
              Perfect for trying out the platform or focusing on specific concepts.
              Get a taste of our interactive case format with full feedback.
            </p>
            <ul className="membership-features">
              <li className="feature-item">
                <span className="feature-icon">✓</span>
                <span>1–2 unlocked cases</span>
              </li>
              <li className="feature-item">
                <span className="feature-icon">✓</span>
                <span>Full multi-step case flow</span>
              </li>
              <li className="feature-item">
                <span className="feature-icon">✓</span>
                <span>Instant feedback on answers</span>
              </li>
              <li className="feature-item">
                <span className="feature-icon">✓</span>
                <span>Basic score per case</span>
              </li>
              <li className="feature-item">
                <span className="feature-icon">✓</span>
                <span>Access to all core features</span>
              </li>
            </ul>
            <Link to="/cases" style={{ width: '100%', display: 'block' }}>
              <button className="btn-secondary" style={{ width: '100%', opacity: currentPlan === 'Normal' ? 0.7 : 1 }}>
                {currentPlan === 'Normal' ? 'Current Plan' : 'Start Normal'}
              </button>
            </Link>
          </div>
        )}

        <div className="membership-card membership-card-featured">
          <div className="membership-badge">Most Popular</div>
          <div className="membership-header">
            <div className="pill pill-premium">
              <span>Semi-annual</span>
            </div>
            <h2 className="membership-title">Clinical Reasoning Track</h2>
            <div className="membership-price">
              <span className="price-amount">1400 <span style={{ fontSize: '1rem' }}>EGP</span></span>
              <span className="price-period">/month</span>
            </div>
          </div>
          <p className="membership-description">
            For serious students who want comprehensive practice with progressive
            difficulty. Build your clinical reasoning systematically.
          </p>
          <ul className="membership-features">
            <li className="feature-item">
              <span className="feature-icon">✓</span>
              <span>Unlimited access to all cases</span>
            </li>
            <li className="feature-item">
              <span className="feature-icon">✓</span>
              <span>Progressive case series (Beginner → Advanced)</span>
            </li>
            <li className="feature-item">
              <span className="feature-icon">✓</span>
              <span>Case locking system (unlock as you progress)</span>
            </li>
            <li className="feature-item">
              <span className="feature-icon">✓</span>
              <span>Detailed scoring with cumulative statistics</span>
            </li>
            <li className="feature-item">
              <span className="feature-icon">✓</span>
              <span>Performance analytics dashboard</span>
            </li>
            <li className="feature-item">
              <span className="feature-icon">✓</span>
              <span>Priority access to new cases</span>
            </li>
            <li className="feature-item">
              <span className="feature-icon">✓</span>
              <span>Advanced case filters and search</span>
            </li>
            <li className="feature-item">
              <span className="feature-icon">✓</span>
              <span>Email support</span>
            </li>
          </ul>
          <button
            className={currentPlan === 'Clinical Reasoning Track' ? "btn-secondary" : "btn-primary"}
            style={{ width: '100%', opacity: currentPlan === 'Clinical Reasoning Track' ? 0.7 : 1 }}
            onClick={(e) => handleSubscribeClick(e, 'Clinical Reasoning Track')}
          >
            {currentPlan === 'Clinical Reasoning Track' ? 'Current Plan' : 'Subscribe Now'}
          </button>
        </div>

        <div className="membership-card">
          <div className="membership-header">
            <div className="pill">
              <span>Annual</span>
            </div>
            <h2 className="membership-title">Institutional Access</h2>
            <div className="membership-price">
              <span className="price-amount">2400 <span style={{ fontSize: '1rem' }}>EGP</span></span>
              <span className="price-period">/year</span>
            </div>
          </div>
          <p className="membership-description">
            For universities and institutions. Bulk licensing with admin dashboard
            and custom case creation tools.
          </p>
          <ul className="membership-features">
            <li className="feature-item">
              <span className="feature-icon">✓</span>
              <span>Everything in Premium</span>
            </li>
            <li className="feature-item">
              <span className="feature-icon">✓</span>
              <span>Bulk student licenses</span>
            </li>
            <li className="feature-item">
              <span className="feature-icon">✓</span>
              <span>Admin dashboard for instructors</span>
            </li>
            <li className="feature-item">
              <span className="feature-icon">✓</span>
              <span>Custom case creation</span>
            </li>
            <li className="feature-item">
              <span className="feature-icon">✓</span>
              <span>Student progress reports</span>
            </li>
            <li className="feature-item">
              <span className="feature-icon">✓</span>
              <span>Dedicated support</span>
            </li>
          </ul>
          <button
            className={currentPlan === 'Institutional Access' ? "btn-secondary" : "btn-primary"}
            style={{ width: '100%', opacity: currentPlan === 'Institutional Access' ? 0.7 : 1 }}
            onClick={(e) => handleSubscribeClick(e, 'Institutional Access')}
          >
            {currentPlan === 'Institutional Access' ? 'Current Plan' : 'Subscribe Now'}
          </button>
        </div>
      </div>

      <div className="membership-faq">
        <h2 className="section-title" style={{ textAlign: 'center', marginBottom: '2rem' }}>
          Frequently Asked Questions
        </h2>
        <div className="faq-grid">
          <div className="faq-item">
            <h3 className="faq-question">Can I switch plans later?</h3>
            <p className="faq-answer">
              Yes! You can upgrade from Normal to Premium at any time. Your progress
              and scores will be preserved.
            </p>
          </div>
          <div className="faq-item">
            <h3 className="faq-question">What happens if I get an answer wrong?</h3>
            <p className="faq-answer">
              You'll receive immediate feedback explaining why the answer is incorrect
              and what the correct reasoning should be. You can then try again.
            </p>
          </div>
          <div className="faq-item">
            <h3 className="faq-question">Are cases available in Arabic?</h3>
            <p className="faq-answer">
              Yes! Many cases include bilingual chief complaints (Arabic and English)
              to prepare you for diverse patient populations.
            </p>
          </div>
          <div className="faq-item">
            <h3 className="faq-question">How are cases unlocked?</h3>
            <p className="faq-answer">
              In Premium, cases are unlocked progressively. Complete beginner cases to
              unlock intermediate ones, and so on. This ensures you build skills systematically.
            </p>
          </div>
        </div>
      </div>

      {showComingSoon && (
        <div className="modal-overlay" onClick={() => setShowComingSoon(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Coming Soon!</h2>
              <button className="modal-close" onClick={() => setShowComingSoon(false)}>×</button>
            </div>
            <div className="modal-body">
              <p>Direct online subscription is coming soon. For now, please contact our support or use the current registration process.</p>
            </div>
            <div className="modal-footer">
              <button className="btn-primary" onClick={() => setShowComingSoon(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }
        .modal-content {
          background: white;
          border-radius: 12px;
          width: 100%;
          maxWidth: 400px;
          padding: 1.5rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
          animation: modalAppear 0.3s ease-out;
        }
        @keyframes modalAppear {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }
        .modal-title {
          margin: 0;
          font-size: 1.5rem;
          color: var(--primary-color);
        }
        .modal-close {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #6b7280;
        }
        .modal-body {
          margin-bottom: 1.5rem;
          line-height: 1.5;
          color: #374151;
        }
        .modal-footer {
          display: flex;
          justify-content: flex-end;
        }
      `}} />
    </div>
  )
}

export default MembershipPage
