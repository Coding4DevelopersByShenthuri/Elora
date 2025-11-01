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
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 text-black dark:text-white">
        {/* 1️⃣ Logo & Socials */}
        <div>
          <Link to="/" className="flex items-center gap-2 sm:gap-3 mb-4 group">
            <img
              src="/logo01.png"
              alt="Elora Logo"
              className="h-12 sm:h-16 md:h-20 w-auto transition-transform duration-300 group-hover:scale-110"
            />
            <p className="text-xs sm:text-sm hidden sm:block">
              Spoken English Platform
            </p>
          </Link>

          <p className="text-xs sm:text-sm mb-4 leading-relaxed">
            Transform your English speaking skills with our AI-powered
            platform. Designed for all ages.
          </p>

          <div className="flex items-center gap-2 sm:gap-3">
            {[Facebook, Instagram, Twitter, Youtube].map((Icon, idx) => (
              <a
                key={idx}
                href="#"
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 border border-gray-300 dark:border-white/30 hover:bg-gradient-to-r hover:from-primary hover:to-accent text-black dark:text-white"
              >
                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </a>
            ))}
          </div>
        </div>

        {/* 2️⃣ Learning Paths */}
        <div>
          <h3 className="font-semibold text-sm sm:text-base mb-3 sm:mb-4 text-black dark:text-white">Learning Paths</h3>
          <ul className="space-y-2 text-xs sm:text-sm">
            <li><Link to="/kids" className="hover:text-primary transition">Kids Learning</Link></li>
            <li><Link to="/adults" className="hover:text-primary transition">Adults Program</Link></li>
            <li><Link to="/ielts-pte" className="hover:text-primary transition">IELTS / PTE Prep</Link></li>
          </ul>
        </div>

        {/* 3️⃣ Quick Links */}
        <div>
          <h3 className="font-semibold text-sm sm:text-base mb-3 sm:mb-4 text-black dark:text-white">Quick Links</h3>
          <ul className="space-y-2 text-xs sm:text-sm">
            <li><Link to="/" className="hover:text-primary transition">Home</Link></li>
            <li><Link to="/why" className="hover:text-primary transition">Why Elora</Link></li>
            <li><Link to="/how" className="hover:text-primary transition">How It Works</Link></li>
            <li><Link to="/about" className="hover:text-primary transition">About Us</Link></li>
            <li><Link to="/help" className="hover:text-primary transition">Help Center</Link></li>
            <li><Link to="/contact" className="hover:text-primary transition">Contact Us</Link></li>
          </ul>
        </div>

        {/* 4️⃣ Contact & Newsletter */}
        <div>
          <h3 className="font-semibold text-sm sm:text-base mb-3 sm:mb-4 flex items-center gap-2 text-black dark:text-white">
            <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" /> Contact
          </h3>
          <div className="space-y-2 mb-4 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
              <span>elora.toinfo@gmail.com</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
              <span>+94 75 036 3903</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
              <span>Jaffna, Sri Lanka</span>
            </div>
          </div>

          {/* Stay Updated - Newsletter */}
          <h4 className="font-semibold text-xs sm:text-sm mb-2 text-black dark:text-white">Stay updated</h4>
          <p className="text-xs mb-3 text-gray-700 dark:text-gray-300">
            Get the latest updates on new features and AI capabilities.
          </p>
          <div className="rounded-lg p-2 border border-gray-300 dark:border-white/30 flex gap-2 lg:gap-1 bg-white/50 dark:bg-transparent max-w-sm lg:max-w-xs">
            <input
              type="email"
              placeholder="Enter your email"
              aria-label="Email address"
              className="flex-1 bg-transparent border border-gray-300 dark:border-white/20 rounded-md px-2 py-1.5 lg:py-1 text-xs sm:text-sm lg:text-xs placeholder-gray-400 dark:placeholder-white/50 text-black dark:text-white focus:outline-none focus:border-primary"
            />
            <button className="bg-gradient-to-r from-primary to-accent px-3 lg:px-2.5 py-1.5 lg:py-1 rounded-md text-xs lg:text-[11px] font-medium transition-all duration-300 flex items-center gap-1 text-white">
              <span>Subscribe</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="w-full border-t border-gray-200 dark:border-white/20 py-3 text-xs text-black dark:text-white">
        {/* Mobile Layout */}
        <div className="flex flex-col lg:hidden items-center gap-2 text-center">
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <p>© {new Date().getFullYear()} Elora. All rights reserved.</p>
            <div className="flex items-center gap-3 flex-wrap justify-center">
              <Link to="/privacy" className="hover:text-primary transition">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-primary transition">Terms</Link>
              <Link to="/cookies" className="hover:text-primary transition">Cookies</Link>
            </div>
          </div>
          <div className="flex items-center gap-1 justify-center">
            <span>Crafted with</span>
            <span className="text-red-500 dark:text-red-400">♡</span>
            <span>by Shenthuri Maran</span>
          </div>
        </div>
        
        {/* Desktop Layout */}
        <div className="hidden lg:grid lg:grid-cols-3 items-center gap-4 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Left: Privacy Links */}
          <div className="flex items-center gap-3 justify-start">
            <Link to="/privacy" className="hover:text-primary transition">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-primary transition">Terms</Link>
            <Link to="/cookies" className="hover:text-primary transition">Cookies</Link>
          </div>
          
          {/* Center: Copyright */}
          <div className="flex justify-center">
            <p>© {new Date().getFullYear()} Elora. All rights reserved.</p>
          </div>
          
          {/* Right: Crafted by */}
          <div className="flex items-center gap-1 justify-end">
            <span>Crafted with</span>
            <span className="text-red-500 dark:text-red-400">♡</span>
            <span>by Shenthuri Maran</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
