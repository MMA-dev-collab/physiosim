import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { API_BASE_URL } from '../config'
import Loader from '@/components/ui/loader-12'
import './MembershipPage.css'

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

  // Get current plan info from backend
  const currentPlan = stats?.membershipType || 'Normal'
  const currentPlanRole = stats?.planRole || 'normal'
  const isPremiumOrUltra = currentPlan !== 'Normal'

  // Helper function to check if a plan is the user's current active plan
  const isCurrentPlan = (planIdentifier) => {
    // Support both plan name and role matching
    if (planIdentifier === 'Normal' && currentPlan === 'Normal') return true
    if (planIdentifier === 'Premium' && (currentPlan === 'Premium' || currentPlanRole === 'premium')) return true
    if (planIdentifier === 'Ultra' && (currentPlan === 'Ultra' || currentPlanRole === 'ultra')) return true
    if (planIdentifier === 'Institutional' && (currentPlan === 'Institutional' || currentPlan === 'Institutional Access')) return true
    return false
  }

  const handleSubscribeClick = (e, planIdentifier) => {
    e.preventDefault()
    if (isCurrentPlan(planIdentifier)) {
      return
    }
    setShowComingSoon(true)
  }

  if (loading) return (
    <div className="membership-loading">
      <Loader />
    </div>
  )

  return (
    <div className="membership-page">
      {/* Hero Section */}
      <div className="membership-hero">
        <div className="membership-hero-badge">Pricing</div>
        <h1 className="membership-hero-title">
          Choose the plan that fits your learning journey
        </h1>
        <p className="membership-hero-subtitle">
          Start free with sample cases, then unlock a comprehensive library of interactive
          physiotherapy scenarios with progress tracking and detailed scoring.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="pricing-container">
        <div className="pricing-grid">

          {/* Normal Plan */}
          <div className={`pricing-card ${isCurrentPlan('Normal') ? 'pricing-card-current' : ''}`}>
            {isCurrentPlan('Normal') && (
              <div className="current-plan-badge">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M13.5 4L6 11.5L2.5 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Current Plan
              </div>
            )}

            <div className="pricing-card-header">
              <div className="pricing-plan-badge">Basic</div>
              <h3 className="pricing-plan-name">Normal Plan</h3>
              <div className="pricing-price">
                <span className="pricing-currency">EGP</span>
                <span className="pricing-amount">0</span>
                <span className="pricing-period">/forever</span>
              </div>
              <p className="pricing-description">
                Perfect for trying out the platform or focusing on specific concepts
              </p>
            </div>

            <ul className="pricing-features">
              <li className="pricing-feature">
                <svg className="feature-check" width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="10" fill="#10b981" fillOpacity="0.1" />
                  <path d="M14 7L8.5 12.5L6 10" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>1–2 unlocked cases</span>
              </li>
              <li className="pricing-feature">
                <svg className="feature-check" width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="10" fill="#10b981" fillOpacity="0.1" />
                  <path d="M14 7L8.5 12.5L6 10" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>Full multi-step case flow</span>
              </li>
              <li className="pricing-feature">
                <svg className="feature-check" width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="10" fill="#10b981" fillOpacity="0.1" />
                  <path d="M14 7L8.5 12.5L6 10" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>Instant feedback on answers</span>
              </li>
              <li className="pricing-feature">
                <svg className="feature-check" width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="10" fill="#10b981" fillOpacity="0.1" />
                  <path d="M14 7L8.5 12.5L6 10" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>Basic score per case</span>
              </li>
              <li className="pricing-feature">
                <svg className="feature-check" width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="10" fill="#10b981" fillOpacity="0.1" />
                  <path d="M14 7L8.5 12.5L6 10" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>Community support</span>
              </li>
            </ul>

            <Link to="/cases" className="pricing-button-link">
              <button
                className={`pricing-button ${isCurrentPlan('Normal') ? 'pricing-button-current' : 'pricing-button-secondary'}`}
                disabled={isCurrentPlan('Normal')}
              >
                {isCurrentPlan('Normal') ? 'Current Plan' : (isPremiumOrUltra ? 'Downgrade to Basic' : 'Get Started')}
              </button>
            </Link>
          </div>

          {/* Premium Plan */}
          <div className={`pricing-card pricing-card-featured ${isCurrentPlan('Premium') ? 'pricing-card-current' : ''}`}>
            <div className="popular-badge">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 2L9.5 6H14L10.5 9L12 13L8 10L4 13L5.5 9L2 6H6.5L8 2Z" fill="currentColor" />
              </svg>
              Most Popular
            </div>

            {isCurrentPlan('Premium') && (
              <div className="current-plan-badge current-plan-badge-premium">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M13.5 4L6 11.5L2.5 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Current Plan
              </div>
            )}

            <div className="pricing-card-header">
              <div className="pricing-plan-badge pricing-plan-badge-premium">Premium</div>
              <h3 className="pricing-plan-name">Clinical Reasoning Track</h3>
              <div className="pricing-price">
                <span className="pricing-currency">EGP</span>
                <span className="pricing-amount">1,400</span>
                <span className="pricing-period">/6 months</span>
              </div>
              <p className="pricing-description">
                For serious students who want comprehensive practice with progressive difficulty
              </p>
            </div>

            <ul className="pricing-features">
              <li className="pricing-feature">
                <svg className="feature-check feature-check-premium" width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="10" fill="#3b82f6" fillOpacity="0.1" />
                  <path d="M14 7L8.5 12.5L6 10" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span><strong>Unlimited access</strong> to all cases</span>
              </li>
              <li className="pricing-feature">
                <svg className="feature-check feature-check-premium" width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="10" fill="#3b82f6" fillOpacity="0.1" />
                  <path d="M14 7L8.5 12.5L6 10" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>Progressive case series (Beginner → Advanced)</span>
              </li>
              <li className="pricing-feature">
                <svg className="feature-check feature-check-premium" width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="10" fill="#3b82f6" fillOpacity="0.1" />
                  <path d="M14 7L8.5 12.5L6 10" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>Case unlocking system</span>
              </li>
              <li className="pricing-feature">
                <svg className="feature-check feature-check-premium" width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="10" fill="#3b82f6" fillOpacity="0.1" />
                  <path d="M14 7L8.5 12.5L6 10" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>Detailed scoring with cumulative statistics</span>
              </li>
              <li className="pricing-feature">
                <svg className="feature-check feature-check-premium" width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="10" fill="#3b82f6" fillOpacity="0.1" />
                  <path d="M14 7L8.5 12.5L6 10" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>Performance analytics dashboard</span>
              </li>
              <li className="pricing-feature">
                <svg className="feature-check feature-check-premium" width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="10" fill="#3b82f6" fillOpacity="0.1" />
                  <path d="M14 7L8.5 12.5L6 10" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>Priority access to new cases</span>
              </li>
              <li className="pricing-feature">
                <svg className="feature-check feature-check-premium" width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="10" fill="#3b82f6" fillOpacity="0.1" />
                  <path d="M14 7L8.5 12.5L6 10" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>Email support</span>
              </li>
            </ul>

            <button
              className={`pricing-button ${isCurrentPlan('Premium') ? 'pricing-button-current' : 'pricing-button-primary'}`}
              onClick={(e) => handleSubscribeClick(e, 'Premium')}
              disabled={isCurrentPlan('Premium')}
            >
              {isCurrentPlan('Premium') ? 'Current Plan' : 'Upgrade to Premium'}
            </button>
          </div>

          {/* Institutional Plan */}
          <div className={`pricing-card ${isCurrentPlan('Institutional') ? 'pricing-card-current' : ''}`}>
            {isCurrentPlan('Institutional') && (
              <div className="current-plan-badge">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M13.5 4L6 11.5L2.5 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Current Plan
              </div>
            )}

            <div className="pricing-card-header">
              <div className="pricing-plan-badge">Enterprise</div>
              <h3 className="pricing-plan-name">Institutional Access</h3>
              <div className="pricing-price">
                <span className="pricing-currency">EGP</span>
                <span className="pricing-amount">2,400</span>
                <span className="pricing-period">/year</span>
              </div>
              <p className="pricing-description">
                For universities and institutions with bulk licensing needs
              </p>
            </div>

            <ul className="pricing-features">
              <li className="pricing-feature">
                <svg className="feature-check" width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="10" fill="#10b981" fillOpacity="0.1" />
                  <path d="M14 7L8.5 12.5L6 10" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span><strong>Everything in Premium</strong></span>
              </li>
              <li className="pricing-feature">
                <svg className="feature-check" width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="10" fill="#10b981" fillOpacity="0.1" />
                  <path d="M14 7L8.5 12.5L6 10" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>Bulk student licenses</span>
              </li>
              <li className="pricing-feature">
                <svg className="feature-check" width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="10" fill="#10b981" fillOpacity="0.1" />
                  <path d="M14 7L8.5 12.5L6 10" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>Admin dashboard for instructors</span>
              </li>
              <li className="pricing-feature">
                <svg className="feature-check" width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="10" fill="#10b981" fillOpacity="0.1" />
                  <path d="M14 7L8.5 12.5L6 10" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>Custom case creation</span>
              </li>
              <li className="pricing-feature">
                <svg className="feature-check" width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="10" fill="#10b981" fillOpacity="0.1" />
                  <path d="M14 7L8.5 12.5L6 10" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>Student progress reports</span>
              </li>
              <li className="pricing-feature">
                <svg className="feature-check" width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="10" fill="#10b981" fillOpacity="0.1" />
                  <path d="M14 7L8.5 12.5L6 10" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>Dedicated support</span>
              </li>
            </ul>

            <button
              className={`pricing-button ${isCurrentPlan('Institutional') ? 'pricing-button-current' : 'pricing-button-secondary'}`}
              onClick={(e) => handleSubscribeClick(e, 'Institutional')}
              disabled={isCurrentPlan('Institutional')}
            >
              {isCurrentPlan('Institutional') ? 'Current Plan' : 'Contact Sales'}
            </button>
          </div>

        </div>
      </div>

      {/* FAQ Section */}
      <div className="membership-faq">
        <h2 className="faq-title">Frequently Asked Questions</h2>
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

      {/* Coming Soon Modal */}
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
    </div>
  )
}

export default MembershipPage
