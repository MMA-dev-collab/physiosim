import React, { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  ChevronRight,
  Monitor,
  Users,
  Wallet,
  CheckCircle,
  ArrowRight,
  Linkedin,
  Facebook,
  Instagram,
  Activity
} from 'lucide-react'
import { Footer } from '../components/ui/footer'
import './HomePage.css'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

function HomePage() {
  const heroRef = useRef(null)
  const featuresRef = useRef(null)
  const processRef = useRef(null)
  const testimonialRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero Animation
      const heroTl = gsap.timeline()
      heroTl.from(".hp-hero-title", {
        y: 60,
        opacity: 0,
        duration: 1,
        ease: "power4.out"
      })
      .from(".hp-hero-subtitle", {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out"
      }, "-=0.6")
      .from(".hp-hero-actions", {
        y: 20,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out"
      }, "-=0.4")
      .from(".hp-hero-visual", {
        x: 100,
        opacity: 0,
        duration: 1.2,
        ease: "power4.out"
      }, "-=1")

      // Features Animation
      gsap.from(".hp-feature-card", {
        scrollTrigger: {
          trigger: ".hp-features",
          start: "top 90%",
          toggleActions: "play none none none"
        },
        y: 50,
        autoAlpha: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: "power3.out",
        clearProps: "all"
      })

      // Process Steps Animation
      const steps = gsap.utils.toArray(".hp-process-step")
      steps.forEach((step) => {
        gsap.from(step, {
          scrollTrigger: {
            trigger: step,
            start: "top 90%",
            toggleActions: "play none none none"
          },
          y: 60,
          autoAlpha: 0,
          duration: 1,
          ease: "power3.out",
          clearProps: "all"
        })
      })

      // Testimonial CTA Animation
      gsap.from(".hp-cta-content", {
        scrollTrigger: {
          trigger: ".hp-testimonial-cta",
          start: "top 80%",
        },
        x: -50,
        opacity: 0,
        duration: 1,
        ease: "power3.out"
      })
      gsap.from(".hp-cta-visual", {
        scrollTrigger: {
          trigger: ".hp-testimonial-cta",
          start: "top 80%",
        },
        x: 50,
        opacity: 0,
        duration: 1,
        ease: "power3.out"
      })
    })

    return () => ctx.revert()
  }, [])

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hp-hero" ref={heroRef}>
        <div className="hp-container">
          <div className="hp-hero-content">
            <h1 className="hp-hero-title">
              Enhance your clinical skills through interactive simulation cases
            </h1>
            <p className="hp-hero-subtitle">
              Join our platform to engage with realistic, locally relevant scenarios.
            </p>
            <div className="hp-hero-actions">
              <Link to="/cases" className="hp-btn-outline">
                See Case Library
              </Link>
              <Link to="/register" className="hp-btn-primary">
                Start Free Case
              </Link>
            </div>
          </div>

          <div className="hp-hero-visual">
            <div className="hp-hero-img-container">
              <img
                src="/hero_therapy.png"
                alt="Physical Therapy Simulation"
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="hp-features" ref={featuresRef}>
        <div className="hp-container">
          <h2 className="hp-features-title">ONE PLATFORM DIFFERENT CASES</h2>
          <div className="hp-features-grid">
            <FeatureCard
              icon={<Monitor size={24} className="text-blue-600" />}
              iconBg="#eff6ff"
              title="Simulation"
              desc="Simulations that prepare you for real patients."
              linkText="Start simulation"
              linkTo="/cases"
            />
            <FeatureCard
              icon={<Users size={24} className="text-indigo-600" />}
              iconBg="#eef2ff"
              title="Mentorship"
              desc="Get personalized guidance from expert Physiotherapist."
              linkText="Explore"
              linkTo="/about"
              isPrimary
            />
            <FeatureCard
              icon={<Wallet size={24} className="text-pink-600" />}
              iconBg="#fdf2f8"
              title="Affordable"
              desc="Train smarter, spend less."
              linkText="Pricing"
              linkTo="/membership"
            />
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="hp-process" ref={processRef}>
        <div className="hp-container">
          {/* Step 1 */}
          <div className="hp-process-step">
            <div className="hp-step-info">
              <div className="hp-step-number">1</div>
              <h3 className="hp-step-title">Browse Cases</h3>
              <p className="hp-step-desc">
                Access a wide range of realistic clinical scenarios
              </p>
            </div>
            <div className="hp-step-visual">
              <img src="/browse_cases.png" alt="Browse Cases" />
            </div>
          </div>

          {/* Step 2 */}
          <div className="hp-process-step">
            <div className="hp-step-visual">
              <img src="/practice_skills.png" alt="Practice Skills" />
            </div>
            <div className="hp-step-info">
              <div className="hp-step-number">2</div>
              <h3 className="hp-step-title">Practice Skills</h3>
              <p className="hp-step-desc">
                Apply knowledge in simulations and build confidence
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="hp-process-step">
            <div className="hp-step-info">
              <div className="hp-step-number">3</div>
              <h3 className="hp-step-title">Get Feedback</h3>
              <p className="hp-step-desc">
                Receive personalized guidance from expert mentors to improve
              </p>
            </div>
            <div className="hp-step-visual">
              <img src="/get_feedback.png" alt="Get Feedback" />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial / CTA Section */}
      <section className="hp-testimonial-cta" ref={testimonialRef}>
        <div className="hp-container">
          <div className="hp-cta-content">
            <h2 className="hp-cta-quote">
              “ Join 1,000+ students building real clinical confidence with <br />
              <span>PhysioSim</span> ”
            </h2>
            <ul className="hp-cta-bullets">
              <li><CheckCircle size={20} /> Free trial with basic cases</li>
              <li><CheckCircle size={20} /> Personalized mentorship options</li>
              <li><CheckCircle size={20} /> Full access for simulation features</li>
            </ul>
            <div className="hp-cta-actions">
              <Link to="/about" className="hp-btn-outline">
                Learn more
              </Link>
              <Link to="/register" className="hp-btn-primary">
                Start Free Trial
              </Link>
            </div>
          </div>
          <div className="hp-cta-visual">
            <div className="hp-hero-img-container">
              <img src="/student_practice.png" alt="Professional Practice" className="w-full h-auto" />
            </div>
          </div>
        </div>
      </section>

      <Footer
        logo={
          <img 
            src="https://res.cloudinary.com/dhicz31vg/image/upload/v1770665363/WhatsApp_Image_2026-02-07_at_12.41.01_AM-removebg-preview_cwfaaa.png" 
            alt="PhysioSim" 
            className="h-10 w-auto"
          />
        }
        brandName="PhysioSim"
        description="Design amazing digital experiences that create more happy in the world."
        socialLinks={[
          {
            icon: <Linkedin className="h-5 w-5" />,
            href: "#",
            label: "LinkedIn",
          },
          {
            icon: <Facebook className="h-5 w-5" />,
            href: "#",
            label: "Facebook",
          },
          {
            icon: <Instagram className="h-5 w-5" />,
            href: "#",
            label: "Instagram",
          },
        ]}
        mainLinks={[
          { href: "/membership", label: "Membership" },
          { href: "/cases", label: "Cases" },
          { href: "/pricing", label: "Pricing" },
          { href: "/about", label: "About Us" },
        ]}
        legalLinks={[
          { href: "/privacy", label: "Privacy" },
          { href: "/terms", label: "Terms of Service" },
        ]}
        copyright={{
          text: `© 2077 PhysioSim All rights reserved.`,
        }}
      />
    </div>
  )
}

function FeatureCard({ icon, iconBg, title, desc, linkText, linkTo, isPrimary }) {
  return (
    <div className="hp-feature-card">
      <div 
        className="hp-feature-icon-box" 
        style={{ backgroundColor: iconBg }}
      >
        {icon}
      </div>
      <h3 className="hp-feature-title-card">{title}</h3>
      <p className="hp-feature-desc">{desc}</p>
      <Link 
        to={linkTo} 
        className={`hp-feature-link ${isPrimary ? 'hp-btn-primary text-white px-4 py-2 rounded-lg' : ''}`}
        style={isPrimary ? { display: 'inline-flex', width: 'fit-content' } : {}}
      >
        {linkText} <ArrowRight size={16} />
      </Link>
    </div>
  )
}

export default HomePage
