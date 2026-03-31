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
const LOGO_URL = "https://res.cloudinary.com/dhicz31vg/image/upload/v1770665363/WhatsApp_Image_2026-02-07_at_12.41.01_AM-removebg-preview_cwfaaa.png";

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

export default Footer;
