import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import './AboutPage.css'
import { Footer } from '../components/ui/footer'
import { Activity, Twitter, Users } from 'lucide-react'

function AboutPage() {

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero">
        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
          <div className="about-hero-content">
          <span className="hero-eyebrow">Our Vision</span>
          <h1 className="hp-hero-title">
            The Future of <br />
            Clinical Reasoning
          </h1>
          <p className="hero-description">
            Empowering the next generation of physiotherapists to bridge the gap between textbook theory and real-world patient care through interactive simulation.
          </p>
          <button className="hp-btn-primary" onClick={() => document.querySelector('.mission-section').scrollIntoView({ behavior: 'smooth' })}>
            Discover More
          </button>
        </div>
        
        </div>
      </section>

      {/* Mission Section */}
      <section className="mission-section">
        <div className="mission-label">Our Mission</div>
        <h2 className="mission-statement">
          Bridging the gap between <span>classroom theory</span> and <span>clinical practice</span>.
        </h2>
        <p style={{ marginTop: '2rem', fontSize: '1.15rem', color: '#475569', maxWidth: '800px', margin: '2rem auto 0', lineHeight: 1.8 }}>
          We believe that confident clinical reasoning comes from safe practice. PhysioCaseLab provides
          students with a risk-free environment to make decisions, learn from mistakes, and build the
          mental models expert clinicians use every day.
        </p>
      </section>

      {/* Journey Timeline */}
      <section className="journey-section">
        <div className="section-header-dark">
          <h2 style={{ fontSize: '3rem', marginBottom: '1rem', fontWeight: 800 }}>How You Learn</h2>
          <p style={{ fontSize: '1.2rem', color: '#94a3b8' }}>A structured journey from assessment to diagnosis</p>
        </div>

        <div className="journey-container">
          <div className="journey-line"></div>

          {/* Step 1 */}
          <div className="journey-step">
            <div className="journey-marker"></div>
            <div className="journey-step-content">
              <h3 className="step-title">Read & Engage</h3>
              <p className="step-desc">
                Start with a rich patient narrative. Review initial vitals,
                chief complaints, and background history just like a real consultation.
              </p>
            </div>
            <div className="journey-step-visual">
              <img src="/img/journey_read.png" alt="Patient History UI" className="journey-img" />
            </div>
          </div>

          {/* Step 2 */}
          <div className="journey-step">
            <div className="journey-marker"></div>
            <div className="journey-step-content">
              <h3 className="step-title">Ask & Investigate</h3>
              <p className="step-desc">
                Choose the right questions to ask. Order physical tests and interpret
                X-rays or MRI results to gather evidence.
              </p>
            </div>
            <div className="journey-step-visual">
              <img src="/img/journey_investigate.png" alt="Investigation UI" className="journey-img" />
            </div>
          </div>

          {/* Step 3 */}
          <div className="journey-step">
            <div className="journey-marker"></div>
            <div className="journey-step-content">
              <h3 className="step-title">Diagnose & Reflect</h3>
              <p className="step-desc">
                Formulate a diagnosis based on your findings. Receive immediate,
                detailed feedback on your reasoning process.
              </p>
            </div>
            <div className="journey-step-visual">
              <img src="/img/journey_diagnose.png" alt="Diagnosis UI" className="journey-img" />
            </div>
          </div>

        </div>
      </section>

      {/* Who We Serve */}
      <section className="audience-section">
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#0f172a', fontWeight: 800 }}>Built for Every Stage</h2>
          <p style={{ color: '#64748b' }}>From first year to clinical practice</p>
        </div>

        <div className="audience-grid">
          <div className="audience-card">
            <div className="audience-avatar">🎓</div>
            <h3 className="audience-title">Undergraduates</h3>
            <p className="audience-desc">
              Build a strong foundation. Visualize anatomy and pathology early in your studies.
            </p>
          </div>
          <div className="audience-card">
            <div className="audience-avatar">📚</div>
            <h3 className="audience-title">Grad Students</h3>
            <p className="audience-desc">
              Refine complex decision-making. Handle ambiguous cases and comorbidities.
            </p>
          </div>
          <div className="audience-card">
            <div className="audience-avatar">🏥</div>
            <h3 className="audience-title">Clinical Interns</h3>
            <p className="audience-desc">
              Practice safely before touching patients. Gain confidence for your rotations.
            </p>
          </div>
          <div className="audience-card">
            <div className="audience-avatar">🩺</div>
            <h3 className="audience-title">Clinicians</h3>
            <p className="audience-desc">
              Stay sharp. Continuous education and specialized case exposure.
            </p>
          </div>
        </div>
      </section>

      {/* Values / Benefits */}
      <section className="values-section">
        <div className="values-grid">
          <div className="value-item">
            <div className="value-icon">
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h3 className="value-title">Psychological Safety</h3>
            <p className="value-desc">
              Make mistakes here, not in the clinic. Our platform rewards curiosity and
              correction, removing the fear of failure from the learning process.
            </p>
          </div>
          <div className="value-item">
            <div className="value-icon">
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
            </div>
            <h3 className="value-title">Structured Reasoning</h3>
            <p className="value-desc">
              We don't just test answers; we train your thought process. Learn the
              "why" behind every clinical decision.
            </p>
          </div>
          <div className="value-item">
            <div className="value-icon">
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
            </div>
            <h3 className="value-title">Measurable Growth</h3>
            <p className="value-desc">
              Track your competency over time. Identify your weak spots and turn them
              into strengths with targeted practice.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2 className="cta-title">Ready to Transform Your Learning?</h2>
          <p className="cta-subtitle">
            Join thousands of students building their clinical confidence today.
          </p>
          <Link to="/cases">
            <button className="btn-cta-large">Start Your First Case</button>
          </Link>
        </div>
      </section>

      {/* Footer */}
            <Footer
              logo={<Activity className="h-8 w-8 text-teal-600" />}
              brandName="PhysioCaseLab"
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

export default AboutPage
