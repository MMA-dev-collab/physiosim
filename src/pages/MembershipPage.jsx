import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { API_BASE_URL } from '../config'
import Loader from '@/components/ui/loader-12'
import './MembershipPage.css'

function MembershipPage({ auth }) {
  const [stats, setStats] = useState(null)
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [showComingSoon, setShowComingSoon] = useState(false)

  useEffect(() => {
    const fetchMembershipData = async () => {
      setLoading(true)
      try {
        // Fetch public plans
        const plansRes = await fetch(`${API_BASE_URL}/api/subscription-plans`, {
          headers: { 'ngrok-skip-browser-warning': 'true' }
        })
        if (plansRes.ok) {
          const plansData = await plansRes.json()
          // Filter active plans and sort them (e.g. by price or level)
          const activePlans = plansData.filter(p => p.isActive).sort((a, b) => a.price - b.price);
          setPlans(activePlans)
        }

        // Fetch user stats if logged in
        if (auth?.token) {
          const statsRes = await fetch(`${API_BASE_URL}/api/profile/stats`, {
            headers: {
              Authorization: `Bearer ${auth.token}`,
              'ngrok-skip-browser-warning': 'true'
            },
          })
          if (statsRes.ok) {
            setStats(await statsRes.json())
          }
        }
      } catch (err) {
        console.error("Failed to load membership data", err)
      } finally {
        setLoading(false)
      }
    }

    fetchMembershipData()
  }, [auth])

  // Get current plan info from backend
  const currentPlan = stats?.membershipType || 'Normal'
  const currentPlanRole = stats?.planRole || 'normal'
  const isPremiumOrUltra = currentPlan !== 'Normal'

  // Helper function to check if a plan is the user's current active plan
  const isCurrentPlan = (planIdentifier) => {
    // Treat 'Normal' as the basic free tier
    if (planIdentifier === 'Normal' && currentPlan === 'Normal') return true

    // Check against dynamically fetched plan names
    if (planIdentifier && typeof planIdentifier === 'string') {
      const lowerPlan = planIdentifier.toLowerCase()
      const lowerCurrent = currentPlan.toLowerCase()
      if (lowerCurrent === lowerPlan) return true
      if (currentPlanRole === lowerPlan) return true
      // Handling variations like 'Premium' vs 'premium'
    }
    return false
  }

  const handleSubscribeClick = (e, planIdentifier) => {
    e.preventDefault()
    if (isCurrentPlan(planIdentifier)) {
      return
    }
    setShowComingSoon(true)
  }

  const formatDuration = (days) => {
    if (!days || days >= 36500) return 'Unlimited'
    if (days % 365 === 0) return `${days / 365} year${days / 365 > 1 ? 's' : ''}`
    if (days >= 30 && days % 30 === 0) return `${days / 30} month${days / 30 > 1 ? 's' : ''}`
    return `${days} days`
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

          {/* Dynamic Plans from Backend */}
          {plans.map((plan, index) => {
            // Make Premium plans featured, or fallback to index 1 if available
            const isFeatured = plan.role === 'premium' || plan.name.toLowerCase().includes('premium');
            const current = isCurrentPlan(plan.name);

            return (
              <div key={plan.id} className={`pricing-card ${isFeatured ? 'pricing-card-featured' : ''} ${current ? 'pricing-card-current' : ''}`}>
                {isFeatured && (
                  <div className="popular-badge">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M8 2L9.5 6H14L10.5 9L12 13L8 10L4 13L5.5 9L2 6H6.5L8 2Z" fill="currentColor" />
                    </svg>
                    Most Popular
                  </div>
                )}

                {current && (
                  <div className={`current-plan-badge ${isFeatured ? 'current-plan-badge-premium' : ''}`}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M13.5 4L6 11.5L2.5 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Current Plan
                  </div>
                )}

                <div className="pricing-card-header">
                  <div className={`pricing-plan-badge ${isFeatured ? 'pricing-plan-badge-premium' : ''}`}>{plan.name}</div>
                  <h3 className="pricing-plan-name">{plan.name}</h3>
                  <div className="pricing-price">
                    <span className="pricing-currency">EGP</span>
                    <span className="pricing-amount">{plan.price}</span>
                    <span className="pricing-period">/{formatDuration(plan.durationDays)}</span>
                  </div>
                  <p className="pricing-description">
                    {plan.description || 'Comprehensive access to our advanced simulation library.'}
                  </p>
                </div>

                <ul className="pricing-features">
                  {plan.features && plan.features.length > 0 ? (
                    plan.features.map((feature, fIndex) => (
                      <li key={fIndex} className="pricing-feature">
                        <svg className={`feature-check ${isFeatured ? 'feature-check-premium' : ''}`} width="20" height="20" viewBox="0 0 20 20" fill="none">
                          <circle cx="10" cy="10" r="10" fill={isFeatured ? "#3b82f6" : "#10b981"} fillOpacity="0.1" />
                          <path d="M14 7L8.5 12.5L6 10" stroke={isFeatured ? "#3b82f6" : "#10b981"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span>{feature}</span>
                      </li>
                    ))
                  ) : (
                    <li className="pricing-feature">
                      <svg className={`feature-check ${isFeatured ? 'feature-check-premium' : ''}`} width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <circle cx="10" cy="10" r="10" fill={isFeatured ? "#3b82f6" : "#10b981"} fillOpacity="0.1" />
                        <path d="M14 7L8.5 12.5L6 10" stroke={isFeatured ? "#3b82f6" : "#10b981"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span><strong>Unlimited access</strong> to allowed cases</span>
                    </li>
                  )}
                </ul>

                <button
                  className={`pricing-button ${current ? 'pricing-button-current' : (isFeatured ? 'pricing-button-primary' : 'pricing-button-secondary')}`}
                  onClick={(e) => handleSubscribeClick(e, plan.name)}
                  disabled={current}
                >
                  {current ? 'Current Plan' : (plan.price == 0 ? `Get Started` : `Upgrade to ${plan.name}`)}
                </button>
              </div>
            )
          })}
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
