import React from 'react'
import { Link } from 'react-router-dom'

function MembershipPage() {
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
            <button className="btn-secondary" style={{ width: '100%' }}>
              Start Normal
            </button>
          </Link>
        </div>

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
          <a href="https://ipn.eg/S/mazenelfar1/instapay/5ZkTBk" target="_blank" rel="noopener noreferrer" style={{ width: '100%', display: 'block' }}>
            <button className="btn-primary" style={{ width: '100%' }}>
              Start Premium Trial
            </button>
          </a>
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
          <a href="https://ipn.eg/S/mazenelfar1/instapay/5ZkTBk" target="_blank" rel="noopener noreferrer" style={{ width: '100%', display: 'block' }}>
            <button className="btn-secondary" style={{ width: '100%' }}>
              Contact Sales
            </button>
          </a>
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
    </div>
  )
}

export default MembershipPage