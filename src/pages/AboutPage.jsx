import React from 'react'
import { Link } from 'react-router-dom'

function AboutPage() {
  return (
    <div className="page">
      <div className="page-header">
        <div className="page-eyebrow">About</div>
        <h1 className="page-title">Built by and for physiotherapy learners</h1>
        <p className="page-subtitle">
          PhysioCaseLab is a comprehensive learning platform designed specifically for 
          physiotherapy students. We focus on MSK and knee cases, helping you practice 
          structured clinical reasoning in both Arabic and English before you meet real patients.
        </p>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="section-title">How it works</div>
          <p className="section-description">
            Each case is designed as a mini simulation: you read the patient story, choose 
            the right questions to ask, pick appropriate physical tests, interpret X‑rays 
            and investigations, and finally decide on a diagnosis. Wrong answers show you 
            clear explanations and allow you to repeat the step, mimicking the feedback 
            you would get from a clinical tutor.
          </p>
          <div style={{ marginTop: '1.5rem' }}>
            <div className="stat-row">
              <div className="stat">
                <div className="stat-label">Step-by-step</div>
                <div className="stat-value">4–6 steps per case</div>
              </div>
              <div className="stat">
                <div className="stat-label">Feedback</div>
                <div className="stat-value">Instant explanations</div>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="section-title">What you'll practice</div>
          <ul style={{ marginTop: '0.5rem', paddingLeft: '1.2rem', fontSize: '0.9rem', color: '#4b5563', lineHeight: '1.8' }}>
            <li>Patient history taking and communication</li>
            <li>Clinical reasoning and decision-making</li>
            <li>Physical examination techniques</li>
            <li>Test interpretation and analysis</li>
            <li>Diagnostic formulation</li>
            <li>Bilingual communication (Arabic/English)</li>
            <li>Evidence-based practice</li>
          </ul>
          <div style={{ marginTop: '1.5rem' }}>
            <div className="tag-row">
              <span className="tag">Real-world scenarios</span>
              <span className="tag">Progressive difficulty</span>
              <span className="tag">Score tracking</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '1.5rem' }}>
        <div className="section-title">Our mission</div>
        <p className="section-description">
          We believe that confident clinical reasoning comes from practice. By providing 
          structured, interactive cases that mirror real patient encounters, we help 
          physiotherapy students build the skills they need before they step into the 
          clinic. Every case is designed with feedback loops that guide learning, not just 
          test knowledge. Our goal is to bridge the gap between classroom learning and 
          clinical practice.
        </p>
      </div>

      <div className="grid-2" style={{ marginTop: '1.5rem' }}>
        <div className="card">
          <div className="section-title">Why PhysioCaseLab?</div>
          <p className="section-description">
            Traditional learning methods often leave students feeling unprepared for 
            real patient encounters. Our platform fills this gap by providing a safe 
            space to practice clinical reasoning, make mistakes, and learn from them 
            without the pressure of a real patient encounter.
          </p>
          <ul style={{ marginTop: '1rem', paddingLeft: '1.2rem', fontSize: '0.9rem', color: '#4b5563', lineHeight: '1.8' }}>
            <li>Practice anytime, anywhere</li>
            <li>Learn from mistakes safely</li>
            <li>Build confidence gradually</li>
            <li>Track your progress</li>
          </ul>
        </div>

        <div className="card">
          <div className="section-title">Who we serve</div>
          <p className="section-description">
            PhysioCaseLab is designed for physiotherapy students at all levels, from 
            first-year students learning the basics to final-year students preparing 
            for clinical rotations. Our cases are also valuable for practicing clinicians 
            looking to refresh their skills.
          </p>
          <div style={{ marginTop: '1rem' }}>
            <div className="tag-row">
              <span className="tag">Undergraduate students</span>
              <span className="tag">Graduate students</span>
              <span className="tag">Clinical interns</span>
              <span className="tag">Practicing clinicians</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '1.5rem', background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', borderColor: '#3b82f6' }}>
        <div className="section-title">Get started today</div>
        <p className="section-description">
          Ready to enhance your clinical reasoning skills? Start with a free case and 
          experience the difference interactive learning can make. Join hundreds of 
          physiotherapy students who are already building their confidence through 
          practice.
        </p>
        <div style={{ marginTop: '1.5rem' }}>
          <Link to="/cases">
            <button className="btn-primary">Start Learning Now</button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default AboutPage


