import React from 'react'
import { Link } from 'react-router-dom'
import {
  Activity,
  Brain,
  CheckCircle,
  ChevronRight,
  FileText,
  BarChart2,
  Play,
  Users,
  Twitter
} from 'lucide-react'
import TestimonialsSection from '../components/TestimonialsSection'
import { Footer } from '../components/ui/footer'
import './HomePage.css'

function HomePage() {
  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hp-hero animate-fade-in">
        <div className="hp-container">
          <div className="hp-hero-content">
            <span className="hp-eyebrow">Physical Therapy Case Simulator</span>
            <h1 className="hp-hero-title">
              Master Clinical Reasoning with AI-Powered Simulation
            </h1>
            <p className="hp-hero-subtitle">
              Practice real-world cases, get instant feedback, and refine your diagnostic skills in a risk-free environment.
            </p>
            <div className="hp-hero-actions">
              <Link to="/cases" className="hp-btn-primary">
                Start Free Simulation <ChevronRight size={20} />
              </Link>
              <Link to="/about" className="hp-btn-secondary">
                <Play size={18} fill="currentColor" /> View Demo
              </Link>
            </div>
          </div>

          <div className="hp-hero-visual delay-200 animate-fade-in">
            <div className="hp-card-stack">
              <img
                src="/hero_visual.png"
                alt="PhysioSim Hero"
                className="w-full h-full object-contain rounded-3xl"
                style={{ boxShadow: '0 20px 50px rgba(15, 118, 110, 0.2)' }}
              />

              {/* Floating Card: Diagnosis */}
              <div className="hp-glass-card" style={{ bottom: '10%', right: '-5%', zIndex: 10, width: '260px' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <CheckCircle color="#10b981" size={28} />
                  <div>
                    <div style={{ fontWeight: '800', fontSize: '0.9rem', color: '#065f46' }}>Diagnosis Correct</div>
                    <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>Patellofemoral Pain</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="hp-features">
        <div className="hp-container">
          <div className="hp-section-header">
            <span className="hp-eyebrow">Why PhysioSim</span>
            <h2 className="hp-section-title">Everything you need to excel</h2>
            <p className="hp-section-desc">From patient history to final diagnosis, provide a complete clinical practice environment.</p>
          </div>

          <div className="hp-features-grid">
            <FeatureCard
              icon={<FileText size={32} />}
              title="Interactive Cases"
              desc="Engage with diverse, realistic patient scenarios and case studies for hands-on learning."
            />
            <FeatureCard
              icon={<Brain size={32} />}
              title="Real-time Feedback"
              desc="Receive instant, personalized performance analysis and guidance to improve decision-making."
            />
            <FeatureCard
              icon={<BarChart2 size={32} />}
              title="Progress Tracking"
              desc="Monitor your clinical growth with detailed metrics and competency dashboards."
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="hp-how-it-works">
        <div className="hp-container">
          <div className="hp-section-header">
            <span className="hp-eyebrow">Our Process</span>
            <h2 className="hp-section-title">How It Works</h2>
            <p className="hp-section-desc">Go from theory to practice in three simple steps.</p>
          </div>

          <div className="hp-steps-container">
            <StepRow
              number="01"
              title="Browse Cases"
              desc="Choose from a diverse range of clinical scenarios categorized by specialty (MSK, Neuro, Cardiorespiratory) and difficulty level. Filter by body part or condition."
              visualSrc="/step1_library.png"
              visualLabel="Case Library"
              isReversed={false}
            />
            <StepRow
              number="02"
              title="Practice Skills"
              desc="Conduct subjective assessments, perform virtual physical exams, and request investigations just like in a real clinic. The interface mimics real patient interaction."
              visualSrc="/step2_practice.png"
              visualLabel="Examination Interface"
              isReversed={true}
            />
            <StepRow
              number="03"
              title="Get Feedback"
              desc="Receive immediate, evidence-based feedback on every decision you make. Understand what you missed and why, helping you refine your clinical reasoning."
              visualSrc="/step3_feedback.png"
              visualLabel="Performance Report"
              isReversed={false}
            />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <TestimonialsSection />

      {/* Final CTA Strip (Full Width) */}
      <section className="hp-cta-strip">
        <div className="hp-container">
          <div className="hp-cta-content">
            <h2 className="hp-cta-title">Ready to elevate your clinical skills?</h2>
            <p className="hp-cta-desc">Join thousands of physiotherapy students and professionals mastering their craft with PhysioSim.</p>
            <Link to="/cases">
              <button className="hp-btn-white">
                Get Started Today
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer
        logo={<Activity className="h-8 w-8 text-teal-600" />}
        brandName="PhysioSim"
        socialLinks={[
          {
            icon: <Twitter className="h-5 w-5" />,
            href: "https://twitter.com",
            label: "Twitter",
          },
          {
            icon: <Users className="h-5 w-5" />,
            href: "https://community.physiosim.com",
            label: "Community",
          },
        ]}
        mainLinks={[
          { href: "/cases", label: "Case Library" },
          { href: "/membership", label: "Membership" },
          { href: "/about", label: "About Us" },
          { href: "/leaderboard", label: "Leaderboard" },
        ]}
        legalLinks={[
          { href: "/privacy", label: "Privacy Policy" },
          { href: "/terms", label: "Terms of Service" },
        ]}
        copyright={{
          text: `© ${new Date().getFullYear()} PhysioSim`,
          license: "Advancing Clinical Excellence",
        }}
      />
    </div>
  )
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="hp-feature-card">
      <div className="hp-feature-icon-wrapper">{icon}</div>
      <h3 className="hp-feature-title">{title}</h3>
      <p className="hp-feature-text">{desc}</p>
    </div>
  )
}

function StepRow({ number, title, desc, visualSrc, visualLabel, isReversed }) {
  return (
    <div className={`hp-step-row ${isReversed ? 'reversed' : ''}`}>
      <div className="hp-step-content">
        <div className="hp-step-number">{number}</div>
        <h3 className="hp-step-title">{title}</h3>
        <p className="hp-step-desc">{desc}</p>
      </div>
      <div className="hp-step-visual" style={{ overflow: 'hidden', padding: 0, position: 'relative' }}>
        <img
          src={visualSrc}
          alt={visualLabel}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        />
        <div style={{
          position: 'absolute',
          bottom: '1rem',
          right: '1rem',
          background: 'rgba(255,255,255,0.9)',
          padding: '0.5rem 1rem',
          borderRadius: '99px',
          fontSize: '0.8rem',
          fontWeight: 700,
          color: '#0f766e',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          {visualLabel}
        </div>
      </div>
    </div>
  )
}


export default HomePage
