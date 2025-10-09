import { Link } from "react-router-dom";
import {
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="w-full relative overflow-hidden mt-auto backdrop-blur-lg bg-white/10 dark:bg-gray-900/20 border-t border-white/20 dark:border-gray-700/30">
      {/* Top Gradient Line */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent dark:from-primary dark:to-accent"></div>

      {/* Glowing Orbs */}
      <div className="absolute top-6 right-8 w-20 h-20 rounded-full blur-2xl bg-floating-icon-primary/50 dark:bg-floating-icon-primary/50"></div>
      <div className="absolute bottom-6 left-8 w-16 h-16 rounded-full blur-xl bg-floating-icon-secondary/40 dark:bg-floating-icon-secondary/40"></div>

      {/* Footer Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-white/80">
        {/* 1️⃣ Logo & Socials */}
        <div>
          <Link to="/" className="flex items-center gap-3 mb-4 group">
            <img
              src="/logo01.png"
              alt="Speak Bee Logo"
              className="h-16 sm:h-20 md:h-24 lg:h-28 w-auto transition-transform duration-300 group-hover:scale-110"
            />
            <p className="text-sm hidden sm:block">
              Spoken English Platform
            </p>
          </Link>

          <p className="text-sm mb-4 leading-relaxed">
            Transform your English speaking skills with our AI-powered
            platform. Designed for all ages.
          </p>

          <div className="flex items-center gap-3">
            {[Facebook, Instagram, Twitter, Youtube].map((Icon, idx) => (
              <a
                key={idx}
                href="#"
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 border border-white/30 hover:bg-gradient-to-r hover:from-primary hover:to-accent"
              >
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>

        {/* 2️⃣ Learning Paths */}
        <div>
          <h3 className="font-semibold text-base mb-4">Learning Paths</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/kids" className="hover:text-primary transition">Kids Learning</Link></li>
            <li><Link to="/adults" className="hover:text-primary transition">Adults Program</Link></li>
            <li><Link to="/ielts-pte" className="hover:text-primary transition">IELTS / PTE Prep</Link></li>
          </ul>
        </div>

        {/* 3️⃣ Quick Links */}
        <div>
          <h3 className="font-semibold text-base mb-4">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:text-primary transition">Home</Link></li>
            <li><Link to="/why" className="hover:text-primary transition">Why Speak Bee</Link></li>
            <li><Link to="/how" className="hover:text-primary transition">How It Works</Link></li>
            <li><Link to="/help" className="hover:text-primary transition">Help Center</Link></li>
            <li><Link to="/contact" className="hover:text-primary transition">Contact Us</Link></li>
          </ul>
        </div>

        {/* 4️⃣ Contact & Newsletter */}
        <div>
          <h3 className="font-semibold text-base mb-4 flex items-center gap-2">
            <Mail className="w-4 h-4 text-accent-foreground" /> Contact
          </h3>
          <div className="space-y-2 mb-4 text-sm">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-accent-foreground" />
              <span>speakbee.ai@gmail.com</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-accent-foreground" />
              <span>+94 74 389 9907</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-accent-foreground" />
              <span>Jaffna, Sri Lanka</span>
            </div>
          </div>

          <div className="rounded-lg p-3 border border-white/30 flex gap-2">
            <input
              type="email"
              placeholder="Email"
              className="flex-1 bg-transparent border border-white/20 rounded-md px-2 py-1.5 text-sm placeholder-white/50 focus:outline-none focus:border-primary"
            />
            <button className="bg-gradient-to-r from-primary to-accent px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-300 flex items-center gap-1">
              <span>Go</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="w-full border-t border-white/20 py-3 text-xs text-white/70 flex flex-col lg:flex-row justify-between items-center gap-2 text-center lg:text-left">
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <p>© {new Date().getFullYear()} Speak Bee. All rights reserved.</p>
          <div className="flex items-center gap-3 flex-wrap justify-center">
            <Link to="/privacy" className="hover:text-white transition">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white transition">Terms</Link>
            <Link to="/cookies" className="hover:text-white transition">Cookies</Link>
          </div>
        </div>
        <div className="flex items-center gap-1 justify-center">
          <span>Crafted with</span>
          <span className="text-white">♡</span>
          <span>by Shenthuri Maran</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
