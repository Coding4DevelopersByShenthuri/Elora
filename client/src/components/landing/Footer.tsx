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
      <div className="relative z-10 w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-6 lg:py-12">
        {/* Mobile & Tablet Layout - 2 Column Left/Right */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-8 text-black dark:text-white lg:hidden">
          {/* Left Column */}
          <div className="space-y-2.5 sm:space-y-3 md:space-y-4">
            {/* Logo & Socials */}
            <div>
              <Link to="/" className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-2.5 md:mb-3 group">
                <img
                  src="/logo01.png"
                  alt="Elora Logo"
                  className="h-9 sm:h-10 md:h-12 lg:h-14 w-auto transition-transform duration-300 group-hover:scale-110"
                />
                <p className="text-xs sm:text-sm md:text-sm font-medium hidden sm:block">
                  Spoken English Platform
                </p>
              </Link>
              <p className="text-xs sm:text-sm md:text-sm mb-2 sm:mb-2.5 md:mb-3 leading-tight text-gray-700 dark:text-gray-300">
                Transform your English speaking skills with our AI-powered platform. Designed for all ages.
              </p>
              <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
                {[Facebook, Instagram, Twitter, Youtube].map((Icon, idx) => (
                  <a
                    key={idx}
                    href="#"
                    className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 border-2 border-gray-400 dark:border-white/40 hover:bg-gradient-to-r hover:from-primary hover:to-accent hover:border-primary text-black dark:text-white shadow-sm"
                  >
                    <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-4 md:h-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* Learning Paths */}
            <div>
              <h3 className="font-bold text-xs sm:text-sm md:text-base mb-1.5 sm:mb-2 md:mb-2.5 text-black dark:text-white">Learning Paths</h3>
              <ul className="space-y-1 sm:space-y-1.5 md:space-y-2 text-xs sm:text-sm md:text-sm">
                <li><Link to="/kids" className="hover:text-primary transition break-words font-medium hover:underline">Kids Learning</Link></li>
                <li><Link to="/adults" className="hover:text-primary transition break-words font-medium hover:underline">Adults Program</Link></li>
                <li><Link to="/ielts-pte" className="hover:text-primary transition break-words font-medium hover:underline">IELTS / PTE Prep</Link></li>
              </ul>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-2.5 sm:space-y-3 md:space-y-4">
            {/* Quick Links */}
            <div>
              <h3 className="font-bold text-xs sm:text-sm md:text-base mb-1.5 sm:mb-2 md:mb-2.5 text-black dark:text-white">Quick Links</h3>
              <ul className="space-y-1 sm:space-y-1.5 md:space-y-2 text-xs sm:text-sm md:text-sm">
                <li><Link to="/" className="hover:text-primary transition break-words font-medium hover:underline">Home</Link></li>
                <li><Link to="/why" className="hover:text-primary transition break-words font-medium hover:underline">Why Elora</Link></li>
                <li><Link to="/how" className="hover:text-primary transition break-words font-medium hover:underline">How It Works</Link></li>
                <li><Link to="/about" className="hover:text-primary transition break-words font-medium hover:underline">About Us</Link></li>
                <li><Link to="/help" className="hover:text-primary transition break-words font-medium hover:underline">Help Center</Link></li>
                <li><Link to="/contact" className="hover:text-primary transition break-words font-medium hover:underline">Contact Us</Link></li>
              </ul>
            </div>

            {/* Contact & Newsletter */}
            <div>
              <h3 className="font-bold text-xs sm:text-sm md:text-base mb-1.5 sm:mb-2 md:mb-2.5 flex items-center gap-1.5 sm:gap-2 text-black dark:text-white">
                <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-primary flex-shrink-0" /> 
                <span>Contact</span>
              </h3>
              <div className="space-y-1.5 sm:space-y-2 md:space-y-2.5 mb-2 sm:mb-2.5 md:mb-3 text-xs sm:text-sm md:text-sm">
                <div className="flex items-start gap-1.5 sm:gap-2">
                  <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="break-all leading-tight text-gray-700 dark:text-gray-300">elora.toinfo@gmail.com</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-primary flex-shrink-0" />
                  <span className="break-words text-gray-700 dark:text-gray-300">+94 75 036 3903</span>
                </div>
                <div className="flex items-start gap-1.5 sm:gap-2">
                  <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="break-words leading-tight text-gray-700 dark:text-gray-300">Jaffna, Sri Lanka</span>
                </div>
              </div>

              {/* Stay Updated - Newsletter */}
              <h4 className="font-bold text-xs sm:text-sm md:text-sm mb-1 sm:mb-1.5 md:mb-2 text-black dark:text-white">Stay updated</h4>
              <p className="text-[10px] sm:text-xs md:text-sm mb-1.5 sm:mb-2 md:mb-2.5 text-gray-700 dark:text-gray-300 leading-tight">
                Get the latest updates on new features and AI capabilities.
              </p>
              <div className="rounded-lg p-1.5 sm:p-2 md:p-2.5 border-2 border-gray-400 dark:border-white/40 flex flex-col sm:flex-row gap-1.5 sm:gap-2 bg-white/80 dark:bg-gray-900/40 shadow-sm">
                <input
                  type="email"
                  placeholder="Email"
                  aria-label="Email address"
                  className="flex-1 bg-transparent border-2 border-gray-300 dark:border-white/30 rounded-md px-2 sm:px-3 md:px-3.5 py-1.5 sm:py-2 md:py-2.5 text-xs sm:text-sm md:text-sm placeholder-gray-500 dark:placeholder-white/60 text-black dark:text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 min-w-0"
                />
                <button className="bg-gradient-to-r from-primary to-accent px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 md:py-2.5 rounded-md text-xs sm:text-sm md:text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-1 sm:gap-1.5 text-white whitespace-nowrap hover:shadow-lg hover:scale-105">
                  <span>Subscribe</span>
                  <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Layout - 4 Columns */}
        <div className="hidden lg:grid lg:grid-cols-4 gap-8 text-black dark:text-white">
          {/* 1️⃣ Logo & Socials */}
          <div>
            <Link to="/" className="flex items-center gap-3 mb-4 group">
              <img
                src="/logo01.png"
                alt="Elora Logo"
                className="h-16 md:h-20 w-auto transition-transform duration-300 group-hover:scale-110"
              />
              <p className="text-sm">
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
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 border border-gray-300 dark:border-white/30 hover:bg-gradient-to-r hover:from-primary hover:to-accent text-black dark:text-white"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* 2️⃣ Learning Paths */}
          <div>
            <h3 className="font-semibold text-base mb-4 text-black dark:text-white">Learning Paths</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/kids" className="hover:text-primary transition">Kids Learning</Link></li>
              <li><Link to="/adults" className="hover:text-primary transition">Adults Program</Link></li>
              <li><Link to="/ielts-pte" className="hover:text-primary transition">IELTS / PTE Prep</Link></li>
            </ul>
          </div>

          {/* 3️⃣ Quick Links */}
          <div>
            <h3 className="font-semibold text-base mb-4 text-black dark:text-white">Quick Links</h3>
            <ul className="space-y-2 text-sm">
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
            <h3 className="font-semibold text-base mb-4 flex items-center gap-2 text-black dark:text-white">
              <Mail className="w-4 h-4 text-primary" /> Contact
            </h3>
            <div className="space-y-2 mb-4 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" />
                <span>elora.toinfo@gmail.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary" />
                <span>+94 75 036 3903</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                <span>Jaffna, Sri Lanka</span>
              </div>
            </div>

            {/* Stay Updated - Newsletter */}
            <h4 className="font-semibold text-sm mb-2 text-black dark:text-white">Stay updated</h4>
            <p className="text-xs mb-3 text-gray-700 dark:text-gray-300">
              Get the latest updates on new features and AI capabilities.
            </p>
            <div className="rounded-lg p-2 border border-gray-300 dark:border-white/30 flex gap-1 bg-white/50 dark:bg-transparent max-w-xs">
              <input
                type="email"
                placeholder="Enter your email"
                aria-label="Email address"
                className="flex-1 bg-transparent border border-gray-300 dark:border-white/20 rounded-md px-2 py-1 text-xs placeholder-gray-400 dark:placeholder-white/50 text-black dark:text-white focus:outline-none focus:border-primary"
              />
              <button className="bg-gradient-to-r from-primary to-accent px-2.5 py-1 rounded-md text-[11px] font-medium transition-all duration-300 flex items-center gap-1 text-white">
                <span>Subscribe</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="w-full border-t border-gray-200 dark:border-white/20 py-2.5 sm:py-3 md:py-2.5 lg:py-3 bg-white/5 dark:bg-gray-900/10">
        {/* Mobile & Tablet Layout - Left/Right */}
        <div className="lg:hidden max-w-7xl mx-auto px-3 sm:px-4 md:px-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-2">
            {/* Left: Copyright */}
            <p className="text-xs sm:text-xs md:text-sm leading-relaxed text-black dark:text-white font-medium">
              <span className="inline">© {new Date().getFullYear()} Elora. All rights reserved.</span>
            </p>
            
            {/* Right: Links & Credit */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 md:gap-3">
              <Link to="/privacy-policy" className="hover:text-primary transition text-xs sm:text-xs md:text-sm whitespace-nowrap font-medium text-black dark:text-white hover:underline">Privacy Policy</Link>
              <Link to="/terms-and-conditions" className="hover:text-primary transition text-xs sm:text-xs md:text-sm whitespace-nowrap font-medium text-black dark:text-white hover:underline">Terms</Link>
              <Link to="/cookies-policy" className="hover:text-primary transition text-xs sm:text-xs md:text-sm whitespace-nowrap font-medium text-black dark:text-white hover:underline">Cookies</Link>
              <span className="hidden sm:inline text-xs sm:text-xs md:text-sm text-gray-500 dark:text-gray-400">•</span>
              <div className="flex items-center gap-1 sm:gap-1.5 text-xs sm:text-xs md:text-sm flex-wrap text-black dark:text-white">
                <span>Crafted with</span>
                <span className="text-red-500 dark:text-red-400 text-base">♡</span>
                <span className="whitespace-nowrap font-medium">by Shenthuri Maran</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Desktop Layout */}
        <div className="hidden lg:grid lg:grid-cols-3 items-center gap-4 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Left: Privacy Links */}
          <div className="flex items-center gap-3 justify-start">
            <Link to="/privacy-policy" className="hover:text-primary transition">Privacy Policy</Link>
            <Link to="/terms-and-conditions" className="hover:text-primary transition">Terms</Link>
            <Link to="/cookies-policy" className="hover:text-primary transition">Cookies</Link>
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
