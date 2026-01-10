import React from 'react'
import { Link } from 'react-router-dom'

function HomePage() {
  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="page-eyebrow">Physical Therapy Case Simulator</div>
          <h1 className="hero-title">
            Master Clinical Reasoning Through Interactive Case Simulations
          </h1>
          <p className="hero-subtitle">
            Transform your physiotherapy education with step-by-step interactive cases. 
            Practice real-world patient scenarios, make clinical decisions, and receive 
            instant feedback—all before you step into the clinic.
          </p>
          <div className="hero-cta">
            <Link to="/cases">
              <button className="btn-primary btn-large">Start Your First Case</button>
            </Link>
            <Link to="/about">
              <button className="btn-secondary btn-large">Learn More</button>
            </Link>
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <div className="hero-stat-value">50+</div>
              <div className="hero-stat-label">Interactive Cases</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-value">4-6</div>
              <div className="hero-stat-label">Steps Per Case</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-value">100%</div>
              <div className="hero-stat-label">Instant Feedback</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="section-header">
          <div className="page-eyebrow">Why Choose PhysioCaseLab</div>
          <h2 className="section-title">Everything you need to excel in clinical practice</h2>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📋</div>
            <h3 className="feature-title">Real Patient Scenarios</h3>
            <p className="feature-description">
              Work through authentic cases based on real MSK and sports clinic encounters. 
              Each case includes bilingual chief complaints (Arabic/English) to prepare 
              you for diverse patient populations.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3 className="feature-title">Step-by-Step Learning</h3>
            <p className="feature-description">
              Progress through structured steps: patient history, focused questioning, 
              physical examination, investigations, and diagnosis. Learn at your own pace 
              with clear guidance at every stage.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💡</div>
            <h3 className="feature-title">Instant Feedback</h3>
            <p className="feature-description">
              Get immediate explanations when you make mistakes. Understand why an answer 
              is wrong and learn the correct clinical reasoning before moving forward.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3 className="feature-title">Progress Tracking</h3>
            <p className="feature-description">
              Monitor your performance with detailed scoring and statistics. Track completed 
              cases, unlock new scenarios as you progress, and build your clinical confidence.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔬</div>
            <h3 className="feature-title">Physical Tests & Imaging</h3>
            <p className="feature-description">
              Practice interpreting physical examination tests, X-rays, and other investigations. 
              Learn to correlate findings with clinical presentations.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3 className="feature-title">Progressive Difficulty</h3>
            <p className="feature-description">
              Start with beginner cases and unlock advanced scenarios as you master the 
              fundamentals. Cases are designed to build on each other.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section">
        <div className="section-header">
          <div className="page-eyebrow">How It Works</div>
          <h2 className="section-title">From patient story to diagnosis in 4 simple steps</h2>
        </div>
        <div className="steps-container">
          <div className="step-item">
            <div className="step-number">1</div>
            <div className="step-content">
              <h3 className="step-title">Patient Information</h3>
              <p className="step-description">
                Review the patient's demographics, chief complaint, and brief history. 
                See real-world presentations including bilingual complaints.
              </p>
            </div>
          </div>
          <div className="step-item">
            <div className="step-number">2</div>
            <div className="step-content">
              <h3 className="step-title">History Taking</h3>
              <p className="step-description">
                Choose the right questions to ask. Learn which questions are most relevant 
                and why, with feedback on your choices.
              </p>
            </div>
          </div>
          <div className="step-item">
            <div className="step-number">3</div>
            <div className="step-content">
              <h3 className="step-title">Physical Examination</h3>
              <p className="step-description">
                Select appropriate tests, review test descriptions and results, watch 
                demonstration videos, and interpret X-ray findings.
              </p>
            </div>
          </div>
          <div className="step-item">
            <div className="step-number">4</div>
            <div className="step-content">
              <h3 className="step-title">Diagnosis & Feedback</h3>
              <p className="step-description">
                Make your final diagnosis. Receive comprehensive feedback, see your score, 
                and unlock the next case in your learning journey.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Case Types Section */}
      <section className="case-types-section">
        <div className="section-header">
          <div className="page-eyebrow">Case Library</div>
          <h2 className="section-title">Practice with diverse knee conditions</h2>
        </div>
        <div className="case-types-grid">
          <div className="case-type-card">
            <h3 className="case-type-title">Patellofemoral Pain</h3>
            <p className="case-type-description">
              Learn to assess and diagnose anterior knee pain, including patellofemoral 
              syndrome and related conditions.
            </p>
          </div>
          <div className="case-type-card">
            <h3 className="case-type-title">Ligament Injuries</h3>
            <p className="case-type-description">
              Master the assessment of ACL, PCL, MCL, and LCL injuries through 
              comprehensive test batteries.
            </p>
          </div>
          <div className="case-type-card">
            <h3 className="case-type-title">Meniscal Pathology</h3>
            <p className="case-type-description">
              Practice diagnosing meniscal tears and degeneration using clinical 
              tests and imaging interpretation.
            </p>
          </div>
          <div className="case-type-card">
            <h3 className="case-type-title">Chronic Knee Pain</h3>
            <p className="case-type-description">
              Develop skills in managing long-term conditions, including osteoarthritis 
              and chronic inflammatory conditions.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-card">
          <h2 className="cta-title">Ready to enhance your clinical skills?</h2>
          <p className="cta-description">
            Join physiotherapy students who are building confidence through interactive 
            case practice. Start with a free case today.
          </p>
          <div className="cta-buttons">
            <Link to="/cases">
              <button className="btn-primary btn-large">Get Started Free</button>
            </Link>
            <Link to="/membership">
              <button className="btn-secondary btn-large">View Plans</button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage

