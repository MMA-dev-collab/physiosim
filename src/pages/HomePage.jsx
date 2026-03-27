import { motion } from "framer-motion";
import { Link } from 'react-router-dom';
import { 
  Play, 
  ArrowRight, 
  Activity, 
  Users, 
  CreditCard, 
  CheckCircle2, 
  Linkedin, 
  Facebook, 
  Instagram 
} from "lucide-react";

// Use the existing logo URL
const LOGO_URL = "https://res.cloudinary.com/dhicz31vg/image/upload/v1770665363/WhatsApp_Image_2026-02-07_at_12.41.01_AM-removebg-preview_cwfaaa.png";

const Hero = () => (
  <section className="relative overflow-hidden bg-white">
    <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 items-center min-h-[600px]">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="z-10 py-12 md:py-0"
      >
        <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 leading-tight mb-6">
          Enhance your clinical skills through interactive simulation cases
        </h1>
        <p className="text-lg text-slate-600 mb-10 max-w-md leading-relaxed">
          Join our platform to engage with realistic, locally relevant scenarios.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link to="/cases" className="px-6 py-3 border-2 border-slate-200 text-slate-700 rounded-md font-semibold hover:bg-slate-50 transition-colors">
            See Case Library
          </Link>
          <Link to="/cases" className="px-6 py-3 bg-primary text-white rounded-md font-semibold flex items-center gap-2 hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20">
            <div className="bg-white/20 p-1 rounded-full">
              <Play size={16} fill="currentColor" />
            </div>
            Start Free Case
          </Link>
        </div>
      </motion.div>
      
      <div className="relative h-full min-h-[400px] md:min-h-0">
        <motion.div 
          initial={{ opacity: 0, scale: 1.1 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0 md:-right-20 md:-top-20 md:-bottom-20"
        >
          <div 
            className="w-full h-full bg-cover bg-center"
            style={{ 
              backgroundImage: 'url("/hero_therapy.png")',
              clipPath: 'polygon(15% 0, 100% 0, 100% 100%, 0% 100%)'
            }}
            aria-label="Physiotherapist working with patient"
          />
        </motion.div>
      </div>
    </div>
  </section>
);

const Features = () => (
  <section className="py-24 bg-slate-50/50">
    <div className="max-w-7xl mx-auto px-6">
      <h2 className="text-3xl md:text-4xl font-black text-center text-slate-900 mb-16 tracking-tight uppercase">
        ONE PLATFORM DIFFERENT CASES
      </h2>
      
      <div className="grid md:grid-cols-3 gap-8">
        {/* Simulation Card */}
        <motion.div 
          whileHover={{ y: -5 }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-start"
        >
          <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600 mb-6">
            <Activity size={24} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-4">Simulation</h3>
          <p className="text-slate-500 mb-8 leading-relaxed">
            Simulations that prepare you for real patients
          </p>
          <Link to="/cases" className="mt-auto flex items-center gap-2 text-primary font-bold text-sm hover:gap-3 transition-all">
            Start simulation <ArrowRight size={16} />
          </Link>
        </motion.div>

        {/* Mentorship Card */}
        <motion.div 
          whileHover={{ y: -5 }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-start"
        >
          <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-primary mb-6">
            <Users size={24} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-4">Mentorship</h3>
          <p className="text-slate-500 mb-8 leading-relaxed">
            Get personalized guidance from expert Physiotherapist
          </p>
          <Link to="/about" className="mt-auto bg-primary text-white px-6 py-2 rounded-md font-bold text-sm flex items-center gap-2 hover:bg-primary-hover transition-colors">
            Explore <ArrowRight size={16} />
          </Link>
        </motion.div>

        {/* Affordable Card */}
        <motion.div 
          whileHover={{ y: -5 }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-start"
        >
          <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center text-red-400 mb-6">
            <CreditCard size={24} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-4">Affordable</h3>
          <p className="text-slate-500 mb-8 leading-relaxed">
            Train smarter, spend less
          </p>
          <Link to="/membership" className="mt-auto flex items-center gap-2 text-primary font-bold text-sm hover:gap-3 transition-all">
            Pricing <ArrowRight size={16} />
          </Link>
        </motion.div>
      </div>
    </div>
  </section>
);

const HowItWorks = () => (
  <section className="py-24 bg-white overflow-hidden">
    <div className="max-w-7xl mx-auto px-6">
      {/* Step 1 */}
      <div className="grid md:grid-cols-2 gap-16 items-center mb-32">
        <div className="relative">
          <div className="flex items-start gap-6">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-2 border-blue-200 flex items-center justify-center text-2xl font-bold text-slate-800 bg-white z-10 relative">
                1
              </div>
              <div className="absolute top-16 left-1/2 -translate-x-1/2 w-0.5 h-32 border-l-2 border-dashed border-blue-200 hidden md:block" />
            </div>
            <div>
              <h3 className="text-3xl font-bold text-slate-800 mb-4">Browse Cases</h3>
              <p className="text-lg text-slate-500 max-w-sm">
                Access a wide range of realistic clinical scenarios
              </p>
            </div>
          </div>
        </div>
        <div className="relative flex justify-center">
          <div className="w-full max-w-md aspect-square bg-slate-50 rounded-full flex items-center justify-center relative overflow-hidden">
             <img 
               src="/browse_cases.png" 
               alt="Browse Cases" 
               className="w-3/4 h-3/4 object-contain z-10"
             />
             {/* Decorative elements */}
             <div className="absolute top-10 right-10 w-12 h-12 bg-yellow-400/20 rounded-full blur-xl" />
             <div className="absolute bottom-10 left-10 w-20 h-20 bg-blue-400/10 rounded-full blur-2xl" />
          </div>
        </div>
      </div>

      {/* Step 2 */}
      <div className="grid md:grid-cols-2 gap-16 items-center mb-32">
        <div className="relative flex justify-center order-2 md:order-1">
          <div className="w-full max-w-md aspect-square bg-slate-50 rounded-full flex items-center justify-center relative overflow-hidden">
             <img 
               src="/practice_skills.png" 
               alt="Practice Skills" 
               className="w-3/4 h-3/4 object-contain z-10"
             />
          </div>
        </div>
        <div className="relative order-1 md:order-2">
          <div className="flex items-start gap-6 md:flex-row-reverse md:text-right">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-2 border-blue-200 flex items-center justify-center text-2xl font-bold text-slate-800 bg-white z-10 relative">
                2
              </div>
              <div className="absolute top-16 left-1/2 -translate-x-1/2 w-0.5 h-32 border-l-2 border-dashed border-blue-200 hidden md:block" />
            </div>
            <div>
              <h3 className="text-3xl font-bold text-slate-800 mb-4">Practice Skills</h3>
              <p className="text-lg text-slate-500 max-w-sm ml-auto">
                Apply knowledge in simulations and build confidence
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Step 3 */}
      <div className="grid md:grid-cols-2 gap-16 items-center">
        <div className="relative">
          <div className="flex items-start gap-6">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-2 border-blue-200 flex items-center justify-center text-2xl font-bold text-slate-800 bg-white z-10 relative">
                3
              </div>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-slate-800 mb-4">Get Feedback</h3>
              <p className="text-lg text-slate-500 max-w-sm">
                Receive personalized guidance from expert mentors to improve
              </p>
            </div>
          </div>
        </div>
        <div className="relative flex justify-center">
          <div className="w-full max-w-md aspect-square bg-slate-50 rounded-full flex items-center justify-center relative overflow-hidden">
             <img 
               src="/get_feedback.png" 
               alt="Get Feedback" 
               className="w-3/4 h-3/4 object-contain z-10"
             />
          </div>
        </div>
      </div>
    </div>
  </section>
);

const CTASection = () => (
  <section className="py-24 bg-white">
    <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
      <div>
        <h2 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight mb-8">
          “ Join 1,000+ students building real clinical confidence with <span className="text-primary">PhysioSim</span> ”
        </h2>
        <ul className="space-y-4 mb-10">
          {[
            "Free trial with basic cases",
            "Personalized mentorship options",
            "Full access for simulation features"
          ].map((item, i) => (
            <li key={i} className="flex items-center gap-3 text-slate-600 font-medium">
              <div className="bg-green-100 text-green-600 p-1 rounded-full">
                <CheckCircle2 size={18} />
              </div>
              {item}
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-4">
          <Link to="/about" className="px-6 py-3 border border-slate-200 text-slate-700 rounded-md font-semibold hover:bg-slate-50 transition-colors">
            Learn more
          </Link>
          <Link to="/cases" className="px-6 py-3 bg-primary text-white rounded-md font-semibold flex items-center gap-2 hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20">
            <div className="bg-white/20 p-1 rounded-full">
              <Play size={16} fill="currentColor" />
            </div>
            Start Free trial
          </Link>
        </div>
      </div>
      <div className="relative rounded-3xl overflow-hidden shadow-2xl">
        <img 
          src="/student_practice.png" 
          alt="PhysioSim in action" 
          className="w-full h-full object-cover min-h-[400px]"
        />
      </div>
    </div>
  </section>
);

const Footer = () => (
  <footer className="bg-white border-t border-slate-100 pt-16 pb-8">
    <div className="max-w-7xl mx-auto px-6">
      {/* Top Section: Logo and Description */}
      <div className="flex flex-col items-start mb-12">
        <div className="flex items-center gap-2 mb-4">
          <img src={LOGO_URL} alt="PhysioSim" className="h-32 w-auto drop-shadow-sm" />
        </div>
        <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
          Design amazing digital experiences that create more happy in the world.
        </p>
      </div>

      {/* Middle Section: Centered Links */}
      <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm font-semibold text-slate-600 mb-12">
        <Link to="/membership" className="hover:text-primary transition-colors">Membership</Link>
        <Link to="/cases" className="hover:text-primary transition-colors">Cases</Link>
        <Link to="/membership" className="hover:text-primary transition-colors">Pricing</Link>
        <Link to="/about" className="hover:text-primary transition-colors">About Us</Link>
        <a href="#" className="hover:text-primary transition-colors">Privacy</a>
      </div>
      
      {/* Bottom Section: Divider, Copyright, and Socials */}
      <div className="pt-8 border-t border-slate-100 flex flex-col items-center gap-6">
        <div className="flex items-center gap-8 text-slate-400">
          <a href="#" className="hover:text-primary transition-all transform hover:scale-110"><Linkedin size={22} /></a>
          <a href="#" className="hover:text-primary transition-all transform hover:scale-110"><Facebook size={22} /></a>
          <a href="#" className="hover:text-primary transition-all transform hover:scale-110"><Instagram size={22} /></a>
        </div>
        <p className="text-sm text-slate-400">
          © {new Date().getFullYear()} PhysioSim. All rights reserved.
        </p>
      </div>
    </div>
  </footer>
);

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col selection:bg-primary/30">
      <main className="flex-grow">
        <Hero />
        <Features />
        <HowItWorks />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
